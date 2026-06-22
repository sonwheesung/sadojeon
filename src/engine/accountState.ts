// 계정 상태(AccountState) — 회차(GameState)와 **별개로 영속되는 유저 단위 상태**. docs/31·32.
// 업적·집계는 회차를 넘어 누적되므로 GameState 가 아니다. 서버에선 **요청마다 해당 유저의 계정 상태를
// 로드·격리**해야 한다(안 그러면 warm 인스턴스에서 유저 간 누수 — docs/37 C10). 그 로드/세이브 계약.
//
// 드리프트 0: 함수 제외 데이터만 자동 수집(파생 타입). 배럴 아닌 직접 import(RN/배럴 회피).

import { useAchievementStore } from '@/stores/achievementStore';
import { useTallyStore } from '@/stores/tallyStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useCodexStore, type OwnedScroll } from '@/stores/codexStore';
import { useGameStore } from '@/stores/gameStore';

const ACCOUNT_STORES = {
  achievement: useAchievementStore,
  tally: useTallyStore,
  tutorial: useTutorialStore, // 본 튜토리얼 주제 집합 — 계정 단위(docs/44)
} as const;

type AccountStores = typeof ACCOUNT_STORES;

type DataOnly<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K];
};

// 업적·집계 + **다이아**(계정 단위 재화 — gameStore.diamonds, 연구 즉시완료 등에 소비).
// 다이아도 회차 무관 계정 상태라 GameState 가 아니라 여기. 서버에서 유저별 로드/격리 대상.
// 비급 소유(codexScrolls)도 계정 단위 — 모든 사문 공통(2026-06-22, docs/16·45). 연구 진행도는 제외(회차별 run blob).
export type AccountState = {
  [K in keyof AccountStores]: DataOnly<ReturnType<AccountStores[K]['getState']>>;
} & { diamonds: number; codexScrolls: OwnedScroll[] };

function dataOnly<T extends object>(state: T): DataOnly<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state)) if (typeof v !== 'function') out[k] = v;
  return out as DataOnly<T>;
}

// 현재 계정 스토어 → 한 객체(서버 저장·응답용).
export function captureAccountState(): AccountState {
  const acc = {} as Record<string, unknown>;
  for (const key of Object.keys(ACCOUNT_STORES) as (keyof AccountStores)[]) {
    acc[key] = dataOnly(ACCOUNT_STORES[key].getState());
  }
  acc.diamonds = useGameStore.getState().diamonds;
  acc.codexScrolls = useCodexStore.getState().dumpOwnership(); // 비급 소유 — 계정 단위
  return acc as AccountState;
}

// AccountState 를 스토어에 반영(유저 로드).
export function commitAccountState(state: AccountState): void {
  for (const key of Object.keys(ACCOUNT_STORES) as (keyof AccountStores)[]) {
    const store = ACCOUNT_STORES[key] as unknown as { setState: (partial: unknown) => void };
    store.setState(state[key]);
  }
  useGameStore.setState({ diamonds: state.diamonds });
  useCodexStore.getState().commitOwnership(state.codexScrolls ?? []); // 비급 소유 반영(연구는 run blob 이 덮음)
}

// 계정 스토어를 빈 상태로 — 서버 요청 클린 슬레이트(이전 유저 잔여 차단). 유저 로드 전 호출.
export function resetAccountState(): void {
  useAchievementStore.setState({ unlocked: [], unlockedArts: [] } as never);
  useTallyStore.setState({ counts: {}, streaks: {}, maxStreaks: {} } as never);
  useTutorialStore.setState({ seen: [] } as never); // 신규 유저 클린 슬레이트 — 안내 노출
  useCodexStore.setState({ scrolls: [] } as never); // 비급 소유도 유저별 — 요청 클린 슬레이트(이전 유저 잔여 차단)
  useGameStore.setState({ diamonds: 0 }); // 다이아도 유저별 — 요청 클린 슬레이트
}
