// 시드 RNG 무결성 — docs/31 §3. 실행: npx tsx scripts/sim/rng.ts
// 결정성(같은 시드=같은 수열)·상태 복원(세이브 스커밍 봉쇄 토대)·헬퍼 범위·분포.
import {
  mulberry32, intBelow, inRange, rollChance, pickOne, weightedPick,
  random, seedAmbient, ambientCursor, restoreAmbient, randomInt, randomPick,
} from '../../src/systems/rng';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const draws = <T>(n: number, fn: () => T): T[] => Array.from({ length: n }, fn);

console.log('═══ 시드 RNG 무결성 ═══\n');

// 1) mulberry32 결정성 — 같은 시드 = 같은 수열, 다른 시드 = 다른 수열.
const a = mulberry32(12345); const b = mulberry32(12345); const c = mulberry32(99999);
const seqA = draws(8, a); const seqB = draws(8, b); const seqC = draws(8, c);
check('같은 시드 → 동일 수열', JSON.stringify(seqA) === JSON.stringify(seqB));
check('다른 시드 → 다른 수열', JSON.stringify(seqA) !== JSON.stringify(seqC));
check('[0,1) 범위', seqA.every((x) => x >= 0 && x < 1));

// 2) 분포 — 1만 표본 평균 ~0.5, 전 구간 분포.
const big = draws(10000, mulberry32(7));
const mean = big.reduce((s, x) => s + x, 0) / big.length;
check('평균 ≈ 0.5 (±0.02)', Math.abs(mean - 0.5) < 0.02, `mean=${mean.toFixed(4)}`);
const buckets = new Array(10).fill(0);
big.forEach((x) => { buckets[Math.min(9, Math.floor(x * 10))] += 1; });
check('10구간 균등(각 700~1300)', buckets.every((n) => n > 700 && n < 1300), buckets.join(','));

// 3) 명시 헬퍼 — 범위·추첨.
const r = mulberry32(55);
check('intBelow 0..n-1', draws(2000, () => intBelow(r, 6)).every((x) => x >= 0 && x < 6 && Number.isInteger(x)));
check('inRange [lo,hi)', draws(2000, () => inRange(r, 10, 20)).every((x) => x >= 10 && x < 20));
const r2 = mulberry32(55);
const trues = draws(10000, () => (rollChance(r2, 0.3) ? 1 : 0)).reduce((s: number, x) => s + x, 0);
check('rollChance(0.3) ≈ 30%', Math.abs(trues / 10000 - 0.3) < 0.02, `${(trues / 100).toFixed(1)}%`);
const r3 = mulberry32(55);
check('pickOne 원소만', draws(1000, () => pickOne(r3, ['x', 'y', 'z'] as const)).every((v) => 'xyz'.includes(v)));
// 가중 추첨 — 가중 10:1 이면 첫째가 압도적.
const r4 = mulberry32(3);
const wItems = [{ k: 'big', w: 10 }, { k: 'small', w: 1 }];
const bigCount = draws(10000, () => (weightedPick(r4, wItems, (x) => x.w).k === 'big' ? 1 : 0)).reduce((s: number, x) => s + x, 0);
check('weightedPick 10:1 → ~91%', Math.abs(bigCount / 10000 - 10 / 11) < 0.02, `${(bigCount / 100).toFixed(1)}%`);

// 4) 앰비언트 — 결정성(명시 시드).
seedAmbient(42); const amA = draws(6, random);
seedAmbient(42); const amB = draws(6, random);
check('앰비언트 같은 시드 → 동일', JSON.stringify(amA) === JSON.stringify(amB));

// 5) 앰비언트 상태 복원 — 저장된 커서로 이어 굴리면 같은 후속 수열(세이브 스커밍 봉쇄 토대).
seedAmbient(7); draws(3, random); const cursor = ambientCursor(); const after = draws(3, random);
restoreAmbient(cursor); const afterAgain = draws(3, random);
check('상태 복원 → 후속 수열 동일', JSON.stringify(after) === JSON.stringify(afterAgain));

// 6) 앰비언트 헬퍼.
seedAmbient(1);
check('randomInt 범위', draws(1000, () => randomInt(4)).every((x) => x >= 0 && x < 4));
check('randomPick 원소만', draws(500, () => randomPick([1, 2, 3] as const)).every((v) => [1, 2, 3].includes(v)));

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
