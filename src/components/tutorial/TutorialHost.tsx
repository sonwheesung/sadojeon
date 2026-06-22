import { TutorialOverlay } from './TutorialOverlay';
import { findTutorial } from '@/data/tutorials';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';
import { dismissTutorial } from '@/systems/tutorialSystem';

// 튜토리얼 호스트 — 루트에 한 번 마운트(확인창 ConfirmProvider 와 같은 결). docs/44.
// 지금 활성 주제(tutorialUiStore.active)가 있으면 그 카드들을 오버레이로 띄운다.
// 어느 화면/모달에서 트리거하든 루트 모달이라 그 위에 표시된다.
export function TutorialHost() {
  const active = useTutorialUiStore((s) => s.active);
  const topic = active ? findTutorial(active) : undefined;
  if (!topic) return null;
  return <TutorialOverlay cards={topic.cards} onDone={dismissTutorial} />;
}
