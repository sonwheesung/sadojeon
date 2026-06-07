// 영역 학습 효율 → 배율. docs/28 §2.
// 특화 = 설계 페이스(기준), 상극 = 25배 느려 사실상 졸업 안엔 정체(체감 천장).
// 별 등급(starRank)·재능 5축(talents)을 대체하는 성장 속도 축.

import type { EfficiencyTier } from '@/types/disciple';

export const EFFICIENCY_MULTIPLIER: Record<EfficiencyTier, number> = {
  특화: 1.0,
  상성: 0.6,
  보통: 0.35,
  미숙: 0.1,
  상극: 0.04,
};

// 외공(근골 — 근력·체력) 전용 압축 효율. docs/28 §2·§5-1.
// 외공은 무공 갈래보다 "노력(어릴 때 단련)"에 좌우 — 재능 페널티를 완만히(상극도 0 아님).
// → 보통 재능도 어릴 때 몸에 투자하면 절정~초절정 외공(근력 50~65)에 닿는다.
export const BODY_EFFICIENCY_MULTIPLIER: Record<EfficiencyTier, number> = {
  특화: 1.0,
  상성: 0.8,
  보통: 0.62,
  미숙: 0.35,
  상극: 0.18,
};

export const EFFICIENCY_ORDER: readonly EfficiencyTier[] = [
  '특화',
  '상성',
  '보통',
  '미숙',
  '상극',
] as const;
