// 경지 데이터 — docs/23_경지_시스템.md. 모든 수치 그레이박스(밸런싱 전 임시).

import { REALM_ORDER, type Realm } from '@/types/realm';

// 별 등급 → 양육 천장(하드캡). docs/23 §3. ★1~3 절정, ★4 초절정, ★5 화경.
export function realmCeiling(starRank: number): Realm {
  if (starRank >= 5) return 'hwagyeong';
  if (starRank >= 4) return 'chojeoljeong';
  return 'jeoljeong';
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

// 일일 적립·감소 (그레이박스). 효율(체력비율)에 곱해진다.
export const REALM_GAIN = {
  martialPerDay: 12, // 초식 수련 1일 → 무공 막대 +
  internalPerDay: 10, // 심법 수련 1일 → 내공 +
  martialDecayPerDay: 3, // 무공 외도(체력·공부·휴식) 시 무공 막대 -
} as const;

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
