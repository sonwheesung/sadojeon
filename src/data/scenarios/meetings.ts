export interface MeetingTopic {
  id: string;
  title: string;
  hanjaTitle?: string;
  prompt: string;
  tags?: string[];
}

export const MEETING_TOPICS: MeetingTopic[] = [];
