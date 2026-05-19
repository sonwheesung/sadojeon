import { useTimeStore } from '@/stores/timeStore';

export function advanceTurn() {
  useTimeStore.getState().advance();
}
