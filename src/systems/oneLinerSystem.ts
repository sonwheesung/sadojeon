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

import { pickRandomOneLiner, pickResponse } from '@/data/scenarios/oneLiners';
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
import { canGenerate, generate } from './llm/executorchClient';
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

// 톤 선호도 자동 산출 — docs/12.
// personality 5축 (diligence·pride·loyalty·curiosity·empathy, 1~100) 을 가중합산.
// 계수는 1~100 스케일 기준 (구 1~5 계수 ÷20). 출력은 ±7 clamp.
export function deriveTonePreferences(
  p: PersonalityTraits,
): OneLinerTonePreferences {
  return {
    encourage: clampPref(2 + 0.025 * p.pride + 0.015 * p.loyalty + 0.02 * p.empathy),
    nod: clampPref(1 + 0.01 * p.loyalty + 0.015 * p.empathy),
    caution: clampPref(-1 + 0.02 * p.diligence - 0.025 * p.pride),
    ignore: clampPref(
      -2 - 0.025 * p.loyalty - 0.03 * p.curiosity - 0.015 * p.empathy,
    ),
  };
}

// 제자의 톤 선호도 — 시드 오버라이드 우선, 없으면 personality 산출.
export function tonePreferencesFor(d: Disciple): OneLinerTonePreferences {
  return d.tonePreferences ?? deriveTonePreferences(d.personality);
}

// 매일 한 마디 발화 확률 — docs/12.
export const ONE_LINER_DAILY_CHANCE = 0.6;

// 매일 진행 시 호출. 확률 통과 시 활동 가능한 제자 중 무작위 1명에게 한 마디 부여.
export function triggerDailyOneLiner(): void {
  if (Math.random() >= ONE_LINER_DAILY_CHANCE) return;

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

  const disciple = candidates[Math.floor(Math.random() * candidates.length)];
  const template = pickRandomOneLiner();
  const day = useTimeStore.getState().totalDay;

  const responses = {
    encourage: pickResponse('encourage'),
    nod: pickResponse('nod'),
    caution: pickResponse('caution'),
    ignore: pickResponse('ignore'),
  };

  // 모달 대신 서신함에 적재 — 진행 중엔 화면에 안 띄우고 쌓아둔다.
  useInboxStore.getState().add({
    id: `oneliner-${disciple.id}-${day}`,
    kind: 'one_liner', // 한 마디 (응답 가능)
    title: `${disciple.name}의 한 마디`,
    preview: template.body,
    body: template.body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: {
      domain: 'oneLiner',
      templateId: template.id,
      discipleId: disciple.id,
      responses,
    },
  });
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
  const pending = usePendingStore.getState().oneLiner;
  if (!pending) return;
  const disciple = useDiscipleStore.getState().disciples[pending.discipleId];
  if (!disciple) {
    usePendingStore.getState().clearOneLiner();
    return;
  }

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
  usePendingStore.getState().clearOneLiner();
}
