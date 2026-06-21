// mutate — 변이 테스트(mutation testing). docs/43.
// 소스에 "버그"를 일부러 심고(mutant) 해당 시뮬을 돌려 **테스트가 그 버그를 잡는지**(=실패하는지) 본다.
// 잡으면 KILLED(테스트가 일함), 못 잡으면 SURVIVED(=테스트 공백 — 찾아야 할 결함). testguard·A/B
// 자가검증의 상위판: "테스트가 완벽한가"를 정량화한다. 변이는 *임시*이며 매번 원본으로 복원(+git 백스톱).
// 실행: node scripts/sim/mutate.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');

// 각 변이 = {파일, 찾을 유니크 substring, 바꿀 값, 이 변이를 잡아야 할 시뮬, 러너, 깨는 불변식}.
// substring 은 유니크해야(첫 일치만 치환). 잡는 시뮬이 PASS 로 통과하면 SURVIVED = 공백.
const MUTANTS = [
  { id: 'M1 관계 호전 단조', file: 'src/data/relationTransitions.ts', find: "friend: 'sworn'", replace: "friend: 'enemy'", sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REL_UP 인덱스 비감소·sworn 포화' },
  { id: 'M2 화경 성상한', file: 'src/data/realm.ts', find: 'hwagyeong: 10, // 극성', replace: 'hwagyeong: 9, // 극성', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REALM_SEONG_CAP 화경=10' },
  { id: 'M3 성 EXP 곡선', file: 'src/data/martialArts/index.ts', find: '140 + (s - 1) * 80', replace: '140 + (s - 1) * 0', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'expToNextSeong 강증가' },
  { id: 'M4 깨달음 확률 상한', file: 'src/data/realm.ts', find: 'Math.min(0.95, raw)', replace: 'Math.min(2, raw)', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: '깨달음 확률 ∈ [0.02,0.95]' },
  { id: 'M5 관계 악화 포화', file: 'src/data/relationTransitions.ts', find: "enemy: 'enemy'", replace: "enemy: 'distant'", sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REL_DOWN enemy 포화' },
];

function runSim(m) {
  const cmd = m.runner === 'tsx' ? `npx tsx ${m.sim}` : `node scripts/sim/_run.cjs ${m.sim}`;
  try { execSync(cmd, { cwd: root, stdio: 'pipe' }); return 0; } // 통과(exit 0)
  catch (e) { return e.status || 1; } // 실패(non-zero) = 변이 잡힘
}

console.log('═══ mutate — 변이 테스트 (테스트가 심은 버그를 잡나) ═══\n');
const touched = new Set();
let killed = 0, survived = 0, skipped = 0;
const survivors = [];

for (const m of MUTANTS) {
  const fp = path.join(root, m.file);
  const orig = fs.readFileSync(fp, 'utf8');
  if (!orig.includes(m.find)) {
    console.log(`  SKIP    ${m.id} — 대상 문자열 없음(소스 드리프트): "${m.find}" in ${m.file}`);
    skipped += 1; continue;
  }
  touched.add(m.file);
  let code = -1;
  try {
    fs.writeFileSync(fp, orig.replace(m.find, m.replace));
    code = runSim(m);
  } finally {
    fs.writeFileSync(fp, orig); // 항상 원본 정확 복원
  }
  if (code !== 0) { console.log(`  KILLED  ${m.id} — ${m.sim} 가 잡음 (${m.kills})`); killed += 1; }
  else { console.log(`  SURVIVED  ${m.id} — ⚠️ ${m.sim} 가 못 잡음! 테스트 공백: ${m.kills}`); survived += 1; survivors.push(m); }
}

// git 백스톱 — finally 복원이 어긋났어도 추적 파일을 원상복구.
try { if (touched.size) execSync(`git checkout -- ${[...touched].join(' ')}`, { cwd: root, stdio: 'pipe' }); } catch {}

const rate = killed + survived > 0 ? Math.round((killed / (killed + survived)) * 100) : 0;
console.log(`\n변이 살해율: ${killed}/${killed + survived} (${rate}%) · SKIP ${skipped}`);
if (survivors.length) {
  console.log('⚠️ 생존 변이(테스트 공백) — docs/37 Part A 에 사각으로 등재 후 가드 추가 필요:');
  for (const s of survivors) console.log(`   - ${s.id}: ${s.kills} 를 ${s.sim} 가 검증 안 함`);
}
console.log(`\n═══ 결과: KILLED ${killed} · SURVIVED ${survived} · SKIP ${skipped} ═══`);
process.exit(survived > 0 ? 1 : 0);
