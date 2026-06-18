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

      // 적체 방지 — 상한 초과 시 **미해결 결정형 항목(event·면담요청·의뢰제안)을 제외한** 나머지를
      // 오래된 것부터 제거. 풍문·보고·서신·알림 등 정보성은 결정이 없으므로 **읽음 여부와 무관하게** 정리 대상
      // (안 읽어도 손실 없는 정보다). 미해결 결정형은 절대 안 지운다(결정 유실·동결 방지). 매일 호출.
      // 🐛 종전엔 "읽은 것"만 정리해, 서신함을 안 여는(또는 서버 시뮬) 경우 미읽음 풍문/보고가 무한 누적
      //   (15년 5549건 — lifetime 시뮬 발견). 메모리·매턴 직렬화(GameState)·서버 전송을 부풀린다. docs/37.
      prune: (max = 120) =>
        set((s) => {
          if (s.items.length <= max) return s;
          const ACTIONABLE = new Set(['event', 'meeting_request', 'quest_offer']);
          const mustKeep = (it: InboxItem) => !it.resolved && ACTIONABLE.has(it.kind); // 미해결 결정 — 절대 보존
          const kept = s.items.filter(mustKeep);
          const room = Math.max(0, max - kept.length);
          const rest = s.items.filter((it) => !mustKeep(it)).slice(0, room); // 정보성·해결분 최신순 cap 내
          const keepIds = new Set([...kept, ...rest].map((it) => it.id));
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
