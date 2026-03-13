-- M2.1: Sounds table for audio layers
create table public.sounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  layer_type text not null check (layer_type in ('melody', 'background', 'rhythm', 'ambience')),
  file_url text not null,
  icon_name text not null,
  created_at timestamptz not null default now()
);

-- Sounds are global content, readable by all authenticated users
alter table public.sounds enable row level security;

create policy "Sounds are viewable by authenticated users"
  on public.sounds for select
  to authenticated
  using (true);
