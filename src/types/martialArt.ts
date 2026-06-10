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

// 무공 숙련도 명칭 밴드 (4단계) — 성(1~10)에서 파생. docs/26_무공_숙련도.md.
// 입문(1~3성) / 소성(4~6성) / 대성(7~9성) / 극성(10성).
// 화경·초절정은 *무공 단계*가 아니라 *사람의 경지* (docs/23) 로 분리됨.
export type MartialStage =
  | 'introduction'
  | 'small_completion'
  | 'great_completion'
  | 'ultimate';

export const MARTIAL_STAGE_LABEL: Record<MartialStage, string> = {
  introduction: '입문',
  small_completion: '소성',
  great_completion: '대성',
  ultimate: '극성',
};

export const MARTIAL_STAGE_ORDER: readonly MartialStage[] = [
  'introduction',
  'small_completion',
  'great_completion',
  'ultimate',
] as const;

// 무공 노선(색) — docs/04 "무공 색깔". 정도/중도/사도/마도.
// 상극 판정·노선 유도·마공 위험의 기준. (사람의 흑화가 먼저, 무공 변질이 나중 — docs/04 §흑화 4단계.)
export type MartialPath = 'jeong' | 'jung' | 'sa' | 'ma';

export const MARTIAL_PATH_LABEL: Record<MartialPath, string> = {
  jeong: '정도',
  jung: '중도',
  sa: '사도',
  ma: '마도',
};

// 무공 갈래 8종 + 마공 — docs/04·28 §1 확정(2026-06-10).
// 검·도·권(장법 흡수)·보·암기·외공·내공·의가무공. 마공(darkArts)은 정식 갈래가 아니라
// 숨은 별도 효율(흑화 전용) — 도감 카테고리에 노출하지 않는다.
// (옛 'palm' 장법·'staff' 봉법 키는 폐기 — 권법/도법으로 흡수.)
export type MartialArtSchool =
  | 'sword' // 검법
  | 'saber' // 도법
  | 'fist' // 권법 (장법 포함)
  | 'lightness' // 보법
  | 'hidden' // 암기
  | 'external' // 외공 (금강불괴류 외공서)
  | 'qigong' // 내공 (심법서)
  | 'medical' // 의가무공 (활인·해독)
  | 'darkArts'; // 마공 (숨은 별도)

export type TalentAxis = 'body' | 'qi' | 'agility' | 'insight' | 'mind';

export interface TalentRequirement {
  axis: TalentAxis;
  minimum: number;
}

// 무공서 스킬트리 선행조건 — 선행 무공서를 최소 성까지 익혀야 학습 가능. docs/28 §5-2.
export interface ArtPrerequisite {
  artId: string;
  minSeong: number; // 1~10
}

export interface MartialArt {
  id: string;
  name: string;
  hanjaName: string;
  description: string;
  school: MartialArtSchool;
  grade: MartialArtGrade;
  path: MartialPath; // 노선(색) — 상극·마공 판정. docs/04.
  requirements: TalentRequirement[];
  preferredTalents: TalentAxis[];
  isSectArt: boolean;
  // 스킬트리 선행조건 — 미충족 시 학습 불가(경지 게이트와 함께). 없으면 선행 없음. docs/28 §5-2.
  prerequisites?: ArtPrerequisite[];
  // 문파·계보 — 무공 계보 화면에서 같은 lineage 끼리 한 트리로 묶음(화산·소림·사문…). docs/26 §5-4.
  lineage?: string;
}

// 제자가 익히고 있는 무공의 진행 상태. docs/26_무공_숙련도.md.
// seong: 현재 숙련 성(1~10), exp: 현재 성 안에서 누적 경험치.
// 명칭 단계(MartialStage)는 seongToStage(seong) 로 파생 — 별도 저장 X.
export interface MartialArtInstance {
  artId: string;
  seong: number;
  exp: number;
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
