import { runs } from '@/data/repositories';
import { useAlchemyStore } from '@/stores/alchemyStore';
import type { RunChildSlice } from './types';

// 연단 상태 — 회차당 1행(alchemy_state). 없으면 기본값(빈 비급·가동중).
export const alchemySlice: RunChildSlice = {
  key: 'alchemy',
  async save(runId) {
    const s = useAlchemyStore.getState();
    await runs.saveAlchemy(runId, {
      learnedRecipes: s.learnedRecipes,
      activeCrafts: s.activeCrafts,
      firstCrafted: s.firstCrafted,
      labOperational: s.labOperational,
    });
  },
  async load(runId) {
    const a = await runs.getAlchemy(runId);
    if (a) {
      useAlchemyStore.getState().hydrate({
        learnedRecipes: (a.learnedRecipes as never) ?? [],
        activeCrafts: (a.activeCrafts as never) ?? {},
        firstCrafted: (a.firstCrafted as never) ?? [],
        labOperational: a.labOperational,
      });
    } else {
      useAlchemyStore.getState().reset();
    }
  },
  reset() {
    useAlchemyStore.getState().reset();
  },
};
