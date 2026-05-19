import type { TalentAxis } from './martialArt';

export type MasterStyle = 'strict' | 'lenient' | 'mystic' | 'pragmatic' | 'paternal';

export interface MasterReputation {
  righteous: number;
  wulin: number;
  imperial: number;
  underground: number;
}

// 사부 4스탯 — docs/02_사부_시스템.md "사부 스탯 — 4종"
// 회차마다 초기화 (docs/16_회차_다회차.md)
// 통찰이 핵심 축: 비급 감별·연구 속도·재능 감별·함정 인지
export interface MasterStats {
  insight: number; // 통찰 (洞察) ★1~5
  experience: number; // 연륜 (年輪) ★1~5
  authority: number; // 위엄 (威嚴) ★1~5
  prestige: number; // 인망 (人望) ★1~5
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
