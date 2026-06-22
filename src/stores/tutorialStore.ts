import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// 맥락형 튜토리얼 "본 주제" 집합 — **계정 단위 영속**(회차·슬롯 무관, metaStorage). docs/44.
// 업적·집계와 같은 계정 자산이라 회차 시작(seedNewRun)에 리셋하지 않는다. 로컬(metaStorage) +
// DB(accountState) 이중 영속. 주제(key)별로 한 번만 안내 → 본 key 를 집합에 적재.
// 순수 UX 플래그(게임 상태·치팅 무관). 실행 중 "지금 보이는 주제"는 여기 두지 않는다(tutorialUiStore).

interface TutorialStore {
  seen: string[]; // 이미 본 안내 주제 key 목록
  hasSeen: (key: string) => boolean;
  markSeen: (key: string) => void;
  reset: () => void; // 디버그·테스트용(계정 자산이라 평소 호출 X)
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      seen: [],
      hasSeen: (key) => get().seen.includes(key),
      markSeen: (key) =>
        set((s) => (s.seen.includes(key) ? s : { seen: [...s.seen, key] })),
      reset: () => set({ seen: [] }),
    }),
    {
      name: 'tutorial',
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ seen: s.seen }),
    },
  ),
);
