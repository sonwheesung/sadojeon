// 사문 월간 일정 — docs/06_훈련_일정.md "훈련 3층 구조".
// 한 주 = 7일, 각 일자에 카테고리(무공/체력/공부/휴식) 지정.
// 카테고리 안의 세부 종목은 진행 시 일일 선택 (자동 기본 + 개별 변경).

import type { TrainingCategory } from './training';

// 사문 주간 패턴 — 1주 = 7일, 각 일자별 카테고리.
// day 1~7 = 월·화·수·목·금·토·일. 한 달(4주) 동안 같은 7일 패턴 반복.
// 제자별 개인 패턴(scheduleStore.individualPatterns)이 있으면 그쪽 우선.
export interface MonthlySchedule {
  // 인덱스 0~6 = day 1~7 (월~일)
  weeklyPattern: TrainingCategory[];
  monthlyQuests: number;
}

// day(1~7) 라벨 — UI 표기용.
export const DAY_LABEL: Record<number, string> = {
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
  7: '일',
};

export const WEEK_DAYS: readonly number[] = [1, 2, 3, 4, 5, 6, 7] as const;

// 제자별 오버라이드 — Phase 4 도입 예정. 일단 타입만.
export type DiscipleOverrideCommand =
  | 'default'
  | 'seclusion' // 폐관 (집중 수련)
  | 'quest' // 의뢰 파견
  | 'healing'; // 치료

export interface DiscipleOverride {
  discipleId: string;
  command: DiscipleOverrideCommand;
  startedAtDay: number;
  durationDays: number; // 만료까지 일수
}

// 월 시작 시점의 핵심 지표 스냅샷 — 월말 결산 시 비교용. docs/06 · docs/26.
export interface MonthlySnapshot {
  totalMonth: number; // 직전 월 totalMonth (1년차 1월 = 1)
  // 제자별 무공 숙련 점수 합(성*1000+exp, 단조 증가) + 무공별 성 (밴드 승급 추적).
  disciples: Record<
    string,
    {
      masterySum: number;
      seongs: Record<string, number>; // artId → 현재 성(1~10)
      trust: number;
    }
  >;
  assets: number; // 사문 자산 (동화)
}
