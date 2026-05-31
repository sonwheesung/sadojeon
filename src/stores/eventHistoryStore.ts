import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EventHistoryRecord, EventHistorySlice } from '@/types';
import { slotAwareStorage } from './persistStorage';

// 이벤트 history 누적 — docs/07 "공통 엔진".
// 회차 격리(slotAwareStorage), 새 회차 시작 시 reset.
// LLM 입력의 history slice 와 RuleResolver 의 cascade 보정에 사용.

const SLICE_LIMIT = 5;

interface EventHistoryStore {
  records: EventHistoryRecord[];
  push: (r: EventHistoryRecord) => void;
  sliceFor: (templateId: string, category: string) => EventHistorySlice;
  reset: () => void;
}

export const useEventHistoryStore = create<EventHistoryStore>()(
  persist(
    (set, get) => ({
      records: [],

      push: (r) =>
        set((s) => ({
          // 최신이 앞에 오도록 prepend. (sliceFor 가 처음 N개만 읽으면 됨)
          records: [r, ...s.records],
        })),

      sliceFor: (templateId, category) => {
        const { records } = get();
        const sameTemplate = records
          .filter((r) => r.templateId === templateId)
          .slice(0, SLICE_LIMIT)
          .map(toShort);
        const sameCategory = records
          .filter((r) => r.category === category)
          .slice(0, SLICE_LIMIT)
          .map(toShort);
        return { sameTemplate, sameCategory };
      },

      reset: () => set({ records: [] }),
    }),
    {
      name: 'eventHistory',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ records: s.records }),
    },
  ),
);

function toShort(r: EventHistoryRecord) {
  return {
    day: r.day,
    templateId: r.templateId,
    category: r.category,
    tone: r.tone,
    discipleId: r.discipleId,
    discipleName: r.discipleName,
  };
}
