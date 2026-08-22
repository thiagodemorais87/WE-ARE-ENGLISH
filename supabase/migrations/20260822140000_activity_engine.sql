-- WE ARE ENGLISH — Activity Engine schema
-- Project: ymigkdprtfsxdpbunvup

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Voices catalog (ElevenLabs etc.)
create table if not exists public.voices (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'elevenlabs',
  voice_id text not null,
  name text not null,
  accent text,
  default_model_id text not null default 'eleven_multilingual_v2',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists voices_provider_voice_id_idx
  on public.voices (provider, voice_id);

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  type text not null check (type in (
    'listening', 'speaking', 'pronunciation', 'writing', 'reading',
    'multiple_choice', 'fill_blank', 'word_order', 'matching', 'true_false',
    'vocabulary', 'grammar',
    'music', 'video', 'game'
  )),
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  instructions text not null default '',
  content jsonb not null default '{}'::jsonb,
  audio_url text,
  image_url text,
  duration integer not null default 10,
  points integer not null default 10,
  is_published boolean not null default false,
  is_system boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  audio_voice_id text,
  audio_model_id text,
  voice_name text,
  accent text,
  speed numeric(3,2) default 1.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_type_level_idx on public.activities (type, level);
create index if not exists activities_published_idx on public.activities (is_published);
create index if not exists activities_created_by_idx on public.activities (created_by);

-- Attempts
create table if not exists public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  answer jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  feedback jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists activity_attempts_user_idx on public.activity_attempts (user_id);
create index if not exists activity_attempts_activity_idx on public.activity_attempts (activity_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
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
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.voices enable row level security;

-- Profiles policies
create policy "profiles_select_own_or_teacher"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Activities policies
create policy "activities_select_published_or_own_or_teacher"
  on public.activities for select
  using (
    is_published = true
    or created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "activities_insert_teacher"
  on public.activities for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
    and created_by = auth.uid()
    and is_system = false
  );

create policy "activities_update_own_non_system"
  on public.activities for update
  using (
    created_by = auth.uid()
    and is_system = false
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "activities_delete_own_non_system"
  on public.activities for delete
  using (
    created_by = auth.uid()
    and is_system = false
  );

-- Attempts policies
create policy "attempts_select_own_or_teacher"
  on public.activity_attempts for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "attempts_insert_own"
  on public.activity_attempts for insert
  with check (user_id = auth.uid());

create policy "attempts_update_own"
  on public.activity_attempts for update
  using (user_id = auth.uid());

-- Voices: readable by authenticated
create policy "voices_select_authenticated"
  on public.voices for select
  to authenticated
  using (is_active = true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('activity-audio', 'activity-audio', true)
on conflict (id) do nothing;

create policy "activity_audio_public_read"
  on storage.objects for select
  using (bucket_id = 'activity-audio');

create policy "activity_audio_teacher_write"
  on storage.objects for insert
  with check (
    bucket_id = 'activity-audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "activity_audio_teacher_update"
  on storage.objects for update
  using (
    bucket_id = 'activity-audio'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

-- Seed default voices
insert into public.voices (provider, voice_id, name, accent, default_model_id)
values
  ('elevenlabs', 'EXAVITQu4vr4xnSDxMaL', 'American English Female', 'american', 'eleven_multilingual_v2'),
  ('elevenlabs', 'VR6AewLTigWG4xSOukaG', 'American English Male', 'american', 'eleven_multilingual_v2'),
  ('elevenlabs', 'ThT5KcBeYPX3keUQqHPh', 'British English Female', 'british', 'eleven_multilingual_v2'),
  ('elevenlabs', 'onwK4e9ZLuTAKqWW03F9', 'British English Male', 'british', 'eleven_multilingual_v2')
on conflict do nothing;
