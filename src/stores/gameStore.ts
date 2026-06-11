import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

import type { GameMeta } from '@/types';
import { SCHEMA_VERSION } from '@/data/constants';

type GamePhase = 'menu' | 'intro' | 'playing' | 'graduation' | 'ended';

interface GameStore {
  meta: GameMeta;
  phase: GamePhase;
  loaded: boolean;
  // 다이아 — 계정 단위 프리미엄 재화(슬롯·회차 무관). 수급 = 업적(예정)·구매(예정),
  // 소비처 = 편의(연구 즉시 완료 등 시간 단축) + 외형. 파워 직접 구매 없음. docs/11·32.
  diamonds: number;

  setPhase: (phase: GamePhase) => void;
  setLoaded: (loaded: boolean) => void;
  bumpDaysPlayed: () => void;
  setSaveSlot: (slot: number) => void;
  addDiamonds: (n: number) => void;
  // 차감 시도 — 잔액 부족이면 false(차감 없음).
  spendDiamonds: (n: number) => boolean;
  reset: () => void;
}

const INITIAL_META: GameMeta = {
  startedAt: 0,
  totalDaysPlayed: 0,
  saveSlot: 1,
  schemaVersion: SCHEMA_VERSION,
};

// gameStore는 슬롯 선택 자체를 관리하므로 slot-aware storage 를 쓰지 않고
// AsyncStorage 를 직접 사용한다. 키: sadojeon:meta:game
const gameMetaStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(`sadojeon:meta:${name}`),
  setItem: (name, value) => AsyncStorage.setItem(`sadojeon:meta:${name}`, value),
  removeItem: (name) => AsyncStorage.removeItem(`sadojeon:meta:${name}`),
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      meta: INITIAL_META,
      phase: 'menu',
      loaded: false,
      diamonds: 60, // 🔧 그레이박스 시작 지급 — 업적 보상 인프라(docs/32) 도입 시 0 + 업적 수급으로 교체.

      setPhase: (phase) => set({ phase }),
      setLoaded: (loaded) => set({ loaded }),
      bumpDaysPlayed: () =>
        set((s) => ({
          meta: { ...s.meta, totalDaysPlayed: s.meta.totalDaysPlayed + 1 },
        })),
      setSaveSlot: (slot) =>
        set((s) => ({ meta: { ...s.meta, saveSlot: slot } })),
      addDiamonds: (n) => set((s) => ({ diamonds: Math.max(0, s.diamonds + n) })),
      spendDiamonds: (n) => {
        if (n <= 0) return true;
        if (get().diamonds < n) return false;
        set((s) => ({ diamonds: s.diamonds - n }));
        return true;
      },
      // 다이아는 계정 단위라 reset(회차·슬롯 초기화)에도 보존.
      reset: () => set({ meta: INITIAL_META, phase: 'menu', loaded: false }),
    }),
    {
      name: 'game',
      storage: createJSONStorage(() => gameMetaStorage),
      // loaded 는 휘발 — hydration 이후 앱 흐름이 결정
      partialize: (s) => ({ meta: s.meta, phase: s.phase, diamonds: s.diamonds }),
    },
  ),
);
