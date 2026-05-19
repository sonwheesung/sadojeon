import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { InboxItem } from '@/types';
import { slotAwareStorage } from './persistStorage';

interface InboxStore {
  items: InboxItem[];
  add: (item: InboxItem) => void;
  addMany: (items: InboxItem[]) => void;
  markRead: (id: string) => void;
  markResolved: (id: string) => void;
  remove: (id: string) => void;
  clearExpired: (currentDay: number) => void;
  unreadCount: () => number;
  decisionPendingCount: () => number;
  reset: () => void;
}

export const useInboxStore = create<InboxStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => set((s) => ({ items: [item, ...s.items] })),

      addMany: (items) => set((s) => ({ items: [...items, ...s.items] })),

      markRead: (id) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, read: true } : it)),
        })),

      markResolved: (id) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, resolved: true, read: true } : it,
          ),
        })),

      remove: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

      clearExpired: (currentDay) =>
        set((s) => ({
          items: s.items.filter((it) => {
            if ('expiresAtDay' in it && typeof it.expiresAtDay === 'number') {
              return it.expiresAtDay >= currentDay;
            }
            return true;
          }),
        })),

      unreadCount: () => get().items.filter((it) => !it.read).length,

      decisionPendingCount: () =>
        get().items.filter(
          (it) =>
            !it.resolved &&
            (it.kind === 'event' ||
              it.kind === 'meeting_request' ||
              it.kind === 'quest_offer'),
        ).length,

      reset: () => set({ items: [] }),
    }),
    {
      name: 'inbox',
      storage: createJSONStorage(() => slotAwareStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
