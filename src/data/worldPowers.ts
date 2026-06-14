// 강호 5세력 정세 데이터 — docs/08. 세력 기본값·정통 보호·라이벌 긴장·기조 임계.
// 한 줄 추가로 세력/라이벌 확장(SOLID plug-in). 숫자는 화면 노출 X — 라벨/문구만.

import type { Stance, WorldBloc } from '@/types/world';

export const WORLD_BLOCS: readonly WorldBloc[] = [
  'orthodox',
  'unorthodox',
  'demonic',
  'neutral',
  'imperial',
] as const;

export const BLOC_LABEL: Record<WorldBloc, string> = {
  orthodox: '정파',
  unorthodox: '사파',
  demonic: '마교',
  neutral: '중도',
  imperial: '관·군',
};

// 세력 기본 정의. floor = 세력치 하한(정통 문파 불변 룰: 정파는 흔들려도 멸문 X).
// volatility = 사건 효과 배율(사파·마교가 더 출렁). startTension = 회차 시작 시 라이벌 긴장 가산.
export interface BlocDef {
  base: number; //    회차 시작 세력치
  floor: number; //   세력치 하한 (정통 보호)
  volatility: number; // 사건 효과 배율
}

export const BLOC_DEF: Record<WorldBloc, BlocDef> = {
  orthodox: { base: 72, floor: 50, volatility: 0.8 }, // 정통 — 두텁고 안 무너짐
  unorthodox: { base: 46, floor: 8, volatility: 1.25 }, // 사파 — 봉기·토벌로 크게 출렁
  demonic: { base: 40, floor: 6, volatility: 1.35 }, // 마교 — 잠복·준동 진폭 큼
  neutral: { base: 38, floor: 12, volatility: 0.9 }, // 중도(표국·개방)
  imperial: { base: 55, floor: 30, volatility: 0.7 }, // 관·군 — 평소 강호 거리 둠
};

// 정통(멸문 불가) 세력 — 사건 결말이 이들 세력치를 floor 아래로 못 내린다. memory: 거대 정통 문파 불변.
export const PROTECTED_BLOCS = new Set<WorldBloc>(['orthodox', 'imperial']);

// 라이벌 쌍 — 적대일수록 긴장이 빨리 쌓인다(계절당 +drift). 중도·관은 평소 잠잠.
export interface Rivalry {
  a: WorldBloc;
  b: WorldBloc;
  drift: number; //  계절당 긴장 기본 상승치(라이벌 강도)
  label: string; //  쌍 설명(풍문·로그용)
}

export const RIVALRIES: readonly Rivalry[] = [
  // 기본 긴장은 낮게 깔린다(평온이 기본) — 갈등은 사건이 만든다. 그래서 한 축이 전쟁이어도 다른 축은 평온할 수 있다.
  { a: 'orthodox', b: 'demonic', drift: 2.8, label: '정마대립' }, // 마교 준동이 끌어올림
  { a: 'orthodox', b: 'unorthodox', drift: 2.4, label: '정사항쟁' }, // 사파 봉기가 끌어올림
  { a: 'unorthodox', b: 'demonic', drift: 1.9, label: '사마견제' }, // 독립 축 — 사마 패권 다툼이 키운다(드물게 사마대전)
  { a: 'orthodox', b: 'imperial', drift: 0.8, label: '관무알력' }, // 관과 강호의 미묘한 거리
  { a: 'unorthodox', b: 'imperial', drift: 1.7, label: '관적토벌' }, // 독립 축 — 관의 사파 토벌이 키운다
] as const;

// 라이벌 쌍 키(순서 무관) — tensions 맵 키.
export function blocPairKey(a: WorldBloc, b: WorldBloc): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function rivalryOf(a: WorldBloc, b: WorldBloc): Rivalry | undefined {
  return RIVALRIES.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a),
  );
}

// 긴장도(0~100) → 쌍 기조. 한 세력의 기조 = 자기가 낀 쌍 중 최고.
export const STANCE_THRESHOLD: { at: number; stance: Stance }[] = [
  { at: 86, stance: 'war' },
  { at: 66, stance: 'clash' },
  { at: 46, stance: 'tension' },
  { at: 26, stance: 'restless' },
  { at: 0, stance: 'calm' },
];

export function tensionToStance(t: number): Stance {
  for (const row of STANCE_THRESHOLD) if (t >= row.at) return row.stance;
  return 'calm';
}

// 기조 순위(최고 기조 산출용).
export const STANCE_RANK: Record<Stance, number> = {
  calm: 0,
  restless: 1,
  tension: 2,
  clash: 3,
  war: 4,
};

export const STANCE_LABEL: Record<Stance, string> = {
  calm: '평온',
  restless: '술렁임',
  tension: '긴장',
  clash: '충돌',
  war: '전쟁',
};

// 세력 블록 → 사문 평판 대상 문파 id(factions.ts). 정세가 사문 평판을 미세하게 흔든다(docs/30).
// 한 블록이 여러 문파를 대표 — 대표 문파만 살짝 움직인다(과하지 않게).
export const BLOC_FACTIONS: Record<WorldBloc, readonly string[]> = {
  orthodox: ['murimmaeng'],
  unorthodox: ['nokrim', 'haomun'],
  demonic: ['magyo'],
  neutral: ['gaebang'],
  imperial: [],
};
