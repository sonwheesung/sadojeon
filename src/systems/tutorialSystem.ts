import { findTutorial } from '@/data/tutorials';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';

// 맥락형 튜토리얼 조율 — 화면·행동에서 한 줄 호출하는 진입점. docs/44.
// triggerTutorial(key): 처음이면 그 자리에서 안내를 띄운다. 이미 봤거나 다른 안내가 떠 있으면 무시.
// dismissTutorial(): 안내 종료 — 본 것으로 계정에 기록(DB·로컬) + 화면에서 내린다.

// 기능을 처음 마주쳤을 때 호출. (예: 연단실 첫 건설 직후 triggerTutorial('alchemy'))
// 반환: 이번 호출로 안내를 띄웠으면 true(첫 만남), 무시했으면 false(이미 봤거나 다른 안내 표시 중·미등록).
// 호출부가 "첫 안내면 그 동작은 멈추고 읽게" 분기할 수 있다(예: 빠른 진행 첫 누름 — 카드만 띄우고 진행 보류).
export function triggerTutorial(key: string): boolean {
  if (!findTutorial(key)) return false; // 등록되지 않은 주제 — 무시(오타·미작성 안전)
  if (useTutorialStore.getState().hasSeen(key)) return false; // 이미 본 주제
  if (useTutorialUiStore.getState().active) return false; // 다른 안내 표시 중 — 겹침 방지(MVP: 큐 없음)
  useTutorialUiStore.getState().request(key);
  return true;
}

// 안내를 끝까지 봤거나 건너뛴 시점. 본 것으로 기록하고 내린다.
export function dismissTutorial(): void {
  const active = useTutorialUiStore.getState().active;
  if (active) {
    useTutorialStore.getState().markSeen(active);
    // 계정 영속은 호출 시점에만 lazy require — 트리거 경로(화면 import)에 무거운 의존
    // (repositories→supabase)을 모듈 로드 단계에서 끌어오지 않게 격리. docs/44.
    const { saveAccountSilently } = require('@/systems/accountSync') as typeof import('@/systems/accountSync');
    saveAccountSilently(); // 본 주제를 계정에 영속(DB·로컬)
  }
  useTutorialUiStore.getState().clear();
}
