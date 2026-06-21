// 통계 오차범위 비교 도구 (docs/42).
// 36의 밴드(statbaseline.json)에 대해 재측정값의 "변경 편차(델타)"를 정량 산출한다.
// PASS/FAIL을 대신 결정하지 않는다 — 의도한 변화인지 회귀인지는 사람만 안다.
//
// 사용:
//   npx tsx scripts/sim/statcheck.ts                 전체 베이스라인 + 메타
//   npx tsx scripts/sim/statcheck.ts <id> <측정값>     한 지표 델타·밴드 판정
//   npx tsx scripts/sim/statcheck.ts --json <파일>     {id: 측정값} 묶음 일괄

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

interface Baseline {
  id: string;
  doc: string;
  metric: string;
  value: number;
  unit: string;
  band: [number, number];
  n: number;
  date: string;
  sim: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, 'statbaseline.json'), 'utf8')) as {
  baselines: Baseline[];
};
const BASE = raw.baselines;
const byId = new Map(BASE.map((b) => [b.id, b]));

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// 한 지표 비교 출력. 밴드 내/외 여부 반환(편차 정량화만 — 판정은 사람).
function compare(b: Baseline, measured: number): boolean {
  const delta = measured - b.value;
  const [lo, hi] = b.band;
  const inBand = measured >= lo && measured <= hi;
  const sign = delta > 0 ? '+' : '';
  const mark = inBand ? 'IN ' : 'OUT';
  console.log(
    `  [${mark}] ${b.id}  ${b.metric}\n` +
      `        base ${fmt(b.value)}${b.unit} → 측정 ${fmt(measured)}${b.unit}  ` +
      `Δ ${sign}${fmt(delta)}${b.unit}  band [${fmt(lo)},${fmt(hi)}]  (n=${b.n}, ${b.date}, ${b.sim})`,
  );
  if (!inBand) {
    console.log(
      `        ⚠️ 밴드 밖 — 의도한 변화면 docs/36 + statbaseline.json 갱신(3룰 A), 아니면 회귀(원인 추적).`,
    );
  }
  return inBand;
}

const args = process.argv.slice(2);

if (args.length === 0) {
  // 전체 베이스라인 + 메타
  console.log('통계 베이스라인 (docs/36 사본 · 정본은 36)\n');
  const byDoc = new Map<string, number>();
  for (const b of BASE) {
    byDoc.set(b.doc, (byDoc.get(b.doc) ?? 0) + 1);
    console.log(
      `  ${b.id}  =${fmt(b.value)}${b.unit}  band [${fmt(b.band[0])},${fmt(b.band[1])}]  ` +
        `(n=${b.n}, ${b.date}, ${b.sim})\n        ${b.metric}`,
    );
  }
  console.log(`\n총 ${BASE.length}개 지표 · 문서별: ${[...byDoc].map(([d, c]) => `${d}(${c})`).join(' · ')}`);
  console.log('\n사용: statcheck.ts <id> <측정값>  또는  --json <파일>');
} else if (args[0] === '--json') {
  // 묶음 비교
  const file = args[1];
  if (!file) {
    console.error('사용: statcheck.ts --json <파일>  (내용: {"id": 측정값, ...})');
    process.exit(2);
  }
  const measurements = JSON.parse(readFileSync(file, 'utf8')) as Record<string, number>;
  let inCount = 0;
  let outCount = 0;
  let unknown = 0;
  console.log(`묶음 비교 (${file})\n`);
  for (const [id, val] of Object.entries(measurements)) {
    const b = byId.get(id);
    if (!b) {
      console.log(`  [???] ${id} — 베이스라인에 없는 id (statbaseline.json 확인)`);
      unknown++;
      continue;
    }
    if (compare(b, val)) inCount++;
    else outCount++;
  }
  console.log(`\n결과: 밴드 내 ${inCount} · 밴드 밖 ${outCount} · 미상 ${unknown}`);
} else {
  // 단일 비교
  const id = args[0];
  const measured = Number(args[1]);
  const b = byId.get(id);
  if (!b) {
    console.error(`알 수 없는 id: ${id}\n사용 가능: ${BASE.map((x) => x.id).join(', ')}`);
    process.exit(2);
  }
  if (!Number.isFinite(measured)) {
    console.error(`측정값이 숫자가 아님: ${args[1]}\n사용: statcheck.ts ${id} <측정값>`);
    process.exit(2);
  }
  console.log('');
  compare(b, measured);
  console.log('');
}
