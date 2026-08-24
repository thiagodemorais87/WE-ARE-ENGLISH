-- Fix infinite RLS recursion on profiles when policies subquery profiles.
-- Staff checks go through a SECURITY DEFINER helper.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('teacher', 'admin')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, anon, service_role;

drop policy if exists "profiles_select_own_or_teacher" on public.profiles;
create policy "profiles_select_own_or_teacher"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

drop policy if exists "activities_select_published_or_own_or_teacher" on public.activities;
create policy "activities_select_published_or_own_or_teacher"
  on public.activities for select
  using (
    is_published = true
    or created_by = auth.uid()
    or public.is_staff()
  );

drop policy if exists "activities_insert_teacher" on public.activities;
create policy "activities_insert_teacher"
  on public.activities for insert
  with check (
    public.is_staff()
    and created_by = auth.uid()
    and is_system = false
  );

drop policy if exists "activities_update_own_non_system" on public.activities;
create policy "activities_update_own_non_system"
  on public.activities for update
  using (
    created_by = auth.uid()
    and is_system = false
    and public.is_staff()
  );

drop policy if exists "attempts_select_own_or_teacher" on public.activity_attempts;
create policy "attempts_select_own_or_teacher"
  on public.activity_attempts for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "activity_audio_teacher_write" on storage.objects;
create policy "activity_audio_teacher_write"
  on storage.objects for insert
  with check (
    bucket_id = 'activity-audio'
    and public.is_staff()
  );

drop policy if exists "activity_audio_teacher_update" on storage.objects;
create policy "activity_audio_teacher_update"
  on storage.objects for update
  using (
    bucket_id = 'activity-audio'
    and public.is_staff()
  );
