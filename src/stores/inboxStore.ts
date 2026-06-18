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
  prune: (max?: number) => void;
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

      // 적체 방지 — 상한 초과 시 **이미 본 + 처리됐거나 읽기전용(풍문·보고·서신)** 항목만 오래된 것부터 제거.
      // 미읽음·미해소(결정 대기) 항목은 절대 안 지운다(결정 유실·동결 방지). 매일 advanceTurn 에서 호출.
      // 15년×365일 누적 풍문/보고가 무한 증가해 메모리·매턴 직렬화(GameState)·서버 전송을 부풀리던 것 차단. docs/37.
      prune: (max = 120) =>
        set((s) => {
          if (s.items.length <= max) return s;
          const READONLY = new Set(['report', 'rumor', 'letter']);
          const droppable = (it: InboxItem) => it.read && (it.resolved || READONLY.has(it.kind));
          const kept = s.items.filter((it) => !droppable(it)); // 미읽음·미해소·응답형 보존
          const room = Math.max(0, max - kept.length);
          const keptDone = s.items.filter(droppable).slice(0, room); // 처리분은 최신순으로 cap 내
          const keepIds = new Set([...kept, ...keptDone].map((it) => it.id));
          return { items: s.items.filter((it) => keepIds.has(it.id)) }; // 원래 순서(최신순) 보존
        }),

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
