// RuleResolver — defaultEffects 그대로 반환.
// Phase B 에서 history slice 기반 cascade 가중치 가산 예정:
//   - 같은 카테고리 묵인(overlook) 누적 → 새 일탈 darknessRiskBump +50%
//   - 다른 제자가 같은 이벤트로 엄벌 받았는데 본인은 묵인 → 친한 동문 trust −2
//
// Phase A 에선 무가공.

import type { EventResolver, ResolveInput, ResolveOutput } from './resolver';

export class RuleResolver implements EventResolver {
  async resolve(input: ResolveInput): Promise<ResolveOutput> {
    return {
      effects: input.choice.defaultEffects,
      llmCalled: false,
    };
  }
}

export const ruleResolver = new RuleResolver();
