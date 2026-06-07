// 시작 제자 풀 10명 — docs/15_시작_제자_풀.md
// 시작 풀 8명 (남/여 × 1~4성 각 1명) + 현질 풀 2명 (남/여 5성 DLC)
// 모두 7~10세, 무공 미입문 상태
//
// 실제 재능 5축·매칭은 만남 시점에 결정되고 사부 통찰 단계별로 차등 노출.
// 일방적 적대 2쌍·관계 그룹 4개는 docs/15 본문 참조.

export type StartingDiscipleStarRank = 1 | 2 | 3 | 4 | 5;
export type StartingDiscipleGender = 'male' | 'female';
export type StartingDiscipleGroup = 'village' | 'wanderer' | 'noble' | 'lone';

export interface StartingDisciple {
  id: string;
  name: string;
  hanjaName: string;
  starRank: StartingDiscipleStarRank;
  gender: StartingDiscipleGender;
  // 출신 메모 — 만남 화면에서 노출. 그 외 적대·과거 사연 텍스트는 시나리오 풀에서.
  originNote: string;
  // 관계 그룹 — 같은 그룹의 두 명을 같은 회차에 거두면 시작 친밀/긴장 ↑
  group: StartingDiscipleGroup;
  // DLC 여부 (5성 2명만 true)
  isPremium: boolean;
}

export const STARTING_DISCIPLE_POOL: readonly StartingDisciple[] = [
  // ★ 1성
  {
    id: 'jang-cheol',
    name: '장철',
    hanjaName: '張鐵',
    starRank: 1,
    gender: 'male',
    originNote: '농촌. 평범하나 우직.',
    group: 'village',
    isPremium: false,
  },
  {
    id: 'jin-sohwa',
    name: '진소화',
    hanjaName: '陳小花',
    starRank: 1,
    gender: 'female',
    originNote: '마을 약방 집안. 약초 지식.',
    group: 'village',
    isPremium: false,
  },

  // ★★ 2성
  {
    id: 'han-baram',
    name: '한바람',
    hanjaName: '韓바람',
    starRank: 2,
    gender: 'male',
    originNote: '부모 없이 떠돌던 아이.',
    group: 'wanderer',
    isPremium: false,
  },
  {
    id: 'yun-soso',
    name: '윤소소',
    hanjaName: '尹素素',
    starRank: 2,
    gender: 'female',
    originNote: '양반가 출신. 예법에 익숙.',
    group: 'noble',
    isPremium: false,
  },

  // ★★★ 3성
  {
    id: 'gang-muyeol',
    name: '강무열',
    hanjaName: '姜武烈',
    starRank: 3,
    gender: 'male',
    originNote: '지방 무관 자제. 가문에 알려지지 않은 과거.',
    group: 'noble',
    isPremium: false,
  },
  {
    id: 'i-cheongha',
    name: '이청하',
    hanjaName: '李淸霞',
    starRank: 3,
    gender: 'female',
    originNote: '살수 조직에서 빠져나옴. 기억이 흐림.',
    group: 'lone',
    isPremium: false,
  },

  // ★★★★ 4성
  {
    id: 'dokgo-yeon',
    name: '독고연',
    hanjaName: '獨孤燕',
    starRank: 4,
    gender: 'male',
    originNote: '멸문된 독고세가의 유일한 생존자.',
    group: 'noble',
    isPremium: false,
  },
  {
    id: 'baek-yeon',
    name: '백연',
    hanjaName: '白蓮',
    starRank: 4,
    gender: 'female',
    originNote: '도사의 딸. 도가 사상 어릴 적부터 접함.',
    group: 'lone',
    isPremium: false,
  },

  // ★★★★★ 5성 (DLC)
  {
    id: 'jin-baekho',
    name: '진백호',
    hanjaName: '陳白虎',
    starRank: 5,
    gender: 'male',
    originNote: '부모 없이 떠돌던 천재. 어떤 무공도 한 번에 흉내.',
    group: 'wanderer',
    isPremium: true,
  },
  {
    id: 'sa-cheonhwa',
    name: '사천화',
    hanjaName: '謝天華',
    starRank: 5,
    gender: 'female',
    originNote: '사천 약·독 의가의 딸. 가전 독·해독.',
    group: 'lone',
    isPremium: true,
  },
] as const;

// 관계 그룹 라벨
export const STARTING_GROUP_LABEL: Record<StartingDiscipleGroup, string> = {
  village: '같은 마을',
  wanderer: '떠돌이',
  noble: '양반·무관·명문',
  lone: '외톨이',
};

// 일방적 적대 — docs/15_시작_제자_풀.md "일방적 적대 — 2쌍"
// 한쪽은 알고, 한쪽은 모름. 사부도 통찰 ★★★★ 이상에서 풍문 형태로만 식별.
// docs/메모리 룰: 라벨로 "원한" 같은 단어 직접 노출 금지.
export interface OneSidedRivalry {
  aware: string; // 사연을 아는 쪽 disciple id
  unaware: string; // 모르는 쪽 disciple id
  backstoryKey: string; // 시나리오 풀의 사연 키 (UI에 직접 노출 금지)
}

export const STARTING_RIVALRIES: readonly OneSidedRivalry[] = [
  {
    aware: 'dokgo-yeon',
    unaware: 'gang-muyeol',
    backstoryKey: 'dokgo-clan-fall',
  },
  {
    aware: 'yun-soso',
    unaware: 'i-cheongha',
    backstoryKey: 'noble-house-incident',
  },
] as const;
