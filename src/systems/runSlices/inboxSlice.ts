import { runs } from '@/data/repositories';
import { useInboxStore } from '@/stores/inboxStore';
import type { InboxItem } from '@/types';
import type { RunChildSlice } from './types';

// 서신함 — 전체 InboxItem 블롭을 payload 로 저장/복원. 새 회차엔 빈 상태.
export const inboxSlice: RunChildSlice = {
  key: 'inbox',
  async save(runId) {
    const records = useInboxStore.getState().items.map((it: InboxItem) => ({
      kind: it.kind,
      title: it.title,
      preview: it.preview ?? null,
      body: 'body' in it && typeof it.body === 'string' ? it.body : null,
      priority: it.priority,
      createdAtDay: it.createdAtDay ?? null,
      read: it.read,
      resolved: it.resolved,
      item: it as unknown as Record<string, unknown>,
    }));
    await runs.saveInbox(runId, records);
  },
  async load(runId) {
    const arr = await runs.getInbox(runId);
    useInboxStore.setState({ items: arr as unknown as InboxItem[] });
  },
  reset() {
    useInboxStore.getState().reset();
  },
};
