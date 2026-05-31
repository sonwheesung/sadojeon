// LLM 프롬프트 빌더 + JSON 응답 파서.
// 모델: Llama 3.2 3B Instruct (구조화 출력 강함).
// 출력 스키마 — 부호 있는 정수 직접 변동값 (배율 X):
//   {
//     "effects": {
//       "trust": -3,          // 사부 신뢰
//       "stamina": 2,         // 체력
//       "darknessRisk": 4,    // 흑화 위험 (+ 악화)
//       "righteousness": -1,  // 사문 도의
//       "unity": -2           // 사문 결속
//     }
//   }
//
// 배율(0.3~3.0) 대신 직접 변동값을 받는 이유: 배율은 부호를 못 바꿔
// "같은 응답이 어떤 제자엔 +, 어떤 제자엔 −" 가 불가능했다. 직접 정수면 LLM 이
// 상황·성격에 따라 부호까지 자유롭게 결정한다. 규칙 기본값은 프롬프트에 참고로 제공.
//
// 안전:
//   - JSON.parse 실패·인식 필드 0개 → null 반환 → 호출자가 RuleResolver 폴백
//   - 필드별 clamp (LLM 폭주 방어). 규칙 기본값보다 넉넉히 잡아 작가 의도 보존.
//   - LLM 이 준 필드만 override, 생략 필드는 규칙 기본값 유지

import type {
  EventEffects,
  PerpetratorEffect,
  AtmosphereEffect,
} from '@/types';
import type { ResolveInput } from './resolver';

// 필드별 변동값 clamp 한계 (±). moral 기본값이 trust ±6 / darkness ±5 / 분위기 ±3
// 수준이라 넉넉히 잡아 규칙 작가 의도를 깎지 않으면서 LLM 폭주만 방어한다.
const DELTA_BOUND = {
  trust: 15,
  stamina: 25,
  darknessRisk: 10,
  righteousness: 10,
  unity: 10,
} as const;

function clampDelta(v: number, bound: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(-bound, Math.min(bound, Math.round(v)));
}

// 규칙 기본값을 프롬프트에 보여줄 한 줄 요약 — LLM 의 부호·크기 조정 앵커.
function summarizeBaseline(e: EventEffects): string {
  const parts: string[] = [];
  if (e.perpetrator?.trustDelta != null) parts.push(`trust ${e.perpetrator.trustDelta}`);
  if (e.perpetrator?.staminaDelta != null) parts.push(`stamina ${e.perpetrator.staminaDelta}`);
  if (e.perpetrator?.darknessRiskBump != null)
    parts.push(`darknessRisk ${e.perpetrator.darknessRiskBump}`);
  if (e.atmosphere?.righteousnessDelta != null)
    parts.push(`righteousness ${e.atmosphere.righteousnessDelta}`);
  if (e.atmosphere?.unityDelta != null) parts.push(`unity ${e.atmosphere.unityDelta}`);
  return parts.length ? parts.join(', ') : '(없음)';
}

// ─── Prompt 빌더 ────────────────────────────────────────────────────────────

export function buildPrompt(input: ResolveInput): string {
  const { template, choice, perpetrator, master, atmosphere, siblings, history } = input;

  const perpPersonality = JSON.stringify(perpetrator.personality);
  const siblingsLine = siblings.length
    ? siblings.map((s) => `${s.name}(${s.relation})`).join(', ')
    : '(없음)';
  const historyLines = history.sameTemplate
    .slice(0, 5)
    .map((h) => `- ${h.discipleName} / ${h.tone} / ${h.day}일`)
    .join('\n') || '(없음)';
  const categoryHistoryLines = history.sameCategory
    .slice(0, 5)
    .map((h) => `- ${h.discipleName} / ${h.tone} / ${h.day}일`)
    .join('\n') || '(없음)';

  return [
    '너는 무협 양육 시뮬레이션의 효과 산출기다.',
    '사부의 선택이 제자·사문에 미친 효과를 부호 있는 정수 변동값으로만 JSON 출력한다.',
    'JSON 외 텍스트·풍경·설명·코드펜스 일절 금지. 숫자만.',
    '',
    '[이벤트]',
    `- id: ${template.id}`,
    `- category: ${template.category}`,
    `- tier: ${template.tier}`,
    '',
    '[가해 제자]',
    `- 이름: ${perpetrator.name}`,
    `- 성격(5축): ${perpPersonality}`,
    `- 신뢰: ${perpetrator.trustToMaster} / 체력: ${perpetrator.stamina}`,
    `- 흑화 단계: ${perpetrator.darknessLevel} (risk=${perpetrator.darknessRisk})`,
    '',
    '[사부]',
    `- 통찰: ${master.insight} / 위엄: ${master.authority} / 인망: ${master.prestige}`,
    '',
    '[사문 분위기]',
    `- 도의↔무도: ${atmosphere.righteousness} (+ 도의, − 무도)`,
    `- 결속↔균열: ${atmosphere.unity}    (+ 결속, − 균열)`,
    '',
    '[동문]',
    siblingsLine,
    '',
    '[사부 선택]',
    `- tone: ${choice.tone}`,
    `- 본문: ${choice.label}`,
    '',
    '[규칙 기본 변동값 (기준값 — 특별한 이유가 없으면 이 값 근처로 정한다)]',
    `- ${summarizeBaseline(choice.defaultEffects)}`,
    '- 제자 성격·상황상 뚜렷한 이유가 있을 때만 부호·크기를 바꾼다.',
    '',
    '[같은 사건 최근 결정 (5건 이내)]',
    historyLines,
    '',
    '[같은 카테고리 최근 결정 (5건 이내)]',
    categoryHistoryLines,
    '',
    '[변동값 필드 — 해당 없으면 생략. 상황·제자에 따라 음수~양수 자유 결정.]',
    '- trust: 사부 신뢰 (-15~+15)',
    '- stamina: 체력 (-25~+25)',
    '- darknessRisk: 흑화 위험 (-10~+10, +면 악화)',
    '- righteousness: 사문 도의 (-10~+10)',
    '- unity: 사문 결속 (-10~+10)',
    '',
    '[출력 — 반드시 effects 래퍼를 포함한 JSON 한 줄. 아래는 형식 예시일 뿐, 값은 직접 계산하라.]',
    '{"effects":{"trust":0}}',
  ].join('\n');
}

// ─── 응답 파서 ─────────────────────────────────────────────────────────────

interface RawEffects {
  trust?: number;
  stamina?: number;
  darknessRisk?: number;
  righteousness?: number;
  unity?: number;
}

// effects 래퍼를 둘 수도(`{"effects":{"trust":-3}}`), 최상위에 바로 둘 수도(`{"trust":-3}`) 있다.
// 작은 모델이 래퍼를 자주 빠뜨려서 둘 다 허용 (래퍼 우선).
interface LlmRawResponse extends RawEffects {
  effects?: RawEffects;
}

function extractFirstJson(text: string): unknown | null {
  // 모델이 코드펜스나 잡문을 섞을 수 있어 첫 { ... } 균형 매칭.
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

// LLM 이 준 직접 변동값(부호 정수)으로 defaultEffects 를 override 해 새 EventEffects 반환.
// - LLM 이 준 필드만 덮어쓰고, 생략한 필드는 규칙 기본값 유지.
// - 규칙 기본값에 해당 필드가 없으면(=그 모달의 효과 범위 밖) override 하지 않음 → 모달별 스코프 보존.
// - 점수만 받음 (narration 없음 — 사용자 의도).
export function applyAdjustments(
  defaults: EventEffects,
  raw: string,
): { effects: EventEffects } | null {
  const parsed = extractFirstJson(raw) as LlmRawResponse | null;
  if (!parsed) return null;
  // effects 래퍼가 있으면 그 안을, 없으면 최상위를 효과로 본다 (래퍼 값 우선).
  const { effects: wrapped, ...top } = parsed;
  const e: RawEffects = { ...top, ...(wrapped ?? {}) };

  // 인식 가능한 숫자 필드가 하나도 없으면 무효 응답 → 폴백.
  const hasAny = (
    ['trust', 'stamina', 'darknessRisk', 'righteousness', 'unity'] as const
  ).some((k) => typeof e[k] === 'number');
  if (!hasAny) return null;

  const effects: EventEffects = { ...defaults };

  if (defaults.perpetrator) {
    const next: PerpetratorEffect = { ...defaults.perpetrator };
    if (defaults.perpetrator.trustDelta != null && typeof e.trust === 'number') {
      next.trustDelta = clampDelta(e.trust, DELTA_BOUND.trust);
    }
    if (defaults.perpetrator.staminaDelta != null && typeof e.stamina === 'number') {
      next.staminaDelta = clampDelta(e.stamina, DELTA_BOUND.stamina);
    }
    if (defaults.perpetrator.darknessRiskBump != null && typeof e.darknessRisk === 'number') {
      next.darknessRiskBump = clampDelta(e.darknessRisk, DELTA_BOUND.darknessRisk);
    }
    effects.perpetrator = next;
  }

  if (defaults.atmosphere) {
    const next: AtmosphereEffect = { ...defaults.atmosphere };
    if (defaults.atmosphere.righteousnessDelta != null && typeof e.righteousness === 'number') {
      next.righteousnessDelta = clampDelta(e.righteousness, DELTA_BOUND.righteousness);
    }
    if (defaults.atmosphere.unityDelta != null && typeof e.unity === 'number') {
      next.unityDelta = clampDelta(e.unity, DELTA_BOUND.unity);
    }
    effects.atmosphere = next;
  }

  // master, cascade 는 LLM 보정 대상 X — defaults 그대로.
  return { effects };
}
