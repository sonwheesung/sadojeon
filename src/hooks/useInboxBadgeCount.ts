import { useInboxStore } from '@/stores/inboxStore';
import type { InboxKind } from '@/types';

// "결정/응답 필요" 카테고리. docs/12_인박스_면담.md "응답 필요 여부" 정의 기준.
const DECISION_KINDS: ReadonlyArray<InboxKind> = [
  'event',
  'meeting_request',
  'quest_offer',
  'complaint',
  'recommendation',
  'visit',
  'diplomacy',
];

export function useInboxBadgeCount(): number {
  return useInboxStore((s) =>
    s.items.filter((it) => !it.resolved && DECISION_KINDS.includes(it.kind)).length,
  );
}

// 안 읽은 서신 총 갯수 — 탭 배지용 (쌓인 갯수 표시).
export function useInboxUnreadCount(): number {
  return useInboxStore((s) => s.items.filter((it) => !it.read).length);
}

export { DECISION_KINDS };
