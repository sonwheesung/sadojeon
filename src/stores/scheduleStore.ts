import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  DiscipleOverride,
  MonthlySchedule,
  MonthlySnapshot,
  TrainingCategory,
} from '@/types';
import { slotAwareStorage } from './persistStorage';

// 사문 월간 일정 store — docs/06 "훈련 3층 구조".
// - schedule: 사문 기본 주간 패턴 (카테고리)
// - individualPatterns: 제자별 개인 주간 패턴 (있으면 사문보다 우선, 없으면 사문 따름)
// - dailyChoice: (제자 × 카테고리) 마지막 선택 종목 id — 일일 자동 기본값
// - pendingReport/Setup: 월말 결산 / 월 시작 패턴 설정 모달 트리거
// - lastSnapshot: 직전 월 시작 스냅샷
// - overrides: 제자별 임시 명령 (폐관/의뢰/치료)

interface ScheduleStore {
  schedule: MonthlySchedule;
  individualPatterns: Record<string, TrainingCategory[]>;
  dailyChoice: Record<string, Partial<Record<TrainingCategory, string>>>;
  pendingReport: boolean;
  pendingSetup: boolean;
  lastSnapshot: MonthlySnapshot | null;
  overrides: Record<string, DiscipleOverride>;

  setSchedule: (s: MonthlySchedule) => void;
  setIndividualPattern: (discipleId: string, pattern: TrainingCategory[]) => void;
  clearIndividualPattern: (discipleId: string) => void; // 사문 일정으로 되돌리기
  setDailyChoice: (discipleId: string, category: TrainingCategory, optionId: string) => void;
  openMonthlyReport: () => void;
  resolveMonthlyReport: () => void;
  openMonthlySetup: () => void;
  resolveMonthlySetup: () => void;
  setSnapshot: (s: MonthlySnapshot) => void;
  setOverride: (o: DiscipleOverride) => void;
  clearOverride: (discipleId: string) => void;
  reset: () => void;
}

// 사문 기본 주간 패턴 — docs/06 예시: 월훈련 화체력 수공부 목휴식 금훈련 토체력 일휴식.
const DEFAULT_PATTERN: TrainingCategory[] = [
  'martial',
  'physical',
  'study',
  'rest',
  'martial',
  'physical',
  'rest',
];

const DEFAULT_SCHEDULE: MonthlySchedule = {
  weeklyPattern: [...DEFAULT_PATTERN],
  monthlyQuests: 0,
};

// 제자의 그날 카테고리 — 개인 패턴 우선, 없으면 사문. day: 1~7.
export function categoryFor(
  store: Pick<ScheduleStore, 'schedule' | 'individualPatterns'>,
  discipleId: string,
  day: number,
): TrainingCategory {
  const idx = Math.max(0, Math.min(6, day - 1));
  const individual = store.individualPatterns[discipleId];
  const pattern = individual ?? store.schedule.weeklyPattern;
  return pattern[idx] ?? 'rest';
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      schedule: DEFAULT_SCHEDULE,
      individualPatterns: {},
      dailyChoice: {},
      pendingReport: false,
      pendingSetup: false,
      lastSnapshot: null,
      overrides: {},

      setSchedule: (s) => set({ schedule: s }),
      setIndividualPattern: (discipleId, pattern) =>
        set((s) => ({
          individualPatterns: { ...s.individualPatterns, [discipleId]: pattern },
        })),
      clearIndividualPattern: (discipleId) =>
        set((s) => {
          const { [discipleId]: _, ...rest } = s.individualPatterns;
          return { individualPatterns: rest };
        }),
      setDailyChoice: (discipleId, category, optionId) =>
        set((s) => ({
          dailyChoice: {
            ...s.dailyChoice,
            [discipleId]: { ...s.dailyChoice[discipleId], [category]: optionId },
          },
        })),
      openMonthlyReport: () => set({ pendingReport: true }),
      resolveMonthlyReport: () => set({ pendingReport: false }),
      openMonthlySetup: () => set({ pendingSetup: true }),
      resolveMonthlySetup: () => set({ pendingSetup: false }),
      setSnapshot: (s) => set({ lastSnapshot: s }),
      setOverride: (o) =>
        set((s) => ({ overrides: { ...s.overrides, [o.discipleId]: o } })),
      clearOverride: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.overrides;
          return { overrides: rest };
        }),
      reset: () =>
        set({
          schedule: { weeklyPattern: [...DEFAULT_PATTERN], monthlyQuests: 0 },
          individualPatterns: {},
          dailyChoice: {},
          pendingReport: false,
          pendingSetup: false,
          lastSnapshot: null,
          overrides: {},
        }),
    }),
    {
      name: 'schedule',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 5, // v4→v5 활동 4종 → 카테고리 모델 + 개인 패턴/일일 선택 (훈련 v2)
      partialize: (s) => ({
        schedule: s.schedule,
        individualPatterns: s.individualPatterns,
        dailyChoice: s.dailyChoice,
        overrides: s.overrides,
        lastSnapshot: s.lastSnapshot,
      }),
      // v5: 옛 활동값(training/meditation/autonomy) 패턴은 의미가 달라 디폴트로 리셋.
      // overrides·lastSnapshot 만 보존.
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as {
          overrides?: Record<string, DiscipleOverride>;
          lastSnapshot?: MonthlySnapshot | null;
        };
        return {
          schedule: { weeklyPattern: [...DEFAULT_PATTERN], monthlyQuests: 0 },
          individualPatterns: {},
          dailyChoice: {},
          overrides: p.overrides ?? {},
          lastSnapshot: p.lastSnapshot ?? null,
        };
      },
    },
  ),
);
