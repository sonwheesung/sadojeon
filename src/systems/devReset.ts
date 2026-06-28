// dev 전용 — 회차 데이터 모두 초기화.
// 호출 후 master/sect/disciples/codex/schedule/inbox/encounter/atmosphere 모두 빈 상태.
// 메인 화면이 자동으로 StartSelectModal 표시 (master null 셀렉터).
//
// resetIfFirstRun(): sentinel 키 기반 일회성 자동 reset.
//   사용자가 "처음부터 시작" 명시적으로 요청한 시점 이후 1회만 실행.
//   sentinel 변경 시 다시 1회 reset (다음 strip 가능).

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useCodexStore,
  useDiscipleStore,
  useGameStore,
  useInboxStore,
  useMasterStore,
  useRunMetaStore,
  useScheduleStore,
  useSectStore,
  useTimeStore,
  useTutorialStore,
} from '@/stores';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';

// 메모리 reset 후 슬롯 storage 키만 제거 (메타 보존).
export async function resetEverything(): Promise<void> {
  // 1. 메모리 — 각 store reset 액션 호출.
  useTimeStore.getState().reset();
  useRunMetaStore.getState().reset();
  useDiscipleStore.getState().reset();
  useMasterStore.getState().reset();
  useSectStore.getState().reset();
  useScheduleStore.getState().reset();
  useInboxStore.getState().reset();
  useSectAtmosphereStore.getState().reset();

  // codex 는 회차 누적 (비급은 영구) — dev 리셋은 resetAll 로 모두 비움.
  useCodexStore.getState().resetAll();

  // 휘발성 store — 직접 setState 로 비움.
  usePendingStore.setState({
    oneLiner: null,
    wish: null,
    dailyLog: null,
    dailyBadges: {},
    milestones: [],
  });
  useMoralEventStore.setState({ pending: null });

  // 2. AsyncStorage — 현재 slot 의 모든 키 제거 (메타 보존).
  const slot = useGameStore.getState().meta.saveSlot;
  const prefix = `sadojeon:slot${slot}:`;
  const keys = await AsyncStorage.getAllKeys();
  const slotKeys = keys.filter((k) => k.startsWith(prefix));
  if (slotKeys.length > 0) {
    await AsyncStorage.multiRemove(slotKeys);
  }
}

// dev 전용 — 회차 데이터 + 튜토리얼 본 기록을 비워 **도입 튜토리얼부터** 다시 시작시킨다. docs/46.
// 재가입 없이 스포트라이트·도입 회차를 재시연하려는 테스트용. 호출 후 일과 화면이 IntroRunGate 를 띄운다.
export async function devResetToTutorial(): Promise<void> {
  await resetEverything(); // 회차 비움 → 사부 없음(isFresh)
  useTutorialStore.getState().reset(); // seen 비움 → intro-run·intro-spotlight 재노출
  // 비운 seen 을 계정에도 영속(다음 loadAccount 가 옛 seen 으로 덮지 않게).
  const { saveAccountSilently } = require('@/systems/accountSync') as typeof import('@/systems/accountSync');
  saveAccountSilently();
}

// 일회성 자동 reset. sentinel 키 변경 시 다음 빌드에서 다시 1회 실행.
const RESET_SENTINEL = '@shidao/fresh-start-2026-05-25-v1';

export async function resetIfFirstRun(): Promise<boolean> {
  const done = await AsyncStorage.getItem(RESET_SENTINEL);
  if (done) return false;
  await resetEverything();
  await AsyncStorage.setItem(RESET_SENTINEL, '1');
  return true;
}
