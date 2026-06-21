// 테스트 엔진 검증기(meta) — 테스트 스위트 자체의 사각(docs/37 Part D ①③: "엔진이 결과를 보고하는데
// 호출측·테스트가 안 쓴다")을 기계적으로 차단한다. 흡성대법(흡공/R36)류 "보고만 되고 아무도 안 쓰는"
// 누락이 재발하면 여기서 FAIL. 소스를 직접 읽어 정적 점검 — manifest 분류를 강제해 silent 누락 불가.
//   ① 전투 결과 필드 전부 manifest 분류됐나(새 필드 강제 분류)
//   ② mustApply 필드를 required 호출측이 전부 읽나(배선)
//   ③ mustApply 필드를 combatwiring 이 검증하나(테스트 커버리지)
//   ④ 무공 특성(MartialTrait) 전부 분류됐나
//   ⑤ post(전투 후 적용) 특성의 결과 필드가 mustApply 로 배선됐나
//   ⑥ 전 sim 이 실패 종료(process.exit)+단언을 갖나(빈·항상통과 테스트 차단)
// 실행: npx tsx scripts/sim/testguard.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd(); // repo 루트에서 실행(npx tsx scripts/sim/testguard.ts)
const read = (rel: string): string => readFileSync(join(root, rel), 'utf8');

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

// 인터페이스 본문에서 필드명 추출(주석·중첩 객체 줄 무시).
function interfaceFields(src: string, name: string): string[] {
  const m = src.match(new RegExp(`export interface ${name} \\{([\\s\\S]*?)\\n\\}`));
  if (!m) return [];
  return [...m[1].matchAll(/^\s+(\w+)\??:/gm)].map((x) => x[1]);
}
// union 타입('a' | 'b' | ...) 멤버 추출.
function unionMembers(src: string, name: string): string[] {
  const m = src.match(new RegExp(`export type ${name} =([\\s\\S]*?);`));
  if (!m) return [];
  return [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]);
}

const combatTypes = read('src/types/combat.ts');
const martialTypes = read('src/types/martialArt.ts');

console.log('═══ 테스트 엔진 검증기 (testguard) ═══\n');

// ── 전투 결과 필드 manifest ──
// info=표시·서술용(배선 불필요) / mustApply=호출측이 적용해야 함 / optional=의도됐으나 미구현(추적).
type FieldKind = 'info' | 'mustApply' | 'optional';
const CALLERS = ['questSystem', 'expeditionSystem', 'raidSystem', 'daeryeonSystem', 'sparringSystem'] as const;
const RESULT_FIELDS: Record<string, { kind: FieldKind; consumers?: string[]; note?: string }> = {
  // CombatantResult
  id: { kind: 'info' }, name: { kind: 'info' }, side: { kind: 'info' }, state: { kind: 'info' },
  hpFrac: { kind: 'info' }, qiFrac: { kind: 'info' }, dealtFrac: { kind: 'info' }, takenFrac: { kind: 'info' },
  wound: { kind: 'mustApply', consumers: ['questSystem', 'expeditionSystem', 'raidSystem', 'daeryeonSystem', 'sparringSystem'] },
  drainedQi: { kind: 'mustApply', consumers: ['questSystem', 'expeditionSystem', 'raidSystem'] },
  // CombatResult
  mode: { kind: 'info' }, rounds: { kind: 'info' }, winner: { kind: 'info' }, margin: { kind: 'info' },
  tier: { kind: 'info' }, combatants: { kind: 'info' }, events: { kind: 'info' },
  mvpId: { kind: 'mustApply', consumers: ['raidSystem'] }, // R37 배선 — n:n 활약 1위 보상 가산(raid)
  accident: { kind: 'mustApply', consumers: ['daeryeonSystem', 'sparringSystem'] },
};

const callerSrc: Record<string, string> = {};
for (const c of CALLERS) callerSrc[c] = read(`src/systems/${c}.ts`);
const wiringSrc = read('scripts/sim/combatwiring.ts');

// ① 모든 결과 필드가 manifest 에 분류됐나(새 필드 추가 시 강제 분류 → 미분류면 silent 누락 위험).
const fields = [...interfaceFields(combatTypes, 'CombatantResult'), ...interfaceFields(combatTypes, 'CombatResult')];
const unclassified = fields.filter((f) => !(f in RESULT_FIELDS));
ck('전투 결과 필드 전부 manifest 분류(미분류 0)', unclassified.length === 0, unclassified.length ? `미분류=${unclassified.join(',')}` : `${fields.length}필드`);

// ② mustApply 필드 — required 호출측이 전부 읽나(흡성대법류 "보고만·미배선" 차단).
for (const [f, m] of Object.entries(RESULT_FIELDS)) {
  if (m.kind !== 'mustApply') continue;
  const miss = (m.consumers ?? []).filter((c) => !callerSrc[c].includes(f));
  ck(`결과 '${f}' 호출측 배선(${(m.consumers ?? []).length}곳)`, miss.length === 0, miss.length ? `미배선=${miss.join(',')}` : '전곳 소비');
}

// ③ mustApply 필드 — combatwiring 이 검증하나(테스트 커버리지).
for (const [f, m] of Object.entries(RESULT_FIELDS)) {
  if (m.kind !== 'mustApply') continue;
  ck(`결과 '${f}' combatwiring 검증 존재`, wiringSrc.includes(f));
}

// ── 무공 특성 manifest ── intra=전투 내 완결(후처리 불필요) / post=전투 후 적용 필요(→결과 필드).
type TraitKind = 'intra' | 'post';
const TRAITS: Record<string, { kind: TraitKind; field?: string }> = {
  sweep: { kind: 'intra' }, wild: { kind: 'intra' }, guard: { kind: 'intra' }, swift: { kind: 'intra' }, pierce: { kind: 'intra' },
  poison: { kind: 'post', field: 'wound' }, burn: { kind: 'post', field: 'wound' }, frost: { kind: 'post', field: 'wound' },
  drain: { kind: 'post', field: 'drainedQi' },
};
// ④ 모든 특성이 분류됐나.
const traits = unionMembers(martialTypes, 'MartialTrait');
const unclassT = traits.filter((t) => !(t in TRAITS));
ck('무공 특성(MartialTrait) 전부 manifest 분류(미분류 0)', unclassT.length === 0, unclassT.length ? `미분류=${unclassT.join(',')}` : `${traits.length}특성`);
// ⑤ post 특성의 결과 필드가 mustApply 로 배선됐나.
for (const [t, m] of Object.entries(TRAITS)) {
  if (m.kind !== 'post') continue;
  ck(`특성 '${t}' → 결과 '${m.field}' mustApply`, RESULT_FIELDS[m.field ?? '']?.kind === 'mustApply', `field=${m.field}`);
}

// ⑥ 회귀 가드 sim 이 실패 종료(process.exit/exitCode)+단언을 갖나(빈·항상통과 테스트 차단).
// 진단용 sim(출력 표·서술 추적 — 사람이 읽는 용도, PASS/FAIL 없음)은 가드가 아니므로 allowlist.
// 새 sim 이 가드 의도인데 fail-hard 가 없으면 여기 안 걸려야 통과 → 누락이 잡힌다.
const DIAGNOSTIC_SIMS = ['combatmatrix', 'statuseffect', 'statusmatrix', 'worldquest', 'woundsim'];
// 가드도 진단도 아닌 **인프라**(헬퍼 모듈·도구) — PASS/FAIL 없는 라이브러리/CLI 라 가드 계약(process.exit·단언)
// 대상이 아니다. 침묵 무시가 아니라 명시 분류(아래서 출력). buggify=결함주입 헬퍼 · statcheck=오차범위 도구.
const NON_GUARD_SIMS = ['buggify', 'statcheck'];
const simFiles = readdirSync(join(root, 'scripts/sim')).filter((f) => f.endsWith('.ts') && !f.startsWith('_'));
const guardSims = simFiles.filter((f) => {
  const n = f.replace(/\.ts$/, '');
  return !DIAGNOSTIC_SIMS.includes(n) && !NON_GUARD_SIMS.includes(n);
});
const noFail: string[] = [];
const noAssert: string[] = [];
for (const f of guardSims) {
  const s = read(`scripts/sim/${f}`);
  if (!/process\.exit(Code)?/.test(s)) noFail.push(f); // process.exit() 또는 process.exitCode
  if (!/(\bck|\bcheck|\bband)\(|\bchecks\b|console\.assert/.test(s)) noAssert.push(f);
}
ck('회귀 가드 sim 실패 종료(process.exit) 보유', noFail.length === 0, noFail.length ? `누락=${noFail.join(',')}` : `${guardSims.length}개`);
ck('회귀 가드 sim 단언(check/ck/band/checks) 보유', noAssert.length === 0, noAssert.length ? `누락=${noAssert.join(',')}` : `${guardSims.length}개`);
// 진단용 sim 은 침묵 무시가 아니라 명시 — "회귀 가드 아님(출력 전용)"을 출력.
const presentDiag = DIAGNOSTIC_SIMS.filter((d) => simFiles.includes(`${d}.ts`));
console.log(`\n[진단용 sim(회귀 가드 아님·출력 전용)]: ${presentDiag.join(' · ')} — PASS/FAIL 없이 표·추적 출력. 가드로 쓰려면 밴드 assert 추가 필요.`);
const presentNonGuard = NON_GUARD_SIMS.filter((d) => simFiles.includes(`${d}.ts`));
console.log(`[인프라(가드·진단 아님)]: ${presentNonGuard.join(' · ')} — 헬퍼 모듈·도구(buggify 결함주입·statcheck 오차범위). 가드 계약 비대상.`);

// optional(보고만·미구현) 추적 — 침묵 누락이 아니라 manifest 에 명시됐음을 출력.
const opt = Object.entries(RESULT_FIELDS).filter(([, m]) => m.kind === 'optional');
if (opt.length) console.log(`\n[추적] optional(엔진 보고하나 호출측 미구현): ${opt.map(([f, m]) => `${f} — ${m.note}`).join(' · ')}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
