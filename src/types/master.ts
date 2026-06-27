import type { TalentAxis } from './martialArt';

export type MasterStyle = 'strict' | 'lenient' | 'mystic' | 'pragmatic' | 'paternal';

export interface MasterReputation {
  righteous: number;
  wulin: number;
  imperial: number;
  underground: number;
}

// 사부 4스탯 — docs/02_사부_시스템.md. 회차마다 초기화 (docs/16).
// **저장은 0~100 단일 스케일**, ★1~5 표시는 masterStatStar 로만 환산(스케일 버그 MS1 봉합, docs/37).
// 통찰=감별·연구속도·면담힌트(성장:면담), 위엄=일부 게이트(성장:처분), 연륜=경력 거울, 인망=평판 거울.
export interface MasterStats {
  insight: number; // 통찰 (洞察) 0~100 — 면담 누적 성장
  experience: number; // 연륜 (年輪) 0~100 — yearsAsMaster 거울(deriveExperience)
  authority: number; // 위엄 (威嚴) 0~100 — 처분 누적 성장
  prestige: number; // 인망 (人望) 0~100 — Master.reputation 거울(derivePrestige)
}

// 0~100 저장값 → ★1~5 표시 등급(단일 진실 — 전 소비처가 이것만 쓴다. MS1 봉합). docs/02·37.
export function masterStatStar(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, 1 + Math.floor((value ?? 0) / 20))) as 1 | 2 | 3 | 4 | 5;
}

// 연륜 = 경력(yearsAsMaster 0~15)의 거울 — 15년 회차에 0→100(★1→★5). 비게이트 표시값. docs/02.
export function deriveExperience(yearsAsMaster: number): number {
  return Math.max(0, Math.min(100, Math.round((yearsAsMaster / 15) * 100)));
}

// 인망 = 사부 평판(Master.reputation 4축)의 거울 — 가장 높은 진영 명망. 비게이트 표시값. docs/02.
export function derivePrestige(rep: MasterReputation): number {
  return Math.max(0, Math.min(100, Math.round(Math.max(rep.righteous, rep.wulin, rep.imperial, rep.underground))));
}

export const MASTER_STAT_LABEL: Record<keyof MasterStats, string> = {
  insight: '통찰',
  experience: '연륜',
  authority: '위엄',
  prestige: '인망',
};

// 통찰 ★등급별 비급 연구 속도 배율 — docs/02_사부_시스템.md
// 통찰 ★★★★★ 는 함정 비급 자동 회피 (별도 처리)
export const INSIGHT_RESEARCH_MULTIPLIER: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.5,
  2: 0.8,
  3: 1.0,
  4: 1.5,
  5: 2.5,
};

export interface Master {
  id: string;
  name: string;
  hanjaName: string;
  age: number;
  style: MasterStyle;

  stats: MasterStats; // 4스탯 (통찰·연륜·위엄·인망)

  specialties: TalentAxis[];
  signatureArtIds: string[];

  reputation: MasterReputation;
  qi: number;
  health: number;

  yearsAsMaster: number;
  disciplesGraduated: number;
  disciplesLost: number;
}
