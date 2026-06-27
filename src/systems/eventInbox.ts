// 진행 중 발생 이벤트 → 서신함 적재 변환기.
// 모달로 띄우지 않고 inbox 에 쌓는다. payload 에 해소용 정보 보관(추후 서신함에서 응답).

import { josa } from '@/utils/korean';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { reactToSiblingMilestone } from './siblingReactionSystem';
import type { Disciple, Milestone, PendingMoralEvent, Realm } from '@/types';
import type { ArcEvent } from '@/data/scenarios/arcEvents';
import { REALM_LABEL } from '@/types/realm';

// 도덕 갈등 이벤트(4선택) → 서신함 'event'(결정 필요).
export function moralToInbox(mp: PendingMoralEvent): void {
  useInboxStore.getState().add({
    id: `moral-${mp.templateId}-${mp.discipleId}-${mp.createdAtDay}`,
    kind: 'event',
    title: `${mp.discipleName} — 사건`,
    preview: mp.body, // event kind 는 body 필드가 없어 preview 로 본문 전달
    eventId: mp.templateId,
    priority: 'high',
    createdAtDay: mp.createdAtDay,
    read: false,
    resolved: false,
    payload: {
      domain: 'moral',
      templateId: mp.templateId,
      discipleId: mp.discipleId,
      tier: mp.tier,
      category: mp.category,
      hint: mp.hint ?? null,
      siblingId: mp.siblingId ?? null,
      siblingName: mp.siblingName ?? null,
      choices: mp.choices,
    },
  });
}

// 캐릭터 필수 이벤트 아크 → 서신함 'event'(결정 필요, 무시 불가). docs/47·48.
// id 결정적(arc-<제자>-y<연차>) — add 멱등이라 미해소 동안 매 tick 재시도해도 1개만.
export function arcToInbox(d: Disciple, ev: ArcEvent, day: number): void {
  const id = `arc-${ev.discipleId}-y${ev.year}`;
  useInboxStore.getState().add({
    id,
    kind: 'event',
    eventId: id,
    title: `${d.name} — ${ev.title}`,
    preview: ev.body, // event kind 는 body 필드가 없어 preview 로 본문 전달(도덕 이벤트와 동일)
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: {
      domain: 'arc',
      discipleId: ev.discipleId,
      eventId: id,
      year: ev.year,
      title: ev.title,
      hint: ev.hint ?? null,
      choices: ev.choices,
    },
  });
}

// 폐관 청원(경지 벽) → 서신함 'event'(결정 필요). docs/12 §폐관 청원.
export function seclusionPetitionToInbox(d: Disciple, target: Realm): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `seclusion-${d.id}-${target}`,
    kind: 'event',
    eventId: `seclusion-${target}`,
    title: `${d.name} — 폐관 청원`,
    preview: `${josa(d.name, '이', '가')} 사부 앞에 무릎을 꿇었다. "사부님, 벽이 보입니다. 폐관에 들어 뚫어보고 싶습니다."`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'seclusion_petition', discipleId: d.id, target },
  });
}

// 경지 상승 알림 → 서신함 'report'(읽기만).
export function realmUpToInbox(d: Disciple, realm: Realm): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `realmup-${d.id}-${realm}-${day}`,
    kind: 'report',
    title: `${d.name}, ${REALM_LABEL[realm]}에 올랐다`,
    preview: `${d.name}의 경지가 ${REALM_LABEL[realm]}(으)로 올라섰다.`,
    body: `${d.name}의 경지가 ${REALM_LABEL[realm]}(으)로 올라섰다.`,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'realm_up', discipleId: d.id, realm },
  });
  // 동문 경사 반응 — 뒤처진 라이벌은 질투, 가까운 동문은 축하(전이형). docs/12.
  reactToSiblingMilestone(d.id, 'realm_up');
}

// 변곡점(승급/탈진/졸업) → 서신함 'report'(읽기만, 알림).
export function milestonesToInbox(list: Milestone[]): void {
  const day = useTimeStore.getState().totalDay;
  const inbox = useInboxStore.getState();
  for (const m of list) {
    inbox.add({
      id: `milestone-${m.id}-${day}`,
      kind: 'report',
      title: m.title,
      preview: m.body,
      body: m.body,
      priority: m.kind === 'collapse' ? 'high' : 'normal',
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: { domain: 'milestone', kind: m.kind, discipleId: m.discipleId },
    });
  }
}
