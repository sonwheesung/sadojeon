// 비급 등급 (별 1~5) — docs/04_무공_도감.md "별 1~5 등급 체계"
// 하품 / 중품 / 상품 / 절품 / 신품
export type MartialArtGrade = 'novice' | 'apprentice' | 'master' | 'grandmaster' | 'legendary';

export const MARTIAL_ART_GRADE_LABEL: Record<MartialArtGrade, string> = {
  novice: '하품',
  apprentice: '중품',
  master: '상품',
  grandmaster: '절품',
  legendary: '신품',
};

// 무공 수련 단계 (5단계) — docs/06_훈련_일정.md "무공 단계 — 5단계"
// 입문 / 소성 / 대성 / 화경 / 초절정
export type MartialStage =
  | 'introduction'
  | 'small_completion'
  | 'great_completion'
  | 'transcendent'
  | 'peerless';

export const MARTIAL_STAGE_LABEL: Record<MartialStage, string> = {
  introduction: '입문',
  small_completion: '소성',
  great_completion: '대성',
  transcendent: '화경',
  peerless: '초절정',
};

export const MARTIAL_STAGE_ORDER: readonly MartialStage[] = [
  'introduction',
  'small_completion',
  'great_completion',
  'transcendent',
  'peerless',
] as const;

export type MartialArtSchool =
  | 'sword'
  | 'fist'
  | 'palm'
  | 'staff'
  | 'qigong'
  | 'lightness'
  | 'medical'
  | 'darkArts';

export type TalentAxis = 'body' | 'qi' | 'agility' | 'insight' | 'mind';

export interface TalentRequirement {
  axis: TalentAxis;
  minimum: number;
}

export interface MartialArt {
  id: string;
  name: string;
  hanjaName: string;
  description: string;
  school: MartialArtSchool;
  grade: MartialArtGrade;
  requirements: TalentRequirement[];
  preferredTalents: TalentAxis[];
  stages: number;
  isSectArt: boolean;
}

// 제자가 익히고 있는 무공의 진행 상태.
// stage: 현재 도달 단계 (MartialStage), progress: 해당 단계 안 진행도 0~100
export interface MartialArtInstance {
  artId: string;
  stage: MartialStage;
  progress: number;
  unlockedAt: number;
}

// 사문 보유 비급의 연구 상태 — docs/05_연구_거래.md
// docs/16_회차_다회차.md: 비급 원본은 회차 누적, researchProgress 는 회차마다 0
export type ResearchStatus = 'unidentified' | 'identified' | 'researching' | 'complete';

export interface ScrollInventoryItem {
  artId: string;
  acquiredAtRun: number; // 어느 회차에 처음 입수했는지
  acquiredAtDay: number; // 처음 입수일 (회차 내)
  status: ResearchStatus;
  researchProgress: number; // 0~100, 회차마다 리셋
  isTrap: boolean;
  isIncomplete: boolean;
}
