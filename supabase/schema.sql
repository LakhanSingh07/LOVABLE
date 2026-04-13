create table if not exists public.canvas (
  room_id text primary key,
  strokes jsonb not null default '[]'::jsonb,
  partner_name text,
  message text,
  viewport jsonb,
  revision bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.canvas enable row level security;

drop policy if exists "allow anon canvas access for mvp" on public.canvas;

create policy "allow anon canvas access for mvp"
on public.canvas
for all
using (true)
with check (true);
