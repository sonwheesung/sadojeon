import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { REP_MAX, REP_MIN } from '@/data/factions';
import { slotAwareStorage } from './persistStorage';

// 문파 평판 — 회차(사문)별. docs/30_문파_평판.md.
// 두 주체: sect(사문 전체) + disciple(제자 개인의 문파 인연). 둘 다 factionId → -100~+100.
// 안 적힌 문파 = 0(평범). 노출은 단계 라벨만(repTier), 숫자 숨김.

const clampRep = (n: number) => Math.max(REP_MIN, Math.min(REP_MAX, n));

interface ReputationStore {
  sect: Record<string, number>; // factionId → 값 (사문 평판)
  disciple: Record<string, Record<string, number>>; // discipleId → factionId → 값 (제자 인연)

  sectRep: (factionId: string) => number;
  discipleRep: (discipleId: string, factionId: string) => number;

  adjustSect: (factionId: string, delta: number) => void;
  adjustDisciple: (discipleId: string, factionId: string, delta: number) => void;
  setDisciple: (discipleId: string, factionId: string, value: number) => void;

  reset: () => void;
}

export const useReputationStore = create<ReputationStore>()(
  persist(
    (set, get) => ({
      sect: {},
      disciple: {},

      sectRep: (factionId) => get().sect[factionId] ?? 0,
      discipleRep: (discipleId, factionId) => get().disciple[discipleId]?.[factionId] ?? 0,

      adjustSect: (factionId, delta) =>
        set((s) => ({
          sect: { ...s.sect, [factionId]: clampRep((s.sect[factionId] ?? 0) + delta) },
        })),

      adjustDisciple: (discipleId, factionId, delta) =>
        set((s) => {
          const cur = s.disciple[discipleId] ?? {};
          return {
            disciple: {
              ...s.disciple,
              [discipleId]: { ...cur, [factionId]: clampRep((cur[factionId] ?? 0) + delta) },
            },
          };
        }),

      setDisciple: (discipleId, factionId, value) =>
        set((s) => {
          const cur = s.disciple[discipleId] ?? {};
          return {
            disciple: {
              ...s.disciple,
              [discipleId]: { ...cur, [factionId]: clampRep(value) },
            },
          };
        }),

      reset: () => set({ sect: {}, disciple: {} }),
    }),
    {
      name: 'reputation',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
