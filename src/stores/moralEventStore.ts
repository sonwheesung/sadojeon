import { create } from 'zustand';

import type { PendingMoralEvent } from '@/types';

// 휘발성 store — 도덕적 갈등 이벤트의 응답 대기 상태.
// 응답 후 즉시 clear — 결과는 다음 진행의 정산 모달에서 누적 표시.

interface MoralEventStore {
  pending: PendingMoralEvent | null;
  set: (v: PendingMoralEvent) => void;
  clear: () => void;
}

export const useMoralEventStore = create<MoralEventStore>((set) => ({
  pending: null,
  set: (v) => set({ pending: v }),
  clear: () => set({ pending: null }),
}));
