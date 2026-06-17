// 강호 출행 행선 — docs/38 §1①. 그레이박스 수치(밸런싱 전 임시).
// 위험도(danger) = 사건 기대 빈도·전투 격. 정세(worldThreat)와 곱해 난세엔 더 험해진다.
// 의뢰와 달리 정해진 목표·보수가 없다 — 견문·실전 경험·인연을 얻으러 나갔다 돌아온다.

import type { ExpeditionDest } from '@/types/activity';

export const EXPEDITION_DESTS: readonly ExpeditionDest[] = [
  {
    id: 'x-village-circuit',
    name: '인근 향리 순방',
    preview: '가까운 마을과 저자를 도는 짧은 여정. 큰일은 드물되, 세상 물정을 익힌다.',
    days: 4,
    danger: 0.2,
    recommendedParty: 1,
    needsCombatParty: false,
    woundType: 'wound',
  },
  {
    id: 'x-frontier',
    name: '변경 강호행',
    preview: '인심 사나운 변경을 돈다. 산적과 시비가 잦으니 홀로는 위태롭다.',
    days: 7,
    danger: 0.45,
    recommendedParty: 2,
    needsCombatParty: true,
    woundType: 'wound',
  },
  {
    id: 'x-far-journey',
    name: '머나먼 원행(遠行)',
    preview: '강호 깊숙이 드는 장도(長途). 큰 인연도, 큰 위기도 여기서 만난다.',
    days: 12,
    danger: 0.7,
    recommendedParty: 3,
    needsCombatParty: true,
    woundType: 'wound',
  },
] as const;

export function findExpeditionDest(id: string): ExpeditionDest | undefined {
  return EXPEDITION_DESTS.find((d) => d.id === id);
}
