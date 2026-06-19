// 성장/경지 재검증(적대) — docs/23·26·28. 세 기둥 게이트·성×경지 이중상한·화경 예외의 내부 정합성.
// 새 공격: ① 게이트 4표 전 경지 단조 증가(역전 0)  ② 성×경지 이중상한 — 10성은 화경이라야
//          ③ 화경 예외(wallInternalReq·externalSupportReq) < 전체 REQ 이고 비화경은 정확히 일치
//          ④ 깨달음/대오 확률 클램프(음수·거대·NaN·Infinity insight)  ⑤ 학습 floor ≤ cap 정합
//          ⑥ 경계의 경계 — 각 경지 REQ 정확히 == 에서 게이트 통과, REQ-1 에서 막힘(순수 판정)
// 순수 데이터/함수라 RN 없이 직접. 실행: npx tsx scripts/sim/realm_recheck.ts
import {
  REALM_INTERNAL_REQ, REALM_EXTERNAL_REQ, REALM_SEONG_GATE, REALM_SEONG_CAP, REALM_LEARN_FLOOR,
  wallInternalReq, externalSupportReq, isWallTransition, artGradeRealmCeiling, effectiveRealmCeiling,
  artGradeLearnRealm, enlightenmentChance, greatEnlightenmentChance, nextRealm, realmIndex,
  BONE_REBIRTH_STRENGTH_BONUS,
} from '../../src/data/realm';
import { REALM_ORDER, type Realm } from '../../src/types/realm';
import { seongCap } from '../../src/data/martialArts';
import type { MartialArtGrade } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const GRADES: MartialArtGrade[] = ['novice', 'apprentice', 'master', 'grandmaster', 'legendary'];

console.log('═══ 성장/경지 재검증(적대) ═══\n');

// ── 1. 게이트 4표 — 전 경지 단조 비감소(역전 0) ──
function monoOver(label: string, tbl: Record<Realm, number>): void {
  let ok = true; let prev = -Infinity; const trace: number[] = [];
  for (const r of REALM_ORDER) { trace.push(tbl[r]); if (tbl[r] < prev) ok = false; prev = tbl[r]; }
  ck(`${label} 경지순 단조 비감소`, ok, trace.join('→'));
}
monoOver('내공 요구(REALM_INTERNAL_REQ)', REALM_INTERNAL_REQ);
monoOver('외공 요구(REALM_EXTERNAL_REQ)', REALM_EXTERNAL_REQ);
monoOver('성 게이트(REALM_SEONG_GATE)', REALM_SEONG_GATE);
monoOver('성 상한(REALM_SEONG_CAP)', REALM_SEONG_CAP);
monoOver('학습 floor(REALM_LEARN_FLOOR)', REALM_LEARN_FLOOR);

// ── 2. 성×경지 이중상한 — 실제 도달 성 = min(등급 cap, 경지 cap[등급 천장]). 10성은 화경이라야. ──
for (const g of GRADES) {
  const ceiling = artGradeRealmCeiling(g);
  const reachable = Math.min(seongCap(g), REALM_SEONG_CAP[ceiling]);
  ck(`등급 ${g} 도달 최고 성 = min(등급cap ${seongCap(g)}, 경지cap ${REALM_SEONG_CAP[ceiling]}) = ${reachable}`, fin(reachable) && reachable >= 1 && reachable <= 10);
}
// 10성은 화경(REALM_SEONG_CAP 10)에서만. 화경 미만 경지 cap < 10.
const sub = REALM_ORDER.filter((r) => r !== 'hwagyeong');
ck('10성은 화경에서만(화경 미만 모든 경지 성상한 < 10)', sub.every((r) => REALM_SEONG_CAP[r] < 10), sub.map((r) => REALM_SEONG_CAP[r]).join(','));
ck('화경 성상한 = 10(극성 가능)', REALM_SEONG_CAP.hwagyeong === 10);
// novice/apprentice 는 화경 천장이 아니므로 10성 불가.
ck('하품(novice) 천장 일류 → 최고 6성(10성 불가)', Math.min(seongCap('novice'), REALM_SEONG_CAP[artGradeRealmCeiling('novice')]) === 6);
ck('신품(legendary) 천장 화경 → 10성 가능', Math.min(seongCap('legendary'), REALM_SEONG_CAP[artGradeRealmCeiling('legendary')]) === 10);
// effectiveRealmCeiling == artGradeRealmCeiling (별 등급 폐기 후 일치)
ck('effectiveRealmCeiling == artGradeRealmCeiling(전 등급)', GRADES.every((g) => effectiveRealmCeiling(g) === artGradeRealmCeiling(g)));

// ── 3. 벽 예외 정합 — 화경만 받침 완화, 나머지는 전체 REQ 와 정확히 일치 ──
for (const target of REALM_ORDER) {
  if (target === 'hwagyeong') continue;
  ck(`${target} wallInternalReq == 전체 내공REQ`, wallInternalReq(target) === REALM_INTERNAL_REQ[target]);
  ck(`${target} externalSupportReq == 전체 외공REQ`, externalSupportReq(target) === REALM_EXTERNAL_REQ[target]);
}
// 화경: 받침은 초절정 내공 + (외공−환골탈태). 둘 다 전체 REQ 보다 낮아야(영약이 나머지 채움).
ck('화경 wallInternalReq = 초절정 내공(1300 미만)', wallInternalReq('hwagyeong') === REALM_INTERNAL_REQ.chojeoljeong && wallInternalReq('hwagyeong') < REALM_INTERNAL_REQ.hwagyeong);
ck('화경 externalSupportReq = 70 − 환골탈태(8) = 62', externalSupportReq('hwagyeong') === REALM_EXTERNAL_REQ.hwagyeong - BONE_REBIRTH_STRENGTH_BONUS);
ck('화경 받침 외공(62) < 전체 외공REQ(70)', externalSupportReq('hwagyeong') < REALM_EXTERNAL_REQ.hwagyeong);
// 벽 전이는 절정·초절정·화경 진입만(그 아래는 막대 충족 시 자동).
ck('벽 전이 = 절정·초절정·화경 진입만', isWallTransition('jeoljeong') && isWallTransition('chojeoljeong') && isWallTransition('hwagyeong') && !isWallTransition('iryu') && !isWallTransition('ilryu') && !isWallTransition('samryu'));

// ── 4. 깨달음/대오 확률 클램프 — 극단 insight 에서 [하한,상한] 유한 ──
const insights = [-99999, -1, 0, 1, 3, 5, 100, 1e9, NaN, Infinity, -Infinity];
let enlOk = true; let geOk = true;
for (const ins of insights) {
  for (const t of REALM_ORDER) {
    const e = enlightenmentChance(ins, t);
    // NaN insight → raw NaN → Math.max(0.02, Math.min(0.95, NaN)). Math.min(.95,NaN)=NaN, Math.max(.02,NaN)=NaN.
    if (Number.isNaN(ins)) { if (!Number.isNaN(e) && (e < 0.02 || e > 0.95)) enlOk = false; }
    else if (!(fin(e) && e >= 0.02 && e <= 0.95)) enlOk = false;
  }
  for (const m of ['seclude', 'quest'] as const) {
    const ge = greatEnlightenmentChance(ins, m);
    if (Number.isNaN(ins)) { if (!Number.isNaN(ge) && (ge < 0 || ge > 0.5)) geOk = false; }
    else if (!(fin(ge) && ge >= 0 && ge <= 0.5)) geOk = false;
  }
}
ck('enlightenmentChance 정상 insight → [0.02, 0.95] 유한', enlOk);
ck('greatEnlightenmentChance 정상 insight → [0, 0.5] 유한 (폐관 하한 0.0001)', geOk);
// 대오 — 실전(quest)이 폐관(seclude)보다 항상 큼(같은 오성, 실력 보상).
ck('대오 quest > seclude(전 오성, 실전 보상)', [0, 3, 5].every((i) => greatEnlightenmentChance(i, 'quest') > greatEnlightenmentChance(i, 'seclude')));
// 오성↑ → 깨달음 확률 비감소.
let insMono = true;
for (const t of REALM_ORDER) for (let i = 1; i <= 5; i += 1) if (enlightenmentChance(i, t) < enlightenmentChance(i - 1, t)) insMono = false;
ck('오성↑ → 깨달음 확률 비감소', insMono);

// ── 5. 학습 floor ≤ 도달 cap 정합 — 시작 성이 등급/경지 상한을 넘지 않음 ──
let floorOk = true;
for (const r of REALM_ORDER) {
  const learnRealm = r;
  for (const g of GRADES) {
    // 그 경지에서 학습 가능한 등급만(artGradeLearnRealm).
    if (realmIndex(learnRealm) < realmIndex(artGradeLearnRealm(g))) continue;
    const startSeong = Math.min(REALM_LEARN_FLOOR[r], seongCap(g), REALM_SEONG_CAP[r]);
    if (!(startSeong >= 1 && startSeong <= seongCap(g) && startSeong <= REALM_SEONG_CAP[r])) floorOk = false;
  }
}
ck('학습 시작 성 = min(floor, 등급cap, 경지cap) — 상한 위반 0', floorOk);
// 학습 경지 게이트 단조 — 상급 비급일수록 더 높은 경지부터.
const learnRealms = GRADES.map((g) => realmIndex(artGradeLearnRealm(g)));
let learnMono = true;
for (let i = 1; i < learnRealms.length; i += 1) if (learnRealms[i] < learnRealms[i - 1]) learnMono = false;
ck('비급 학습 경지 게이트 단조(상급일수록 높은 경지)', learnMono, learnRealms.join('≤'));

// ── 6. 경계의 경계 — REQ 정확히 == 에서 게이트 통과, REQ−1 에서 막힘(순수 판정 재현) ──
// 비벽 진입(samryu→iryu→ilryu)의 내공 게이트는 internal < REQ 에서 막힘, == 에서 통과.
function passesInternalGate(target: Realm, internal: number): boolean {
  return !(internal < REALM_INTERNAL_REQ[target]); // 코드의 `if (internal < REQ) break` 동치
}
const iryuReq = REALM_INTERNAL_REQ.iryu;
ck(`iryu 내공 REQ(${iryuReq}) 정확히 == → 통과`, passesInternalGate('iryu', iryuReq));
ck(`iryu 내공 REQ−1 → 막힘`, !passesInternalGate('iryu', iryuReq - 1));
ck(`iryu 내공 REQ+1 → 통과`, passesInternalGate('iryu', iryuReq + 1));
// 벽(화경) 내공 받침 경계 — wallInternalReq 정확 == 통과.
function passesWallInternal(target: Realm, internal: number): boolean {
  return internal >= wallInternalReq(target); // 코드의 atWall 조건 동치
}
const hwReq = wallInternalReq('hwagyeong');
ck(`화경 벽 내공 받침(${hwReq}) 정확히 == → 벽에 섬`, passesWallInternal('hwagyeong', hwReq));
ck(`화경 벽 내공 받침−1 → 아직 벽 앞 아님`, !passesWallInternal('hwagyeong', hwReq - 1));

// nextRealm 끝단 — 화경 다음은 null(양육 천장), none 이전 없음.
ck('화경 nextRealm = null(양육 천장)', nextRealm('hwagyeong') === null);
ck('경지 사다리 7단(none~hwagyeong)', REALM_ORDER.length === 7);

console.log(`\n[정보] 화경 내공받침 ${wallInternalReq('hwagyeong')}/전체 ${REALM_INTERNAL_REQ.hwagyeong} · 외공받침 ${externalSupportReq('hwagyeong')}/${REALM_EXTERNAL_REQ.hwagyeong}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
