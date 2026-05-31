// 체력(stamina) 시스템 — docs/06_훈련_일정.md "체력 — 현재 vs 최대".
// 진척 효율·풍경 라벨은 모두 (현재 체력 / 최대 체력) 비율 기준.
// 활동별 체력 변동값은 종목 데이터(TrainingOption)로 이동 — 여기엔 더 이상 없다.

import { issueOverride } from './overrideSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { BASE_MAX_STAMINA } from '@/data/training';

// 비율 → 진척 배수. docs/06 임계치 표.
// 50~100%: ×1.0  / 30~50%: ×0.7  / 10~30%: ×0.4  / 0~10%: ×0.0
export function staminaRatioMultiplier(stamina: number, maxStamina: number): number {
  const max = maxStamina > 0 ? maxStamina : BASE_MAX_STAMINA;
  const ratio = stamina / max;
  if (ratio >= 0.5) return 1.0;
  if (ratio >= 0.3) return 0.7;
  if (ratio >= 0.1) return 0.4;
  return 0.0;
}

// 비율 단계 인덱스 (0~4) — 풍경 라벨 변화 감지용.
export function staminaLevelIndex(stamina: number, maxStamina: number): number {
  const max = maxStamina > 0 ? maxStamina : BASE_MAX_STAMINA;
  const ratio = stamina / max;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.3) return 2;
  if (ratio >= 0.1) return 1;
  return 0;
}

// 체력 풍경 — UI 노출용. 정확한 숫자는 비공개 (feedback_hidden_game_state).
export function staminaSceneLabel(stamina: number, maxStamina: number): string {
  switch (staminaLevelIndex(stamina, maxStamina)) {
    case 4:
      return '기력 왕성';
    case 3:
      return '기색 평안';
    case 2:
      return '기색 무거움';
    case 1:
      return '지친 기색';
    default:
      return '쓰러질 듯';
  }
}

// 체력 0 도달 시 강제 휴식 3일 + 신뢰 -3 (사부의 무리시킴).
// issueOverride 의 healing 명령으로 처리.
export const COLLAPSE_REST_DAYS = 3;
export const COLLAPSE_TRUST_DELTA = -3;

export function triggerCollapse(discipleId: string): void {
  issueOverride(discipleId, 'healing', COLLAPSE_REST_DAYS);
  useDiscipleStore.getState().adjustTrust(discipleId, COLLAPSE_TRUST_DELTA);
}
