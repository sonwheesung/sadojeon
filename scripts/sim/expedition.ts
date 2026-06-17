// 강호 출행 사건 발생 분포 — docs/38 §1①ⓛ 계약. 실행: npx tsx scripts/sim/expedition.ts
// 새 튜너블 검증: 사건 기대 건수 ≈ danger × (days/4) × (1+정세) × BASE, 0~MAX 클램프.
// 위험한 행선·난세일수록 사건이 잦아야 하고(단조↑), 가까운 향리 평시엔 대체로 무탈해야 한다.
// (expeditionSystem.planEventDays 는 트레이닝→컷씬 체인으로 RN을 끌어와 node 단독 실행 불가 —
//  그래서 이 테스트가 그 공식의 계약 명세다. 전투·효과 배선은 인앱·tsc·combat 시뮬이 커버.)
import { EXPEDITION_DESTS } from '../../src/data/expeditions';
import { EXPEDITION_EVENT_BASE, EXPEDITION_EVENT_MAX } from '../../src/data/expeditionEvents';

// ── 계약 스펙(= expeditionSystem.planEventDays 와 동일해야 함) ──────────────
function drawEventCount(danger: number, days: number, threat: number): number {
  const expected = danger * (days / 4) * (1 + threat) * EXPEDITION_EVENT_BASE;
  let count = Math.floor(expected);
  if (Math.random() < expected - count) count += 1;
  return Math.max(0, Math.min(EXPEDITION_EVENT_MAX, count));
}

const N = 20000;
function sample(danger: number, days: number, threat: number) {
  let sum = 0;
  let zero = 0;
  let maxed = 0;
  let outOfBounds = 0;
  for (let i = 0; i < N; i += 1) {
    const c = drawEventCount(danger, days, threat);
    sum += c;
    if (c === 0) zero += 1;
    if (c === EXPEDITION_EVENT_MAX) maxed += 1;
    if (c < 0 || c > EXPEDITION_EVENT_MAX) outOfBounds += 1;
  }
  return { mean: sum / N, zeroPct: (zero / N) * 100, maxPct: (maxed / N) * 100, outOfBounds };
}

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${label}${detail ? `         ${detail}` : ''}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label}${detail ? `         ${detail}` : ''}`);
  }
}

console.log('═══ 강호 출행 사건 발생 분포 (표본 %s) ═══\n'.replace('%s', String(N)));

const [village, frontier, far] = EXPEDITION_DESTS;
console.log('  행선         위험  기간   평시 평균  난세 평균  무탈%(평시)');
for (const d of EXPEDITION_DESTS) {
  const peace = sample(d.danger, d.days, 0);
  const war = sample(d.danger, d.days, 1);
  console.log(
    `  ${d.name.padEnd(10)} ${d.danger.toFixed(2)}  ${String(d.days).padStart(2)}일   ${peace.mean.toFixed(2).padStart(6)}    ${war.mean.toFixed(2).padStart(6)}     ${peace.zeroPct.toFixed(0)}%`,
  );
}
console.log('');

const vP = sample(village.danger, village.days, 0);
const fP = sample(frontier.danger, frontier.days, 0);
const xP = sample(far.danger, far.days, 0);
const vW = sample(village.danger, village.days, 1);
const xW = sample(far.danger, far.days, 1);

check('전 표본 0~MAX 범위 내', vP.outOfBounds + xW.outOfBounds === 0);
check('위험도 단조↑ (평시 평균)', vP.mean < fP.mean && fP.mean < xP.mean, `${vP.mean.toFixed(2)}<${fP.mean.toFixed(2)}<${xP.mean.toFixed(2)}`);
check('난세가 사건↑ (동일 행선)', vW.mean > vP.mean && xW.mean > xP.mean, `향리 ${vP.mean.toFixed(2)}→${vW.mean.toFixed(2)} · 원행 ${xP.mean.toFixed(2)}→${xW.mean.toFixed(2)}`);
check('향리 평시 대체로 무탈', vP.zeroPct >= 50, `무탈 ${vP.zeroPct.toFixed(0)}%`);
check('원행 난세 사건 잦음', xW.mean >= 1.5, `평균 ${xW.mean.toFixed(2)}`);
check('원행 난세 MAX 도달 발생', xW.maxPct > 0, `MAX ${xW.maxPct.toFixed(0)}%`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
