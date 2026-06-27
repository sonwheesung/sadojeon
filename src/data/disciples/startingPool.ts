// 시작 제자 명부 — docs/15_시작_제자_풀.md
// 시작 8명 = 무료 6(장철·진소화·한바람·윤소소·이청하·백연) + 결제 2(진백호·사천화, isPremium).
// 강무열·독고연은 출시 후 무료 추가 — 메타는 여기 유지하되 선택 풀(recruitPool.RECRUIT_POOL)엔 미포함.
// 모두 7~10세, 무공 미입문 상태. 여기서는 id·이름·출신만; 효율·인격·오성은 recruitPool.ts.
//
// 효율·약점·적대는 만남 후 사부 통찰로 차등 노출(숨은 변수 룰).
// 시작 관계 = 적대 STARTING_RIVALRIES + 친밀 STARTING_FRIENDSHIPS (newRun.seedStartingRelations 에서 시드).

export type StartingDiscipleGender = 'male' | 'female';
export type StartingDiscipleGroup = 'village' | 'wanderer' | 'noble' | 'lone';

export interface StartingDisciple {
  id: string;
  name: string;
  hanjaName: string;
  gender: StartingDiscipleGender;
  // 출신 메모 — 만남 화면에서 노출. 그 외 적대·과거 사연 텍스트는 시나리오 풀에서.
  originNote: string;
  // 관계 그룹 — 같은 그룹의 두 명을 같은 회차에 거두면 시작 친밀/긴장 ↑
  group: StartingDiscipleGroup;
  // 결제 전용 여부 (5성 2명만 true). 구매 해금 장치는 별도(미구현).
  isPremium: boolean;
}

export const STARTING_DISCIPLE_POOL: readonly StartingDisciple[] = [
  // 무료 6 (별등급 폐기 — 효율은 recruitPool)
  {
    id: 'jang-cheol',
    name: '장철',
    hanjaName: '張鐵',
    gender: 'male',
    originNote: '농촌. 평범하나 우직.',
    group: 'village',
    isPremium: false,
  },
  {
    id: 'jin-sohwa',
    name: '진소화',
    hanjaName: '陳小花',
    gender: 'female',
    originNote: '마을 약방 집안. 약초 지식.',
    group: 'village',
    isPremium: false,
  },

  {
    id: 'han-baram',
    name: '한바람',
    hanjaName: '韓바람',
    gender: 'male',
    originNote: '부모 없이 떠돌던 아이.',
    group: 'wanderer',
    isPremium: false,
  },
  {
    id: 'yun-soso',
    name: '윤소소',
    hanjaName: '尹素素',
    gender: 'female',
    originNote: '양반가 출신. 예법에 익숙.',
    group: 'noble',
    isPremium: false,
  },

  // 출시 후 추가 (무료) — 선택 풀 미포함, 멸문 적대 시드용 메타만 보존
  {
    id: 'gang-muyeol',
    name: '강무열',
    hanjaName: '姜武烈',
    gender: 'male',
    originNote: '지방 무관 자제. 가문에 알려지지 않은 과거.',
    group: 'noble',
    isPremium: false,
  },
  {
    id: 'i-cheongha',
    name: '이청하',
    hanjaName: '李清荷',
    gender: 'female',
    originNote: '살수 조직에서 빠져나옴. 기억이 흐림.',
    group: 'lone',
    isPremium: false,
  },

  // 출시 후 추가 (무료) — 선택 풀 미포함, 멸문 적대·검 정점 야망 시드용 메타만 보존
  {
    id: 'dokgo-yeon',
    name: '독고연',
    hanjaName: '獨孤衍',
    gender: 'male',
    originNote: '멸문된 독고세가의 유일한 생존자.',
    group: 'noble',
    isPremium: false,
  },
  {
    id: 'baek-yeon',
    name: '백연',
    hanjaName: '白蓮',
    gender: 'female',
    originNote: '도사의 딸. 도가 사상 어릴 적부터 접함.',
    group: 'lone',
    isPremium: false,
  },

  // 결제 전용 2 (IAP 해금, 미구현)
  {
    id: 'jin-baekho',
    name: '진백호',
    hanjaName: '秦白虎',
    gender: 'male',
    originNote: '부모 없이 떠돌던 천재. 어떤 무공도 한 번에 흉내.',
    group: 'wanderer',
    isPremium: true,
  },
  {
    id: 'sa-cheonhwa',
    name: '사천화',
    hanjaName: '謝天華',
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

// 일방적 적대 — docs/15 "일방적 적대 — 2쌍"
// 한쪽은 알고, 한쪽은 모름. 사부도 통찰 ★★★★ 이상에서 풍문 형태로만 식별.
// 관계값은 양방 'enemy'로 시드(applyEffects 의 캐스케이드가 상대→가해 방향 'enemy' 를 본다).
// 라벨로 "원한" 같은 단어 직접 노출 금지(숨은 변수 룰).
export interface OneSidedRivalry {
  aware: string; // 사연을 아는 쪽 disciple id
  unaware: string; // 모르는 쪽 disciple id
  backstoryKey: string; // 시나리오 풀의 사연 키 (UI에 직접 노출 금지)
}

export const STARTING_RIVALRIES: readonly OneSidedRivalry[] = [
  // 휴면 — 강무열·독고연이 출시 후 추가 전까지 선택 풀에 없어 시드되지 않음(seedStartingRelations 가드).
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

// 시작 친밀 페어 — docs/15 "관계 그룹"·"페어 구조". 같은 회차에 둘 다 거두면 시작부터 친밀('friend').
// (현재 관계 모델은 friend 단일 단계라 ★★/★★★ 강도 차는 메모로만 보존.)
export interface StartingFriendship {
  a: string;
  b: string;
  note: string;
}

export const STARTING_FRIENDSHIPS: readonly StartingFriendship[] = [
  { a: 'jang-cheol', b: 'jin-sohwa', note: '같은 마을 — 어렸을 적 친밀(★★)' },
  { a: 'han-baram', b: 'jin-baekho', note: '떠돌이 — 굶주린 시절 빵 한 조각 나눈 인연(★★★, 시작 풀 최강 친밀)' },
] as const;
