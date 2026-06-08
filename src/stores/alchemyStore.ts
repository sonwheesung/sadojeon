import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 연단 상태 — 회차별. 학습 레시피(배운 비급)·진행 중 제조·첫 제조 보너스 이력·연단실 가동 여부.
// 재료/영단은 itemStore, 연단실 시설은 sect 에 있다(둘 다 DB 영속). 여기는 그 외 연단 상태.
// DB 영속은 alchemySlice(alchemy_state 테이블)로 회차마다 load/save. slotAwareStorage 는 오프라인 캐시.

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
  hydrate: (state: Partial<Pick<AlchemyStore, 'learnedRecipes' | 'activeCrafts' | 'firstCrafted' | 'labOperational'>>) => void;
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
      hydrate: (state) =>
        set({
          learnedRecipes: state.learnedRecipes ?? [],
          activeCrafts: state.activeCrafts ?? {},
          firstCrafted: state.firstCrafted ?? [],
          labOperational: state.labOperational ?? true,
        }),
      reset: () => set({ learnedRecipes: [], activeCrafts: {}, firstCrafted: [], labOperational: true }),
    }),
    {
      name: 'alchemy',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
