import type { OneLinerItem } from '@/types';

export type OneLinerTemplate = Omit<
  OneLinerItem,
  'id' | 'createdAtDay' | 'read' | 'resolved' | 'kind' | 'priority'
> & {
  weight?: number;
  tags?: string[];
};

export const ONE_LINERS: OneLinerTemplate[] = [];
