-- 001 + 002 combined: explore profiles + auth user link

create table if not exists public.explore_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  mbti_type text not null check (mbti_type ~ '^[EI][NS][TF][PJ]$'),
  location_grid text not null,
  instagram_handle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists explore_profiles_mbti_idx on public.explore_profiles (mbti_type);
create index if not exists explore_profiles_grid_idx on public.explore_profiles (location_grid);
create index if not exists explore_profiles_user_id_idx on public.explore_profiles (user_id);

alter table public.explore_profiles enable row level security;

drop policy if exists "explore_profiles_read_anon" on public.explore_profiles;
drop policy if exists "explore_profiles_read_all" on public.explore_profiles;
drop policy if exists "explore_profiles_insert_own" on public.explore_profiles;
drop policy if exists "explore_profiles_update_own" on public.explore_profiles;
drop policy if exists "explore_profiles_delete_own" on public.explore_profiles;

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
