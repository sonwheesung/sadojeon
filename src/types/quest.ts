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
  weeks: number; // 예상 소요(파견 기간)
  reward: QuestReward; // 미리보기 = 완전성공 기대치
  recommended: number; // 추천 인원
  minStat: number; // 관련 역량 최소 조건(극험은 하드 게이트, 그 외 소프트)
  gray?: boolean; // 도덕 회색 의뢰
}

export interface ActiveQuest {
  quest: Quest;
  discipleIds: string[]; // 파견 제자(1~N)
  startedDay: number; // 파견 시작 totalDay
  dueDay: number; // totalDay ≥ dueDay 면 결산
}
