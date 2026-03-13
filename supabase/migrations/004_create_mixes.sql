create table public.mixes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  layers jsonb not null, -- [{sound_id, volume}]
  icon_name text not null,
  color_from text not null,
  color_to text not null,
  created_at timestamptz not null default now()
);
alter table public.mixes enable row level security;
create policy "Mixes are viewable by authenticated users"
  on public.mixes for select to authenticated using (true);
