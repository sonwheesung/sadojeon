import { runs } from '@/data/repositories';
import { useJianghuStore } from '@/stores/jianghuStore';
import type { WorldState } from '@/types/world';
import type { RunChildSlice } from './types';

// 강호 정세 — 회차당 1행. 살아있는 정세 엔진 상태(WorldState)를 jianghu_state.factions(jsonb)에 통째 저장.
// events 컬럼엔 진행 중 사건 배열을 함께 둔다(서버/조회 편의). 없으면 기본 정세 시드.
export const jianghuSlice: RunChildSlice = {
  key: 'jianghu',
  async save(runId) {
    const w = useJianghuStore.getState().world;
    await runs.saveJianghu(runId, { factions: w ?? {}, events: w?.events ?? [] });
  },
  async load(runId) {
    const jh = await runs.getJianghu(runId);
    const w = jh?.factions as WorldState | undefined;
    if (w && w.powers && w.tensions) {
      useJianghuStore.getState().hydrateWorld(w);
    } else {
      useJianghuStore.getState().seedDefaults();
    }
  },
  reset() {
    useJianghuStore.getState().seedDefaults();
  },
};
