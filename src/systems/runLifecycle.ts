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
  useRunMetaStore,
  useScheduleStore,
  useSectStore,
  useTimeStore,
} from '@/stores';
import { checkAchievements } from './achievementSystem';
import { finalizePendingGraduations } from './graduationChoice';
import { saveAccountSilently } from './accountSync';

export function endRun(): void {
  // 회차 종료 직전 — 직업 미확정인 졸업 제자를 확정하고 업적을 스캔한다(제자 리셋 전).
  // 마지막 제자가 졸업 직업 선택을 못 한 채 회차가 끝나면 업적·전설 무공서 해금이 누락됐다(docs/37 R17).
  finalizePendingGraduations();
  checkAchievements();
  saveAccountSilently(); // 회차 마지막 업적·해금 무공서를 계정 DB에 영속(리셋 전).
  useTimeStore.getState().reset();
  useRunMetaStore.getState().reset(); // 회차 메타(도입 튜토리얼 여부 등) 초기화. docs/46
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
  useRunMetaStore.getState().reset();
  useDiscipleStore.getState().reset();
  useMasterStore.getState().reset();
  useSectStore.getState().reset();
  useInboxStore.getState().reset();
  useScheduleStore.getState().reset();
  // 슬롯 전체 초기화 — 비급까지 비움
  useCodexStore.getState().resetAll();
}
