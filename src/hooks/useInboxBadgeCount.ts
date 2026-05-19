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

export { DECISION_KINDS };
