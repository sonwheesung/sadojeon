// 영약 5등급 — docs/04_무공_도감.md "영약 5등급"
// 단계 도약 보조용 1회용 소모품. docs/16_회차_다회차.md: 회차 누적 X (회차마다 초기화)

export type ElixirGrade =
  | 'low' // 1품 하품
  | 'mid' // 2품 중품
  | 'high' // 3품 상품
  | 'extreme' // 4품 절품
  | 'divine'; // 5품 신품

export const ELIXIR_GRADE_LABEL: Record<ElixirGrade, string> = {
  low: '하품',
  mid: '중품',
  high: '상품',
  extreme: '절품',
  divine: '신품',
};

export const ELIXIR_GRADE_ORDER: readonly ElixirGrade[] = [
  'low',
  'mid',
  'high',
  'extreme',
  'divine',
] as const;

export interface Elixir {
  id: string;
  name: string;
  hanjaName: string;
  grade: ElixirGrade;
  description: string;
}

// 사문 보관 영약 인스턴스 — 회차 누적 X, 회차 종결 시 자동 소모/리셋
export interface ElixirInventoryItem {
  elixirId: string;
  acquiredAtDay: number;
  quantity: number;
}
