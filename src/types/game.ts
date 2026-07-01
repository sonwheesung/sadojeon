export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Phase = 'morning' | 'afternoon' | 'evening';

export interface GameTime {
  year: number;
  season: Season;
  week: number;
  day: number;
  phase: Phase;
}

export interface SectState {
  name: string;
  hanjaName: string;
  reputation: number;
  resources: number;
  facilities: SectFacility[];
  bankruptStreak?: number; // 곳간 0 연속 개월(장기파산 판정용, economySystem). 미정의=0. docs/09.
}

export interface SectFacility {
  id: string;
  name: string;
  level: number;
  inUse: boolean;
}

export interface GameMeta {
  startedAt: number;
  totalDaysPlayed: number;
  saveSlot: number;
  schemaVersion: number;
}
