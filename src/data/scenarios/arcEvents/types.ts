// 캐릭터 필수 이벤트 아크 — 타입. docs/47·48.
// 효과는 면담과 같은 MeetingEffect(인격 6축·신뢰·흑화·노선) 재사용 — 단 delta 를 크게(면담 ±1~4 vs 아크 ±8~12). docs/47 §2.

import type { MeetingEffect } from '@/data/scenarios/meetings';

export interface ArcEventChoice {
  key: string;
  label: string; // 사부 응답 대사(톤 라벨 노출 X — feedback_hidden_game_state)
  effects: MeetingEffect;
}

export interface ArcEvent {
  discipleId: string;
  year: number; // 1~15 (양육 연차)
  title: string; // 회고·서신함 제목
  body: string; // 상황(제자 대사 포함)
  hint?: string; // 통찰 힌트(선택, graybox 미사용)
  choices: ArcEventChoice[]; // 2~4
}
