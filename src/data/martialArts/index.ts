import type { MartialArt } from '@/types';

// 시작 사문이 보유한 디폴트 무공 카탈로그. docs/04_무공_도감.md 갈래 8종 중 일부.
// 그레이박스용 — 실제 풀(150~250)은 추후 데이터 작업.
export const MARTIAL_ARTS: MartialArt[] = [
  {
    id: 'cheongpung-swordplay',
    name: '청풍검법',
    hanjaName: '靑風劍法',
    description: '바람을 베듯 가볍고 정직한 검술. 초심자가 검의 결을 익히기 좋다.',
    school: 'sword',
    grade: 'apprentice',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'agility'],
    stages: 5,
    isSectArt: true,
  },
  {
    id: 'baekun-fist',
    name: '백운권법',
    hanjaName: '白雲拳法',
    description: '구름이 흩어지듯 흐르는 권법. 강하지 않으나 결이 끊기지 않는다.',
    school: 'fist',
    grade: 'apprentice',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'qi'],
    stages: 5,
    isSectArt: true,
  },
  {
    id: 'unbo',
    name: '운보',
    hanjaName: '雲步',
    description: '발끝이 땅을 거의 닿지 않는 기초 보법. 모든 무공의 받침.',
    school: 'lightness',
    grade: 'novice',
    requirements: [{ axis: 'agility', minimum: 2 }],
    preferredTalents: ['agility', 'mind'],
    stages: 5,
    isSectArt: true,
  },
  {
    id: 'cheongsim-gigong',
    name: '청심기공',
    hanjaName: '淸心氣功',
    description: '마음을 맑게 다스리는 기초 내공. 잡념을 거두고 호흡을 고른다.',
    school: 'qigong',
    grade: 'novice',
    requirements: [{ axis: 'mind', minimum: 2 }],
    preferredTalents: ['mind', 'insight'],
    stages: 5,
    isSectArt: true,
  },
];

export function findMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find((m) => m.id === id);
}
