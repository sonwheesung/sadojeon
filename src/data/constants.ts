export const GAME = {
  WEEKS_PER_SEASON: 12,
  DAYS_PER_WEEK: 7,
  SEASONS_PER_YEAR: 4,
  PHASES_PER_DAY: 2,
  // docs/06: 일정은 한 달 단위. 4주 = 1달, 3달 = 1계절, 12달 = 1년.
  WEEKS_PER_MONTH: 4,
  MONTHS_PER_SEASON: 3,
  MONTHS_PER_YEAR: 12,
} as const;

// 재능 — 사부가 보는 별점(고정 자질). ★1~5.
export const TALENT = {
  MIN: 1,
  MAX: 5,
} as const;

// 성격 5축(성실·자존·의리·호기·공감) — 숨은 연속 변수. 1~100 (신뢰와 같은 자).
// 50 = 평균. 밴드 매핑(구 1~5 → n×20−10): 1→10·2→30·3→50·4→70·5→90.
export const PERSONALITY = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 50,
} as const;

export const TRUST = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 30,
} as const;

export const DARKNESS = {
  WARN_THRESHOLD: 2,
  CRITICAL_THRESHOLD: 3,
} as const;

export const STORAGE_KEYS = {
  CURRENT_SAVE_SLOT: '@shidao/currentSaveSlot',
  SETTINGS: '@shidao/settings',
  DEV_FLAGS: '@shidao/devFlags',
} as const;

export const SCHEMA_VERSION = 1;

// 사부 슬롯 — docs/16_회차_다회차.md "사부 슬롯 — 평행 2슬롯"
export const MASTER_SLOT = {
  COUNT: 2, // 평행 슬롯 수. 슬롯 간 데이터 완전 독립
} as const;

// 사부 스탯 범위 — docs/02_사부_시스템.md
export const MASTER_STAT = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3,
} as const;

// 사부 수명 — 양육 20~30년을 품도록 (시작 52세 + 20~30년 = 별세 ~72~82세). docs/23·docs/02.
// 그레이박스 1차: 졸업 사이클 검증 우선이라 사실상 비활성(99). 모든 제자가 졸업하면
// 회차 종결(graduationSystem). 후속 단계에서 LIFETIME_YEARS 를 양육 기간(~25)으로
// 환원하고 졸업+사부 사망 둘 다 트리거.
export const MASTER = {
  LIFETIME_YEARS: 99, // TODO: 후속에 ~25 로 환원 (양육 20~30년, 플레이테스트 확정)
  STARTING_AGE: 52,
} as const;

// 하산(졸업) — 양육은 기간제. 입문(10세) 후 RAISING_YEARS 가 지나면 실력·신뢰와 무관하게 하산한다.
// "한 판 = 15년 양육" 타임박스: 잘 키웠든(전설) 못 키웠든(실패) 25세에 강호로 나선다.
// (옛 실력 게이트 '무공 천장 + 신뢰 60' 폐기 — 조기 졸업·영영 미졸업 문제. docs/06)
export const GRADUATION = {
  RAISING_YEARS: 15,
} as const;

// 도입 튜토리얼 회차 — docs/46. 짧은 스크립트 아크: 일류 도달 시 조기 졸업(정규 15년 게이트와 별개,
// isTutorialRun 일 때만) → 표국 무사(말단) 고정 → 결산 시 중품 비급 1권 + 다이아 보상(2회차 훅).
// leaf 상수로 둔다(graduationSystem 이 import 해도 사이클 없게 — introRun/newRun 우회).
export const TUTORIAL = {
  GRADUATION_REALM: 'ilryu', // 이 경지(일류) 도달 시 도입 회차 조기 졸업
  JOB_ID: 'escort-warrior', // 표국 무사(상단 호위 말단)
  REWARD_DIAMONDS: 20,
} as const;

// 회차 — docs/16_회차_다회차.md, docs/23_경지_시스템.md
export const RUN = {
  AVG_YEARS: 25, // 양육 20~30년 (사부가 제자를 직접 키우는 한 일생). 정확한 값은 플레이테스트로 확정
  AVG_DISCIPLES_PER_RUN: 6, // 5~7명 거쳐감
} as const;

// 정체기 진행도 구간 — docs/06_훈련_일정.md
export const PLATEAU = {
  FIRST_START: 70,
  FIRST_MULTIPLIER: 0.5,
  SECOND_START: 85,
  SECOND_MULTIPLIER: 0.2,
} as const;

// 사문 양육 슬롯 — docs/15. 최대 4명 최소 2명.
// 초기 1성 2명 자동 합류, 매 월 시작 시 확률로 후보 풀에서 영입 이벤트.
export const SECT = {
  CAPACITY: 4,
  MIN: 2,
} as const;
