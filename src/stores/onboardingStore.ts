import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// 첫 안내(온보딩) 본 여부 — **계정 단위 영속**(회차·슬롯 무관, metaStorage). docs/44.
// 업적·집계와 같은 계정 자산이라 회차 시작(seedNewRun)에 리셋하지 않는다. 로컬(metaStorage) +
// DB(accountState) 이중 영속 — tallyStore/achievementStore 와 동일 패턴.
// seen=true 면 다음 회차부터 안내를 건너뛴다. 순수 UX 플래그(게임 상태·치팅 무관).

interface OnboardingStore {
  seen: boolean; // 안내를 끝까지 봤거나 건너뛰었는가(계정 1회)
  markSeen: () => void;
  reset: () => void; // 디버그·테스트용(계정 자산이라 평소 호출 X)
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      seen: false,
      markSeen: () => set({ seen: true }),
      reset: () => set({ seen: false }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ seen: s.seen }),
    },
  ),
);
