-- Daily office arrival attendance. Existing course attendance is preserved.
create table if not exists public.attendance_policies (
 id uuid primary key default gen_random_uuid(), office_id uuid not null references public.offices(id),
 effective_from date not null, settings jsonb not null, created_by uuid not null,
 created_at timestamptz not null default now()
);
create index if not exists attendance_policy_office_date on public.attendance_policies(office_id,effective_from desc,created_at desc);
create table if not exists public.attendance_days (
 id uuid primary key default gen_random_uuid(), office_id uuid not null references public.offices(id),
 attendance_date date not null, audience text not null check(audience in ('student','staff')),
 policy_snapshot jsonb not null, closes_at timestamptz not null,
 finalized_at timestamptz, finalized_by uuid, created_at timestamptz not null default now(),
 unique(office_id,attendance_date,audience)
);
create table if not exists public.attendance_entries (
 id uuid primary key default gen_random_uuid(), day_id uuid not null references public.attendance_days(id),
 subject_id uuid not null, subject_role text not null check(subject_role in ('student','tutor','admin')),
 subject_name text not null, class_names jsonb not null default '[]',
 check_in timestamptz, check_out timestamptz,
 calculated_status text not null default 'pending' check(calculated_status in ('pending','present','late','absent')),
 late_seconds integer not null default 0 check(late_seconds>=0),
 excused boolean not null default false, excuse_reason text,
 revision integer not null default 0, unique(day_id,subject_id)
);
create table if not exists public.attendance_events (
 id uuid primary key default gen_random_uuid(), entry_id uuid references public.attendance_entries(id),
 day_id uuid not null references public.attendance_days(id), actor_id uuid,
 action text not null check(action in ('check_in','check_out','correct','excuse','finalize')),
 occurred_at timestamptz, recorded_at timestamptz not null default now(),
 source text not null default 'manual' check(source in ('manual','system')),
 reason text, old_value jsonb, new_value jsonb, request_id uuid not null unique
);
create index if not exists attendance_entries_subject on public.attendance_entries(subject_id,day_id);
create index if not exists attendance_events_day on public.attendance_events(day_id,recorded_at);
create or replace function public.attendance_immutable_event() returns trigger language plpgsql as $$
begin raise exception 'Attendance audit events are immutable'; end $$;
drop trigger if exists immutable_attendance_events on public.attendance_events;
create trigger immutable_attendance_events before update or delete on public.attendance_events for each row execute function public.attendance_immutable_event();

create or replace function public.attendance_assert_actor(p_actor uuid,p_office uuid,p_audience text) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from profiles where id=p_actor and status='active' and
 ((p_audience='student' and role='admin' and office_id=p_office) or (p_audience='staff' and role='super_admin')))
 then raise exception 'Attendance access denied'; end if;
end $$;

create or replace function public.attendance_save_policy(p_actor uuid,p_office uuid,p_from date,p_settings jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare result uuid; tz text; close_time time; student_time time; staff_time time;
begin
 if not exists(select 1 from profiles where id=p_actor and role='super_admin' and status='active') then raise exception 'Policy access denied'; end if;
 tz:=p_settings->>'timezone';
 if not exists(select 1 from pg_timezone_names where name=tz) then raise exception 'Invalid timezone'; end if;
 close_time:=(p_settings->>'closingTime')::time; student_time:=(p_settings->>'studentStart')::time; staff_time:=(p_settings->>'staffStart')::time;
 if close_time<=student_time or close_time<=staff_time then raise exception 'Closing must follow arrival times'; end if;
 if (p_settings->>'studentGrace')::int not between 0 and 180 or (p_settings->>'staffGrace')::int not between 0 and 180 then raise exception 'Invalid grace period'; end if;
 if jsonb_typeof(p_settings->'weekdays') is distinct from 'array' or jsonb_array_length(p_settings->'weekdays')=0 or exists(select 1 from jsonb_array_elements_text(p_settings->'weekdays') v where v::int not between 0 and 6) then raise exception 'Invalid weekdays'; end if;
 if p_from<(now() at time zone tz)::date then raise exception 'Policy must take effect today or later'; end if;
 insert into attendance_policies(office_id,effective_from,settings,created_by) values(p_office,p_from,p_settings,p_actor) returning id into result;
 return result;
end $$;

create or replace function public.attendance_open_day(p_actor uuid,p_office uuid,p_date date,p_audience text) returns uuid
language plpgsql security definer set search_path=public as $$
declare policy jsonb; result uuid; tz text; active boolean; today date;
begin
 perform attendance_assert_actor(p_actor,p_office,p_audience);
 -- Serialize initialization, check-in and finalization for this office/date/audience.
 perform pg_advisory_xact_lock(hashtextextended(p_office::text||p_date::text||p_audience,0));
 select id into result from attendance_days where office_id=p_office and attendance_date=p_date and audience=p_audience;
 if result is not null then return result; end if;
 select settings into policy from attendance_policies where office_id=p_office and effective_from<=p_date order by effective_from desc,created_at desc limit 1;
 if policy is null then raise exception 'Super Admin must configure an attendance policy first'; end if;
 tz:=policy->>'timezone'; today:=(now() at time zone tz)::date;
 if p_date<>today then raise exception 'A new roster can only be opened for today; existing historical rosters remain available'; end if;
 active:=(policy->'weekdays') @> to_jsonb(array[extract(dow from p_date)::int]);
 if policy->'dateOverrides' ? p_date::text then active:=(policy->'dateOverrides'->>p_date::text)::boolean; end if;
 if not active then raise exception 'This is not an attendance day'; end if;
 insert into attendance_days(office_id,attendance_date,audience,policy_snapshot,closes_at)
 values(p_office,p_date,p_audience,policy,(p_date+(policy->>'closingTime')::time) at time zone tz) returning id into result;
 insert into attendance_entries(day_id,subject_id,subject_role,subject_name,class_names)
 select result,p.id,p.role,coalesce(p.name,'Unnamed account'),coalesce((select jsonb_agg(r.payload->>'name') from lms_records r where r.office_id=p_office and r.kind='class' and (r.payload->'studentIds') @> to_jsonb(array[p.id::text])),'[]'::jsonb)
 from profiles p where p.office_id=p_office and p.status='active' and ((p_audience='student' and p.role='student') or (p_audience='staff' and p.role in ('tutor','admin')));
 return result;
end $$;

create or replace function public.attendance_apply(p_actor uuid,p_day uuid,p_entry uuid,p_action text,p_time timestamptz,p_reason text,p_revision int,p_request uuid,p_excused boolean default true) returns void
language plpgsql security definer set search_path=public as $$
declare d attendance_days%rowtype; e attendance_entries%rowtype; before_value jsonb; after_value jsonb; required_time timestamptz; grace int; seconds_late int; status_value text; old_in timestamptz;
begin
 select * into d from attendance_days where id=p_day for update;
 if not found then raise exception 'Attendance day not found'; end if;
 if p_actor is null then
  if p_action<>'finalize' then raise exception 'Actor required'; end if;
 else perform attendance_assert_actor(p_actor,d.office_id,d.audience); end if;
 if exists(select 1 from attendance_events where request_id=p_request and day_id=p_day) then return; end if;
 if p_action='finalize' then
  if now()<d.closes_at then raise exception 'Attendance cannot close before closing time'; end if;
  if d.finalized_at is not null then return; end if;
  with changed as (
   update attendance_entries set calculated_status='absent',revision=revision+1 where day_id=p_day and calculated_status='pending' returning id
  ) insert into attendance_events(entry_id,day_id,actor_id,action,source,old_value,new_value,request_id)
   select id,p_day,p_actor,'finalize',case when p_actor is null then 'system' else 'manual' end,'{"calculated_status":"pending"}','{"calculated_status":"absent"}',gen_random_uuid() from changed;
  update attendance_days set finalized_at=now(),finalized_by=p_actor where id=p_day;
  insert into attendance_events(day_id,actor_id,action,source,request_id) values(p_day,p_actor,'finalize',case when p_actor is null then 'system' else 'manual' end,p_request);
  return;
 end if;
 select * into e from attendance_entries where id=p_entry and day_id=p_day for update;
 if not found or e.subject_id=p_actor then raise exception 'Invalid subject or self marking denied'; end if;
 if e.revision<>p_revision then raise exception 'Attendance changed. Refresh and retry'; end if;
 before_value:=to_jsonb(e); old_in:=e.check_in;
 if p_action in ('check_in','check_out','correct') then
  if p_time is null or p_time>now()+interval '30 seconds' or (p_time at time zone (d.policy_snapshot->>'timezone'))::date<>d.attendance_date then raise exception 'Use an actual arrival/departure time on this attendance date'; end if;
 end if;
 if p_action in ('correct','excuse') or d.finalized_at is not null or (p_time is not null and p_time<now()-interval '5 minutes') then
  if length(trim(coalesce(p_reason,'')))<5 then raise exception 'A reason of at least five characters is required'; end if;
 end if;
 if p_action='check_in' then
  if e.check_in is not null then raise exception 'Already checked in. Use an audited correction'; end if;
  if d.finalized_at is not null then raise exception 'Day finalized. Use an audited correction'; end if;
  e.check_in:=p_time;
 elsif p_action='check_out' then
  if e.check_in is null or e.check_out is not null or p_time<e.check_in then raise exception 'Departure must follow arrival and can only be entered once'; end if;
  e.check_out:=p_time;
 elsif p_action='correct' then
  e.check_in:=p_time;
  if e.check_out is not null and e.check_out<p_time then raise exception 'Corrected arrival cannot follow departure'; end if;
 elsif p_action='excuse' then
  e.excused:=p_excused; e.excuse_reason:=p_reason;
 else raise exception 'Invalid attendance action'; end if;
 if e.check_in is not null then
  required_time:=(d.attendance_date+(d.policy_snapshot->>(case when e.subject_role='student' then 'studentStart' else 'staffStart' end))::time) at time zone (d.policy_snapshot->>'timezone');
  grace:=(d.policy_snapshot->>(case when e.subject_role='student' then 'studentGrace' else 'staffGrace' end))::int;
  seconds_late:=greatest(0,ceil(extract(epoch from e.check_in-(required_time+make_interval(mins=>grace))))::int);
  e.calculated_status:=case when seconds_late>0 then 'late' else 'present' end; e.late_seconds:=seconds_late;
 end if;
 update attendance_entries set check_in=e.check_in,check_out=e.check_out,calculated_status=e.calculated_status,late_seconds=e.late_seconds,excused=e.excused,excuse_reason=e.excuse_reason,revision=revision+1 where id=e.id;
 select to_jsonb(x) into after_value from attendance_entries x where id=e.id;
 insert into attendance_events(entry_id,day_id,actor_id,action,occurred_at,reason,old_value,new_value,request_id) values(e.id,p_day,p_actor,p_action,p_time,nullif(trim(p_reason),''),before_value,after_value,p_request);
end $$;

create or replace function public.attendance_finalize_due() returns integer
language plpgsql security definer set search_path=public as $$
declare d record; count_days integer:=0;
begin
 for d in select id from attendance_days where finalized_at is null and closes_at<=now() order by closes_at limit 100 loop
  perform attendance_apply(null,d.id,null,'finalize',null,null,0,gen_random_uuid(),true); count_days:=count_days+1;
 end loop;
 return count_days;
end $$;

alter table attendance_policies enable row level security;
alter table attendance_days enable row level security;
alter table attendance_entries enable row level security;
alter table attendance_events enable row level security;
revoke all on attendance_policies,attendance_days,attendance_entries,attendance_events from anon,authenticated;
grant select,insert on attendance_policies to service_role;
grant select,insert,update on attendance_days,attendance_entries to service_role;
grant select,insert on attendance_events to service_role;
revoke all on function attendance_assert_actor(uuid,uuid,text),attendance_save_policy(uuid,uuid,date,jsonb),attendance_open_day(uuid,uuid,date,text),attendance_apply(uuid,uuid,uuid,text,timestamptz,text,int,uuid,boolean),attendance_finalize_due(),attendance_immutable_event() from public,anon,authenticated;
grant execute on function attendance_save_policy(uuid,uuid,date,jsonb),attendance_open_day(uuid,uuid,date,text),attendance_apply(uuid,uuid,uuid,text,timestamptz,text,int,uuid,boolean),attendance_finalize_due() to service_role;
