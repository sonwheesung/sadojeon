-- 0008 account_state — 회차를 넘어 누적되는 유저 단위 상태(user_id당 1행 jsonb).
-- 업적(unlocked)·해금 무공서(unlockedArts, 천마신공 등)·누적 집계(tally)·다이아.
-- 회차(runs)와 별개 — 재설치/기기 이전 시 영구 진행이 살아남게. systems/accountSync.ts 가
-- captureAccountState/commitAccountState 로 save/load. RLS = 소유자(user_id=auth.uid()).

create table if not exists public.account_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.account_state enable row level security;

create policy account_state_owner on public.account_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
