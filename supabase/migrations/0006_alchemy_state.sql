-- 연단 상태 회차 동기화 — alchemy_state (docs/31, project_alchemy_economy)
-- 주의: 원격(운영) 프로젝트에는 2026-06-08 MCP apply_migration(version 20260608141312)으로 이미 적용됨.
-- 이 파일은 로컬/신규 환경 부트스트랩용 — 원격과 스키마 동일(멱등 if not exists).

create table if not exists public.alchemy_state (
  run_id uuid primary key references public.runs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  learned_recipes jsonb not null default '[]'::jsonb,
  active_crafts jsonb not null default '{}'::jsonb,
  first_crafted jsonb not null default '[]'::jsonb,
  lab_operational boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.alchemy_state enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policy where polname = 'alchemy_owner'
      and polrelid = 'public.alchemy_state'::regclass
  ) then
    create policy alchemy_owner on public.alchemy_state
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;
