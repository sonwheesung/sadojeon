import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// 업적 — **계정 단위 영속**(회차·슬롯 무관, metaStorage). docs/32.
// 보상은 명예·콘텐츠뿐(파워 영구증가 X) — 여기선 달성 기록 + 해금 무공서만 든다.
// 회차 시작(seedNewRun)에 **리셋하지 않는다**(누적). 해금 무공서는 seedNewRun 이 codex 로 시드.

interface AchievementStore {
  unlocked: string[]; // 달성한 업적 id
  unlockedArts: string[]; // 업적으로 해금된 무공서 id(다회차 자산)
  has: (id: string) => boolean;
  unlock: (id: string) => void;
  hasArt: (artId: string) => boolean;
  addArt: (artId: string) => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: [],
      unlockedArts: [],
      has: (id) => get().unlocked.includes(id),
      unlock: (id) =>
        set((s) => (s.unlocked.includes(id) ? s : { unlocked: [...s.unlocked, id] })),
      hasArt: (artId) => get().unlockedArts.includes(artId),
      addArt: (artId) =>
        set((s) => (s.unlockedArts.includes(artId) ? s : { unlockedArts: [...s.unlockedArts, artId] })),
    }),
    {
      name: 'achievements',
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ unlocked: s.unlocked, unlockedArts: s.unlockedArts }),
    },
  ),
);
