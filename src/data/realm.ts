// 경지 데이터 — docs/23_경지_시스템.md. 모든 수치 그레이박스(밸런싱 전 임시).

import type { MartialArtGrade } from '@/types/martialArt';
import { REALM_ORDER, type Realm } from '@/types/realm';

// 별 등급 → 잠재 천장(하드캡). docs/23 §3. ★1~3 절정, ★4 초절정, ★5 화경.
export function realmCeiling(starRank: number): Realm {
  if (starRank >= 5) return 'hwagyeong';
  if (starRank >= 4) return 'chojeoljeong';
  return 'jeoljeong';
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

// 실제 경지 천장 = 잠재(별) ∧ 무공서 등급 둘 중 낮은 것.
// → 천재(★5)라도 비급이 받쳐주지 않으면 못 오른다. 무공서 교체가 곧 성장의 열쇠.
export function effectiveRealmCeiling(starRank: number, grade: MartialArtGrade): Realm {
  const byStar = realmCeiling(starRank);
  const byArt = artGradeRealmCeiling(grade);
  return REALM_ORDER.indexOf(byStar) <= REALM_ORDER.indexOf(byArt) ? byStar : byArt;
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
export const REALM_INTERNAL_REQ: Record<Realm, number> = {
  none: 0,
  samryu: 0,
  iryu: 100,
  ilryu: 250,
  jeoljeong: 500,
  chojeoljeong: 850,
  hwagyeong: 1300,
};

// 깨달음 벽 — 별 등급별, targetRealm 으로 들어갈 때 깨달음이 필요한가. docs/23 §5.
// 벽이면 막대가 다 차도 자동 승급 X(깨달음 필요 — Phase 3). 벽 아니면 막대 충족 시 자동.
const WALLS_BY_STAR: Record<number, Realm[]> = {
  5: ['chojeoljeong', 'hwagyeong'],
  4: ['jeoljeong', 'chojeoljeong'],
  3: ['ilryu', 'jeoljeong'],
  2: ['iryu', 'ilryu', 'jeoljeong'],
  1: ['iryu', 'ilryu', 'jeoljeong'],
};

export function isWallTransition(starRank: number, target: Realm): boolean {
  const s = Math.max(1, Math.min(5, Math.floor(starRank)));
  return (WALLS_BY_STAR[s] ?? []).includes(target);
}

// 일일 내공 적립 (그레이박스). 효율(체력비율)에 곱해진다.
export const REALM_GAIN = {
  internalPerDay: 10, // 심법 수련 1일 → 내공 +
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
export const ENLIGHTENMENT_PITY_STEP = 0.05; // 실패 1회당 +5%p
export const ENLIGHTENMENT_PITY_GUARANTEE = 12; // 누적 12회 실패 → 다음은 보장

// 폐관 청원 허락 시 기본 폐관 일수.
export const SECLUSION_PETITION_DAYS = 14;
