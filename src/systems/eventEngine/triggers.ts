// 트리거 — 후보 제자 × 템플릿 쌍 수집 + tier 가중치 픽.
// 도메인별 풀과 무관하게 동작. moralEventSystem.ts 의 collectEligible/pickByTier 일반화.

import { random } from '@/systems/rng';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  Disciple,
  EventTemplate,
  EventTier,
  PersonaMap,
  PersonalityTraits,
} from '@/types';

// ─── Eligibility ────────────────────────────────────────────────────────────

function isActive(d: Disciple): boolean {
  return d.status === 'training' || d.status === 'resting' || d.status === 'meditating';
}

function meetsFloor(d: Disciple, req?: PersonaMap): boolean {
  if (!req) return true;
  for (const k of Object.keys(req) as (keyof PersonalityTraits)[]) {
    const v = req[k];
    if (v == null) continue;
    if (d.personality[k] < v) return false;
  }
  return true;
}

function meetsCeiling(d: Disciple, forb?: PersonaMap): boolean {
  if (!forb) return true;
  for (const k of Object.keys(forb) as (keyof PersonalityTraits)[]) {
    const v = forb[k];
    if (v == null) continue;
    if (d.personality[k] > v) return false;
  }
  return true;
}

function yearsInSect(d: Disciple): number {
  const current = useTimeStore.getState().current.year;
  return Math.max(1, current - d.entryYear + 1);
}

function passesAtmosphere(
  req: EventTemplate<string>['trigger']['requireAtmosphere'],
): boolean {
  if (!req) return true;
  const a = useSectAtmosphereStore.getState().atmosphere;
  if (req.righteousnessMin != null && a.righteousness < req.righteousnessMin) return false;
  if (req.righteousnessMax != null && a.righteousness > req.righteousnessMax) return false;
  if (req.unityMin != null && a.unity < req.unityMin) return false;
  if (req.unityMax != null && a.unity > req.unityMax) return false;
  return true;
}

export function passesTrigger<TTone extends string>(
  d: Disciple,
  tmpl: EventTemplate<TTone>,
  allDiscipleIds: ReadonlySet<string>,
): boolean {
  // 선택지 미작성(스캐폴드) 이벤트는 발화 대상에서 제외 — 빈 모달 방지.
  if (tmpl.choices.length === 0) return false;
  const t = tmpl.trigger;
  if (t.onlyForDiscipleId && d.id !== t.onlyForDiscipleId) return false;
  if (t.requireSiblingId && !allDiscipleIds.has(t.requireSiblingId)) return false;
  if (t.requireSiblingId && t.requireSiblingId === d.id) return false;
  if (t.requireMinDarkness != null && d.darknessLevel < t.requireMinDarkness) return false;
  if (t.minYearInSect != null && yearsInSect(d) < t.minYearInSect) return false;
  if (t.maxYearInSect != null && yearsInSect(d) > t.maxYearInSect) return false;
  if (!meetsFloor(d, t.requirePersonality)) return false;
  if (!meetsCeiling(d, t.forbidPersonality)) return false;
  if (!passesAtmosphere(t.requireAtmosphere)) return false;
  return true;
}

export interface EligiblePair<TTone extends string = string> {
  disciple: Disciple;
  template: EventTemplate<TTone>;
}

export function collectEligible<TTone extends string>(
  templates: ReadonlyArray<EventTemplate<TTone>>,
): EligiblePair<TTone>[] {
  const ds = useDiscipleStore.getState();
  const allIds = new Set(ds.order);
  const out: EligiblePair<TTone>[] = [];
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d) continue;
    if (!isActive(d)) continue;
    for (const tmpl of templates) {
      if (passesTrigger(d, tmpl, allIds)) {
        out.push({ disciple: d, template: tmpl });
      }
    }
  }
  return out;
}

// ─── Weighted pick ──────────────────────────────────────────────────────────

export function weightedPick<T>(items: T[], weights: number[]): T | null {
  if (items.length === 0) return null;
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return items[0];
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function pickByTier<TTone extends string>(
  pairs: EligiblePair<TTone>[],
  tierWeight: Record<EventTier, number>,
): EligiblePair<TTone> | null {
  if (pairs.length === 0) return null;
  const byTier: Record<EventTier, EligiblePair<TTone>[]> = {
    universal: [],
    archetype: [],
    personal: [],
  };
  for (const p of pairs) byTier[p.template.tier].push(p);

  const tiers = (Object.keys(byTier) as EventTier[]).filter((t) => byTier[t].length > 0);
  if (tiers.length === 0) return null;
  const tier = weightedPick(tiers, tiers.map((t) => tierWeight[t]));
  if (!tier) return null;

  const tierPairs = byTier[tier];
  return weightedPick(tierPairs, tierPairs.map((p) => p.template.trigger.weight));
}
