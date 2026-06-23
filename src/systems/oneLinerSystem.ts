// 한 마디 시스템 — docs/12_인박스_면담.md "단계 1: 일상 한 마디"
// 매일 [진행] 누름 시 무작위 제자 1명이 사부에게 한 마디. 4선택 응답.
// 응답 톤: 격려·끄덕임·경계·무관심. 톤별 문장은 발화 시점에 랜덤 픽되어 고정.
//
// 응답 처리 — docs/07 "공통 엔진" 정책에 따라 LLM 호출:
//   defaultEffects.perpetrator.trustDelta = tonePreferences[tone] (제자 personality 자동 산출)
//   LLM 활성 + 모델 ready + cap 미달 시 trustMul 보정 + narration 받음
//   실패·미활성·cap 도달 시 RuleResolver 폴백 (defaultEffects 그대로)
//
// 톤별 신뢰 변동의 기본값은 제자 personality 에서 자동 산출되는 가중치를 사용.
// 시드에 tonePreferences 가 직접 정의되어 있으면 그 값 우선.

import { random } from '@/systems/rng';
import {
  candidateOneLiners,
  fillOneLinerBody,
  pickContextualOneLiner,
  pickResponse,
  type OneLinerCtx,
  type OneLinerTemplate,
} from '@/data/scenarios/oneLiners';
import { buildDiscipleCtx } from './discipleCtx';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { usePendingStore } from '@/stores/pendingStore';
import type {
  Disciple,
  EventEffects,
  OneLinerTonePreferences,
  PersonalityTraits,
} from '@/types';
import { canGenerate, generate, isReadySync } from './llm/executorchClient';
import { applyAdjustments } from './eventEngine/llmPrompt';

export type { OneLinerTone } from '@/data/scenarios/oneLiners';
import type { OneLinerTone } from '@/data/scenarios/oneLiners';

// 모달에 노출할 톤 순서. 격려 → 끄덕임 → 경계 → 무관심.
export const ONE_LINER_TONE_ORDER: readonly OneLinerTone[] = [
  'encourage',
  'nod',
  'caution',
  'ignore',
] as const;

// 산출 가중치 클램프 범위.
const TONE_PREF_MIN = -7;
const TONE_PREF_MAX = 7;

function clampPref(v: number): number {
  return Math.max(TONE_PREF_MIN, Math.min(TONE_PREF_MAX, Math.round(v)));
}

// 톤 선호도 자동 산출 — docs/12. 인격 6축(0~100) 가중합산. 출력 ±7 clamp.
// 다정·자비 = 격려 수용 ↑, 신중·의무(낮은 자유) = 끄덕임, 강직 = 경계 수용·야망 = 반발.
export function deriveTonePreferences(
  p: PersonalityTraits,
): OneLinerTonePreferences {
  return {
    encourage: clampPref(2 + 0.02 * p.warmth + 0.02 * p.mercy),
    nod: clampPref(1 + 0.015 * p.prudence + 0.015 * (100 - p.freedom)),
    caution: clampPref(-1 + 0.02 * p.integrity - 0.02 * p.ambition),
    ignore: clampPref(-2 - 0.03 * p.warmth - 0.02 * p.mercy),
  };
}

// 제자의 톤 선호도 — 시드 오버라이드 우선, 없으면 personality 산출.
export function tonePreferencesFor(d: Disciple): OneLinerTonePreferences {
  return d.tonePreferences ?? deriveTonePreferences(d.personality);
}

// 매일 한 마디 발화 확률 — docs/12.
export const ONE_LINER_DAILY_CHANCE = 0.6;

// 선택된 한 마디를 서신함에 적재(모달 대신 쌓아둔다). 룰·LLM 선택 공용.
function queueOneLiner(disciple: Disciple, template: OneLinerTemplate, ctx: OneLinerCtx): void {
  const body = fillOneLinerBody(template.body, ctx); // {rival} → 실제 이름
  const day = useTimeStore.getState().totalDay;
  const responses = {
    encourage: pickResponse('encourage'),
    nod: pickResponse('nod'),
    caution: pickResponse('caution'),
    ignore: pickResponse('ignore'),
  };
  useInboxStore.getState().add({
    id: `oneliner-${disciple.id}-${day}`,
    kind: 'one_liner', // 한 마디 (응답 가능)
    title: `${disciple.name}의 한 마디`,
    preview: body,
    body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'oneLiner', templateId: template.id, discipleId: disciple.id, responses },
  });
}

// LLM function-calling 선택 — 후보 중 상황에 가장 맞는 한 마디 1개. 점수가 아니라 "고르기".
// {"pick":"<id>"} 만 받는다. 실패·미선택이면 룰 폴백(pickContextualOneLiner). docs/12·17.
function buildSelectPrompt(disciple: Disciple, ctx: OneLinerCtx, cands: OneLinerTemplate[]): string {
  const menu = cands.map((t) => `- ${t.id} [${t.mood ?? 'normal'}] "${t.body}"`).join('\n');
  return [
    '너는 무협 양육 시뮬의 "한 마디" 선택기다.',
    '제자의 지금 상황에 가장 어울리는 한 마디를 아래 후보 중에서 정확히 하나 고른다.',
    'JSON 한 줄 외 텍스트·설명·코드펜스 금지. 형식: {"pick":"후보의 id"}',
    '',
    '[제자]',
    `- 이름: ${disciple.name}`,
    `- 상황: 신뢰 ${ctx.trust} · 스트레스 ${ctx.stress} · 체력 ${ctx.staminaPct}% · 흑화위험 ${ctx.darknessRisk} · 적대 ${ctx.hasEnemy ? '있음' : '없음'} · 주력 성 ${ctx.mainSeong}`,
    '',
    '[후보 — id [결] "대사"]',
    menu,
    '',
    '[출력 — 위 id 중 하나를 골라 그대로. 형식 예시]',
    '{"pick":"id"}',
  ].join('\n');
}

function parsePick(raw: string): string | null {
  try {
    const j = JSON.parse(raw) as { pick?: unknown };
    if (typeof j.pick === 'string') return j.pick;
  } catch {
    /* 관대 파싱 폴백 */
  }
  const m = raw.match(/"pick"\s*:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

async function selectOneLinerLlm(disciple: Disciple, ctx: OneLinerCtx): Promise<OneLinerTemplate | null> {
  const cands = candidateOneLiners(ctx);
  if (cands.length === 0) return null;
  if (cands.length === 1) return cands[0];

  let chosen: OneLinerTemplate | null = null;
  let llmCalled = false;
  let debugPrompt: string | undefined;
  let debugRaw: string | undefined;
  if (await canGenerate()) {
    debugPrompt = buildSelectPrompt(disciple, ctx, cands);
    try {
      const raw = await generate(debugPrompt);
      debugRaw = raw;
      const id = parsePick(raw);
      chosen = cands.find((t) => t.id === id) ?? null;
      llmCalled = chosen != null;
    } catch (e) {
      debugRaw = `[error] ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  usePendingStore.getState().pushLlmDebug({
    source: 'oneLiner',
    discipleName: disciple.name,
    llmCalled,
    prompt: debugPrompt,
    raw: debugRaw,
  });
  return chosen ?? pickContextualOneLiner(ctx); // 룰 폴백(전용 우선)
}

// 매일 진행 시 호출. 확률 통과 시 활동 가능한 제자 중 무작위 1명에게 한 마디 부여.
// 모델 준비 시 LLM 이 상황 맞는 대사를 function-calling 으로 고른다(백그라운드). 아니면 룰(즉시).
export function triggerDailyOneLiner(): void {
  if (random() >= ONE_LINER_DAILY_CHANCE) return;

  const ds = useDiscipleStore.getState();
  const candidates = ds.order
    .map((id) => ds.disciples[id])
    .filter(
      (d): d is Disciple =>
        d != null &&
        (d.status === 'training' ||
          d.status === 'resting' ||
          d.status === 'meditating'),
    );
  if (candidates.length === 0) return;

  const disciple = candidates[Math.floor(random() * candidates.length)];
  const others = candidates.filter((d) => d.id !== disciple.id);
  const ctx = buildDiscipleCtx(disciple, others);

  // 룰 경로(모델 off — 시뮬·기본·다운로드 전): 즉시 동기 선택·적재.
  if (!isReadySync()) {
    const template = pickContextualOneLiner(ctx);
    if (template) queueOneLiner(disciple, template, ctx); // 맞는 게 없으면 그 날 발화 X
    return;
  }

  // LLM 경로: 백그라운드 선택 — 정산 모달이 inflight 로 대기(응답 처리와 같은 패턴). docs/07.
  const pend = usePendingStore.getState();
  pend.beginResolution();
  void selectOneLinerLlm(disciple, ctx)
    .then((template) => {
      if (template) queueOneLiner(disciple, template, ctx);
    })
    .catch((e) => {
      if (typeof console !== 'undefined') console.warn('[oneLiner] 선택 실패 — 룰 폴백', e);
      const template = pickContextualOneLiner(ctx);
      if (template) queueOneLiner(disciple, template, ctx);
    })
    .finally(() => usePendingStore.getState().endResolution());
}

// LLM 프롬프트 — 한 마디 응답 전용. 점수만 출력 (텍스트·풍경 X).
function buildOneLinerPrompt(
  body: string,
  disciple: Disciple,
  tone: OneLinerTone,
  responseLabel: string,
  baseTrustDelta: number,
): string {
  return [
    '너는 무협 양육 시뮬레이션의 효과 산출기다.',
    '제자의 한 마디에 사부가 응답한 결과를 사부 신뢰 변동값(부호 있는 정수)으로만 JSON 출력한다.',
    'JSON 외 텍스트, 풍경, 설명, 코드펜스 일절 금지. 숫자만.',
    '',
    '[제자]',
    `- 이름: ${disciple.name}`,
    `- 성격(5축): ${JSON.stringify(disciple.personality)}`,
    `- 신뢰: ${disciple.trustToMaster} / 체력: ${disciple.stamina}`,
    `- 흑화 단계: ${disciple.darknessLevel} (risk=${disciple.darknessRisk})`,
    '',
    '[제자가 사부에게 한 마디]',
    body,
    '',
    '[사부 응답]',
    `- tone: ${tone}`,
    `- 본문: ${responseLabel}`,
    '',
    '[규칙 기본 신뢰 변동값 (기준값 — 특별한 이유가 없으면 이 값 근처로 정한다)]',
    `- base: ${baseTrustDelta}`,
    `- 격려·끄덕임은 대체로 +, 경계·무관심은 대체로 −. tone 의 일반적 방향을 먼저 따른다.`,
    `- 제자 성격상 뚜렷한 이유가 있을 때만 부호를 뒤집는다 — 무관심에 깊이 상처받는 제자는 더 큰 −, 칭찬을 부담스러워하는 제자는 격려에도 작은 +나 −.`,
    '',
    '[출력 — effects 래퍼 포함 JSON 한 줄. trust 는 신뢰 변동 정수(-15~+15). 아래는 형식 예시, 값은 직접 정하라.]',
    '{"effects":{"trust":0}}',
  ].join('\n');
}

// 응답 처리 — async. LLM 호출 (가능하면) + 효과 적용 + 결과 표시.
export async function respondToOneLiner(tone: OneLinerTone): Promise<void> {
  const pend = usePendingStore.getState();
  const pending = pend.oneLiner;
  if (!pending) return;
  const disciple = useDiscipleStore.getState().disciples[pending.discipleId];

  // 선택 즉시 모달 닫기 — LLM 응답은 백그라운드. 사용자는 계속 진행.
  pend.clearOneLiner();
  if (!disciple) return;

  pend.beginResolution();
  try {
    await respondOneLinerInner(tone, pending, disciple);
  } finally {
    usePendingStore.getState().endResolution();
  }
}

async function respondOneLinerInner(
  tone: OneLinerTone,
  pending: NonNullable<ReturnType<typeof usePendingStore.getState>['oneLiner']>,
  disciple: Disciple,
): Promise<void> {
  const prefs = tonePreferencesFor(disciple);
  const baseTrustDelta = prefs[tone];
  const defaultEffects: EventEffects = {
    perpetrator: { trustDelta: baseTrustDelta },
  };

  let effects: EventEffects = defaultEffects;
  let llmCalled = false;
  let debugPrompt: string | undefined;
  let debugRaw: string | undefined;

  if (await canGenerate()) {
    debugPrompt = buildOneLinerPrompt(
      pending.body,
      disciple,
      tone,
      pending.responses[tone],
      baseTrustDelta,
    );
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
        console.warn('[oneLiner] LLM 응답 실패 — 룰 폴백', e);
      }
      const msg = e instanceof Error ? e.message : String(e);
      debugRaw = `[error] ${msg}`;
    }
  }

  // 효과 적용 — 한 마디는 perpetrator.trustDelta 만 사용.
  const trustDelta = effects.perpetrator?.trustDelta ?? 0;
  if (trustDelta !== 0) {
    useDiscipleStore.getState().adjustTrust(pending.discipleId, trustDelta);
  }

  // 응답 결과 화면 X — 사용자 의도 (PM 결): 응답 직후 모달 즉시 닫힘.
  // LLM 디버그는 다음 정산 모달에 누적 표시.
  usePendingStore.getState().pushLlmDebug({
    source: 'oneLiner',
    discipleName: disciple.name,
    llmCalled,
    prompt: debugPrompt,
    raw: debugRaw,
  });
}
