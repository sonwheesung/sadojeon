// 졸업 직업 풀 — docs/28 §3·§4. 최소조건 충족 → 적합도 확률 → (추후) 사용자 선택.
// 그레이박스: 직업·조건·tier 임시값. 비무공 능력치(의술·정탐 등) 성장 경로(의뢰·교습)는 후속 기능.
// 무공 조건은 주력 무공 1개의 갈래·성으로 판정(jobSystem).

import type { MartialArtSchool } from '@/types/martialArt';
import type { PersonalityTraits } from '@/types/disciple';
import type { StatId } from '@/types/training';

export type JobTier = 'peak' | 'upper' | 'common' | 'limited';

export const JOB_TIER_LABEL: Record<JobTier, string> = {
  peak: '정점',
  upper: '상위',
  common: '보통',
  limited: '한계',
};

// 직업 tier → 양육 등급 별(docs/03 6등급). 졸업 등급의 상한 가늠용.
export const JOB_TIER_STARS: Record<JobTier, number> = {
  peak: 5,
  upper: 4,
  common: 2,
  limited: 1,
};

// 전투 갈래 묶음 — "검/도/권 등 아무 무공" 조건용. (갈래 8종 확정 — palm/staff 폐기)
export const COMBAT_SCHOOLS: readonly MartialArtSchool[] = [
  'sword',
  'saber',
  'fist',
  'lightness',
  'hidden',
  'external',
  'darkArts',
];

export interface Job {
  id: string;
  name: string;
  tier: JobTier;
  desc: string;
  // 최소 능력치 Lv(0~100). 모두 충족해야 후보.
  statReq?: Partial<Record<StatId, number>>;
  // 주력 무공: 이 갈래 중 하나를 minSeong 이상 익혔는가.
  martial?: { schools: readonly MartialArtSchool[]; minSeong: number };
  // 인격 6축 최소(≥) / 최대(≤). docs/28 §6.
  personaMin?: Partial<Record<keyof PersonalityTraits, number>>;
  personaMax?: Partial<Record<keyof PersonalityTraits, number>>;
  // 흑화 최소 단계(≥). 천마처럼 어둠에 완전히 삼켜져야만 가는 길. docs/13·21.
  darknessMin?: number;
}

// 그레이박스 풀 (35종). docs/28 §3·§4 노선×직책 사다리를 채운다. 수치 튜닝 대상.
// 마도 3종(마교 호법·마두·사파 무인) = 정탐 게이트 없는 순수 마공/사파 무력 — 어두운 인격(협의 낮음) 게이트.
export const JOB_POOL: readonly Job[] = [
  // ── 정점 ──────────────────────────────────────────────
  {
    id: 'demon-god',
    name: '천마(天魔)',
    tier: 'peak',
    desc: '마(魔)의 정점에 선 자. 만마(萬魔)가 그 앞에 엎드린다. 마교를 호령하는 절대자.',
    // 마공(암흑술)의 극성(9성) + 어둠에 완전히 삼켜진 자(흑화 최대) + 협의·자비를 버리고 천하를 삼키려는 야망.
    // 마교 호법(협의≤40)보다 한 단계 위 — 양육으로 닿는 마도의 진짜 정점. docs/21·13·28 §3.
    // 천마는 마공의 정점이라야 — 검·도 등 일반 전투 갈래 9성+흑화로는 천마가 못 된다(암흑술 9성 필수, 사용자 2026-06-20).
    martial: { schools: ['darkArts'], minSeong: 9 },
    personaMin: { ambition: 70 },
    personaMax: { integrity: 25, mercy: 25 },
    darknessMin: 4,
  },
  {
    id: 'murim-lord',
    name: '무림맹주',
    tier: 'peak',
    desc: '정파의 정점. 강호를 호령한다.',
    statReq: { knowledge: 70, guarding: 60 },
    martial: { schools: ['sword', 'saber', 'fist'], minSeong: 8 },
    personaMin: { integrity: 70, mercy: 55, ambition: 55 },
  },
  {
    id: 'divine-healer',
    name: '신의(神醫)',
    tier: 'peak',
    desc: '살리는 손의 정점.',
    statReq: { medicine: 80, knowledge: 70, alchemy: 50 },
    personaMin: { mercy: 60 },
  },
  {
    id: 'medicine-king',
    name: '약왕(藥王)',
    tier: 'peak',
    desc: '영약 제조의 정점.',
    statReq: { alchemy: 80, medicine: 55 },
  },
  {
    id: 'ganghos-shadow',
    name: '강호의 그림자',
    tier: 'peak',
    desc: '정탐·은신의 절정. 누구도 그를 보지 못한다.',
    statReq: { scouting: 85 },
    martial: { schools: ['lightness'], minSeong: 7 },
  },
  {
    id: 'dark-blade',
    name: '어둠의 절세 살수',
    tier: 'peak',
    desc: '살수계의 정점.',
    statReq: { scouting: 70 },
    martial: { schools: ['sword', 'darkArts'], minSeong: 8 },
    personaMax: { mercy: 30 },
  },
  {
    id: 'daoist-master',
    name: '도가 명사',
    tier: 'peak',
    desc: '내공·도가 사상의 정수.',
    statReq: { knowledge: 70 },
    martial: { schools: ['qigong'], minSeong: 8 },
    personaMin: { prudence: 70 },
    personaMax: { ambition: 35 },
  },
  {
    id: 'sword-saint',
    name: '검성(劍聖)',
    tier: 'peak',
    desc: '한 자루 검으로 강호를 가른 떠돌이 검의 정점.',
    martial: { schools: ['sword'], minSeong: 9 },
    personaMin: { freedom: 55 },
  },
  {
    id: 'demon-protector',
    name: '마교 호법(魔敎護法)',
    tier: 'peak',
    desc: '마교를 떠받치는 절정의 무력. 강호가 이름만으로 떤다.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 9 },
    personaMax: { integrity: 40 }, // 사파엔 협의가 없다(어두운 인격 게이트)
  },
  {
    id: 'chivalrous-chief',
    name: '의적 거두',
    tier: 'peak',
    desc: '천하의 의적을 거느린 거두. 약자의 하늘.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 8 },
    personaMin: { integrity: 60, freedom: 55, mercy: 60 },
  },
  {
    id: 'caravan-master',
    name: '상단 총관',
    tier: 'peak',
    desc: '거대 상단의 모든 표행을 총괄한다.',
    statReq: { guarding: 75, etiquette: 65, knowledge: 55 },
    personaMax: { freedom: 35 },
  },
  // ── 상위 ──────────────────────────────────────────────
  {
    id: 'caravan-guard-captain',
    name: '상단 호위장',
    tier: 'upper',
    desc: '큰 상단의 호위 총책.',
    statReq: { guarding: 70, strength: 55, etiquette: 50 },
    personaMax: { freedom: 40 }, // 의무감 강함
  },
  {
    id: 'escort-house-master',
    name: '표국주',
    tier: 'upper',
    desc: '표국을 거느린다.',
    statReq: { guarding: 55, etiquette: 45 },
    martial: { schools: COMBAT_SCHOOLS, minSeong: 5 },
  },
  {
    id: 'orthodox-protector',
    name: '정파 호법',
    tier: 'upper',
    desc: '정파 문파의 수호.',
    martial: { schools: ['sword', 'saber', 'fist'], minSeong: 7 },
    personaMin: { integrity: 60 },
  },
  {
    id: 'wandering-physician',
    name: '강호 의원',
    tier: 'upper',
    desc: '강호를 떠도는 의원.',
    statReq: { medicine: 55, alchemy: 35 },
  },
  {
    id: 'assassin-leader',
    name: '살수 단장',
    tier: 'upper',
    desc: '살수 조직의 수뇌.',
    statReq: { scouting: 55 },
    martial: { schools: ['sword', 'darkArts'], minSeong: 6 },
    personaMax: { mercy: 40 },
  },
  {
    id: 'righteous-bandit',
    name: '의적 단장',
    tier: 'upper',
    desc: '약자의 편에 선 의적.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 6 },
    personaMin: { integrity: 55, freedom: 50, mercy: 55 },
  },
  {
    id: 'blade-master',
    name: '이름난 검객',
    tier: 'upper',
    desc: '강호에 이름을 떨친 떠돌이 검객.',
    martial: { schools: ['sword'], minSeong: 7 },
    personaMin: { freedom: 50 },
  },
  {
    id: 'demon-head',
    name: '마두(魔頭)',
    tier: 'upper',
    desc: '사파에 이름을 떨친 마공의 고수.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 7 },
    personaMax: { integrity: 45 },
  },
  {
    id: 'shadow-captain',
    name: '밀정 두목',
    tier: 'upper',
    desc: '강호 곳곳에 눈과 귀를 거느린 밀정의 수장.',
    statReq: { scouting: 60 },
    martial: { schools: ['lightness'], minSeong: 5 },
  },
  {
    id: 'daoist-priest',
    name: '도가 명숙',
    tier: 'upper',
    desc: '도관을 이끄는 명망 있는 도사.',
    statReq: { knowledge: 55 },
    martial: { schools: ['qigong'], minSeong: 6 },
    personaMin: { prudence: 60 },
    personaMax: { ambition: 40 },
  },
  {
    id: 'strategist',
    name: '강호 책사',
    tier: 'upper',
    desc: '병법과 모략으로 정파를 떠받치는 책사.',
    statReq: { knowledge: 75, formation: 60 },
    personaMin: { prudence: 65, integrity: 50 },
  },
  // ── 보통 ──────────────────────────────────────────────
  {
    id: 'escort-warrior',
    name: '표국 무사',
    tier: 'common',
    desc: '표국 소속 호위 무사.',
    statReq: { guarding: 30 },
  },
  {
    id: 'village-physician',
    name: '마을 의원',
    tier: 'common',
    desc: '마을의 의원.',
    statReq: { medicine: 30 },
  },
  {
    id: 'wanderer',
    name: '떠돌이 무인',
    tier: 'common',
    desc: '어디에도 매이지 않는 무인.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 4 },
    personaMin: { freedom: 55 },
  },
  {
    id: 'village-guardian',
    name: '마을 보호자',
    tier: 'common',
    desc: '마을을 지키는 무인.',
    statReq: { guarding: 25 },
    personaMin: { mercy: 50 },
  },
  {
    id: 'bounty-hunter',
    name: '현상금 사냥꾼',
    tier: 'common',
    desc: '수배자를 쫓아 강호를 떠도는 무인.',
    statReq: { scouting: 40 },
    martial: { schools: COMBAT_SCHOOLS, minSeong: 5 },
    personaMin: { freedom: 50 },
  },
  {
    id: 'spy-scout',
    name: '정탐꾼',
    tier: 'common',
    desc: '발 빠른 정보꾼. 소문과 길목을 읽는다.',
    statReq: { scouting: 35 },
  },
  {
    id: 'wandering-daoist',
    name: '도사',
    tier: 'common',
    desc: '강호를 떠도는 도사.',
    statReq: { knowledge: 35 },
    martial: { schools: ['qigong'], minSeong: 4 },
  },
  {
    id: 'roving-hero',
    name: '의협',
    tier: 'common',
    desc: '불의를 보면 칼을 뽑는 떠돌이 협객.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 5 },
    personaMin: { mercy: 50, freedom: 50 },
  },
  {
    id: 'sect-warrior',
    name: '정파 무사',
    tier: 'common',
    desc: '정파 문파에 몸담은 무사.',
    martial: { schools: ['sword', 'saber', 'fist'], minSeong: 4 },
    personaMin: { integrity: 50 },
  },
  {
    id: 'sapa-warrior',
    name: '사파 무인(邪派武人)',
    tier: 'common',
    desc: '협의에 매이지 않고 힘을 좇는 사파의 무인.',
    martial: { schools: COMBAT_SCHOOLS, minSeong: 4 },
    personaMax: { integrity: 40 },
  },
  // ── 한계 ──────────────────────────────────────────────
  {
    id: 'quack-doctor',
    name: '야매 의사',
    tier: 'limited',
    desc: '어설픈 의술로 먹고산다.',
    statReq: { medicine: 12 },
  },
  {
    id: 'petty-assassin',
    name: '말단 살수',
    tier: 'limited',
    desc: '뒷골목 청부를 받는 이름 없는 살수.',
    statReq: { scouting: 20 },
    martial: { schools: ['sword', 'darkArts'], minSeong: 3 },
    personaMax: { mercy: 45 },
  },
  {
    id: 'gatekeeper',
    name: '문지기',
    tier: 'limited',
    desc: '표국·문파의 문을 지키는 말단 무사.',
    statReq: { guarding: 15 },
  },
  {
    id: 'town-idler',
    name: '동네 한량',
    tier: 'limited',
    desc: '이렇다 할 길을 못 찾았다.',
    // 조건 없음 — 누구나 (최후 폴백).
  },
] as const;
