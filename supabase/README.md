# Supabase

사도전 백엔드 = Supabase(Postgres). 앱은 `@/lib/supabase` 단일 클라이언트로 접근.

## 마이그레이션 실행

DB에 직접 SQL을 실행하려면 (앱·anon key 로는 DDL 불가) **둘 중 하나**:

### A. 대시보드 (가장 빠름)
1. Supabase 대시보드 → **SQL Editor** → New query
2. `migrations/0001_init.sql` 전체 복사 → 붙여넣기 → **Run**

### B. Supabase CLI
```bash
supabase link --project-ref fkszwiftovxzdscgbdug   # DB 비밀번호 입력
supabase db push
```

## 인증 설정 (필수)
대시보드 → Authentication → Sign In/Providers → Email → **"Confirm email" OFF**.
아이디는 합성 이메일(`아이디@shidao.local`)로 매핑되어 확인 메일을 못 받으므로, 꺼야 가입 즉시 로그인됨.

## 스키마 (v1 — `0001_init.sql`)

| 테이블 | 소유 | 내용 |
|---|---|---|
| `profiles` | 본인 | auth.users 1:1, username(=아이디). 가입 시 트리거 자동 생성 |
| `common_disciples` | 공통(READ) | 제자 원본 10명. **테스트=CRUD / 운영=READ** |
| `runs` | 본인 | 사문·회차(세이브 슬롯). diamonds·game_time·master·sect·schedule |
| `run_disciples` | 본인 | 유저 사문의 제자 — 현재 스탯(state jsonb) |
| `growth_events` | 본인 | 제자 성장 히스토리 (append-only) |
| `inbox_items` | 본인 | 서신함 (kind·payload·read·resolved) |
| `quests` | 본인 | 의뢰 |
| `items` | 본인 | 물품·인벤토리 |
| `jianghu_state` | 본인 | 강호 상황 (run당 1행) |
| `app_logs` | 본인+시스템 | 호출·오류 로그 (디버깅 증거) |

- **RLS**: 유저 소유 테이블은 `user_id = auth.uid()` 본인 행만. `common_disciples` 는 읽기 전체 + **테스트 한정 전체 쓰기**(운영 전 `common_disciples_test_write` 정책 삭제로 READ 전용화).
- **JSONB 우선**: 변동 잦은 게임 상태는 jsonb 로 담아 스키마 변경 최소화. 조회·필터값(read/resolved/level/day/diamonds)만 컬럼.

## 회차 영속 (runSync)

`src/systems/runSync.ts` 는 **얇은 오케스트레이터** — 회차 핵심(회차 행 + 제자)만 직접 다루고, 자식 도메인은 `src/systems/runSlices/` 레지스트리를 순회만 한다.
- **핵심**: master·사문·시간·일정 → `runs`(JSONB), 제자 → `run_disciples`.
- **자식 슬라이스**(`RUN_CHILD_SLICES`): 서신함 `inbox_items` · 강호 `jianghu_state` · 물품 `items` · 네임드 NPC `run_npcs`. 각 슬라이스가 자기 저장/복원/리셋을 소유.
- **저장**(`saveCurrentRun`, 매 [진행]·새 회차): 핵심 저장 → 슬라이스 순회 save. 슬롯당 1회차 upsert.
- **복원**(`loadRun`, 사문 선택 → 이어 진행): 핵심 복원 → 슬라이스 순회 load.
- **새 회차**(`seedNewRun`)·**빈 슬롯 시작**: 슬라이스 순회 reset.
- 격리: 유저(`auth.uid()`) × 슬롯(사문). RLS 로 본인 것만.

> **도메인 추가 = 슬라이스 1개 + 레지스트리 한 줄.** `runSync`·화면 본문은 안 바뀜 (OCP). 데이터 접근은 `runsRepo` 뒤로 (DIP).

## 다음 단계
- 제자 상세 화면 placeholder(재능 고정값·스킬트리·의뢰기록) → 실제 데이터
- 도감(codex, 회차 누적)·사문 분위기·이벤트 이력 DB 동기화
- 서신함 read/resolved 즉시 저장(현재는 다음 [진행] 때 반영)
