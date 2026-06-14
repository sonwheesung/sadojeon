import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { WORLD_BLOCS } from '@/data/worldPowers';
import { seedWorldState } from '@/systems/worldSystem';
import type { WorldEvent, WorldPower, WorldState } from '@/types/world';
import { slotAwareStorage } from './persistStorage';

// 강호 정세 — 회차(사문) 스코프. 살아있는 정세 엔진(worldSystem) 상태를 든다.
// world = 엔진 전체 상태(세력치·긴장·계절·사건). factions/events = 화면 표시용 파생 배열.
// 매 계절 worldDriver.tickWorld 가 world 를 갱신 → setWorld 로 파생 재계산. docs/08.

// 화면(world.tsx)이 쓰던 타입명 보존 — 이제 살아있는 모델.
export type JianghuFaction = WorldPower;
export type JianghuEvent = WorldEvent;

// world.powers → 표시 순서대로 배열.
function deriveFactions(w: WorldState): WorldPower[] {
  return WORLD_BLOCS.map((b) => w.powers[b]).filter(Boolean);
}
// 진행 중(결말 처리 안 된) 사건만, 최근 시작 순.
function deriveEvents(w: WorldState): WorldEvent[] {
  return w.events.filter((e) => !e.done).sort((a, b) => b.startedSeason - a.startedSeason);
}

interface JianghuStore {
  world: WorldState | null;
  factions: WorldPower[]; // 파생(표시용)
  events: WorldEvent[]; //   파생(표시용)
  setWorld: (w: WorldState) => void; // 엔진 tick 후 갱신
  hydrateWorld: (w: WorldState) => void; // 영속 로드
  seedDefaults: () => void; // 회차 시작 정세 시드
  reset: () => void;
}

export const useJianghuStore = create<JianghuStore>()(
  persist(
    (set) => ({
      world: null,
      factions: [],
      events: [],
      setWorld: (w) => set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) }),
      hydrateWorld: (w) => set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) }),
      seedDefaults: () => {
        const w = seedWorldState();
        set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) });
      },
      reset: () => {
        const w = seedWorldState();
        set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) });
      },
    }),
    {
      name: 'jianghu',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
