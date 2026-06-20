// 전투 결과 배선 검증 — docs/37 R36 · Part D ①③(엔진 단독이 아니라 "결과를 호출측이 실제로 쓰는가").
// 기존 전투 시뮬(combat·combatmatrix·statusmatrix)은 전부 엔진 단독이라 흡공(drainedQi)·상처·EXP 같은
// 결과가 호출측에서 적용되는지 안 본다. 여기선 흡공(흡성대법류)을 실 엔진(real) + 실 헬퍼(absorbDrainedQi)로
// 굴려 ① 영구 내공 전환 ② 이종진기 심마 누적을 검증하고, 한 판당 흡수 규모를 측정한다(비율 튜닝용).
// 실행: node scripts/sim/_run.cjs scripts/sim/combatwiring.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { combatantFromDisciple } from '../../src/systems/combat';
import { simulateCombat } from '../../src/systems/combat/engine';
import {
  absorbDrainedQi,
  getSimma,
  DRAIN_INTERNAL_RATIO,
  DRAIN_SIMMA_RATIO,
} from '../../src/systems/simmaSystem';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple } from '../../src/types';
import type { Combatant } from '../../src/types/combat';

let pass = 0,
  fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`);
  }
}

// 흡성대법(drain)을 주력으로 든 제자 — 절정·내공 받침. combatantFromDisciple 이 traits(['drain'])를 해석.
function drainer(id: string, internal = 600): Disciple {
  return {
    id,
    name: id,
    status: 'training',
    relationships: {},
    realm: 'jeoljeong',
    darknessLevel: 2,
    simma: 0,
    stress: 0,
    trustToMaster: 30,
    realmProgress: { internal, pity: 0, petitioned: false },
    martialArts: [{ artId: 'heupseong-daebeop', seong: 9 }],
    mainMartialArtId: 'heupseong-daebeop',
    stats: {
      strength: { level: 55, exp: 0 },
      agility: { level: 55, exp: 0 },
      endurance: { level: 55, exp: 0 },
    },
  } as unknown as Disciple;
}

// 흡공할 내공(뒷심)이 있는 보통 상대(평이한 검수) — 직접 구성 Combatant.
function foe(id: string): Combatant {
  return {
    id,
    name: id,
    realm: 'iryu',
    arts: [{ school: 'sword', grade: 'apprentice', path: 'jeong', seong: 5, isMain: true }],
    internal: 300,
    strength: 35,
    agility: 35,
    endurance: 35,
    staminaFrac: 1,
    insight: 3,
    prudence: 50,
    mercy: 50,
    simma: 0,
  } as unknown as Combatant;
}

seedAmbient(778899);
console.log('═══ 전투 결과 배선 (흡공 R36) ═══\n');

// ── 1. 실전 흡공 → 영구 내공 전환 + 심마 누적 (R36 배선) ──
// 엔진이 drainedQi 보고 → 실 호출측 라인(if me?.drainedQi → absorbDrainedQi) 재현.
useDiscipleStore.getState().setAll([drainer('drn')]);
const beforeInternal = useDiscipleStore.getState().disciples['drn'].realmProgress.internal;
let totalDrained = 0,
  drainedFights = 0;
const FIGHTS = 300;
for (let i = 0; i < FIGHTS; i += 1) {
  const me0 = combatantFromDisciple(useDiscipleStore.getState().disciples['drn']);
  const r = simulateCombat([me0], [foe('foe')], { mode: 'real', lethal: false });
  const me = r.combatants.find((c) => c.id === 'drn');
  if (me?.drainedQi) {
    totalDrained += me.drainedQi;
    drainedFights += 1;
    absorbDrainedQi('drn', me.drainedQi); // ← 실 호출측(questSystem·raid·expedition) 라인 재현
  }
}
const after = useDiscipleStore.getState().disciples['drn'];
const gainedInternal = after.realmProgress.internal - beforeInternal;
ck('실전 흡공 → 엔진이 drainedQi 보고(드레인 주력)', drainedFights > 0, `${drainedFights}/${FIGHTS}판 흡공`);
ck('실전 흡공 → 영구 내공 증가(R36)', gainedInternal > 0, `internal +${Math.round(gainedInternal)}`);
ck('실전 흡공 → 심마 누적(이종진기 충돌, R36)', getSimma(after) > 0, `simma=${getSimma(after)}`);
ck(
  '내공 증가분 = 누적 흡수×비율(float 보존)',
  Math.abs(gainedInternal - totalDrained * DRAIN_INTERNAL_RATIO) < 0.01,
  `Δ${gainedInternal.toFixed(2)} = ${totalDrained}×${DRAIN_INTERNAL_RATIO}`,
);

// ── 2. 헬퍼 가드 — 0/음수/없는 제자 ──
useDiscipleStore.getState().setAll([drainer('g', 500)]);
const gi = useDiscipleStore.getState().disciples['g'].realmProgress.internal;
absorbDrainedQi('g', 0);
absorbDrainedQi('g', -5);
ck('흡수 0·음수 → 무변화(내공·심마)', useDiscipleStore.getState().disciples['g'].realmProgress.internal === gi && getSimma(useDiscipleStore.getState().disciples['g']) === 0);
let threw = false;
try {
  absorbDrainedQi('nobody', 50);
} catch {
  threw = true;
}
ck('없는 제자 흡수 → 크래시 없음', !threw);
absorbDrainedQi('g', 50);
const g2 = useDiscipleStore.getState().disciples['g'];
ck('흡수 50 → 내공 +20(×0.4)·심마 +15(×0.3)', Math.abs(g2.realmProgress.internal - (gi + 50 * DRAIN_INTERNAL_RATIO)) < 0.01 && getSimma(g2) === Math.round(50 * DRAIN_SIMMA_RATIO), `internal +${(g2.realmProgress.internal - gi).toFixed(1)}·simma ${getSimma(g2)}`);

// ── 3. 비-드레인 주력 → drainedQi 미보고(엔진은 drain 트레이트에만 흡공) ──
const plain: Combatant = foe('plain');
let plainDrain = 0;
for (let i = 0; i < 100; i += 1) {
  const r = simulateCombat([plain], [foe('foe2')], { mode: 'real', lethal: false });
  if (r.combatants.find((c) => c.id === 'plain')?.drainedQi) plainDrain += 1;
}
ck('비-드레인 주력 → drainedQi 미보고(흡공 없음)', plainDrain === 0, `${plainDrain}/100`);

// ── 측정(비율 튜닝용) ──
const avgDrainPerFight = drainedFights > 0 ? totalDrained / drainedFights : 0;
const avgInternalPerFight = avgDrainPerFight * DRAIN_INTERNAL_RATIO;
const avgSimmaPerFight = avgDrainPerFight * DRAIN_SIMMA_RATIO;
console.log(
  `\n[측정] 흡공 1판당 평균 흡수 ${avgDrainPerFight.toFixed(1)} → 영구 내공 +${avgInternalPerFight.toFixed(1)} · 심마 +${avgSimmaPerFight.toFixed(1)}`,
);
console.log(`[측정] 흡공 발생률 ${Math.round((drainedFights / FIGHTS) * 100)}% · 비율 internal ${DRAIN_INTERNAL_RATIO}·simma ${DRAIN_SIMMA_RATIO} · 측정일 2026-06-20 · seed 778899`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
