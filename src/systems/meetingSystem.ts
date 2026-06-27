// 면담 시스템 — docs/12. 진행 시 확률 + 상황 조건 충족하면 제자 1명이 면담 청 → 서신함(필수).
// 응답 선택마다 인격 6축·신뢰·흑화·노선이 갈린다. inboxResolve(domain:'meeting')에서 효과 적용.

import { random } from '@/systems/rng';
import { MEETINGS, fillMeetingBody, pickContextualMeeting, type MeetingEffect } from '@/data/scenarios/meetings';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useMasterStore } from '@/stores/masterStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, DarknessLevel } from '@/types';
import { buildDiscipleCtx } from './discipleCtx';
import { shiftPersona } from './personaShift';
import { applyAlignmentReputation } from './reputationSystem';

// 면담은 한 마디보다 무겁다 — 낮은 확률. (상황 매칭까지 통과해야 실제 발동)
export const MEETING_DAILY_CHANCE = 0.22;

// 면담 해소 1회당 사부 통찰 성장(소델타+감쇠 ×(1-v/100)) — 회차 누적으로 ★3→★4~5. 🔧 그레이박스 튜닝값. docs/02 Option C.
const INSIGHT_PER_MEETING = 0.5;

function isActive(d: Disciple): boolean {
  return d.status === 'training' || d.status === 'resting' || d.status === 'meditating';
}

// 매일 진행 시 호출(triggerPostSettlement). 확률 + 상황 조건 통과 시 면담 청 적재.
export function triggerDailyMeeting(): void {
  if (random() >= MEETING_DAILY_CHANCE) return;
  const ds = useDiscipleStore.getState();
  const active = ds.order.map((id) => ds.disciples[id]).filter((d): d is Disciple => d != null && isActive(d));
  if (active.length === 0) return;

  const disciple = active[Math.floor(random() * active.length)];
  const others = active.filter((d) => d.id !== disciple.id);
  const ctx = buildDiscipleCtx(disciple, others);
  const tmpl = pickContextualMeeting(ctx, disciple.id); // 제자 전용 + 범용
  if (!tmpl) return; // 지금 상태에 맞는 면담 없음

  const body = fillMeetingBody(tmpl.body, ctx);
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `meeting-${disciple.id}-${day}`,
    kind: 'meeting_request',
    topicId: tmpl.id,
    discipleId: disciple.id,
    title: `${disciple.name} — 면담을 청합니다`,
    preview: body,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'meeting', meetingId: tmpl.id, discipleId: disciple.id, options: tmpl.options },
  });
}

// 면담 옵션 효과 적용 — inboxResolve(domain:'meeting')에서 호출.
export function applyMeetingChoice(discipleId: string, eff: MeetingEffect): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;

  if (eff.persona) {
    // 나이·관성 반영(평면 X). docs/28 §6.
    ds.update(discipleId, { personality: shiftPersona(d, eff.persona) });
  }
  if (eff.trust) ds.adjustTrust(discipleId, eff.trust);
  if (eff.darkness) {
    const next = Math.max(0, Math.min(4, d.darknessLevel + eff.darkness)) as DarknessLevel;
    ds.update(discipleId, { darknessLevel: next });
  }
  if (eff.righteousness) {
    useSectAtmosphereStore.getState().adjust({ righteousness: eff.righteousness });
    applyAlignmentReputation(eff.righteousness, 0.5, [discipleId]);
  }
  // 사부 통찰 성장 — 제자를 면담하며 이해가 쌓인다(감쇠라 후반 완만). docs/02 Option C·docs/12 §통찰 상승.
  const ms = useMasterStore.getState();
  const mst = ms.master;
  if (mst) {
    const cur = mst.stats.insight;
    const next = Math.min(100, cur + INSIGHT_PER_MEETING * (1 - cur / 100));
    ms.update({ stats: { ...mst.stats, insight: next } });
  }
}

// 면담 옵션 조회 — inboxResolve 에서 key→effects 매핑에 사용.
export function meetingOptionsOf(meetingId: string) {
  return MEETINGS.find((m) => m.id === meetingId)?.options ?? [];
}
