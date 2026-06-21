// property — 속성 기반 테스트(property-based testing, fast-check). docs/43.
// "특정 입력"이 아니라 "입력이 무엇이든 이 속성은 참"을 자동 반례 탐색으로 검증한다(실패 시 shrink로
// 최소 반례 제시). 우리 극단 시뮬(고른 입력)·fuzz(밟는 경로)의 사촌 — 순수 함수의 전 입력공간을 친다.
// 실행: npx tsx scripts/sim/property.ts [numRuns=2000]
import fc from 'fast-check';
import {
  effectiveRealmCeiling, nextRealm, realmIndex, wallInternalReq, externalSupportReq,
  enlightenmentChance, greatEnlightenmentChance,
  REALM_INTERNAL_REQ, REALM_EXTERNAL_REQ, REALM_SEONG_CAP, BONE_REBIRTH_STRENGTH_BONUS,
} from '../../src/data/realm';
import { seongCap, expToNextSeong } from '../../src/data/martialArts';
import { REL_UP, REL_DOWN, TOWARD_NEUTRAL } from '../../src/data/relationTransitions';
import { hasBatchim, josa } from '../../src/utils/korean';
import { REALM_ORDER, type Realm } from '../../src/types/realm';
import type { RelationLevel } from '../../src/types';
import type { MartialArtGrade } from '../../src/types/martialArt';

const N = Number(process.argv[2] ?? 2000);
const GRADES: MartialArtGrade[] = ['novice', 'apprentice', 'master', 'grandmaster', 'legendary'];
const LEVELS: RelationLevel[] = ['enemy', 'distant', 'neutral', 'friend', 'sworn'];
const REALMS = [...REALM_ORDER] as Realm[];

const realmArb = fc.constantFrom(...REALMS);
const gradeArb = fc.constantFrom(...GRADES);
const relArb = fc.constantFrom(...LEVELS);
const lvIdx = (l: RelationLevel): number => LEVELS.indexOf(l);

let pass = 0, fail = 0;
function prop(label: string, arb: fc.Arbitrary<unknown>, pred: (x: never) => boolean): void {
  try {
    fc.assert(fc.property(arb as fc.Arbitrary<never>, pred), { numRuns: N });
    pass += 1; console.log(`  PASS  ${label}`);
  } catch (e) {
    fail += 1; console.log(`  FAIL  ${label}\n        ${String((e as Error).message).split('\n').slice(0, 3).join('\n        ')}`);
  }
}
function ck(label: string, cond: boolean): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}`); }
  else { fail += 1; console.log(`  FAIL  ${label}`); }
}

console.log(`═══ property — 속성 기반 테스트 (fast-check · 속성당 ${N} 케이스) ═══\n`);

// ── 경지(realm) ──
prop('경지 천장은 항상 유효 경지', gradeArb, (g: MartialArtGrade) => REALMS.includes(effectiveRealmCeiling(g)));
prop('경지 천장은 등급에 단조 비감소', fc.tuple(gradeArb, gradeArb), ([a, b]: [MartialArtGrade, MartialArtGrade]) => {
  if (GRADES.indexOf(a) <= GRADES.indexOf(b)) return realmIndex(effectiveRealmCeiling(a)) <= realmIndex(effectiveRealmCeiling(b));
  return true;
});
prop('nextRealm: 최고경지면 null·아니면 +1칸', realmArb, (r: Realm) => {
  const nx = nextRealm(r);
  if (realmIndex(r) === REALMS.length - 1) return nx === null;
  return nx !== null && realmIndex(nx) === realmIndex(r) + 1;
});
prop('벽 내공요구 ≤ 진입 내공요구·유한≥0', realmArb, (r: Realm) => {
  const w = wallInternalReq(r);
  return Number.isFinite(w) && w >= 0 && w <= REALM_INTERNAL_REQ[r];
});
prop('받침 외공요구 ≤ 진입 외공요구·≥0 (화경=−8)', realmArb, (r: Realm) => {
  const s = externalSupportReq(r);
  if (s < 0 || s > REALM_EXTERNAL_REQ[r]) return false;
  return r === 'hwagyeong' ? s === REALM_EXTERNAL_REQ[r] - BONE_REBIRTH_STRENGTH_BONUS : s === REALM_EXTERNAL_REQ[r];
});
// ⚠️ 오성 범위를 크게(−5~120) — 상한 클램프(0.95)를 실제로 치는 입력이 있어야 한다.
// (mutation testing M4: 0~10만 주면 raw 가 0.95 를 못 넘어 클램프 변이를 못 잡았다 — 2026-06-21.)
prop('깨달음 확률 ∈ [0.02,0.95]', fc.tuple(fc.integer({ min: -5, max: 120 }), realmArb), ([i, r]: [number, Realm]) => {
  const c = enlightenmentChance(i, r); return c >= 0.02 && c <= 0.95;
});
prop('깨달음 확률은 오성에 단조 비감소', fc.tuple(fc.integer({ min: 0, max: 120 }), realmArb), ([i, r]: [number, Realm]) =>
  enlightenmentChance(i, r) <= enlightenmentChance(i + 1, r) + 1e-12);
prop('대오 확률 ∈ [0,0.5] · 실전 ≥ 폐관', fc.integer({ min: -5, max: 300 }), (i: number) => {
  const sq = greatEnlightenmentChance(i, 'quest'); const sc = greatEnlightenmentChance(i, 'seclude');
  return sq >= 0 && sq <= 0.5 && sc >= 0 && sc <= 0.5 && sq >= sc;
});

// ── 무공 성 ──
prop('성 상한 ∈ [6,10]·등급 단조', fc.tuple(gradeArb, gradeArb), ([a, b]: [MartialArtGrade, MartialArtGrade]) => {
  const ca = seongCap(a); if (ca < 6 || ca > 10) return false;
  if (GRADES.indexOf(a) <= GRADES.indexOf(b)) return seongCap(a) <= seongCap(b);
  return true;
});
prop('다음 성 EXP: 양수·s≥1 강증가·s≤1 클램프(140)', fc.integer({ min: -3, max: 11 }), (s: number) => {
  const e = expToNextSeong(s);
  if (e <= 0) return false;
  if (s >= 1) return expToNextSeong(s) < expToNextSeong(s + 1); // 유효 도메인(성≥1)서 가팔라짐
  return e === 140; // s≤1 은 Math.max(1,·) 클램프 — 의도된 동작(성은 항상 ≥1)
});

// ── 관계 전이 ──
prop('REL_UP 항상 유효·인덱스 비감소', relArb, (l: RelationLevel) => {
  const u = REL_UP[l]; return LEVELS.includes(u) && lvIdx(u) >= lvIdx(l);
});
prop('REL_DOWN 항상 유효·인덱스 비증가', relArb, (l: RelationLevel) => {
  const d = REL_DOWN[l]; return LEVELS.includes(d) && lvIdx(d) <= lvIdx(l);
});
prop('REL_UP 4회+면 sworn 포화', relArb, (l: RelationLevel) => {
  let x = l; for (let i = 0; i < 6; i += 1) x = REL_UP[x]; return x === 'sworn';
});
prop('REL_DOWN 4회+면 enemy 포화', relArb, (l: RelationLevel) => {
  let x = l; for (let i = 0; i < 6; i += 1) x = REL_DOWN[x]; return x === 'enemy';
});
prop('중재(TOWARD_NEUTRAL)는 무관 위로 안 올림', relArb, (l: RelationLevel) => {
  const t = TOWARD_NEUTRAL[l]; return t === undefined || (LEVELS.includes(t) && lvIdx(t) <= lvIdx('neutral') && lvIdx(t) >= lvIdx(l));
});

// ── 한국어 조사 ──
const nameArb = fc.constantFrom('장철', '진소화', '윤소소', '한바람', '이청하', '강무열', '독고연', '백연', '진백호', '사천화', 'Aria', '273');
prop('josa: 이름으로 시작·두 조사 중 하나로 끝남', fc.tuple(nameArb, fc.constantFrom('이', '은', '을'), fc.constantFrom('가', '는', '를')),
  ([w, a, b]: [string, string, string]) => { const r = josa(w, a, b); return r.startsWith(w) && (r.endsWith(a) || r.endsWith(b)); });
prop('josa 선택은 받침과 일치', fc.tuple(nameArb, fc.constantFrom('이', '은'), fc.constantFrom('가', '는')),
  ([w, a, b]: [string, string, string]) => josa(w, a, b) === w + (hasBatchim(w) ? a : b));

// ── 정적 불변식(단조 테이블) ──
ck('REALM_INTERNAL_REQ 단조 비감소', REALMS.every((r, i) => i === 0 || REALM_INTERNAL_REQ[r] >= REALM_INTERNAL_REQ[REALMS[i - 1]]));
ck('REALM_EXTERNAL_REQ 단조 비감소', REALMS.every((r, i) => i === 0 || REALM_EXTERNAL_REQ[r] >= REALM_EXTERNAL_REQ[REALMS[i - 1]]));
ck('REALM_SEONG_CAP 단조 비감소·화경=10', REALMS.every((r, i) => i === 0 || REALM_SEONG_CAP[r] >= REALM_SEONG_CAP[REALMS[i - 1]]) && REALM_SEONG_CAP.hwagyeong === 10);
ck('받침 판정: 한글 받침/비받침/비한글', hasBatchim('철') === true && hasBatchim('소') === false && hasBatchim('A') === false && hasBatchim('') === false);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL (속성당 ${N} 케이스) ═══`);
process.exit(fail > 0 ? 1 : 0);
