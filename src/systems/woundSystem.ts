// 속성 상처 — 의뢰 중 입는 상처는 속성(외상·화상·중독·동상·내상)과 심도(severity)를 갖는다.
// 치료엔 같은 속성 + 충분한 등급(grade ≤ severity) 영약이 필요하다(낮은 등급=강한 약). 등급이 모자라면
// 하급 영약 아무리 많아도 깊은 상처는 못 고친다. 영약이 없으면 daysRemaining 동안 자연 치유.
//
// 다중 상처(2026-06-15): 상처는 **속성별로 1개씩 동시 보유**한다(최대 5개). 검상 치명상 + 독에 동시에
// 당하면 외상·중독이 따로 남아 각각 해당 속성 영약으로 치료해야 한다. 같은 속성 상처가 또 들어오면 더 깊은
// (낮은 severity) 쪽으로 합치고 잔여일은 긴 쪽을 취한다. docs/04 영약 · docs/08 의뢰 결과 · docs/37 §C.

import { ELIXIR_RECIPES, findElixirRecipe, type ElixirRecipe } from '@/data/elixirs';
import { woundResistOf, resistsWound } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple, Wound, WoundType } from '@/types/disciple';
import { consumeElixirItem, elixirItemCount } from './alchemySystem';

export const WOUND_TYPE_LABEL: Record<WoundType, string> = {
  wound: '외상',
  burn: '화상',
  poison: '중독',
  frost: '동상',
  inner: '내상',
};

// 심도(severity) 라벨 — 1=가장 깊음 ~ 5=경미.
const SEVERITY_LABEL: Record<number, string> = {
  1: '치명상',
  2: '중상',
  3: '부상',
  4: '경상',
  5: '찰과상',
};

export function severityLabel(severity: number): string {
  return SEVERITY_LABEL[severity] ?? `${severity}도`;
}

// 상처 한 줄 라벨 — "독·치명상" 식.
export function woundLabel(wound: Wound): string {
  return `${WOUND_TYPE_LABEL[wound.type]}·${severityLabel(wound.severity)}`;
}

// 여러 상처 한 줄 라벨 — "외상·치명상 / 중독·중상" 식(깊은 순). 빈 배열이면 ''.
export function woundsLabel(wounds: Wound[]): string {
  return [...wounds]
    .sort((a, b) => a.severity - b.severity)
    .map(woundLabel)
    .join(' / ');
}

// 제자의 상처 목록(없으면 빈 배열).
export function woundsOf(d: Disciple): Wound[] {
  return d.wounds ?? [];
}

// 상처가 하나라도 있는가.
export function hasWound(d: Disciple): boolean {
  return (d.wounds?.length ?? 0) > 0;
}

// 가장 깊은 상처(같으면 잔여일 긴 쪽) — 전투 export·대표 라벨용. 없으면 undefined.
export function worstWound(d: Disciple): Wound | undefined {
  const ws = d.wounds;
  if (!ws || ws.length === 0) return undefined;
  return ws.reduce((a, b) =>
    b.severity < a.severity || (b.severity === a.severity && b.daysRemaining > a.daysRemaining) ? b : a,
  );
}

// 상처 묶음의 레거시 잔여일(가장 긴 것) — injuryDaysRemaining 동기화용.
function maxDays(wounds: Wound[]): number {
  return wounds.reduce((m, w) => Math.max(m, w.daysRemaining), 0);
}

// 상처 묶음을 제자에 반영 — 비었으면 회복(training), 남았으면 injured 유지 + 레거시 잔여일 동기화.
// 남은 상처가 있으면 status 를 injured 로 강제(다른 경로가 training 으로 돌려놨어도 되돌림 — R3).
function applyWoundSet(discipleId: string, wounds: Wound[]): void {
  const ds = useDiscipleStore.getState();
  if (wounds.length === 0) {
    ds.update(discipleId, { status: 'training', wounds: undefined, injuryDaysRemaining: 0 });
  } else {
    ds.update(discipleId, { status: 'injured', wounds, injuryDaysRemaining: maxDays(wounds) });
  }
}

// 상처를 입힌다 — 속성별로 1개씩 누적. 같은 속성이 이미 있으면 더 깊은(낮은 severity) 쪽 + 잔여일 긴 쪽으로
// 합치고, 다른 속성이면 새 상처로 추가한다(검상 + 독이 따로 남음). status='injured'.
export function inflictWound(discipleId: string, type: WoundType, severity: number, days: number): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  // 체질(불침) — 금강불괴(외상)·한서불침(동상)·화염불침(화상)·만독불침(중독)은 그 속성에 안 당한다.
  // 전투·의뢰·환경 상처가 전부 이 관문을 거쳐, 면역이면 상처 자체가 안 남는다(독지·설산에서도 멀쩡). docs/35 §6-1c.
  if (resistsWound(woundResistOf(d.martialArts)[type], severity)) return;
  const wounds = [...(d.wounds ?? [])];
  const idx = wounds.findIndex((w) => w.type === type);
  if (idx >= 0) {
    // 같은 속성 — 더 깊은 쪽(낮은 severity) + 잔여일 긴 쪽. 가벼운 상처가 중상을 덮어쓰지 않게.
    const prev = wounds[idx];
    wounds[idx] = {
      type,
      severity: Math.min(prev.severity, severity),
      daysRemaining: Math.max(prev.daysRemaining, days),
    };
  } else {
    wounds.push({ type, severity, daysRemaining: days });
  }
  applyWoundSet(discipleId, wounds);
}

// 특정 속성 상처만 제거(안신단의 내상 진정 등 — 다른 속성 상처는 그대로 둔다). 제거됐으면 true.
export function clearWoundType(discipleId: string, type: WoundType): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d || !d.wounds?.length) return false;
  const rest = d.wounds.filter((w) => w.type !== type);
  if (rest.length === d.wounds.length) return false;
  applyWoundSet(discipleId, rest);
  return true;
}

// 이 영약(레시피)으로 이 상처를 고칠 수 있는가 — 같은 속성 + 등급 ≤ 심도.
export function canHealWound(wound: Wound, recipe: ElixirRecipe): boolean {
  if (recipe.category !== 'heal' || recipe.woundType !== wound.type) return false;
  return (recipe.grade ?? 5) <= wound.severity;
}

// 보유 영약 중 이 상처를 고칠 수 있는 것들 — 가장 약한(등급 큰) 것부터(아끼는 쪽).
export function treatableElixirsFor(wound: Wound): ElixirRecipe[] {
  return ELIXIR_RECIPES.filter(
    (r) => canHealWound(wound, r) && elixirItemCount(r.id) > 0,
  ).sort((a, b) => (b.grade ?? 5) - (a.grade ?? 5));
}

// 영약으로 상처를 치료 — 이 영약이 고칠 수 있는 상처 하나를 찾아 제거, 1과 소모. 그 속성만 낫고 다른 속성
// 상처는 그대로 남는다(외상약은 독을 못 고침). 남은 상처가 없으면 복귀. 성공 시 true.
export function healWound(discipleId: string, recipeId: string): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d || !d.wounds?.length) return false;
  const recipe = findElixirRecipe(recipeId);
  if (!recipe) return false;
  const idx = d.wounds.findIndex((w) => canHealWound(w, recipe));
  if (idx < 0) return false;
  if (!consumeElixirItem(recipeId, 1)) return false;
  applyWoundSet(discipleId, d.wounds.filter((_, i) => i !== idx));
  return true;
}

// 자연 치유 tick — 매일 각 상처 잔여일 1 차감, 0 이 된 상처만 해소. (영약 없이도 시간이 약.)
// R3(2026-06-14): **wounds 가 있으면 status 무관하게 회복 진행**. 종전엔 status==='injured' 일 때만
// 줄여서, 다른 경로(탈진 healing override 만료 등)가 status 를 먼저 'training'으로 돌리면 상처가
// 영영 안 사라지고 박제됐다. 이제 wounds 가 단일 진실 — 각 상처가 줄다 0이면 그 상처만 해소.
export function tickWoundRecovery(): void {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || !d.wounds?.length) continue;
    const next = d.wounds
      .map((w) => ({ ...w, daysRemaining: w.daysRemaining - 1 }))
      .filter((w) => w.daysRemaining > 0);
    applyWoundSet(id, next);
  }
}

// 다친 제자 목록(현재 상처 1개+ 보유).
export function listWounded(): Disciple[] {
  const ds = useDiscipleStore.getState();
  return ds.order.map((id) => ds.disciples[id]).filter((d): d is Disciple => hasWound(d));
}
