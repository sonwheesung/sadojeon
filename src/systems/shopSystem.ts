// 상점 구매 — 단일 seam. 통화 차감 + 지급을 한 곳에서 분기([feedback_solid_decoupling]). 정본 docs/50.
// 재료는 기존 경제 seam(alchemySystem.buyMaterial) 재사용, 그 외는 여기서 결제+지급.

import { findProduct, type ShopProduct } from '@/data/shop';
import { findElixirRecipe, elixirRecipeToItem, divineElixirItem } from '@/data/elixirs';
import { buyMaterial, materialPrice } from '@/systems/alchemySystem';
import { useCodexStore } from '@/stores/codexStore';
import { useGameStore } from '@/stores/gameStore';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { useShopStore } from '@/stores/shopStore';
import { useTimeStore } from '@/stores/timeStore';

export type PurchaseResult = 'ok' | 'insufficient' | 'sold-out' | 'coming-soon' | 'unavailable';

// 표시 단가 — material 은 단가표(materialPrice)×수량, 그 외는 product.price.
export function priceOf(p: ShopProduct): number {
  if (p.grant.kind === 'material') return materialPrice(p.grant.materialId) * p.grant.qty;
  return p.price;
}

// 한정 상품(신품) 매진 여부 — 사문별 1개(shopStore, 슬롯 단위).
export function isSoldOut(p: ShopProduct): boolean {
  return Boolean(p.limited) && useShopStore.getState().isLimitedBought(p.id);
}

export function canAfford(p: ShopProduct): boolean {
  const price = priceOf(p);
  if (p.currency === 'diamond') return useGameStore.getState().diamonds >= price;
  return (useSectStore.getState().sect?.resources ?? 0) >= price;
}

function grant(p: ShopProduct): void {
  const items = useItemStore.getState();
  const g = p.grant;
  switch (g.kind) {
    case 'elixir-set':
      for (const id of g.recipeIds) {
        const r = findElixirRecipe(id);
        if (r) items.add(elixirRecipeToItem(r, 1));
      }
      break;
    case 'item': {
      const r = findElixirRecipe(g.recipeId);
      if (r) items.add(elixirRecipeToItem(r, g.qty));
      break;
    }
    case 'divine-limited':
      items.add(divineElixirItem());
      break;
    case 'exchange':
      useSectStore.getState().adjustResources(g.gold);
      break;
    case 'scroll':
      if (!useCodexStore.getState().hasScroll(g.artId)) {
        useCodexStore.getState().addScroll({
          artId: g.artId,
          acquiredAtRun: 1,
          acquiredAtDay: useTimeStore.getState().totalDay,
          status: 'complete', // 산 비급은 손에 쥐어 준다(바로 가르침 가능) — P2W 방향(docs/11).
          researchProgress: 100,
          isTrap: false,
          isIncomplete: false,
        });
      }
      break;
    // material → purchase()에서 buyMaterial 로 일체 처리(여기 도달 X).
    // constitution·character → comingSoon 으로 purchase()에서 차단(지급 경로 미구현, docs/50 §5·§9).
  }
}

export function purchase(productId: string): PurchaseResult {
  const p = findProduct(productId);
  if (!p) return 'unavailable';
  if (p.comingSoon) return 'coming-soon';
  if (isSoldOut(p)) return 'sold-out';

  // 재료 — 기존 경제 seam 재사용(자금 확인+차감+지급 일체).
  if (p.grant.kind === 'material') {
    return buyMaterial(p.grant.materialId, p.grant.qty) ? 'ok' : 'insufficient';
  }

  // 결제(통화 차감)
  const price = priceOf(p);
  if (p.currency === 'diamond') {
    if (!useGameStore.getState().spendDiamonds(price)) return 'insufficient';
  } else {
    const sect = useSectStore.getState();
    if (!sect.sect || sect.sect.resources < price) return 'insufficient';
    sect.adjustResources(-price);
  }

  grant(p);
  if (p.limited) useShopStore.getState().markLimited(p.id);
  return 'ok';
}
