// 속성 상처 — 의뢰 중 입는 상처는 속성(외상·화상·중독·동상·내상)과 심도(severity)를 갖는다.
// 치료엔 같은 속성 + 충분한 등급(grade ≤ severity) 영약이 필요하다(낮은 등급=강한 약). 등급이 모자라면
// 하급 영약 아무리 많아도 깊은 상처는 못 고친다. 영약이 없으면 daysRemaining 동안 자연 치유.
// docs/04 영약 · docs/08 의뢰 결과.

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

// 상처를 입힌다 — status='injured' + wound 세팅. 이미 다친 제자면 더 깊은 쪽(낮은 severity)으로 덮고
// 잔여일은 더 긴 쪽을 취한다(가벼운 상처가 중상을 덮어쓰지 않게).
export function inflictWound(discipleId: string, type: WoundType, severity: number, days: number): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  // 체질(불침) — 금강불괴(외상)·한서불침(동상)·화염불침(화상)·만독불침(중독)은 그 속성에 안 당한다.
  // 전투·의뢰·환경 상처가 전부 이 관문을 거쳐, 면역이면 상처 자체가 안 남는다(독지·설산에서도 멀쩡). docs/35 §6-1c.
  if (resistsWound(woundResistOf(d.martialArts)[type], severity)) return;
  const prev = d.wound;
  const next: Wound =
    prev && prev.severity <= severity
      ? { type: prev.type, severity: prev.severity, daysRemaining: Math.max(prev.daysRemaining, days) }
      : { type, severity, daysRemaining: days };
  ds.update(discipleId, { status: 'injured', wound: next, injuryDaysRemaining: next.daysRemaining });
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

// 영약으로 상처를 치료 — 매칭·보유 확인 후 1과 소모, 상처 해소·복귀. 성공 시 true.
export function healWound(discipleId: string, recipeId: string): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d || !d.wound) return false;
  const recipe = findElixirRecipe(recipeId);
  if (!recipe || !canHealWound(d.wound, recipe)) return false;
  if (!consumeElixirItem(recipeId, 1)) return false;
  ds.update(discipleId, { status: 'training', wound: undefined, injuryDaysRemaining: 0 });
  return true;
}

// 자연 치유 tick — 매일 1일. 0 이 되면 상처 해소·복귀. (영약 없이도 시간이 약.)
// R3(2026-06-14): **wound 가 있으면 status 무관하게 회복 진행**. 종전엔 status==='injured' 일 때만
// 줄여서, 다른 경로(탈진 healing override 만료 등)가 status 를 먼저 'training'으로 돌리면 상처가
// 영영 안 사라지고 박제됐다. 이제 wound 가 단일 진실 — 줄다 0이면 상처 해소.
export function tickWoundRecovery(): void {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || !d.wound) continue;
    const left = d.wound.daysRemaining - 1;
    if (left <= 0) {
      ds.update(id, { status: 'training', wound: undefined, injuryDaysRemaining: 0 });
    } else {
      // 상처가 남아 있으면 injured 유지(다른 경로가 training 으로 돌려놨어도 되돌림).
      ds.update(id, { status: 'injured', wound: { ...d.wound, daysRemaining: left }, injuryDaysRemaining: left });
    }
  }
}

// 다친 제자 목록(현재 상처 보유).
export function listWounded(): Disciple[] {
  const ds = useDiscipleStore.getState();
  return ds.order.map((id) => ds.disciples[id]).filter((d): d is Disciple => Boolean(d?.wound));
}
