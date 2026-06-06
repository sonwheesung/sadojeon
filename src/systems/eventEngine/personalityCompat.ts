// 구 5축 시나리오 조건 ↔ 6축 인격 모델 브릿지. docs/28 §6.
// moralEvent 시나리오 데이터가 아직 구 5축 이름(diligence·pride·loyalty·curiosity·empathy)을
// 쓰므로, 평가/적용 시점에 6축 인격으로 매핑한다. (추후 시나리오 6축 재작성 시 이 파일 제거.)

import type { LegacyPersonalityAxis, PersonalityTraits } from '@/types';

// 구 축 조건을 읽을 때의 6축 값. (loyalty=의리/충성 → 의무 = 자유의 반대극)
export function legacyAxisValue(p: PersonalityTraits, axis: LegacyPersonalityAxis): number {
  switch (axis) {
    case 'diligence':
      return p.integrity; // 성실 → 강직
    case 'pride':
      return p.ambition; // 자존·자만 → 야망
    case 'empathy':
      return p.mercy; // 공감 → 자비
    case 'curiosity':
      return p.freedom; // 호기 → 자유
    case 'loyalty':
      return 100 - p.freedom; // 의리·충성 → 의무(자유 반대극)
  }
}

// 구 축 personalityShift 를 6축 모델에 적용(in-place).
export function applyLegacyShift(
  p: PersonalityTraits,
  axis: LegacyPersonalityAxis,
  delta: number,
): void {
  const c = (n: number) => Math.max(1, Math.min(100, n));
  switch (axis) {
    case 'diligence':
      p.integrity = c(p.integrity + delta);
      break;
    case 'pride':
      p.ambition = c(p.ambition + delta);
      break;
    case 'empathy':
      p.mercy = c(p.mercy + delta);
      break;
    case 'curiosity':
      p.freedom = c(p.freedom + delta);
      break;
    case 'loyalty':
      p.freedom = c(p.freedom - delta); // 의리↑ = 자유↓
      break;
  }
}
