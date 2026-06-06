// 시작 선택 풀 — docs/15.
// 회차 시작 시 사용자가 이 풀에서 2~4명을 골라 거둔다. 회차 도중 영입 X.
// 풀에 8명 (1~4성 × 남녀). 5성은 DLC 별도.
// 거두지 않은 후보는 강호로 흩어져 [docs/08 졸업후_강호] NPC 로 재등장 가능.
//
// 파일 이름은 과거 영입 시스템 잔존. 다음 정리 시 startingSeedPool 로 개칭 예정.

import type { EfficiencyMap, PersonalityTraits, Talents } from '@/types';

export interface RecruitCandidate {
  poolId: string;
  artId: string;
  talents: Talents;
  // 영역 학습 효율 — docs/28 §7. 무공 갈래(MartialArtSchool)별 특화~상극. 안 적은 갈래 = 보통.
  // (비무공 영역 효율은 능력치 확장 슬라이스에서 추가.)
  efficiency: EfficiencyMap;
  personality: PersonalityTraits;
  // 시작 선택 화면 인물 카드의 한 줄 — 첫인상 풍경.
  storyLine: string;
}

export const RECRUIT_POOL: readonly RecruitCandidate[] = [
  {
    poolId: 'jang-cheol',
    artId: 'baekun-fist',
    talents: { body: 4, qi: 3, agility: 2, insight: 2, mind: 3 },
    efficiency: { fist: '상성', staff: '상성', medical: '상극', darkArts: '상극' },
    personality: { diligence: 70, pride: 30, loyalty: 70, curiosity: 30, empathy: 50 },
    storyLine: '농촌에서 자란 우직한 아이. 평범하나 손이 묵직하다.',
  },
  {
    poolId: 'jin-sohwa',
    artId: 'cheongsim-gigong',
    talents: { body: 2, qi: 3, agility: 3, insight: 3, mind: 4 },
    efficiency: { medical: '특화', fist: '미숙', sword: '상극', staff: '상극', darkArts: '상극' },
    personality: { diligence: 50, pride: 30, loyalty: 70, curiosity: 50, empathy: 90 },
    storyLine: '마을 약방 집안의 다정한 아이. 약초를 능숙히 다룬다.',
  },
  {
    poolId: 'han-baram',
    artId: 'cheongpung-swordplay',
    talents: { body: 3, qi: 2, agility: 4, insight: 3, mind: 2 },
    efficiency: { lightness: '특화', darkArts: '특화', sword: '상성', staff: '상성', medical: '상극' },
    personality: { diligence: 50, pride: 50, loyalty: 30, curiosity: 70, empathy: 50 },
    storyLine: '산문 앞에 떠돌이 아이가 주저앉아 있었다. 갈 곳을 잊은 눈빛이었다.',
  },
  {
    poolId: 'yun-soso',
    artId: 'unbo',
    talents: { body: 2, qi: 3, agility: 3, insight: 4, mind: 4 },
    efficiency: { sword: '특화', lightness: '상성', qigong: '상성', darkArts: '상극', medical: '미숙' },
    personality: { diligence: 70, pride: 70, loyalty: 70, curiosity: 30, empathy: 50 },
    storyLine:
      '한 양반가 노인이 손녀를 데려와 머리를 숙였다. "예법은 가르쳤으나, 칼은 가르치지 못했습니다."',
  },
  {
    poolId: 'gang-muyeol',
    artId: 'baekun-fist',
    talents: { body: 4, qi: 3, agility: 3, insight: 2, mind: 3 },
    efficiency: { staff: '특화', fist: '상성' },
    personality: { diligence: 70, pride: 70, loyalty: 50, curiosity: 30, empathy: 30 },
    storyLine:
      '지방 무관에서 한 청년을 보냈다. 이력서에 적히지 않은 사연이 묻어 있었다.',
  },
  {
    poolId: 'i-cheongha',
    artId: 'unbo',
    talents: { body: 3, qi: 2, agility: 5, insight: 4, mind: 3 },
    efficiency: { sword: '특화', lightness: '특화', darkArts: '특화', staff: '상성', qigong: '상성', medical: '상극' },
    personality: { diligence: 70, pride: 30, loyalty: 30, curiosity: 50, empathy: 30 },
    storyLine:
      '산기슭에서 한 소녀가 쓰러져 있었다. 깨어났을 때, 자신의 이름조차 흐릿하다 했다.',
  },
  {
    poolId: 'dokgo-yeon',
    artId: 'cheongpung-swordplay',
    talents: { body: 3, qi: 4, agility: 4, insight: 3, mind: 4 },
    efficiency: { sword: '특화', qigong: '상성' },
    personality: { diligence: 90, pride: 90, loyalty: 50, curiosity: 50, empathy: 30 },
    storyLine:
      '한 청년이 산문 앞에 서서 한참을 머뭇거렸다. 뒤를 자주 돌아보았다.',
  },
  {
    poolId: 'baek-yeon',
    artId: 'cheongsim-gigong',
    talents: { body: 2, qi: 4, agility: 3, insight: 5, mind: 4 },
    efficiency: { qigong: '특화', medical: '상성', staff: '미숙', fist: '미숙', darkArts: '상극' },
    personality: { diligence: 50, pride: 30, loyalty: 50, curiosity: 70, empathy: 90 },
    storyLine:
      '한 도인이 어린 딸을 산문 앞에 두고 떠났다. "저는 도를 가르쳤으나, 인간을 가르치지 못했습니다."',
  },
] as const;

export function findRecruit(poolId: string): RecruitCandidate | undefined {
  return RECRUIT_POOL.find((c) => c.poolId === poolId);
}
