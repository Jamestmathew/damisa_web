\set ON_ERROR_STOP on
begin;
insert into public.offices(id,name) values('10000000-0000-0000-0000-000000000001','Test office');
insert into auth.users(id,raw_user_meta_data) values
('20000000-0000-0000-0000-000000000001','{"name":"Student One","role":"super_admin"}'),
('20000000-0000-0000-0000-000000000002','{"name":"Student Two"}');
do $$ begin
  if (select role from public.profiles where id='20000000-0000-0000-0000-000000000001') <> 'student' then raise exception 'Profile trigger trusts user role metadata'; end if;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'RLS exposes other profiles'; end if;
  begin
    update public.profiles set role='super_admin';
    raise exception 'Client profile update was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.lms_records;
    raise exception 'Raw records accessible to browser';
  exception when insufficient_privilege then null; end;
  begin
    perform public.consume_rate_limit('forged',100,60);
    raise exception 'Client can control request limits';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ declare result jsonb; begin
  result := public.consume_rate_limit('test-key',2,60);
  if not (result->>'allowed')::boolean then raise exception 'First request denied'; end if;
  perform public.consume_rate_limit('test-key',2,60);
  result := public.consume_rate_limit('test-key',2,60);
  if (result->>'allowed')::boolean then raise exception 'Limit did not block'; end if;
  if (result->>'retry_after')::integer < 1 then raise exception 'Missing retry time'; end if;
end $$;
reset role;
insert into public.lms_records(id,kind,office_id,owner_id,payload,updated_by) values
('payment-one','payment','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','{"reference":"TXN-ONE"}','20000000-0000-0000-0000-000000000001');
do $$ begin
  if (select count(*) from public.lms_records where kind='activity_log') <> 1 then raise exception 'Missing transactional audit log'; end if;
  begin
    insert into public.lms_records(id,kind,office_id,owner_id,payload) values('payment-two','payment','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','{"reference":"txn-one"}');
    raise exception 'Duplicate payment reference accepted';
  exception when unique_violation then null; end;
end $$;
-- Expired counters restart rather than locking accounts permanently.
update public.lms_rate_limits set expires_at=now()-interval '1 second' where key='test-key';
do $$ begin if not (public.consume_rate_limit('test-key',2,60)->>'allowed')::boolean then raise exception 'Expired rate window did not reset'; end if; end $$;
rollback;
\echo 'Database authorization, trigger, uniqueness, audit, and rate-limit checks passed.'
