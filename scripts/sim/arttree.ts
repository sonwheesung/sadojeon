// 무공서 스킬트리 무결성 — docs/28 §5-2. 실행: npx tsx scripts/sim/arttree.ts
// 641권 손/AI 작성 데이터의 끊긴 선행조건·순환·불가능 게이트·중복을 잡는다.
// 트리가 깨지면 성장(canLearnArt·reachableApexGrade)이 조용히 막히므로 회귀 스위트에 상주.
import { MARTIAL_ARTS, seongCap } from '../../src/data/martialArts';
import { artGradeLearnRealm } from '../../src/data/realm';
import type { MartialArt } from '../../src/types';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

const arts = MARTIAL_ARTS as MartialArt[];
const byId = new Map<string, MartialArt>();
const dupes: string[] = [];
for (const a of arts) {
  if (byId.has(a.id)) dupes.push(a.id);
  byId.set(a.id, a);
}

console.log(`═══ 무공서 트리 무결성 (${arts.length}권) ═══\n`);

// 1) 중복 id 없음.
check('중복 id 없음', dupes.length === 0, dupes.length ? `중복: ${dupes.join(', ')}` : '');

// 2) 끊긴 선행조건 — 카탈로그에 없는 artId 참조 금지.
const dangling: string[] = [];
for (const a of arts) {
  for (const p of a.prerequisites ?? []) {
    if (!byId.has(p.artId)) dangling.push(`${a.id} → ${p.artId}`);
  }
}
check('끊긴 선행조건 없음', dangling.length === 0, dangling.length ? `${dangling.length}건: ${dangling.slice(0, 8).join(' · ')}${dangling.length > 8 ? ' …' : ''}` : '');

// 3) 자기참조 금지.
const selfRef = arts.filter((a) => (a.prerequisites ?? []).some((p) => p.artId === a.id)).map((a) => a.id);
check('자기참조 없음', selfRef.length === 0, selfRef.join(', '));

// 4) minSeong 범위(1~10) + 그 선행의 등급 상한 내 — 불가능 게이트 금지.
//    예: 선행이 하품(상한 6)인데 minSeong 8을 요구하면 영원히 못 채움.
const badSeong: string[] = [];
const impossible: string[] = [];
for (const a of arts) {
  for (const p of a.prerequisites ?? []) {
    if (p.minSeong < 1 || p.minSeong > 10) badSeong.push(`${a.id}→${p.artId}(${p.minSeong})`);
    const pre = byId.get(p.artId);
    if (pre && p.minSeong > seongCap(pre.grade)) {
      impossible.push(`${a.id}: ${p.artId} ${p.minSeong}성 요구 > ${pre.grade} 상한 ${seongCap(pre.grade)}`);
    }
  }
}
check('minSeong 1~10 범위', badSeong.length === 0, badSeong.slice(0, 8).join(' · '));
check('불가능 게이트 없음(요구 성 ≤ 선행 등급 상한)', impossible.length === 0, impossible.length ? `${impossible.length}건: ${impossible.slice(0, 6).join(' · ')}${impossible.length > 6 ? ' …' : ''}` : '');

// 5) 순환 없음 — 선행조건 그래프 DFS.
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = new Map<string, number>();
const cycles: string[] = [];
function dfs(id: string, stack: string[]): void {
  color.set(id, GRAY);
  const a = byId.get(id);
  for (const p of a?.prerequisites ?? []) {
    if (!byId.has(p.artId)) continue; // 끊긴 건 위에서 별도 보고
    const c = color.get(p.artId) ?? WHITE;
    if (c === GRAY) cycles.push([...stack, id, p.artId].join('→'));
    else if (c === WHITE) dfs(p.artId, [...stack, id]);
  }
  color.set(id, BLACK);
}
for (const a of arts) if ((color.get(a.id) ?? WHITE) === WHITE) dfs(a.id, []);
check('순환 없음', cycles.length === 0, cycles.slice(0, 4).join('  |  '));

// 6) 시작 비급(start)은 선행조건 없어야 — 시작부터 도감에 있는데 선행을 요구하면 모순.
const startWithPre = arts.filter((a) => a.acquisition === 'start' && (a.prerequisites?.length ?? 0) > 0).map((a) => a.id);
check('시작 비급에 선행조건 없음', startWithPre.length === 0, startWithPre.join(', '));

// 7) 모든 선행 사슬이 루트(선행 없음)에서 출발 — 순환·끊김 없으면 보장되나, 명시 검증.
//    각 무공이 닿는 바닥(루트)이 적어도 하나 있는지(닿을 수 없으면 영원히 학습 불가).
//    메모이즈 — 다이아몬드 의존(형제 선행이 공통 조상 공유)을 거짓 실패로 보지 않게.
//    순환은 위에서 0 확인됨 → tentative false 는 안전한 순환 차단기일 뿐.
const reachMemo = new Map<string, boolean>();
function rootsReachable(id: string): boolean {
  const cached = reachMemo.get(id);
  if (cached != null) return cached;
  reachMemo.set(id, false); // 순환 차단(데이터엔 순환 없음)
  const pre = byId.get(id)?.prerequisites ?? [];
  const r = pre.length === 0 ? true : pre.every((p) => byId.has(p.artId) && rootsReachable(p.artId));
  reachMemo.set(id, r);
  return r;
}
const unreachable = arts.filter((a) => !rootsReachable(a.id)).map((a) => a.id);
check('모든 무공이 루트에서 도달 가능', unreachable.length === 0, unreachable.length ? `${unreachable.length}건: ${unreachable.slice(0, 8).join(', ')}${unreachable.length > 8 ? ' …' : ''}` : '');

// ─── 정보(경고 아님) — 트리 결 점검 ─────────────────────────────────────────
const GRADE_RANK: Record<string, number> = { novice: 0, apprentice: 1, master: 2, grandmaster: 3, legendary: 4 };
// 8) 등급 역행 — 상위 등급 무공이 더 높은 등급을 선행으로 두는 경우(보통 트리는 등급을 오른다).
const inversions: string[] = [];
for (const a of arts) {
  for (const p of a.prerequisites ?? []) {
    const pre = byId.get(p.artId);
    if (pre && GRADE_RANK[pre.grade] > GRADE_RANK[a.grade]) {
      inversions.push(`${a.id}(${a.grade}) ← ${p.artId}(${pre.grade})`);
    }
  }
}
console.log(`\n  [정보] 등급 역행(상위 선행) ${inversions.length}건${inversions.length ? ': ' + inversions.slice(0, 6).join(' · ') : ''}`);

// 9) 등급별 분포 + 학습 경지 floor.
const byGrade: Record<string, number> = {};
for (const a of arts) byGrade[a.grade] = (byGrade[a.grade] ?? 0) + 1;
console.log(`  [정보] 등급 분포: ${Object.entries(byGrade).map(([g, n]) => `${g} ${n}`).join(' · ')}`);
console.log(`  [정보] 등급별 학습 경지 floor: ${Object.keys(byGrade).map((g) => `${g}→${artGradeLearnRealm(g as MartialArt['grade'])}`).join(' · ')}`);

// 10) 마공 일관성 — minDarkness 가 붙은 무공은 path 'ma'(마도)여야 결이 맞음.
const darkPathMismatch = arts.filter((a) => a.minDarkness != null && a.path !== 'ma').map((a) => `${a.id}(${a.path})`);
console.log(`  [정보] minDarkness 비마도 무공 ${darkPathMismatch.length}건${darkPathMismatch.length ? ': ' + darkPathMismatch.slice(0, 6).join(' · ') : ''}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
