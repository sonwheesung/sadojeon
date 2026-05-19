import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Master, MasterReputation } from '@/types';
import { slotAwareStorage } from './persistStorage';

interface MasterStore {
  master: Master | null;
  setMaster: (master: Master) => void;
  update: (patch: Partial<Master>) => void;
  adjustReputation: (axis: keyof MasterReputation, delta: number) => void;
  adjustHealth: (delta: number) => void;
  adjustQi: (delta: number) => void;
  reset: () => void;
}

export const useMasterStore = create<MasterStore>()(
  persist(
    (set) => ({
      master: null,

      setMaster: (master) => set({ master }),

      update: (patch) =>
        set((s) => (s.master ? { master: { ...s.master, ...patch } } : s)),

      adjustReputation: (axis, delta) =>
        set((s) => {
          if (!s.master) return s;
          const value = Math.max(0, Math.min(100, s.master.reputation[axis] + delta));
          return {
            master: {
              ...s.master,
              reputation: { ...s.master.reputation, [axis]: value },
            },
          };
        }),

      adjustHealth: (delta) =>
        set((s) => {
          if (!s.master) return s;
          const value = Math.max(0, Math.min(100, s.master.health + delta));
          return { master: { ...s.master, health: value } };
        }),

      adjustQi: (delta) =>
        set((s) => {
          if (!s.master) return s;
          const value = Math.max(0, Math.min(100, s.master.qi + delta));
          return { master: { ...s.master, qi: value } };
        }),

      reset: () => set({ master: null }),
    }),
    {
      name: 'master',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
