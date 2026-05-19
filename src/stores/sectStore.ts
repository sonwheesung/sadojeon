import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SectFacility, SectState } from '@/types';
import { slotAwareStorage } from './persistStorage';

interface SectStore {
  sect: SectState | null;
  setSect: (sect: SectState) => void;
  update: (patch: Partial<SectState>) => void;
  upgradeFacility: (facilityId: string) => void;
  adjustReputation: (delta: number) => void;
  adjustResources: (delta: number) => void;
  reset: () => void;
}

export const useSectStore = create<SectStore>()(
  persist(
    (set) => ({
      sect: null,

      setSect: (sect) => set({ sect }),

      update: (patch) =>
        set((s) => (s.sect ? { sect: { ...s.sect, ...patch } } : s)),

      upgradeFacility: (facilityId) =>
        set((s) => {
          if (!s.sect) return s;
          const facilities: SectFacility[] = s.sect.facilities.map((f) =>
            f.id === facilityId ? { ...f, level: f.level + 1 } : f,
          );
          return { sect: { ...s.sect, facilities } };
        }),

      adjustReputation: (delta) =>
        set((s) => {
          if (!s.sect) return s;
          return {
            sect: {
              ...s.sect,
              reputation: Math.max(0, Math.min(100, s.sect.reputation + delta)),
            },
          };
        }),

      adjustResources: (delta) =>
        set((s) => {
          if (!s.sect) return s;
          return {
            sect: { ...s.sect, resources: Math.max(0, s.sect.resources + delta) },
          };
        }),

      reset: () => set({ sect: null }),
    }),
    {
      name: 'sect',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
