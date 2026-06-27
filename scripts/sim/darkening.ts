// darkening — 캐릭터별 흑화 난이도(저항) 측정. docs/13 흑화 저항.
//
// 설계(2026-06-27): 흑화를 올리는 3경로(직접 흑화창·도덕 범프·점수)를 단일 seam `raiseDarkness`로 모으고,
// 한 단계마다 캐릭터 `darknessResist`(0~1)로 확률 게이트(random≥저항 시에만 +1). 전원 저항<1 = 면역 없음
// (전부 흑화 가능), 저항 높을수록 같은 악행에도 덜·늦게 박힘 = 난이도 차등.
//
// 측정:
//   A) 흑화(Lv2)·심층(Lv4) 도달까지 평균 악행(흑화 시도) 횟수 — 저항 오름차순으로 단조 증가, 전원 유한(가능).
//      이론값 = target/(1−저항)(음이항 평균)과 대조(A/B 오라클).
//   B) 악행 15회(연 1회 총력 악양육) 후 평균 레벨 — 현실적 결과(이청하 ~Lv4, 장철 ~Lv1).
//   + seedNewRun 배선 확인: 시드된 제자의 darknessResist 가 recruitPool 값과 일치.
// 실행: node scripts/sim/_run.cjs scripts/sim/darkening.ts [trials=4000]
// 가드: 전원 흑화 유한 도달(면역 없음) · 저항 단조 · 측정≈이론 · 배선 일치.

import { seedNewRun } from '../../src/systems/newRun';
import { setAutoSaveEnabled } from '../../src/systems/runSync';
import { raiseDarkness, redeemDarkness } from '../../src/systems/darknessSystem';
import { seedAmbient } from '../../src/systems/rng';
import { useGameStore } from '../../src/stores/gameStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { RECRUIT_POOL, POST_LAUNCH_RECRUITS } from '../../src/data/disciples/recruitPool';
import { getArcEvent } from '../../src/data/scenarios/arcEvents';
import type { MeetingEffect } from '../../src/data/scenarios/meetings';

const NAME: Record<string, string> = {
  'jang-cheol': '장철', 'jin-sohwa': '진소화', 'han-baram': '한바람', 'yun-soso': '윤소소',
  'i-cheongha': '이청하', 'baek-yeon': '백연', 'gang-muyeol': '강무열', 'dokgo-yeon': '독고연',
  'jin-baekho': '진백호', 'sa-cheonhwa': '사천화',
};
// 저항맵 — recruitPool 단일 진실에서. 결제 2인(진백호·사천화)은 인격 데이터 부재로 미수록(docs/13 표엔 0.25·0.35 예정).
const RESIST: { id: string; resist: number; seedable: boolean }[] = [
  ...RECRUIT_POOL.map((c) => ({ id: c.poolId, resist: c.darknessResist, seedable: true })),
  ...POST_LAUNCH_RECRUITS.map((c) => ({ id: c.poolId, resist: c.darknessResist, seedable: false })),
].sort((a, b) => a.resist - b.resist);

function darknessWeight(eff: MeetingEffect): number {
  let w = (eff.darkness ?? 0) * 1000;
  const p = eff.persona ?? {};
  w += Math.max(0, -(p.mercy ?? 0)) + Math.max(0, -(p.integrity ?? 0)) + Math.max(0, p.ambition ?? 0) + Math.max(0, -(eff.righteousness ?? 0)) * 2;
  return w;
}
function directWindows(id: string): number {
  let n = 0;
  for (let y = 1; y <= 15; y++) {
    const ev = getArcEvent(id, y);
    if (!ev) continue;
    if (ev.choices.some((c) => (c.effects?.darkness ?? 0) > 0)) n += 1;
  }
  return n;
}

// 한 번의 시행: target 레벨 도달까지 raiseDarkness(+1) 악행 횟수. (RNG 는 호출측에서 연속 시드)
function attemptsTo(resist: number, target: number): number {
  const d = { darknessLevel: 0 as number, darknessResist: resist };
  let n = 0;
  while (d.darknessLevel < target && n < 100000) {
    d.darknessLevel = raiseDarkness(d as never, 1);
    n += 1;
  }
  return n;
}
// 악행 acts 회 후 최종 레벨.
function levelAfter(resist: number, acts: number): number {
  const d = { darknessLevel: 0 as number, darknessResist: resist };
  for (let i = 0; i < acts; i++) d.darknessLevel = raiseDarkness(d as never, 1);
  return d.darknessLevel;
}
// 갱생: 시작 단계 from 에서 청정 양육(주간 redeemDarkness)으로 0까지 걸린 주(week). 회복 안 되면 -1.
function weeksToRedeem(resist: number, from: number, cap = 100000): number {
  const d = { darknessLevel: from as number, darknessResist: resist };
  let w = 0;
  while (d.darknessLevel > 0 && w < cap) { d.darknessLevel = redeemDarkness(d as never); w += 1; }
  return d.darknessLevel === 0 ? w : -1;
}

async function main(): Promise<void> {
  setAutoSaveEnabled(false);
  const trials = Number(process.argv[3] ?? 4000);
  seedAmbient(12345);

  console.log('═══ darkening — 캐릭터별 흑화 난이도(저항) 측정 ═══');
  console.log(`시행 ${trials} · 단일 seam raiseDarkness 확률 게이트 · 전원 저항<1=면역 없음 · docs/13\n`);

  const fails: string[] = [];
  const check = (label: string, cond: boolean): void => { console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`); if (!cond) fails.push(label); };

  // ── A·B 측정 ──
  console.log(`${'캐릭터'.padEnd(8)} ${'저항'.padStart(5)} ${'흑화창'.padStart(5)} ${'흑화(Lv2)도달'.padStart(13)} ${'(이론)'.padStart(7)} ${'심층(Lv4)'.padStart(9)} ${'15악행後Lv'.padStart(10)}`);
  const a2: Record<string, number> = {};
  for (const { id, resist } of RESIST) {
    let sum2 = 0, sum4 = 0, sumLv = 0;
    for (let t = 0; t < trials; t++) { sum2 += attemptsTo(resist, 2); sum4 += attemptsTo(resist, 4); sumLv += levelAfter(resist, 15); }
    const m2 = sum2 / trials, m4 = sum4 / trials, mLv = sumLv / trials;
    a2[id] = m2;
    const theo2 = 2 / (1 - resist); // 음이항 평균
    const win = directWindows(id);
    console.log(`  ${NAME[id].padEnd(8)} ${resist.toFixed(2).padStart(5)} ${String(win).padStart(5)} ${m2.toFixed(1).padStart(11)}회 ${theo2.toFixed(1).padStart(7)} ${m4.toFixed(1).padStart(8)}회 ${mLv.toFixed(2).padStart(9)}`);
    // A/B 오라클 — 측정이 이론 음이항 평균과 ±10% 이내(seam 이 저항을 정확히 게이트).
    check(`${NAME[id]} 측정 흑화도달 ${m2.toFixed(1)}회 ≈ 이론 ${theo2.toFixed(1)}회(±10%)`, Math.abs(m2 - theo2) <= theo2 * 0.1 + 0.3);
    // 면역 없음 — 유한 도달.
    check(`${NAME[id]} 흑화 유한 도달(면역 없음)`, m2 < 100000 && mLv > 0);
  }

  // ── 단조성: 저항 오름차순 = 흑화 도달 횟수 오름차순(난이도 차등) ──
  let mono = true;
  for (let i = 1; i < RESIST.length; i++) if (a2[RESIST[i].id] < a2[RESIST[i - 1].id] - 0.5) mono = false;
  check('저항 오름차순 ⇒ 흑화 도달 횟수 단조 증가(이청하 최易 ~ 장철 最難)', mono);

  // ── 갱생(회복) 측정 — 단계2 청정양육 시 0 회복까지 평균 주(week) + 단계3 불가역 ──
  console.log(`\n── 갱생: 단계2(청정 양육)→0 회복 평균 주 · 단계3 불가역 ──`);
  console.log(`${'캐릭터'.padEnd(8)} ${'저항'.padStart(5)} ${'Lv2→0 회복주'.padStart(12)} ${'(이론)'.padStart(7)} ${'Lv3 회복?'.padStart(9)}`);
  const recW: Record<string, number> = {};
  for (const { id, resist } of RESIST) {
    let sum = 0;
    for (let t = 0; t < trials; t++) sum += weeksToRedeem(resist, 2);
    const mean = sum / trials; recW[id] = mean;
    const theo = 2 / (0.2 + 0.8 * resist); // 단계당 1/p, 2단계
    const lv3 = weeksToRedeem(resist, 3, 5000); // 불가역이면 cap 도달 → -1
    console.log(`  ${NAME[id].padEnd(8)} ${resist.toFixed(2).padStart(5)} ${mean.toFixed(1).padStart(10)}주 ${theo.toFixed(1).padStart(7)} ${(lv3 < 0 ? '불가역 ✓' : `회복${lv3}!`).padStart(9)}`);
    check(`${NAME[id]} 단계2 갱생 ${mean.toFixed(1)}주 ≈ 이론 ${theo.toFixed(1)}주(±10%)`, Math.abs(mean - theo) <= theo * 0.1 + 0.3);
    check(`${NAME[id]} 단계3 불가역(회복 안 됨)`, lv3 < 0);
  }
  // 갱생 속도 저항 단조 감소(고저항=빨리 회복) — 흑화 난이도의 거울.
  let monoR = true;
  for (let i = 1; i < RESIST.length; i++) if (recW[RESIST[i].id] > recW[RESIST[i - 1].id] + 0.5) monoR = false;
  check('저항 오름차순 ⇒ 갱생 주 단조 감소(장철 最速 회복 ~ 이청하 最遲)', monoR);

  // ── 배선 확인: seedNewRun 이 darknessResist 를 recruitPool 값대로 시드 ──
  for (const { id, resist, seedable } of RESIST) {
    if (!seedable) continue;
    seedAmbient(1); useGameStore.getState().setSaveSlot(9); seedNewRun([id]);
    const d = useDiscipleStore.getState().disciples[id];
    check(`${NAME[id]} seedNewRun darknessResist=${d?.darknessResist}(기대 ${resist})`, d?.darknessResist === resist);
  }

  console.log(`\n═══ 결과: ${fails.length === 0 ? 'PASS' : `${fails.length} FAIL`} · 시행 ${trials} ═══`);
  process.exit(fails.length > 0 ? 1 : 0);
}

void main();
