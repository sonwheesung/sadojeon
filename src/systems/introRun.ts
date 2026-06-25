// 도입 튜토리얼 회차 — 진입 판정·시작·건너뛰기. docs/46.
// 계정 1회 강제: 첫 계정(사부 없음 && 'intro-run' 미경험)은 슬롯 첫 진입에서 도입 회차를 권한다.
// 마킹 시점 = 진입(시작/건너뛰기) 즉시 — 중도 포기해도 다시 강제하지 않는다(재강제 루프 방지).
// 플래그는 tutorialStore.seen 의 'intro-run' 키(계정 자산 — 회차·슬롯 무관, 맥락형 튜토리얼과 같은 결).

import { useMasterStore } from '@/stores/masterStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { startTutorialRun } from './newRun';
import { saveAccountSilently } from './accountSync';

// tutorialStore.seen 의 별 키(주제 key 와 충돌 없음 — id충돌 렌즈, docs/43).
export const INTRO_RUN_KEY = 'intro-run';

// 도입 회차를 권해야 하는가 — 회차가 비어(사부 없음) 있고, 아직 도입 회차를 경험하지 않은 첫 계정.
export function introRunPending(): boolean {
  const fresh = useMasterStore.getState().master == null;
  const seen = useTutorialStore.getState().hasSeen(INTRO_RUN_KEY);
  return fresh && !seen;
}

// 'intro-run' 을 본 것으로 기록 + 계정 영속(다시 강제 안 함).
function markIntroRunSeen(): void {
  useTutorialStore.getState().markSeen(INTRO_RUN_KEY);
  saveAccountSilently(); // 계정 DB 동기(기기 간) — 맥락형 튜토리얼 dismiss 와 같은 결.
}

// 도입 회차 시작 — 즉시 마킹(재강제 방지) 후 장철 1명 고정 시드. docs/46.
export function beginIntroRun(): void {
  markIntroRunSeen();
  startTutorialRun();
}

// 도입 회차 건너뛰기 — 마킹만(시드는 일반 시작 선택 흐름으로). docs/46.
export function skipIntroRun(): void {
  markIntroRunSeen();
}
