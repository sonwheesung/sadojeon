// 도덕적 갈등 이벤트 — docs/07_이벤트_시스템.md
// 3-Tier 풀 구조: 공통(universal) · 유형(archetype) · 개인(personal).
// 4선택(엄벌·폐관·훈계·묵인) → 4층 효과(가해자 / 사부 / 사문 분위기 / 타 제자).

import type { LegacyPersonalityMap } from './disciple';

export type MoralEventTier = 'universal' | 'archetype' | 'personal';

export type MoralEventCategory =
  | 'extortion'  // 갈취
  | 'theft'      // 도둑질
  | 'lie'        // 거짓말·험담
  | 'violence'   // 폭력
  | 'neglect'    // 약자 외면
  | 'occult'     // 사파·금기 비급 접촉
  | 'defiance'   // 사부·사문 규율 위반
  | 'pride'      // 자만·과시
  | 'idleness'   // 게으름·꾀병 (초반 형성기)
  | 'tattle';    // 고자질·일러바치기 (초반 형성기)

// 4선택의 톤. 코드 식별자. UI에는 사부 응답 본문 자체가 노출되고
// 라벨(엄벌/폐관/훈계/묵인) 직접 표시는 X — feedback_hidden_game_state.
export type MoralChoiceTone = 'punish' | 'seclusion' | 'admonish' | 'overlook';

// 통찰 단계 — 사부의 통찰이 높을수록 선택지 위에 정보 한 줄 추가.
export type InsightTier = 1 | 2 | 3 | 4 | 5;

// ① 가해자 직접 효과
export interface PerpetratorEffect {
  trustDelta?: number;                            // 사부신뢰도
  staminaDelta?: number;                          // 체력
  darknessRiskBump?: number;                      // 흑화 위험도 (그레이박스: 메모로만)
  darknessLevelBump?: number;                     // 흑화 단계 직접 +N
  personalityShift?: LegacyPersonalityMap;  // 성격 미세 조정
  noteAppend?: string;                            // 제자 메모에 한 줄
}

// ② 사부 효과 — 그레이박스 단계. 추후 사부 스탯 연결.
export interface MasterEffect {
  insightDelta?: number;       // 통찰
  authorityDelta?: number;     // 위엄
  reputationDelta?: number;    // 인망
  hiddenFlag?: string;         // 숨겨진 플래그 (예: "묵인의 사부")
}

// ③ 사문 분위기 효과
export interface AtmosphereEffect {
  righteousnessDelta?: number; // + = 도의, − = 무도
  unityDelta?: number;         // + = 결속, − = 균열
}

// ④ 타 제자 연쇄 효과 — 풀 안의 다른 제자 중 조건 맞는 자에 적용.
// 그레이박스 단계: 의도만 정의, 실행은 시스템이 해석.
export type CascadeKind = 'mimic' | 'shaken' | 'admire' | 'distance' | 'report';

export interface CascadeEffect {
  kind: CascadeKind;
  triggerCondition?: {
    relation?: 'friend' | 'enemy';                   // 가해자와의 관계
    personality?: LegacyPersonalityMap;        // 성격 조건 (각 축 ≥ 임계)
    forbidPersonality?: LegacyPersonalityMap;  // 각 축 ≤ 임계
  };
  trustDelta?: number;                               // 사부신뢰도 변동
  noteAppend?: string;
}

// 4선택 하나.
export interface MoralChoice {
  tone: MoralChoiceTone;
  // 사부의 대사 또는 행동 문장. UI에 그대로 노출.
  label: string;
  perpetrator?: PerpetratorEffect;
  master?: MasterEffect;
  atmosphere?: AtmosphereEffect;
  cascade?: CascadeEffect[];
}

// 트리거 조건. tier 마다 어떤 필드가 결정적인지 다름.
// - universal: weight 만 결정적
// - archetype: requirePersonality / forbidPersonality 활용
// - personal: onlyForDiscipleId 필수
export interface MoralEventTrigger {
  weight: number;                                   // 기본 가중치 (확률 비중)
  minYearInSect?: number;                           // 입문 N년차 이상
  maxYearInSect?: number;
  requirePersonality?: LegacyPersonalityMap;  // 각 축 ≥ 임계
  forbidPersonality?: LegacyPersonalityMap;   // 각 축 ≤ 임계
  requireMinDarkness?: 0 | 1 | 2 | 3;               // 이 단계 이상에서만 발화
  onlyForDiscipleId?: string;                       // personal 풀
  requireSiblingId?: string;                        // 특정 동문 동시 영입 시
}

export interface MoralEventTemplate {
  id: string;
  tier: MoralEventTier;
  category: MoralEventCategory;
  trigger: MoralEventTrigger;
  // 시나리오 본문. placeholder: {name}, {sibling}, {target}, {sect}.
  scenario: string;
  // 정확히 4개. tone 순서는 자유.
  choices: MoralChoice[];
  // 통찰 단계별 추가 힌트 (선택지 위 작은 글씨). 부분 정의 OK.
  insightHints?: Partial<Record<InsightTier, string>>;
}

// 발화된 이벤트 — pool 에서 픽 + placeholder 치환됨. 휘발성 store 에 들어감.
export interface PendingMoralEvent {
  templateId: string;
  tier: MoralEventTier;
  category: MoralEventCategory;
  discipleId: string;
  discipleName: string;
  siblingId?: string;
  siblingName?: string;
  body: string;        // placeholder 치환된 본문
  hint?: string;       // 사부 통찰 단계에 맞는 한 줄 (없을 수도)
  choices: MoralChoice[];
  createdAtDay: number;
}
