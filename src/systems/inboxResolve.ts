// 서신함 항목 해소 — 응답 선택 → 효과 적용.
// 인박스 payload 로 pending store 를 재구성한 뒤 기존 리졸버(LLM·룰·효과 적용)를 그대로 호출한다.
// → 한마디/희망/도덕 모두 동일 효과 로직 재사용. 해소 후 항목 제거.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import type {
  ArcChoiceRecord,
  InboxItem,
  MoralChoice,
  MoralChoiceTone,
  PendingMoralEvent,
} from '@/types';
import type { ArcEventChoice } from '@/data/scenarios/arcEvents';
import { SECLUSION_PETITION_DAYS } from '@/data/realm';
import { resolveGraduationPick, resolveGraduationConflict } from './graduationChoice';
import { applyMeetingChoice } from './meetingSystem';
import type { MeetingOption } from '@/data/scenarios/meetings';
import { resolveMoralChoice } from './moralEventSystem';
import { counselChoices, mediationChoices, resolveCounsel, resolveMediation } from './mediationSystem';
import { ambitionChoices, resolveAmbitionConflict } from './ambitionConflictSystem';
import { factionThreatChoices, resolveFactionThreat } from './reputationSystem';
import { issueOverride } from './overrideSystem';
import { saveCurrentRunSilently } from './runSync';
import { ONE_LINER_TONE_ORDER, respondToOneLiner, type OneLinerTone } from './oneLinerSystem';
import { acceptWish, rejectWish } from './wishSystem';

export interface InboxResponseOption {
  key: string;
  // 사용자에 보이는 응답 문구 (톤 라벨 직접 노출 X — feedback_hidden_game_state).
  label: string;
  // 게이트 미충족 등으로 선택 불가(표시는 하되 비활성). 의뢰 이벤트 등.
  disabled?: boolean;
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
  return (
    d === 'oneLiner' ||
    d === 'wish' ||
    d === 'moral' ||
    d === 'arc' ||
    d === 'seclusion_petition' ||
    d === 'quest_event' ||
    d === 'expedition_event' ||
    d === 'graduation' ||
    d === 'graduation_conflict' ||
    d === 'meeting' ||
    d === 'mediation' ||
    d === 'counsel' ||
    d === 'ambition_conflict' ||
    d === 'faction_threat'
  );
}

interface GraduationChoiceView {
  key: string;
  label: string;
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
  if (p.domain === 'arc') {
    const choices = (p.choices ?? []) as ArcEventChoice[];
    return choices.map((c) => ({ key: c.key, label: c.label }));
  }
  if (p.domain === 'seclusion_petition') {
    return [
      { key: 'allow', label: '폐관을 허락한다' },
      { key: 'hold', label: '아직 이르다 (보류)' },
    ];
  }
  if (p.domain === 'mediation') {
    return mediationChoices(String(p.aName ?? '한쪽'), String(p.bName ?? '다른 쪽'));
  }
  if (p.domain === 'counsel') {
    return counselChoices();
  }
  if (p.domain === 'ambition_conflict') {
    return ambitionChoices(String(p.aName ?? '한쪽'), String(p.bName ?? '다른 쪽'));
  }
  if (p.domain === 'faction_threat') {
    return factionThreatChoices();
  }
  // quest_event·expedition_event(현장 급보)는 fieldEventStore/FieldEventOverlay 가 선택지를 그리므로
  // inbox 선택지 빌더에선 폐지(docs/37 R24).
  if (p.domain === 'graduation' || p.domain === 'graduation_conflict') {
    const choices = (p.choices ?? []) as GraduationChoiceView[];
    return choices.map((c) => ({ key: c.key, label: c.label }));
  }
  if (p.domain === 'meeting') {
    const options = (p.options ?? []) as MeetingOption[];
    return options.map((o) => ({ key: o.key, label: o.label }));
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

  // 떠난 제자(졸업·하산) 대상 양육·관계 상호작용은 효과 미적용 — 항목만 제거. 사라진 동문에 트러스트·
  // 흑화·관계·사문 분위기·폐관(override) 변동 방지. graduation/_conflict·quest/expedition_event 는 제외
  // (그쪽 대상이라 정상). questing·injured 등 일시 상태는 복귀하므로 적용. docs/37 C9·R10.
  const hasLeft = (id: string): boolean => {
    const s = id ? useDiscipleStore.getState().disciples[id] : undefined;
    return !!s && (s.status === 'graduated' || s.status === 'departed' || s.status === 'runaway');
  };
  const d0 = String(p.domain ?? '');
  let skipLeft = false;
  if (['oneLiner', 'wish', 'moral', 'arc', 'meeting', 'seclusion_petition'].includes(d0)) skipLeft = hasLeft(discipleId);
  else if (d0 === 'mediation' || d0 === 'ambition_conflict') skipLeft = hasLeft(String(p.aId ?? '')) || hasLeft(String(p.bId ?? ''));
  else if (d0 === 'counsel') skipLeft = hasLeft(String(p.subjectId ?? '')) || hasLeft(String(p.otherId ?? ''));
  if (skipLeft) {
    useInboxStore.getState().remove(item.id);
    return;
  }

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
  } else if (p.domain === 'mediation') {
    // 중재 면담(2인) — 사부의 관계 개입. docs/33 §3.
    resolveMediation(String(p.aId ?? ''), String(p.bId ?? ''), key);
  } else if (p.domain === 'ambition_conflict') {
    // 동문 야망 충돌 — 사부의 4선택(양보/동맹/격려/무관심). docs/19·33 §4.
    resolveAmbitionConflict(String(p.aId ?? ''), String(p.bId ?? ''), key);
  } else if (p.domain === 'faction_threat') {
    // 적대 문파 도전 — 사부의 3선택(대치/화친/방치). 사문 단위 효과. docs/30 §강호 사건.
    resolveFactionThreat(String(p.factionId ?? ''), key);
  } else if (p.domain === 'counsel') {
    // 상담(1:1) — 그 제자의 인식만 약하게. docs/33 §3.
    resolveCounsel(String(p.subjectId ?? ''), String(p.otherId ?? ''), key);
    // quest_event·expedition_event(현장 급보)는 fieldEventStore/FieldEventOverlay 가 해소 — inbox 해소
    // 경로 폐지. 옛 세이브 잔재 항목은 말미 remove 로 효과 없이 정리(fieldEvent 와 이중적용 차단). docs/37 R24.
  } else if (p.domain === 'graduation') {
    // 사부가 권한 강호 행로 — 제자 의지와 어긋나면 갈등 이벤트로, 아니면 확정. docs/28 §3·§3④.
    resolveGraduationPick(discipleId, key);
  } else if (p.domain === 'graduation_conflict') {
    // 엇갈린 뜻 — 설득(사부의 길)/존중(제자의 길)으로 최종 확정. docs/28 §3④.
    resolveGraduationConflict(
      discipleId,
      String(p.userPickId ?? ''),
      String(p.willJobId ?? ''),
      key === 'respect' ? 'respect' : 'persuade',
    );
  } else if (p.domain === 'meeting') {
    // 면담 응답 — 선택지 효과(인격·신뢰·흑화·노선) 적용.
    const options = (p.options ?? []) as MeetingOption[];
    const opt = options.find((o) => o.key === key);
    if (opt) applyMeetingChoice(discipleId, opt.effects);
  } else if (p.domain === 'arc') {
    // 필수 이벤트 아크 — 면담과 같은 효과 적용(단 delta 큼) + 그 해 선택을 영속 기록(졸업 회고). docs/47.
    const choices = (p.choices ?? []) as ArcEventChoice[];
    const opt = choices.find((c) => c.key === key);
    if (opt) {
      applyMeetingChoice(discipleId, opt.effects);
      const d = useDiscipleStore.getState().disciples[discipleId];
      if (d) {
        const rec: ArcChoiceRecord = {
          year: Number(p.year ?? 0),
          eventId: String(p.eventId ?? ''),
          title: String(p.title ?? ''),
          choiceKey: key,
          choiceLabel: opt.label,
          day: createdAtDay,
        };
        useDiscipleStore.getState().update(discipleId, {
          arcChoices: [...(d.arcChoices ?? []), rec],
        });
      }
    }
  }

  // 처리 = 보관(삭제 아님). resolved 표시로 '지난 서신'에 남겨 과거 대화·결정을 다시 읽게 한다.
  // 보관건은 상세 재진입 시 읽기 전용([id].tsx respondable 가드) — 효과 중복 적용 차단. docs/12·37 R45.
  useInboxStore.getState().markResolved(item.id);
  // 해소 결과(효과·서신함 보관)를 즉시 DB에 반영.
  saveCurrentRunSilently();
}
