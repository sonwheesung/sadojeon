import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// 만난 네임드 NPC 집합 — **계정 단위 영속**(포켓몬 도감 결). 회차·슬롯 무관(seedNewRun 리셋 X).
// 강호에서 조우(압도적 고수 습격 등)하면 markMet. 도감(app/npc)은 **베일 인물(ageKnown=false)을
// 만나야 실루엣이 벗겨진다** — 공개 인물(ageKnown=true)은 강호에 이름나 기본 공개. docs/24·38.
// 튜토리얼 seen 과 같은 결: 로컬(metaStorage) + DB(accountState) 이중 영속. 게임 상태·치팅 무관.

interface MetNpcStore {
  met: string[]; // 만난 네임드 id 목록
  hasMet: (id: string) => boolean;
  markMet: (id: string) => void;
  reset: () => void; // 디버그·서버 클린슬레이트용(계정 자산이라 평소 호출 X)
}

export const useMetNpcStore = create<MetNpcStore>()(
  persist(
    (set, get) => ({
      met: [],
      hasMet: (id) => get().met.includes(id),
      markMet: (id) => set((s) => (s.met.includes(id) ? s : { met: [...s.met, id] })),
      reset: () => set({ met: [] }),
    }),
    {
      name: 'metNpc',
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ met: s.met }),
    },
  ),
);
