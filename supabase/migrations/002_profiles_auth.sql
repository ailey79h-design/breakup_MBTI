-- Run after 001. Links profiles to Supabase Auth users.

alter table public.explore_profiles
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists explore_profiles_user_id_idx on public.explore_profiles (user_id);

drop policy if exists "explore_profiles_read_anon" on public.explore_profiles;

create policy "explore_profiles_read_all"
  on public.explore_profiles for select
  to anon, authenticated
  using (true);

create policy "explore_profiles_insert_own"
  on public.explore_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "explore_profiles_update_own"
  on public.explore_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "explore_profiles_delete_own"
  on public.explore_profiles for delete
  to authenticated
  using (auth.uid() = user_id);
