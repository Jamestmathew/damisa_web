-- Apply after 202610310001_foundation.sql.
alter table public.profiles add column if not exists session_version integer not null default 0;
create or replace function public.bump_profile_session_version(p_user_id uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare version integer;
begin
  update public.profiles set session_version=session_version+1,updated_at=now() where id=p_user_id returning session_version into version;
  if version is null then raise exception 'Profile not found'; end if;
  return version;
end; $$;
revoke all on function public.bump_profile_session_version(uuid) from public, anon, authenticated;
grant execute on function public.bump_profile_session_version(uuid) to service_role;
do $$ begin
  if not exists(select 1 from pg_constraint where conname='lms_profile_role_valid' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint lms_profile_role_valid check(role in ('student','tutor','admin','super_admin')) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='lms_profile_status_valid' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint lms_profile_status_valid check(status in ('active','inactive','suspended','archived')) not valid;
  end if;
end $$;
