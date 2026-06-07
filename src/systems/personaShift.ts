// 인격 변화량 산출 — 평면 델타가 아니라 나이 계수 × 관성 계수. docs/28 §6.
// "어릴 때 각인(7~10 ×1.5), 졸업기엔 잘 안 변함(×0.3). 극단에 굳으면 반대 방향 변화 둔화."
// 모든 인격 변동(면담·의뢰·도덕)은 이 모듈을 거친다.

import type { Disciple, PersonalityTraits } from '@/types';
import { currentAge } from './discipleCtx';

// 나이 계수 — 각인기일수록 크게 변한다. docs/28 §6.
export function ageCoef(age: number): number {
  if (age <= 10) return 1.5; // 각인기
  if (age <= 12) return 1.2;
  if (age <= 14) return 1.0;
  if (age <= 16) return 0.7;
  return 0.3; // 출도기·졸업 후 — 거의 굳음
}

// 관성 계수 — 미는 방향으로 이미 가 있을수록 더 쉽게(×2.0), 정반대 극단이면 둔화(×0.2). docs/28 §6.
export function inertiaCoef(value: number, delta: number): number {
  const x = delta >= 0 ? value : 100 - value; // 미는 방향 기준 현재 위치(0~100)
  if (x >= 80) return 2.0;
  if (x >= 60) return 1.5;
  if (x >= 40) return 1.0;
  if (x >= 20) return 0.5;
  return 0.2;
}

// 한 축의 실제 변동값 = round(raw × 나이 × 관성).
export function effectivePersonaDelta(value: number, rawDelta: number, age: number): number {
  if (!rawDelta) return 0;
  return Math.round(rawDelta * ageCoef(age) * inertiaCoef(value, rawDelta));
}

// 제자 인격에 델타 묶음 적용(나이·관성 반영) → 새 personality(1~100 clamp). 저장은 호출자 책임.
export function shiftPersona(
  d: Disciple,
  deltas: Partial<Record<keyof PersonalityTraits, number>>,
): PersonalityTraits {
  const age = currentAge(d);
  const next: PersonalityTraits = { ...d.personality };
  for (const k of Object.keys(deltas) as (keyof PersonalityTraits)[]) {
    const raw = deltas[k];
    if (!raw) continue;
    const eff = effectivePersonaDelta(next[k], raw, age);
    next[k] = Math.max(1, Math.min(100, next[k] + eff));
  }
  return next;
}
