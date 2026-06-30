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

// 비급 진위 — 입수한 비급 *개체*(코덱스 entry) 속성. 같은 무공도 사본마다 다를 수 있다. docs/05 §감별.
//  authentic : 진품(기본·대다수)  /  trap : 함정(연구·전수 시 주화입마·흑화)
//  incomplete: 미완(가르침 한 단계 낮춤 + 강호 탐색 동력)  /  fake : 가품(연구해도 무가치)
export type ArtAuthenticity = 'authentic' | 'trap' | 'incomplete' | 'fake';

export const ART_AUTHENTICITY_LABEL: Record<ArtAuthenticity, string> = {
  authentic: '진품',
  trap: '함정 비급',
  incomplete: '미완 비급',
  fake: '가품',
};

// 무공서 스킬트리 선행조건 — 선행 무공서를 최소 성까지 익혀야 학습 가능. docs/28 §5-2.
export interface ArtPrerequisite {
  artId: string;
  minSeong: number; // 1~10
}

// 무공서 습득 경로 — docs/05·04 (2026-06-10 확정).
//  start       : 시작 사문 소장(본문 비급) — 회차 시작부터 도감에.
//  quest       : 의뢰 보상 드랍 — 의뢰 등급↔비급 등급, 도메인↔갈래 결 매칭(questSystem).
//  achievement : 업적 해금(전설급 — 업적 인프라 후속).
export type ArtAcquisition = 'start' | 'quest' | 'achievement';

export interface MartialArt {
  id: string;
  name: string;
  hanjaName: string;
  description: string;
  school: MartialArtSchool;
  grade: MartialArtGrade;
  path: MartialPath; // 노선(색) — 상극·마공 판정. docs/04.
  isSectArt: boolean;
  // 습득 경로 — 어디서 이 비급을 얻는가.
  acquisition: ArtAcquisition;
  // 스킬트리 선행조건 — 미충족 시 학습 불가(경지 게이트와 함께). 없으면 선행 없음. docs/28 §5-2.
  prerequisites?: ArtPrerequisite[];
  // 문파·계보 — 무공 계보 화면에서 같은 lineage 끼리 한 트리로 묶음(화산·소림·사문…). docs/26 §5-4.
  lineage?: string;
  // 깊은 마공 게이트 — 흑화 단계가 이 이상이라야 학습 가능(마도 무공의 적층, docs/04 §카테고리 4단계).
  minDarkness?: number;
  // 무공 특성(트레이트) — 그 무공서만의 성질. 무공서 개체마다 지정. 안 적으면 갈래·등급·노선
  // 기본값(defaultArtTraits). docs/35 §3-A·docs/04. 흡공은 심마와 묶인다(이종진기 → 주화입마).
  traits?: MartialTrait[];
}

// 무공 특성 — 캔온대로 무공서에 부여. 대부분 엔진·시스템이 이미 하는 일을 "어느 무공이 쓰나"로 묶음.
// 포켓몬 기술 모델(대상 범위 + 속성)의 무협판: sweep/wild=범위, poison/burn/frost=속성(→상처).
export type MartialTrait =
  | 'sweep' //   다인기 — 한 수가 다수를 친다(검막·도강·장풍·만천화우). [엔진 cleave, 적만]
  | 'wild' //    막무가내 광역 — 휩쓸 때 아군까지 휘말린다(장풍·폭렬 마공·도강 난전). [cleave 아군 포함]
  | 'drain' //   흡공 — 적 내공을 빨아 자신을 채운다 + 심마 누적(흡성대법·화공대법). [qi 흡수 + 주화입마]
  | 'guard' //   호신강기·금강불괴 — 피격 피해 감쇄. [방어]
  | 'poison' //  중독 속성 — 독·약독(당가 암기·사천 독공). [중독 상처]
  | 'burn' //    화염 속성 — 열양·화공(화염도·열화장). [화상 상처]
  | 'frost' //   빙한 속성 — 한음·빙공(빙백검·한빙장). [동상 상처]
  | 'swift' //   쾌(快) — 선공·연격(쾌검·신법). [신법↑]
  | 'pierce'; // 파공(破功) — 상대 호신강기를 꿰뚫는다(육맥신검류). [방어 관통]

export const MARTIAL_TRAIT_LABEL: Record<MartialTrait, string> = {
  sweep: '광역',
  wild: '광폭',
  drain: '흡공',
  guard: '호신',
  poison: '중독',
  burn: '화염',
  frost: '빙한',
  swift: '쾌속',
  pierce: '파공',
};

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
  // 실시간 연구 타이머(researching일 때) — 실제 시간 기준(epoch ms). 등급별 5분~12시간,
  // 다이아로 즉시 완료 가능. 사문 공유 — 비급당 1회 연구하면 전 제자 학습 가능. docs/05.
  researchStartAt?: number;
  researchEndAt?: number;
}
