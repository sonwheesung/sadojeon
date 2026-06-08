// 영약 데이터 — docs/04 영약 5등급 · docs/28 §5-1 화경 게이트.
// 현재 핵심 = 신품(神品) 영약 = 화경 깨달음 벽의 열쇠. 최고난도 의뢰 드랍(운) 또는 과금.
// (하품~절품은 후속 — 내공·외공 도약 보조용.)

import type { StoredItem } from '@/stores/itemStore';
import type { QiAttribute } from '@/types/disciple';

// ─── 연단(영단 제조) 데이터 모델 ─────────────────────────────────────────────
// 영단 분류: heal(상처 치료·속성×등급) / internal(내공단·속성·흡수기간) / mind(심마) / utility(벽곡단·화경).
export type ElixirCategory = 'heal' | 'internal' | 'mind' | 'utility';
// 상처 속성 — 외상·화상·독·동상·내상. 치료엔 같은 속성 + 충분한 등급 영단 필요.
export type WoundType = 'wound' | 'burn' | 'poison' | 'frost' | 'inner';

export interface ElixirRecipe {
  id: string;
  name: string;
  category: ElixirCategory;
  // heal: 상처 속성 + 등급(1=최상급·치명상까지 / 5=하급·경미만). 등급 ≤ 상처 심도면 치료.
  woundType?: WoundType;
  grade?: number;
  // internal(내공단): 내공 속성 + 내공량 + 흡수 기간(이 동안 다른 영단 복용 불가).
  attribute?: QiAttribute;
  internalAmount?: number;
  absorbDays?: number;
  // 제조 — 요구 alchemy Lv, 제조 기간(효과 강할수록 오래), 재료(약초 등).
  alchemyReq: number;
  craftDays: number;
  materials: { id: string; qty: number }[];
  effect: string;
}

// 약초 재료 — 약초채집·의술 의뢰 + 극험 드랍 + 상점. (Phase 2에서 의뢰 연계.)
export const MATERIAL_LABEL: Record<string, string> = {
  'herb-common': '흔한 약초',
  'herb-fire': '화속 영초',
  'herb-poison': '해독초',
  'herb-cold': '한설초',
  'herb-rare': '진귀 영초',
  'herb-divine': '신품 영초',
};

// 스타터 연단 도감(레시피). 배운 레시피만 제조 가능(연단 비급).
export const ELIXIR_RECIPES: readonly ElixirRecipe[] = [
  // ── 유틸 ──
  { id: 'byeokgokdan', name: '벽곡단', category: 'utility', alchemyReq: 8, craftDays: 2, materials: [{ id: 'herb-common', qty: 2 }], effect: '곡기를 끊고 폐관을 버틴다(2/일 소모).' },
  // ── 치료(외상) — 등급별 ──
  { id: 'geumchang-5', name: '금창약', category: 'heal', woundType: 'wound', grade: 5, alchemyReq: 10, craftDays: 2, materials: [{ id: 'herb-common', qty: 2 }], effect: '가벼운 외상(5등급)을 다스린다.' },
  { id: 'hwalhyeol-3', name: '활혈단', category: 'heal', woundType: 'wound', grade: 3, alchemyReq: 28, craftDays: 5, materials: [{ id: 'herb-common', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '베인 상처·타박(3등급)을 아문다.' },
  { id: 'saengsa-1', name: '생사인', category: 'heal', woundType: 'wound', grade: 1, alchemyReq: 55, craftDays: 14, materials: [{ id: 'herb-rare', qty: 3 }, { id: 'herb-divine', qty: 1 }], effect: '치명상(1등급)에서 끌어올린다.' },
  // ── 치료(속성) ──
  { id: 'cheongryang-4', name: '청량고', category: 'heal', woundType: 'burn', grade: 4, alchemyReq: 20, craftDays: 4, materials: [{ id: 'herb-fire', qty: 2 }], effect: '화상(4등급)을 식힌다.' },
  { id: 'haedok-3', name: '해독단', category: 'heal', woundType: 'poison', grade: 3, alchemyReq: 30, craftDays: 6, materials: [{ id: 'herb-poison', qty: 3 }], effect: '중독(3등급)을 푼다.' },
  { id: 'onyang-3', name: '온양단', category: 'heal', woundType: 'frost', grade: 3, alchemyReq: 30, craftDays: 6, materials: [{ id: 'herb-cold', qty: 3 }], effect: '동상(3등급)을 녹인다.' },
  // ── 내공단(속성·흡수) ──
  { id: 'naegong-fire', name: '양화내단', category: 'internal', attribute: 'fire', internalAmount: 120, absorbDays: 20, alchemyReq: 35, craftDays: 10, materials: [{ id: 'herb-fire', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '화속 내공 120 — 20일 흡수(흡수 중 다른 영단 X).' },
  { id: 'naegong-water', name: '현음내단', category: 'internal', attribute: 'water', internalAmount: 120, absorbDays: 20, alchemyReq: 35, craftDays: 10, materials: [{ id: 'herb-cold', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '수속 내공 120 — 20일 흡수.' },
  // ── 심마 ──
  { id: 'ansin', name: '안신단', category: 'mind', alchemyReq: 40, craftDays: 8, materials: [{ id: 'herb-rare', qty: 2 }], effect: '심마·주화입마를 가라앉힌다(흑화·발작 완화).' },
  // ── 최상급(화경) ──
  { id: 'guzeon-daehwandan', name: '구전대환단', category: 'utility', alchemyReq: 65, craftDays: 30, materials: [{ id: 'herb-divine', qty: 3 }, { id: 'herb-rare', qty: 3 }], effect: '화경의 벽을 넘는 신품 영약(최상급). 제조 30일.' },
];

export function findElixirRecipe(id: string): ElixirRecipe | undefined {
  return ELIXIR_RECIPES.find((r) => r.id === id);
}

// 화경의 열쇠 — 신품(5품) 영약. 보유 시에만 화경 깨달음 벽을 넘는다.
export const DIVINE_ELIXIR_ID = 'guzeon-daehwandan';

export function divineElixirItem(): StoredItem {
  return {
    id: DIVINE_ELIXIR_ID,
    category: 'elixir',
    name: '구전대환단',
    grade: 5, // 신품
    count: 1,
    effects: '화경의 벽을 넘게 하는 신품 영약. 깨달음의 마지막 열쇠 — 폐관 중 복용하면 화경에 든다.',
  };
}

// 신품 영약 의뢰 드랍 확률 — 극험(extreme) 의뢰 완수 시. <10%(운). 과금 시 가중(후속). docs/28 §5-1.
export const DIVINE_ELIXIR_DROP_RATE = 0.08;
