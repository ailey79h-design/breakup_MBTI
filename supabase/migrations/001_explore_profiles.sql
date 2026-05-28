-- Supabase SQL Editor 또는 CLI로 실행
-- approximate location: location_grid = "lat,lng" (소수 2자리 권장)

create table if not exists public.explore_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 40),
  mbti_type text not null check (mbti_type ~ '^[EI][NS][TF][PJ]$'),
  location_grid text not null,
  instagram_handle text,
  created_at timestamptz not null default now()
);

create index if not exists explore_profiles_mbti_idx on public.explore_profiles (mbti_type);
create index if not exists explore_profiles_grid_idx on public.explore_profiles (location_grid);

alter table public.explore_profiles enable row level security;

-- 읽기: anon 허용 (탐색 API는 서버 service role 권장)
create policy "explore_profiles_read_anon"
  on public.explore_profiles for select
  to anon, authenticated
  using (true);
