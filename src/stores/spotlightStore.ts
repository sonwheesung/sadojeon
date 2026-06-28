import { create } from 'zustand';

import type { SpotlightStep } from '@/data/spotlightTours';

// 스포트라이트 투어 상태(휘발 — 영속 X). docs/44. "본 것" 기록은 tutorialStore.seen(spotlightSystem).
interface SpotlightState {
  steps: SpotlightStep[];
  index: number;
  active: boolean;
  start: (steps: SpotlightStep[]) => void;
  next: () => void; // 다음 단계 — 마지막이면 종료.
  end: () => void;
}

export const useSpotlightStore = create<SpotlightState>((set, get) => ({
  steps: [],
  index: 0,
  active: false,
  start: (steps) => {
    if (steps.length === 0) return;
    set({ steps, index: 0, active: true });
  },
  next: () => {
    const { index, steps } = get();
    if (index + 1 >= steps.length) set({ active: false, steps: [], index: 0 });
    else set({ index: index + 1 });
  },
  end: () => set({ active: false, steps: [], index: 0 }),
}));
