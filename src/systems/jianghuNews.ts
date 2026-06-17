// 강호 풍문 서신 — 졸업 제자·강호 사건 소식을 서신함에 적재(읽기 전용). docs/08.
// careerSystem·graduateEvents 공용(순환 의존 차단을 위해 분리). payload.domain='jianghu_news'.

import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';

export function pushJianghuNews(
  title: string,
  body: string,
  priority: 'normal' | 'high' = 'normal',
): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `jianghu-${day}-${Math.floor(Math.random() * 1e6)}`,
    kind: 'rumor',
    title,
    preview: body,
    body,
    priority,
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}
