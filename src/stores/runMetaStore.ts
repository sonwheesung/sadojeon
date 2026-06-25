import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 회차 메타 — 회차 단위의 작은 플래그를 담는다. docs/46_도입_튜토리얼_회차.md.
// 회차 자산이라 endRun/seedNewRun 에서 초기화(슬롯 단위 영속 — 다른 회차 스토어와 같은 결).
// 지금은 도입 튜토리얼 회차 여부 하나. 회차 스코프 플래그가 더 생기면 여기 추가.
//
// isTutorialRun: 이 회차가 도입 튜토리얼 회차인가. true 면 졸업·통계·집계가 분기한다
//   (조기 스크립트 졸업·표국 무사 고정·본 회차 통계 집계 제외 — docs/46).

interface RunMetaStore {
  isTutorialRun: boolean;
  setTutorialRun: (v: boolean) => void;
  reset: () => void;
}

export const useRunMetaStore = create<RunMetaStore>()(
  persist(
    (set) => ({
      isTutorialRun: false,
      setTutorialRun: (v) => set({ isTutorialRun: v }),
      reset: () => set({ isTutorialRun: false }),
    }),
    {
      name: 'runMeta',
      storage: createJSONStorage(() => slotAwareStorage),
      partialize: (s) => ({ isTutorialRun: s.isTutorialRun }),
    },
  ),
);
