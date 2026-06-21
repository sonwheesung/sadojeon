// 경지 데이터 — docs/23_경지_시스템.md. 모든 수치 그레이박스(밸런싱 전 임시).

import type { MartialArtGrade } from '@/types/martialArt';
import { REALM_ORDER, type Realm } from '@/types/realm';

// 별 등급 폐기(docs/28 §5). 천장은 주력 무공서 등급이 정한다.
// 주력 무공서가 없을 때의 기본값만 — 무공 기둥이 비면 경지가 못 오르므로 보수적으로 일류.
export function realmCeiling(): Realm {
  return 'ilryu';
}

// 무공서(비급) 등급 → 받쳐주는 경지. docs/04 "별 1~5 등급 체계".
// 하품 검법으론 절정에 못 닿는다 — 상승 무공서가 있어야 위로 간다.
export function artGradeRealmCeiling(grade: MartialArtGrade): Realm {
  switch (grade) {
    case 'novice':
      return 'ilryu'; //        하품 ~일류
    case 'apprentice':
      return 'jeoljeong'; //    중품 ~절정
    case 'master':
      return 'chojeoljeong'; // 상품 ~초절정
    case 'grandmaster':
    case 'legendary':
      return 'hwagyeong'; //    절품·신품 화경
  }
}

// 실제 경지 천장 = 주력 무공서 등급(별 등급 폐기, docs/28 §5).
// 천장에 닿는 *속도*는 무공 갈래 효율(소프트캡)이 정한다 — trainingSystem.
export function effectiveRealmCeiling(grade: MartialArtGrade): Realm {
  return artGradeRealmCeiling(grade);
}

export function nextRealm(r: Realm): Realm | null {
  const i = REALM_ORDER.indexOf(r);
  if (i < 0 || i >= REALM_ORDER.length - 1) return null;
  return REALM_ORDER[i + 1];
}

export function realmIndex(r: Realm): number {
  return REALM_ORDER.indexOf(r);
}

// targetRealm 으로 들어갈 때 요구되는 내공 누적치. 경지 높을수록 ↑. (그레이박스)
// 내공 요구치 — 졸업(10세→~25세) 동안 정통 무협 속도로 경지가 열리게 재배치(2026-06-13, Approach A).
// 내공은 두 길로 쌓인다: 심법 수련(internalPerDay) + 실전 의뢰(QUEST_INTERNAL_PER_WEEK, questSystem) → 은둔
// 수련자·모험가 둘 다 성장. 화경=1300 유지(전투 qiEdge ÷1300 불변), 자연 내공은 ~초절정에서 멈추고
// 화경 내공은 환골탈태(영약, 임독양맥 타통=내공 도약)가 채운다(wallInternalReq).
export const REALM_INTERNAL_REQ: Record<Realm, number> = {
  none: 0,
  samryu: 0,
  iryu: 260,
  ilryu: 520,
  jeoljeong: 870,
  chojeoljeong: 1050,
  hwagyeong: 1300,
};

// 벽에 "서는 데" 필요한 내공 — 화경만 예외: 초절정 내공(1050)이면 선다. 화경 내공(1300)의 나머지는
// 환골탈태가 채우므로(영약 게이트), 자연 내공을 정통 속도로 늦춰도 화경은 영약으로 도달한다. docs/23 §5.
export function wallInternalReq(target: Realm): number {
  return target === 'hwagyeong' ? REALM_INTERNAL_REQ.chojeoljeong : REALM_INTERNAL_REQ[target];
}

// targetRealm 진입 외공(체력·근골 ≈ strength level 0~100) 요구. docs/28 §5-1. 세 기둥 중 하나.
// "체력만으론 경지 X" — 내공·무공서와 함께 충족해야. 가장 약한 기둥이 경지를 잡아끈다.
// 고경지 외공 — str보통 도달선으로 현실화(project_realm_balance 화경 경로).
// 화경 외공 70 = "화경의 몸"(결정 2026-06-10). 단 외공 보통 재능의 수련 한계가 ~65라 70은 스스로 못 채움 —
// 마지막 8은 신품 영약의 **환골탈태**(BONE_REBIRTH_STRENGTH_BONUS)가 채운다. 즉 스스로 62(받침)까지
// 단련한 몸이라야 영약이 화경의 몸(70)으로 다시 빚는다. 시뮬(2026-06-12 재검증): 무과금
// 조합(제련+검수) 화경 63%(30회) · 실코드 게이트 trainsweep 화경 도달 확인(솔로 최악 15년 턱걸이).
export const REALM_EXTERNAL_REQ: Record<Realm, number> = {
  none: 0,
  samryu: 10,
  iryu: 20,
  ilryu: 35,
  jeoljeong: 48,
  chojeoljeong: 56,
  hwagyeong: 70,
};

// 환골탈태 — 신품 영약 복용 순간 외공(strength) 영구 +8. 몸이 다시 태어난다(정통무협).
// 화경 벽 도전 자격(받침) = REALM_EXTERNAL_REQ.hwagyeong − 이 보너스 = 62.
export const BONE_REBIRTH_STRENGTH_BONUS = 8;

// targetRealm 벽 도전에 필요한 "스스로 단련한" 외공 받침. 화경만 환골탈태 몫(+8)을 영약이 대신 채운다.
export function externalSupportReq(target: Realm): number {
  const req = REALM_EXTERNAL_REQ[target];
  return target === 'hwagyeong' ? req - BONE_REBIRTH_STRENGTH_BONUS : req;
}

// targetRealm 진입 주력 무공서 성 게이트. docs/28 §5: ~절정 등급무관(0), 초절정 5성, 화경 7성(대성).
// 무공서 등급 천장(effectiveRealmCeiling)이 1차, 이 성 게이트가 "그 무공을 익혔나" 2차.
export const REALM_SEONG_GATE: Record<Realm, number> = {
  none: 0,
  samryu: 0,
  iryu: 0,
  ilryu: 0,
  jeoljeong: 0,
  chojeoljeong: 5,
  hwagyeong: 7,
};

// 깨달음 벽 — 경지 위치 고정(별 등급 폐기, docs/23 §5 · docs/28). 절정 진입부터 벽.
// 일류→절정, 절정→초절정, 초절정→화경 진입이 깨달음 게이트. 그 아래는 막대 충족 시 자동.
// 자질 차등은 starRank가 아니라 오성(enlightenmentChance)이 가른다.
const WALL_TARGETS: readonly Realm[] = ['jeoljeong', 'chojeoljeong', 'hwagyeong'];

export function isWallTransition(target: Realm): boolean {
  return WALL_TARGETS.includes(target);
}

// 일일 내공 적립 (그레이박스). 효율(체력비율)에 곱해진다.
export const REALM_GAIN = {
  internalPerDay: 2.5, // 심법 수련 1일 → 내공 + (10→2.5, 정통 속도 2026-06-13. 실전 의뢰도 내공 적립(questSystem))
} as const;

// 경지별 주력 무공 성(成) 상한 — 그 경지가 받쳐주는 무공 깊이. docs/26 · project_realm_seong_design.
// 무공 성은 그 경지를 "따라" 자라되 min(별 등급 상한, 이 경지 상한) 까지만. → 10성은 화경이라야.
export const REALM_SEONG_CAP: Record<Realm, number> = {
  none: 0,
  samryu: 3, //   입문 밴드 끝
  iryu: 4,
  ilryu: 6, //    소성 밴드 끝
  jeoljeong: 7, // 대성 입
  chojeoljeong: 8,
  hwagyeong: 10, // 극성
};

// 무공서 학습 경지 게이트 — 어려운(상급) 비급은 그 경지에 올라야 입문 가능. docs/26 §5-1.
// 충분한 내공·경지·깨달음 없이는 상승 무공을 "이해조차" 못 한다(화산귀환 결).
export function artGradeLearnRealm(grade: MartialArtGrade): Realm {
  switch (grade) {
    case 'novice':
    case 'apprentice':
      return 'samryu'; //     하품·중품 — 입문기부터
    case 'master':
      return 'iryu'; //        상품 — 이류부터
    case 'grandmaster':
      return 'ilryu'; //       절품 — 일류부터
    case 'legendary':
      return 'jeoljeong'; //   신품 — 절정부터
  }
}

// 새 무공을 익힐 때 시작 성 — 경지가 받침이 되어 기초를 건너뛴다(고수는 금방 익힘). docs/26 §5-2.
// 실제 시작 성 = min(이 floor, seongCap(등급), REALM_SEONG_CAP[경지]).
export const REALM_LEARN_FLOOR: Record<Realm, number> = {
  none: 1,
  samryu: 1,
  iryu: 2,
  ilryu: 3,
  jeoljeong: 4,
  chojeoljeong: 5,
  hwagyeong: 6,
};

// 깨달음(무의) 확률 — f(오성, 경지 높이). docs/23 §6. 오성 1~5(talents.insight).
// 경지 높을수록 base·계수 낮음.
const ENLIGHTENMENT_BASE: Partial<Record<Realm, { base: number; perInsight: number }>> = {
  iryu: { base: 0.3, perInsight: 0.06 },
  ilryu: { base: 0.22, perInsight: 0.06 },
  jeoljeong: { base: 0.15, perInsight: 0.07 },
  chojeoljeong: { base: 0.1, perInsight: 0.05 },
  hwagyeong: { base: 0.05, perInsight: 0.05 },
};

export function enlightenmentChance(insight: number, target: Realm): number {
  const c = ENLIGHTENMENT_BASE[target] ?? { base: 0.15, perInsight: 0.06 };
  const raw = c.base + Math.max(0, insight) * c.perInsight;
  return Math.max(0.02, Math.min(0.95, raw));
}

// 순수 RNG 방지(pity) — 폐관 굴림 실패마다 확률 누적, 보장치 도달 시 자동 성공. docs/23 §6.
// ⚠️ pity 보장은 절정·초절정 벽까지만 — 화경의 대오(아래)는 보장 없음.
export const ENLIGHTENMENT_PITY_STEP = 0.05; // 실패 1회당 +5%p
export const ENLIGHTENMENT_PITY_GUARANTEE = 12; // 누적 12회 실패 → 다음은 보장

// 대오(大悟) — 화경 벽 전용 큰 깨달음(✅ 사용자 결정 2026-06-12: "비급 전권이어도 화경이 확정이면
// 재미없다 — 운과 실력이 받쳐야"). 환골탈태(몸·약) 전에 마음이 먼저 열려야 한다.
// · 보장(pity) 없음 — 화경은 하늘이 허락해야 하는 영역. 다회차 누적으로도 확정 불가.
// · 폐관(앉아서)은 매일 굴려도 확률이 아주 낮고, 실전(위험·극험 의뢰)에서 크게 높다 —
//   "강호에서 깨닫는다". 위험을 감수하는 플레이(실력)가 운을 키운다. 🔧 그레이박스(시뮬 튜닝).
// ✅ 목표 분포(사용자 확정 2026-06-12): 실력 없음(폐관만·오성 낮음) ≈ 10% / 적당한 실력+운 ≈ 50%
// / 실력 최상+운 나쁨 ≈ 30% / 실력 최상+운 좋음 ≈ 80% (최상 실력 평균 ≈ 55~65%).
// 🔧 대오 배율 — 화경 천장 튜닝 손잡이(실전 대오에만). 기본 1. balance-sim 에서 `DAEOH_SCALE=N` env 로
// sweep(앱은 env 없어 기본). 무과금 최적 화경 ≤20% 목표(docs/23 §화경 벽, 2026-06-21). 확정 후 base 에 굳힘.
const DAEOH_QUEST_SCALE = Number(process.env.DAEOH_SCALE) || 1;

// 🔧 외공(근력) 자연 성장 배율 — 화경 페이싱 손잡이(docs/23 §화경 벽, 2026-06-21). 외공이 화경 벽 마지막
// 관문(받침 62)인데 자연 수련+실전으로 너무 빨리(8년차) 닿아 대오 굴림 창이 컸다. 자연 외공(단련+실전)을
// 늦춰 무과금은 벽에 늦게(화경↓), 외공 영약(과금·연단)으로 가속하면 일찍(화경↑) 가른다. 단련·실전 양쪽 적용.
// 기본 1. balance-sim `EXT_SCALE=N` env sweep. 확정 후 굳힘. (최대체력 endurance·금강불괴 굴림엔 미적용.)
export const EXTERNAL_PACING_SCALE = Number(process.env.EXT_SCALE) || 1;
export const GREAT_ENLIGHTENMENT = {
  secludePerDayBase: 0.0001, // 폐관 1일당 기본 0.01% — 폐관만 수년 돌려도 ~10%대(소극 플레이의 천장)
  secludePerDayPerInsight: 0.00004, // + 오성×0.004%p (오성4 ≈ 0.026%/일)
  questBase: 0.007 * DAEOH_QUEST_SCALE, // 결투·큰의뢰 생환 1회당 기본 0.7% — 실전이 대오의 주 무대
  questPerInsight: 0.0035 * DAEOH_QUEST_SCALE, // + 오성×0.35%p (오성3 ≈ 1.75% · 오성4 ≈ 2.1% · 오성5 ≈ 2.45%/회)
} as const;

export function greatEnlightenmentChance(insight: number, mode: 'seclude' | 'quest'): number {
  const i = Math.max(0, insight);
  const raw =
    mode === 'seclude'
      ? GREAT_ENLIGHTENMENT.secludePerDayBase + i * GREAT_ENLIGHTENMENT.secludePerDayPerInsight
      : GREAT_ENLIGHTENMENT.questBase + i * GREAT_ENLIGHTENMENT.questPerInsight;
  // 하한은 곡선 아래로(폐관 base 0.0001) — 오성 차등이 살아 있게. 종전 0.0005 가 폐관 곡선
  // (0.0001~0.0003)을 통째로 덮어 오성 무차등이 되던 버그(2026-06-19 계산식 감사). quest(min 0.007)는 무관.
  return Math.max(0, Math.min(0.5, raw));
}

// 폐관 청원 허락 시 기본 폐관 일수. 위험 의뢰(3주=21일)보다 길게 — 폐관은 느리지만 확실, 의뢰는
// 빠르되 부상 위험. 28일 = 4주(극험 의뢰와 동급 기간) + 벽곡단 2/일 = 56개 소모(무거운 사슬). docs/28 §5.
export const SECLUSION_PETITION_DAYS = 28;
