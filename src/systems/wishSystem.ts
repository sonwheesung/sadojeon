// 제자 희망 이벤트 시스템 — docs/12 단계 1.5.
// 매일 확률로 1명의 제자가 사부에게 "오늘 X 하고 싶다" 발화.
// 사부 응답: 허락(accept) / 거절(reject). 2선택이지만 docs/07 정책에 따라 LLM 결과 처리.
//
// 같은 응답이라도 제자 성격·신뢰·체력에 따라 효과 차등 — 압박을 좋아하는 제자에 거절 →
// 신뢰 ↑, 무관심에 상처받는 제자에 거절 → 신뢰 폭락 등. LLM 가 trustMul 보정.

import { random } from '@/systems/rng';
import { pickRandomWish, wishGrantFor, WISHES, type WishTemplate } from '@/data/scenarios/wishes';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, EventEffects } from '@/types';
import { canGenerate, generate } from './llm/executorchClient';
import { applyAdjustments } from './eventEngine/llmPrompt';
import { issueOverride } from './overrideSystem';

// 매일 희망 발화 확률.
export const WISH_DAILY_CHANCE = 0.18;

// 매일 진행 시 호출.
export function triggerDailyWish(): void {
  if (random() >= WISH_DAILY_CHANCE) return;

  const ds = useDiscipleStore.getState();
  const overrides = useScheduleStore.getState().overrides;
  const totalDay = useTimeStore.getState().totalDay;

  const candidates = ds.order
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => {
      if (!d) return false;
      if (d.status !== 'training') return false;
      const ov = overrides[d.id];
      if (ov && ov.command !== 'default' && totalDay < ov.startedAtDay + ov.durationDays) {
        return false;
      }
      return true;
    });

  if (candidates.length === 0) return;

  const disciple = candidates[Math.floor(random() * candidates.length)];
  const template = pickRandomWish();

  // 모달 대신 서신함에 적재 — 진행 중엔 화면에 안 띄우고 쌓아둔다.
  useInboxStore.getState().add({
    id: `wish-${disciple.id}-${totalDay}`,
    kind: 'complaint', // 요청·불만 (응답 필요)
    title: `${disciple.name}의 청`,
    preview: template.body,
    body: template.body,
    discipleId: disciple.id,
    priority: 'normal',
    createdAtDay: totalDay,
    read: false,
    resolved: false,
    payload: { domain: 'wish', templateId: template.id, discipleId: disciple.id },
  });
}

function templateOf(id: string): WishTemplate | undefined {
  return WISHES.find((w) => w.id === id);
}

function buildWishPrompt(
  body: string,
  disciple: Disciple,
  decision: 'accept' | 'reject',
  baseTrustDelta: number,
): string {
  return [
    '너는 무협 양육 시뮬레이션의 효과 산출기다.',
    '제자의 청에 사부가 응답한 결과를 사부 신뢰 변동값(부호 있는 정수)으로만 JSON 출력한다.',
    'JSON 외 텍스트, 풍경, 설명, 코드펜스 일절 금지. 숫자만.',
    '',
    '[제자]',
    `- 이름: ${disciple.name}`,
    `- 성격(5축): ${JSON.stringify(disciple.personality)}`,
    `- 신뢰: ${disciple.trustToMaster} / 체력: ${disciple.stamina}`,
    `- 흑화 단계: ${disciple.darknessLevel} (risk=${disciple.darknessRisk})`,
    '',
    '[제자의 청]',
    body,
    '',
    '[사부 응답]',
    `- decision: ${decision === 'accept' ? '허락' : '거절'}`,
    '',
    '[규칙 기본 신뢰 변동값 (기준값 — 특별한 이유가 없으면 이 값 근처로 정한다)]',
    `- base: ${baseTrustDelta}`,
    `- 허락은 대체로 +, 거절은 대체로 −. decision 의 일반적 방향을 먼저 따른다.`,
    `- 제자 성격·상황상 뚜렷한 이유가 있을 때만 부호를 뒤집는다 — 휴식이 절실한데 거절하면 더 큰 −, 게으름 핑계를 거절하면 거의 변화 없음.`,
    '',
    '[출력 — effects 래퍼 포함 JSON 한 줄. trust 는 신뢰 변동 정수(-15~+15). 아래는 형식 예시, 값은 직접 정하라.]',
    '{"effects":{"trust":0}}',
  ].join('\n');
}

async function resolveDecision(decision: 'accept' | 'reject'): Promise<void> {
  const pend = usePendingStore.getState();
  const pending = pend.wish;
  if (!pending) return;
  const tpl = templateOf(pending.templateId);
  const disciple = useDiscipleStore.getState().disciples[pending.discipleId];

  // 선택 즉시 모달 닫기 — LLM 응답은 백그라운드. 사용자는 계속 진행.
  pend.clearWish();
  if (!tpl || !disciple) return;

  pend.beginResolution();
  try {
    await resolveWishInner(decision, pending, tpl, disciple);
  } finally {
    usePendingStore.getState().endResolution();
  }
}

async function resolveWishInner(
  decision: 'accept' | 'reject',
  pending: NonNullable<ReturnType<typeof usePendingStore.getState>['wish']>,
  tpl: WishTemplate,
  disciple: Disciple,
): Promise<void> {
  const baseTrustDelta =
    decision === 'accept' ? tpl.acceptTrustDelta : tpl.rejectTrustDelta;
  const defaultEffects: EventEffects = {
    perpetrator: { trustDelta: baseTrustDelta },
  };

  let effects: EventEffects = defaultEffects;
  let llmCalled = false;
  let debugPrompt: string | undefined;
  let debugRaw: string | undefined;

  if (await canGenerate()) {
    debugPrompt = buildWishPrompt(pending.body, disciple, decision, baseTrustDelta);
    try {
      const raw = await generate(debugPrompt);
      debugRaw = raw;
      const adjusted = applyAdjustments(defaultEffects, raw);
      if (adjusted) {
        effects = adjusted.effects;
        llmCalled = true;
      }
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn('[wish] LLM 응답 실패 — 룰 폴백', e);
      }
      const msg = e instanceof Error ? e.message : String(e);
      debugRaw = `[error] ${msg}`;
    }
  }

  // 효과 적용 — perpetrator.trustDelta.
  const trustDelta = effects.perpetrator?.trustDelta ?? 0;
  if (trustDelta !== 0) {
    useDiscipleStore.getState().adjustTrust(pending.discipleId, trustDelta);
  }

  // 허락 시 청 종류별 그날 일탈 효과 — kind 기준(docs/12 §1.5 매핑). 신뢰 변동과 별개로 추가 적용.
  if (decision === 'accept') {
    const grant = wishGrantFor(tpl.kind);
    if (grant.kind === 'override') {
      issueOverride(pending.discipleId, grant.command, grant.days);
    } else if (grant.kind === 'stress') {
      useDiscipleStore.getState().adjustStress(pending.discipleId, grant.delta);
    }
  }

  // 응답 결과 화면 X — 응답 직후 모달 닫힘. 디버그는 정산 모달 누적.
  usePendingStore.getState().pushLlmDebug({
    source: 'wish',
    discipleName: disciple.name,
    llmCalled,
    prompt: debugPrompt,
    raw: debugRaw,
  });
}

export async function acceptWish(): Promise<void> {
  await resolveDecision('accept');
}

export async function rejectWish(): Promise<void> {
  await resolveDecision('reject');
}
