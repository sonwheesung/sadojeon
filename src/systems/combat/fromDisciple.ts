// 제자 → 전투원 스냅샷 어댑터 — docs/35 §3. 엔진은 Disciple 을 모른다(디커플링).
// 호출 시점의 상태(체력·부상·심마)가 그대로 스냅샷에 박힌다 — 같은 제자라도 만전일 때와
// 만신창이일 때 다른 전투원이 된다.

import { findMartialArt, artTraits } from '@/data/martialArts';
import type { Disciple } from '@/types';
import type { CombatArt, Combatant } from '@/types/combat';

function statLevel(d: Disciple, id: 'strength' | 'agility' | 'endurance'): number {
  return d.stats?.[id]?.level ?? 0;
}

export function combatantFromDisciple(d: Disciple): Combatant {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const arts = d.martialArts
    .map((inst): CombatArt | null => {
      const art = findMartialArt(inst.artId);
      if (!art) return null;
      return {
        school: art.school,
        grade: art.grade,
        path: art.path,
        seong: inst.seong,
        isMain: inst.artId === mainId,
        traits: artTraits(art),
      };
    })
    .filter((a): a is CombatArt => a != null);

  return {
    id: d.id,
    name: d.name,
    realm: d.realm,
    arts,
    internal: d.realmProgress?.internal ?? 0,
    strength: statLevel(d, 'strength'),
    agility: statLevel(d, 'agility'),
    endurance: statLevel(d, 'endurance'),
    staminaFrac: d.maxStamina > 0 ? d.stamina / d.maxStamina : 1,
    insight: d.insight ?? 1,
    prudence: d.personality?.prudence ?? 50,
    mercy: d.personality?.mercy ?? 50,
    simma: d.simma ?? 0,
    woundSeverity: d.wound?.severity,
  };
}
