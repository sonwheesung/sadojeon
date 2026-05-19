import type { Disciple } from '@/types';

export type GraduationGrade = 'failure' | 'common' | 'excellent' | 'legendary';

export function evaluateGraduation(_disciple: Disciple): GraduationGrade {
  return 'common';
}
