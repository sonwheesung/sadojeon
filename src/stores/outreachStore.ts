import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { slotAwareStorage } from './persistStorage';

// 사부 개입(서신·호출) 발신 큐 — 졸업 제자에게 보낸 전갈이 강호에 닿기까지의 지연을 담는다. docs/08.
// 회차 스코프(seedNewRun reset). 도달 시 masterOutreachSystem.tickMasterOutreach 가 수용/무시 판정 후 제거.

export type OutreachKind = 'letter' | 'summon';
export type LetterTone = 'encourage' | 'advise' | 'warn';

export interface OutreachMsg {
  id: string;
  graduateId: string;
  graduateName: string;
  kind: OutreachKind;
  tone?: LetterTone; // letter 전용(격려·충고·경고)
  sentDay: number;
  dueDay: number; // totalDay ≥ dueDay 면 도달·판정
}

interface OutreachStore {
  pending: OutreachMsg[];
  add: (m: OutreachMsg) => void;
  remove: (id: string) => void;
  reset: () => void;
}

export const useOutreachStore = create<OutreachStore>()(
  persist(
    (set) => ({
      pending: [],
      add: (m) => set((s) => ({ pending: [...s.pending, m] })),
      remove: (id) => set((s) => ({ pending: s.pending.filter((x) => x.id !== id) })),
      reset: () => set({ pending: [] }),
    }),
    {
      name: 'outreach',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ pending: s.pending }),
    },
  ),
);
