// 계정 상태(AccountState) — 회차(GameState)와 **별개로 영속되는 유저 단위 상태**. docs/31·32.
// 업적·집계는 회차를 넘어 누적되므로 GameState 가 아니다. 서버에선 **요청마다 해당 유저의 계정 상태를
// 로드·격리**해야 한다(안 그러면 warm 인스턴스에서 유저 간 누수 — docs/37 C10). 그 로드/세이브 계약.
//
// 드리프트 0: 함수 제외 데이터만 자동 수집(파생 타입). 배럴 아닌 직접 import(RN/배럴 회피).

import { useAchievementStore } from '@/stores/achievementStore';
import { useTallyStore } from '@/stores/tallyStore';

const ACCOUNT_STORES = {
  achievement: useAchievementStore,
  tally: useTallyStore,
} as const;

type AccountStores = typeof ACCOUNT_STORES;

type DataOnly<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K];
};

export type AccountState = {
  [K in keyof AccountStores]: DataOnly<ReturnType<AccountStores[K]['getState']>>;
};

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
  return acc as AccountState;
}

// AccountState 를 스토어에 반영(유저 로드).
export function commitAccountState(state: AccountState): void {
  for (const key of Object.keys(ACCOUNT_STORES) as (keyof AccountStores)[]) {
    const store = ACCOUNT_STORES[key] as unknown as { setState: (partial: unknown) => void };
    store.setState(state[key]);
  }
}

// 계정 스토어를 빈 상태로 — 서버 요청 클린 슬레이트(이전 유저 잔여 차단). 유저 로드 전 호출.
export function resetAccountState(): void {
  useAchievementStore.setState({ unlocked: [], unlockedArts: [] } as never);
  useTallyStore.setState({ counts: {}, streaks: {}, maxStreaks: {} } as never);
}
