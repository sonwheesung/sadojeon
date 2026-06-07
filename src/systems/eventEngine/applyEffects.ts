// 4층 효과 적용 — moralEventSystem.ts 의 apply 함수들을 일반화·이동.
// 가해자 ① / 사부 ② / 사문 분위기 ③ / 타 제자 cascade ④.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useMasterStore } from '@/stores/masterStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import type {
  CascadeEffect,
  Disciple,
  EventEffects,
  LegacyPersonalityAxis,
  LegacyPersonalityMap,
  MasterEffect,
  PerpetratorEffect,
  PersonalityTraits,
} from '@/types';
import { applyLegacyShift, legacyAxisValue } from './personalityCompat';
import { applyAlignmentReputation } from '../reputationSystem';

const DARKNESS_RISK_ORDER: readonly Disciple['darknessRisk'][] = [
  'low',
  'medium',
  'high',
];

function bumpDarknessRisk(
  current: Disciple['darknessRisk'],
  bump: number,
): Disciple['darknessRisk'] {
  if (bump === 0) return current;
  const idx = DARKNESS_RISK_ORDER.indexOf(current);
  if (bump >= 3) return DARKNESS_RISK_ORDER[Math.min(2, idx + 1)];
  if (bump <= -3) return DARKNESS_RISK_ORDER[Math.max(0, idx - 1)];
  return current;
}

function interpolate(text: string, perp: string, sib?: string): string {
  return text
    .replace(/\{name\}/g, perp)
    .replace(/\{sibling\}/g, sib ?? '동문');
}

function isActive(d: Disciple): boolean {
  return d.status === 'training' || d.status === 'resting' || d.status === 'meditating';
}

function meetsFloor(d: Disciple, req?: LegacyPersonalityMap): boolean {
  if (!req) return true;
  for (const k of Object.keys(req) as LegacyPersonalityAxis[]) {
    const v = req[k];
    if (v == null) continue;
    if (legacyAxisValue(d.personality, k) < v) return false;
  }
  return true;
}

function meetsCeiling(d: Disciple, forb?: LegacyPersonalityMap): boolean {
  if (!forb) return true;
  for (const k of Object.keys(forb) as LegacyPersonalityAxis[]) {
    const v = forb[k];
    if (v == null) continue;
    if (legacyAxisValue(d.personality, k) > v) return false;
  }
  return true;
}

function isFriend(other: Disciple, perpId: string): boolean {
  const lvl = other.relationships[perpId];
  return lvl === 'friend' || lvl === 'sworn';
}

function isEnemy(other: Disciple, perpId: string): boolean {
  return other.relationships[perpId] === 'enemy';
}

// ─── 효과 적용 함수 ────────────────────────────────────────────────────────

function applyPerpetratorEffect(
  perpId: string,
  eff: PerpetratorEffect,
  perpName: string,
  siblingName?: string,
): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[perpId];
  if (!d) return;

  if (eff.trustDelta) ds.adjustTrust(perpId, eff.trustDelta);
  if (eff.staminaDelta) ds.adjustStamina(perpId, eff.staminaDelta);

  const patch: Partial<Disciple> = {};
  if (eff.darknessLevelBump) {
    patch.darknessLevel = Math.max(
      0,
      Math.min(4, d.darknessLevel + eff.darknessLevelBump),
    ) as Disciple['darknessLevel'];
    // 흑화 진행 → 정파 문파 평판↓·사파↑(그 제자 인연도). docs/30.
    if (eff.darknessLevelBump > 0) {
      applyAlignmentReputation(-(eff.darknessLevelBump * 3), 1, [perpId]);
    }
  }
  if (eff.darknessRiskBump) {
    patch.darknessRisk = bumpDarknessRisk(d.darknessRisk, eff.darknessRiskBump);
  }
  if (eff.personalityShift) {
    const next: PersonalityTraits = { ...d.personality };
    for (const k of Object.keys(eff.personalityShift) as LegacyPersonalityAxis[]) {
      const delta = eff.personalityShift[k];
      if (delta == null) continue;
      applyLegacyShift(next, k, delta); // 구 5축 조건 → 6축 모델 매핑 적용
    }
    patch.personality = next;
  }
  if (eff.noteAppend) {
    patch.notes = [...d.notes, interpolate(eff.noteAppend, perpName, siblingName)];
  }
  if (Object.keys(patch).length > 0) ds.update(perpId, patch);
}

function applyMasterEffect(eff: MasterEffect): void {
  const ms = useMasterStore.getState();
  const m = ms.master;
  if (!m) return;
  const stats = { ...m.stats };
  if (eff.insightDelta) {
    stats.insight = Math.max(0, Math.min(100, stats.insight + eff.insightDelta));
  }
  if (eff.authorityDelta) {
    stats.authority = Math.max(0, Math.min(100, stats.authority + eff.authorityDelta));
  }
  ms.update({ stats });
  if (eff.reputationDelta) ms.adjustReputation('righteous', eff.reputationDelta);
  // hiddenFlag 는 master flag 필드 도입 시 적재. 현재는 skip.
}

function applyAtmosphereEffect(eff: { righteousnessDelta?: number; unityDelta?: number }): void {
  useSectAtmosphereStore.getState().adjust({
    righteousness: eff.righteousnessDelta ?? 0,
    unity: eff.unityDelta ?? 0,
  });
}

function applyCascadeEffect(cascade: CascadeEffect[], perpId: string, perpName: string): void {
  const ds = useDiscipleStore.getState();
  for (const c of cascade) {
    for (const id of ds.order) {
      if (id === perpId) continue;
      const other = ds.disciples[id];
      if (!other) continue;
      if (!isActive(other)) continue;

      const cond = c.triggerCondition;
      if (cond?.relation === 'friend' && !isFriend(other, perpId)) continue;
      if (cond?.relation === 'enemy' && !isEnemy(other, perpId)) continue;
      if (!meetsFloor(other, cond?.personality)) continue;
      if (!meetsCeiling(other, cond?.forbidPersonality)) continue;

      if (c.trustDelta) ds.adjustTrust(other.id, c.trustDelta);
      if (c.noteAppend) {
        const note = interpolate(c.noteAppend, perpName, other.name);
        ds.update(other.id, { notes: [...other.notes, note] });
      }
    }
  }
}

// ─── 메인 export ───────────────────────────────────────────────────────────

export function applyAllEffects(
  effects: EventEffects,
  perpId: string,
  perpName: string,
  siblingName?: string,
): void {
  if (effects.perpetrator) {
    applyPerpetratorEffect(perpId, effects.perpetrator, perpName, siblingName);
  }
  if (effects.master) applyMasterEffect(effects.master);
  if (effects.atmosphere) {
    applyAtmosphereEffect(effects.atmosphere);
    // 도덕 결정의 사상색 → 문파 평판(정파↑·사파↓). 관여 제자 개인 인연도. docs/30.
    if (effects.atmosphere.righteousnessDelta) {
      applyAlignmentReputation(effects.atmosphere.righteousnessDelta, 0.5, [perpId]);
    }
  }
  if (effects.cascade) applyCascadeEffect(effects.cascade, perpId, perpName);
}
