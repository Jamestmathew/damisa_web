\set ON_ERROR_STOP on
begin;
insert into offices(id,name) values('33000000-0000-0000-0000-000000000001','Self clock QA');
insert into auth.users(id) values('44000000-0000-0000-0000-000000000001'),('44000000-0000-0000-0000-000000000002'),('44000000-0000-0000-0000-000000000003'),('44000000-0000-0000-0000-000000000004');
update profiles set status='active',office_id='33000000-0000-0000-0000-000000000001' where id::text like '44000000-%';
update profiles set role='super_admin' where id='44000000-0000-0000-0000-000000000001';
update profiles set role='admin' where id='44000000-0000-0000-0000-000000000002';
update profiles set role='tutor' where id='44000000-0000-0000-0000-000000000003';
set local role authenticated;
do $$ begin
 begin perform attendance_self_clock('44000000-0000-0000-0000-000000000003','check_in',gen_random_uuid());raise exception 'Browser can impersonate clock actor';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role service_role;
do $$ begin
 begin perform attendance_ensure_day('33000000-0000-0000-0000-000000000001',current_date,'staff');raise exception 'Unrestricted roster initializer exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ declare
 super_id uuid:='44000000-0000-0000-0000-000000000001'; admin_id uuid:='44000000-0000-0000-0000-000000000002'; tutor_id uuid:='44000000-0000-0000-0000-000000000003'; student_id uuid:='44000000-0000-0000-0000-000000000004'; office uuid:='33000000-0000-0000-0000-000000000001';
 tz text; local_date date; entry uuid; admin_entry uuid; d uuid; stamp_before timestamptz; stamp_after timestamptz; first_stamp timestamptz; req uuid:=gen_random_uuid(); policy jsonb;
begin
 -- Keep local fixture time before noon regardless of when CI runs.
 tz:=case when extract(hour from clock_timestamp() at time zone 'UTC')<12 then 'UTC' else 'Etc/GMT+12' end;
 local_date:=(clock_timestamp() at time zone tz)::date;
 policy:=jsonb_build_object('timezone',tz,'studentStart','00:00','studentGrace',0,'staffStart','00:00','staffGrace',0,'closingTime','23:59','weekdays','[0,1,2,3,4,5,6]'::jsonb,'dateOverrides','{}'::jsonb);
 perform attendance_save_policy(super_id,office,local_date,policy);
 begin perform attendance_self_clock(student_id,'check_in',gen_random_uuid());raise exception 'Student self clock accepted';exception when raise_exception then if sqlerrm='Student self clock accepted' then raise;end if;end;
 begin perform attendance_self_clock(super_id,'check_in',gen_random_uuid());raise exception 'Super Admin included';exception when raise_exception then if sqlerrm='Super Admin included' then raise;end if;end;
 begin perform attendance_self_clock(tutor_id,'correct',gen_random_uuid());raise exception 'Self correction accepted';exception when raise_exception then if sqlerrm='Self correction accepted' then raise;end if;end;
 begin perform attendance_self_clock(tutor_id,'check_out',gen_random_uuid());raise exception 'Checkout before arrival accepted';exception when raise_exception then if sqlerrm='Checkout before arrival accepted' then raise;end if;end;
 stamp_before:=clock_timestamp();entry:=attendance_self_clock(tutor_id,'check_in',req);stamp_after:=clock_timestamp();
 select day_id,check_in into d,first_stamp from attendance_entries where id=entry;
 if first_stamp<stamp_before or first_stamp>stamp_after then raise exception 'Arrival did not use database clock';end if;
 if (select calculated_status from attendance_entries where id=entry)<>'late' then raise exception 'Self clock did not calculate late status';end if;
 if not exists(select 1 from attendance_events where entry_id=entry and source='self' and actor_id=tutor_id and occurred_at=first_stamp) then raise exception 'Missing self event audit';end if;
 if (select count(*) from attendance_entries where day_id=d)<>2 then raise exception 'Staff roster roles incorrect';end if;
 perform attendance_self_clock(tutor_id,'check_in',req);perform attendance_self_clock(tutor_id,'check_in',gen_random_uuid());
 if (select revision from attendance_entries where id=entry)<>1 or (select check_in from attendance_entries where id=entry)<>first_stamp then raise exception 'Duplicate arrival rewrote time';end if;
 begin perform attendance_apply(tutor_id,d,entry,'correct',first_stamp-interval '1 hour','Self edit attempt',1,gen_random_uuid());raise exception 'Tutor could self edit';exception when raise_exception then if sqlerrm='Tutor could self edit' then raise;end if;end;
 stamp_before:=clock_timestamp();perform attendance_self_clock(tutor_id,'check_out',gen_random_uuid());stamp_after:=clock_timestamp();
 if (select check_out<stamp_before or check_out>stamp_after from attendance_entries where id=entry) then raise exception 'Departure did not use database clock';end if;
 perform attendance_self_clock(tutor_id,'check_out',gen_random_uuid());
 if (select revision from attendance_entries where id=entry)<>2 then raise exception 'Duplicate checkout rewrote departure';end if;
 admin_entry:=attendance_self_clock(admin_id,'check_in',gen_random_uuid());
 begin perform attendance_apply(admin_id,d,admin_entry,'excuse',null,'Self excuse attempt',1,gen_random_uuid());raise exception 'Admin could self excuse';exception when raise_exception then if sqlerrm='Admin could self excuse' then raise;end if;end;
 perform attendance_apply(super_id,d,admin_entry,'excuse',null,'Approved medical exception',1,gen_random_uuid());
 if not (select excused from attendance_entries where id=admin_entry) then raise exception 'Super Admin lost oversight';end if;
 update profiles set status='suspended' where id=admin_id;
 begin perform attendance_self_clock(admin_id,'check_out',gen_random_uuid());raise exception 'Suspended staff could clock';exception when raise_exception then if sqlerrm='Suspended staff could clock' then raise;end if;end;

 -- Approval hierarchy: Admin reviews Student/Tutor; Super Admin reviews Admin.
 update profiles set status='active' where id=admin_id;
 perform attendance_review(admin_id,entry,'approved','Verified staff arrival',2,gen_random_uuid());
 if (select approval_status from attendance_entries where id=entry)<>'approved' then raise exception 'Admin could not approve Tutor';end if;
 if (select check_in from attendance_entries where id=entry)<>first_stamp then raise exception 'Approval changed arrival facts';end if;
 if not exists(select 1 from attendance_events where entry_id=entry and action='approve' and old_value->>'approval_status'='pending' and new_value->>'approval_status'='approved') then raise exception 'Review audit missing';end if;
 begin perform attendance_review(super_id,entry,'approved','Wrong approval tier',3,gen_random_uuid());raise exception 'Super Admin approved Tutor instead of Admin';exception when raise_exception then if sqlerrm='Super Admin approved Tutor instead of Admin' then raise;end if;end;
 begin perform attendance_review(admin_id,admin_entry,'approved','Self approval',2,gen_random_uuid());raise exception 'Self approval accepted';exception when raise_exception then if sqlerrm='Self approval accepted' then raise;end if;end;
 perform attendance_review(super_id,admin_entry,'approved','Reviewed Admin arrival',2,gen_random_uuid());
 if (select approval_status from attendance_entries where id=admin_entry)<>'approved' then raise exception 'Super Admin could not approve Admin';end if;
 begin perform attendance_review(admin_id,entry,'rejected','',3,gen_random_uuid());raise exception 'Unreasoned rejection accepted';exception when raise_exception then if sqlerrm='Unreasoned rejection accepted' then raise;end if;end;
 perform attendance_review(admin_id,entry,'rejected','Attendance needs clarification',3,gen_random_uuid());
 if (select calculated_status from attendance_entries where id=entry)<>'late' or (select approval_status from attendance_entries where id=entry)<>'rejected' then raise exception 'Rejection rewrote lateness';end if;
 perform attendance_apply(super_id,d,entry,'excuse',null,'Approved documented exception',4,gen_random_uuid());
 if (select approval_status from attendance_entries where id=entry)<>'pending' or (select reviewed_by from attendance_entries where id=entry) is not null then raise exception 'Changed facts kept stale approval';end if;
 update profiles set office_id=null where id=admin_id;
 begin perform attendance_review(admin_id,entry,'approved','Cross office approval',5,gen_random_uuid());raise exception 'Cross-office approval accepted';exception when raise_exception then if sqlerrm='Cross-office approval accepted' then raise;end if;end;
 update profiles set office_id=office where id=admin_id;
 d:=attendance_open_day(admin_id,office,local_date,'student');
 select id into entry from attendance_entries where day_id=d and subject_id=student_id;
 perform attendance_apply(admin_id,d,entry,'check_in',clock_timestamp(),'Student arrival verified',0,gen_random_uuid());
 perform attendance_review(admin_id,entry,'approved','Student verified',1,gen_random_uuid());
 if (select approval_status from attendance_entries where id=entry)<>'approved' then raise exception 'Admin could not approve Student';end if;
 if exists(select 1 from pg_proc where proname='attendance_self_clock' and ('p_time'=any(proargnames) or 'p_office'=any(proargnames) or 'p_entry'=any(proargnames))) then raise exception 'Self endpoint accepts selectable time, office or target';end if;
end $$;
rollback;
\echo 'Staff self-clock database time, roles, audit, idempotency, correction denial and supervisor oversight passed.'
