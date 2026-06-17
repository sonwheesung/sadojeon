import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// 업적 집계 — **계정 단위 영속**(회차·슬롯 무관, metaStorage). docs/32.
// 상태 스캔으로 못 잡는 누적 사실(의뢰 N건 완수·연속 무사고 등)을 적립한다.
// 회차 시작(seedNewRun)에 **리셋하지 않는다**(achievementStore 와 같은 계정 자산).
// 카운터는 키→수 맵(범용) — 새 집계 항목 추가 시 키 한 줄(스키마 변경·마이그레이션 불필요).

interface TallyStore {
  counts: Record<string, number>; // 단조 증가 카운터
  streaks: Record<string, number>; // 현재 연속값
  maxStreaks: Record<string, number>; // 최고 연속값(업적 판정용)
  n: (key: string) => number;
  streak: (key: string) => number;
  bump: (key: string, by?: number) => void;
  bumpStreak: (key: string) => void; // 현재+1, 최고 갱신
  resetStreak: (key: string) => void; // 현재 0(최고는 유지)
  reset: () => void; // 디버그·테스트용(계정 자산이라 평소 호출 X)
}

export const useTallyStore = create<TallyStore>()(
  persist(
    (set, get) => ({
      counts: {},
      streaks: {},
      maxStreaks: {},
      n: (key) => get().counts[key] ?? 0,
      streak: (key) => get().maxStreaks[key] ?? 0,
      bump: (key, by = 1) =>
        set((s) => ({ counts: { ...s.counts, [key]: (s.counts[key] ?? 0) + by } })),
      bumpStreak: (key) =>
        set((s) => {
          const cur = (s.streaks[key] ?? 0) + 1;
          const max = Math.max(cur, s.maxStreaks[key] ?? 0);
          return { streaks: { ...s.streaks, [key]: cur }, maxStreaks: { ...s.maxStreaks, [key]: max } };
        }),
      resetStreak: (key) => set((s) => ({ streaks: { ...s.streaks, [key]: 0 } })),
      reset: () => set({ counts: {}, streaks: {}, maxStreaks: {} }),
    }),
    {
      name: 'tally',
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ counts: s.counts, streaks: s.streaks, maxStreaks: s.maxStreaks }),
    },
  ),
);
