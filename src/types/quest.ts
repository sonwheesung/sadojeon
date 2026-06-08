// 의뢰(依賴) — 강호 파견. docs/28 §4 경로 B. 비무공 능력치(정탐·호위) 성장 + 명성 + 자금.
// 제자를 1~N명 파견 → 주(일) 단위 진행 → 결산 outcome 5분기.

export type QuestDomain = 'guard' | 'scout' | 'duel' | 'medicine' | 'assassin' | 'grand';
//                         호위    정탐     결투    의술      살수        큰의뢰(복합)

export type QuestGrade = 'menial' | 'minor' | 'normal' | 'dangerous' | 'extreme';
//                        잡일      소무      보통      위험         극험

// 결산 분기 — docs/08 의뢰 결과.
export type QuestOutcome = 'full' | 'partial' | 'crisis' | 'fail' | 'disaster';
//                          완전성공 부분성공   위기후성공 실패     재난(중상·사망)

export interface QuestReward {
  money: number; // 자금(동화). 사문 금고에 들어감
  fame: number; // 명성(완전성공 기준 기대치). 제자·사문에 반영
}

export interface Quest {
  id: string;
  domain: QuestDomain;
  grade: QuestGrade;
  title: string;
  client: string; // 의뢰인
  preview: string; // 한 줄 배경
  weeks: number; // 예상 소요(주). 일 단위 단기 의뢰는 days 로 덮어쓴다(잡일=청소 등 1~3일).
  days?: number; // 있으면 파견 기간을 일 단위로(weeks 무시). 잡일류 단기 심부름.
  reward: QuestReward; // 미리보기 = 완전성공 기대치
  recommended: number; // 추천 인원
  minStat: number; // 관련 역량 최소 조건(극험은 하드 게이트, 그 외 소프트)
  gray?: boolean; // 도덕 회색 의뢰
  faction?: string; // 후원 문파 id(있으면 우호 문파 후원 의뢰) — 완수 시 그 문파 평판↑. docs/30
}

export interface ActiveQuest {
  quest: Quest;
  discipleIds: string[]; // 파견 제자(1~N)
  startedDay: number; // 파견 시작 totalDay
  dueDay: number; // totalDay ≥ dueDay 면 결산
  // 돌발 이벤트 누적 보정 (결산에 반영).
  successDelta?: number; // 성공도 +
  riskDelta?: number; // 부상·사망 확률 +
  rewardMult?: number; // 보상 배수(기본 1)
  rewardFlag?: 'noble'; // 귀인 등 특수 보상
  eventRolled?: boolean; // 이벤트 1회 발동 완료
  pendingEventId?: string; // 미해소 이벤트 서신함 id (있으면 결산 보류)
}

// ─── 의뢰 중 돌발 이벤트 — docs/28 §7. 서신함 강제 선택. ──────────────────
// 의뢰 도메인·등급에 맞는 이벤트만 발동(마을 청소에 기관 함정 X).
export interface QuestEventChoiceRequire {
  stat?: QuestEventStat; // 능력치 Lv 게이트
  min?: number;
  martialSeong?: number; // 주력 무공 성 게이트
  money?: number; // 자금 비용(영약 즉석 구매 등)
}

// 게이트로 쓰는 능력치(StatId 부분집합). 순환 의존 피해 문자열로.
export type QuestEventStat = 'medicine' | 'alchemy' | 'scouting' | 'guarding' | 'formation';

export interface QuestEventEffect {
  successDelta?: number;
  riskDelta?: number;
  rewardMult?: number;
  rewardFlag?: 'noble';
  // 인격 6축 델타 (키=integrity·freedom·warmth·prudence·mercy·ambition).
  persona?: Partial<Record<string, number>>;
  stressDelta?: number; // 자책·멘탈 → 일정 기간 훈련 효율↓(stress)
  // 구한 이의 정체가 드러남 — 평민/명문/사파 무작위 → 해당 문파 평판↑(+ 명문은 귀인 보상). docs/30.
  revealRescue?: boolean;
  resultText?: string;
}

// 확률 판정 — 현재 스탯/무공으로 성공률 계산. by='martial'이면 주력 무공 성.
export interface QuestEventRoll {
  by: QuestEventStat | 'martial';
  base: number; // 스탯 0일 때 성공률(0~1). 스탯이 높을수록 0.95까지 상승.
}

export interface QuestEventChoice {
  key: string;
  label: string;
  require?: QuestEventChoiceRequire; // 절대 조건(자금 등) — 미충족 시 비활성
  roll?: QuestEventRoll; // 현재 스탯 기반 성공 확률 판정 (없으면 무판정 확정)
  effect: QuestEventEffect; // 성공(또는 무판정) 효과
  failEffect?: QuestEventEffect; // 판정 실패 시 효과
}

export interface QuestEvent {
  id: string;
  domains: QuestDomain[]; // 이 도메인 의뢰에서만 발동
  minGrade?: QuestGrade; // 이 등급 이상에서만(위험·극험 한정 이벤트)
  weight: number;
  prompt: string;
  choices: QuestEventChoice[];
}
