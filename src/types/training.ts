// 훈련 시스템 v2 — docs/06_훈련_일정.md "훈련 3층 구조".
// 주간 패턴의 단위 = 카테고리(무공/체력/공부/휴식).
// 각 카테고리 안의 세부 종목 = TrainingOption (무공은 제자 보유 무공이라 동적, 제외).

import type { TalentAxis } from './martialArt';

// 주간 패턴 1칸 = 카테고리. (구 ScheduleActivity 대체)
export type TrainingCategory = 'martial' | 'physical' | 'study' | 'rest';

export const TRAINING_CATEGORY_LABEL: Record<TrainingCategory, string> = {
  martial: '무공',
  physical: '체력',
  study: '공부',
  rest: '휴식',
};

export const TRAINING_CATEGORIES: readonly TrainingCategory[] = [
  'martial',
  'physical',
  'study',
  'rest',
] as const;

// 무공 수련 축 — 무공일에 무엇에 집중하는지. (docs/06 경지: 심법→내공 막대, 초식→무공 막대)
//   simbeop  심법 — 내공 수련
//   gyeonggong 경공 — 몸놀림·민첩
//   chosik   초식 — 무공 형(形)·실제 무공서 진척
export type MartialAxis = 'simbeop' | 'gyeonggong' | 'chosik';

export const MARTIAL_AXES: readonly MartialAxis[] = ['simbeop', 'gyeonggong', 'chosik'] as const;

export const MARTIAL_AXIS_LABEL: Record<MartialAxis, string> = {
  simbeop: '심법',
  gyeonggong: '경공',
  chosik: '초식',
};

// 단련 스탯 ID — Lv/EXP 트랙. 무공은 별도(MartialArtInstance) 라 여기 없음.
// endurance 는 최대 체력으로 환산된다 (deriveMaxStamina).
export type StatId =
  | 'endurance' // 최대 체력 (지구력)
  | 'strength' // 근력
  | 'agility' // 민첩
  | 'formation' // 진법
  | 'etiquette' // 예절
  | 'knowledge'; // 기본 지식 (견문·상식 — 의뢰·강호에서 쓰임)

export const STAT_LABEL: Record<StatId, string> = {
  endurance: '체력',
  strength: '근력',
  agility: '민첩',
  formation: '진법',
  etiquette: '예절',
  knowledge: '기본지식',
};

// 스탯이 EXP 배율에 쓰는 적성 축 (talents). "진법 특화 = insight 높음".
export const STAT_APTITUDE: Record<StatId, TalentAxis> = {
  endurance: 'body',
  strength: 'body',
  agility: 'agility',
  formation: 'insight',
  etiquette: 'mind',
  knowledge: 'insight', // 견문·이해 = 오성
};

// Lv/EXP 트랙. exp 가 expToNext(level) 에 도달하면 레벨업.
export interface StatTrack {
  level: number;
  exp: number;
}

// 세부 종목 — 체력·공부·휴식. (무공은 제자 보유 무공에서 동적 생성)
export interface TrainingOption {
  id: string;
  category: Exclude<TrainingCategory, 'martial'>;
  label: string;
  // 현재 체력 변동 (음수 = 소모, 양수 = 회복)
  staminaDelta: number;
  // 스트레스 변동 (양수 = 누적, 음수 = 해소)
  stressDelta: number;
  // 성장 대상 스탯 + 기본 EXP (휴식 종목은 없음)
  grantsStat?: StatId;
  expBase?: number;
  // 익일 효율 패널티 (0~1). 빡센 종목(암벽 등). 다음날 무공·체력 진척에 곱해짐.
  lingering?: number;
}
