// 회차 경계 처리 헬퍼.
// docs/16_회차_다회차.md "인계 대상 — 비급만"
//
// endRun(): 회차 종결 — 비급 원본은 유지, 그 외 모든 store 초기화.
//   학자형 사부의 본업이 매 회차 새로 시작 ([02 사부 시스템](docs/02_사부_시스템.md)).
// endSlot(): 슬롯 전체 초기화 — 비급까지 포함하여 모든 데이터 제거 (테스트·새 슬롯).

import {
  useCodexStore,
  useDiscipleStore,
  useInboxStore,
  useMasterStore,
  useScheduleStore,
  useSectStore,
  useTimeStore,
} from '@/stores';

export function endRun(): void {
  useTimeStore.getState().reset();
  useDiscipleStore.getState().reset();
  useMasterStore.getState().reset();
  useSectStore.getState().reset();
  useInboxStore.getState().reset();
  useScheduleStore.getState().reset();
  // 비급 원본은 보존, 연구 진행도·영약만 리셋
  useCodexStore.getState().resetForNewRun();
}

export function endSlot(): void {
  useTimeStore.getState().reset();
  useDiscipleStore.getState().reset();
  useMasterStore.getState().reset();
  useSectStore.getState().reset();
  useInboxStore.getState().reset();
  useScheduleStore.getState().reset();
  // 슬롯 전체 초기화 — 비급까지 비움
  useCodexStore.getState().resetAll();
}
