// 상점 상품 카탈로그 — 정본 설계 docs/50. 적극적 P2W(경쟁 없는 싱글), 경험 코어 4선(가챠·되돌리기·통찰·재능RNG)만 판매 금지.
// 가격은 전부 🔧그레이박스(밸런스 후 확정). id 는 기존 데이터(elixirs·martialArts) 재사용.
import type { WoundType } from '@/types/disciple';

export type ShopId = 'diamond' | 'sect';
export type Currency = 'diamond' | 'gold';

// 지급 종류 — 구매 성공 시 무엇을 주는가. 상점 시스템(shopSystem.grant)이 분기 처리.
export type ShopGrant =
  | { kind: 'elixir-set'; recipeIds: string[] } // 상처 영약 세트 — 여러 치료단 일괄 지급
  | { kind: 'item'; recipeId: string; qty: number } // 단일 영약/단약(벽곡단·안신단 등)
  | { kind: 'material'; materialId: string; qty: number } // 연단 재료(buyMaterial 재사용)
  | { kind: 'divine-limited' } // 신품 영약(구전대환단) — 사문별 1개 한정
  | { kind: 'exchange'; gold: number } // 다이아 → 골드 환전
  | { kind: 'scroll'; artId: string } // 비급(무공서)
  | { kind: 'constitution'; woundType: WoundType } // 특성 부여(천독불침 등) — 🔧 미구현(부여 경로 신설 필요)
  | { kind: 'character'; poolId: string }; // 캐릭터 DLC — 🔧 미구현

export interface ShopProduct {
  id: string;
  shop: ShopId;
  title: string;
  desc: string;
  currency: Currency;
  price: number; // 🔧 그레이박스. material 은 priceOf()가 단가표(materialPrice)로 덮어씀.
  limited?: boolean; // 사문별 1개(신품). shopStore 가 추적.
  comingSoon?: boolean; // 🔧 데이터·화면만, 지급 미구현(특성·캐릭터).
  grant: ShopGrant;
}

// 상처 영약 세트 — 전 속성·등급 치료단 묶음(외상·독·화상·동상). elixirs.ts 의 실제 recipe id.
const WOUND_SET_RECIPES = [
  'geumchang-5', 'hwalhyeol-3', 'saengsa-1', // 외상(경상~치명)
  'haedok-3', 'mandok-bulchimdan', // 독(중급~치명)
  'cheongryang-4', 'ongno-dan', // 화상(중급~치명)
  'onyang-3', 'daeyang-singdan', // 동상(중급~치명)
];

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  // ─── 다이아 상점(프리미엄, 계정 단위) ───
  {
    id: 'divine-elixir-limited', shop: 'diamond', currency: 'diamond', price: 120, limited: true,
    title: '신품 영약 「구전대환단」 (한정)',
    desc: '화경의 벽을 넘는 신품 영약 1과. 사문당 1개만 살 수 있습니다. 화경엔 2과가 필요하니 나머지 1과는 직접 연단/획득해야 합니다.',
    grant: { kind: 'divine-limited' },
  },
  {
    id: 'scroll-baekdok-bulchim', shop: 'diamond', currency: 'diamond', price: 80,
    title: '비급 「백독불침공」',
    desc: '독을 다스리는 당가 비전 무공서. (그레이박스 샘플 — 판매 목록은 추후 확장, 업적 해금 전설 제외.)',
    grant: { kind: 'scroll', artId: 'dangga-baekdok-bulchim-gong' },
  },
  {
    id: 'character-dlc-placeholder', shop: 'diamond', currency: 'diamond', price: 100, comingSoon: true,
    title: '신규 제자 (준비 중)',
    desc: '시작 풀을 넓히는 추가 제자(직구매·가챠 없음). 출시 후 추가됩니다.',
    grant: { kind: 'character', poolId: '' },
  },
  // 특성 부여 — 다이아 결제(프리미엄). 제자 선택 후 면역 체질 부여(무공 없이). docs/50 §5.
  { id: 'trait-poison', shop: 'diamond', currency: 'diamond', price: 60, title: '특성 부여 — 만독불침', desc: '제자 한 명에게 독 면역 체질을 부여합니다(치명 중독까지).', grant: { kind: 'constitution', woundType: 'poison' } },
  { id: 'trait-burn', shop: 'diamond', currency: 'diamond', price: 60, title: '특성 부여 — 화염불침', desc: '제자 한 명에게 화상 면역 체질을 부여합니다.', grant: { kind: 'constitution', woundType: 'burn' } },
  { id: 'trait-frost', shop: 'diamond', currency: 'diamond', price: 60, title: '특성 부여 — 한서불침', desc: '제자 한 명에게 동상 면역 체질을 부여합니다.', grant: { kind: 'constitution', woundType: 'frost' } },
  { id: 'trait-wound', shop: 'diamond', currency: 'diamond', price: 80, title: '특성 부여 — 금강불괴', desc: '제자 한 명에게 외상 면역 체질을 부여합니다.', grant: { kind: 'constitution', woundType: 'wound' } },

  // ─── 사문 상점(골드, 사문 단위) ───
  {
    id: 'wound-elixir-set', shop: 'sect', currency: 'gold', price: 2400,
    title: '상처 영약 세트',
    desc: '외상·독·화상·동상을 두루 다스리는 치료단 묶음(치명상까지). 의뢰 부상에 대비.',
    grant: { kind: 'elixir-set', recipeIds: WOUND_SET_RECIPES },
  },
  {
    id: 'byeokgokdan-set', shop: 'sect', currency: 'gold', price: 300,
    title: '벽곡단 세트 (10과)',
    desc: '곡기를 끊고 폐관을 버티는 보급식. 장기 폐관·원정에.',
    grant: { kind: 'item', recipeId: 'byeokgokdan', qty: 10 },
  },
  {
    id: 'ansin-set', shop: 'sect', currency: 'gold', price: 900,
    title: '안신단 세트 (5과)',
    desc: '심마·주화입마를 가라앉힌다. 마공·상극흡수·고스트레스 빌드의 안전판.',
    grant: { kind: 'item', recipeId: 'ansin', qty: 5 },
  },
  // 재료 — 골드로 사서 직접 연단(신품 자작 경로). 가격은 materialPrice(단가표)×수량. docs/50 §3-B(일반·속성·진귀·신급).
  { id: 'mat-herb-common', shop: 'sect', currency: 'gold', price: 0, title: '흔한 약초 (×10)', desc: '기본 연단·치료 재료(벽곡단·금창약 등).', grant: { kind: 'material', materialId: 'herb-common', qty: 10 } },
  { id: 'mat-herb-fire', shop: 'sect', currency: 'gold', price: 0, title: '화속 영초 (×5)', desc: '화상 치료단 재료.', grant: { kind: 'material', materialId: 'herb-fire', qty: 5 } },
  { id: 'mat-herb-poison', shop: 'sect', currency: 'gold', price: 0, title: '해독초 (×5)', desc: '중독 치료단 재료.', grant: { kind: 'material', materialId: 'herb-poison', qty: 5 } },
  { id: 'mat-herb-cold', shop: 'sect', currency: 'gold', price: 0, title: '한설초 (×5)', desc: '동상 치료단 재료.', grant: { kind: 'material', materialId: 'herb-cold', qty: 5 } },
  { id: 'mat-herb-rare', shop: 'sect', currency: 'gold', price: 0, title: '진귀 영초 (×5)', desc: '상급 영단 재료.', grant: { kind: 'material', materialId: 'herb-rare', qty: 5 } },
  { id: 'mat-herb-divine', shop: 'sect', currency: 'gold', price: 0, title: '신품 영초 (×2)', desc: '신급 식물 — 구전대환단(신품 영약) 자작 재료.', grant: { kind: 'material', materialId: 'herb-divine', qty: 2 } },
  { id: 'mat-beast-essence', shop: 'sect', currency: 'gold', price: 0, title: '영물 정수 (×1)', desc: '영물에서 얻는 신급 정수 — 구전대환단 자작의 핵심 게이트.', grant: { kind: 'material', materialId: 'beast-essence', qty: 1 } },
  // 다이아 → 골드 환전
  {
    id: 'exchange-diamond-gold', shop: 'sect', currency: 'diamond', price: 10,
    title: '자금 보충 (다이아 → 골드)',
    desc: '다이아 10으로 사문 자금을 보충합니다.',
    grant: { kind: 'exchange', gold: 5000 },
  },
];

export function findProduct(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}

export function productsOfShop(shop: ShopId): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.shop === shop);
}
