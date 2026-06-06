-- 회차별 네임드 NPC 상태 — docs/24. 강호 도감은 정적이 아니라 사문마다 살아 움직인다.
-- 회차 시작 시 카논 카탈로그(src/data/npcs)에서 시드 → 이벤트로 사망·교체·멸망(status).
-- 변동 잦아 전체 RunNpc 는 data(jsonb) 블롭, 조회·필터값만 컬럼.

create table if not exists public.run_npcs (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  npc_id      text not null,                 -- 카논 키 (cheonma·mumaengju …)
  faction     text not null,                 -- right|sapa|magyo|middle
  status      text not null default 'active', -- active | dead | fallen(문파 멸망)
  data        jsonb not null default '{}',   -- 전체 RunNpc (복원용)
  created_at  timestamptz not null default now()
);
create index if not exists run_npcs_run_idx on public.run_npcs (run_id);
create index if not exists run_npcs_faction_idx on public.run_npcs (run_id, faction);

alter table public.run_npcs enable row level security;

drop policy if exists run_npcs_owner on public.run_npcs;
create policy run_npcs_owner on public.run_npcs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
