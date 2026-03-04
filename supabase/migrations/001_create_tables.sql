-- ============================================================
-- BabyLull: Initial schema
-- Tables: profiles, babies, baby_preferences
-- RLS enabled on all tables
-- Trigger: auto-create profile on auth.users signup
-- ============================================================

-- 1. PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. BABIES
create table public.babies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.babies enable row level security;

create policy "Users can read own babies"
  on public.babies for select
  using (auth.uid() = profile_id);

create policy "Users can insert own babies"
  on public.babies for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own babies"
  on public.babies for update
  using (auth.uid() = profile_id);

create policy "Users can delete own babies"
  on public.babies for delete
  using (auth.uid() = profile_id);

-- 3. BABY PREFERENCES
create table public.baby_preferences (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade unique,
  sleep_challenges text[] not null default '{}',
  sound_preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.baby_preferences enable row level security;

create policy "Users can read own baby preferences"
  on public.baby_preferences for select
  using (
    exists (
      select 1 from public.babies
      where babies.id = baby_preferences.baby_id
        and babies.profile_id = auth.uid()
    )
  );

create policy "Users can insert own baby preferences"
  on public.baby_preferences for insert
  with check (
    exists (
      select 1 from public.babies
      where babies.id = baby_preferences.baby_id
        and babies.profile_id = auth.uid()
    )
  );

create policy "Users can update own baby preferences"
  on public.baby_preferences for update
  using (
    exists (
      select 1 from public.babies
      where babies.id = baby_preferences.baby_id
        and babies.profile_id = auth.uid()
    )
  );

create policy "Users can delete own baby preferences"
  on public.baby_preferences for delete
  using (
    exists (
      select 1 from public.babies
      where babies.id = baby_preferences.baby_id
        and babies.profile_id = auth.uid()
    )
  );

-- 4. AUTO-CREATE PROFILE ON SIGNUP (trigger on auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. UPDATED_AT AUTO-TOUCH
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger babies_updated_at
  before update on public.babies
  for each row execute function public.set_updated_at();

create trigger baby_preferences_updated_at
  before update on public.baby_preferences
  for each row execute function public.set_updated_at();
