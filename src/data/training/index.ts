// 훈련 v2 데이터 — docs/06_훈련_일정.md "활동 카테고리 + 세부 종목".
// 체력·공부·휴식 종목 풀 + Lv/EXP 곡선 + 최대 체력 환산.
// 무공 카테고리는 제자 보유 무공에서 동적 생성 (여기 없음).
//
// 모든 수치는 그레이박스 — 밸런싱 전 임시값 (docs/06 미정 항목).

import type { StatId, TrainingCategory, TrainingOption } from '@/types/training';

// docs/25_스탯_경험치.md.
export const BASE_MAX_STAMINA = 50; // endurance Lv 5 시작 기준 (×10)
export const START_ENDURANCE_LEVEL = 5;

// 최대 체력 = endurance 레벨 × 10 (1~100+ 스케일). 체력만 특수 환산.
export function deriveMaxStamina(enduranceLevel: number): number {
  return Math.max(10, Math.round(enduranceLevel) * 10);
}

// Lv/EXP 곡선 — 렙마다 조금씩 + 10단위마다 한 단계 가팔라짐.
// Lv0→20, Lv5→40, Lv9→56, Lv10→100, Lv20→180 …
export function expToNext(level: number): number {
  const lv = Math.max(0, level);
  return 20 + lv * 4 + Math.floor(lv / 10) * 40;
}

// 스탯 상한 — 제자별 별 등급(starRank) 파생, 정적. docs/25.
export function statCap(starRank: number, statId: StatId): number {
  const star = Math.max(1, Math.min(5, starRank));
  if (statId === 'endurance') return 10 + (star - 1) * 2; // ×10 = 최대 체력 100~180
  return 50 + (star - 1) * 12; // ★1=50 … ★5=98
}

// ─── 종목 풀 ──────────────────────────────────────────────────────────────

export const TRAINING_OPTIONS: readonly TrainingOption[] = [
  // 체력 — 트레이드오프 (빡셀수록 성장↑·현재체력↓·익일 효율↓·스트레스↑)
  {
    id: 'phys_run',
    category: 'physical',
    label: '달리기',
    staminaDelta: -8,
    stressDelta: 4,
    grantsStat: 'agility',
    expBase: 10,
  },
  {
    id: 'phys_climb',
    category: 'physical',
    label: '암벽등반',
    staminaDelta: -22,
    stressDelta: 10,
    grantsStat: 'endurance',
    expBase: 16,
    lingering: 0.3,
  },
  {
    id: 'phys_horse',
    category: 'physical',
    label: '기마자세',
    staminaDelta: -14,
    stressDelta: 7,
    grantsStat: 'strength',
    expBase: 12,
    lingering: 0.1,
  },

  // 공부 — 스트레스 큼. 과목별 다른 스탯.
  {
    id: 'study_formation',
    category: 'study',
    label: '진법',
    staminaDelta: -6,
    stressDelta: 12,
    grantsStat: 'formation',
    expBase: 12,
  },
  {
    id: 'study_etiquette',
    category: 'study',
    label: '예절',
    staminaDelta: -4,
    stressDelta: 8,
    grantsStat: 'etiquette',
    expBase: 10,
  },
  {
    id: 'study_knowledge',
    category: 'study',
    label: '기본 지식',
    staminaDelta: -5,
    stressDelta: 7,
    grantsStat: 'knowledge',
    expBase: 11,
  },

  // 휴식 — 회복 + 스트레스 해소. 성장 없음. (회복량 상향 — 훈련 소모 대비 체감되게)
  { id: 'rest_idle', category: 'rest', label: '그냥 쉼', staminaDelta: 50, stressDelta: -15 },
  { id: 'rest_meditate', category: 'rest', label: '명상', staminaDelta: 30, stressDelta: -8 },
  { id: 'rest_village', category: 'rest', label: '마을', staminaDelta: 40, stressDelta: -20 },
] as const;

export function optionsByCategory(
  category: TrainingCategory,
): TrainingOption[] {
  return TRAINING_OPTIONS.filter((o) => o.category === category);
}

export function findTrainingOption(id: string): TrainingOption | undefined {
  return TRAINING_OPTIONS.find((o) => o.id === id);
}

// 카테고리의 기본 종목 (일일 선택 메모리 없을 때 자동 선택값) — 풀 첫 항목.
export function defaultOptionFor(
  category: Exclude<TrainingCategory, 'martial'>,
): TrainingOption | undefined {
  return optionsByCategory(category)[0];
}

// 성장 대상 스탯을 다루는 종목인지 (휴식 제외).
export function grantsStatOf(option: TrainingOption): StatId | undefined {
  return option.grantsStat;
}
