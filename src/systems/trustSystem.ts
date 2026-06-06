// 사부신뢰도(trustToMaster, 0~100) — 숨김 변수.
// UI엔 숫자 비공개, 풍경 라벨로만 노출 (메모리 feedback_hidden_game_state / docs/06 §UI 노출 정책 / docs/12).
// 체력의 staminaSceneLabel 과 동일한 패턴. 제자 상세 화면에서만 사용 (로스터엔 노출 X).

export function trustSceneLabel(trust: number): string {
  if (trust >= 80) return '사부를 진심으로 우러른다';
  if (trust >= 60) return '사부를 깊이 믿는다';
  if (trust >= 40) return '사부를 따른다';
  if (trust >= 20) return '아직 서먹하다';
  return '사부를 보는 눈빛이 식었다';
}
