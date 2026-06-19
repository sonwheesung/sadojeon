// 데이터 정합성 재검증(적대) — docs/37. 기존 dataintegrity.ts(직업·노선·의뢰·업적·제자풀)가 못 본
// 새 교차참조 표면을 친다: 영약 레시피·무공 카탈로그 내부 일관·영입풀↔시작풀 연결·시작관계 참조.
// 새 공격: ① 영약 — 재료 약초 정의됨·heal 은 woundType·internal 은 속성/양/흡수일·id중복·req양수
//          ② 무공 — id중복·path/grade/school 유효 enum·시작비급(acquisition start) 존재·mainId 자기참조
//          ③ 영입풀 poolId → 시작풀 제자 존재(없으면 discipleFromSeed 가 조용히 null → 제자 증발)
//          ④ 시작 적대·친밀 — 참조 id 가 시작풀에 존재·자기참조 없음
// 순수 데이터라 RN 없이. 실행: npx tsx scripts/sim/dataintegrity_recheck.ts
import { ELIXIR_RECIPES, MATERIAL_LABEL } from '../../src/data/elixirs';
import { MARTIAL_ARTS } from '../../src/data/martialArts/catalog';
import { RECRUIT_POOL } from '../../src/data/disciples/recruitPool';
import { STARTING_DISCIPLE_POOL, STARTING_RIVALRIES, STARTING_FRIENDSHIPS } from '../../src/data/disciples/startingPool';

let pass = 0, fail = 0;
function check(label: string, bad: string[], note = ''): void {
  if (bad.length === 0) { pass += 1; console.log(`  PASS  ${label}${note ? `   ${note}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}   ${bad.length}건: ${bad.slice(0, 8).join(' · ')}${bad.length > 8 ? ' …' : ''}`); }
}

const WOUND_TYPES = new Set(['wound', 'burn', 'poison', 'frost', 'inner']);
const QI_ATTRS = new Set(['metal', 'wood', 'water', 'fire', 'earth']);
const PATHS = new Set(['jeong', 'jung', 'sa', 'ma']); // 정도·중도·사도·마도 (MartialPath, docs/04)
const GRADES = new Set(['novice', 'apprentice', 'master', 'grandmaster', 'legendary']);
const SCHOOLS = new Set(['sword', 'saber', 'fist', 'lightness', 'hidden', 'external', 'qigong', 'medical', 'darkArts', 'spear', 'staff', 'palm', 'whip', 'music']);
const materialIds = new Set(Object.keys(MATERIAL_LABEL));

console.log('═══ 데이터 정합성 재검증 (영약·무공·풀 연결) ═══\n');

// ── 1. 영약 레시피 ──
const recIds = ELIXIR_RECIPES.map((r) => r.id);
check('영약 id 중복 없음', recIds.filter((id, i) => recIds.indexOf(id) !== i));
check('영약 재료 약초가 MATERIAL_LABEL 에 정의', ELIXIR_RECIPES.flatMap((r) => r.materials.filter((m) => !materialIds.has(m.id)).map((m) => `${r.id}:${m.id}`)));
check('영약 재료 수량 양의 정수', ELIXIR_RECIPES.flatMap((r) => r.materials.filter((m) => !(Number.isInteger(m.qty) && m.qty > 0)).map((m) => `${r.id}:${m.id}=${m.qty}`)));
check('영약 alchemyReq 양수', ELIXIR_RECIPES.filter((r) => !(r.alchemyReq > 0)).map((r) => `${r.id}:${r.alchemyReq}`));
check('영약 craftDays 양수', ELIXIR_RECIPES.filter((r) => !(r.craftDays > 0)).map((r) => `${r.id}:${r.craftDays}`));
check('heal 영약은 woundType 보유·유효', ELIXIR_RECIPES.filter((r) => r.category === 'heal' && (!r.woundType || !WOUND_TYPES.has(r.woundType))).map((r) => `${r.id}:${r.woundType}`));
check('internal 영약은 속성·내공량·흡수일 모두 유효', ELIXIR_RECIPES.filter((r) => r.category === 'internal' && !(r.attribute && QI_ATTRS.has(r.attribute) && (r.internalAmount ?? 0) > 0 && (r.absorbDays ?? 0) > 0)).map((r) => `${r.id}`));
check('비-internal 영약은 흡수 필드 없음(오분류 방지)', ELIXIR_RECIPES.filter((r) => r.category !== 'internal' && (r.internalAmount != null || r.absorbDays != null)).map((r) => `${r.id}`));
// 모든 재료 약초가 적어도 하나의 레시피에 쓰이는지(고아 약초 — 채집해도 못 쓰는 재료) — 경고성.
const usedMaterials = new Set(ELIXIR_RECIPES.flatMap((r) => r.materials.map((m) => m.id)));
check('정의된 약초가 전부 어딘가 쓰임(고아 약초 0)', [...materialIds].filter((m) => !usedMaterials.has(m)));

// ── 2. 무공 카탈로그 내부 일관 ──
const artIds = MARTIAL_ARTS.map((a) => a.id);
const artIdSet = new Set(artIds);
check('무공 id 중복 없음', artIds.filter((id, i) => artIds.indexOf(id) !== i));
check('무공 path 유효(정/중/사/마)', MARTIAL_ARTS.filter((a) => !PATHS.has(a.path)).map((a) => `${a.id}:${a.path}`));
check('무공 grade 유효', MARTIAL_ARTS.filter((a) => !GRADES.has(a.grade)).map((a) => `${a.id}:${a.grade}`));
check('무공 school 유효', MARTIAL_ARTS.filter((a) => !SCHOOLS.has(a.school)).map((a) => `${a.id}:${a.school}`));
// 시작 비급(acquisition 'start') 이 적어도 하나는 있어야(newRun.sectScrolls 가 시드).
const startArts = MARTIAL_ARTS.filter((a) => (a as { acquisition?: string }).acquisition === 'start');
check('시작 비급(acquisition start) 1개 이상 존재', startArts.length > 0 ? [] : ['none'], `${startArts.length}권`);

// ── 3. 영입풀 poolId → 시작풀 제자 존재(discipleFromSeed 가 찾는 키) ──
// recruitPool.poolId 는 startingPool.id 와 일치해야. 불일치면 discipleFromSeed 가 null → 선택해도 제자 증발.
const startPoolIds = new Set(STARTING_DISCIPLE_POOL.map((d) => d.id));
check('영입풀 poolId 가 시작풀 제자 id 와 매칭(증발 방지)', RECRUIT_POOL.filter((c) => !startPoolIds.has(c.poolId)).map((c) => c.poolId));
check('영입풀 artId 가 무공 카탈로그에 존재', RECRUIT_POOL.filter((c) => !artIdSet.has(c.artId)).map((c) => `${c.poolId}:${c.artId}`));

// ── 4. 시작 적대·친밀 참조 정합 ──
check('시작 적대 aware/unaware 가 시작풀에 존재', STARTING_RIVALRIES.flatMap((r) => [r.aware, r.unaware].filter((id) => !startPoolIds.has(id)).map((id) => `rivalry:${id}`)));
check('시작 적대 자기참조 없음', STARTING_RIVALRIES.filter((r) => r.aware === r.unaware).map((r) => `${r.aware}=${r.unaware}`));
check('시작 친밀 a/b 가 시작풀에 존재', STARTING_FRIENDSHIPS.flatMap((f) => [f.a, f.b].filter((id) => !startPoolIds.has(id)).map((id) => `friend:${id}`)));
check('시작 친밀 자기참조 없음', STARTING_FRIENDSHIPS.filter((f) => f.a === f.b).map((f) => `${f.a}=${f.b}`));
// 같은 페어가 적대·친밀 동시 정의(모순) 없는지.
const pairKey = (x: string, y: string) => [x, y].sort().join('|');
const rivalPairs = new Set(STARTING_RIVALRIES.map((r) => pairKey(r.aware, r.unaware)));
check('한 페어가 적대·친밀 동시 정의 없음(모순)', STARTING_FRIENDSHIPS.filter((f) => rivalPairs.has(pairKey(f.a, f.b))).map((f) => pairKey(f.a, f.b)));

console.log(`\n[정보] 영약 ${ELIXIR_RECIPES.length} · 약초 ${materialIds.size} · 무공 ${MARTIAL_ARTS.length}(시작 ${startArts.length}) · 영입풀 ${RECRUIT_POOL.length} · 시작풀 ${STARTING_DISCIPLE_POOL.length} · 적대 ${STARTING_RIVALRIES.length} · 친밀 ${STARTING_FRIENDSHIPS.length}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
