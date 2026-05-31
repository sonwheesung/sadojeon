// 공통 이벤트 엔진 모델 — docs/07_이벤트_시스템.md "공통 엔진".
// 기존 도덕 이벤트(moralEvent.ts) 의 효과 4층 인터페이스를 재사용하여
// oneLiner/wish/milestone/recruit 등 다른 도메인까지 흡수 가능한 일반화 모델.
//
// Phase A 에선 moral 도메인만 본 모델을 따른다.
// 기존 MoralEventTemplate 등은 점진적으로 EventTemplate<MoralChoiceTone> 별칭으로 narrow.

import type { PersonalityTraits } from './disciple';
import type {
  AtmosphereEffect,
  CascadeEffect,
  InsightTier,
  MasterEffect,
  PerpetratorEffect,
} from './moralEvent';

// ─── 도메인 ──────────────────────────────────────────────────────────────────

export type EventDomain = 'moral' | 'oneLiner' | 'wish' | 'milestone' | 'recruit';

// ─── 4층 효과 — moralEvent.ts 인터페이스 재사용 ───────────────────────────

export interface EventEffects {
  perpetrator?: PerpetratorEffect;
  master?: MasterEffect;
  atmosphere?: AtmosphereEffect;
  cascade?: CascadeEffect[];
}

// ─── Trigger ────────────────────────────────────────────────────────────────

export interface EventTrigger {
  weight: number;
  minYearInSect?: number;
  maxYearInSect?: number;
  requirePersonality?: Partial<PersonalityTraits>;
  forbidPersonality?: Partial<PersonalityTraits>;
  requireMinDarkness?: 0 | 1 | 2 | 3;
  onlyForDiscipleId?: string;
  requireSiblingId?: string;
  // 추가 — Phase B 에서 atmosphere 조건 기반 발화 게이트
  requireAtmosphere?: {
    righteousnessMin?: number;
    righteousnessMax?: number;
    unityMin?: number;
    unityMax?: number;
  };
}

export type EventTier = 'universal' | 'archetype' | 'personal';

// ─── 선택지 활성 조건 (A2) ─────────────────────────────────────────────────

export interface ChoiceActiveCondition {
  // Phase A: 자원·통찰만. Phase B 에서 지식·관계 추가.
  masterInsightMin?: number; // 0~100
  masterAuthorityMin?: number;
  sectResourcesMin?: number;
  // 자유 조건 평가용 키. eventEngine/choiceActivation.ts 가 해석.
  customKey?: string;
}

// ─── Choice / Template ──────────────────────────────────────────────────────

export interface EventChoice<TTone extends string = string> {
  tone: TTone;
  label: string; // UI 노출 — 사부 대사·행동 본문
  activeWhen?: ChoiceActiveCondition;
  defaultEffects: EventEffects;
}

export interface EventTemplate<TTone extends string = string> {
  id: string;
  domain: EventDomain;
  tier: EventTier;
  category: string;
  trigger: EventTrigger;
  scenario: string; // placeholder: {name}, {sibling}
  choices: EventChoice<TTone>[];
  insightHints?: Partial<Record<InsightTier, string>>;
  llmEligible?: boolean; // archetype·personal 만 true 권장
}

// ─── Resolver I/O ───────────────────────────────────────────────────────────

export interface DiscipleSnapshot {
  id: string;
  name: string;
  personality: PersonalityTraits;
  trustToMaster: number;
  stamina: number;
  darknessLevel: number;
  darknessRisk: 'low' | 'medium' | 'high';
}

export interface MasterSnapshot {
  insight: number;
  authority: number;
  prestige: number;
}

export interface SiblingSummary {
  id: string;
  name: string;
  relation: 'enemy' | 'distant' | 'neutral' | 'friend' | 'sworn';
}

// ─── History ────────────────────────────────────────────────────────────────

export interface EventHistoryShortRecord {
  day: number;
  templateId: string;
  category: string;
  tone: string;
  discipleId: string;
  discipleName: string;
}

export interface EventHistorySlice {
  // 같은 템플릿 최근 N개
  sameTemplate: EventHistoryShortRecord[];
  // 같은 카테고리 최근 N개 (가해자 다른 경우 포함)
  sameCategory: EventHistoryShortRecord[];
}

export interface EventHistoryRecord {
  id: string;
  day: number;
  domain: EventDomain;
  templateId: string;
  category: string;
  tier: EventTier;
  discipleId: string;
  discipleName: string;
  siblingId?: string;
  tone: string;
  appliedEffects: EventEffects;
  llmCalled: boolean;
  narration?: string;
}
