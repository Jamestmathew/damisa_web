\set ON_ERROR_STOP on
begin;
insert into offices(id,name) values('11000000-0000-0000-0000-000000000001','Attendance QA'),('11000000-0000-0000-0000-000000000002','Other office');
insert into auth.users(id) values('22000000-0000-0000-0000-000000000001'),('22000000-0000-0000-0000-000000000002'),('22000000-0000-0000-0000-000000000003'),('22000000-0000-0000-0000-000000000004'),('22000000-0000-0000-0000-000000000005');
update profiles set status='active',office_id='11000000-0000-0000-0000-000000000001';
update profiles set role='super_admin' where id='22000000-0000-0000-0000-000000000001';
update profiles set role='admin' where id='22000000-0000-0000-0000-000000000002';
update profiles set role='tutor' where id='22000000-0000-0000-0000-000000000003';
set local role authenticated;
do $$ begin
 begin perform * from attendance_entries;raise exception 'Browser could read daily attendance';exception when insufficient_privilege then null;end;
 begin perform attendance_finalize_due();raise exception 'Browser could finalize attendance';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ declare
 super_id uuid:='22000000-0000-0000-0000-000000000001'; admin_id uuid:='22000000-0000-0000-0000-000000000002'; tutor_id uuid:='22000000-0000-0000-0000-000000000003';
 office uuid:='11000000-0000-0000-0000-000000000001'; day uuid;staff_day uuid; entry uuid; staff_entry uuid; student_two uuid; stamp timestamptz; req uuid:=gen_random_uuid(); today date:=(now() at time zone 'Africa/Lagos')::date; policy jsonb;
begin
 policy:=jsonb_build_object('timezone','Africa/Lagos','studentStart','00:00','studentGrace',10,'staffStart','00:00','staffGrace',5,'closingTime','23:59','weekdays','[0,1,2,3,4,5,6]'::jsonb,'dateOverrides','{}'::jsonb);
 perform attendance_save_policy(super_id,office,today,policy);
 day:=attendance_open_day(admin_id,office,today,'student');staff_day:=attendance_open_day(super_id,office,today,'staff');
 if (select count(*) from attendance_entries where day_id=staff_day)<>2 then raise exception 'Staff roster includes wrong roles';end if;
 if exists(select 1 from attendance_entries where subject_role='super_admin') then raise exception 'Super Admin included';end if;
 begin perform attendance_open_day(admin_id,office,today,'staff');raise exception 'Admin manages staff';exception when raise_exception then if sqlerrm='Admin manages staff' then raise;end if;end;
 begin perform attendance_open_day(admin_id,'11000000-0000-0000-0000-000000000002',today,'student');raise exception 'Cross-office access';exception when raise_exception then if sqlerrm='Cross-office access' then raise;end if;end;
 -- Use yesterday only inside this rolled-back fixture to make time checks deterministic.
 today:=today-1;
 update attendance_days set attendance_date=today where id in (day,staff_day);
 select id into entry from attendance_entries where day_id=day order by subject_id limit 1;
 stamp:=(today+time '00:32') at time zone 'Africa/Lagos';
 perform attendance_apply(admin_id,day,entry,'check_in',stamp,'Arrival recorded during verification',0,req);
 if (select calculated_status<>'late' or late_seconds<>1320 from attendance_entries where id=entry) then raise exception 'Late minutes wrong';end if;
 perform attendance_apply(admin_id,day,entry,'check_in',stamp,'Idempotent retry',0,req);
 if (select revision from attendance_entries where id=entry)<>1 then raise exception 'Retry mutated attendance';end if;
 begin perform attendance_apply(admin_id,day,entry,'correct',stamp,'Correction',0,gen_random_uuid());raise exception 'Stale update accepted';exception when raise_exception then if sqlerrm='Stale update accepted' then raise;end if;end;
 perform attendance_apply(admin_id,day,entry,'excuse',null,'Approved medical reason',1,gen_random_uuid());
 if (select calculated_status<>'late' or not excused from attendance_entries where id=entry) then raise exception 'Excuse erased facts';end if;
 perform attendance_apply(admin_id,day,entry,'correct',(today+time '00:10') at time zone 'Africa/Lagos','Confirmed original arrival was earlier',2,gen_random_uuid());
 if (select calculated_status<>'present' or late_seconds<>0 from attendance_entries where id=entry) then raise exception 'Grace boundary wrong';end if;
 if not exists(select 1 from attendance_events where entry_id=entry and action='correct' and old_value->>'calculated_status'='late' and new_value->>'calculated_status'='present') then raise exception 'Correction audit missing';end if;
 begin update attendance_events set reason='tampered' where entry_id=entry;raise exception 'Audit mutable';exception when raise_exception then if sqlerrm='Audit mutable' then raise;end if;end;
 select id into staff_entry from attendance_entries where day_id=staff_day and subject_id=admin_id;
 perform attendance_apply(super_id,staff_day,staff_entry,'check_in',stamp,'Staff arrival entered',0,gen_random_uuid());
 if (select late_seconds from attendance_entries where id=staff_entry)<>1620 then raise exception 'Admin exempt from staff rules';end if;
 begin perform attendance_apply(admin_id,staff_day,staff_entry,'excuse',null,'Self excuse',1,gen_random_uuid());raise exception 'Self excuse accepted';exception when raise_exception then if sqlerrm='Self excuse accepted' then raise;end if;end;
 -- Force only the disposable day's close into the past to test absence finalization.
 update attendance_days set closes_at=now()-interval '1 second' where id=day;
 perform attendance_apply(admin_id,day,null,'finalize',null,'',0,gen_random_uuid());
 if not exists(select 1 from attendance_entries where day_id=day and calculated_status='absent') then raise exception 'Missing finalized absence';end if;
 if exists(select 1 from attendance_entries where day_id=day and calculated_status='pending') then raise exception 'Unfinalized entry';end if;
 if (select check_in from attendance_entries where id=entry) is distinct from (today+time '00:10') at time zone 'Africa/Lagos' then raise exception 'Finalization destroyed arrival';end if;
end $$;
rollback;
\echo 'Attendance roles, isolation, facts, grace, idempotency, revisions, immutable audit and finalization passed.'
