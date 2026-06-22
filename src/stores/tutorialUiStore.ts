import { create } from 'zustand';

// 지금 화면에 띄울 튜토리얼 주제 — **실행 중 휘발 상태**(영속 X, 계정 동기화 X).
// "본 주제 집합"(tutorialStore)과 분리: 본 여부는 계정 자산, 지금 보이는 것은 UI 상태.
// 한 번에 한 주제만(MVP — 큐 없음). 트리거/종료는 systems/tutorialSystem 이 조율.

interface TutorialUiStore {
  active: string | null; // 지금 보이는 주제 key (없으면 null)
  request: (key: string) => void;
  clear: () => void;
}

export const useTutorialUiStore = create<TutorialUiStore>((set) => ({
  active: null,
  request: (key) => set({ active: key }),
  clear: () => set({ active: null }),
}));
