// 영약 데이터 — docs/04 영약 5등급 · docs/28 §5-1 화경 게이트.
// 현재 핵심 = 신품(神品) 영약 = 화경 깨달음 벽의 열쇠. 최고난도 의뢰 드랍(운) 또는 과금.
// (하품~절품은 후속 — 내공·외공 도약 보조용.)

import type { StoredItem } from '@/stores/itemStore';
import type { QiAttribute, WoundType } from '@/types/disciple';

// 상처 속성(WoundType)은 types/disciple 에 정의. 영약·상처가 같은 타입을 공유하도록 재노출.
export type { WoundType };

// ─── 연단(영단 제조) 데이터 모델 ─────────────────────────────────────────────
// 영단 분류: heal(상처 치료·속성×등급) / internal(내공단·속성·흡수기간) / mind(심마) / utility(벽곡단·화경).
export type ElixirCategory = 'heal' | 'internal' | 'mind' | 'utility';

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
  'herb-divine': '신품 영초', // 신급 식물 — 영산절지 채집·의뢰로 회차당 최대 2(희소). docs/38·40 §3-B.
  // ── 신급 영물재료(영물 정수) — 영물은 무한 수급 불가, **종(種)별 회차당 1**(영물=동물 아님, 사용자 2026-06-21). ──
  // 속성 정수는 속성별 영물에서. 정통 무협명: 만년화리(火鯉)·현빙 영물·묵린혈망(墨鱗血蟒)·영산 영물.
  'essence-fire': '화린 정수', //   만년화리(火鯉) — 화산. 화속 치명 치료약(옥로단) 게이트.
  'essence-frost': '현빙 정수', //  현빙 영물 — 설산. 동상 치명 치료약(대양신단) 게이트.
  'essence-poison': '혈망 독정', // 묵린혈망(墨鱗血蟒) — 독곡. 독 치명 치료약(만독불침단) 게이트.
  'beast-essence': '영물 정수', //  영산절지 영물(최상) — 화경 구전대환단 핵심 게이트.
};

// 스타터 연단 도감(레시피). 배운 레시피만 제조 가능(연단 비급).
export const ELIXIR_RECIPES: readonly ElixirRecipe[] = [
  // ── 유틸 ──
  { id: 'byeokgokdan', name: '벽곡단', category: 'utility', alchemyReq: 8, craftDays: 2, materials: [{ id: 'herb-common', qty: 2 }], effect: '곡기를 끊고 폐관을 버틴다(2/일 소모).' },
  // ── 치료(외상) — 등급별 ──
  { id: 'geumchang-5', name: '금창약', category: 'heal', woundType: 'wound', grade: 5, alchemyReq: 10, craftDays: 2, materials: [{ id: 'herb-common', qty: 2 }], effect: '가벼운 외상(5등급)을 다스린다.' },
  { id: 'hwalhyeol-3', name: '활혈단', category: 'heal', woundType: 'wound', grade: 3, alchemyReq: 28, craftDays: 5, materials: [{ id: 'herb-common', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '베인 상처·타박(3등급)을 아문다.' },
  { id: 'saengsa-1', name: '생사인', category: 'heal', woundType: 'wound', grade: 1, alchemyReq: 55, craftDays: 14, materials: [{ id: 'herb-rare', qty: 3 }, { id: 'herb-divine', qty: 1 }], effect: '치명상(1등급)에서 끌어올린다.' },
  // ── 치료(속성) — 각 속성 등급 사다리(5 응급 / 3~4 보통 / 1 치명). docs/29 §5-1 ──
  // 중독(poison) — 독은 흔하다(당가·만천화우·살수 독침). 깊은 중독은 상급 해독약이라야.
  { id: 'haedokcho-go', name: '해독초고', category: 'heal', woundType: 'poison', grade: 5, alchemyReq: 12, craftDays: 2, materials: [{ id: 'herb-poison', qty: 2 }], effect: '해독초를 짓이긴 응급 해독고 — 가벼운 중독(5등급)을 다스린다.' },
  { id: 'haedok-3', name: '해독단', category: 'heal', woundType: 'poison', grade: 3, alchemyReq: 30, craftDays: 6, materials: [{ id: 'herb-poison', qty: 3 }], effect: '중독(3등급)을 푼다.' },
  { id: 'mandok-bulchimdan', name: '만독불침단', category: 'heal', woundType: 'poison', grade: 1, alchemyReq: 52, craftDays: 12, materials: [{ id: 'herb-poison', qty: 3 }, { id: 'essence-poison', qty: 1 }], effect: '만 가지 독을 누른다 — 치명 중독(1등급)까지 풀어내는 해독의 정점(당가·의가 비전). 묵린혈망의 혈망 독정이 핵심.' },
  // 화상(burn)
  { id: 'bingsim-san', name: '빙심산', category: 'heal', woundType: 'burn', grade: 5, alchemyReq: 12, craftDays: 2, materials: [{ id: 'herb-fire', qty: 2 }], effect: '서늘한 가루로 가벼운 화상(5등급)을 식힌다.' },
  { id: 'cheongryang-4', name: '청량고', category: 'heal', woundType: 'burn', grade: 4, alchemyReq: 20, craftDays: 4, materials: [{ id: 'herb-fire', qty: 2 }], effect: '화상(4등급)을 식힌다.' },
  { id: 'ongno-dan', name: '옥로단', category: 'heal', woundType: 'burn', grade: 1, alchemyReq: 52, craftDays: 12, materials: [{ id: 'herb-fire', qty: 2 }, { id: 'essence-fire', qty: 1 }], effect: '타들어간 살을 옥 이슬로 되살린다 — 치명 화상(1등급)까지. 만년화리의 화린 정수가 핵심.' },
  // 동상(frost)
  { id: 'onyang-go', name: '온양고', category: 'heal', woundType: 'frost', grade: 5, alchemyReq: 12, craftDays: 2, materials: [{ id: 'herb-cold', qty: 2 }], effect: '따뜻한 고약으로 가벼운 동상(5등급)을 녹인다.' },
  { id: 'onyang-3', name: '온양단', category: 'heal', woundType: 'frost', grade: 3, alchemyReq: 30, craftDays: 6, materials: [{ id: 'herb-cold', qty: 3 }], effect: '동상(3등급)을 녹인다.' },
  { id: 'daeyang-singdan', name: '대양신단', category: 'heal', woundType: 'frost', grade: 1, alchemyReq: 52, craftDays: 12, materials: [{ id: 'herb-cold', qty: 3 }, { id: 'essence-frost', qty: 1 }], effect: '꺼져가는 양기를 되살린다 — 치명 동상(1등급)까지. 현빙 영물의 현빙 정수가 핵심.' },
  // ── 내공단(속성·흡수) ──
  { id: 'naegong-fire', name: '양화내단', category: 'internal', attribute: 'fire', internalAmount: 120, absorbDays: 20, alchemyReq: 35, craftDays: 10, materials: [{ id: 'herb-fire', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '화속 내공 120 — 20일 흡수(흡수 중 다른 영단 X).' },
  { id: 'naegong-water', name: '현음내단', category: 'internal', attribute: 'water', internalAmount: 120, absorbDays: 20, alchemyReq: 35, craftDays: 10, materials: [{ id: 'herb-cold', qty: 3 }, { id: 'herb-rare', qty: 1 }], effect: '수속 내공 120 — 20일 흡수.' },
  // ── 심마 ──
  { id: 'ansin', name: '안신단', category: 'mind', alchemyReq: 40, craftDays: 8, materials: [{ id: 'herb-rare', qty: 2 }], effect: '심마·주화입마를 가라앉힌다(흑화·발작 완화).' },
  // ── 최상급(화경) ──
  { id: 'guzeon-daehwandan', name: '구전대환단', category: 'utility', alchemyReq: 58, craftDays: 30, materials: [{ id: 'beast-essence', qty: 1 }, { id: 'herb-divine', qty: 2 }, { id: 'herb-rare', qty: 3 }], effect: '화경의 벽을 넘는 신품 영약(최상급). 영물 정수 1 + 신품 영초 2 — 회차당 신급 재료가 희소해 사실상 회차당 1과(무과금 화경 게이트). 제조 30일.' },
];

export function findElixirRecipe(id: string): ElixirRecipe | undefined {
  return ELIXIR_RECIPES.find((r) => r.id === id);
}

// 화경의 열쇠 — 신품(5품) 영약. 보유 시에만 화경 깨달음 벽을 넘는다.
export const DIVINE_ELIXIR_ID = 'guzeon-daehwandan';

// 화경 환골탈태에 필요한 구전대환단 개수 — **무과금/핵과금 분리 레버**(docs/23 §화경 · docs/40 §3-B).
// 무과금(faithful)은 신급 재료 캡(영물정수1·신품영초2/회차) + 영약 회차리셋이라 회차당 ~1과가 천장 →
// N>1이면 못 채워 화경 ≤20%. 핵과금(factorysweep all)은 재료 무한·양산이라 무영향(≥70% 유지).
// 🔧 그레이박스 — carrysweep real faithful ↔ factorysweep all 반복 측정으로 N 확정(2026-06-26).
// env `DIVINE_N` 으로 sim 에서 재컴파일 없이 N 스윕(앱은 미설정 → 기본 2). `DIVINE_DROP` 패턴과 동일.
export const DIVINE_ELIXIR_FOR_HWAGYEONG = Number(process.env.DIVINE_N) || 2;

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

// 신품 영약 의뢰 드랍 확률 — 극험(extreme) 의뢰 완수 시(극험 ~4번당 1번). 과금 시 가중(후속). docs/28 §5-1.
// ⚠️ 무과금 화경 **2번째 영약**의 유일 경로(1번째=연단 자작). 화경 게이트=구전대환단 N=2과(분리 레버,
// `DIVINE_ELIXIR_FOR_HWAGYEONG`)라, 연단 1과 + 이 드랍 1과가 겹쳐야 화경.
// **8%→25% 상향(2026-06-26 확정)**: 8%면 2번째 영약 못 모아 화경 ~0%(절벽), 25%면 carrysweep n=20 무과금 화경
// **15%**(3/20, "드물지만 가능"). 핵과금은 영약 양산이라 드랍률 무영향(≥70% 유지). docs/23 §화경·40 §3-B. 🔧
export const DIVINE_ELIXIR_DROP_RATE = Number(process.env.DIVINE_DROP) || 0.25;
