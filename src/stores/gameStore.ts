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

  setPhase: (phase: GamePhase) => void;
  setLoaded: (loaded: boolean) => void;
  bumpDaysPlayed: () => void;
  setSaveSlot: (slot: number) => void;
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
    (set) => ({
      meta: INITIAL_META,
      phase: 'menu',
      loaded: false,

      setPhase: (phase) => set({ phase }),
      setLoaded: (loaded) => set({ loaded }),
      bumpDaysPlayed: () =>
        set((s) => ({
          meta: { ...s.meta, totalDaysPlayed: s.meta.totalDaysPlayed + 1 },
        })),
      setSaveSlot: (slot) =>
        set((s) => ({ meta: { ...s.meta, saveSlot: slot } })),
      reset: () => set({ meta: INITIAL_META, phase: 'menu', loaded: false }),
    }),
    {
      name: 'game',
      storage: createJSONStorage(() => gameMetaStorage),
      // loaded 는 휘발 — hydration 이후 앱 흐름이 결정
      partialize: (s) => ({ meta: s.meta, phase: s.phase }),
    },
  ),
);
