// 네임드 NPC 도감 데이터 — docs/24_네임드_NPC_권좌.md.
// 양육 불가한 세계관 고수들. 강호 화면 "도감"에서 세력별로 열람.
// 그레이박스: 이름·경지·소속·일대기는 임시값(천마만 docs/24 확정). 추후 common_npcs DB 시드로 이전.
//
// 정보 공개도 = 캐릭터: 정파·공개 인물은 나이·내력 명확, 마교·천마는 베일(나이 ??, 풍문 조각).

export type NpcFaction = 'right' | 'sapa' | 'magyo' | 'middle';

export const NPC_FACTIONS: readonly NpcFaction[] = ['right', 'sapa', 'magyo', 'middle'];

export const NPC_FACTION_LABEL: Record<NpcFaction, string> = {
  right: '정파',
  sapa: '사파',
  magyo: '마교',
  middle: '중도',
};

export interface NamedNpc {
  id: string;
  name: string; // 별호 또는 이름
  hanjaName?: string;
  faction: NpcFaction;
  affiliation: string; // 소속 (마교·무림맹·소림·남궁세가 등)
  title: string; // 직급 (천마·무림맹주·방장·가주·장로…)
  rank: number; // 직급 순 정렬 — 작을수록 상위 (0=수장)
  realm: string; // 경지 라벨
  baseAge: number; // 1년차 기준 나이 (현재 나이 = baseAge + 경과 연차)
  ageKnown: boolean; // false = 베일('??'). 마교·사파 핵심 등
  bio: string; // 한 줄 요약 (이름 아래)
  lore: string; // 일대기 — 세계관 설명 (상세 화면)
}

// 현재 나이 표기 — 게임 연차에 따라 증가. 베일 인물은 '??'.
export function npcAgeLabel(npc: NamedNpc, currentYear: number): string {
  if (!npc.ageKnown) return '??';
  return `${npc.baseAge + Math.max(0, currentYear - 1)}세`;
}

// ─── 회차별 살아있는 상태 ────────────────────────────────────────────────────
// 카탈로그(NamedNpc)는 세계 시작 템플릿. 회차마다 RunNpc 로 복제되어 이벤트로 변한다.

export type NpcStatus = 'active' | 'dead' | 'fallen'; // 생존 | 사망 | 문파 멸망

export interface RunNpc extends NamedNpc {
  status: NpcStatus;
  note?: string; // '전대 방장 — 전사' 등 변동 기록
}

// 회차 시작 시드 — 카논 카탈로그 → 전원 active 복제.
export function seedRunNpcs(): RunNpc[] {
  return NAMED_NPCS.map((n) => ({ ...n, status: 'active' }));
}

export const NAMED_NPCS: readonly NamedNpc[] = [
  // ── 마교 ──
  {
    id: 'cheonma',
    name: '혈천노조',
    hanjaName: '血天老祖',
    faction: 'magyo',
    affiliation: '마교',
    title: '천마',
    rank: 0,
    realm: '현경',
    baseAge: 0, // 베일 — 표시 안 됨
    ageKnown: false, // 나이도 본명도 전설에 묻힘
    bio: '한 시대의 신화. 양육으론 닿을 수 없는 벽.',
    lore:
      '언제부터 그 자리에 있었는지 아무도 모른다. 본명은 전설 속에 묻혔고, 사람들은 그저 천마라 부른다. ' +
      '그를 본 자는 살아 돌아오지 못했다는 풍문만 떠돈다. 마교의 정점이자 강호 모두가 두려워하는 그림자. ' +
      '소문에 따르면 이미 사람의 경지를 넘어선 지 오래라 한다 — 그가 진짜 무엇인지는, 누구도 알지 못한다.',
  },
  {
    id: 'magyo-hobeop',
    name: '적염호법',
    hanjaName: '赤焰護法',
    faction: 'magyo',
    affiliation: '마교',
    title: '호법',
    rank: 2,
    realm: '화경',
    baseAge: 52,
    ageKnown: false, // 마교 — 베일
    bio: '교주를 지키는 마교의 칼.',
    lore: '천마의 곁을 지키는 호법. 불꽃 같은 마공을 쓴다 전한다. (그레이박스 — 추후 구체화)',
  },

  // ── 정파 ──
  {
    id: 'mumaengju',
    name: '검성',
    hanjaName: '劍聖',
    faction: 'right',
    affiliation: '무림맹',
    title: '무림맹주',
    rank: 0,
    realm: '화경',
    baseAge: 63,
    ageKnown: true,
    bio: '정파의 봉우리. 완벽히 길러낸 화경 제자가 어깨를 나란히 할 목표.',
    lore:
      '본명 하후강(夏侯剛). 강호는 그를 검성(劍聖)이라 부른다. 평생 검 하나로 정파를 떠받친 노고수다. ' +
      '젊은 시절 마교의 발호 앞에 홀로 산문을 지켜 무림맹주에 추대되었고, 이후 수십 년 강호의 질서를 세웠다. ' +
      '강호엔 그가 천마와 맞서 살아 돌아온 유일한 사람이라는 풍문이 있다. ' +
      '천마가 닿을 수 없는 벽이라면, 검성은 우러러보되 *따라잡을 수 있는 봉우리* — 화경에 이른 제자라면 그와 검을 겨눌 수 있다.',
  },
  {
    id: 'sorim-bangjang',
    name: '공성대사',
    hanjaName: '空性大師',
    faction: 'right',
    affiliation: '소림',
    title: '방장',
    rank: 1,
    realm: '화경',
    baseAge: 71,
    ageKnown: true,
    bio: '구파의 종주. 불문 무학의 정점.',
    lore: '소림의 방장. 한 갑자를 불문에 정진한 선승이자 무인. (그레이박스)',
  },
  {
    id: 'namgung-gaju',
    name: '남궁천',
    hanjaName: '南宮天',
    faction: 'right',
    affiliation: '남궁세가',
    title: '가주',
    rank: 1,
    realm: '초절정',
    baseAge: 55,
    ageKnown: true,
    bio: '오대세가 검가(劍家)의 가주.',
    lore: '남궁세가를 이끄는 가주. 가문의 검학에 자부심이 깊다. 자제를 거두면 가주위 승계로 이어질 수 있다. (그레이박스)',
  },

  // ── 사파 ──
  {
    id: 'sapa-geodu',
    name: '혈수나찰',
    hanjaName: '血手羅刹',
    faction: 'sapa',
    affiliation: '녹림',
    title: '채주',
    rank: 0,
    realm: '초절정',
    baseAge: 0,
    ageKnown: false, // 사파 — 베일
    bio: '강남 사파를 호령하는 거두.',
    lore: '녹림의 거두. 손에 피를 묻히는 데 거리낌이 없다 전한다. 출신과 나이는 분명치 않다. (그레이박스)',
  },
  {
    id: 'haomun-ju',
    name: '천면랑',
    hanjaName: '千面郞',
    faction: 'sapa',
    affiliation: '하오문',
    title: '문주',
    rank: 1,
    realm: '절정',
    baseAge: 0,
    ageKnown: false, // 사파 — 베일
    bio: '강호의 정보를 쥔 자.',
    lore: '천 개의 얼굴을 가졌다는 하오문주. 진짜 얼굴을 본 자가 없다. (그레이박스)',
  },

  // ── 중도 ──
  {
    id: 'gaebang-bangju',
    name: '취개',
    hanjaName: '醉丐',
    faction: 'middle',
    affiliation: '개방',
    title: '방주',
    rank: 0,
    realm: '화경',
    baseAge: 68,
    ageKnown: true,
    bio: '천하 거지들의 수장. 정·사 어디에도 치우치지 않는다.',
    lore: '술과 함께 천하를 떠도는 개방의 방주. 거지들의 정보망은 무림맹조차 무시 못 한다. (그레이박스)',
  },
  {
    id: 'pyoguk-ju',
    name: '철마표두',
    hanjaName: '鐵馬鏢頭',
    faction: 'middle',
    affiliation: '용천표국',
    title: '표국주',
    rank: 2,
    realm: '절정',
    baseAge: 49,
    ageKnown: true,
    bio: '천하 물류를 지키는 표국의 주인.',
    lore: '용천표국을 이끄는 표두. 신용 하나로 강호의 짐을 옮긴다. (그레이박스)',
  },
];

// 세력별 NPC — 직급 순(rank↑) → 이름.
export function npcsByFaction(faction: NpcFaction): NamedNpc[] {
  return NAMED_NPCS.filter((n) => n.faction === faction).sort(
    (a, b) => a.rank - b.rank || a.name.localeCompare(b.name),
  );
}

export function findNpc(id: string): NamedNpc | undefined {
  return NAMED_NPCS.find((n) => n.id === id);
}
