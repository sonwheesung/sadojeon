---
name: test
description: Run Shidao's FULL test gauntlet (= "전체 테스트 진행" / "모든 테스트 돌려" / "전체 검증" / "회귀 검증" / "run all tests" / "테스트 돌려"). 4 tiers — engine-unit sims, screen-unit jest, integration, meta testguard — driven by docs/40 §2 as the single source of truth, judged against bands, reported as a verdict table. Also self-heals: new guards found during the run get registered AND added to docs/40 §2 so they never slip next time. Use after changing any engine·system·screen·data, or before a commit that touches logic/numbers. For balance-only growth sims use balance-sim; for security use security-audit.
---

# Test — 사도전 전 계층 회귀 게이트 (run-all-tests)

**단일 기준 = `docs/40_테스트_전략.md` §2 "한 방 실행".** 이 스킬은 그 루틴을 *실행·판정·자가치유*하는 절차다. **명령 목록을 이 파일에 베껴두지 않는다** — 베끼면 드리프트해서 가드가 누락된다(과거 `onelinerhistory`·`_ev_*`류 사고). 매번 docs/40 §2를 **읽어서** 거기 적힌 그대로 돈다.

## 0. 4계층 (정본 docs/40 §0)
1. **엔진 단위** — 순수 로직·계산식·계약. `scripts/sim/*`(tsx 빠른 + `_run.cjs` esbuild). 카탈로그·밴드 = docs/36·37.
2. **화면 단위** — 컴포넌트·훅·시스템 단위. `npm test`(jest). 작성법 = docs/41.
3. **통합** — 엔진 조합 + 전 과정 양육(헤드리스) + 화면 플로우. runbook = docs/40 §3.
4. **메타** — testguard(테스트 스위트 자체 사각). docs/37 Part E.

## 1. 실행 전 — 가드 커버리지 감사 (드리프트·누락 차단) ⚠ 핵심

루틴을 돌리기 **전에**, docs/40 §2가 실재 가드를 전부 덮는지 1분 점검(이 단계가 "_ev_* 가 루틴에서 빠졌던 사고"를 막는다):

1. `docs/40_테스트_전략.md` §2의 실행 블록을 Read 로 가져온다(권위 목록).
2. `Glob scripts/sim/*.ts` 로 실재 sim 전부 나열.
3. testguard 가 **가드로 분류**(진단·인프라 allowlist 밖)하는 sim 이 docs/40 §2 루프(tsx/`_run.cjs`)에 **전부 들어있나** 대조. 누락이 있으면 = **사고**: 그 가드를 docs/40 §2에 추가하고(자가치유) 그 사실을 보고에 명시한 뒤 진행.
4. (참고) testguard 자체도 "가드인데 process.exit·단언 없음"을 잡지만, 그건 *형식*만 본다. 이 감사는 "*루틴이 그 가드를 실제로 부르나*"라는 누락을 본다 — 둘은 다른 사각.

## 2. 실행 (docs/40 §2 그대로)

docs/40 §2의 블록을 순서대로 — tsc → 엔진단위(tsx loop) → 엔진단위(`_run.cjs` loop) → `npm test` → 통합(`factorysweep`) → testguard. Bash 도구로 `for s in …; do …; done` 그대로 실행(각 sim 끝 결과줄만 grep 해 표 만들기 권장: `… 2>&1 | grep -E "결과:|기대 범위|전 계약|FAIL" | tail -2`).

- 시간: tsx loop 빠름, `_run.cjs` loop·`npm test`·`factorysweep`는 길다 → 길면 `run_in_background`/Monitor 로. **동시 과부하 주의**: jest 39스위트 + 헤드리스를 함께 돌리면 RNTL 비동기 렌더가 타임아웃 플레이크 날 수 있다(부하성, 단독 재실행으로 확인 — 회귀 아님).

## 3. 판정 (PASS/WARN/FAIL) — 판정 표로 보고

각 계층 결과를 **표 한 장**으로:

| 계층 | 명령 | 결과 |
|---|---|---|
| 타입 | tsc | 0 |
| 엔진(tsx) | 각 sim | `N PASS · 0 FAIL` 모음 |
| 엔진(esbuild) | 각 sim | 〃 |
| 화면 | npm test | `Tests: N passed` |
| 통합 | factorysweep | 분포·크래시0 |
| 메타 | testguard | `N PASS · 0 FAIL` |

- 끝줄 `결과: N PASS · 0 FAIL`(또는 전투 "전부 기대 범위 안"·정세/게시판 "전 계약 PASS ✓") 확인.
- 수치가 밴드를 벗어나면 → `npx tsx scripts/sim/statcheck.ts <id> <측정값>`으로 **편차 정량** → 의도면 docs/36 + `scripts/sim/statbaseline.json` 갱신, 아니면 **회귀**(docs/42).
- 전체 베이스라인: `npx tsx scripts/sim/statcheck.ts`(인자 없이).

## 4. 돌리는 중 새 케이스가 나오면 — 반드시 문서화 (자가치유)

이 스킬의 절반은 *문서화*다. 컴팩트로 잊지 말 것([[feedback_test_blindspot_analysis]]).

**(A) 기존 테스트가 깨졌다 = 버그 발견** → docs/37 에 3종 등재:
1. **현재 오류** (Part A): 증상 / 원인 / 수정 / 재검증.
2. **사각 분석** (Part D): "왜 기존 테스트가 못 잡았나"(사각 카테고리 번호). 시뮬 PASS인데 실기기 버그면 거짓 확신.
3. **형제 사냥** (docs/43 5렌즈 + Part D "미발견 후보"): 같은 근본원인의 다른 시스템을 같이 점검·등재. 사각 닫는 케이스를 **추가해야 "✅ 수정"**.

**(B) 새 가드를 만들었다** → 새 거나 안 새게 3종:
1. **A/B 자가검증**: 깬 입력엔 반드시 FAIL, 클린엔 0(허위 오라클 차단). selfTest 패턴(fuzz·testguard 참고).
2. **케이스 등록**: 계약은 docs/37 Part B(계약)·Part C(엣지), 사냥 기법은 docs/43, 메타는 docs/37 Part E.
3. **루틴에 명령 추가** = docs/40 §2의 해당 loop 에 그 sim 을 넣는다. **이게 자가치유** — 다음 전체 테스트에서 자동으로 돈다. (안 넣으면 §1 감사가 다음번에 잡지만, 만든 그 자리에서 넣는 게 정석.) jest 단위면 파일만 만들면 `npm test`가 자동 수집.

## 5. 부분 실행 (영향 계층만 — docs/42 §3 매핑)
숫자·로직·화면을 만진 턴은 최소 영향 계층은 돌린다(전체가 무거우면):
- 성장·경지 → `growth_formula` + headless `factorysweep`
- 전투 수치·결과필드·특성 → `combat`·`combatmatrix` + `testguard` + `combatwiring`
- 의뢰·정세 → `quests`·`questboard`·`world`
- 연단·경제 → `alchemy`·`economysweep`
- 심마·관계 → `mindstate`·`relations`
- 한 마디·대사 → `oneliner` + `_run.cjs onelinerhistory`(분포 가드) + `npm test src/systems/oneLinerSystem.test.ts`
- 화면 → `npm test`(+ docs/41)

## 6. 새 시스템·콘텐츠 추가 시
docs/43 사냥 5렌즈(시간차·자원경합·생애경계·의미정합·id충돌) 루틴 + 업적화 점검(docs/32) + 위 §4(B)로 가드 신설·등록·루틴 추가.

> 범용 버전은 `C:\project\common\.claude\skills\test` 에도 둔다([[feedback_claude_assets_common_sync]]) — 거기선 "단일 기준 문서"를 프로젝트의 검증 루틴 문서(README/docs)로 일반화.
