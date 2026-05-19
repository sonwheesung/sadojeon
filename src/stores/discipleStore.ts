import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Disciple, DailyActivity, RelationLevel } from '@/types';
import { slotAwareStorage } from './persistStorage';

interface DiscipleStore {
  disciples: Record<string, Disciple>;
  order: string[];

  setAll: (list: Disciple[]) => void;
  add: (disciple: Disciple) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Disciple>) => void;
  setActivity: (id: string, activity: DailyActivity) => void;
  adjustTrust: (id: string, delta: number) => void;
  setRelation: (id: string, otherId: string, level: RelationLevel) => void;
  get: (id: string) => Disciple | undefined;
  reset: () => void;
}

export const useDiscipleStore = create<DiscipleStore>()(
  persist(
    (set, get) => ({
      disciples: {},
      order: [],

      setAll: (list) =>
        set({
          disciples: Object.fromEntries(list.map((d) => [d.id, d])),
          order: list.map((d) => d.id),
        }),

      add: (disciple) =>
        set((s) => ({
          disciples: { ...s.disciples, [disciple.id]: disciple },
          order: s.order.includes(disciple.id) ? s.order : [...s.order, disciple.id],
        })),

      remove: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.disciples;
          return { disciples: rest, order: s.order.filter((x) => x !== id) };
        }),

      update: (id, patch) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return { disciples: { ...s.disciples, [id]: { ...current, ...patch } } };
        }),

      setActivity: (id, activity) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return {
            disciples: {
              ...s.disciples,
              [id]: { ...current, currentActivity: activity },
            },
          };
        }),

      adjustTrust: (id, delta) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const next = Math.max(0, Math.min(100, current.trustToMaster + delta));
          return {
            disciples: { ...s.disciples, [id]: { ...current, trustToMaster: next } },
          };
        }),

      setRelation: (id, otherId, level) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return {
            disciples: {
              ...s.disciples,
              [id]: {
                ...current,
                relationships: { ...current.relationships, [otherId]: level },
              },
            },
          };
        }),

      get: (id) => get().disciples[id],

      reset: () => set({ disciples: {}, order: [] }),
    }),
    {
      name: 'disciple',
      storage: createJSONStorage(() => slotAwareStorage),
      partialize: (s) => ({ disciples: s.disciples, order: s.order }),
    },
  ),
);
