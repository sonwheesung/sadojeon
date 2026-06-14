// 강호 정세 엔진 — docs/37 §B5 계약 재검증 하네스. 실행: npx tsx scripts/sim/world.ts
// 순수 코어(seedWorldState·tickWorldState)를 결정적 rng 로 n회차×60계절(15년) 돌리며
// **불변식·금지 케이스를 매 틱 단언**하고, 계약 수치를 밴드와 비교해 PASS/WARN/FAIL 출력.
// docs/37 §0: "통과의 근거는 방금 돌린 측정값" — 엔진 수정 후 이걸 돌려 계약이 살아있는지 본다.

import { seedWorldState, tickWorldState } from '../../src/systems/worldSystem';
import { BLOC_DEF, STANCE_LABEL } from '../../src/data/worldPowers';
import type { WorldBloc, WorldState } from '../../src/types/world';

// 결정적 rng (mulberry32).
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
const RUNS = 200;
const MAX_ACTIVE = 4; // worldSystem 의 동시 진행 상한(비공개 const 와 일치해야 함)

// ── 불변식·금지 케이스 위반 카운터(0이어야 PASS) ─────────────────────────────
const viol = {
  powerBounds: 0, //    세력치 floor~100 밖
  tensionBounds: 0, //  긴장 0~100 밖
  orthodoxFloor: 0, //  정파 멸문(floor 밑)
  imperialFloor: 0, //  관 멸문(floor 밑)
  eventPhase: 0, //     phase 범위 밖(<1 또는 >phasesTotal)
  activeCount: 0, //    진행 중 사건이 상한 초과
  warStructure: 0, //   전쟁이 다국면(phasesTotal===3) 아님
  warStuck: 0, //       전쟁이 국면 수를 넘겨도 안 끝남
  doneLinger: 0, //     결말난 사건이 다음 계절에 남음
};

// ── 계약 수치 집계 ──────────────────────────────────────────────────────────
const kindCount: Record<string, number> = {};
let warRuns = 0;
let totalRumors = 0;
let warResolved = 0;
let tensionDropAfterWar = 0; // 전쟁 결말 직후 그 쌍 긴장이 떨어졌나(탈진)
let nonOrthWarIgnite = 0; //   비정파 전쟁(사마대전·관사 등) 발발 수 — 독립 분쟁 축이 살아있나
let divergeCalmWar = 0; //     정파 평온 中 어둠(사파·마교) 전쟁 — 세계가 한 덩어리로 안 움직이나
const finalPower: Record<WorldBloc, number[]> = {
  orthodox: [], unorthodox: [], demonic: [], neutral: [], imperial: [],
};
const stanceEndCount: Record<string, number> = {};
let sampleTimeline: string[] = [];

function key(a: WorldBloc, b: WorldBloc) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// 매 틱 불변식·금지 단언.
function assertInvariants(s: WorldState, prevDoneIds: Set<string>): Set<string> {
  for (const b of Object.keys(s.powers) as WorldBloc[]) {
    const p = s.powers[b].power;
    if (p < BLOC_DEF[b].floor - 1e-6 || p > 100 + 1e-6) viol.powerBounds += 1;
    if (b === 'orthodox' && p < BLOC_DEF.orthodox.floor - 1e-6) viol.orthodoxFloor += 1;
    if (b === 'imperial' && p < BLOC_DEF.imperial.floor - 1e-6) viol.imperialFloor += 1;
  }
  for (const k of Object.keys(s.tensions)) {
    const t = s.tensions[k];
    if (t < -1e-6 || t > 100 + 1e-6) viol.tensionBounds += 1;
  }
  const active = s.events.filter((e) => !e.done);
  if (active.length > MAX_ACTIVE) viol.activeCount += 1;
  for (const e of s.events) {
    if (e.phase < 1 || e.phase > e.phasesTotal) viol.eventPhase += 1;
    if (e.kind === 'war' && e.phasesTotal !== 3) viol.warStructure += 1;
    if (e.kind === 'war' && !e.done && s.season - e.startedSeason > e.phasesTotal) viol.warStuck += 1;
  }
  // 결말난 사건은 다음 계절에 목록서 제거돼야 한다.
  for (const id of prevDoneIds) {
    if (s.events.some((e) => e.id === id)) viol.doneLinger += 1;
  }
  return new Set(s.events.filter((e) => e.done).map((e) => e.id));
}

for (let run = 0; run < RUNS; run += 1) {
  const rng = mulberry32(1000 + run);
  const s = seedWorldState(rng);
  let warThisRun = false;
  let prevDoneIds = new Set<string>();
  const timeline: string[] = [];
  // 전쟁 결말 직후 긴장 비교용 — 이번 틱에 결말난 war 쌍의 직전 긴장.
  for (let season = 0; season < SEASONS; season += 1) {
    const warPairsBefore = s.events
      .filter((e) => e.kind === 'war' && !e.done && e.phase === e.phasesTotal - 1)
      .map((e) => ({ pair: key(e.blocs[0], e.blocs[1]), t: s.tensions[key(e.blocs[0], e.blocs[1])] ?? 0 }));

    const rep = tickWorldState(s, rng);
    prevDoneIds = assertInvariants(s, prevDoneIds);

    for (const k of rep.ignited) kindCount[k] = (kindCount[k] ?? 0) + 1;
    if (rep.ignited.includes('war')) warThisRun = true;
    // 비정파 전쟁 발발(사마대전·관사 등) + 기조 발산(정파 평온 中 어둠 전쟁).
    for (const e of s.events) {
      if (e.kind === 'war' && e.phase === 1 && !e.blocs.includes('orthodox')) nonOrthWarIgnite += 1;
    }
    if (s.powers.orthodox.stance === 'calm' && (s.powers.demonic.stance === 'war' || s.powers.unorthodox.stance === 'war')) {
      divergeCalmWar += 1;
    }
    totalRumors += rep.rumors.length;
    if (rep.resolved.includes('war')) {
      warResolved += 1;
      for (const w of warPairsBefore) {
        if ((s.tensions[w.pair] ?? 0) < w.t) tensionDropAfterWar += 1;
      }
    }
    if (run === 0 && rep.rumors.length > 0) {
      const yr = Math.floor(season / 4) + 1;
      const q = ['봄', '여름', '가을', '겨울'][season % 4];
      timeline.push(`${yr}년 ${q}: ${rep.rumors.map((r) => r.title).join(' / ')}`);
    }
  }

  if (warThisRun) warRuns += 1;
  for (const b of Object.keys(finalPower) as WorldBloc[]) finalPower[b].push(s.powers[b].power);
  for (const b of Object.keys(s.powers) as WorldBloc[]) {
    stanceEndCount[STANCE_LABEL[s.powers[b].stance]] = (stanceEndCount[STANCE_LABEL[s.powers[b].stance]] ?? 0) + 1;
  }
  if (run === 0) sampleTimeline = timeline;
}

// ── 출력 ────────────────────────────────────────────────────────────────────
const avg = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;
const warPct = Math.round((warRuns / RUNS) * 100);
const rumorsPerSeason = Math.round((totalRumors / RUNS / SEASONS) * 100) / 100;
const powers = (Object.keys(finalPower) as WorldBloc[]).map((b) => ({ b, v: avg(finalPower[b]) }));
const orthodoxAvg = powers.find((p) => p.b === 'orthodox')!.v;
const orthodoxIsTop = powers.every((p) => p.b === 'orthodox' || p.v <= orthodoxAvg);

const checks: { name: string; pass: boolean; warn?: boolean; got: string; want: string }[] = [];
const inv = (name: string, n: number) => checks.push({ name, pass: n === 0, got: `${n}건`, want: '0건' });

// 불변식·금지(전부 0이어야 FAIL 아님)
inv('정통 멸문 0 (정파 floor)', viol.orthodoxFloor);
inv('정통 멸문 0 (관 floor)', viol.imperialFloor);
inv('세력치 floor~100 범위', viol.powerBounds);
inv('긴장 0~100 범위', viol.tensionBounds);
inv('사건 phase 범위(1~phasesTotal)', viol.eventPhase);
inv(`진행중 사건 ≤ ${MAX_ACTIVE}`, viol.activeCount);
inv('전쟁 다국면(phasesTotal=3)', viol.warStructure);
inv('전쟁 국면 내 종결(안 멈춤)', viol.warStuck);
inv('결말난 사건 다음 계절 제거', viol.doneLinger);

// 계약 수치(밴드 — WARN 허용)
const band = (name: string, ok: boolean, got: string, want: string) =>
  checks.push({ name, pass: ok, warn: !ok, got, want });
band('전쟁 발발률', warPct >= 18 && warPct <= 40, `${warPct}%`, '18~40%');
band('정파가 최강 세력', orthodoxIsTop, `정파 ${orthodoxAvg}`, '전 세력 중 1위');
band('풍문 밀도', rumorsPerSeason >= 0.3 && rumorsPerSeason <= 0.8, `${rumorsPerSeason}/계절`, '0.3~0.8');
band('전쟁 후 긴장 탈진', warResolved === 0 || tensionDropAfterWar / warResolved >= 0.9,
  `${warResolved ? Math.round((tensionDropAfterWar / warResolved) * 100) : 0}%`, '≥90%');
// 독립 분쟁 축 — 세계가 정파 중심 한 덩어리가 아님(비정파 전쟁 가능 + 기조 발산 가능).
band('비정파 전쟁 발발 가능', nonOrthWarIgnite > 0, `${nonOrthWarIgnite}건`, '>0');
band('기조 발산 가능(정파 평온 中 어둠 전쟁)', divergeCalmWar > 0, `${divergeCalmWar}계절`, '>0');

const fails = checks.filter((c) => !c.pass && !c.warn);
const warns = checks.filter((c) => c.warn);

console.log(`\n=== docs/37 §B5 강호 정세 계약 재검증 — ${RUNS}회차 × ${SEASONS}계절(15년), 결정적 rng ===\n`);
for (const c of checks) {
  const tag = c.pass ? 'PASS' : c.warn ? 'WARN' : 'FAIL';
  console.log(`  ${tag}  ${c.name.padEnd(26)} ${c.got}  (기대 ${c.want})`);
}
console.log(
  `\n결과: ${fails.length === 0 ? (warns.length === 0 ? '전 계약 PASS ✓' : `PASS(경고 ${warns.length})`) : `FAIL ${fails.length}건 ✗`}`,
);

console.log(`\n[참고] 15년 후 평균 세력: ${powers.map((p) => `${p.b} ${p.v}`).join(' · ')}`);
console.log(`[참고] 사건/회차: ${Object.entries(kindCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round((v / RUNS) * 10) / 10}`).join(' · ')}`);
console.log(`[참고] 15년 후 기조: ${Object.entries(stanceEndCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log(`\n[샘플 타임라인 #0]`);
for (const line of sampleTimeline.slice(0, 16)) console.log(`  ${line}`);

if (fails.length > 0) process.exit(1);
