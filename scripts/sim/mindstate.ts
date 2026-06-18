// 심마·흑화 극단 — docs/13·26·37. 게이지·확률이 극단 입력에서 클램프/경계를 지키는지.
// 심마 0~100·흑화 레벨 0~4·발작 확률 상한·내공 손실 비음수·점수 NaN 0. 실행: npx tsx scripts/sim/mindstate.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useSectAtmosphereStore } from '../../src/stores/sectAtmosphereStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { addSimma, getSimma, tickSimma, triggerQiDeviation, onForcedBreakthroughFail, SIMMA_ERUPT_THRESHOLD } from '../../src/systems/simmaSystem';
import { darknessScore, tickDarkness } from '../../src/systems/darknessSystem';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, PersonalityTraits, DarknessLevel } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
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

seedAmbient(24680);
console.log('═══ 심마·흑화 극단 ═══\n');

// ── 1. addSimma 극단 → [0,100] 정수 ──
useDiscipleStore.getState().setAll([disc('s')]);
addSimma('s', 99999);
ck('addSimma 거대 → 100 상한', getSimma(useDiscipleStore.getState().disciples['s']) === 100);
addSimma('s', -99999);
ck('addSimma 거대 음수 → 0 하한', getSimma(useDiscipleStore.getState().disciples['s']) === 0);
addSimma('s', 33.7);
ck('심마 항상 정수', Number.isInteger(useDiscipleStore.getState().disciples['s'].simma ?? 0));
addSimma('nobody', 50); // 없는 제자 — 크래시 X
ck('없는 제자 addSimma 무시', !useDiscipleStore.getState().disciples['nobody']);

// ── 2. darknessScore 극단 → [0,100] 유한 ──
const evil = disc('e', { mercy: 0, integrity: 0, ambition: 100 }, { darknessLevel: 4 });
const saint = disc('g', { mercy: 100, integrity: 100, ambition: 0 }, { darknessLevel: 0 });
const sEvil = darknessScore(evil, -99999);
const sSaint = darknessScore(saint, 99999);
ck('흑화점수 극악 → 100 유한', fin(sEvil) && sEvil === 100, `${sEvil}`);
ck('흑화점수 극선 → 하한 유한(≥0)', fin(sSaint) && sSaint >= 0 && sSaint <= 100, `${sSaint}`);
ck('흑화점수 항상 [0,100]', [darknessScore(evil, 0), darknessScore(saint, 0), darknessScore(disc('m'), -5)].every((x) => fin(x) && x >= 0 && x <= 100));

// ── 3. tickDarkness 다회 → 레벨 0~4 유지·상한 4·climbing 작동·risk 유효 ──
// 분위기는 ±10 스케일(ATMOSPHERE_MIN/MAX) → 무도 사문 righteousness=-10. 점수 78+ 위해 고스트레스 가세.
useTimeStore.getState().reset(); // totalDay=0 → day%7===0 → 레벨 굴림일(주1회 굴림 발화)
useSectAtmosphereStore.getState().set({ righteousness: -10, unity: -10 });
useDiscipleStore.getState().setAll([disc('d', { mercy: 0, integrity: 0, ambition: 100 }, { stress: 100 })]);
let levelOk = true; let riskOk = true;
const RISKS = new Set(['low', 'medium', 'high']);
for (let i = 0; i < 400; i += 1) {
  tickDarkness();
  const d = useDiscipleStore.getState().disciples['d'];
  if (!(Number.isInteger(d.darknessLevel) && d.darknessLevel >= 0 && d.darknessLevel <= 4)) levelOk = false;
  if (d.darknessRisk && !RISKS.has(d.darknessRisk)) riskOk = false;
}
const finalLevel = useDiscipleStore.getState().disciples['d'].darknessLevel;
ck('tickDarkness 400회 — 레벨 항상 0~4', levelOk, `최종 ${finalLevel}`);
ck('tickDarkness — risk 항상 유효값(low/medium/high)', riskOk);
ck('흑화 점수 78+면 레벨 상승 작동(정체 아님)', finalLevel > 0, `최종 ${finalLevel}`);
ck('흑화 레벨 4 초과 안 함(상한, 굴림일에도 4 유지)', finalLevel === 4);

// ── 4. 발작 확률 공식 상한 — 전 심마(0~100)서 일일 확률 ≤ 0.05 ──
let chanceOk = true;
for (let s = 0; s <= 100; s += 1) {
  const chance = Math.max(0, Math.min(1, (s - SIMMA_ERUPT_THRESHOLD) / 40)) * 0.05;
  if (!(fin(chance) && chance >= 0 && chance <= 0.05)) chanceOk = false;
}
ck('주화입마 일일 확률 항상 [0, 0.05]', chanceOk);

// ── 5. triggerQiDeviation → 내공 비음수·심마 방출·스트레스 클램프·severity 유효 ──
useDiscipleStore.getState().setAll([disc('q', {}, { simma: 100, stress: 95, realmProgress: { internal: 50, pity: 0, petitioned: false } })]);
const erupted = triggerQiDeviation('q');
const q = useDiscipleStore.getState().disciples['q'];
ck('발작 → 반환 true', erupted === true);
ck('발작 후 내공 비음수', (q.realmProgress?.internal ?? 0) >= 0);
ck('발작 후 심마 방출(<100)', (q.simma ?? 0) < 100);
ck('발작 후 스트레스 ≤100 클램프', (q.stress ?? 0) <= 100);
// 내공 0 제자 발작 → 손실 0(음수 안 됨)
useDiscipleStore.getState().setAll([disc('q0', {}, { simma: 100, realmProgress: { internal: 0, pity: 0, petitioned: false } })]);
triggerQiDeviation('q0');
ck('내공 0 발작 → 여전히 0(음수 X)', (useDiscipleStore.getState().disciples['q0'].realmProgress?.internal ?? 0) === 0);
ck('없는 제자 발작 → false(크래시 X)', triggerQiDeviation('nobody') === false);

// ── 6. tickSimma · 강행돌파 실패 — 심마 항상 [0,100] ──
useDiscipleStore.getState().setAll([disc('t', {}, { simma: 100, darknessLevel: 4, stress: 100 })]);
let simmaRangeOk = true;
for (let i = 0; i < 200; i += 1) {
  tickSimma();
  onForcedBreakthroughFail('t');
  const v = useDiscipleStore.getState().disciples['t']?.simma ?? 0;
  if (!(Number.isInteger(v) && v >= 0 && v <= 100)) simmaRangeOk = false;
}
ck('tickSimma·강행실패 200회 — 심마 항상 [0,100] 정수', simmaRangeOk);

console.log(`\n[정보] 심마 임계 ${SIMMA_ERUPT_THRESHOLD} · 흑화 최종레벨 ${finalLevel}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
