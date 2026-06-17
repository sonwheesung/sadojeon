// 활동(活動) — 일과 외 임시 파견/제작. docs/38.
// 강호 출행(경험)·약초 채집(재료)·영단 제작(연단 편입)·도구 제작(추후).
// 며칠~몇 주 나갔다 돌아오는 임시 파견 — 영구 이탈(졸업)과 다름.

import type { WoundType } from './disciple';

// 채집 지역 난이도 — 재료 등급 = 지역 위험도. docs/38 §1②.
export type GatherTier = 'easy' | 'moderate' | 'dangerous' | 'extreme';

// 지역 재료 드랍 — 파견당 확률·수량(그레이박스).
export interface GatherDrop {
  id: string; // 재료 id (herb-*)
  chance: number; // 0~1 — 파견당 등장 확률
  min: number;
  max: number;
}

export interface GatherRegion {
  id: string;
  name: string;
  tier: GatherTier;
  preview: string; // 한 줄 배경
  days: number; // 파견 기간(일)
  loreMin: number; // 약 지식(연단/의술 중 높은 레벨) 게이트 — 미달이면 파견 불가
  needsCombatParty: boolean; // 위험 지역 — 전투 가능 동문 동행 필수
  recommendedParty: number; // 추천 인원
  woundType: WoundType; // 환경 상처 속성(외상·중독·동상·화상)
  woundChance: number; // 파견당 1인 환경 상처 확률(0~1)
  woundSeverityMin: number; // 가능한 가장 깊은 상처 심도(1=치명 ~ 5=경미)
  spiritBeast: boolean; // 영물 전투(극험) — 신품 재료 게이트
  drops: GatherDrop[];
}

// 활동 종류 — 채집(구현) · 강호 출행(Phase 2).
export type ActivityKind = 'gather' | 'expedition';

// ─── 강호 출행 (expedition) — docs/38 §1①. 견문·실전 경험. 도중 0~N 사건(도중 선택형). ───

// 행선 — 위험도 사다리. 위험할수록 사건 빈도·전투 격이 오른다.
export interface ExpeditionDest {
  id: string;
  name: string;
  preview: string; // 한 줄 배경
  days: number; // 여정 기간(일)
  danger: number; // 0~1 — 사건 기대 빈도·전투 격(정세 worldThreat 와 곱)
  recommendedParty: number;
  needsCombatParty: boolean; // 위험 행선 — 전투원 동행 권장(하드 게이트는 험지만)
  woundType: WoundType; // 환경/전투 상처 기본 속성
}

// 사건 갈래 — 전투·인연·풍문·횡재·위기.
export type ExpeditionEventCategory = 'combat' | 'bond' | 'rumor' | 'fortune' | 'crisis';

// 능력 판정 — 의뢰 돌발과 같은 결(주력 무공 성 또는 능력치 Lv).
export interface ExpeditionRoll {
  by: 'martial' | 'scouting' | 'guarding' | 'medicine' | 'endurance' | 'formation';
  base: number; // 역량 0일 때 성공률(0~1)
}

export interface ExpeditionRequire {
  stat?: 'scouting' | 'guarding' | 'medicine' | 'endurance' | 'formation';
  min?: number;
  martialSeong?: number;
  money?: number; // 자금 비용(노자 등)
}

// 선택 효과 — 의뢰와 달리 결과(outcome)가 아니라 즉시 적용(전리품·관계·인격·상처·풍문).
export interface ExpeditionEffect {
  resultText: string; // 결말 서술(서신·여정 일지에 적재)
  combat?: boolean; // 전투 엔진 굴림(대표 vs 행선 격 NPC) — 승패가 보상·상처를 정함
  money?: number; // 사문 금고 +
  material?: { id: string; qty: number }; // 재료 입수
  fame?: number; // 동행 전원 명성 +
  relationBump?: boolean; // 동행 2인+ 관계 한 단계 ↑
  persona?: Partial<Record<string, number>>; // 인격 6축 델타
  stressDelta?: number;
  woundSeverity?: number; // 환경/사고 상처(1=치명 ~ 5=경미) — dest.woundType 속성
  jianghuNews?: string; // 풍문 서신(읽기 전용)
  enlighten?: boolean; // 실전 깨달음 시도(전투 승리 시 자동)
}

export interface ExpeditionChoice {
  key: string;
  label: string;
  require?: ExpeditionRequire; // 절대 조건(자금 등) — 미충족 시 비활성
  roll?: ExpeditionRoll; // 현재 역량 기반 성공 판정(없으면 무판정 확정)
  effect: ExpeditionEffect; // 성공(또는 무판정) 효과
  failEffect?: ExpeditionEffect; // 판정 실패 효과
}

export interface ExpeditionEvent {
  id: string;
  category: ExpeditionEventCategory;
  weight: number;
  minDanger?: number; // 이 위험도 이상 행선에서만 등장(강한 전투는 험지 한정)
  prompt: string;
  choices: ExpeditionChoice[];
}

// 진행 중 활동 — 의뢰 ActiveQuest 와 같은 임시-파견 골격.
export interface ActiveActivity {
  id: string;
  kind: ActivityKind;
  regionId?: string; // gather 지역
  destId?: string; // expedition 행선
  discipleIds: string[]; // 파견 제자(1~N)
  startedDay: number;
  dueDay: number; // totalDay ≥ dueDay 면 결산·귀환
  // ── 강호 출행 사건 진행(도중 선택형) ──
  eventDays?: number[]; // 사건 발동 예정일(발행 시 산정 — 0~N건 분산)
  firedCount?: number; // 발동한 사건 수
  pendingEventId?: string; // 미해소 사건 서신함 id(있으면 다음 사건·귀환 보류)
  journal?: string[]; // 여정 중 사건 결말 누적 → 귀환 결산 서신
}
