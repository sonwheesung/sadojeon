// 전투 시뮬레이션 엔진 타입 — docs/35_전투_엔진.md.
// 엔진은 순수(스토어 의존 0): 전투원 스냅샷 → 결과 객체. 효과 적용(상처·관계·EXP)은 호출측 몫.
// 1:1 ~ n:n, 모드는 대련(spar)/실전(real) 두 가지.

import type { MartialArtGrade, MartialArtSchool, MartialPath } from './martialArt';
import type { Realm } from './realm';
import type { WoundType } from './disciple';

// ─── 입력 ────────────────────────────────────────────────────────────────────

// 전투원이 들고 들어오는 무공 한 수 — 카탈로그 무공이든 NPC 합성 무공이든 같은 형태.
export interface CombatArt {
  school: MartialArtSchool;
  grade: MartialArtGrade;
  path: MartialPath;
  seong: number; // 1~10
  isMain?: boolean; // 주력 — 내공 소모·살초 결이 주력을 따른다
}

// 전투원 스냅샷 — 제자(fromDisciple)·NPC(npc.ts) 공용. 엔진은 이것만 본다.
export interface Combatant {
  id: string;
  name: string;
  realm: Realm;
  arts: CombatArt[];
  internal: number; // 내공 누적치(절대) — realmProgress.internal. 내공 격차 = 기세 우열
  strength: number; // 근력(외공) 0~100
  agility: number; // 민첩 0~100
  endurance: number; // 지구력 0~100 → 전투 지속력(HP)
  staminaFrac: number; // 입장 시 체력 비율 0~1 — 지친 몸으로는 제 실력이 안 나온다
  insight: number; // 오성 1~5 — 간파·임기응변
  prudence: number; // 신중 0~100 — 낮으면 무리수(살초↑·빈틈↑)
  mercy: number; // 자비 0~100 — 실전 결정타의 손속(사망률)
  simma: number; // 심마 0~100 — 높으면 실전에서 폭주(공↑방↓)
  woundSeverity?: number; // 기존 부상 심도 1(치명)~5(경미) — 만전이 아니다
}

// ─── 설정 ────────────────────────────────────────────────────────────────────

// 대련: 승부가 갈리는 순간(승복)에서 멈춘다. 죽지 않고, 부상은 사고일 때만.
// 실전: 한쪽이 전원 쓰러질 때까지. 부상·사망·패주가 있다.
export type CombatMode = 'spar' | 'real';

export interface CombatConfig {
  mode: CombatMode;
  rng?: () => number; // 미지정 시 Math.random — 헤드리스 시뮬은 시드 주입
  lethal?: boolean; // real: 결정타 사망 굴림 허용 (기본 true)
  allowRetreat?: boolean; // real: 열세 측 패주 시도 (기본 true)
  extraAccidentChance?: number; // spar: 호출측 가산 사고율(감정·기질·살기 — 호출측이 안다)
  maxRounds?: number; // 합 상한 (기본 30) — 도달 시 판정
}

// ─── 결과 ────────────────────────────────────────────────────────────────────

export type CombatantState =
  | 'standing' // 멀쩡히 서 있다
  | 'yielded' // (대련) 승복하고 물러남
  | 'downed' // (실전) 쓰러짐 — 전투 불능
  | 'fled' // (실전) 패주 성공
  | 'dead'; // (실전) 절명

// 엔진이 제안하는 상처 — 적용(inflictWound)은 호출측이 한다.
export interface SuggestedWound {
  type: WoundType;
  severity: number; // 1(치명)~5(경미)
  days: number;
}

export interface CombatantResult {
  id: string;
  name: string;
  side: 'A' | 'B';
  state: CombatantState;
  hpFrac: number; // 잔여 체력 비율 0~1
  qiFrac: number; // 잔여 내공(뒷심) 비율 0~1
  dealtFrac: number; // 가한 피해 총량(상대 최대체력 비율 합) — 활약도
  takenFrac: number; // 받은 피해 총량
  wound?: SuggestedWound; // 입은 상처 제안 (없으면 무사)
}

export type CombatEventKind =
  | 'exchange' // 합 — 유효타
  | 'miss' // 흘려냄·빗나감
  | 'crit' // 살초·회심의 일격
  | 'yield' // 승복 (대련)
  | 'down' // 쓰러짐 (실전)
  | 'death' // 절명 (실전)
  | 'flee' // 패주 (실전)
  | 'burst' // 심마 폭주 개전 (실전)
  | 'accident'; // 대련 사고 — 손속이 지나침

export interface CombatEvent {
  round: number;
  kind: CombatEventKind;
  actorId?: string;
  targetId?: string;
  dmgFrac?: number; // 이 합으로 깎인 대상 체력 비율
}

// 결과 구간 — 대련 4단계(박빙/우세/압도)와 호환. 사고는 accident 필드로 별도.
export type CombatTier = 'close' | 'edge' | 'crush';

export interface CombatResult {
  mode: CombatMode;
  rounds: number;
  winner: 'A' | 'B' | 'draw';
  // 승부의 선명함 0~1 — 양측 잔여 전력(평균 체력 비율) 차. tier 의 원료.
  margin: number;
  tier: CombatTier;
  combatants: CombatantResult[];
  mvpId?: string; // 활약(가한 피해) 1위 — n:n 보상 차등용
  events: CombatEvent[];
  // 대련 사고 — 발생 시 학습 무효·상처 적용은 호출측. victim 의 wound 제안 포함.
  accident?: { victimId: string; strikerId: string };
}
