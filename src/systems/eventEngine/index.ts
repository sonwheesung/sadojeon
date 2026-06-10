// 공통 이벤트 엔진 메인 — docs/07 "공통 엔진".
// Phase A: moral 도메인만 흡수. 기존 데이터 형식(MoralChoice 등) 은 어댑터로 EventChoice 로 변환.
//
// 흐름:
//   advanceTurn() → dailyTick(['moral'])
//     1) 도메인별 풀 → eligible 쌍 수집 → tier 가중치 픽
//     2) placeholder 치환 + hint 픽 → 도메인별 pending store set
//   사용자 4선택 → resolveChoice('moral', tone)
//     1) Resolver 선택 (LLM eligible & enabled → LlmResolver else RuleResolver)
//     2) 효과 적용 + history push + pending clear

import { ALL_MORAL_EVENTS, TIER_WEIGHT } from '@/data/scenarios/moralEvents';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useEventHistoryStore } from '@/stores/eventHistoryStore';
import { useMasterStore } from '@/stores/masterStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  Disciple,
  DiscipleSnapshot,
  EventChoice,
  EventDomain,
  EventTemplate,
  InsightTier,
  MasterSnapshot,
  MoralChoice,
  MoralChoiceTone,
  MoralEventTemplate,
  PendingMoralEvent,
  SiblingSummary,
} from '@/types';

import { usePendingStore } from '@/stores/pendingStore';

import { applyAllEffects } from './applyEffects';
import { applyRivalryTone } from '../mediationSystem';
import { llmResolver } from './llmResolver';
import { collectEligible, pickByTier } from './triggers';
import { ruleResolver } from './ruleResolver';
import type { EventResolver, ResolveInput } from './resolver';

// ─── 어댑터 — 기존 MoralEventTemplate → EventTemplate<MoralChoiceTone> ──────

function adaptChoice(c: MoralChoice): EventChoice<MoralChoiceTone> {
  return {
    tone: c.tone,
    label: c.label,
    defaultEffects: {
      perpetrator: c.perpetrator,
      master: c.master,
      atmosphere: c.atmosphere,
      cascade: c.cascade,
    },
  };
}

function adaptTemplate(t: MoralEventTemplate): EventTemplate<MoralChoiceTone> {
  return {
    id: t.id,
    domain: 'moral',
    tier: t.tier,
    category: t.category,
    trigger: t.trigger,
    scenario: t.scenario,
    choices: t.choices.map(adaptChoice),
    insightHints: t.insightHints,
    // D1 정책: universal 은 룰만, archetype·personal 만 LLM 보정
    llmEligible: t.tier !== 'universal',
  };
}

const ALL_MORAL_TEMPLATES: ReadonlyArray<EventTemplate<MoralChoiceTone>> =
  ALL_MORAL_EVENTS.map(adaptTemplate);

function findTemplate(id: string): EventTemplate<MoralChoiceTone> | undefined {
  return ALL_MORAL_TEMPLATES.find((t) => t.id === id);
}

// ─── 도덕 이벤트 일일 트리거 ───────────────────────────────────────────────

const MORAL_DAILY_CHANCE = 0.018;

function pickSibling(perp: Disciple, tmpl: EventTemplate<string>): Disciple | null {
  const ds = useDiscipleStore.getState();
  const required = tmpl.trigger.requireSiblingId;
  if (required) return ds.disciples[required] ?? null;
  const others = ds.order
    .map((id) => ds.disciples[id])
    .filter(
      (d): d is Disciple =>
        d != null &&
        d.id !== perp.id &&
        (d.status === 'training' || d.status === 'resting' || d.status === 'meditating'),
    );
  if (others.length === 0) return null;
  return others[Math.floor(Math.random() * others.length)];
}

function interpolate(text: string, perp: string, sib?: string): string {
  return text.replace(/\{name\}/g, perp).replace(/\{sibling\}/g, sib ?? '동문');
}

function insightTier(insight: number): InsightTier {
  if (insight >= 80) return 5;
  if (insight >= 60) return 4;
  if (insight >= 40) return 3;
  if (insight >= 20) return 2;
  return 1;
}

function pickHint(
  tmpl: EventTemplate<string>,
  tier: InsightTier,
  perp: Disciple,
  sib: Disciple | null,
): string | undefined {
  const hints = tmpl.insightHints;
  if (!hints) return undefined;
  for (let k = tier; k >= 1; k--) {
    const h = hints[k as InsightTier];
    if (h) return interpolate(h, perp.name, sib?.name);
  }
  return undefined;
}

function triggerMoralOnce(): void {
  if (useMoralEventStore.getState().pending) return;
  if (Math.random() >= MORAL_DAILY_CHANCE) return;

  const pairs = collectEligible(ALL_MORAL_TEMPLATES);
  const picked = pickByTier(pairs, TIER_WEIGHT);
  if (!picked) return;

  const sibling = pickSibling(picked.disciple, picked.template);
  const body = interpolate(picked.template.scenario, picked.disciple.name, sibling?.name);
  const insight = useMasterStore.getState().master?.stats.insight ?? 0;
  const hint = pickHint(picked.template, insightTier(insight), picked.disciple, sibling);

  // 기존 PendingMoralEvent 형식 그대로 (UI 호환). adapt 한 choices 도 함께.
  const pending: PendingMoralEvent = {
    templateId: picked.template.id,
    tier: picked.template.tier,
    category: picked.template.category as PendingMoralEvent['category'],
    discipleId: picked.disciple.id,
    discipleName: picked.disciple.name,
    siblingId: sibling?.id,
    siblingName: sibling?.name,
    body,
    hint,
    // pending UI 는 기존 MoralChoice[] 를 그대로 받음 — 원본 풀에서 가져옴.
    choices: ALL_MORAL_EVENTS.find((t) => t.id === picked.template.id)!.choices,
    createdAtDay: useTimeStore.getState().totalDay,
  };
  useMoralEventStore.getState().set(pending);
}

// ─── Resolver 선택 ─────────────────────────────────────────────────────────

function selectResolver(template: EventTemplate<string>): EventResolver {
  if (!template.llmEligible) return ruleResolver;
  // LlmResolver 내부에서 enabled·cap·ready 게이트 통과 못하면 자체 폴백.
  return llmResolver;
}

// ─── ResolveInput 빌더 ─────────────────────────────────────────────────────

function buildPerpetratorSnapshot(d: Disciple): DiscipleSnapshot {
  return {
    id: d.id,
    name: d.name,
    personality: d.personality,
    trustToMaster: d.trustToMaster,
    stamina: d.stamina,
    darknessLevel: d.darknessLevel,
    darknessRisk: d.darknessRisk,
  };
}

function buildMasterSnapshot(): MasterSnapshot {
  const m = useMasterStore.getState().master;
  if (!m) return { insight: 0, authority: 0, prestige: 0 };
  return {
    insight: m.stats.insight,
    authority: m.stats.authority,
    prestige: m.stats.prestige,
  };
}

function buildSiblingSummaries(perpId: string): SiblingSummary[] {
  const ds = useDiscipleStore.getState();
  return ds.order
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null && d.id !== perpId)
    .map((d) => ({
      id: d.id,
      name: d.name,
      relation: d.relationships[perpId] ?? 'neutral',
    }));
}

// ─── Public API ────────────────────────────────────────────────────────────

export function dailyTick(domains: ReadonlyArray<EventDomain>): void {
  for (const d of domains) {
    if (d === 'moral') triggerMoralOnce();
    // 추후 oneLiner/wish/milestone/recruit 흡수
  }
}

export async function resolveChoice(
  domain: EventDomain,
  tone: string,
): Promise<void> {
  if (domain === 'moral') {
    await resolveMoral(tone as MoralChoiceTone);
  }
}

async function resolveMoral(tone: MoralChoiceTone): Promise<void> {
  const moralStore = useMoralEventStore.getState();
  const pending = moralStore.pending;
  if (!pending) return;

  const template = findTemplate(pending.templateId);
  const choice = template?.choices.find((c) => c.tone === tone);
  const perpetrator = useDiscipleStore.getState().disciples[pending.discipleId];

  // 선택 즉시 모달 닫기 — 사용자는 LLM 응답을 기다리지 않고 계속 진행. 해결은 백그라운드.
  moralStore.clear();
  if (!template || !choice || !perpetrator) return;

  const input: ResolveInput = {
    template,
    choice,
    perpetrator: buildPerpetratorSnapshot(perpetrator),
    master: buildMasterSnapshot(),
    atmosphere: useSectAtmosphereStore.getState().atmosphere,
    siblings: buildSiblingSummaries(perpetrator.id),
    history: useEventHistoryStore.getState().sliceFor(template.id, template.category),
  };
  const resolver = selectResolver(template);

  const pendingStore = usePendingStore.getState();
  pendingStore.beginResolution();
  try {
    const output = await resolver.resolve(input);

    applyAllEffects(output.effects, perpetrator.id, perpetrator.name, pending.siblingName);

    // 적대 페어 개인 이벤트 → 실제 관계 배선 — 훈계=화해 노선·묵인=심화. docs/33 §4.
    if (pending.siblingId) applyRivalryTone(perpetrator.id, pending.siblingId, tone);

    const day = useTimeStore.getState().totalDay;
    useEventHistoryStore.getState().push({
      id: `${day}-${template.id}-${perpetrator.id}-${Math.random().toString(36).slice(2, 6)}`,
      day,
      domain: 'moral',
      templateId: template.id,
      category: template.category,
      tier: template.tier,
      discipleId: perpetrator.id,
      discipleName: perpetrator.name,
      siblingId: pending.siblingId,
      tone,
      appliedEffects: output.effects,
      llmCalled: output.llmCalled,
      narration: output.narration,
    });

    // 결과는 다음 정산 모달에 누적 표시.
    usePendingStore.getState().pushLlmDebug({
      source: 'moral',
      discipleName: perpetrator.name,
      llmCalled: output.llmCalled,
      prompt: output.llmPrompt,
      raw: output.llmRaw,
    });
  } finally {
    usePendingStore.getState().endResolution();
  }
}
