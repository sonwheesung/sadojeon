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
