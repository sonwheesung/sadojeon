---
name: test
description: Run Shidao's full test gauntlet across all 4 tiers (engine-unit sims, screen-unit jest, integration, meta testguard) and judge results against statistical bands. Use when the user says "테스트 돌려" / "전체 테스트" / "회귀 검증" / "test", after changing any engine·system·screen·data, or before a commit that touches logic/numbers. For balance-only growth sims use balance-sim; for security use security-audit.
---

# Test — 사도전 전 계층 회귀 게이트

`docs/40_테스트_전략.md`(인덱스)의 4계층을 한 번에 돌리고 결과를 밴드에 비교해 판정한다. **숫자를 만진 커밋은 반드시 동반 실행**([시뮬 통계 3룰](../../../docs/42_통계회귀_오차범위.md)).

## 4계층 (정본 docs/40 §0)
1. **엔진 단위** — 순수 로직·계산식·계약. `scripts/sim/*`. 카탈로그·밴드 = docs/36.
2. **화면 단위** — 컴포넌트·훅. `npm test`. 작성법 = docs/41.
3. **통합** — 엔진 조합 + 전 과정 양육(헤드리스) + 화면 플로우. runbook = docs/40 §3.
4. **메타** — testguard(테스트 스위트 자체 사각). docs/37 Part E.

## 한 방 실행 (전 계층 회귀 — docs/40 §2)
```
npx tsc --noEmit                                   # 타입 0
# 엔진 단위(빠름)
for s in growth_formula combat_formula alchemy_formula mindstate_formula mindstate relations achievements graduationwill dataintegrity rng numextremes korean world integration testguard arttree; do npx tsx scripts/sim/$s.ts; done
# 엔진 단위(esbuild 필요)
for s in combat quests quest_formula extremerisk activities woundstack combatwiring gamestate alchemy questboard; do node scripts/sim/_run.cjs scripts/sim/$s.ts; done
# 화면 단위
npm test
# 통합(전 과정)
node .claude/skills/balance-sim/run-headless.cjs factorysweep 15 30
# 메타
npx tsx scripts/sim/testguard.ts
```
> Windows: PowerShell이면 `for` 대신 `foreach ($s in 'a','b') { npx tsx scripts/sim/$s.ts }`, 또는 Bash 도구로 위 그대로.

## 부분 실행 (영향 계층만 — docs/42 §3 매핑)
무엇을 만졌나 → 무엇을 도나:
- 성장·경지 → `growth_formula` + headless `factorysweep`·`moderatesweep`
- 전투 수치·결과필드·특성 → `combat`·`combatmatrix` + **`testguard`** + **`combatwiring`**
- 의뢰·정세 → `questmatrix`·`questboard`·`world`
- 연단·경제 → `alchemy`·`economysweep`
- 심마·관계 → `mindstate`·`relations`
- 화면 → `npm test`(+ docs/41)

## 판정 (PASS/WARN)
- 끝줄 `결과: N PASS · 0 FAIL`(또는 전투 "전부 기대 범위 안"·정세/게시판 "전 계약 PASS ✓") 확인.
- 수치가 밴드를 벗어나면 → `npx tsx scripts/sim/statcheck.ts <id> <측정값>`으로 **편차 정량** → 의도면 docs/36 + `scripts/sim/statbaseline.json` 갱신, 아니면 **회귀**(원인 추적, docs/42).
- 전체 베이스라인: `npx tsx scripts/sim/statcheck.ts` (인자 없이).

## FAIL 시
그 시뮬이 가리키는 docs/37 계약(Part B)·버그(Part A)를 펴 회귀 원인 시스템 특정. 새 버그면 docs/37 Part A 등재(증상/원인/수정/재검증 + 사각 카테고리) + 사각 닫는 케이스 추가.

## 새 시스템·콘텐츠 추가 시
docs/43 사냥 5렌즈(시간차·자원경합·생애경계·의미정합·id충돌) 루틴 + 업적화 점검(docs/32).
