import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActiveQuest, Quest } from '@/types';
import { slotAwareStorage } from './persistStorage';

// 의뢰 store — 게시판(board) + 파견 중(active). 회차 스코프(seedNewRun 에서 reset).
// 로컬 persist (DB 동기화는 후속). docs/28 §4 경로 B.
interface QuestStore {
  board: Quest[]; // 게시판 — 받을 수 있는 의뢰
  active: ActiveQuest[]; // 파견 중

  setBoard: (board: Quest[]) => void;
  removeFromBoard: (questId: string) => void;
  addActive: (a: ActiveQuest) => void;
  updateActive: (questId: string, patch: Partial<ActiveQuest>) => void;
  removeActive: (questId: string) => void;
  reset: () => void;
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set) => ({
      board: [],
      active: [],
      setBoard: (board) => set({ board }),
      removeFromBoard: (questId) =>
        set((s) => ({ board: s.board.filter((q) => q.id !== questId) })),
      addActive: (a) => set((s) => ({ active: [...s.active, a] })),
      updateActive: (questId, patch) =>
        set((s) => ({
          active: s.active.map((a) => (a.quest.id === questId ? { ...a, ...patch } : a)),
        })),
      removeActive: (questId) =>
        set((s) => ({ active: s.active.filter((x) => x.quest.id !== questId) })),
      reset: () => set({ board: [], active: [] }),
    }),
    {
      name: 'quest',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ board: s.board, active: s.active }),
    },
  ),
);
