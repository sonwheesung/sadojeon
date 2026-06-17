import { create } from 'zustand';

import type { CutsceneTone } from '@/data/cutscenes';

// 현장 급보(field event) 큐 — 강호 출행·의뢰 중 그 순간 결정해야 하는 사건.
// 휘발성(persist 없음) — 서신함(비동기 보고)과 달리 **턴 진행 흐름을 끊고 컷씬+모달로 즉시 선택**.
// 발동 측(questSystem.maybeFireEvent·expeditionSystem.fireEvent)이 push, FieldEventOverlay 가 소비.
// docs/38·20. 결정은 모달, 결과 기록은 서신함(apply* 가 남김).

// 해소에 필요한 선택지 — 표시(key/label/available/note) + 효과 필드(effect/roll/cost 등)를 그대로 싣는다.
export interface FieldEventChoiceView {
  key: string;
  label: string;
  available: boolean;
  note?: string;
  [k: string]: unknown;
}

export interface FieldEvent {
  id: string;
  source: 'quest' | 'expedition';
  refId: string; // questId 또는 activityId — 해소 시 어느 파견에 적용할지
  title: string; // 사건명(컷씬 위 띠)
  hanzi: string; // 큰 한자 워터마크(그레이박스)
  tone: CutsceneTone; // gold·ink·blood — 사건 결
  sceneLine: string; // 컷씬 서사 한 줄
  prompt: string; // 선택 모달 상황 본문
  who: string; // 동행 제자 이름들
  choices: FieldEventChoiceView[];
}

interface FieldEventStore {
  queue: FieldEvent[];
  push: (e: FieldEvent) => void;
  pop: () => void;
  clear: () => void;
}

export const useFieldEventStore = create<FieldEventStore>((set) => ({
  queue: [],
  push: (e) => set((s) => ({ queue: [...s.queue, e] })),
  pop: () => set((s) => ({ queue: s.queue.slice(1) })),
  clear: () => set({ queue: [] }),
}));
