// 연단(영단 제조) 시스템 — docs/04 영약 · docs/28 §5-1.
// 영약제조 제자가 ① 연단 비급으로 레시피를 익히고(배운 것만 제조), ② 재료를 모아,
// ③ 효과별 제조기간 동안 연단(제조=alchemy 경험), ④ 내공단은 복용 시 속성 매칭·흡수기간이 있다.
//
// Phase 1: 코어 프레임워크(레시피·재료·제조기간·XP·내공단 흡수). 상태는 회차 스코프 모듈 상태.
// Phase 2: 재료 의뢰 연계 + 속성 상처 매칭 + store/DB 영속.

import { findElixirRecipe, MATERIAL_LABEL, type ElixirRecipe } from '@/data/elixirs';
import { EFFICIENCY_MULTIPLIER } from '@/data/efficiency';
import { useAlchemyStore } from '@/stores/alchemyStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type { QiAttribute } from '@/types/disciple';

// ─── 연단실(사문 시설) ──────────────────────────────────────────────────────
// 연단을 하려면 사문에 연단실을 열어야 한다(건설비) + 유지비가 매일 자금에서 빠진다.
// (추후: 대장간 등 다른 공방도 같은 틀로.)
export const ALCHEMY_LAB_ID = 'alchemy-lab';
export const ALCHEMY_LAB_BUILD_COST = 3000;
export const ALCHEMY_LAB_UPKEEP_MONTHLY = 100; // 월 유지비(자금) — 미납 시 가동중지(economySystem 이 실제 사용)

// 유지비 납부 여부 — 미납이면 연단실 비가동(낼 때까지 제조 불가). economySystem 이 매월 갱신.
export function setLabOperational(on: boolean): void {
  useAlchemyStore.getState().setLabOp(on);
}
export function isLabOperational(): boolean {
  return useAlchemyStore.getState().labOperational;
}

export function hasAlchemyLab(): boolean {
  return (useSectStore.getState().sect?.facilities ?? []).some((f) => f.id === ALCHEMY_LAB_ID);
}
export function buildAlchemyLab(): boolean {
  const sect = useSectStore.getState();
  const s = sect.sect;
  if (!s || hasAlchemyLab() || s.resources < ALCHEMY_LAB_BUILD_COST) return false;
  sect.setSect({
    ...s,
    resources: s.resources - ALCHEMY_LAB_BUILD_COST,
    facilities: [...s.facilities, { id: ALCHEMY_LAB_ID, name: '연단실', level: 1, inUse: false }],
  });
  return true;
}

// 연단 상태(학습 레시피·진행 중 제조·첫 제조 이력·가동)는 useAlchemyStore(슬롯별 로컬 영속).
// 재료/영단은 itemStore, 연단실 시설은 sect — 모두 영속.

// 처음 제조 시 경험치 보너스 계수 — recipe.alchemyReq × 이 값 × 적성. 첫 제조가 큰 깨우침.
const FIRST_CRAFT_XP_K = 30;

export function resetAlchemy(): void {
  useAlchemyStore.getState().reset();
  // 재료/영단은 itemStore(아이템 슬라이스)가 회차 초기화.
}

// 영단 판매 — 자금 수입. 등급(req)·효과에 비례. (이번 밸런스 테스트에선 미사용.)
export function sellElixir(recipeId: string, qty: number): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0; // 음수·0 수량 차단(음수면 영단 획득+자금 조작 악용)
  const recipe = findElixirRecipe(recipeId);
  const items = useItemStore.getState();
  const owned = items.items.find((i) => i.id === recipeId);
  if (!recipe || !owned || owned.count < qty) return 0;
  const unit = Math.max(5, Math.round(recipe.alchemyReq * 1.5 + recipe.craftDays * 2));
  items.adjustCount(recipeId, -qty);
  const gain = unit * qty;
  useSectStore.getState().adjustResources(gain);
  return gain;
}

export function learnRecipe(id: string): void {
  if (findElixirRecipe(id)) useAlchemyStore.getState().learn(id);
}
export function hasLearned(id: string): boolean {
  return useAlchemyStore.getState().learnedRecipes.includes(id);
}
export function addMaterial(id: string, qty: number): void {
  useItemStore.getState().add({
    id,
    category: 'material',
    name: MATERIAL_LABEL[id] ?? id,
    grade: 0,
    count: qty,
    effects: '연단 재료(약초)',
  });
}
export function materialCount(id: string): number {
  return useItemStore.getState().items.find((i) => i.id === id)?.count ?? 0;
}

// itemStore 의 영단(아이템) 보유/소모 — 크래프트한 영단을 실제 게임에서 쓴다(생존·폐관 등).
export function elixirItemCount(id: string): number {
  return useItemStore.getState().items.find((i) => i.id === id)?.count ?? 0;
}
export function consumeElixirItem(id: string, n = 1): boolean {
  if (!Number.isFinite(n) || n <= 0) return false; // 음수·0 차단(음수면 소모가 아니라 획득이 됨)
  const items = useItemStore.getState();
  if ((items.items.find((i) => i.id === id)?.count ?? 0) < n) return false;
  items.adjustCount(id, -n);
  return true;
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
  if (!Number.isFinite(qty) || qty <= 0) return false; // 음수·0 차단(음수면 자금 증가+음수 재료 악용)
  const cost = (HERB_PRICE[id] ?? Infinity) * qty;
  const sect = useSectStore.getState();
  if (!sect.sect || sect.sect.resources < cost) return false;
  sect.adjustResources(-cost);
  addMaterial(id, qty);
  return true;
}
export function isCrafting(discipleId: string): boolean {
  return Boolean(useAlchemyStore.getState().activeCrafts[discipleId]);
}
export function listLearned(): string[] {
  return useAlchemyStore.getState().learnedRecipes;
}
export function listMaterials(): { id: string; qty: number }[] {
  return useItemStore
    .getState()
    .items.filter((i) => i.category === 'material')
    .map((i) => ({ id: i.id, qty: i.count }));
}
export function listActiveCrafts(): { discipleId: string; recipeId: string; until: number }[] {
  return Object.entries(useAlchemyStore.getState().activeCrafts).map(([discipleId, j]) => ({
    discipleId,
    recipeId: j.recipeId,
    until: j.until,
  }));
}
export function canCraft(discipleId: string, recipeId: string): boolean {
  const recipe = findElixirRecipe(recipeId);
  const a = useAlchemyStore.getState();
  if (!recipe || !hasAlchemyLab() || !a.labOperational || !a.learnedRecipes.includes(recipeId)) return false;
  if (a.activeCrafts[discipleId]) return false;
  const d = useDiscipleStore.getState().disciples[discipleId];
  if (!d || d.status !== 'training' || (d.stats?.alchemy?.level ?? 0) < recipe.alchemyReq) return false;
  return hasMaterials(recipe);
}

function hasMaterials(recipe: ElixirRecipe): boolean {
  return recipe.materials.every((m) => materialCount(m.id) >= m.qty);
}

// 제조 시작 — 조건: 연단실 + 배운 레시피(책) + alchemy 스탯 ≥ 요구 + 재료. 제자는 가용(training).
// 재료 소모, 효과별 제조기간 설정, 제자는 제조 기간 동안 'crafting'으로 점유(다른 작업 불가).
export function startCraft(discipleId: string, recipeId: string): boolean {
  const a = useAlchemyStore.getState();
  if (!hasAlchemyLab() || !a.labOperational) return false; // 연단실 + 유지비 납부(가동) 필요
  const recipe = findElixirRecipe(recipeId);
  if (!recipe || !a.learnedRecipes.includes(recipeId)) return false; // 책에 배운 레시피만
  if (a.activeCrafts[discipleId]) return false; // 이미 연단 중
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d || d.status !== 'training') return false; // 가용한 제자만
  if ((d.stats?.alchemy?.level ?? 0) < recipe.alchemyReq) return false; // 스탯 제한
  if (!hasMaterials(recipe)) return false; // 재료
  for (const m of recipe.materials) useItemStore.getState().adjustCount(m.id, -m.qty);
  const today = useTimeStore.getState().totalDay;
  a.setCraft(discipleId, { recipeId, until: today + recipe.craftDays });
  ds.update(discipleId, { status: 'crafting' }); // 제조 기간 동안 점유
  return true;
}

// 매일 — 제조 완료 처리. 완성 영단을 itemStore 적재 + 제조자 alchemy XP(제조=수련, 기간↑일수록 큼).
export function tickCraft(): void {
  const today = useTimeStore.getState().totalDay;
  const ds = useDiscipleStore.getState();
  const a = useAlchemyStore.getState();
  for (const [crafterId, job] of Object.entries(a.activeCrafts)) {
    if (today < job.until) continue;
    const recipe = findElixirRecipe(job.recipeId);
    a.clearCraft(crafterId);
    const crafter = ds.disciples[crafterId];
    if (crafter && crafter.status === 'crafting') ds.update(crafterId, { status: 'training' }); // 점유 해제
    if (!recipe) continue;
    useItemStore.getState().add({
      id: recipe.id,
      category: 'elixir',
      name: recipe.name,
      grade: recipe.grade ?? 0,
      count: 1,
      effects: recipe.effect,
    });
    // 제조 경험 — 적성 반영(특화 1.0 ~ 상극 0.04). **처음 만든 영단은 큰 보너스**(깨우침).
    const apt =
      EFFICIENCY_MULTIPLIER[(crafter?.efficiency as Record<string, never> | undefined)?.alchemy ?? '보통'] ?? 0.35;
    const key = `${crafterId}:${recipe.id}`;
    let xp = Math.max(2, recipe.craftDays) * apt; // 반복 제조 — 적성 반영
    if (!a.firstCrafted.includes(key)) {
      a.markFirst(key);
      xp += recipe.alchemyReq * FIRST_CRAFT_XP_K * apt; // 처음 제조 보너스(등급↑·적성↑일수록 큼)
    }
    ds.addStatExp(crafterId, 'alchemy', Math.max(1, Math.round(xp)));
  }
}

// 속성 흡수 효율 — 같은 속성(또는 무속성)=완전, 불일치=저하. 상극 흡수 중 심마 누적은 simmaSystem.tickSimma 가
// elixirAbsorb.attribute≠qiAttribute 로 매일 가산(이질적 진기 강제 → 주화입마 위험). docs/13 §심마.
function absorbFactor(disciple: QiAttribute | undefined, elixir: QiAttribute | undefined): number {
  if (!elixir) return 1;
  if (!disciple || disciple === elixir) return 1;
  return 0.6;
}

// 약발 내성 — 내공단을 거듭 복용하면 몸이 약기운에 무뎌진다(도배로 내공 기둥 무력화 방지,
// 정통무협 결: 영약은 기연이지 식량이 아니다). n번째 복용 효과 = ×DECAY^n (바닥 FLOOR).
// 회차 내 누적. ✅ 도입 2026-06-12(시뮬: 내공단 도배 시 내공 12,000 — 요구 9배 인플레). 🔧 그레이박스.
const DAN_TOLERANCE_DECAY = 0.8;
const DAN_TOLERANCE_FLOOR = 0.2;

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
  const tolerance = Math.max(DAN_TOLERANCE_FLOOR, DAN_TOLERANCE_DECAY ** (d.danTolerance ?? 0));
  const total = (recipe.internalAmount ?? 0) * absorbFactor(d.qiAttribute, recipe.attribute) * tolerance;
  ds.update(discipleId, {
    danTolerance: (d.danTolerance ?? 0) + 1,
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
