// mutate — 변이 테스트(mutation testing). docs/43.
// 소스에 "버그"를 일부러 심고(mutant) 해당 시뮬을 돌려 **테스트가 그 버그를 잡는지**(=실패하는지) 본다.
// 잡으면 KILLED(테스트가 일함), 못 잡으면 SURVIVED(=테스트 공백 — 찾아야 할 결함).
// 실행: node scripts/sim/mutate.cjs
//
// ⚠️ 안전(절대 변이 코드가 커밋되면 안 됨 — 사용자 지시 2026-06-21):
//   1) 대상 파일이 깨끗(HEAD와 동일)할 때만 실행 — 미커밋 변경을 덮지 않고 복원 기준을 보장.
//   2) 실행 중 `.mutation.lock` 생성 — pre-commit 훅이 이 락이 있으면 커밋을 차단(.git/hooks/pre-commit).
//   3) 변이마다 finally 로 원본 복원 + **복원 바이트 일치 검증**(어긋나면 즉시 git checkout).
//   4) SIGINT/SIGTERM/uncaught 에서도 전 대상 복원 + 락 제거.
//   5) 종료 시 git checkout 백스톱.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const LOCK = path.join(root, '.mutation.lock');

// 각 변이 = {파일, 찾을 유니크 substring, 바꿀 값, 이 변이를 잡아야 할 시뮬, 러너, 깨는 불변식}.
const MUTANTS = [
  { id: 'M1 관계 호전 단조', file: 'src/data/relationTransitions.ts', find: "friend: 'sworn'", replace: "friend: 'enemy'", sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REL_UP 인덱스 비감소·sworn 포화' },
  { id: 'M2 화경 성상한', file: 'src/data/realm.ts', find: 'hwagyeong: 10, // 극성', replace: 'hwagyeong: 9, // 극성', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REALM_SEONG_CAP 화경=10' },
  { id: 'M3 성 EXP 곡선', file: 'src/data/martialArts/index.ts', find: '140 + (s - 1) * 80', replace: '140 + (s - 1) * 0', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'expToNextSeong 강증가' },
  { id: 'M4 깨달음 확률 상한', file: 'src/data/realm.ts', find: 'Math.min(0.95, raw)', replace: 'Math.min(2, raw)', sim: 'scripts/sim/property.ts', runner: 'tsx', kills: '깨달음 확률 ∈ [0.02,0.95]' },
  { id: 'M5 관계 악화 포화', file: 'src/data/relationTransitions.ts', find: "enemy: 'enemy'", replace: "enemy: 'distant'", sim: 'scripts/sim/property.ts', runner: 'tsx', kills: 'REL_DOWN enemy 포화' },
];

const FILES = [...new Set(MUTANTS.map((m) => m.file))];
const touched = new Set();

function gitClean(file) {
  try {
    execSync(`git diff --quiet -- ${file}`, { cwd: root, stdio: 'pipe' });
    execSync(`git diff --cached --quiet -- ${file}`, { cwd: root, stdio: 'pipe' });
    return true;
  } catch { return false; }
}
function gitRestore() {
  try { if (touched.size) execSync(`git checkout -- ${[...touched].join(' ')}`, { cwd: root, stdio: 'pipe' }); } catch {}
}
function cleanup() { gitRestore(); try { fs.unlinkSync(LOCK); } catch {} }

// ── 안전 가드 (실행 전) ──
try { execSync('git rev-parse --is-inside-work-tree', { cwd: root, stdio: 'pipe' }); }
catch { console.error('✋ git 저장소가 아님 — 변이 복원을 보장 못 함. 중단.'); process.exit(2); }
if (fs.existsSync(LOCK)) { console.error('✋ .mutation.lock 존재 — 이미 변이 중이거나 비정상 종료됨. 소스 확인(git status) 후 락 삭제.'); process.exit(2); }
for (const f of FILES) {
  if (!gitClean(f)) { console.error(`✋ ${f} 에 커밋 안 된 변경 있음 — 변이는 *깨끗한 트리*에서만(복원 기준 보장·미커밋 작업 보호). 먼저 커밋/스태시 후 재실행.`); process.exit(2); }
}

// 중단/예외에도 복원 + 락 제거.
process.on('SIGINT', () => { console.error('\n⚠️ 중단 — 소스 복원 중'); cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });
process.on('uncaughtException', (e) => { console.error('\n⚠️ 예외 — 소스 복원 중', e?.message); cleanup(); process.exit(1); });

fs.writeFileSync(LOCK, `mutation in progress pid ${process.pid} @ ${new Date().toISOString()}\n`);

function runSim(m) {
  const cmd = m.runner === 'tsx' ? `npx tsx ${m.sim}` : `node scripts/sim/_run.cjs ${m.sim}`;
  try { execSync(cmd, { cwd: root, stdio: 'pipe' }); return 0; }
  catch (e) { return e.status || 1; }
}

console.log('═══ mutate — 변이 테스트 (테스트가 심은 버그를 잡나) ═══');
console.log('🔒 .mutation.lock 생성 — 변이 중 커밋 차단(pre-commit 훅). 종료 시 복원·락 제거.\n');
let killed = 0, survived = 0, skipped = 0;
const survivors = [];

try {
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
      const after = fs.readFileSync(fp, 'utf8');
      if (after !== orig) { console.error(`  ✋ 복원 불일치 ${m.file} — git checkout 강제`); gitRestore(); }
    }
    if (code !== 0) { console.log(`  KILLED  ${m.id} — ${m.sim} 가 잡음 (${m.kills})`); killed += 1; }
    else { console.log(`  SURVIVED  ${m.id} — ⚠️ ${m.sim} 가 못 잡음! 테스트 공백: ${m.kills}`); survived += 1; survivors.push(m); }
  }
} finally {
  cleanup(); // 복원 + 락 제거(항상)
}

const rate = killed + survived > 0 ? Math.round((killed / (killed + survived)) * 100) : 0;
console.log(`\n변이 살해율: ${killed}/${killed + survived} (${rate}%) · SKIP ${skipped}`);
if (survivors.length) {
  console.log('⚠️ 생존 변이(테스트 공백) — docs/37 Part A 에 사각으로 등재 후 가드 추가 필요:');
  for (const s of survivors) console.log(`   - ${s.id}: ${s.kills} 를 ${s.sim} 가 검증 안 함`);
}
console.log('🔓 소스 복원·락 제거 완료(git status 로 확인 가능).');
console.log(`\n═══ 결과: KILLED ${killed} · SURVIVED ${survived} · SKIP ${skipped} ═══`);
process.exit(survived > 0 ? 1 : 0);
