import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 강호 상태 — 회차(사문)별. 세력 정세 + 진행 중 사건.
// 그레이박스: 현재는 정적 기본값. 추후 강호 시스템이 이 store 를 갱신.

export interface JianghuFaction {
  id: string;
  label: string;
  outlook: string;
}

export interface JianghuEvent {
  id: string;
  headline: string;
  sub: string;
}

interface JianghuStore {
  factions: JianghuFaction[];
  events: JianghuEvent[];
  hydrate: (factions: JianghuFaction[], events: JianghuEvent[]) => void;
  seedDefaults: () => void;
  reset: () => void;
}

// 회차 시작 시 주입할 기본 정세 (구 world.tsx 더미).
export const DEFAULT_FACTIONS: JianghuFaction[] = [
  { id: 'right', label: '정파', outlook: '무림맹 평온' },
  { id: 'sapa', label: '사파', outlook: '강남 봉기 조짐' },
  { id: 'magyo', label: '마교', outlook: '잠잠' },
  { id: 'middle', label: '중도', outlook: '표국 활발' },
];

export const DEFAULT_EVENTS: JianghuEvent[] = [
  { id: 'ev-1', headline: '강남 사파 연합 봉기', sub: '이번 분기 · 정파 대응 미정' },
  { id: 'ev-2', headline: '마교 잔당 추적', sub: '지난 계절부터 · 관아 주도' },
  { id: 'ev-3', headline: '무림첩보 갱신', sub: '매주 · 정파 시각 보고' },
];

export const useJianghuStore = create<JianghuStore>()(
  persist(
    (set) => ({
      factions: [],
      events: [],
      hydrate: (factions, events) => set({ factions, events }),
      seedDefaults: () =>
        set({ factions: [...DEFAULT_FACTIONS], events: [...DEFAULT_EVENTS] }),
      reset: () => set({ factions: [], events: [] }),
    }),
    {
      name: 'jianghu',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
