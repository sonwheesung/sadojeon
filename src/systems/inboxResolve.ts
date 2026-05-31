// 서신함 항목 해소 — 응답 선택 → 효과 적용.
// 인박스 payload 로 pending store 를 재구성한 뒤 기존 리졸버(LLM·룰·효과 적용)를 그대로 호출한다.
// → 한마디/희망/도덕 모두 동일 효과 로직 재사용. 해소 후 항목 제거.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import type {
  InboxItem,
  MoralChoice,
  MoralChoiceTone,
  PendingMoralEvent,
} from '@/types';
import { SECLUSION_PETITION_DAYS } from '@/data/realm';
import { resolveMoralChoice } from './moralEventSystem';
import { issueOverride } from './overrideSystem';
import { saveCurrentRunSilently } from './runSync';
import { ONE_LINER_TONE_ORDER, respondToOneLiner, type OneLinerTone } from './oneLinerSystem';
import { acceptWish, rejectWish } from './wishSystem';

export interface InboxResponseOption {
  key: string;
  // 사용자에 보이는 응답 문구 (톤 라벨 직접 노출 X — feedback_hidden_game_state).
  label: string;
}

type Payload = Record<string, unknown>;

function payloadOf(item: InboxItem): Payload {
  return (item.payload ?? {}) as Payload;
}

function bodyOf(item: InboxItem): string {
  return 'body' in item && typeof item.body === 'string' ? item.body : item.preview;
}

// 응답 가능 항목인지. 그 외(보고·풍문 등)는 읽기만.
export function isRespondable(item: InboxItem): boolean {
  const d = payloadOf(item).domain;
  return d === 'oneLiner' || d === 'wish' || d === 'moral' || d === 'seclusion_petition';
}

// 항목의 응답 선택지.
export function responseOptionsFor(item: InboxItem): InboxResponseOption[] {
  const p = payloadOf(item);
  if (p.domain === 'oneLiner') {
    const responses = (p.responses ?? {}) as Record<string, string>;
    return ONE_LINER_TONE_ORDER.filter((t) => responses[t]).map((t) => ({
      key: t,
      label: responses[t],
    }));
  }
  if (p.domain === 'wish') {
    return [
      { key: 'accept', label: '청을 들어준다' },
      { key: 'reject', label: '뜻을 거두게 한다' },
    ];
  }
  if (p.domain === 'moral') {
    const choices = (p.choices ?? []) as MoralChoice[];
    return choices.map((c) => ({ key: c.tone, label: c.label }));
  }
  if (p.domain === 'seclusion_petition') {
    return [
      { key: 'allow', label: '폐관을 허락한다' },
      { key: 'hold', label: '아직 이르다 (보류)' },
    ];
  }
  return [];
}

// 선택한 응답으로 해소 — 효과 적용 후 항목 제거.
export async function resolveInboxItem(item: InboxItem, key: string): Promise<void> {
  const p = payloadOf(item);
  const body = bodyOf(item);
  const createdAtDay = item.createdAtDay;
  const templateId = String(p.templateId ?? '');
  const discipleId = String(p.discipleId ?? '');

  if (p.domain === 'oneLiner') {
    usePendingStore.getState().setOneLiner({
      templateId,
      discipleId,
      body,
      createdAtDay,
      responses: p.responses as never,
    });
    await respondToOneLiner(key as OneLinerTone);
  } else if (p.domain === 'wish') {
    usePendingStore.getState().setWish({ templateId, discipleId, body, createdAtDay });
    if (key === 'accept') await acceptWish();
    else await rejectWish();
  } else if (p.domain === 'moral') {
    const disciple = useDiscipleStore.getState().disciples[discipleId];
    const pending: PendingMoralEvent = {
      templateId,
      tier: p.tier as PendingMoralEvent['tier'],
      category: p.category as PendingMoralEvent['category'],
      discipleId,
      discipleName: disciple?.name ?? '제자',
      siblingId: (p.siblingId as string | null) ?? undefined,
      siblingName: (p.siblingName as string | null) ?? undefined,
      body,
      hint: (p.hint as string | null) ?? undefined,
      choices: (p.choices ?? []) as MoralChoice[],
      createdAtDay,
    };
    useMoralEventStore.getState().set(pending);
    await resolveMoralChoice(key as MoralChoiceTone);
  } else if (p.domain === 'seclusion_petition') {
    // 허락 → 폐관 발행(폐관 중 깨달음 굴림). 보류 → 청원 플래그 해제(나중에 다시 청원 가능).
    if (key === 'allow') {
      issueOverride(discipleId, 'seclusion', SECLUSION_PETITION_DAYS);
    } else {
      const d = useDiscipleStore.getState().disciples[discipleId];
      if (d) {
        useDiscipleStore
          .getState()
          .update(discipleId, { realmProgress: { ...d.realmProgress, petitioned: false } });
      }
    }
  }

  useInboxStore.getState().remove(item.id);
  // 해소 결과(효과·서신함 제거)를 즉시 DB에 반영.
  saveCurrentRunSilently();
}
