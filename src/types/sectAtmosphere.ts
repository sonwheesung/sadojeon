// 사문 분위기 (門風) — docs/07_이벤트_시스템.md "사문 분위기 — 2축"
// 2축 누적: 도의 ↔ 무도 / 결속 ↔ 균열.
// 이벤트의 4층 효과 ③ 사문 분위기 효과가 모두 이 두 축으로 흘러들어옴.
// 모든 제자 행동 확률에 곱연산으로 영향 (추후).

export interface SectAtmosphere {
  // -10 (무도) ~ +10 (도의). 엄벌·훈계 누적 → +, 묵인 누적 → −.
  righteousness: number;
  // -10 (균열) ~ +10 (결속). 일관된 처분 → +, 변덕·차별 → −.
  unity: number;
}

export const ATMOSPHERE_MIN = -10;
export const ATMOSPHERE_MAX = 10;

// 풍경 라벨 — UI 노출용. 정확한 수치는 비공개 (메모리 룰 feedback_hidden_game_state).
export function righteousnessSceneLabel(v: number): string {
  if (v >= 7) return '도의 선명';
  if (v >= 3) return '도의 기색';
  if (v >= -2) return '잠잠';
  if (v >= -6) return '무도의 그림자';
  return '무도가 짙다';
}

export function unitySceneLabel(v: number): string {
  if (v >= 7) return '결속 단단';
  if (v >= 3) return '결속 기색';
  if (v >= -2) return '잠잠';
  if (v >= -6) return '균열의 기색';
  return '균열이 깊다';
}
