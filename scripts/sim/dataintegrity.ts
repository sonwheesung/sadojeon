// 데이터 무결성 — 직업·노선·의뢰·업적·제자풀의 끊긴 참조/잘못된 키/노선 직책 충돌 교차검증. docs/37.
// arttree(무공서 트리)의 자매편 — 손/AI로 쓴 데이터가 서로 어긋나면 졸업·의뢰·업적이 조용히 깨진다.
// 실행: npx tsx scripts/sim/dataintegrity.ts
import { JOB_POOL } from '../../src/data/jobs';
import { JOB_ROUTE, JOB_RANK, ROUTE_LADDER, ROUTE_FACTION, ROUTE_DANGER, ROUTE_BLOC, type RouteId } from '../../src/data/careers';
import { FACTIONS } from '../../src/data/factions';
import { MARTIAL_ARTS } from '../../src/data/martialArts';
import { QUEST_POOL } from '../../src/data/quests';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { RECRUIT_POOL } from '../../src/data/disciples/recruitPool';
import { STARTING_DISCIPLE_POOL } from '../../src/data/disciples/startingPool';
import { ALL_MORAL_EVENTS } from '../../src/data/scenarios/moralEvents';
import { STAT_LABEL } from '../../src/types/training';

let pass = 0, fail = 0;
function check(label: string, bad: string[], note = ''): void {
  if (bad.length === 0) { pass += 1; console.log(`  PASS  ${label}${note ? `   ${note}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}   ${bad.length}건: ${bad.slice(0, 8).join(' · ')}${bad.length > 8 ? ' …' : ''}`); }
}

const artIds = new Set(MARTIAL_ARTS.map((a) => a.id));
const factionIds = new Set(FACTIONS.map((f) => f.id));
const routeIds = new Set(Object.keys(ROUTE_LADDER) as RouteId[]);
const statIds = new Set(Object.keys(STAT_LABEL));
const SCHOOLS = new Set(['sword', 'saber', 'fist', 'lightness', 'hidden', 'external', 'qigong', 'medical', 'darkArts']);
const AXES = new Set(['integrity', 'freedom', 'warmth', 'prudence', 'mercy', 'ambition']);
const GRADES = new Set(['menial', 'minor', 'normal', 'dangerous', 'extreme']);
const DOMAINS = new Set(['guard', 'scout', 'duel', 'medicine', 'assassin', 'grand']);
const FALLBACK = 'town-idler';

console.log('═══ 데이터 무결성 (직업·노선·의뢰·업적·제자풀) ═══\n');

// ── 직업 → 노선 배선 ──
const jobIds = JOB_POOL.map((j) => j.id);
check('직업 id 중복 없음', jobIds.filter((id, i) => jobIds.indexOf(id) !== i));
check('직업마다 JOB_ROUTE 존재(한량 제외)', JOB_POOL.filter((j) => j.id !== FALLBACK && !JOB_ROUTE[j.id]).map((j) => j.id));
check('직업마다 JOB_RANK 존재(한량 제외)', JOB_POOL.filter((j) => j.id !== FALLBACK && JOB_RANK[j.id] == null).map((j) => j.id));
check('JOB_ROUTE 값이 유효 노선', Object.entries(JOB_ROUTE).filter(([, r]) => !routeIds.has(r)).map(([j]) => j));

// ── 노선 내 직책(JOB_RANK) 중복 금지(같은 노선 같은 순서 X — docs/28 §3) ──
const rankDup: string[] = [];
for (const route of routeIds) {
  const jobs = JOB_POOL.filter((j) => JOB_ROUTE[j.id] === route);
  const ranks = jobs.map((j) => JOB_RANK[j.id]);
  if (new Set(ranks).size !== ranks.length) rankDup.push(`${route}(${jobs.map((j) => `${j.id}:${JOB_RANK[j.id]}`).join(',')})`);
}
check('노선 내 JOB_RANK 중복 없음', rankDup);

// ── 직업 필드 유효성 ──
check('직업 martial.schools 유효', JOB_POOL.flatMap((j) => (j.martial?.schools ?? []).filter((s) => !SCHOOLS.has(s)).map((s) => `${j.id}:${s}`)));
check('직업 statReq 키 유효 StatId', JOB_POOL.flatMap((j) => Object.keys(j.statReq ?? {}).filter((k) => !statIds.has(k)).map((k) => `${j.id}:${k}`)));
check('직업 personaMin/Max 키 유효 6축', JOB_POOL.flatMap((j) => [...Object.keys(j.personaMin ?? {}), ...Object.keys(j.personaMax ?? {})].filter((k) => !AXES.has(k)).map((k) => `${j.id}:${k}`)));

// ── 노선 테이블 완전성 ──
check('ROUTE_LADDER 모든 노선 ROUTE_DANGER 존재', [...routeIds].filter((r) => ROUTE_DANGER[r] == null));
check('ROUTE_LADDER 모든 노선 ROUTE_BLOC 존재', [...routeIds].filter((r) => !ROUTE_BLOC[r]));
check('ROUTE_FACTION 값이 유효 문파', Object.values(ROUTE_FACTION).filter((f): f is string => f != null && !factionIds.has(f)));
check('ROUTE_LADDER 비어있지 않음', [...routeIds].filter((r) => (ROUTE_LADDER[r]?.length ?? 0) === 0));

// ── 업적 ──
check('업적 unlockArtId 유효 무공', ACHIEVEMENTS.filter((a) => a.unlockArtId && !artIds.has(a.unlockArtId)).map((a) => `${a.id}:${a.unlockArtId}`));
const achIds = ACHIEVEMENTS.map((a) => a.id);
check('업적 id 중복 없음', achIds.filter((id, i) => achIds.indexOf(id) !== i));
check('업적 check 함수 존재', ACHIEVEMENTS.filter((a) => typeof a.check !== 'function').map((a) => a.id));

// ── 제자 풀 ──
check('영입풀 artId 유효 무공', RECRUIT_POOL.filter((c) => !artIds.has(c.artId)).map((c) => `${c.poolId}:${c.artId}`));
const poolIds = RECRUIT_POOL.map((c) => c.poolId);
check('영입풀 poolId 중복 없음', poolIds.filter((id, i) => poolIds.indexOf(id) !== i));

// ── 의뢰 ──
const qIds = QUEST_POOL.map((q) => q.id);
check('의뢰 id 중복 없음', qIds.filter((id, i) => qIds.indexOf(id) !== i));
check('의뢰 grade 유효', QUEST_POOL.filter((q) => !GRADES.has(q.grade)).map((q) => `${q.id}:${q.grade}`));
check('의뢰 domain 유효', QUEST_POOL.filter((q) => !DOMAINS.has(q.domain)).map((q) => `${q.id}:${q.domain}`));
check('의뢰 faction(있으면) 유효', QUEST_POOL.filter((q) => q.faction && !factionIds.has(q.faction)).map((q) => `${q.id}:${q.faction}`));

// ── 도덕 이벤트 트리거 — 인격 키(미지 축은 트리거가 무성 통과해 의도 외 발화) · 동문 참조 ──
// 동문 id 는 **정의된 전체 제자**(STARTING_DISCIPLE_POOL — 출시 후 추가분 강무열·독고연 포함) 기준.
// 출시 후 제자를 참조하는 이벤트는 휴면(의도). 진짜 오타(미정의 id)만 잡는다.
const poolIdSet = new Set(STARTING_DISCIPLE_POOL.map((d) => d.id));
const badAxis: string[] = [];
const badSibling: string[] = [];
for (const e of ALL_MORAL_EVENTS) {
  const t = (e as { trigger?: { requirePersonality?: object; forbidPersonality?: object; requireSiblingId?: string } }).trigger;
  if (!t) continue;
  for (const k of [...Object.keys(t.requirePersonality ?? {}), ...Object.keys(t.forbidPersonality ?? {})]) {
    if (!AXES.has(k)) badAxis.push(`${(e as { id?: string }).id}:${k}`);
  }
  if (t.requireSiblingId && !poolIdSet.has(t.requireSiblingId)) badSibling.push(`${(e as { id?: string }).id}:${t.requireSiblingId}`);
}
check('도덕 트리거 인격 키 유효 6축', badAxis);
check('도덕 requireSiblingId 유효 제자', badSibling);

console.log(`\n[정보] 직업 ${JOB_POOL.length} · 노선 ${routeIds.size} · 의뢰 ${QUEST_POOL.length} · 업적 ${ACHIEVEMENTS.length} · 영입풀 ${RECRUIT_POOL.length} · 무공 ${MARTIAL_ARTS.length} · 도덕이벤트 ${ALL_MORAL_EVENTS.length}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
