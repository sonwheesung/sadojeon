-- 사도전 초기 스키마 (v1) — Supabase / Postgres
-- 실행: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣기 → Run
--       (또는 supabase CLI: supabase db push)
--
-- 설계 원칙:
--  · 유저 소유 데이터는 RLS 로 본인 것(user_id = auth.uid())만 CRUD.
--  · 공통 레퍼런스(common_*)는 모두 READ + 테스트 한정 전체 CRUD.
--    → 운영 배포 전 "TEST ONLY" 표시 정책을 SELECT 전용으로 교체.
--  · 변동 잦은 게임 상태는 JSONB 로 담아 스키마 변경 최소화.
--    조회·필터하는 값만 컬럼으로 승격.

-- ─── 공통 함수 ────────────────────────────────────────────────────────────────

-- updated_at 자동 갱신.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 회원가입 시 profiles 자동 생성 — 합성 이메일(`아이디@shidao.local`)의 아이디 부분을 username 으로.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ─── profiles (auth.users 1:1) ───────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  created_at  timestamptz not null default now()
);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 공통 레퍼런스: 제자 원본 (10명) ─────────────────────────────────────────
-- 운영=READ, 테스트=CRUD. 정적 콘텐츠 (현 src/data/disciples).

create table if not exists public.common_disciples (
  id              text primary key,            -- 'jangcheol' 등 안정 키
  name            text not null,
  hanja_name      text,
  star_rank       int  not null default 1,
  talents         jsonb not null default '{}', -- {body,qi,agility,insight,mind}
  hidden_talents  jsonb not null default '{}',
  personality     jsonb not null default '{}', -- {diligence,pride,loyalty,curiosity,empathy}
  bio             text,
  data            jsonb not null default '{}', -- 그 외 확장 필드
  created_at      timestamptz not null default now()
);

-- ─── runs (유저별 사문·회차 = 세이브 슬롯) ────────────────────────────────────

create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  slot        int  not null default 1,            -- 다중 세이브 슬롯
  status      text not null default 'active',     -- active | ended
  diamonds    int  not null default 0,            -- 재화(다이아) — 조회 위해 컬럼화
  game_time   jsonb not null default '{}',        -- {year,season,week,day,phase}
  master      jsonb not null default '{}',        -- 사부 스탯·나이·건강
  sect        jsonb not null default '{}',        -- 사문 분위기·금고·연구 등
  schedule    jsonb not null default '{}',        -- 주간 패턴·개인 패턴·일일 선택
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, slot)
);
create index if not exists runs_user_idx on public.runs (user_id);

drop trigger if exists set_runs_updated_at on public.runs;
create trigger set_runs_updated_at before update on public.runs
  for each row execute function public.set_updated_at();

-- ─── run_disciples (유저 사문의 제자 — 현재 스탯) ────────────────────────────

create table if not exists public.run_disciples (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,  -- RLS 위해 denormalize
  source_id   text references public.common_disciples (id), -- 원본 제자 (null = 영입 등)
  name        text not null,
  status      text not null default 'training',
  state       jsonb not null default '{}',  -- 스탯·체력·스트레스·무공·관계 등 전체
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists run_disciples_run_idx on public.run_disciples (run_id);
create index if not exists run_disciples_user_idx on public.run_disciples (user_id);

drop trigger if exists set_run_disciples_updated_at on public.run_disciples;
create trigger set_run_disciples_updated_at before update on public.run_disciples
  for each row execute function public.set_updated_at();

-- ─── growth_events (제자 성장 히스토리 — append-only) ─────────────────────────

create table if not exists public.growth_events (
  id            bigint generated always as identity primary key,
  run_disciple_id uuid not null references public.run_disciples (id) on delete cascade,
  run_id        uuid not null references public.runs (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  day           int,                         -- 게임 내 누적일
  kind          text not null,               -- 'levelup' | 'promotion' | 'collapse' ...
  detail        jsonb not null default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists growth_events_disciple_idx on public.growth_events (run_disciple_id);
create index if not exists growth_events_run_idx on public.growth_events (run_id);

-- ─── inbox_items (서신함) ─────────────────────────────────────────────────────

create table if not exists public.inbox_items (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.runs (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  kind            text not null,             -- event | one_liner | complaint | letter ...
  title           text not null,
  preview         text,
  body            text,
  priority        text not null default 'normal',
  payload         jsonb not null default '{}', -- 결정 데이터(templateId·discipleId·responses 등)
  created_at_day  int,                       -- 게임 내 발생일
  read            boolean not null default false,
  resolved        boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists inbox_run_idx on public.inbox_items (run_id);
create index if not exists inbox_user_idx on public.inbox_items (user_id);
create index if not exists inbox_unresolved_idx on public.inbox_items (run_id, resolved);

-- ─── quests (의뢰) ───────────────────────────────────────────────────────────

create table if not exists public.quests (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'open',  -- open | assigned | done | failed | expired
  payload     jsonb not null default '{}',   -- 제목·보상·난이도·배정 제자·기한 등
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists quests_run_idx on public.quests (run_id);

drop trigger if exists set_quests_updated_at on public.quests;
create trigger set_quests_updated_at before update on public.quests
  for each row execute function public.set_updated_at();

-- ─── items (물품·인벤토리) ───────────────────────────────────────────────────

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  category    text not null,                 -- elixir | pill | scroll | material | misc | trinket
  item_key    text not null,                 -- 카탈로그 키
  qty         int  not null default 1,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists items_run_idx on public.items (run_id);

-- ─── jianghu_state (강호 상황 — run 당 1행) ──────────────────────────────────

create table if not exists public.jianghu_state (
  run_id      uuid primary key references public.runs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  factions    jsonb not null default '{}',   -- 세력 정세
  events      jsonb not null default '[]',   -- 진행 중 사건
  updated_at  timestamptz not null default now()
);

drop trigger if exists set_jianghu_updated_at on public.jianghu_state;
create trigger set_jianghu_updated_at before update on public.jianghu_state
  for each row execute function public.set_updated_at();

-- ─── app_logs (로그 — 호출·오류 히스토리, 디버깅 증거) ───────────────────────

create table if not exists public.app_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users (id) on delete set null,
  run_id      uuid references public.runs (id) on delete set null,
  level       text not null default 'info',  -- debug | info | warn | error
  source      text,                          -- 'advanceTurn' | 'wishSystem' | 'llm' ...
  message     text,
  payload     jsonb not null default '{}',   -- 호출 인자·응답·스택 등
  created_at  timestamptz not null default now()
);
create index if not exists app_logs_user_idx on public.app_logs (user_id);
create index if not exists app_logs_run_idx on public.app_logs (run_id);
create index if not exists app_logs_level_idx on public.app_logs (level, created_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.common_disciples enable row level security;
alter table public.runs            enable row level security;
alter table public.run_disciples   enable row level security;
alter table public.growth_events   enable row level security;
alter table public.inbox_items     enable row level security;
alter table public.quests          enable row level security;
alter table public.items           enable row level security;
alter table public.jianghu_state   enable row level security;
alter table public.app_logs        enable row level security;

-- profiles — 본인 행만.
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- common_disciples — 읽기 전체 + 테스트 한정 전체 쓰기.
drop policy if exists common_disciples_read on public.common_disciples;
create policy common_disciples_read on public.common_disciples
  for select to authenticated using (true);
-- TEST ONLY: 운영 배포 전 이 정책을 삭제해 READ 전용으로 만든다.
drop policy if exists common_disciples_test_write on public.common_disciples;
create policy common_disciples_test_write on public.common_disciples
  for all to authenticated using (true) with check (true);

-- 유저 소유 테이블 공통 패턴 — user_id = auth.uid().
drop policy if exists runs_owner on public.runs;
create policy runs_owner on public.runs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists run_disciples_owner on public.run_disciples;
create policy run_disciples_owner on public.run_disciples
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists growth_events_owner on public.growth_events;
create policy growth_events_owner on public.growth_events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists inbox_owner on public.inbox_items;
create policy inbox_owner on public.inbox_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists quests_owner on public.quests;
create policy quests_owner on public.quests
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists items_owner on public.items;
create policy items_owner on public.items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists jianghu_owner on public.jianghu_state;
create policy jianghu_owner on public.jianghu_state
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- app_logs — 본인 로그 CRUD + 시스템 로그(user_id null) 읽기 허용.
drop policy if exists app_logs_owner on public.app_logs;
create policy app_logs_owner on public.app_logs
  for all to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid() or user_id is null);
