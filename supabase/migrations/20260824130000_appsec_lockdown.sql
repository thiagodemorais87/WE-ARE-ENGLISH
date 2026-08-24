-- AppSec lockdown: roles, attempts scoring RPCs, storage MIME, admin role RPC
-- Does NOT mass-update existing teacher/admin roles.

-- ---------------------------------------------------------------------------
-- 1) Signup always student
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Block client role changes
-- ---------------------------------------------------------------------------
create or replace function public.profiles_lock_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if auth.role() = 'service_role' then
      return new;
    end if;
    if coalesce(current_setting('app.allow_role_change', true), '') = 'on' then
      return new;
    end if;
    raise exception 'role cannot be changed by clients';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_role on public.profiles;
create trigger profiles_lock_role
  before update on public.profiles
  for each row execute function public.profiles_lock_role();

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  result public.profiles;
begin
  if new_role not in ('student', 'teacher', 'admin') then
    raise exception 'invalid role';
  end if;

  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is distinct from 'admin' then
    raise exception 'forbidden';
  end if;

  perform set_config('app.allow_role_change', 'on', true);

  update public.profiles
  set role = new_role
  where id = target_user_id
  returning * into result;

  if result.id is null then
    raise exception 'user not found';
  end if;

  return result;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

-- Ensure is_staff exists (from prior migration) with tight grants
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
grant execute on function public.is_staff() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3) Attempts score guard + grading RPCs
-- ---------------------------------------------------------------------------
create or replace function public.attempts_guard_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(current_setting('app.allow_score_write', true), '') <> 'on' then
      new.score := null;
    end if;
    if auth.uid() is not null and auth.role() <> 'service_role' then
      new.user_id := auth.uid();
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if auth.uid() is not null and auth.role() <> 'service_role' then
      if new.user_id is distinct from old.user_id then
        raise exception 'user_id cannot be changed';
      end if;
      if new.activity_id is distinct from old.activity_id then
        raise exception 'activity_id cannot be changed';
      end if;
    end if;

    if coalesce(current_setting('app.allow_score_write', true), '') <> 'on' then
      new.score := old.score;
    end if;

    if old.completed_at is not null
       and coalesce(current_setting('app.allow_score_write', true), '') <> 'on'
       and auth.role() <> 'service_role' then
      new.answer := old.answer;
      new.feedback := old.feedback;
      new.completed_at := old.completed_at;
      new.score := old.score;
    end if;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists attempts_guard_score on public.activity_attempts;
create trigger attempts_guard_score
  before insert or update on public.activity_attempts
  for each row execute function public.attempts_guard_score();

create or replace function public._quiz_correct_indexes(content jsonb)
returns int[]
language plpgsql
immutable
as $$
declare
  idxs int[] := '{}';
  q jsonb;
begin
  if content is null then
    return idxs;
  end if;

  if jsonb_typeof(content->'questions') = 'array' then
    for q in select * from jsonb_array_elements(content->'questions')
    loop
      if q ? 'correctIndex' then
        idxs := idxs || array[(q->>'correctIndex')::int];
      end if;
    end loop;
  end if;

  if coalesce(array_length(idxs, 1), 0) = 0 and content ? 'correctIndex' then
    idxs := array[(content->>'correctIndex')::int];
  end if;

  return idxs;
end;
$$;

create or replace function public.check_quiz_answer(
  p_activity_id uuid,
  p_question_index int,
  p_selected_index int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  act public.activities%rowtype;
  idxs int[];
  correct int;
  q jsonb;
  explanation text;
  opt text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into act from public.activities where id = p_activity_id;
  if act.id is null then
    raise exception 'activity not found';
  end if;
  if act.is_published is not true
     and act.created_by is distinct from auth.uid()
     and not public.is_staff() then
    raise exception 'forbidden';
  end if;

  idxs := public._quiz_correct_indexes(act.content);

  if jsonb_typeof(act.content->'questions') = 'array'
     and p_question_index >= 0
     and p_question_index < jsonb_array_length(act.content->'questions') then
    q := act.content->'questions'->p_question_index;
    correct := coalesce((q->>'correctIndex')::int, -1);
  elsif coalesce(array_length(idxs, 1), 0) > 0
        and p_question_index >= 0
        and p_question_index < array_length(idxs, 1) then
    correct := idxs[p_question_index + 1];
    q := act.content;
  else
    raise exception 'invalid question index';
  end if;

  explanation := coalesce(q->>'explanation', '');
  opt := coalesce(q->'options'->>correct, '');

  return jsonb_build_object(
    'correct', p_selected_index = correct,
    'correctIndex', correct,
    'explanation', explanation,
    'correctOption', opt
  );
end;
$$;

revoke all on function public.check_quiz_answer(uuid, int, int) from public;
grant execute on function public.check_quiz_answer(uuid, int, int) to authenticated;

create or replace function public.complete_activity_attempt(
  p_attempt_id uuid,
  p_answer jsonb,
  p_feedback jsonb default null
)
returns public.activity_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  att public.activity_attempts%rowtype;
  act public.activities%rowtype;
  idxs int[];
  answers jsonb;
  i int;
  selected int;
  correct_count int := 0;
  total int := 0;
  computed_score int;
  result public.activity_attempts%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into att from public.activity_attempts where id = p_attempt_id;
  if att.id is null then
    raise exception 'attempt not found';
  end if;
  if att.user_id is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;
  if att.completed_at is not null then
    return att;
  end if;

  select * into act from public.activities where id = att.activity_id;
  if act.id is null then
    raise exception 'activity not found';
  end if;

  answers := p_answer->'answers';
  idxs := public._quiz_correct_indexes(act.content);

  if jsonb_typeof(answers) = 'array' and coalesce(array_length(idxs, 1), 0) > 0 then
    total := least(jsonb_array_length(answers), array_length(idxs, 1));
    for i in 0..total - 1 loop
      selected := (answers->>i)::int;
      if selected = idxs[i + 1] then
        correct_count := correct_count + 1;
      end if;
    end loop;
    if total > 0 then
      computed_score := round((correct_count::numeric / total::numeric) * 100);
    else
      computed_score := 0;
    end if;
  elsif act.type in ('writing', 'speaking') then
    computed_score := att.score;
  else
    computed_score := null;
  end if;

  perform set_config('app.allow_score_write', 'on', true);

  update public.activity_attempts
  set
    answer = coalesce(p_answer, '{}'::jsonb),
    feedback = coalesce(p_feedback, feedback),
    score = computed_score,
    completed_at = now()
  where id = p_attempt_id
  returning * into result;

  return result;
end;
$$;

revoke all on function public.complete_activity_attempt(uuid, jsonb, jsonb) from public;
grant execute on function public.complete_activity_attempt(uuid, jsonb, jsonb) to authenticated;

-- Service-role helper for edge functions to write speaking/writing scores
create or replace function public.set_attempt_score_service(
  p_attempt_id uuid,
  p_score int,
  p_answer jsonb default null,
  p_feedback jsonb default null
)
returns public.activity_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.activity_attempts%rowtype;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'forbidden';
  end if;

  perform set_config('app.allow_score_write', 'on', true);

  update public.activity_attempts
  set
    score = greatest(0, least(100, p_score)),
    answer = coalesce(p_answer, answer),
    feedback = coalesce(p_feedback, feedback),
    completed_at = coalesce(completed_at, now())
  where id = p_attempt_id
  returning * into result;

  return result;
end;
$$;

revoke all on function public.set_attempt_score_service(uuid, int, jsonb, jsonb) from public;

drop policy if exists "activities_delete_own_non_system" on public.activities;
create policy "activities_delete_own_non_system"
  on public.activities for delete
  using (
    created_by = auth.uid()
    and is_system = false
    and public.is_staff()
  );

-- ---------------------------------------------------------------------------
-- 4) Storage hardening
-- ---------------------------------------------------------------------------
drop policy if exists "activity_audio_teacher_write" on storage.objects;
create policy "activity_audio_teacher_write"
  on storage.objects for insert
  with check (
    bucket_id = 'activity-audio'
    and public.is_staff()
    and (storage.extension(name) in ('mp3', 'mpeg', 'wav', 'ogg', 'm4a'))
  );

drop policy if exists "activity_audio_teacher_update" on storage.objects;
create policy "activity_audio_teacher_update"
  on storage.objects for update
  using (
    bucket_id = 'activity-audio'
    and public.is_staff()
  );

drop policy if exists "activity_audio_teacher_delete" on storage.objects;
create policy "activity_audio_teacher_delete"
  on storage.objects for delete
  using (
    bucket_id = 'activity-audio'
    and public.is_staff()
  );
