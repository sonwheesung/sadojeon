import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedRunNpcs, type RunNpc, type NpcStatus } from '@/data/npcs';
import { slotAwareStorage } from './persistStorage';

// 회차별 네임드 NPC 살아있는 상태 — docs/24.
// 카논 카탈로그(src/data/npcs)는 시작 템플릿. 이 store 가 그 사문의 현재 세계.
// 이벤트로 사망·교체·문파 멸망(status) 가능. 영속·DB 동기화는 runSlices/npcSlice 가 담당.

interface NpcStore {
  npcs: RunNpc[];
  hydrate: (list: RunNpc[]) => void;
  seedDefaults: () => void; // 회차 시작 — 카논에서 시드
  setStatus: (id: string, status: NpcStatus, note?: string) => void;
  reset: () => void;
}

export const useNpcStore = create<NpcStore>()(
  persist(
    (set) => ({
      npcs: [],
      hydrate: (list) => set({ npcs: list }),
      seedDefaults: () => set({ npcs: seedRunNpcs() }),
      setStatus: (id, status, note) =>
        set((s) => ({
          npcs: s.npcs.map((n) => (n.id === id ? { ...n, status, note: note ?? n.note } : n)),
        })),
      reset: () => set({ npcs: [] }),
    }),
    {
      name: 'npcs',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
