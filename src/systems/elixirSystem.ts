// 영약 시스템 — 신품 영약(화경 열쇠)의 보유·소모·획득. docs/28 §5-1 · docs/23 §6.
// 획득: 최고난도 의뢰 드랍(운, questSystem) 또는 과금(purchaseDivineElixir — BM 훅).
// 소모: 화경 깨달음 벽에서 1개 소모(trainingSystem.applyRealmTick).

import { useItemStore } from '@/stores/itemStore';
import { DIVINE_ELIXIR_ID, divineElixirItem } from '@/data/elixirs';

// 사문이 신품 영약을 보유 중인가.
export function hasDivineElixir(): boolean {
  return useItemStore.getState().items.some((i) => i.id === DIVINE_ELIXIR_ID && i.count > 0);
}

// 신품 영약 1개 소모(있으면 true). 화경 돌파 시 호출.
export function consumeDivineElixir(): boolean {
  const store = useItemStore.getState();
  const it = store.items.find((i) => i.id === DIVINE_ELIXIR_ID && i.count > 0);
  if (!it) return false;
  store.adjustCount(DIVINE_ELIXIR_ID, -1);
  return true;
}

// 신품 영약 지급 — 의뢰 드랍·과금 공용.
export function grantDivineElixir(): void {
  useItemStore.getState().add(divineElixirItem());
}

// 과금 직구매 훅(BM) — 후속 상점/IAP에서 호출. 현재는 지급만(결제 연동은 [11 BM]). docs/28 §5-1.
export function purchaseDivineElixir(): void {
  grantDivineElixir();
}
