// 문파 레지스트리 + 사문 평판 단계 — docs/30_문파_평판.md.
// 사문/제자가 각 문파와 맺는 관계(-100~+100)의 대상 목록. 한 줄 추가로 문파 확장(SOLID plug-in).
// 노출 룰: 숫자 숨김, 단계 라벨(적대~맹우)만 노출 — repTier(). docs 숨은변수 룰.

export type FactionGroup = 'gupa' | 'segga' | 'maeng' | 'sapa' | 'magyo' | 'middle';

export const FACTION_GROUP_LABEL: Record<FactionGroup, string> = {
  gupa: '구파일방',
  segga: '오대세가',
  maeng: '무림맹',
  sapa: '사파',
  magyo: '마교',
  middle: '중도',
};

// 표시·집계 순서.
export const FACTION_GROUP_ORDER: readonly FactionGroup[] = [
  'gupa',
  'segga',
  'maeng',
  'sapa',
  'magyo',
  'middle',
];

// 성향 — 의뢰 사상색(정/사) 연동에 쓰임. 정파 의뢰 완수 → right↑·sapa↓ 식.
export type FactionAlignment = 'right' | 'sapa' | 'magyo' | 'middle';

export interface Faction {
  id: string;
  name: string;
  hanjaName?: string;
  group: FactionGroup;
  alignment: FactionAlignment;
  blurb: string; // 한 줄 소개
}

export const FACTIONS: readonly Faction[] = [
  // ── 구파일방 (소림·무당·화산·종남·곤륜·아미·점창·청성·공동 + 개방) ──
  { id: 'sorim', name: '소림', hanjaName: '少林', group: 'gupa', alignment: 'right', blurb: '불문 무학의 종주.' },
  { id: 'mudang', name: '무당', hanjaName: '武當', group: 'gupa', alignment: 'right', blurb: '도가 검학의 태산북두.' },
  { id: 'hwasan', name: '화산', hanjaName: '華山', group: 'gupa', alignment: 'right', blurb: '매화검의 명문.' },
  { id: 'jongnam', name: '종남', hanjaName: '終南', group: 'gupa', alignment: 'right', blurb: '관중의 검파.' },
  { id: 'gonryun', name: '곤륜', hanjaName: '崑崙', group: 'gupa', alignment: 'right', blurb: '서역의 쾌검.' },
  { id: 'amisan', name: '아미', hanjaName: '峨嵋', group: 'gupa', alignment: 'right', blurb: '비구니 검문.' },
  { id: 'jeomchang', name: '점창', hanjaName: '點蒼', group: 'gupa', alignment: 'right', blurb: '운남의 쾌검.' },
  { id: 'cheongseong', name: '청성', hanjaName: '靑城', group: 'gupa', alignment: 'right', blurb: '촉의 검파.' },
  { id: 'gongdong', name: '공동', hanjaName: '崆峒', group: 'gupa', alignment: 'right', blurb: '서북의 권각.' },
  { id: 'gaebang', name: '개방', hanjaName: '丐幇', group: 'gupa', alignment: 'middle', blurb: '천하 거지의 정보망.' },

  // ── 오대세가 (당문은 독문이라 별도 — docs/01) ──
  { id: 'namgung', name: '남궁세가', hanjaName: '南宮世家', group: 'segga', alignment: 'right', blurb: '검가의 명문.' },
  { id: 'jegal', name: '제갈세가', hanjaName: '諸葛世家', group: 'segga', alignment: 'right', blurb: '진법·지략의 가문.' },
  { id: 'paeng', name: '하북팽가', hanjaName: '河北彭家', group: 'segga', alignment: 'right', blurb: '도법의 강맹한 가문.' },
  { id: 'moyong', name: '모용세가', hanjaName: '慕容世家', group: 'segga', alignment: 'right', blurb: '쾌검의 강남 명가.' },
  { id: 'hwangbo', name: '황보세가', hanjaName: '皇甫世家', group: 'segga', alignment: 'right', blurb: '권·외공의 가문.' },

  // ── 무림맹 (구파·세가 연합의 정점) ──
  { id: 'murimmaeng', name: '무림맹', hanjaName: '武林盟', group: 'maeng', alignment: 'right', blurb: '정파 연합의 정점.' },

  // ── 사파·마교 (정파 평판과 반대로 움직임) ──
  { id: 'nokrim', name: '녹림', hanjaName: '綠林', group: 'sapa', alignment: 'sapa', blurb: '강남 사파의 거두.' },
  { id: 'haomun', name: '하오문', hanjaName: '下汚門', group: 'sapa', alignment: 'sapa', blurb: '뒷골목 정보의 그물.' },
  { id: 'magyo', name: '마교', hanjaName: '魔敎', group: 'magyo', alignment: 'magyo', blurb: '강호가 두려워하는 그림자.' },
] as const;

export function findFaction(id: string): Faction | undefined {
  return FACTIONS.find((f) => f.id === id);
}

export function factionsByGroup(group: FactionGroup): Faction[] {
  return FACTIONS.filter((f) => f.group === group);
}

// ─── 평판 단계 (숫자 숨김 — 라벨만 노출) ─────────────────────────────────────
export type RepTier = 'hostile' | 'cold' | 'neutral' | 'friendly' | 'ally';

export const REP_TIER_LABEL: Record<RepTier, string> = {
  hostile: '적대',
  cold: '냉랭',
  neutral: '평범',
  friendly: '우호',
  ally: '맹우',
};

export const REP_MIN = -100;
export const REP_MAX = 100;

// 값 → 단계. ally ≥60 / friendly ≥20 / neutral -19~19 / cold ≤-20 / hostile ≤-60.
export function repTier(value: number): RepTier {
  if (value >= 60) return 'ally';
  if (value >= 20) return 'friendly';
  if (value <= -60) return 'hostile';
  if (value <= -20) return 'cold';
  return 'neutral';
}

export function repTierLabel(value: number): string {
  return REP_TIER_LABEL[repTier(value)];
}
