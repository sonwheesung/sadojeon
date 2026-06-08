---
name: balance-sim
description: Run headless 15-year growth/balance simulations for Shidao — verify 경지 도달(절정/초절정/화경), 의뢰 보상·성장·치사율, 영약 화경 경로, 제자 조합. Use when tuning growth numbers (외공/성/경지 게이트, 의뢰 보상·위험, 영약), when the user says "시뮬 돌려봐" / "밸런스 확인" / "제자 어떻게 크는지", or before/after changing trainingSystem·realm·questSystem·combatPower 수치.
---

# Balance Sim — 헤드리스 15년 양육 밸런스 시뮬

게임의 **순수 성장 공식**(trainingSystem·realm·martialArts·combatPower·questSystem)을 RN/스토어 없이 Node로 복제해, 수치를 바꿔가며 15년 양육 결과를 빠르게 검증한다. 실제 코드 수정 **전에** 레버를 시뮬로 맞추고, **후에** 회귀 검증한다.

## 왜 이게 필요한가
실제 게임은 Expo/RN/Zustand/AsyncStorage라 헤드리스 구동이 무겁다(스텁 다수 필요). 대신 핵심 공식·데이터를 순수 JS로 복제한 시뮬이 초 단위로 수천 회차를 돌려 밸런스 신호를 준다. **시뮬은 근사**(이벤트·정확한 스케줄·의뢰 풀 일부 생략)지만, 경지 천장·기둥 병목·치사율 같은 큰 그림은 신뢰할 만하다.

## 파일 (이 스킬 폴더)
**A. 공식 복제 시뮬(빠름, 근사)** — 밸런스 수치 튜닝용:
- `sim.cjs` — 난이도 정책 × 전 조합 집계 + 보상표 + 의뢰 성장(QK) + 영약 화경 경로 + 조합 상세.
- `sim_training.cjs` — 순수 수련 궤적. `sim_combos.cjs` — 조합별 의뢰 병행 상세.
- 실행: `node .claude/skills/balance-sim/sim.cjs`. (게임 공식을 손으로 복제 — 근사. 스케줄 가정·이벤트/LLM 미포함.)

**B. 실코드 헤드리스(진짜 게임 로직 + 실제 Supabase 영속)** — 이벤트·면담·사문이벤트가 *맞는 상황에 발동하고 규칙 해소가 도는지* + *실제 DB에 영속되는지* 검증:
- `headless.ts` — 실제 TS(`seedNewRun`+`autoPlayRun`)를 자동 랜덤 플레이로 N년 구동, 발동 이벤트+트리거 컨텍스트 로그.
  **실제 runSync 경로로 Supabase에 저장** — 전용 시뮬 계정 `simbot@shidao.app`(실유저 슬롯과 격리, slot 1)로 로그인(없으면 가입) 후, 연 단위 + 최종 저장 → DB 되읽기 검증까지.
- `run-headless.cjs` — `.env(.development)` 를 process.env 에 주입한 뒤 esbuild 번들(RN·AsyncStorage·expo-fs 스텁 + url-polyfill no-op + executorch external + `__DEV__` define) 후 Node 실행. **supabase·runSync 는 실번들(스텁 아님).**
- `_stubs/` — 헤드리스용 스텁. 실행: `node .claude/skills/balance-sim/run-headless.cjs [years]`.
- **고속 진행 쓰기증폭 차단:** 게임 내부 매일 autosave 는 `setAutoSaveEnabled(false)` 로 끄고 하네스가 연 단위로만 명시 저장. (앱은 기본 ON.)
- **플레이 정책 2종 (인자 `[growth|random|both]`, 기본 both):** `autoPlay` 가 `PlayPolicy` 주입식이라 갈아끼운다(in-app QA 는 항상 random).
  - **growth** (`growthPolicy.ts`, → slot 1): 주간패턴 무공3·체력2·휴식2 + 무공축 need기반(내공 미달→심법, 충족→초식) + 체력 기마자세(외공). 파견 X. **경지 성장이 실제 엔진으로 설계대로 되는지 검증.** 실코드 기준 절정/초절정/화경 도달성 = 공식 복제 sim.cjs(A) 와 교차검증.
  - **random** (→ slot 2): 전 선택 랜덤(이벤트·면담 발동 상황 QA). 일정·무공축 랜덤이라 심법 단련이 안 들어가 경지 게이트가 안 열리고 과훈련 injured 누적 → 15년에도 삼류 정체. "방치 플레이 → 삼류"의 베이스라인.
  - **관찰(2026-06-08 15년 both):** growth=4년차에 전원 졸업(장철 절정·나머지 일류, 13세) / random=16년차 삼류 정체. → **최적 플레이 시 절정 도달이 13세로 너무 빠르고 졸업이 일찍 끊긴다**(무공서 등급 천장+졸업 trust게이트). 양육기 길이(LIFETIME_YEARS=99 grayboxed)와 졸업 타이밍 재조정 후보.
- **한계: LLM(executorch) 미동작 → 규칙 폴백.** LLM 실제 출력은 **in-app 하네스**(`app/dev/autoplay`, 실기기)에서만.
- DB 확인: `select r.slot, r.game_time->'current', d.name, d.state->>'realm' from runs r join run_disciples d on d.run_id=r.id join auth.users u on u.id=r.user_id where u.email='simbot@shidao.app'` (Supabase MCP `execute_sql` 는 RLS 우회).

**C. in-app 자동플레이(실제 LLM)** — `app/dev/autoplay.tsx` + `src/systems/dev/autoPlay.ts`. 실기기에서 랜덤 진행 + 온디바이스 Qwen3 실제 호출, prompt/raw/effects 로그. "LLM 응답 정당성"은 여기서만 검증 가능.

## 어떤 시뮬을 돌려야 하나 (목적별)

| 묻고 싶은 것 | 돌릴 것 | 보는 값 |
|---|---|---|
| 제자가 15년에 어디까지 크나(경지 천장) | `sim_training.cjs` | 연차별 경지·외공·주력 성·전투력 |
| 무과금 절정/초절정/화경 도달되나 | `sim.cjs` 테스트 1&2 경지분포 + 테스트 3 | 경지분포(삼/이/일/절/초/화), 화경 % |
| 의뢰 보상이 난이도 비례하나 | `sim.cjs` 테스트 1 + 보상표 | 정책별 평균자금·명성, 등급별 단위보상 |
| 의뢰 보내면 성장하나(경지 잠식?) | `sim.cjs` 테스트 2(QK 스윕) | 의뢰 ON/OFF 외공·경지·성 비교 |
| 극험 치사율 적정한가 | `sim.cjs` FATAL 스윕 | 어려움 정책 회당 사망% |
| 영약으로 1명 화경(무과금 제련/드랍) | `sim.cjs` 테스트 3 | 제련 영약 수·화경 도달 % |
| 조합별로 어떻게 다른가(부상·사망·직업) | `sim_combos.cjs` | 조합별 제자 최종 상태 |

## 레버 (튜닝 대상 — `sim.cjs` 상단 const)
- `EXP_STAGE` 무공 성 적립(입문/소성/대성/극성). 높일수록 고성(7성↑) 도달 쉬움.
- `REXT` 경지별 외공(근력 Lv) 요구. **경지 진행의 주 병목.**
- `RINT`/`RSG`/`RSC` 내공 요구 / 성 게이트 / 성 상한.
- `BODY_EFF`+`BODY_AGE` 외공 효율(압축)·나이 보정(어릴 때↑). Part A.
- `FATAL` 재난→사망 확률. `QK` 결투·큰의뢰 외공 보강.
- `CRAFT_ALCHEMY_MIN` 영약 제련 임계. `ELIXIR_DROP` 극험 영약 드랍률.

각 레버 옆 주석에 **[출시값]/[화경경로 제안값]** 병기. 시뮬은 난수 시드가 없으니 **반복(8~30회) 평균**으로 읽을 것.

## 설계 목표 (확정 기준선)
- **무과금 최소 = 절정.** 헌신적 양육이면 누구나.
- **조합(검특화 + 외공 양육) = 초절정.**
- **화경 = 초절정 + 신품 무공서 7성(대성) + 신품 영약 복용.** 영약 = 의뢰 드랍(극험 <10%, 운) 또는 영약제조 특화 제자 제련. 영약이 환골탈태로 마지막 외공/깨달음 도약을 대신.
- **외공(근골)** = 어릴 때 단련(나이 보정), str특화 우위는 "안정성"으로. 의술·도가형(외공 상극)은 삼류 비전투 직업 천착.
- 관련 메모리: [[project_realm_balance]] · docs/23·27·28·29.

## 절차
1. **현 게임 수치 확인** — `realm.ts`·`martialArts/index.ts`(EXP_BASE_BY_STAGE)·`trainingSystem.ts`(BODY_*)·`questSystem.ts`(FATAL·QK·드랍) 값을 sim.cjs 레버와 일치시킨다(출시 상태 재현).
2. **베이스라인 실행** — `node sim.cjs`. 결과를 설계 목표와 대조.
3. **레버 조정** — 한 번에 한두 개. 반복 평균으로 효과 측정.
4. **목표 달성 시 실제 코드 반영** — sim 레버 → 게임 수치. `npx tsc --noEmit`.
5. **회귀 시뮬** — 출시값으로 sim 재실행해 사이드이펙트(전투력 인플레·하위경지 난이도) 점검.

## 주의
- 시뮬과 게임 공식이 어긋나면 시뮬을 먼저 게임에 맞춰라(시뮬이 진실 원천 아님). 공식 바뀌면 sim.cjs도 갱신.
- 성 적립(EXP_STAGE)·외공 요구(REXT)는 **전역 영향**(전투력→의뢰 capability→대회). 바꾸면 회귀 시뮬 필수.
- 시뮬은 캐릭터 효율/시작무공/빌드플랜을 하드코딩 — 캐릭터 추가·효율 변경 시 `CHARS`도 갱신.
