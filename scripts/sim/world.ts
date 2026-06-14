// 강호 정세 엔진 회귀/검증 — docs/36. 실행: npx tsx scripts/sim/world.ts
// 순수 코어(seedWorldState·tickWorldState)를 결정적 rng 로 N회차×60계절(15년) 돌려
// 사건 분포·전쟁 빈도·기조 흐름·세력 생존(정통 불변)을 본다. 스토어/RN 없이 코어만.

import { seedWorldState, tickWorldState } from '../../src/systems/worldSystem';
import { BLOC_DEF, STANCE_LABEL } from '../../src/data/worldPowers';
import type { WorldBloc } from '../../src/types/world';

// 결정적 rng (mulberry32) — 같은 시드 = 같은 결과.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEASONS = 60; // 15년 × 4계절
const RUNS = 200; // 회차 풀시뮬 표본(통계 룰: 100+)

const kindCount: Record<string, number> = {};
let warRuns = 0;
let totalRumors = 0;
let orthodoxFloorBreak = 0; // 정통 멸문(절대 0이어야 함)
const finalPower: Record<WorldBloc, number[]> = {
  orthodox: [], unorthodox: [], demonic: [], neutral: [], imperial: [],
};
const stanceEndCount: Record<string, number> = {};
let sampleTimeline: string[] = [];

for (let run = 0; run < RUNS; run += 1) {
  const rng = mulberry32(1000 + run);
  const s = seedWorldState(rng);
  let warThisRun = false;
  const timeline: string[] = [];

  for (let season = 0; season < SEASONS; season += 1) {
    const rep = tickWorldState(s, rng);
    for (const k of rep.ignited) kindCount[k] = (kindCount[k] ?? 0) + 1;
    if (rep.ignited.includes('war')) warThisRun = true;
    totalRumors += rep.rumors.length;
    if (s.powers.orthodox.power < BLOC_DEF.orthodox.floor - 0.001) orthodoxFloorBreak += 1;
    if (run === 0 && rep.rumors.length > 0) {
      const yr = Math.floor(season / 4) + 1;
      const q = ['봄', '여름', '가을', '겨울'][season % 4];
      timeline.push(`${yr}년 ${q}: ${rep.rumors.map((r) => r.title).join(' / ')}`);
    }
  }

  if (warThisRun) warRuns += 1;
  for (const b of Object.keys(finalPower) as WorldBloc[]) finalPower[b].push(s.powers[b].power);
  for (const b of Object.keys(s.powers) as WorldBloc[]) {
    const st = s.powers[b].stance;
    stanceEndCount[STANCE_LABEL[st]] = (stanceEndCount[STANCE_LABEL[st]] ?? 0) + 1;
  }
  if (run === 0) sampleTimeline = timeline;
}

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
const pct = (n: number) => `${Math.round((n / RUNS) * 100)}%`;

console.log(`\n=== 강호 정세 엔진 — ${RUNS}회차 × ${SEASONS}계절(15년) ===\n`);
console.log(`전쟁 발발 회차: ${warRuns}/${RUNS} (${pct(warRuns)})`);
console.log(`정통(정파) 멸문 사례: ${orthodoxFloorBreak} (0이어야 정상)`);
console.log(`회차당 평균 풍문: ${Math.round((totalRumors / RUNS) * 10) / 10}건 (계절당 ${Math.round((totalRumors / RUNS / SEASONS) * 10) / 10})`);

console.log(`\n사건 종류별 발발(총, ${RUNS}회차 합):`);
for (const [k, v] of Object.entries(kindCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(14)} ${v}\t(회차당 ${Math.round((v / RUNS) * 10) / 10})`);
}

console.log(`\n15년 후 평균 세력치:`);
for (const b of Object.keys(finalPower) as WorldBloc[]) {
  console.log(`  ${b.padEnd(11)} ${avg(finalPower[b])}\t(시작 ${BLOC_DEF[b].base}, 하한 ${BLOC_DEF[b].floor})`);
}

console.log(`\n15년 후 기조 분포(세력×회차):`);
for (const [k, v] of Object.entries(stanceEndCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(6)} ${v}`);
}

console.log(`\n샘플 타임라인(회차 #0):`);
for (const line of sampleTimeline.slice(0, 24)) console.log(`  ${line}`);
console.log('');
