// 활동 시스템 — 약초 채집 파견(발행→상태 점유→기간 만료 결산→귀환). docs/38.
// 의뢰(questSystem) 파견 골격을 미러. 엔진 재사용: 재료=alchemySystem.addMaterial,
// 상처=woundSystem.inflictWound, 결산 서신=pendingStore milestone(=inbox). 강호 출행은 Phase 2.

import { findGatherRegion, GATHER_REGIONS } from '@/data/activities';
import { MATERIAL_LABEL } from '@/data/elixirs';
import { useActivityStore } from '@/stores/activityStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, Milestone } from '@/types';
import type { ActiveActivity, GatherRegion } from '@/types/activity';
import { addMaterial } from './alchemySystem';
import { inflictWound } from './woundSystem';
import { findExpeditionDest } from '@/data/expeditions';
import { tickExpedition } from './expeditionSystem';

// 약 지식 = 연단·의술 레벨 중 높은 쪽(채집 지식 게이트). docs/29 §5-1 계승.
export function loreOf(d: Disciple): number {
  return Math.max(d.stats?.alchemy?.level ?? 0, d.stats?.medicine?.level ?? 0);
}

// 전투 역량 프록시 — 주력 무공 성(전투원 동행 게이트·영물전 굴림용 그레이박스).
function combatSeong(d: Disciple): number {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  return (mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong : 0) ?? 0;
}

// 파견 가용 상태(일과 중인 제자만 — questing/crafting/injured/graduated 제외).
export function isAvailable(d: Disciple): boolean {
  return d.status === 'training' || d.status === 'resting' || d.status === 'meditating';
}

// 파티가 지역 조건을 충족하나 — 약 지식 게이트 + (위험 지역) 전투원. 미달이면 사유.
export function canGather(
  region: GatherRegion,
  party: Disciple[],
): { ok: boolean; reason?: string } {
  if (party.length === 0) return { ok: false, reason: '동행할 제자를 고르세요.' };
  if (party.some((d) => !isAvailable(d)))
    return { ok: false, reason: '다른 일(의뢰·연단·요양) 중인 제자는 보낼 수 없습니다.' };
  if (!party.some((d) => loreOf(d) >= region.loreMin))
    return { ok: false, reason: `약초 지식 ${region.loreMin} 이상인 동문이 한 명은 필요합니다.` };
  if (region.needsCombatParty && !party.some((d) => combatSeong(d) >= 2))
    return { ok: false, reason: '위험한 지역입니다 — 싸울 수 있는 동문이 필요합니다.' };
  return { ok: true };
}

// 채집 발행 — 파티를 questing 으로 점유, 기간 만료까지 활동 등록.
export function dispatchGather(regionId: string, discipleIds: string[]): boolean {
  const region = findGatherRegion(regionId);
  if (!region) return false;
  const ds = useDiscipleStore.getState();
  const party = discipleIds.map((id) => ds.disciples[id]).filter((d): d is Disciple => d != null);
  if (party.length !== discipleIds.length) return false;
  if (!canGather(region, party).ok) return false;
  const today = useTimeStore.getState().totalDay;
  useActivityStore.getState().add({
    id: `act-gather-${regionId}-${today}`,
    kind: 'gather',
    regionId,
    discipleIds,
    startedDay: today,
    dueDay: today + region.days,
  });
  for (const id of discipleIds) ds.update(id, { status: 'questing' });
  return true;
}

// 결산 — 재료 드랍(지식·기간 보정) + 환경 상처 + 영물전(그레이박스). 귀환 후 서신.
function settleGather(act: ActiveActivity): Milestone | null {
  const region = act.regionId ? findGatherRegion(act.regionId) : undefined;
  const ds = useDiscipleStore.getState();
  const party = act.discipleIds.map((id) => ds.disciples[id]).filter((d): d is Disciple => d != null);
  if (!region || party.length === 0) return null;

  // 귀환 — 먼저 일과로 복귀(이후 상처가 injured 로 덮어쓸 수 있음).
  for (const d of party) ds.update(d.id, { status: 'training' });

  const lore = Math.max(...party.map(loreOf), 0);
  const loreMult = Math.max(0.5, lore / 20); // 흔한 약초는 지식만큼 더 캔다.
  const haul: Record<string, number> = {};
  const give = (id: string, qty: number) => {
    if (qty <= 0) return;
    addMaterial(id, qty);
    haul[id] = (haul[id] ?? 0) + qty;
  };

  for (const drop of region.drops) {
    if (Math.random() >= drop.chance) continue;
    const base = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
    give(drop.id, Math.max(1, Math.round(base * (drop.id === 'herb-common' ? loreMult : 1))));
  }

  // 영물(극험) — 그레이박스: 파티 전투력 합 게이트 굴림. 성공 시 신품초 보장, 실패 시 부상 가중.
  // TODO(Phase 3): combat engine 으로 실제 영물전 배선(docs/35·38 §2).
  let beastWon = true;
  if (region.spiritBeast) {
    const power = party.reduce((s, d) => s + combatSeong(d), 0);
    beastWon = Math.random() < Math.min(0.85, 0.25 + power * 0.06);
    if (beastWon) give('herb-divine', 1);
  }

  // 환경 상처 — 파티 1인씩 굴림. 영물전 패배 시 위험·심도 가중.
  const woundChance = region.spiritBeast && !beastWon ? Math.min(1, region.woundChance + 0.3) : region.woundChance;
  const hurt: string[] = [];
  for (const d of party) {
    if (Math.random() >= woundChance) continue;
    const sev = region.woundSeverityMin + Math.floor(Math.random() * (5 - region.woundSeverityMin + 1));
    inflictWound(d.id, region.woundType, sev, (6 - sev) * 5);
    hurt.push(d.name);
  }

  const lead = party[0];
  const names = party.map((d) => d.name).join('·');
  const haulText =
    Object.entries(haul)
      .map(([id, n]) => `${MATERIAL_LABEL[id] ?? id} ×${n}`)
      .join(', ') || '이렇다 할 소득은 없었다';
  const beastNote = region.spiritBeast ? (beastWon ? ' 영물을 베고 신품초를 얻었다.' : ' 영물에 밀려 빈손으로 물러났다.') : '';
  const hurtNote = hurt.length ? `\n${hurt.join('·')}이(가) 부상을 입고 돌아왔다.` : '';
  return {
    id: `act-${act.id}-${act.dueDay}`,
    kind: 'quest', // 파견 결산 — 의뢰와 같은 서신 경로 재사용.
    discipleId: lead.id,
    discipleName: lead.name,
    title: `채집 — ${region.name}`,
    body: `${region.name} 채집 — ${names}\n${haulText}.${beastNote}${hurtNote}`,
  };
}

// advanceTurn 훅 — 활동 진행/결산.
//  · 채집(gather): 기한 도래 시 결산·귀환.
//  · 강호 출행(expedition): 매 tick 위임 — 예정 사건 발동(서신 강제선택)·기한 도래 시 귀환 결산.
export function tickActivities(): void {
  const today = useTimeStore.getState().totalDay;
  const milestones: Milestone[] = [];
  for (const a of [...useActivityStore.getState().active]) {
    if (a.kind === 'gather') {
      if (today < a.dueDay) continue;
      const m = settleGather(a);
      if (m) milestones.push(m);
      useActivityStore.getState().remove(a.id);
    } else if (a.kind === 'expedition') {
      const { milestone, done } = tickExpedition(a);
      if (milestone) milestones.push(milestone);
      if (done) useActivityStore.getState().remove(a.id);
    }
  }
  if (milestones.length > 0) usePendingStore.getState().pushMilestones(milestones);
}

// 진행 중 활동 라벨(허브 상단 "○○ 중 (남은 N일)").
export function activeActivityLabels(): { id: string; label: string; remaining: number }[] {
  const today = useTimeStore.getState().totalDay;
  const ds = useDiscipleStore.getState();
  return useActivityStore.getState().active.map((a) => {
    const place =
      a.kind === 'gather'
        ? a.regionId && findGatherRegion(a.regionId)?.name
        : a.destId && findExpeditionDest(a.destId)?.name;
    const names = a.discipleIds.map((id) => ds.disciples[id]?.name ?? '?').join('·');
    const remaining = Math.max(0, a.dueDay - today);
    return { id: a.id, label: `${place || '활동'} — ${names}`, remaining };
  });
}

export { GATHER_REGIONS };
