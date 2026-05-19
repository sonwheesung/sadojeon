import type { MartialArtInstance, TalentAxis } from './martialArt';

export type DiscipleStatus =
  | 'training'
  | 'resting'
  | 'injured'
  | 'meditating'
  | 'questing'
  | 'graduated'
  | 'departed';

export type ActivityType =
  | 'martial_training'
  | 'basic_training'
  | 'meditation'
  | 'group_training'
  | 'application'
  | 'seclusion'
  | 'quest'
  | 'rest';

export type RelationLevel = 'enemy' | 'distant' | 'neutral' | 'friend' | 'sworn';

export type DarknessLevel = 0 | 1 | 2 | 3 | 4;

export interface Talents {
  body: number;
  qi: number;
  agility: number;
  insight: number;
  mind: number;
}

export interface PersonalityTraits {
  diligence: number;
  pride: number;
  loyalty: number;
  curiosity: number;
  empathy: number;
}

export interface DailyActivity {
  morning: ActivityType;
  afternoon: ActivityType;
}

export interface Disciple {
  id: string;
  name: string;
  hanjaName: string;
  entryYear: number;
  age: number;

  talents: Talents;
  hiddenTalents: Partial<Record<TalentAxis, number>>;

  martialArts: MartialArtInstance[];
  mainMartialArtId?: string;

  trustToMaster: number;
  relationships: Record<string, RelationLevel>;

  status: DiscipleStatus;
  currentActivity?: DailyActivity;
  injuryDaysRemaining?: number;

  darknessLevel: DarknessLevel;
  darknessRisk: 'low' | 'medium' | 'high';

  personality: PersonalityTraits;

  notes: string[];
}
