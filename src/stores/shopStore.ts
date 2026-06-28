import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 상점 한정 구매 추적 — **슬롯(사문) 단위** 영속(slotAwareStorage). 신품 영약 "사문별 1개"(docs/50 §4).
// 회차(run)마다 리셋하지 않는다 — 사문 단위 한정이라 회차를 넘어 유지(사문 삭제 시에만 슬롯 통째 소멸).
interface ShopStore {
  boughtLimited: string[]; // 구매 완료한 한정 상품 id
  isLimitedBought: (id: string) => boolean;
  markLimited: (id: string) => void;
  reset: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      boughtLimited: [],
      isLimitedBought: (id) => get().boughtLimited.includes(id),
      markLimited: (id) =>
        set((s) => (s.boughtLimited.includes(id) ? s : { boughtLimited: [...s.boughtLimited, id] })),
      reset: () => set({ boughtLimited: [] }),
    }),
    { name: 'shop', storage: createJSONStorage(() => slotAwareStorage) },
  ),
);
