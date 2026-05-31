// EventResolver — 룰 ↔ LLM 인터페이스. docs/07 "공통 엔진".
//
// Phase A 에선:
//   - RuleResolver: defaultEffects 그대로 반환 (Phase B 에서 history cascade 가산)
//   - LlmResolver: react-native-executorch + Llama 3.2 3B Q4 호출
//                  (실패·타임아웃·llm 비활성화 시 RuleResolver 폴백)

import type {
  DiscipleSnapshot,
  EventChoice,
  EventEffects,
  EventHistorySlice,
  EventTemplate,
  MasterSnapshot,
  SectAtmosphere,
  SiblingSummary,
} from '@/types';

export interface ResolveInput {
  template: EventTemplate<string>;
  choice: EventChoice<string>;
  perpetrator: DiscipleSnapshot;
  master: MasterSnapshot;
  atmosphere: SectAtmosphere;
  siblings: SiblingSummary[];
  history: EventHistorySlice;
}

export interface ResolveOutput {
  effects: EventEffects;
  narration?: string;
  llmCalled: boolean;
  // 디버그 — 개발 빌드에서 결과 화면 패널에 노출.
  llmPrompt?: string;
  llmRaw?: string;
}

export interface EventResolver {
  resolve(input: ResolveInput): Promise<ResolveOutput>;
}
