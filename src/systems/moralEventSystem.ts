// 도덕적 갈등 이벤트 시스템 — docs/07_이벤트_시스템.md.
//
// Phase A 부터는 본 파일은 공통 이벤트 엔진(`eventEngine`)의 thin wrapper.
// 트리거·후보 수집·tier 픽·4층 효과 적용·history 적재는 모두 엔진에서 처리.
//
// 흐름:
//   advanceTurn() → triggerDailyMoralEvent() → eventEngine.dailyTick(['moral'])
//   사용자 4선택   → resolveMoralChoice(tone) → eventEngine.resolveChoice('moral', tone)
//
// 외부에서 import 하던 다음은 호환을 위해 그대로 export 유지:
//   - MORAL_DAILY_CHANCE (내부 상수는 engine 으로 이동, 본 파일에서는 참조용)
//   - triggerDailyMoralEvent, resolveMoralChoice
//   - insightTier (다른 곳에서 참조될 수 있음 — engine 으로 위임)

import { dailyTick, resolveChoice } from '@/systems/eventEngine';
import type { InsightTier, MoralChoiceTone } from '@/types';

// 매일 호출 시 발화 확률. 실제 적용은 engine 내부 상수.
export const MORAL_DAILY_CHANCE = 0.018;

export function triggerDailyMoralEvent(): void {
  dailyTick(['moral']);
}

export function resolveMoralChoice(tone: MoralChoiceTone): Promise<void> {
  return resolveChoice('moral', tone);
}

// 사부 insight 0~100 → ★ 1~5 단계. UI 가 통찰 hint 표시할 때 사용.
export function insightTier(insight: number): InsightTier {
  if (insight >= 80) return 5;
  if (insight >= 60) return 4;
  if (insight >= 40) return 3;
  if (insight >= 20) return 2;
  return 1;
}
