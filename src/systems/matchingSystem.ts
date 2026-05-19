import type { Disciple, MartialArt } from '@/types';

export type Affinity = 'destined' | 'compatible' | 'neutral' | 'unfit' | 'opposed';

export function evaluateAffinity(_disciple: Disciple, _art: MartialArt): Affinity {
  return 'neutral';
}
