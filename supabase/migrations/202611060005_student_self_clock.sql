-- Students, Tutors and Admins sign attendance using database time only.
begin;
create or replace function public.attendance_self_clock(p_actor uuid,p_direction text,p_request uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare person profiles%rowtype; policy jsonb; local_date date; day_id_value uuid; d attendance_days%rowtype; e attendance_entries%rowtype; before_value jsonb; stamp timestamptz; required_time timestamptz; seconds_late int;
begin
 if p_direction not in ('check_in','check_out') or p_direction is null or p_request is null then raise exception 'Choose clock in or clock out'; end if;
 select * into person from profiles where id=p_actor and status='active' and role in ('student','tutor','admin');
 if not found or person.office_id is null then raise exception 'Only active Students, Tutors and Admins assigned to an office may sign attendance'; end if;
 select settings into policy from attendance_policies where office_id=person.office_id and effective_from<=(clock_timestamp() at time zone (settings->>'timezone'))::date order by effective_from desc,created_at desc limit 1;
 if policy is null then raise exception 'Super Admin must configure the office attendance policy first'; end if;
 local_date:=(clock_timestamp() at time zone (policy->>'timezone'))::date;
 day_id_value:=attendance_ensure_day(person.office_id,local_date,case when person.role='student' then 'student' else 'staff' end);
 select * into d from attendance_days where id=day_id_value for update;
 select * into e from attendance_entries where day_id=day_id_value and subject_id=person.id for update;
 if not found then raise exception 'You are not on today''s attendance roster. Contact your supervisor'; end if;
 if exists(select 1 from attendance_events where request_id=p_request and entry_id=e.id and actor_id=person.id and action=p_direction and source='self') then return e.id; end if;
 before_value:=to_jsonb(e);
 stamp:=clock_timestamp();
 if (stamp at time zone (d.policy_snapshot->>'timezone'))::date<>d.attendance_date then raise exception 'The office attendance date changed. Refresh and try again'; end if;
 if p_direction='check_in' then
  if e.check_in is not null then return e.id; end if;
  if d.finalized_at is not null or stamp>=d.closes_at then raise exception 'Arrival recording has closed. Ask your supervisor for an audited correction'; end if;
  required_time:=(d.attendance_date+(d.policy_snapshot->>case when person.role='student' then 'studentStart' else 'staffStart' end)::time) at time zone (d.policy_snapshot->>'timezone');
  seconds_late:=greatest(0,ceil(extract(epoch from stamp-(required_time+make_interval(mins=>(d.policy_snapshot->>case when person.role='student' then 'studentGrace' else 'staffGrace' end)::int))))::int);
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
revoke all on function public.attendance_self_clock(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.attendance_self_clock(uuid,text,uuid) to service_role;
commit;
