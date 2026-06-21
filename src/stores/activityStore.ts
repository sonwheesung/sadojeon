import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActiveActivity } from '@/types/activity';
import { slotAwareStorage } from './persistStorage';

// 활동 store — 진행 중 활동(파견). 회차 스코프(seedNewRun 에서 reset). 의뢰 store 와 같은 결.
// 로컬 persist(슬롯별) — 며칠~몇 주짜리 파견이 앱 재시작·턴 진행에도 유지되도록. docs/38.
interface ActivityStore {
  active: ActiveActivity[];
  // 회차당 신급 재료 드랍 누계 — 상한 enforcement(신품 영초 2/회차·영물 정수 1/회차). seedNewRun 에서 reset.
  // 영속(앱 재시작 중에도 상한 유지). 영물이 무한 수급되면 동물과 다를 바 없으므로 회차 카운터로 막는다. docs/38·40.
  divineDrops: Record<string, number>;
  add: (a: ActiveActivity) => void;
  updateActive: (id: string, patch: Partial<ActiveActivity>) => void;
  remove: (id: string) => void;
  bumpDivine: (id: string, n: number) => void;
  reset: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      active: [],
      divineDrops: {},
      add: (a) => set((s) => ({ active: [...s.active, a] })),
      updateActive: (id, patch) =>
        set((s) => ({ active: s.active.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      remove: (id) => set((s) => ({ active: s.active.filter((x) => x.id !== id) })),
      bumpDivine: (id, n) =>
        set((s) => ({ divineDrops: { ...s.divineDrops, [id]: (s.divineDrops?.[id] ?? 0) + n } })),
      reset: () => set({ active: [], divineDrops: {} }),
    }),
    {
      name: 'activity',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 2,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<ActivityStore>;
        return { ...p, divineDrops: p.divineDrops ?? {} } as ActivityStore;
      },
      partialize: (s) => ({ active: s.active, divineDrops: s.divineDrops }),
    },
  ),
);
