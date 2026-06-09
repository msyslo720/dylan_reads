-- Run this entire file in the Supabase SQL Editor (SQL > New query > paste > Run)

-- Books
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  goal_type text not null check (goal_type in ('pages', 'chapters')),
  daily_goal integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reading log — one entry per school day
create table public.reading_log (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  book_id uuid not null references public.books(id) on delete restrict,
  amount_read integer not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- App settings (admin PIN, etc.)
create table public.settings (
  key text primary key,
  value text not null
);

-- Default PIN — change this after first login via the Admin page
insert into public.settings (key, value) values ('admin_pin', '1234');

-- Row Level Security — enabled but open to the anon key (family app, no user accounts)
alter table public.books enable row level security;
alter table public.reading_log enable row level security;
alter table public.settings enable row level security;

create policy "public_books_all" on public.books
  for all using (true) with check (true);

create policy "public_log_all" on public.reading_log
  for all using (true) with check (true);

create policy "public_settings_select" on public.settings
  for select using (true);

create policy "public_settings_update" on public.settings
  for update using (true);
