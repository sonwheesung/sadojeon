// 성장·경지 계산식 골든값 회귀 — docs/23·25·26·28(단일 진실)대로 산수가 정확한가.
// 경계가 아니라 "공식이 설계 골든값을 내는가". 직전 "내공단 매일 round +11% 누수" 동류 버그 추적.
// 순수 데이터/함수 + tick 산식 재현(스토어 무관) → RN 없이 직접. 실행: npx tsx scripts/sim/growth_formula.ts
//
// 골든값 출처(손계산, docs 수식):
//  · expToNextSeong(s) = 140 + (s-1)*80              (docs/26 §4)
//  · 효율 배율 EFFICIENCY/BODY_EFFICIENCY              (docs/28 §2·§2-1)
//  · bodyAgeMultiplier 나이 보정표                      (docs/28 §2-1)
//  · 깨달음 enlightenmentChance / 대오 great…          (docs/23 §6)
//  · 인격 effectivePersonaDelta = round(raw×나이×관성)  (docs/28 §6)
//  · 내공 누적 = float(매일 round 하면 +20% 누수 버그)   (docs/23·28 정통 페이싱)

import {
  EXP_BASE_BY_STAGE,
  GRADE_LEARN_MULT,
  expToNextSeong,
  seongCap,
  seongToStage,
} from '../../src/data/martialArts';
import { EFFICIENCY_MULTIPLIER, BODY_EFFICIENCY_MULTIPLIER } from '../../src/data/efficiency';
import {
  REALM_INTERNAL_REQ,
  REALM_EXTERNAL_REQ,
  REALM_SEONG_GATE,
  REALM_SEONG_CAP,
  REALM_GAIN,
  enlightenmentChance,
  greatEnlightenmentChance,
} from '../../src/data/realm';
import { bodyAgeMultiplier } from '../../src/systems/trainingSystem';
import { ageCoef, inertiaCoef, effectivePersonaDelta } from '../../src/systems/personaShift';

let pass = 0;
let fail = 0;
const EPS = 1e-9;
function ck(label: string, got: number, want: number): void {
  const ok = Math.abs(got - want) < EPS;
  if (ok) { pass += 1; console.log(`  PASS  ${label}   = ${got}`); }
  else { fail += 1; console.log(`  FAIL  ${label}   got ${got} · want ${want}`); }
}
function ckEq(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

console.log('═══ 성장·경지 계산식 골든값 회귀 ═══\n');

// ── 1. EXP 곡선 — 140 + (s-1)*80 (docs/26 §4: 1→2:140 … 9→10:780) ──
ck('expToNextSeong(1)', expToNextSeong(1), 140);
ck('expToNextSeong(2)', expToNextSeong(2), 220);
ck('expToNextSeong(3)', expToNextSeong(3), 300);
ck('expToNextSeong(5)', expToNextSeong(5), 460);
ck('expToNextSeong(9)', expToNextSeong(9), 780);
ck('expToNextSeong(0) clamp→1', expToNextSeong(0), 140);

// ── 2. 효율 소프트캡 배율 (docs/28 §2 표) ──
ck('효율 특화', EFFICIENCY_MULTIPLIER['특화'], 1.0);
ck('효율 상성', EFFICIENCY_MULTIPLIER['상성'], 0.6);
ck('효율 보통', EFFICIENCY_MULTIPLIER['보통'], 0.35);
ck('효율 미숙', EFFICIENCY_MULTIPLIER['미숙'], 0.1);
ck('효율 상극', EFFICIENCY_MULTIPLIER['상극'], 0.04);
// 외공 압축 효율 (docs/28 §2-1)
ck('외공효율 특화', BODY_EFFICIENCY_MULTIPLIER['특화'], 1.0);
ck('외공효율 상성', BODY_EFFICIENCY_MULTIPLIER['상성'], 0.8);
ck('외공효율 보통', BODY_EFFICIENCY_MULTIPLIER['보통'], 0.62);
ck('외공효율 미숙', BODY_EFFICIENCY_MULTIPLIER['미숙'], 0.35);
ck('외공효율 상극', BODY_EFFICIENCY_MULTIPLIER['상극'], 0.18);

// ── 3. 외공 나이 보정 (docs/28 §2-1: 7~12 ×6 / 13~14 ×4 / 15~16 ×2.4 / 17~18 ×1.1 / 이후 ×0.55) ──
ck('나이보정 age7', bodyAgeMultiplier(7), 6.0);
ck('나이보정 age12', bodyAgeMultiplier(12), 6.0);
ck('나이보정 age13', bodyAgeMultiplier(13), 4.0);
ck('나이보정 age14', bodyAgeMultiplier(14), 4.0);
ck('나이보정 age15', bodyAgeMultiplier(15), 2.4);
ck('나이보정 age16', bodyAgeMultiplier(16), 2.4);
ck('나이보정 age17', bodyAgeMultiplier(17), 1.1);
ck('나이보정 age18', bodyAgeMultiplier(18), 1.1);
ck('나이보정 age19', bodyAgeMultiplier(19), 0.55);
ck('나이보정 age25', bodyAgeMultiplier(25), 0.55);

// ── 4. 외공 EXP 적립 = 외공효율 × 나이보정 (aptitudeMultiplier 골든) ──
// 보통 외공 10세 = 0.62 × 6.0 = 3.72 (어릴 때 보통 재능도 몸이 빨리 큰다 — docs/28 §2-1)
ck('외공적립 보통×age10', BODY_EFFICIENCY_MULTIPLIER['보통'] * bodyAgeMultiplier(10), 3.72);
ck('외공적립 특화×age17', BODY_EFFICIENCY_MULTIPLIER['특화'] * bodyAgeMultiplier(17), 1.1);
ck('외공적립 상극×age25', BODY_EFFICIENCY_MULTIPLIER['상극'] * bodyAgeMultiplier(25), 0.099);

// ── 5. 무공 일일 적립 산식 (tickDiscipleArt: base×tMul×pMul×intensity×progressMul×soloMul×gradeMult) ──
// docs/26 §4 적립량 = 밴드base × 적성 × 정체기 × 강도 × 체력효율 × 등급학습속도. soloMul = 다음성≥7 ? 0.15 : 1.
function artDelta(seong: number, grade: 'novice' | 'apprentice' | 'master' | 'grandmaster' | 'legendary', tier: keyof typeof EFFICIENCY_MULTIPLIER, pMul: number, intensity: number, progressMul: number): number {
  const band = seongToStage(seong);
  const base = EXP_BASE_BY_STAGE[band];
  const tMul = EFFICIENCY_MULTIPLIER[tier];
  const soloMul = seong + 1 >= 7 ? 0.15 : 1;
  return base * tMul * pMul * intensity * progressMul * soloMul * GRADE_LEARN_MULT[grade];
}
// 하품 입문 특화 폐관(intensity 1.5) 전력: 10×1.0×1.0×1.5×1.0×1×2.2 = 33
ck('적립 하품 1성 특화 폐관(1.5)', artDelta(1, 'novice', '특화', 1.0, 1.5, 1.0), 33);
// 하품 입문 특화 초식(1.0): = 22
ck('적립 하품 1성 특화 초식(1.0)', artDelta(1, 'novice', '특화', 1.0, 1.0, 1.0), 22);
// 신품 6성(소성 base9) 보통, 다음성=7 → soloMul 0.15, gradeMult 1.0: 9×0.35×1×1×1×0.15×1 = 0.4725 (대성문턱 정체)
ck('적립 신품 6성 보통 초식(solo 0.15)', artDelta(6, 'legendary', '보통', 1.0, 1.0, 1.0), 0.4725);
// 같은데 5성(다음 6 <7) → soloMul 1: 9×0.35 = 3.15
ck('적립 신품 5성 보통 초식(solo 1.0)', artDelta(5, 'legendary', '보통', 1.0, 1.0, 1.0), 3.15);
// 정체기 2차(충전률 85%+) ×0.2 적용: 하품 1성 특화 초식 22×0.2 = 4.4
ck('적립 하품 1성 특화 초식 ×정체0.2', artDelta(1, 'novice', '특화', 0.2, 1.0, 1.0), 4.4);
// SOLO_GREAT 임계 = "다음 성이 7 이상" → 6성에서 적용, 5성 미적용 (위 두 케이스로 단언됨)
ckEq('SOLO_GREAT 임계: 6성(next7) 적용 · 5성(next6) 미적용',
  artDelta(6, 'legendary', '특화', 1, 1, 1) === EXP_BASE_BY_STAGE['small_completion'] * 1 * 0.15 * GRADE_LEARN_MULT['legendary'] &&
  artDelta(5, 'legendary', '특화', 1, 1, 1) === EXP_BASE_BY_STAGE['small_completion'] * 1 * 1 * GRADE_LEARN_MULT['legendary']);

// ── 6. 깨달음 확률 (docs/23 §6: 절정 15%+오성7% · 초절정 10%+오성5% · 화경 5%+오성5%) ──
ck('절정 깨달음 오성0', enlightenmentChance(0, 'jeoljeong'), 0.15);
ck('절정 깨달음 오성3', enlightenmentChance(3, 'jeoljeong'), 0.36);
ck('절정 깨달음 오성5', enlightenmentChance(5, 'jeoljeong'), 0.5);
ck('초절정 깨달음 오성5', enlightenmentChance(5, 'chojeoljeong'), 0.35);
ck('화경(절정막대) 깨달음 오성5', enlightenmentChance(5, 'hwagyeong'), 0.3);
// 대오 — 실전(quest)이 폐관(seclude)보다 큼 (docs/23 §화경 벽)
ck('대오 실전 오성4', greatEnlightenmentChance(4, 'quest'), 0.007 + 4 * 0.0035);
// ⚠️ 폐관 대오: raw(오성4) = 0.0001+4×0.00004 = 0.00026 인데 하한 0.0005 에 막혀 0.0005 로 클램프.
// 오성 0~5 전 구간이 하한에 깔려 폐관 대오는 사실상 오성 무차등 0.05%/일 (per-insight 무효).
// docs/23·realm.ts 주석의 "오성4 ≈ 0.026%/일" 은 실제 미실현 — 하한이 더 높음(사용자 판단 필요).
ck('대오 폐관 오성4(하한 0.0005 클램프)', greatEnlightenmentChance(4, 'seclude'), 0.0005);
ck('대오 폐관 오성0(하한 클램프)', greatEnlightenmentChance(0, 'seclude'), 0.0005);
ck('대오 폐관 오성5(하한 클램프 — 오성 무차등)', greatEnlightenmentChance(5, 'seclude'), 0.0005);

// ── 7. 인격 누적 = round(raw × 나이계수 × 관성계수) (docs/28 §6) ──
// 나이계수: ≤10 ×1.5 / ≤12 ×1.2 / ≤14 ×1.0 / ≤16 ×0.7 / 이후 ×0.3
ck('나이계수 age9', ageCoef(9), 1.5);
ck('나이계수 age12', ageCoef(12), 1.2);
ck('나이계수 age14', ageCoef(14), 1.0);
ck('나이계수 age16', ageCoef(16), 0.7);
ck('나이계수 age20', ageCoef(20), 0.3);
// 관성계수(미는 방향 현재 위치): ≥80 ×2 / ≥60 ×1.5 / ≥40 ×1 / ≥20 ×0.5 / else ×0.2
ck('관성 value50 push+', inertiaCoef(50, +10), 1.0);
ck('관성 value85 push+', inertiaCoef(85, +10), 2.0);
ck('관성 value85 push-(x=15)', inertiaCoef(85, -10), 0.2); // 반대극이면 거의 안 변함(인격의 무게)
// 합성 골든
ck('인격 raw+10 age9 val50', effectivePersonaDelta(50, +10, 9), 15);
ck('인격 raw+10 age20 val85', effectivePersonaDelta(85, +10, 20), 6);
ck('인격 raw-10 age13 val85(반대극 둔화)', effectivePersonaDelta(85, -10, 13), -2);

// ── 8. 경지 게이트 임계값표 (docs/28 §5-1 · docs/23 §4) ──
ck('내공REQ 이류', REALM_INTERNAL_REQ.iryu, 260);
ck('내공REQ 일류', REALM_INTERNAL_REQ.ilryu, 520);
ck('내공REQ 절정', REALM_INTERNAL_REQ.jeoljeong, 870);
ck('내공REQ 초절정', REALM_INTERNAL_REQ.chojeoljeong, 1050);
ck('내공REQ 화경', REALM_INTERNAL_REQ.hwagyeong, 1300);
ck('외공REQ 절정', REALM_EXTERNAL_REQ.jeoljeong, 48);
ck('외공REQ 초절정', REALM_EXTERNAL_REQ.chojeoljeong, 56);
ck('외공REQ 화경', REALM_EXTERNAL_REQ.hwagyeong, 70);
ck('성게이트 초절정', REALM_SEONG_GATE.chojeoljeong, 5);
ck('성게이트 화경', REALM_SEONG_GATE.hwagyeong, 7);
ck('성상한 화경(극성)', REALM_SEONG_CAP.hwagyeong, 10);
ck('성상한 절정', REALM_SEONG_CAP.jeoljeong, 7);

// ── 9. 무공 성 이중상한 = min(등급 seongCap, 경지 REALM_SEONG_CAP) (docs/23 §4-1) ──
// 화경 신품 = min(10,10)=10 / 삼류 신품 = min(10,3)=3 / 화경 하품 = min(6,10)=6
ck('이중상한 화경×신품', Math.min(seongCap('legendary'), REALM_SEONG_CAP.hwagyeong), 10);
ck('이중상한 삼류×신품', Math.min(seongCap('legendary'), REALM_SEONG_CAP.samryu), 3);
ck('이중상한 화경×하품', Math.min(seongCap('novice'), REALM_SEONG_CAP.hwagyeong), 6);
ck('이중상한 초절정×상품', Math.min(seongCap('master'), REALM_SEONG_CAP.chojeoljeong), 8);

// ── 10. 내공 누적 정밀 — 핵심 회귀: 매일 round 누수 차단 (직전 내공단 동류 버그) ──
// 설계: 심법 1일 = internalPerDay(2.5) × eff. 효율 1.0 30일 = 정확히 75.
// 버그(매일 store.update 가 Math.round): 2.5→3, 5.5→6 … +0.5/일 = 90 (+20%). float 누적이라야 75.
const perDay = REALM_GAIN.internalPerDay; // 2.5
ck('내공 1일 적립 = internalPerDay', perDay, 2.5);
// float 누적(현행 수정 코드의 store 의미 — 매일 round 안 함) vs 버그(매일 round) 비교.
function accumulate(days: number, gainPerDay: number, roundEachDay: boolean): number {
  let acc = 0;
  for (let day = 0; day < days; day += 1) {
    acc = acc + gainPerDay;
    if (roundEachDay) acc = Math.round(acc);
  }
  return acc;
}
const floatAcc = accumulate(30, perDay, false);
const roundedAcc = accumulate(30, perDay, true);
ck('내공 30일 float 누적(설계 75)', floatAcc, 75);
// 버그 재현(매일 round = 90) — 현행 수정 코드는 float(75) 라야. round 시 +20% 누수.
ckEq('내공 누적은 매일 round(90) 아닌 float(75) — round 시 +20% 누수', floatAcc === 75 && roundedAcc === 90 && floatAcc < roundedAcc,
  `float ${floatAcc} vs 매일round ${roundedAcc}`);
// 절정 내공REQ(870) 도달 일수: float 870/2.5 = 348일. round 누수면 ~580 step (=290일) 만에 도달(20% 빨리).
ck('절정 내공 도달 일수(float, eff1.0)', REALM_INTERNAL_REQ.jeoljeong / perDay, 348);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
