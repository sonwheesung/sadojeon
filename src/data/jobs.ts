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

// 전투 갈래 묶음 — "검/도/권 등 아무 무공" 조건용.
export const COMBAT_SCHOOLS: readonly MartialArtSchool[] = [
  'sword',
  'fist',
  'palm',
  'staff',
  'lightness',
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
}

// 그레이박스 풀 (~18종). docs/28 §10 32종 중 대표. 수치 튜닝 대상.
export const JOB_POOL: readonly Job[] = [
  // ── 정점 ──────────────────────────────────────────────
  {
    id: 'murim-lord',
    name: '무림맹주',
    tier: 'peak',
    desc: '정파의 정점. 강호를 호령한다.',
    statReq: { knowledge: 70, guarding: 60 },
    martial: { schools: ['sword', 'fist', 'palm', 'staff'], minSeong: 8 },
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
    martial: { schools: ['sword', 'fist', 'palm', 'staff'], minSeong: 7 },
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
  // ── 한계 ──────────────────────────────────────────────
  {
    id: 'quack-doctor',
    name: '야매 의사',
    tier: 'limited',
    desc: '어설픈 의술로 먹고산다.',
    statReq: { medicine: 12 },
  },
  {
    id: 'town-idler',
    name: '동네 한량',
    tier: 'limited',
    desc: '이렇다 할 길을 못 찾았다.',
    // 조건 없음 — 누구나 (최후 폴백).
  },
] as const;
