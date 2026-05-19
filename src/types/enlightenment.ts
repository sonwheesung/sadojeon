// 깨달음 시스템 — docs/06_훈련_일정.md "깨달음 3종" + "깨달음 트리거 (7종)"

export type EnlightenmentKind =
  | 'small' // 소오 (小悟) — 정체기 1차 (70~85%) 돌파, 가끔 발화
  | 'great' // 대오 (大悟) — 정체기 2차 (85~100%) 돌파, 단계 도약 가능
  | 'sudden'; // 돈오 (頓悟) — 한순간의 거대한 깨달음, 화경·초절정 결정타

export const ENLIGHTENMENT_LABEL: Record<EnlightenmentKind, string> = {
  small: '소오',
  great: '대오',
  sudden: '돈오',
};

export type EnlightenmentTrigger =
  | 'combat_crisis' // 실전 위기 — 죽음 문턱
  | 'nature' // 자연 — 자연 현상·풍경
  | 'loss' // 상실 — 인연·사형제·사부의 죽음
  | 'master_word' // 사부 한마디 — 면담·훈시
  | 'senior_teaching' // 사형 가르침 — 사형제의 시연·말
  | 'other_art' // 다른 무공 자극 — 다른 갈래·다른 출처 무공 접함
  | 'meditation'; // 명상·폐관 — 의도적 수행

export const ENLIGHTENMENT_TRIGGER_LABEL: Record<EnlightenmentTrigger, string> = {
  combat_crisis: '실전 위기',
  nature: '자연',
  loss: '상실',
  master_word: '사부 한마디',
  senior_teaching: '사형 가르침',
  other_art: '다른 무공 자극',
  meditation: '명상·폐관',
};

// 발화 기록 — 누적 수련이 충분치 않으면 "마음에 스쳤다" 정도로 그침
export interface EnlightenmentEvent {
  discipleId: string;
  kind: EnlightenmentKind;
  trigger: EnlightenmentTrigger;
  artId?: string; // 깨달음이 특정 무공의 진행에 작용한 경우
  atDay: number;
  fired: boolean; // true: 진행도에 반영됨 / false: 그냥 스침
}
