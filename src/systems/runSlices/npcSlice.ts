import type { RunNpc } from '@/data/npcs';
import { runs } from '@/data/repositories';
import { useNpcStore } from '@/stores/npcStore';
import type { RunChildSlice } from './types';

// 네임드 NPC 회차 상태 — 카논에서 시드 후 이벤트로 사망·교체·멸망. 없으면 기본 시드.
export const npcSlice: RunChildSlice = {
  key: 'npcs',
  async save(runId) {
    const records = useNpcStore.getState().npcs.map((n) => ({
      npcId: n.id,
      faction: n.faction,
      status: n.status,
      data: n as unknown as Record<string, unknown>,
    }));
    await runs.saveNpcs(runId, records);
  },
  async load(runId) {
    const arr = await runs.getNpcs(runId);
    if (arr.length > 0) {
      useNpcStore.getState().hydrate(arr.map((r) => r.data as unknown as RunNpc));
    } else {
      useNpcStore.getState().seedDefaults();
    }
  },
  reset() {
    useNpcStore.getState().seedDefaults();
  },
};
