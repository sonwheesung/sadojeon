import { create } from 'zustand';

import type { CutsceneTone } from '@/data/cutscenes';

// 휘발성 store — 재생 대기 컷씬 큐. persist 없음(연출일 뿐, 게임 상태에 영향 X).
// 트리거 측은 systems/cutsceneSystem.playCutscene 만 호출 — 여기 직접 push 금지.

export interface PlayingCutscene {
  id: string;
  eventId: string;
  discipleId: string;
  discipleName: string;
  hanzi: string;
  title: string;
  tone: CutsceneTone;
  line: string; // 이름 치환 완료된 서사 한 줄
  quote?: string; // 제자 전용 한마디
  // 보조 미디어판(가로 레거시 등) 재생 — 시뮬랩 미리보기 비교용. 기본 undefined = 기본판.
  mediaVariant?: 'default' | 'alt';
}

interface CutsceneStore {
  queue: PlayingCutscene[];
  push: (c: PlayingCutscene) => void;
  pop: () => void;
  clear: () => void;
}

export const useCutsceneStore = create<CutsceneStore>((set) => ({
  queue: [],
  push: (c) => set((s) => ({ queue: [...s.queue, c] })),
  pop: () => set((s) => ({ queue: s.queue.slice(1) })),
  clear: () => set({ queue: [] }),
}));
