-- 서버 권위 마이그레이션 — docs/31 Phase 2. **클라 재배선(컷오버) 시점에 적용**.
-- ⚠️ 지금 적용하면 현재 앱의 직접 저장(runSync)이 깨진다 — 앱이 Vercel 함수 경유로 바뀐 뒤에만.
-- 적용: Supabase SQL editor 또는 supabase MCP apply_migration.

-- 1) runs.state — 회차 전체 상태(GameState) 단일 JSONB. (레거시 분산 컬럼 대체)
alter table public.runs add column if not exists state jsonb;

-- 2) run_secrets — 시드/턴 카운터. **유저 SELECT 정책 없음 = 비공개**(service-role만). 세이브 스커밍 봉쇄.
create table if not exists public.run_secrets (
  run_id    uuid primary key references public.runs(id) on delete cascade,
  rng_state bigint  not null default 0,
  turn      integer not null default 0
);
alter table public.run_secrets enable row level security;
-- (정책을 만들지 않는다 → 인증 유저도 SELECT/쓰기 불가. service-role(Vercel)만 RLS 우회로 접근.)

-- 3) RLS 뒤집기 — 게임 테이블을 유저 **SELECT 전용**으로. 모든 쓰기는 service-role(Vercel 함수).
--    기존 owner(ALL) 정책 → read(SELECT) 정책으로 교체.
drop policy if exists runs_owner on public.runs;
create policy runs_read on public.runs for select using (user_id = auth.uid());

drop policy if exists run_disciples_owner on public.run_disciples;
create policy run_disciples_read on public.run_disciples for select using (user_id = auth.uid());

-- 나머지 회차 테이블도 동일 패턴(소유 컬럼명에 맞춰 조정).
-- alchemy_state · jianghu_state · inbox_items · run_npcs · items · quests · growth_events:
--   drop policy <...>_owner; create policy <...>_read for select using (user_id = auth.uid());
-- (각 테이블 소유 정책명·컬럼 확인 후 일괄. profiles 는 유저 본인 SELECT 유지.)

-- 4) 🚨 보안 핫픽스 — 인증된 누구나 공용 제자 마스터 전체 쓰기 가능한 테스트 정책 제거.
--    (전환과 무관하게 즉시 필요. 현 앱은 common_disciples 를 평시 쓰지 않으므로 제거해도 무해.)
drop policy if exists common_disciples_test_write on public.common_disciples;
-- 읽기(common_disciples_read, SELECT using(true))는 유지 — 공용 마스터는 모두가 읽어야.
