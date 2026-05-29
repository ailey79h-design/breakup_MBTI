-- Supabase SQL Editor에 붙여넣고 Run (한 번만 실행)
-- explore_profiles: gender, age_range, GPS, 탐색 설정 컬럼 추가

alter table public.explore_profiles
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists gender text check (gender is null or gender in ('female', 'male', 'other', 'prefer_not')),
  add column if not exists age_range text check (age_range is null or age_range in ('10s', '20s', '30s', '40s', '50plus')),
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists is_hidden boolean not null default false,
  add column if not exists discover_enabled boolean not null default true;

create index if not exists explore_profiles_user_id_idx on public.explore_profiles (user_id);

create index if not exists explore_profiles_discover_idx
  on public.explore_profiles (discover_enabled, is_hidden)
  where discover_enabled = true and is_hidden = false;
