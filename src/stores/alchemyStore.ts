import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 연단 상태 — 회차별. 학습 레시피(배운 비급)·진행 중 제조·첫 제조 보너스 이력·연단실 가동 여부.
// 재료/영단은 itemStore, 연단실 시설은 sect 에 있다(둘 다 DB 영속). 여기는 그 외 연단 상태.
// slotAwareStorage 로 슬롯별 로컬 영속(앱 재시작 유지). (DB 동기화는 후속 runSlice 작업.)

export interface CraftJob {
  recipeId: string;
  until: number; // totalDay
}

interface AlchemyStore {
  learnedRecipes: string[];
  activeCrafts: Record<string, CraftJob>; // discipleId → 진행 중 제조
  firstCrafted: string[]; // "discipleId:recipeId" — 첫 제조 보너스 1회용
  labOperational: boolean;

  learn: (id: string) => void;
  setCraft: (discipleId: string, job: CraftJob) => void;
  clearCraft: (discipleId: string) => void;
  markFirst: (key: string) => void;
  setLabOp: (on: boolean) => void;
  reset: () => void;
}

export const useAlchemyStore = create<AlchemyStore>()(
  persist(
    (set) => ({
      learnedRecipes: [],
      activeCrafts: {},
      firstCrafted: [],
      labOperational: true,

      learn: (id) =>
        set((s) => (s.learnedRecipes.includes(id) ? s : { learnedRecipes: [...s.learnedRecipes, id] })),
      setCraft: (discipleId, job) =>
        set((s) => ({ activeCrafts: { ...s.activeCrafts, [discipleId]: job } })),
      clearCraft: (discipleId) =>
        set((s) => {
          const { [discipleId]: _removed, ...rest } = s.activeCrafts;
          return { activeCrafts: rest };
        }),
      markFirst: (key) =>
        set((s) => (s.firstCrafted.includes(key) ? s : { firstCrafted: [...s.firstCrafted, key] })),
      setLabOp: (on) => set({ labOperational: on }),
      reset: () => set({ learnedRecipes: [], activeCrafts: {}, firstCrafted: [], labOperational: true }),
    }),
    {
      name: 'alchemy',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
