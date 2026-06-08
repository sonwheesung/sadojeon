// 연단(영단 제조) 시스템 — docs/04 영약 · docs/28 §5-1.
// 영약제조 제자가 ① 연단 비급으로 레시피를 익히고(배운 것만 제조), ② 재료를 모아,
// ③ 효과별 제조기간 동안 연단(제조=alchemy 경험), ④ 내공단은 복용 시 속성 매칭·흡수기간이 있다.
//
// Phase 1: 코어 프레임워크(레시피·재료·제조기간·XP·내공단 흡수). 상태는 회차 스코프 모듈 상태.
// Phase 2: 재료 의뢰 연계 + 속성 상처 매칭 + store/DB 영속.

import { findElixirRecipe, type ElixirRecipe } from '@/data/elixirs';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type { QiAttribute } from '@/types/disciple';

// 회차 스코프 상태 — 학습 레시피 / 재료 / 진행 중 제조(제조자별).
const learnedRecipes = new Set<string>();
const materials: Record<string, number> = {};
const activeCrafts: Record<string, { recipeId: string; until: number }> = {};

export function resetAlchemy(): void {
  learnedRecipes.clear();
  for (const k of Object.keys(materials)) delete materials[k];
  for (const k of Object.keys(activeCrafts)) delete activeCrafts[k];
}

export function learnRecipe(id: string): void {
  if (findElixirRecipe(id)) learnedRecipes.add(id);
}
export function hasLearned(id: string): boolean {
  return learnedRecipes.has(id);
}
export function addMaterial(id: string, qty: number): void {
  materials[id] = (materials[id] ?? 0) + qty;
}
export function materialCount(id: string): number {
  return materials[id] ?? 0;
}

// 마을 구매 — 약초를 게임머니(사문 자금)로 산다. 진귀할수록 비쌈. 자금 부족이면 false.
const HERB_PRICE: Record<string, number> = {
  'herb-common': 3,
  'herb-fire': 9,
  'herb-poison': 9,
  'herb-cold': 9,
  'herb-rare': 28,
  'herb-divine': 130,
};
export function buyMaterial(id: string, qty: number): boolean {
  const cost = (HERB_PRICE[id] ?? Infinity) * qty;
  const sect = useSectStore.getState();
  if (!sect.sect || sect.sect.resources < cost) return false;
  sect.adjustResources(-cost);
  addMaterial(id, qty);
  return true;
}
export function isCrafting(discipleId: string): boolean {
  return Boolean(activeCrafts[discipleId]);
}

function hasMaterials(recipe: ElixirRecipe): boolean {
  return recipe.materials.every((m) => (materials[m.id] ?? 0) >= m.qty);
}

// 제조 시작 — 배운 레시피 + alchemy Lv + 재료 + 제조중 아님. 재료 소모, 효과별 제조기간 설정.
export function startCraft(discipleId: string, recipeId: string): boolean {
  const recipe = findElixirRecipe(recipeId);
  if (!recipe || !learnedRecipes.has(recipeId)) return false;
  if (activeCrafts[discipleId]) return false; // 이미 연단 중
  const d = useDiscipleStore.getState().disciples[discipleId];
  if (!d || (d.stats?.alchemy?.level ?? 0) < recipe.alchemyReq) return false;
  if (!hasMaterials(recipe)) return false;
  for (const m of recipe.materials) materials[m.id] -= m.qty;
  const today = useTimeStore.getState().totalDay;
  activeCrafts[discipleId] = { recipeId, until: today + recipe.craftDays };
  return true;
}

// 매일 — 제조 완료 처리. 완성 영단을 itemStore 적재 + 제조자 alchemy XP(제조=수련, 기간↑일수록 큼).
export function tickCraft(): void {
  const today = useTimeStore.getState().totalDay;
  const ds = useDiscipleStore.getState();
  for (const [crafterId, job] of Object.entries(activeCrafts)) {
    if (today < job.until) continue;
    const recipe = findElixirRecipe(job.recipeId);
    delete activeCrafts[crafterId];
    if (!recipe) continue;
    useItemStore.getState().add({
      id: recipe.id,
      category: 'elixir',
      name: recipe.name,
      grade: recipe.grade ?? 0,
      count: 1,
      effects: recipe.effect,
    });
    ds.addStatExp(crafterId, 'alchemy', Math.max(2, recipe.craftDays));
  }
}

// 속성 흡수 효율 — 같은 속성(또는 무속성)=완전, 불일치=저하. (Phase 2: 오행 상생상극·심마 위험)
function absorbFactor(disciple: QiAttribute | undefined, elixir: QiAttribute | undefined): number {
  if (!elixir) return 1;
  if (!disciple || disciple === elixir) return 1;
  return 0.6;
}

// 내공단 복용 — 흡수 중이면 불가(false). 속성 매칭으로 흡수량 차등, absorbDays 동안 매일 흡수.
export function consumeInternalElixir(discipleId: string, recipeId: string): boolean {
  const recipe = findElixirRecipe(recipeId);
  if (!recipe || recipe.category !== 'internal' || !recipe.absorbDays) return false;
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;
  const today = useTimeStore.getState().totalDay;
  if (d.elixirAbsorb && today < d.elixirAbsorb.until) return false; // 흡수 중 — 다른 영단 복용 불가
  const items = useItemStore.getState();
  if (!items.items.find((i) => i.id === recipeId && i.count > 0)) return false;
  items.adjustCount(recipeId, -1);
  const total = (recipe.internalAmount ?? 0) * absorbFactor(d.qiAttribute, recipe.attribute);
  ds.update(discipleId, {
    elixirAbsorb: { until: today + recipe.absorbDays, perDay: total / recipe.absorbDays, attribute: recipe.attribute },
  });
  return true;
}

// 매일 — 흡수 중 제자에게 내공 perDay 적립. 만료 시 흡수 상태 해제.
export function tickElixirAbsorb(): void {
  const today = useTimeStore.getState().totalDay;
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d?.elixirAbsorb) continue;
    const base = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
    const internal = Math.round(base.internal + d.elixirAbsorb.perDay);
    const done = today >= d.elixirAbsorb.until;
    ds.update(id, {
      realmProgress: { ...base, internal },
      ...(done ? { elixirAbsorb: undefined } : {}),
    });
  }
}
