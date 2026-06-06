// 일일 일지 — docs/06 "일일 일지".
// 매일 [진행] 1회 = 한 묶음. 각 제자에 대해 한 줄(+ 특수 이벤트 한 줄 추가 가능).
// 메인 하단 인라인 패널에 휘발성으로 표시. 모달 X.

import type { MartialStage } from './martialArt';

export type DailyLogKind =
  | 'training'      // 무공 진척 (정상)
  | 'plateau'       // 진척이 미미 — 정체기 의심
  | 'meditation'    // 명상
  | 'rest'          // 휴식
  | 'autonomy'      // 자율
  | 'growth'        // 단련 스탯(능력치·지식) 레벨업
  | 'stamina_drop'  // 기색 풍경이 한 단계 떨어짐
  | 'stamina_rise'  // 기색 풍경이 한 단계 올라옴
  | 'override'      // 폐관/치료/파견 등 명령 수행 중
  | 'collapse'      // 탈진
  | 'promotion';    // 무공 승급

export interface DailyLogEntry {
  id: string;
  kind: DailyLogKind;
  discipleId?: string;
  discipleName?: string;
  text: string;
}

export interface DailyLog {
  day: number;        // totalDay
  dateLabel: string;  // 표시용 — 진행 시점 날짜
  entries: DailyLogEntry[];
}

// 카드 배지 — DiscipleCard 위에 작은 변화 표시.
// 한 카드에 동시 여러 개 가능하지만 보통 1~2개.
export type DiscipleBadge =
  | 'promoted'        // 오늘 승급
  | 'collapsed'       // 오늘 탈진
  | 'low_stamina'     // 기색 매우 나쁨 (탈진 임박)
  | 'plateau'         // 정체기 진입 의심
  | 'good_progress';  // 오늘 큰 진척

// 변곡점 — 모달 강제 표시. 작은 진척과 구분되는 큰 사건만.
export type MilestoneKind = 'promotion' | 'collapse' | 'graduation' | 'quest';

export interface Milestone {
  id: string;
  kind: MilestoneKind;
  discipleId: string;
  discipleName: string;
  // promotion 전용
  artId?: string;
  artName?: string;
  newStage?: MartialStage;
  // 본문 (이미 가공된 한 줄)
  title: string;
  body: string;
}
