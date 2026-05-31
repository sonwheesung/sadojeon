import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ATMOSPHERE_MAX, ATMOSPHERE_MIN, type SectAtmosphere } from '@/types';
import { slotAwareStorage } from './persistStorage';

// 사문 분위기 store — docs/07 "사문 분위기 (門風)".
// 도덕적 갈등 이벤트의 4층 효과 ③ 사문 분위기 효과가 흘러들어옴.
// 회차마다 0/0 으로 초기화 (project_run_loop_carryover: 사부 스탯·사문 분위기는 회차 리셋).

interface SectAtmosphereStore {
  atmosphere: SectAtmosphere;
  adjust: (d: Partial<SectAtmosphere>) => void;
  set: (v: SectAtmosphere) => void;
  reset: () => void;
}

const DEFAULT_ATMOSPHERE: SectAtmosphere = {
  righteousness: 0,
  unity: 0,
};

function clamp(v: number): number {
  return Math.max(ATMOSPHERE_MIN, Math.min(ATMOSPHERE_MAX, v));
}

export const useSectAtmosphereStore = create<SectAtmosphereStore>()(
  persist(
    (set) => ({
      atmosphere: DEFAULT_ATMOSPHERE,
      adjust: (d) =>
        set((s) => ({
          atmosphere: {
            righteousness: clamp(s.atmosphere.righteousness + (d.righteousness ?? 0)),
            unity: clamp(s.atmosphere.unity + (d.unity ?? 0)),
          },
        })),
      set: (v) => set({ atmosphere: { righteousness: clamp(v.righteousness), unity: clamp(v.unity) } }),
      reset: () => set({ atmosphere: DEFAULT_ATMOSPHERE }),
    }),
    {
      name: 'sectAtmosphere',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ atmosphere: s.atmosphere }),
    },
  ),
);
