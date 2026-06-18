import { useInboxStore } from '@/stores/inboxStore';
import { DECISION_KINDS, isDecisionKind } from '@/types';

// "결정/응답 필요" 카테고리. 정본은 types/inbox 의 DECISION_KINDS(진행 게이트·prune 과 단일 진실).
export function useInboxBadgeCount(): number {
  return useInboxStore((s) =>
    s.items.filter((it) => !it.resolved && isDecisionKind(it.kind)).length,
  );
}

// 안 읽은 서신 총 갯수 — 탭 배지용 (쌓인 갯수 표시).
export function useInboxUnreadCount(): number {
  return useInboxStore((s) => s.items.filter((it) => !it.read).length);
}

export { DECISION_KINDS };
export { isDecisionKind };
