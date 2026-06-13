// 졸업 후 평생 직책 궤적 — docs/28 §4 · docs/08. 노선(정체성) → 직책 2계층.
// 졸업 직업(jobs.ts)이 노선 + 시작 직책 레벨을 정하고, careerSystem 이 평생에 걸쳐 오르내린다.
// 그레이박스: 노선 9종 × 직책 4단(0 말단 → 3 정점). 수치 튜닝 대상.

import { JOB_POOL, type JobTier } from './jobs';

export type RouteId =
  | 'righteous' //  정파
  | 'vigilante' //  의적
  | 'escort' //     호위
  | 'wanderer' //   떠돌이
  | 'assassin' //   살수
  | 'shadow' //     정탐
  | 'demonic' //    마도
  | 'healer' //     의원
  | 'daoist' //     도가
  | 'commoner'; //  야인

export const ROUTE_LABEL: Record<RouteId, string> = {
  righteous: '정파',
  vigilante: '의적',
  escort: '호위',
  wanderer: '떠돌이',
  assassin: '살수',
  shadow: '정탐',
  demonic: '마도',
  healer: '의원',
  daoist: '도가',
  commoner: '야인',
};

// 직책 사다리 — index 0(말단) → 3(정점). docs/28 §4 예시 참조.
export const ROUTE_LADDER: Record<RouteId, readonly string[]> = {
  righteous: ['정파 무사', '분파 호법', '무림맹 호법', '무림맹주'],
  vigilante: ['뜨내기 협객', '의협', '의적', '의적 거두'],
  escort: ['문지기', '표국 무사', '호위장', '상단 총관'],
  wanderer: ['낭인', '이름난 검객', '일대 명숙', '강호 명사'],
  assassin: ['말단 살수', '살수', '살수 단장', '어둠의 절세'],
  shadow: ['세작', '정탐꾼', '밀정 두목', '강호의 그림자'],
  demonic: ['마졸', '사파 무인', '마두', '마교 호법'],
  healer: ['돌팔이', '마을 의원', '강호 의원', '신의'],
  daoist: ['행자', '도사', '도가 명숙', '도가 명사'],
  commoner: ['한량', '마을 무사', '마을 유지', '지방 명망가'],
};

// 연간 사망·실종 위험 — 위험한 길일수록 높다(docs/28 §4 "살수 의뢰·결투 → 사망").
export const ROUTE_DANGER: Record<RouteId, number> = {
  assassin: 0.12,
  demonic: 0.1, //  마도 — 사파 항쟁·정파 토벌 표적
  shadow: 0.06,
  vigilante: 0.05,
  wanderer: 0.04,
  righteous: 0.03,
  escort: 0.02,
  daoist: 0.01,
  healer: 0.01,
  commoner: 0.01,
};

// 직업(jobs.ts) → 노선. 졸업 직업의 정체성 계열.
export const JOB_ROUTE: Record<string, RouteId> = {
  'murim-lord': 'righteous',
  'orthodox-protector': 'righteous',
  'divine-healer': 'healer',
  'medicine-king': 'healer',
  'wandering-physician': 'healer',
  'village-physician': 'healer',
  'quack-doctor': 'healer',
  'ganghos-shadow': 'shadow',
  'dark-blade': 'assassin',
  'assassin-leader': 'assassin',
  'daoist-master': 'daoist',
  'caravan-guard-captain': 'escort',
  'escort-house-master': 'escort',
  'escort-warrior': 'escort',
  'village-guardian': 'escort',
  'righteous-bandit': 'vigilante',
  wanderer: 'wanderer',
  'town-idler': 'commoner',
  // ── 32종 확장(docs/28 §3) — 노선×직책 사다리 채움 ──
  'sword-saint': 'wanderer',
  'blade-master': 'wanderer',
  'bounty-hunter': 'wanderer',
  'chivalrous-chief': 'vigilante',
  'roving-hero': 'vigilante',
  'caravan-master': 'escort',
  gatekeeper: 'escort',
  'shadow-captain': 'shadow',
  'spy-scout': 'shadow',
  'daoist-priest': 'daoist',
  'wandering-daoist': 'daoist',
  strategist: 'righteous',
  'sect-warrior': 'righteous',
  'petty-assassin': 'assassin',
  // ── 마도(사파 무력) — 정탐 게이트 없는 순수 마공/사파 고수 ──
  'demon-protector': 'demonic',
  'demon-head': 'demonic',
  'sapa-warrior': 'demonic',
};

// 노선 → 연관 문파 id(factions.ts). 졸업 시 그 문파 평판↑(제자가 그 길에 든다). docs/30.
// 깔끔히 대응되는 노선만 — 호위·떠돌이·의원·야인·의적은 특정 문파 없음(매핑 X).
export const ROUTE_FACTION: Partial<Record<RouteId, string>> = {
  righteous: 'murimmaeng', // 정파 → 무림맹
  daoist: 'mudang', //        도가 → 무당
  assassin: 'nokrim', //      살수 → 녹림(사파)
  shadow: 'haomun', //        정탐 → 하오문(정보)
  demonic: 'magyo', //        마도 → 마교
};

// 직업 tier → 시작 직책 레벨(0~3). 잘 키울수록(정점 직업) 높은 자리에서 출발.
export const TIER_TO_LEVEL: Record<JobTier, number> = {
  peak: 3,
  upper: 2,
  common: 1,
  limited: 0,
};

// 직업 id → 노선 + 시작 직책 레벨 + 직책명.
export function careerStartFromJob(jobId: string): {
  route: RouteId;
  level: number;
  title: string;
} {
  const route = JOB_ROUTE[jobId] ?? 'commoner';
  const job = JOB_POOL.find((j) => j.id === jobId);
  const ladder = ROUTE_LADDER[route];
  const level = Math.min(ladder.length - 1, job ? TIER_TO_LEVEL[job.tier] : 0);
  return { route, level, title: ladder[level] };
}
