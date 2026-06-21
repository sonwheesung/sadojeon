// 영약 시스템 — 신품 영약(화경 열쇠)의 보유·소모·획득. docs/28 §5-1 · docs/23 §6.
// 획득: 최고난도 의뢰 드랍(운, questSystem) 또는 과금(purchaseDivineElixir — BM 훅).
// 소모: 화경 깨달음 벽에서 1개 소모(trainingSystem.applyRealmTick).

import { josa } from '@/utils/korean';
import { useItemStore } from '@/stores/itemStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { DIVINE_ELIXIR_ID, divineElixirItem, findElixirRecipe } from '@/data/elixirs';

// 신품 영약 제련 — 영약제조(alchemy) 이 경지에 닿은 제자가 신품 영약을 빚는다. docs/28 §5-1.
// 무과금 화경 경로: 의뢰 드랍(운) 외에, 영약제조 특화 제자를 키우면 제련으로 확보.
export const CRAFT_ALCHEMY_MIN = 35;

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

// 매년 제련 — 영약제조(alchemy) ≥ CRAFT_ALCHEMY_MIN 제자가 신품 영약을 빚는다.
// ⚠️ **신급 재료(영물 정수·신품 영초)를 반드시 소모**한다 — 숙련만으로 공짜 지급하면 신급 재료 회차당 상한
// (영물 정수 1·신품 영초 2/회차)이 무의미해져 무과금 화경이 안 잡힌다(2026-06-21 발견·수정: 종전엔 재료 없이
// 연 1~3과 공짜 지급 → 화경 게이트 우회). 재료 있을 때만, 있는 만큼만 빚는다(연 상한 = 숙련). docs/40 §3-B.
export function tickElixirCraft(): void {
  const ds = useDiscipleStore.getState();
  const crafter = ds.order
    .map((id) => ds.disciples[id])
    .find(
      (d) =>
        d &&
        d.status !== 'graduated' &&
        d.status !== 'departed' &&
        (d.stats?.alchemy?.level ?? 0) >= CRAFT_ALCHEMY_MIN,
    );
  if (!crafter) return;
  const lv = crafter.stats?.alchemy?.level ?? 0;
  const want = lv >= 85 ? 3 : lv >= 60 ? 2 : 1; // 연 제련 상한(숙련) — 단, 재료가 받쳐줘야 실제 제련.
  const recipe = findElixirRecipe(DIVINE_ELIXIR_ID);
  if (!recipe) return;
  const matCount = (id: string) =>
    useItemStore.getState().items.find((i) => i.id === id)?.count ?? 0;
  let made = 0;
  for (let i = 0; i < want; i += 1) {
    if (!recipe.materials.every((m) => matCount(m.id) >= m.qty)) break; // 신급 재료 부족 → 제련 중단
    for (const m of recipe.materials) useItemStore.getState().adjustCount(m.id, -m.qty);
    grantDivineElixir();
    made += 1;
  }
  if (made === 0) return; // 재료 없으면 제련 없음(신급 재료 게이트 — 무한 공급 차단)
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `craft-${day}`,
    kind: 'report',
    title: `${crafter.name} — 신품 영약 제련 (${made}과)`,
    preview: `${josa(crafter.name, '이', '가')} 한 해의 연단 끝에 신품 영약 구전대환단 ${made}과를 빚어냈다.`,
    body: `${josa(crafter.name, '이', '가')} 영약제조의 묘리가 깊어져, 모아둔 신급 재료(영물 정수·신품 영초)로 한 해의 연단 끝에 **구전대환단 ${made}과**를 빚어냈다. 화경의 벽 앞에 선 동문이 폐관 중 복용하면 그 벽을 넘을 수 있다.`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}
