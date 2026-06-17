// 현장 급보 해소 — FieldEventOverlay 의 선택을 알맞은 파견 시스템에 적용. docs/38·20.
// 결정 UI(컷씬+모달)는 화면, 효과 적용은 기존 apply 함수 재사용(의뢰=quest, 출행=expedition).

import type { FieldEvent } from '@/stores/fieldEventStore';
import { applyQuestEventChoice, type QuestEventChoiceView } from './questSystem';
import { applyExpeditionEventChoice, type ExpeditionChoiceView } from './expeditionSystem';

export function resolveFieldEvent(ev: FieldEvent, key: string): void {
  const choice = ev.choices.find((c) => c.key === key);
  if (!choice) return;
  if (ev.source === 'quest') {
    applyQuestEventChoice(ev.refId, choice as unknown as QuestEventChoiceView);
  } else {
    applyExpeditionEventChoice(ev.refId, choice as unknown as ExpeditionChoiceView);
  }
}
