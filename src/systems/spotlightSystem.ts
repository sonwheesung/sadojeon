// 스포트라이트 조율 — 도입 회차 강제 코치마크의 진입/진행/종료. docs/44·46.
import { INTRO_SPOTLIGHT, INTRO_SPOTLIGHT_KEY } from '@/data/spotlightTours';
import { useSpotlightStore } from '@/stores/spotlightStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';

// 도입 회차 첫 일과 진입 시 1회. 이미 봤거나, 맥락형 카드가 떠 있거나, 이미 진행 중이면 무시.
// 반환: 이번에 시작했으면 true.
export function startIntroSpotlight(): boolean {
  if (useTutorialStore.getState().hasSeen(INTRO_SPOTLIGHT_KEY)) return false; // 계정 1회
  if (useSpotlightStore.getState().active) return false; // 이미 진행 중
  if (useTutorialUiStore.getState().active) return false; // 맥락형 카드와 겹침 방지(스포트라이트는 그 뒤에)
  useSpotlightStore.getState().start(INTRO_SPOTLIGHT);
  return true;
}

export function advanceSpotlight(): void {
  useSpotlightStore.getState().next();
}

// 투어 종료(완주 또는 강제) — 본 것으로 계정에 1회 기록(재노출 안 함).
export function endSpotlight(): void {
  useSpotlightStore.getState().end();
  if (!useTutorialStore.getState().hasSeen(INTRO_SPOTLIGHT_KEY)) {
    useTutorialStore.getState().markSeen(INTRO_SPOTLIGHT_KEY);
    // 계정 영속은 호출 시점 lazy require(트리거 경로에 무거운 의존 안 끌어옴, tutorialSystem 과 동일 결).
    const { saveAccountSilently } = require('@/systems/accountSync') as typeof import('@/systems/accountSync');
    saveAccountSilently();
  }
}
