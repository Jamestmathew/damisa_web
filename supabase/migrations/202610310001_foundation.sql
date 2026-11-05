-- Review and apply in Supabase SQL Editor before deploying this version.
-- Existing profiles/offices and their data are preserved.
create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(), name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '', role text not null default 'student',
  status text not null default 'inactive', avatar_url text, matric_number text, staff_id text,
  office_id uuid references public.offices(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists office_id uuid references public.offices(id);
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists matric_number text;
alter table public.profiles add column if not exists staff_id text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
-- Resolve any existing duplicate matric numbers before applying this index.
create unique index if not exists profiles_matric_number_ci on public.profiles(lower(matric_number)) where matric_number is not null;

create or replace function public.lms_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, name, role, status)
  values(new.id, coalesce(new.raw_user_meta_data->>'name', ''), 'student', 'inactive')
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists lms_auth_profile on auth.users;
-- Keep an existing auth provisioning trigger; running two insert triggers can
-- cause duplicate-profile failures in an already deployed Supabase project.
do $$ begin
  if not exists (select 1 from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal and (tgtype & 4) <> 0) then
    create trigger lms_auth_profile after insert on auth.users for each row execute function public.lms_create_profile();
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.offices enable row level security;
-- Account provisioning and all writes use guarded server services. No browser role/status writes.
revoke all on public.profiles, public.offices from anon, authenticated;
grant select on public.profiles to authenticated;
drop policy if exists lms_read_own_profile on public.profiles;
create policy lms_read_own_profile on public.profiles for select to authenticated using(id = auth.uid());
drop policy if exists lms_own_profile_boundary on public.profiles;
create policy lms_own_profile_boundary on public.profiles as restrictive for select to authenticated using(id = auth.uid());

create table if not exists public.lms_records (
  id text primary key, kind text not null,
  office_id uuid not null references public.offices(id),
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}', revision integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists lms_records_scope on public.lms_records(office_id, kind, owner_id);
alter table public.lms_records enable row level security;
revoke all on public.lms_records from anon, authenticated;
grant all on public.lms_records to service_role;

create table if not exists public.lms_rate_limits (
  key text primary key, hits integer not null, expires_at timestamptz not null
);
alter table public.lms_rate_limits enable row level security;
revoke all on public.lms_rate_limits from anon, authenticated;
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.lms_rate_limits;
begin
  if p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then raise exception 'Invalid rate policy'; end if;
  insert into public.lms_rate_limits(key, hits, expires_at)
  values(p_key, 1, clock_timestamp() + make_interval(secs => p_window_seconds))
  on conflict(key) do update set
    hits = case when public.lms_rate_limits.expires_at <= clock_timestamp() then 1 else public.lms_rate_limits.hits + 1 end,
    expires_at = case when public.lms_rate_limits.expires_at <= clock_timestamp() then clock_timestamp() + make_interval(secs => p_window_seconds) else public.lms_rate_limits.expires_at end
  returning * into r;
  return jsonb_build_object('allowed', r.hits <= p_limit, 'retry_after', greatest(1, ceil(extract(epoch from r.expires_at - clock_timestamp()))::integer));
end; $$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
create or replace function public.cleanup_lms_rate_limits() returns void
language sql security definer set search_path = '' as $$
  delete from public.lms_rate_limits where expires_at < now() - interval '1 day';
$$;
revoke all on function public.cleanup_lms_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_lms_rate_limits() to service_role;

create unique index if not exists lms_payment_reference on public.lms_records(office_id, lower(payload->>'reference')) where kind = 'payment';
create unique index if not exists lms_student_submission on public.lms_records(office_id, owner_id, (payload->>'assignmentId')) where kind = 'submission';
create unique index if not exists lms_lesson_completion on public.lms_records(office_id, owner_id, (payload->>'lessonId')) where kind = 'lesson_progress';
create unique index if not exists lms_daily_attendance on public.lms_records(office_id, (payload->>'studentId'), (payload->>'courseId'), (payload->>'date')) where kind = 'attendance';
create unique index if not exists lms_user_preferences on public.lms_records(office_id, owner_id) where kind = 'preferences';
create unique index if not exists lms_office_settings on public.lms_records(office_id, kind) where kind in ('system_settings', 'ai_governance');
create unique index if not exists lms_student_quiz_attempt on public.lms_records(office_id, owner_id, (payload->>'quizId')) where kind = 'quiz_attempt';
create unique index if not exists lms_student_quiz_session on public.lms_records(office_id, owner_id, (payload->>'quizId')) where kind = 'quiz_session';

alter table public.lms_records add column if not exists updated_by uuid references auth.users(id);
-- Audit record changes in the same database transaction, without copying private submission content.
create or replace function public.lms_audit_record() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r public.lms_records; actor_name text;
begin
  if TG_OP = 'DELETE' then r := OLD; else r := NEW; end if;
  if r.kind = 'activity_log' or not exists(select 1 from auth.users where id=coalesce(r.updated_by,r.owner_id)) then return coalesce(NEW, OLD); end if;
  select name into actor_name from public.profiles where id = coalesce(r.updated_by, r.owner_id);
  insert into public.lms_records(id,kind,office_id,owner_id,payload)
  values(gen_random_uuid()::text,'activity_log',r.office_id,coalesce(r.updated_by,r.owner_id),jsonb_build_object(
    'actor',coalesce(actor_name,'System'),'action',lower(TG_OP),'target',r.kind || ':' || r.id,
    'category',case when r.kind='payment' then 'finance' when r.kind in ('class','lesson','course','quiz','assignment','submission','attendance') then 'academic' else 'system' end,
    'occurredAt',now()));
  return coalesce(NEW, OLD);
end; $$;
drop trigger if exists lms_record_audit on public.lms_records;
create trigger lms_record_audit after insert or update or delete on public.lms_records for each row execute function public.lms_audit_record();
grant all on public.profiles, public.offices to service_role;
