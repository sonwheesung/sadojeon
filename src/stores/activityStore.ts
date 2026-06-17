import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActiveActivity } from '@/types/activity';
import { slotAwareStorage } from './persistStorage';

// 활동 store — 진행 중 활동(파견). 회차 스코프(seedNewRun 에서 reset). 의뢰 store 와 같은 결.
// 로컬 persist(슬롯별) — 며칠~몇 주짜리 파견이 앱 재시작·턴 진행에도 유지되도록. docs/38.
interface ActivityStore {
  active: ActiveActivity[];
  add: (a: ActiveActivity) => void;
  updateActive: (id: string, patch: Partial<ActiveActivity>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      active: [],
      add: (a) => set((s) => ({ active: [...s.active, a] })),
      updateActive: (id, patch) =>
        set((s) => ({ active: s.active.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      remove: (id) => set((s) => ({ active: s.active.filter((x) => x.id !== id) })),
      reset: () => set({ active: [] }),
    }),
    {
      name: 'activity',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ active: s.active }),
    },
  ),
);
