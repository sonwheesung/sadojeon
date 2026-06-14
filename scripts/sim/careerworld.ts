// 졸업 제자 ⇄ 강호 정세 — docs/37 §B4. 실행: npx tsx scripts/sim/careerworld.ts
// 실제 정세 엔진 1만 회차를 돌리며, 매 계절 각 세력의 정세 압력(blocPressure)을 집계 →
// 졸업 제자(노선)가 정세에 어떻게 영향받나: 자기 세력 전쟁 시 사망 위험↑, 융성 시 출세↑.
// careerSystem.tickCareers 의 보정 공식과 동일한 pure 함수(blocPressure)를 측정.

import { seedWorldState, tickWorldState, blocPressure } from '../../src/systems/worldSystem';
import { BLOC_LABEL } from '../../src/data/worldPowers';
import { ROUTE_BLOC, ROUTE_DANGER } from '../../src/data/careers';
import type { RouteId } from '../../src/data/careers';
import type { WorldBloc } from '../../src/types/world';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const RUNS = 10000;
const SEASONS = 60;
const BLOCS: WorldBloc[] = ['orthodox', 'unorthodox', 'demonic', 'neutral', 'imperial'];

// 세력별 누적: 전쟁 계절 danger, 평온 계절 danger, fortune 분포.
const agg: Record<WorldBloc, { warDanger: number; warN: number; peaceDanger: number; peaceN: number; fortuneSum: number; n: number; ascend: number; decline: number }> = {
  orthodox: { warDanger: 0, warN: 0, peaceDanger: 0, peaceN: 0, fortuneSum: 0, n: 0, ascend: 0, decline: 0 },
  unorthodox: { warDanger: 0, warN: 0, peaceDanger: 0, peaceN: 0, fortuneSum: 0, n: 0, ascend: 0, decline: 0 },
  demonic: { warDanger: 0, warN: 0, peaceDanger: 0, peaceN: 0, fortuneSum: 0, n: 0, ascend: 0, decline: 0 },
  neutral: { warDanger: 0, warN: 0, peaceDanger: 0, peaceN: 0, fortuneSum: 0, n: 0, ascend: 0, decline: 0 },
  imperial: { warDanger: 0, warN: 0, peaceDanger: 0, peaceN: 0, fortuneSum: 0, n: 0, ascend: 0, decline: 0 },
};

for (let run = 0; run < RUNS; run += 1) {
  const rng = mulberry32(run + 1);
  const s = seedWorldState(rng);
  for (let i = 0; i < SEASONS; i += 1) {
    tickWorldState(s, rng);
    for (const b of BLOCS) {
      const pr = blocPressure(s, b);
      const a = agg[b];
      a.fortuneSum += pr.fortune; a.n += 1;
      if (pr.fortune > 0.02) a.ascend += 1; else if (pr.fortune < -0.02) a.decline += 1;
      if (pr.danger >= 0.06) { a.warDanger += pr.danger; a.warN += 1; }
      else { a.peaceDanger += pr.danger; a.peaceN += 1; }
    }
  }
}

const pctRound = (x: number) => Math.round(x * 1000) / 10; // 확률 → %

console.log(`\n=== docs/37 §B4 졸업 제자 ⇄ 강호 정세 — ${RUNS}회차×${SEASONS}계절 ===\n`);
console.log('세력별 정세 압력 (졸업 제자가 받는 보정):');
console.log('  세력      전쟁계절비율  전쟁시 사망보정  융성/쇠퇴 비율   평균 fortune');
for (const b of BLOCS) {
  const a = agg[b];
  const warFrac = a.warN / (a.warN + a.peaceN);
  const warDangerAvg = a.warN ? a.warDanger / a.warN : 0;
  console.log(
    `  ${BLOC_LABEL[b].padEnd(6)}  ${String(pctRound(warFrac) + '%').padStart(8)}     ${('+' + pctRound(warDangerAvg) + '%p').padStart(8)}     ${(pctRound(a.ascend / a.n) + '/' + pctRound(a.decline / a.n) + '%').padStart(12)}   ${(Math.round((a.fortuneSum / a.n) * 1000) / 1000).toFixed(3)}`,
  );
}

// 노선별 — 졸업 제자가 전쟁 시 받는 연 사망확률(기본 노선위험 + 정세 압력).
console.log('\n졸업 제자 노선별 연 사망확률 (평시 vs 자기 세력 전쟁 시):');
const ROUTES: RouteId[] = ['righteous', 'daoist', 'assassin', 'shadow', 'demonic', 'vigilante', 'escort', 'wanderer', 'healer', 'commoner'];
const seen = new Set<string>();
for (const route of ROUTES) {
  const bloc = ROUTE_BLOC[route];
  const base = ROUTE_DANGER[route];
  const warExtra = 0.06; // blocPressure 전쟁 danger
  const k = `${route}`;
  if (seen.has(k)) continue; seen.add(k);
  console.log(`  ${route.padEnd(10)} (${BLOC_LABEL[bloc]}) 평시 ${pctRound(base)}% → 전쟁 ${pctRound(base + warExtra)}%`);
}

// ── 계약 단언 ────────────────────────────────────────────────────────────────
const checks: { name: string; pass: boolean; got: string }[] = [];
// 전쟁 가능 세력(정파·사파·마교)은 전쟁 계절이 존재하고 사망보정이 양수.
for (const b of ['orthodox', 'unorthodox', 'demonic'] as WorldBloc[]) {
  checks.push({ name: `${BLOC_LABEL[b]} 전쟁계절 사망보정>0`, pass: agg[b].warN > 0 && agg[b].warDanger / agg[b].warN > 0, got: `전쟁계절 ${agg[b].warN}` });
}
// 변동성 큰 사파·마교는 융성(봉기)·쇠퇴(토벌)가 둘 다 발생 — 세력 부침이 출세에 반영.
for (const b of ['unorthodox', 'demonic'] as WorldBloc[]) {
  checks.push({ name: `${BLOC_LABEL[b]} 융성·쇠퇴 둘다 발생`, pass: agg[b].ascend > 0 && agg[b].decline > 0, got: `융성 ${pctRound(agg[b].ascend / agg[b].n)}%/쇠퇴 ${pctRound(agg[b].decline / agg[b].n)}%` });
}
// 정파는 안정적으로 두터움 — 졸업 제자가 대체로 출세 순풍(융성 우세). docs/08 정통 두터움.
checks.push({ name: '정파 제자 대체로 융성(establishment)', pass: agg.orthodox.ascend / agg.orthodox.n > 0.8, got: `융성 ${pctRound(agg.orthodox.ascend / agg.orthodox.n)}%` });
// 중도는 전쟁에 거의 안 휘말림(정세 둔감) — 전쟁계절 비율이 낮음.
checks.push({ name: '중도는 정세 둔감(전쟁계절<5%)', pass: agg.neutral.warN / (agg.neutral.warN + agg.neutral.peaceN) < 0.05, got: `${pctRound(agg.neutral.warN / (agg.neutral.warN + agg.neutral.peaceN))}%` });

console.log('');
for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name.padEnd(28)} ${c.got}`);
const fails = checks.filter((c) => !c.pass).length;
console.log(`\n결과: ${fails === 0 ? '전 계약 PASS ✓' : `FAIL ${fails}건 ✗`}\n`);
if (fails > 0) process.exit(1);
