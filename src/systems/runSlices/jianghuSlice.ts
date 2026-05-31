import { runs } from '@/data/repositories';
import { useJianghuStore } from '@/stores/jianghuStore';
import type { RunChildSlice } from './types';

// 강호 정세 — 회차당 1행. 없으면 기본 정세 시드.
export const jianghuSlice: RunChildSlice = {
  key: 'jianghu',
  async save(runId) {
    const jh = useJianghuStore.getState();
    await runs.saveJianghu(runId, { factions: jh.factions, events: jh.events });
  },
  async load(runId) {
    const jh = await runs.getJianghu(runId);
    if (jh) {
      useJianghuStore.getState().hydrate((jh.factions as never) ?? [], (jh.events as never) ?? []);
    } else {
      useJianghuStore.getState().seedDefaults();
    }
  },
  reset() {
    useJianghuStore.getState().seedDefaults();
  },
};
