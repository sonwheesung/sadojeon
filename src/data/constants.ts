export const GAME = {
  WEEKS_PER_SEASON: 12,
  DAYS_PER_WEEK: 7,
  SEASONS_PER_YEAR: 4,
  PHASES_PER_DAY: 2,
} as const;

export const TALENT = {
  MIN: 1,
  MAX: 5,
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

// 회차 — docs/16_회차_다회차.md
export const RUN = {
  AVG_YEARS: 18, // 회차 전체 약 15~20년 (사부 사망까지)
  AVG_DISCIPLES_PER_RUN: 6, // 5~7명 거쳐감
} as const;

// 정체기 진행도 구간 — docs/06_훈련_일정.md
export const PLATEAU = {
  FIRST_START: 70,
  FIRST_MULTIPLIER: 0.5,
  SECOND_START: 85,
  SECOND_MULTIPLIER: 0.2,
} as const;
