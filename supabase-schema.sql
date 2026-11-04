-- Run this in Supabase SQL Editor. Private single-user data row; RLS isolates each account.
create table if not exists public.lingo_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.lingo_user_state enable row level security;
drop policy if exists "Users can read own Lingo state" on public.lingo_user_state;
create policy "Users can read own Lingo state" on public.lingo_user_state for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own Lingo state" on public.lingo_user_state;
create policy "Users can insert own Lingo state" on public.lingo_user_state for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own Lingo state" on public.lingo_user_state;
create policy "Users can update own Lingo state" on public.lingo_user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
