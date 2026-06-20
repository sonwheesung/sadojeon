-- 0007 run_state — 범용 회차 도메인 블롭(domain별 1행 jsonb).
-- 전용 컬럼 테이블(jianghu_state·alchemy_state·items·inbox_items·run_npcs)이 필요 없는,
-- "스토어 데이터를 그대로 직렬화"하는 회차 도메인을 한 테이블에 담는다.
-- 사용처: codex(비급 도감)·quest(의뢰)·graduate(졸업 궤적)·activity(활동 파견)·reputation(평판)·
--         sectAtmosphere(사문 분위기)·eventHistory(강호 사건 이력)·outreach(사부 출행).
-- runSlices/blobSlices.ts 가 domain 키로 save/load. RLS = 소유자(user_id=auth.uid()).

create table if not exists public.run_state (
  run_id uuid not null references public.runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (run_id, domain)
);

alter table public.run_state enable row level security;

create policy run_state_owner on public.run_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists run_state_run_id_idx on public.run_state(run_id);
