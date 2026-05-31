import { runs } from '@/data/repositories';
import { useItemStore, type StoredItem } from '@/stores/itemStore';
import type { RunChildSlice } from './types';

// 물품(인벤토리) — 전체 StoredItem 블롭. 새 회차엔 빈 상태.
export const itemsSlice: RunChildSlice = {
  key: 'items',
  async save(runId) {
    const records = useItemStore.getState().items.map((it: StoredItem) => ({
      category: it.category,
      itemKey: it.id,
      qty: it.count,
      item: it as unknown as Record<string, unknown>,
    }));
    await runs.saveItems(runId, records);
  },
  async load(runId) {
    const arr = await runs.getItems(runId);
    useItemStore.getState().setAll(arr as unknown as StoredItem[]);
  },
  reset() {
    useItemStore.getState().reset();
  },
};
