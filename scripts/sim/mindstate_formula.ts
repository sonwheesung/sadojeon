// 심마·흑화 계산식 골든값 회귀 — docs/13. "산수가 설계대로 정확한 값을 내는가"(경계 아님).
// 설계 정의(docs/13 §심마 누적원·발작·안신단):
//   · 고스트레스: (stress-50)×0.08  (50 초과분)
//   · 흑화 깊이: darknessLevel×0.5
//   · 마도(ma): 0.6 + seong×0.12   사도(sa): 0.3 + seong×0.05
//   · 상극 속성 흡수 중: +1.2
//   · 안정(stress<30 && 흡수 아님): -1.5
//   · 강행 폐관 돌파 실패: +14, 실전(의뢰) 돌파 실패: +6
//   · 발작 확률: clamp((simma-60)/40,0,1)×0.05  (임계 60)
//   · 발작 severity: 88+→2 / 72+→3 / else 4 · 흩어짐 0.22/0.14/0.07 · 안신단 -45
// 실행: node scripts/sim/_run.cjs scripts/sim/mindstate_formula.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import {
  addSimma, getSimma, tickSimma, triggerQiDeviation,
  onForcedBreakthroughFail, consumeAnsinElixir, SIMMA_ERUPT_THRESHOLD, eruptionChance,
} from '../../src/systems/simmaSystem';
import { darknessScore } from '../../src/systems/darknessSystem';
import { seedAmbient } from '../../src/systems/rng';
import { useItemStore } from '../../src/stores/itemStore';
import type { Disciple, PersonalityTraits } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const persona = (p: Partial<PersonalityTraits>): PersonalityTraits => ({
  integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50, ...p,
});
function disc(id: string, p: Partial<PersonalityTraits> = {}, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, darknessRisk: 'low', simma: 0, stress: 0, trustToMaster: 30,
    realmProgress: { internal: 0, pity: 0, petitioned: false }, personality: persona(p), ...over,
  } as unknown as Disciple;
}
const simmaOf = (id: string) => getSimma(useDiscipleStore.getState().disciples[id]);

seedAmbient(13579);
console.log('═══ 심마·흑화 계산식 골든값 ═══\n');

// ── 1. tickSimma 단일 누적원 골든값 (drift = round(0 + 항)) ──
// 고스트레스: stress=90 → (90-50)×0.08 = 3.2 → round = 3
useDiscipleStore.getState().setAll([disc('hs', {}, { stress: 90 })]);
tickSimma();
ck('고스트레스 stress90 → 누적 +3 (3.2 반올림)', simmaOf('hs') === 3, `${simmaOf('hs')}`);

// 흑화 깊이: level=4 → 4×0.5 = 2.0 → +2  (stress=40 이라 진정/고스트레스 둘 다 0)
useDiscipleStore.getState().setAll([disc('dk', {}, { stress: 40, darknessLevel: 4 })]);
tickSimma();
ck('흑화 level4 → 누적 +2 (4×0.5)', simmaOf('dk') === 2, `${simmaOf('dk')}`);

// 상극 흡수: +1.2, stress=40(진정 조건 미달) → round(1.2)=1
useDiscipleStore.getState().setAll([disc('ab', {}, {
  stress: 40, qiAttribute: 'fire', elixirAbsorb: { until: 999, perDay: 1, attribute: 'water' },
})]);
tickSimma();
ck('상극 흡수 → 누적 +1 (1.2 반올림)', simmaOf('ab') === 1, `${simmaOf('ab')}`);

// 안정(진정): stress=10(<30) & 흡수 아님 → -1.5. 시작 simma=10 → round(10-1.5)=round(8.5)=9(은행X, .5는 위로)
useDiscipleStore.getState().setAll([disc('cl', {}, { stress: 10, simma: 10 })]);
tickSimma();
ck('안정 → 진정 -1.5 (10→9, .5 올림)', simmaOf('cl') === 9, `${simmaOf('cl')}`);

// 복합: stress=100[(100-50)×0.08=4.0] + level2[1.0] + 흡수[1.2] = 6.2 → +6
useDiscipleStore.getState().setAll([disc('mix', {}, {
  stress: 100, darknessLevel: 2, qiAttribute: 'fire', elixirAbsorb: { until: 999, perDay: 1, attribute: 'metal' },
})]);
tickSimma();
ck('복합 고스트레스+흑화2+흡수 → +6 (6.2)', simmaOf('mix') === 6, `${simmaOf('mix')}`);

// ── 2. 강행/실전 돌파 실패 가산 골든값 ──
useDiscipleStore.getState().setAll([disc('bf', {}, { simma: 0 })]);
onForcedBreakthroughFail('bf'); // +14 (그 후 발작 굴림은 simma=14<40 이라 chance 0 → 발작 X)
ck('강행 폐관 돌파 실패 → +14', simmaOf('bf') === 14, `${simmaOf('bf')}`);
addSimma('bf', 6); // 실전(의뢰) 돌파 실패 가산은 trainingSystem 에서 addSimma(6)
ck('실전 돌파 실패 가산 +6 (누적 20)', simmaOf('bf') === 20, `${simmaOf('bf')}`);

// ── 3. 발작 확률 곡선 골든값 (선형, 임계 60 위, 상한 0.05) ──
const eruptChance = eruptionChance; // 엔진 함수 직접 호출(재구현 X·단일 소스)
ck('발작확률 simma=60 → 0 (임계서 0)', near(eruptChance(60), 0), `${eruptChance(60)}`);
ck('발작확률 simma=80 → 0.025 (절반)', near(eruptChance(80), 0.025), `${eruptChance(80)}`);
ck('발작확률 simma=100 → 0.05 (상한)', near(eruptChance(100), 0.05), `${eruptChance(100)}`);
ck('발작확률 simma=50 → 0 (임계 아래)', near(eruptChance(50), 0), `${eruptChance(50)}`);

// ── 4. 발작 효과 골든값 — severity·내공 흩어짐%·심마 방출·스트레스 ──
// severity 경계: 88+ →2, 72+ →3, else →4. 흩어짐 0.22/0.14/0.07.
// simma=90 → severity2, 흩어짐 0.22. internal=1000 → lost=round(220)=220, 남음 780.
useDiscipleStore.getState().setAll([disc('e2', {}, {
  simma: 90, stress: 50, realmProgress: { internal: 1000, pity: 0, petitioned: false },
})]);
triggerQiDeviation('e2');
{
  const d = useDiscipleStore.getState().disciples['e2'];
  ck('발작 severity2(simma90) 내공 22% 흩어짐 (1000→780)', (d.realmProgress?.internal ?? -1) === 780, `${d.realmProgress?.internal}`);
  ck('발작 후 심마 -40 방출 (90→50)', (d.simma ?? -1) === 50, `${d.simma}`);
  ck('발작 후 스트레스 +18 (50→68)', (d.stress ?? -1) === 68, `${d.stress}`);
}
// severity3 경계: simma=72 → 흩어짐 0.14. internal=1000 → lost=140, 남음 860.
useDiscipleStore.getState().setAll([disc('e3', {}, {
  simma: 72, stress: 0, realmProgress: { internal: 1000, pity: 0, petitioned: false },
})]);
triggerQiDeviation('e3');
ck('발작 severity3 경계(simma72) 흩어짐 14% (1000→860)', (useDiscipleStore.getState().disciples['e3'].realmProgress?.internal ?? -1) === 860);
// severity4: simma=71 → 흩어짐 0.07. internal=1000 → lost=70, 남음 930.
useDiscipleStore.getState().setAll([disc('e4', {}, {
  simma: 71, stress: 0, realmProgress: { internal: 1000, pity: 0, petitioned: false },
})]);
triggerQiDeviation('e4');
ck('발작 severity4(simma71) 흩어짐 7% (1000→930)', (useDiscipleStore.getState().disciples['e4'].realmProgress?.internal ?? -1) === 930);

// ── 5. 안신단 — 심마 -45 ──
useItemStore.getState().add({ id: 'ansin', category: 'elixir', name: '안신단', grade: 3, count: 1, effects: '' } as never);
useDiscipleStore.getState().setAll([disc('an', {}, { simma: 80 })]);
const ok = consumeAnsinElixir('an');
ck('안신단 복용 성공', ok === true);
ck('안신단 → 심마 -45 (80→35)', simmaOf('an') === 35, `${simmaOf('an')}`);

// ── 6. 흑화 점수 골든값 (darknessScore 가중치 — 구현 정의 기준선 고정) ──
// s = stress×0.35 + max(0,40-mercy)×0.6 + max(0,45-integrity)×0.4 + max(0,-righ)×1.2
//     + level×8 + max(0,ambition-70)×0.3  (+ 마공 항)
// 골든: stress=100,mercy=0,integrity=0,righ=0,level=0,ambition=50
//   = 35 + 24 + 18 + 0 + 0 + 0 = 77 → round 77
{
  const d = disc('s1', { mercy: 0, integrity: 0, ambition: 50 }, { stress: 100, darknessLevel: 0 });
  ck('흑화점수 골든 (35+24+18=77)', darknessScore(d, 0) === 77, `${darknessScore(d, 0)}`);
}
// 골든: 무도 사문 righ=-10 추가 → +12. level1 → +8. ambition=100 → (100-70)×0.3=9.
//   stress=0,mercy=50,integrity=50 → 0+0+0. = 12 + 8 + 9 = 29
{
  const d = disc('s2', { mercy: 50, integrity: 50, ambition: 100 }, { stress: 0, darknessLevel: 1 });
  ck('흑화점수 골든 무도-10+level1+야망100 (12+8+9=29)', darknessScore(d, -10) === 29, `${darknessScore(d, -10)}`);
}

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
