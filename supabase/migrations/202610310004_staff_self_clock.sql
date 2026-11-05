-- Staff self clock-in/out: database time only; supervision remains with Super Admin.
begin;
alter table public.attendance_events drop constraint if exists attendance_events_source_check;
alter table public.attendance_events add constraint attendance_events_source_check check(source in ('manual','system','self'));
create or replace function public.attendance_ensure_day(p_office uuid,p_date date,p_audience text) returns uuid
language plpgsql security definer set search_path=public as $$
declare policy jsonb; result uuid; tz text; active boolean; today date;
begin
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

create or replace function public.attendance_open_day(p_actor uuid,p_office uuid,p_date date,p_audience text) returns uuid
language plpgsql security definer set search_path=public as $$
begin
 perform attendance_assert_actor(p_actor,p_office,p_audience);
 return attendance_ensure_day(p_office,p_date,p_audience);
end $$;

create or replace function public.attendance_self_clock(p_actor uuid,p_direction text,p_request uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare person profiles%rowtype; policy jsonb; local_date date; day_id_value uuid; d attendance_days%rowtype; e attendance_entries%rowtype; before_value jsonb; stamp timestamptz; required_time timestamptz; seconds_late int;
begin
 if p_direction not in ('check_in','check_out') or p_direction is null or p_request is null then raise exception 'Choose clock in or clock out'; end if;
 select * into person from profiles where id=p_actor and status='active' and role in ('tutor','admin');
 if not found or person.office_id is null then raise exception 'Only active Tutors and Admins assigned to an office may clock attendance'; end if;
 select settings into policy from attendance_policies where office_id=person.office_id and effective_from<=(clock_timestamp() at time zone (settings->>'timezone'))::date order by effective_from desc,created_at desc limit 1;
 if policy is null then raise exception 'Super Admin must configure the office attendance policy first'; end if;
 local_date:=(clock_timestamp() at time zone (policy->>'timezone'))::date;
 day_id_value:=attendance_ensure_day(person.office_id,local_date,'staff');
 select * into d from attendance_days where id=day_id_value for update;
 select * into e from attendance_entries where day_id=day_id_value and subject_id=person.id for update;
 if not found then raise exception 'You are not on today''s staff roster. Contact Super Admin'; end if;
 if exists(select 1 from attendance_events where request_id=p_request and entry_id=e.id and actor_id=person.id and action=p_direction and source='self') then return e.id; end if;
 before_value:=to_jsonb(e);
 stamp:=clock_timestamp();
 if (stamp at time zone (d.policy_snapshot->>'timezone'))::date<>d.attendance_date then raise exception 'The office attendance date changed. Refresh and try again'; end if;
 if p_direction='check_in' then
  if e.check_in is not null then return e.id; end if;
  if d.finalized_at is not null or stamp>=d.closes_at then raise exception 'Arrival recording has closed. Ask Super Admin for an audited correction'; end if;
  required_time:=(d.attendance_date+(d.policy_snapshot->>'staffStart')::time) at time zone (d.policy_snapshot->>'timezone');
  seconds_late:=greatest(0,ceil(extract(epoch from stamp-(required_time+make_interval(mins=>(d.policy_snapshot->>'staffGrace')::int))))::int);
  update attendance_entries set check_in=stamp,calculated_status=case when seconds_late>0 then 'late' else 'present' end,late_seconds=seconds_late,revision=revision+1 where id=e.id;
 else
  if e.check_in is null then raise exception 'Clock in before clocking out'; end if;
  if e.check_out is not null then return e.id; end if;
  if stamp<e.check_in then raise exception 'Departure cannot precede arrival'; end if;
  update attendance_entries set check_out=stamp,revision=revision+1 where id=e.id;
 end if;
 insert into attendance_events(entry_id,day_id,actor_id,action,occurred_at,recorded_at,source,old_value,new_value,request_id)
 select e.id,d.id,person.id,p_direction,stamp,stamp,'self',before_value,to_jsonb(current_entry),p_request from attendance_entries current_entry where id=e.id;
 return e.id;
end $$;
revoke all on function public.attendance_ensure_day(uuid,date,text),public.attendance_self_clock(uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.attendance_self_clock(uuid,text,uuid) to service_role;

-- Review decisions never replace observed arrival/departure or calculated lateness.
alter table public.attendance_entries add column if not exists approval_status text not null default 'pending' check(approval_status in ('pending','approved','rejected'));
alter table public.attendance_entries add column if not exists reviewed_by uuid;
alter table public.attendance_entries add column if not exists reviewed_at timestamptz;
alter table public.attendance_entries add column if not exists review_reason text;
alter table public.attendance_events drop constraint if exists attendance_events_action_check;
alter table public.attendance_events add constraint attendance_events_action_check check(action in ('check_in','check_out','correct','excuse','finalize','approve','reject'));
create or replace function public.attendance_reset_review() returns trigger
language plpgsql set search_path=public as $$
begin
 if row(new.check_in,new.check_out,new.calculated_status,new.late_seconds,new.excused,new.excuse_reason) is distinct from row(old.check_in,old.check_out,old.calculated_status,old.late_seconds,old.excused,old.excuse_reason) then
  new.approval_status:='pending';new.reviewed_by:=null;new.reviewed_at:=null;new.review_reason:=null;
 end if;
 return new;
end $$;
drop trigger if exists attendance_reset_review on public.attendance_entries;
create trigger attendance_reset_review before update on public.attendance_entries for each row execute function public.attendance_reset_review();
create or replace function public.attendance_review(p_actor uuid,p_entry uuid,p_decision text,p_reason text,p_revision int,p_request uuid) returns void
language plpgsql security definer set search_path=public as $$
declare reviewer profiles%rowtype; e attendance_entries%rowtype; d attendance_days%rowtype; before_value jsonb;
begin
 if p_decision not in ('approved','rejected') or p_decision is null or p_request is null then raise exception 'Choose approve or reject'; end if;
 select * into reviewer from profiles where id=p_actor and status='active' and role in ('admin','super_admin');
 if not found then raise exception 'Attendance approval denied'; end if;
 -- Keep the same day-before-entry lock order as clock and correction actions.
 select day_id into d.id from attendance_entries where id=p_entry;
 select * into d from attendance_days where id=d.id for update;
 if not found then raise exception 'Attendance day not found'; end if;
 select * into e from attendance_entries where id=p_entry and day_id=d.id for update;
 if not found or e.subject_id=p_actor then raise exception 'You cannot approve your own attendance'; end if;
 if not coalesce((reviewer.role='admin' and reviewer.office_id=d.office_id and e.subject_role in ('student','tutor')) or (reviewer.role='super_admin' and e.subject_role='admin'),false) then raise exception 'Attendance approval denied'; end if;
 if exists(select 1 from attendance_events where request_id=p_request and entry_id=e.id and actor_id=p_actor and action=case when p_decision='approved' then 'approve' else 'reject' end) then return; end if;
 if p_revision is null or e.revision<>p_revision then raise exception 'Attendance changed. Refresh and review again'; end if;
 if e.calculated_status='pending' then raise exception 'Attendance must be recorded or finalized before approval'; end if;
 if p_decision='rejected' and length(trim(coalesce(p_reason,'')))<5 then raise exception 'Explain why this attendance is rejected (at least five characters)'; end if;
 if length(coalesce(p_reason,''))>1000 then raise exception 'Review reason is too long'; end if;
 before_value:=to_jsonb(e);
 update attendance_entries set approval_status=p_decision,reviewed_by=p_actor,reviewed_at=clock_timestamp(),review_reason=nullif(trim(p_reason),''),revision=revision+1 where id=e.id;
 insert into attendance_events(entry_id,day_id,actor_id,action,source,reason,old_value,new_value,request_id)
 select e.id,d.id,p_actor,case when p_decision='approved' then 'approve' else 'reject' end,'manual',nullif(trim(p_reason),''),before_value,to_jsonb(current_entry),p_request from attendance_entries current_entry where id=e.id;
end $$;
revoke all on function public.attendance_review(uuid,uuid,text,text,int,uuid),public.attendance_reset_review() from public,anon,authenticated;
grant execute on function public.attendance_review(uuid,uuid,text,text,int,uuid) to service_role;
commit;
