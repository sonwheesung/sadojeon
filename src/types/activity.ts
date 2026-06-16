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

// 진행 중 활동 — 의뢰 ActiveQuest 와 같은 임시-파견 골격.
export interface ActiveActivity {
  id: string;
  kind: ActivityKind;
  regionId?: string; // gather 지역
  discipleIds: string[]; // 파견 제자(1~N)
  startedDay: number;
  dueDay: number; // totalDay ≥ dueDay 면 결산·귀환
}
