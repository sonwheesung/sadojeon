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

export const EFFICIENCY_ORDER: readonly EfficiencyTier[] = [
  '특화',
  '상성',
  '보통',
  '미숙',
  '상극',
] as const;
