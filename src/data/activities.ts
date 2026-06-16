// 활동 데이터 — 약초 채집 지역. docs/38 §1②. 그레이박스 수치(밸런싱 전 임시).
// 재료 등급 = 지역 위험도. 위험 지역 이상은 전투원 + 약 지식 동행 필수(canGather 게이트).
// 채집은 재료 수급의 정본 — 일반 의뢰 부산물 채집은 차단(forages, 2026-06-15).

import type { GatherRegion, GatherTier } from '@/types/activity';

export const GATHER_TIER_LABEL: Record<GatherTier, string> = {
  easy: '쉬움',
  moderate: '보통',
  dangerous: '위험',
  extreme: '극험',
};

export const GATHER_REGIONS: readonly GatherRegion[] = [
  {
    id: 'g-village',
    name: '마을 인근 약초밭',
    tier: 'easy',
    preview: '야트막한 야산. 흔한 약초가 지천이다. 혼자 다녀와도 좋다.',
    days: 3,
    loreMin: 0,
    needsCombatParty: false,
    recommendedParty: 1,
    woundType: 'wound',
    woundChance: 0.08, // 야생동물 경상
    woundSeverityMin: 5,
    spiritBeast: false,
    drops: [{ id: 'herb-common', chance: 1, min: 2, max: 5 }],
  },
  {
    id: 'g-deep-mountain',
    name: '깊은 산',
    tier: 'moderate',
    preview: '인적 드문 산속. 맹수가 출몰하니 홀로는 위태롭다.',
    days: 5,
    loreMin: 10,
    needsCombatParty: true,
    recommendedParty: 2,
    woundType: 'wound',
    woundChance: 0.25,
    woundSeverityMin: 4,
    spiritBeast: false,
    drops: [
      { id: 'herb-common', chance: 1, min: 3, max: 6 },
      { id: 'herb-rare', chance: 0.35, min: 1, max: 1 },
    ],
  },
  {
    id: 'g-poison-valley',
    name: '독곡(毒谷)',
    tier: 'dangerous',
    preview: '독무 자욱한 골짜기. 해독초와 독초가 함께 자란다. 독기에 노출된다.',
    days: 7,
    loreMin: 20,
    needsCombatParty: true,
    recommendedParty: 2,
    woundType: 'poison',
    woundChance: 0.4,
    woundSeverityMin: 3,
    spiritBeast: false,
    drops: [
      { id: 'herb-poison', chance: 0.8, min: 1, max: 3 },
      { id: 'herb-rare', chance: 0.4, min: 1, max: 1 },
    ],
  },
  {
    id: 'g-snow-peak',
    name: '설산(雪山)',
    tier: 'dangerous',
    preview: '혹한의 설산. 한설초가 바위틈에 핀다. 동상을 조심하라.',
    days: 7,
    loreMin: 20,
    needsCombatParty: true,
    recommendedParty: 2,
    woundType: 'frost',
    woundChance: 0.4,
    woundSeverityMin: 3,
    spiritBeast: false,
    drops: [
      { id: 'herb-cold', chance: 0.8, min: 1, max: 3 },
      { id: 'herb-rare', chance: 0.4, min: 1, max: 1 },
    ],
  },
  {
    id: 'g-volcano',
    name: '화산 지대',
    tier: 'dangerous',
    preview: '열기 가득한 화산. 화속 영초가 자란다. 화상을 입기 쉽다.',
    days: 7,
    loreMin: 20,
    needsCombatParty: true,
    recommendedParty: 2,
    woundType: 'burn',
    woundChance: 0.4,
    woundSeverityMin: 3,
    spiritBeast: false,
    drops: [
      { id: 'herb-fire', chance: 0.8, min: 1, max: 3 },
      { id: 'herb-rare', chance: 0.4, min: 1, max: 1 },
    ],
  },
  {
    id: 'g-spirit-mountain',
    name: '영산(靈山) 절지',
    tier: 'extreme',
    preview: '영기 서린 금단의 땅. 영물(靈物)이 신품초를 지킨다. 강한 파티라야 살아 돌아온다.',
    days: 10,
    loreMin: 35,
    needsCombatParty: true,
    recommendedParty: 3,
    woundType: 'wound',
    woundChance: 0.6,
    woundSeverityMin: 1, // 영물전 — 치명상 가능(생존 체인은 추후 의뢰와 통합)
    spiritBeast: true,
    drops: [
      { id: 'herb-rare', chance: 0.7, min: 1, max: 2 },
      // 신품초 = 영물 처치 시 별도 보장(activitySystem). 무과금 화경의 대체 재료 경로.
      { id: 'herb-divine', chance: 0.5, min: 1, max: 1 },
    ],
  },
] as const;

export function findGatherRegion(id: string): GatherRegion | undefined {
  return GATHER_REGIONS.find((r) => r.id === id);
}
