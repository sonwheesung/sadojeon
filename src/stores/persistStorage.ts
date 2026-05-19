import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

import { useGameStore } from './gameStore';

// AsyncStorage 키 구조:
//   sadojeon:meta:<store>         — 슬롯과 무관한 메타(gameStore 자체 포함)
//   sadojeon:slot{N}:<store>      — 슬롯별 회차 상태
// 슬롯 전환은 useGameStore.setSaveSlot 호출 후 각 slot-aware store의
// persist.rehydrate() 를 수동 호출하는 형태로 후속 단계에서 처리.

const APP_PREFIX = 'sadojeon';

function metaKey(name: string): string {
  return `${APP_PREFIX}:meta:${name}`;
}

function slotKey(name: string): string {
  const slot = useGameStore.getState().meta.saveSlot;
  return `${APP_PREFIX}:slot${slot}:${name}`;
}

export const metaStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(metaKey(name)),
  setItem: (name, value) => AsyncStorage.setItem(metaKey(name), value),
  removeItem: (name) => AsyncStorage.removeItem(metaKey(name)),
};

export const slotAwareStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(slotKey(name)),
  setItem: (name, value) => AsyncStorage.setItem(slotKey(name), value),
  removeItem: (name) => AsyncStorage.removeItem(slotKey(name)),
};
