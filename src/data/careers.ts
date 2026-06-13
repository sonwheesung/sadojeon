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

// 직업 id → 노선 내 직책 순서(0 말단 → 클수록 윗자리). 2026-06-14.
// **한 노선 안에서 순서는 전부 달라야 한다**(같은 직종·같은 직급 금지). 졸업 시 같은 노선에
// 여러 자격이 되면 **확률로 가르지 않고 가장 높은 직책 하나로 수렴**(jobSystem.evaluateJobs).
// 강호 의원 자격이면서 신의 자격이면 신의만 후보 — 강호 의원으로 시작해 신의로 오르는 건 졸업 후 careerSystem 몫.
// (tier 와 결을 맞춘다: 높은 tier 일수록 높은 순서. tier 가 같아도 순서는 서로 달리 매겨 충돌 제거.)
export const JOB_RANK: Record<string, number> = {
  // 정파
  'sect-warrior': 0, strategist: 1, 'orthodox-protector': 2, 'murim-lord': 3,
  // 의원
  'quack-doctor': 0, 'village-physician': 1, 'wandering-physician': 2, 'medicine-king': 3, 'divine-healer': 4,
  // 정탐
  'spy-scout': 0, 'shadow-captain': 1, 'ganghos-shadow': 2,
  // 살수
  'petty-assassin': 0, 'assassin-leader': 1, 'dark-blade': 2,
  // 도가
  'wandering-daoist': 0, 'daoist-priest': 1, 'daoist-master': 2,
  // 호위
  gatekeeper: 0, 'escort-warrior': 1, 'village-guardian': 2, 'escort-house-master': 3, 'caravan-guard-captain': 4, 'caravan-master': 5,
  // 떠돌이
  wanderer: 0, 'bounty-hunter': 1, 'blade-master': 2, 'sword-saint': 3,
  // 의적
  'roving-hero': 0, 'righteous-bandit': 1, 'chivalrous-chief': 2,
  // 마도
  'sapa-warrior': 0, 'demon-head': 1, 'demon-protector': 2,
  // 야인
  'town-idler': 0,
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
