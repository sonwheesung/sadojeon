import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { InventoryCategoryKey } from '@/data/labels';
import { slotAwareStorage } from './persistStorage';

// 물품(인벤토리) — 회차(사문)별. 영약·단약·비급·재료·잡화·패물 카테고리.
// 그레이박스: 현재는 비어 시작(획득 소스 미구현). 구조·DB 영속만 먼저.

export interface StoredItem {
  id: string;
  category: InventoryCategoryKey;
  name: string;
  grade: number; // 1~5
  count: number;
  effects: string;
}

interface ItemStore {
  items: StoredItem[];
  setAll: (list: StoredItem[]) => void;
  add: (item: StoredItem) => void;
  remove: (id: string) => void;
  // 수량 가감 — 0 이하면 제거.
  adjustCount: (id: string, delta: number) => void;
  byCategory: (cat: InventoryCategoryKey) => StoredItem[];
  countOf: (cat: InventoryCategoryKey) => number;
  reset: () => void;
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set, get) => ({
      items: [],

      setAll: (list) => set({ items: list }),

      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, count: i.count + item.count } : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      adjustCount: (id, delta) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, count: i.count + delta } : i))
            .filter((i) => i.count > 0),
        })),

      byCategory: (cat) => get().items.filter((i) => i.category === cat),
      countOf: (cat) =>
        get()
          .items.filter((i) => i.category === cat)
          .reduce((sum, i) => sum + i.count, 0),

      reset: () => set({ items: [] }),
    }),
    {
      name: 'items',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
