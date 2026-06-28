import { Fragment } from 'react';

import { SpotlightOverlay } from './SpotlightOverlay';
import { TutorialOverlay } from './TutorialOverlay';
import { findTutorial } from '@/data/tutorials';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';
import { dismissTutorial } from '@/systems/tutorialSystem';

// 튜토리얼 호스트 — 루트에 한 번 마운트(확인창 ConfirmProvider 와 같은 결). docs/44.
// 맥락형 카드(tutorialUiStore.active) + 강제 스포트라이트(spotlightStore, 자체 구독)를 함께 띄운다.
// 어느 화면/모달에서 트리거하든 루트 모달이라 그 위에 표시된다.
export function TutorialHost() {
  const active = useTutorialUiStore((s) => s.active);
  const topic = active ? findTutorial(active) : undefined;
  return (
    <Fragment>
      {topic && <TutorialOverlay cards={topic.cards} onDone={dismissTutorial} />}
      <SpotlightOverlay />
    </Fragment>
  );
}
