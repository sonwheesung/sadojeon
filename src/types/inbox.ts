// Spec source: docs/12_인박스_면담.md — "항목 종류 (큰 분류)" 표.
// 새 종류 추가 시 docs의 9분류 표와 useInboxBadgeCount(DECISION_KINDS)도 갱신.

export type InboxKind =
  | 'one_liner'       // 한 마디 — 응답 가능
  | 'meeting_request' // 면담 청 — 응답 필요
  | 'event'           // 이벤트 — 결정 필요
  | 'letter'          // 서신 — 답신 가능
  | 'quest_offer'     // 의뢰 — 결정 필요
  | 'rumor'           // 풍문 — 읽기만
  | 'system'          // 공지 — 읽기만
  | 'report'          // 보고 — 읽기만
  | 'complaint'       // 요청·불만 — 응답 필요
  | 'recommendation'  // 추천 — 결정 필요
  | 'visit'           // 방문 — 응답 필요
  | 'diplomacy';      // 외교 — 응답 필요

export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InboxItemBase {
  id: string;
  kind: InboxKind;
  priority: InboxPriority;
  createdAtDay: number;
  read: boolean;
  resolved: boolean;
  fromId?: string;
  title: string;
  preview: string;
  // 결정 데이터 — 이벤트가 서신함으로 들어올 때 해소에 필요한 정보를 담는다.
  // 예: { domain:'wish'|'oneLiner'|'moral', templateId, discipleId, responses }.
  payload?: Record<string, unknown>;
}

export interface OneLinerItem extends InboxItemBase {
  kind: 'one_liner';
  body: string;
}

export interface MeetingRequestItem extends InboxItemBase {
  kind: 'meeting_request';
  topicId: string;
  discipleId: string;
}

export interface EventItem extends InboxItemBase {
  kind: 'event';
  eventId: string;
  expiresAtDay?: number;
}

export interface LetterItem extends InboxItemBase {
  kind: 'letter';
  body: string;
  senderName: string;
}

export interface QuestOfferItem extends InboxItemBase {
  kind: 'quest_offer';
  questId: string;
  expiresAtDay: number;
}

export interface RumorItem extends InboxItemBase {
  kind: 'rumor';
  body: string;
}

export interface SystemItem extends InboxItemBase {
  kind: 'system';
  body: string;
}

export interface ReportItem extends InboxItemBase {
  kind: 'report';
  body: string;
}

export interface ComplaintItem extends InboxItemBase {
  kind: 'complaint';
  discipleId?: string;
  body: string;
}

export interface RecommendationItem extends InboxItemBase {
  kind: 'recommendation';
  body: string;
  topic?: string;
}

export interface VisitItem extends InboxItemBase {
  kind: 'visit';
  visitorName: string;
  body: string;
}

export interface DiplomacyItem extends InboxItemBase {
  kind: 'diplomacy';
  fromFaction: string;
  body: string;
}

export type InboxItem =
  | OneLinerItem
  | MeetingRequestItem
  | EventItem
  | LetterItem
  | QuestOfferItem
  | RumorItem
  | SystemItem
  | ReportItem
  | ComplaintItem
  | RecommendationItem
  | VisitItem
  | DiplomacyItem;
