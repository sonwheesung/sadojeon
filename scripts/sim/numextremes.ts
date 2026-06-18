// 숫자 극단 — 전투력 산식(combatPower/combatRating/combatRumor·kitPower)의 경계값 거동. docs/37.
// 화경·10성·전설급 다수(최강)·빈 키트·키트가 감쇠표 초과·정+사마 상극 누적·단조성(강할수록 점수↑ 역전 없음)·
// 비정상 입력(음수/거대 성)에서 NaN·Infinity·역전·발산이 없는지. 순수 함수라 RN 없이 직접 먹인다.
// 실행: npx tsx scripts/sim/numextremes.ts
import { MARTIAL_ARTS } from '../../src/data/martialArts';
import { combatPower, combatRating, combatRumor, kitPower, GRADE_COEF, type KitArt } from '../../src/systems/combatPower';
import { REALM_ORDER, type Realm } from '../../src/types/realm';
import type { Disciple, MartialArtGrade, MartialPath } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const finite = (n: number) => Number.isFinite(n) && !Number.isNaN(n);

// combatPower 가 읽는 필드만 갖춘 최소 제자(나머지는 비교 무관 — 캐스팅).
function disc(arts: { artId: string; seong: number }[], realm: Realm, mainId?: string): Disciple {
  return {
    martialArts: arts.map((a) => ({ artId: a.artId, seong: a.seong, exp: 0, unlockedAt: 0 })),
    mainMartialArtId: mainId ?? arts[0]?.artId,
    realm,
  } as unknown as Disciple;
}
const kit = (grade: MartialArtGrade, path: MartialPath, seong: number): KitArt => ({ grade, path, seong });

const legendaries = MARTIAL_ARTS.filter((a) => a.grade === 'legendary');
const someArt = MARTIAL_ARTS[0];

console.log('═══ 숫자 극단 (전투력 산식 경계값) ═══\n');

// ── 1. 최강 제자 — 화경 + 전설급 다수 10성 ──
const maxArts = legendaries.slice(0, 8).map((a) => ({ artId: a.id, seong: 10 }));
const maxD = disc(maxArts.length ? maxArts : [{ artId: someArt.id, seong: 10 }], 'hwagyeong');
const maxCP = combatPower(maxD);
const maxCR = combatRating(maxD);
ck('최강 제자 combatPower 유한·양수', finite(maxCP) && maxCP > 0, `cp=${maxCP}`);
ck('최강 제자 combatRating 유한·상한 내(≤140)', finite(maxCR) && maxCR > 0 && maxCR <= 140, `cr=${maxCR}`);
ck('최강 제자 combatRumor 문자열 반환', typeof combatRumor(maxD) === 'string' && combatRumor(maxD).length > 0, combatRumor(maxD));

// ── 2. 빈/퇴화 키트 ──
const empty = disc([], 'samryu');
ck('빈 키트 combatPower 0', combatPower(empty) === 0);
ck('빈 키트 combatRating 0', combatRating(empty) === 0);
ck('빈 키트 combatRumor 무위 불가 문구', combatRumor(empty) === '아직 무위를 논할 수 없다', combatRumor(empty));
const realmNone = disc([{ artId: someArt.id, seong: 5 }], 'none');
ck('경지 none combatRumor 무위 불가', combatRumor(realmNone) === '아직 무위를 논할 수 없다');
ck('경지 none kitPower 유한(가중 0.4)', finite(combatPower(realmNone)));
const seong1Only = disc([{ artId: someArt.id, seong: 1 }], 'ilryu');
ck('1성만 → 기여 0 → combatPower 0', combatPower(seong1Only) === 0, `cp=${combatPower(seong1Only)}`);

// ── 3. 키트가 감쇠표(RANK_WEIGHT 8칸) 초과 — 50개 무공 ──
const wide = Array.from({ length: 50 }, () => kit('legendary', 'jeong', 10));
const wideP = kitPower(wide, 'hwagyeong');
ck('50개 키트 kitPower 유한(초과분 0.05 폴백)', finite(wideP) && wideP > 0, `p=${wideP}`);
// 9번째부터 폴백이 적용돼도 합이 무한 누적하지 않음(감쇠) — 100개 vs 50개 차이 작아야.
const wider = kitPower(Array.from({ length: 100 }, () => kit('legendary', 'jeong', 10)), 'hwagyeong');
ck('100개 vs 50개 — 추가 50개 한계기여 작음(<2×)', finite(wider) && wider < wideP * 2, `50=${wideP} 100=${wider}`);

// ── 4. 정+사마 상극 누적 — 패널티 0.2 상한 ──
const conflictHeavy = [kit('legendary', 'jeong', 10), ...Array.from({ length: 10 }, () => kit('master', 'ma', 8))];
const cleanSame = [kit('legendary', 'jeong', 10), ...Array.from({ length: 10 }, () => kit('master', 'jeong', 8))];
const pConf = kitPower(conflictHeavy, 'hwagyeong');
const pClean = kitPower(cleanSame, 'hwagyeong');
ck('상극 키트 패널티 ≤20% (clean 대비)', pConf >= pClean * 0.8 - 1, `conf=${pConf} clean=${pClean} 비=${(pConf / pClean).toFixed(3)}`);
ck('상극 키트도 유한·양수', finite(pConf) && pConf > 0);

// ── 5. 단조성 — 경지가 오르면 같은 키트 전투력 비감소 ──
const baseKit = [{ artId: (legendaries[0] ?? someArt).id, seong: 8 }];
let monoRealm = true; let prev = -1; const realmTrace: number[] = [];
for (const r of REALM_ORDER) {
  const p = combatPower(disc(baseKit, r));
  realmTrace.push(p);
  if (p < prev) monoRealm = false;
  prev = p;
}
ck('경지↑ → combatPower 비감소(역전 없음)', monoRealm, realmTrace.join('→'));

// ── 6. 단조성 — 성이 오르면 전투력 비감소 ──
let monoSeong = true; let prevS = -1; const seongTrace: number[] = [];
for (let s = 1; s <= 10; s += 1) {
  const p = combatPower(disc([{ artId: (legendaries[0] ?? someArt).id, seong: s }], 'jeoljeong'));
  seongTrace.push(p);
  if (p < prevS) monoSeong = false;
  prevS = p;
}
ck('성↑ → combatPower 비감소', monoSeong, seongTrace.join('→'));
// combatRating 도 주력 성↑ 비감소.
let monoRating = true; let prevR = -1;
for (let s = 0; s <= 10; s += 1) {
  const cr = combatRating(disc([{ artId: someArt.id, seong: s }], 'jeoljeong'));
  if (cr < prevR) monoRating = false;
  prevR = cr;
}
ck('주력 성↑ → combatRating 비감소', monoRating);

// ── 7. 비정상 입력 방어 ──
const negSeong = disc([{ artId: someArt.id, seong: -5 }], 'ilryu');
ck('음수 성 → 기여 0(Math.max 가드)', combatPower(negSeong) === 0, `cp=${combatPower(negSeong)}`);
const hugeSeong = kitPower([kit('legendary', 'jeong', 1e6)], 'hwagyeong');
ck('거대 성(1e6) kitPower 유한(발산 없음)', finite(hugeSeong), `p=${hugeSeong}`);
const unknownArt = disc([{ artId: 'art-does-not-exist-xyz', seong: 9 }], 'hwagyeong');
ck('미정의 무공 id → 키트서 제외(0 처리, NaN 없음)', combatPower(unknownArt) === 0, `cp=${combatPower(unknownArt)}`);

// ── 8. GRADE_COEF 단조(등급↑ 계수↑) ──
const order: MartialArtGrade[] = ['novice', 'apprentice', 'master', 'grandmaster', 'legendary'];
let gradeMono = true;
for (let i = 1; i < order.length; i += 1) if (GRADE_COEF[order[i]] <= GRADE_COEF[order[i - 1]]) gradeMono = false;
ck('등급계수 단조 증가', gradeMono, order.map((g) => GRADE_COEF[g]).join('<'));

console.log(`\n[정보] 전설급 무공 ${legendaries.length} · 경지단계 ${REALM_ORDER.length} · 최강예시 cp=${maxCP}/cr=${maxCR}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
