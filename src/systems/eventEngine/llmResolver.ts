// LlmResolver — Llama 3.2 3B Q4 호출 → JSON 파싱 → 보정 계수 적용.
// 실패·타임아웃·llm 비활성화·llmEligible=false 시 RuleResolver 폴백.

import { canGenerate, generate } from '@/systems/llm/executorchClient';
import type { EventResolver, ResolveInput, ResolveOutput } from './resolver';
import { ruleResolver } from './ruleResolver';
import { applyAdjustments, buildPrompt } from './llmPrompt';

export class LlmResolver implements EventResolver {
  async resolve(input: ResolveInput): Promise<ResolveOutput> {
    // 게이트 — llmEligible · enabled · cap · 모델 ready
    if (!input.template.llmEligible) {
      return ruleResolver.resolve(input);
    }
    const ok = await canGenerate();
    if (!ok) return ruleResolver.resolve(input);

    const prompt = buildPrompt(input);
    try {
      const raw = await generate(prompt);
      const adjusted = applyAdjustments(input.choice.defaultEffects, raw);
      if (!adjusted) {
        // JSON 파싱 실패 → 폴백 (디버그 정보는 보존 — 사용자가 raw 확인 가능)
        const fallback = await ruleResolver.resolve(input);
        return { ...fallback, llmPrompt: prompt, llmRaw: raw };
      }
      return {
        effects: adjusted.effects,
        llmCalled: true,
        llmPrompt: prompt,
        llmRaw: raw,
      };
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn('[llm] resolve failed — fallback to RuleResolver', e);
      }
      const fallback = await ruleResolver.resolve(input);
      const errMsg = e instanceof Error ? e.message : String(e);
      return { ...fallback, llmPrompt: prompt, llmRaw: `[error] ${errMsg}` };
    }
  }
}

export const llmResolver = new LlmResolver();
