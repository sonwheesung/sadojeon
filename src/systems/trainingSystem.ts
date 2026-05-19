import type { Disciple, ActivityType } from '@/types';

export interface TrainingResult {
  progressDelta: number;
  fatigueDelta: number;
  notes: string[];
}

export function resolveTraining(_disciple: Disciple, _activity: ActivityType): TrainingResult {
  return { progressDelta: 0, fatigueDelta: 0, notes: [] };
}
