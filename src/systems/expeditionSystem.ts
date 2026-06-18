// 강호 출행 시스템 — docs/38 §1①. 견문·실전 경험을 얻으러 잠시 강호로 나갔다 귀환.
// 도중 선택형: 여정 중 0~N개 사건이 서신함으로 와 사부가 선택 → 해소돼야 다음 사건·귀환.
// 의뢰(questSystem)의 돌발→강제선택→결산 흐름을 활동에 맞춰 미러. 전투=combat engine,
// 상처=woundSystem, 실전 무공 EXP=questSystem.gainMainSeongExp, 깨달음=attemptQuestEnlightenment 재사용.
// activitySystem 과 순환 의존을 피하려 가용 판정은 자체적으로 둔다(작은 중복 — 의도).

import { random } from '@/systems/rng';
import { findExpeditionDest } from '@/data/expeditions';
import {
  EXPEDITION_EVENTS,
  EXPEDITION_EVENT_BASE,
  EXPEDITION_EVENT_MAX,
} from '@/data/expeditionEvents';
import { useActivityStore } from '@/stores/activityStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useFieldEventStore, type FieldEventChoiceView } from '@/stores/fieldEventStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useJianghuStore } from '@/stores/jianghuStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import { worldThreat } from './worldSystem';
import { combatRating } from './combatPower';
import {
  combatantFromDisciple,
  makeNpcCombatant,
  narrateCombat,
  simulateCombat,
  type NpcArchetype,
} from './combat';
import { addMaterial } from './alchemySystem';
import { inflictWound } from './woundSystem';
import { shiftPersona } from './personaShift';
import { attemptQuestEnlightenment } from './trainingSystem';
import { gainMainSeongExpArts } from './martialExp';
import type { Disciple, Milestone, PersonalityTraits, RelationLevel } from '@/types';
import type {
  ActiveActivity,
  ExpeditionChoice,
  ExpeditionDest,
  ExpeditionEffect,
  ExpeditionEvent,
  ExpeditionEventCategory,
  ExpeditionRoll,
} from '@/types/activity';
import type { CutsceneTone } from '@/data/cutscenes';
import type { Realm } from '@/types/realm';
import type { StatId } from '@/types/training';

// 사건 결 → 컷씬 한자·톤(그레이박스). 전투·위기=혈(붉음), 인연·횡재=금, 풍문=먹.
const EXP_CAT_SCENE: Record<ExpeditionEventCategory, { hanzi: string; tone: CutsceneTone }> = {
  combat: { hanzi: '戰', tone: 'blood' },
  crisis: { hanzi: '危', tone: 'blood' },
  bond: { hanzi: '緣', tone: 'gold' },
  fortune: { hanzi: '財', tone: 'gold' },
  rumor: { hanzi: '聞', tone: 'ink' },
};

// ─── 가용·게이트 ─────────────────────────────────────────────────────────
function isFree(d: Disciple): boolean {
  // 폐관(meditating) 제외 — 폐관 override 중 출행하면 override 가 고아로 남는다(docs/37 C2).
  return d.status === 'training' || d.status === 'resting';
}

function combatSeong(d: Disciple): number {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  return (mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong : 0) ?? 0;
}

// 파티가 행선 조건을 충족하나. 위험 행선은 전투원 동행 권장(소프트 — 험지는 하드 게이트).
export function canExpedition(
  dest: ExpeditionDest,
  party: Disciple[],
): { ok: boolean; reason?: string } {
  if (party.length === 0) return { ok: false, reason: '내보낼 제자를 고르세요.' };
  if (party.some((d) => !isFree(d)))
    return { ok: false, reason: '다른 일(의뢰·연단·요양) 중인 제자는 보낼 수 없습니다.' };
  // 험지 원행은 싸울 수 있는 동문이 없으면 위태롭다 — 전투원(주력 2성+) 하드 게이트.
  if (dest.needsCombatParty && dest.danger >= 0.6 && !party.some((d) => combatSeong(d) >= 2))
    return { ok: false, reason: '험한 원행입니다 — 싸울 수 있는 동문이 필요합니다.' };
  return { ok: true };
}

// ─── 발행 ────────────────────────────────────────────────────────────────

// 사건 예정 건수·발동일 산정 — 기대 ≈ danger × (days/4) × (1+정세) × BASE, 0~MAX 클램프.
function planEventDays(dest: ExpeditionDest, startedDay: number, dueDay: number): number[] {
  const threat = worldThreat(useJianghuStore.getState().world);
  const expected = dest.danger * (dest.days / 4) * (1 + threat) * EXPEDITION_EVENT_BASE;
  let count = Math.floor(expected);
  if (random() < expected - count) count += 1;
  count = Math.max(0, Math.min(EXPEDITION_EVENT_MAX, count));
  const span = Math.max(1, dueDay - startedDay);
  const days: number[] = [];
  for (let i = 1; i <= count; i += 1) {
    days.push(startedDay + Math.max(1, Math.round((span * i) / (count + 1))));
  }
  return days;
}

export function dispatchExpedition(destId: string, discipleIds: string[]): boolean {
  const dest = findExpeditionDest(destId);
  if (!dest) return false;
  const ds = useDiscipleStore.getState();
  const party = discipleIds.map((id) => ds.disciples[id]).filter((d): d is Disciple => d != null);
  if (party.length !== discipleIds.length) return false;
  if (!canExpedition(dest, party).ok) return false;
  const today = useTimeStore.getState().totalDay;
  const dueDay = today + dest.days;
  useActivityStore.getState().add({
    id: `act-exp-${destId}-${today}`,
    kind: 'expedition',
    destId,
    discipleIds,
    startedDay: today,
    dueDay,
    eventDays: planEventDays(dest, today, dueDay),
    firedCount: 0,
    journal: [],
  });
  for (const id of discipleIds) ds.update(id, { status: 'questing' });
  return true;
}

// ─── 사건 발동(도중 선택형) ──────────────────────────────────────────────

// 직렬화 선택지 — 서신함 payload·해소에 쓰임. 게이트는 발동 시점에 미리 평가.
export interface ExpeditionChoiceView {
  key: string;
  label: string;
  available: boolean;
  note?: string;
  effect: ExpeditionEffect;
  failEffect?: ExpeditionEffect;
  roll?: ExpeditionRoll;
  cost: number;
}

function partyOf(active: ActiveActivity): Disciple[] {
  const ds = useDiscipleStore.getState();
  return active.discipleIds.map((id) => ds.disciples[id]).filter((d): d is Disciple => d != null);
}

// 파티의 판정 역량 0~100 (무공=주력 성×10, 그 외=능력치 Lv 최고).
function capValue(active: ActiveActivity, by: ExpeditionRoll['by']): number {
  const party = partyOf(active);
  if (by === 'martial') return party.reduce((m, d) => Math.max(m, combatSeong(d) * 10), 0);
  return party.reduce((m, d) => Math.max(m, d.stats?.[by as StatId]?.level ?? 0), 0);
}

function evalRequire(active: ActiveActivity, c: ExpeditionChoice): { available: boolean; note?: string } {
  const req = c.require;
  if (!req) return { available: true };
  const party = partyOf(active);
  if (req.stat && req.min != null) {
    const max = party.reduce((m, d) => Math.max(m, d.stats?.[req.stat as StatId]?.level ?? 0), 0);
    if (max < req.min) return { available: false, note: `해당 역량 ${req.min}↑ 필요` };
  }
  if (req.martialSeong != null) {
    const max = party.reduce((m, d) => Math.max(m, combatSeong(d)), 0);
    if (max < req.martialSeong) return { available: false, note: `무공 ${req.martialSeong}성↑ 필요` };
  }
  if (req.money != null && (useSectStore.getState().sect?.resources ?? 0) < req.money) {
    return { available: false, note: `노자 ${req.money} 필요` };
  }
  return { available: true };
}

function pickEvent(dest: ExpeditionDest): ExpeditionEvent | null {
  const pool = EXPEDITION_EVENTS.filter((e) => (e.minDanger ?? 0) <= dest.danger);
  if (pool.length === 0) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}

function fireEvent(active: ActiveActivity, dest: ExpeditionDest): void {
  const event = pickEvent(dest);
  const fired = (active.firedCount ?? 0) + 1;
  if (!event) {
    useActivityStore.getState().updateActive(active.id, { firedCount: fired });
    return;
  }
  const ds = useDiscipleStore.getState();
  const names = active.discipleIds.map((id) => ds.disciples[id]?.name ?? '?').join('·');
  const choices: ExpeditionChoiceView[] = event.choices.map((c) => {
    const { available, note } = evalRequire(active, c);
    return {
      key: c.key,
      label: c.label,
      available,
      note,
      effect: c.effect,
      failEffect: c.failEffect,
      roll: c.roll,
      cost: c.require?.money ?? 0,
    };
  });
  // 현장 급보 — 서신함이 아니라 컷씬+모달로 그 자리에서 선택. 사건 결마다 한자·톤. docs/20·38.
  const scene = EXP_CAT_SCENE[event.category];
  const evId = `xevent-${active.id}-${event.id}-${fired}`;
  useFieldEventStore.getState().push({
    id: evId,
    source: 'expedition',
    refId: active.id,
    title: `강호 출행 — ${dest.name}`,
    hanzi: scene.hanzi,
    tone: scene.tone,
    sceneLine: `${names}의 여정 중, 길 위에서 일이 벌어졌다.`,
    prompt: event.prompt,
    who: names,
    choices: choices as unknown as FieldEventChoiceView[],
  });
  useActivityStore.getState().updateActive(active.id, { firedCount: fired, pendingEventId: evId });
}

// ─── 선택 효과 적용 ───────────────────────────────────────────────────────

// 행선 위험도 → 맞붙는 상대의 격(경지·영글기). 강호의 길에서 만나는 잡배~고수.
function foeForDanger(danger: number): { realm: Realm; quality: number } {
  if (danger >= 0.6) {
    return { realm: random() < 0.3 ? 'jeoljeong' : 'ilryu', quality: 0.4 + random() * 0.5 };
  }
  if (danger >= 0.35) {
    return { realm: random() < 0.3 ? 'ilryu' : 'iryu', quality: 0.4 + random() * 0.4 };
  }
  return { realm: random() < 0.4 ? 'iryu' : 'samryu', quality: 0.3 + random() * 0.4 };
}

const EXP_ARCHETYPES: NpcArchetype[] = ['orthodox', 'rogue', 'soldier', 'assassin'];

// 실전 EXP — 그레이박스(의뢰 보통급 1판 어림). 승리 시만.
const EXP_SEONG_WIN = 40;
const EXP_BODY_WIN = 30;
const EXP_INTERNAL_WIN = 2;

// 전투 사건 — 대표(무위 최고)가 행선 격의 상대와 한 판. 즉사 없음(lethal:false). 승패가 보상·상처를 정함.
function resolveCombat(active: ActiveActivity, dest: ExpeditionDest, e: ExpeditionEffect): string {
  const ds = useDiscipleStore.getState();
  const party = partyOf(active).filter((d) => d.status !== 'departed');
  if (party.length === 0) return e.resultText;
  const champion = party.reduce((a, b) => (combatRating(a) >= combatRating(b) ? a : b));
  const foe = foeForDanger(dest.danger);
  const npc = makeNpcCombatant({
    id: 'exp-foe',
    name: '강호의 맞수',
    realm: foe.realm,
    archetype: EXP_ARCHETYPES[Math.floor(random() * EXP_ARCHETYPES.length)],
    quality: foe.quality,
  });
  const r = simulateCombat([combatantFromDisciple(champion)], [npc], {
    mode: 'real',
    lethal: false, // 강호 출행은 즉사 없음(Phase 2) — 치명상도 중상으로 살아 돌아온다
    allowRetreat: true,
  });
  const me = r.combatants.find((c) => c.id === champion.id);
  const won = r.winner === 'A';

  if (won) {
    const arts = gainMainSeongExpArts(champion, EXP_SEONG_WIN);
    if (arts) ds.update(champion.id, { martialArts: arts });
    ds.addStatExp(champion.id, 'strength', EXP_BODY_WIN);
    const rp = champion.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
    ds.update(champion.id, { realmProgress: { ...rp, internal: rp.internal + EXP_INTERNAL_WIN } });
    if (e.enlighten) attemptQuestEnlightenment(champion.id, 0.25);
    applyNonCombat(active, { ...e, combat: false, resultText: '' }); // 전투 효과에 딸린 전리품(명성·재물 등) 적용
    // 만신창이 승리 — 가벼운 생채기는 남는다.
    if (me?.wound && me.wound.severity <= 3) {
      inflictWound(champion.id, dest.woundType, me.wound.severity, me.wound.days);
    }
  } else {
    // 패배·물러남 — 몸을 상하고 돌아온다(치명상도 중상으로 생존).
    const sev = me?.wound ? Math.max(2, me.wound.severity) : 3;
    const days = me?.wound?.days ?? 21;
    inflictWound(champion.id, dest.woundType, sev, days);
  }
  return `${e.resultText}\n${narrateCombat(r)}`;
}

// 비전투 효과 — 즉시 적용(재물·재료·명성·관계·인격·상처·풍문).
function applyNonCombat(active: ActiveActivity, e: ExpeditionEffect): void {
  const ds = useDiscipleStore.getState();
  const present = partyOf(active);
  if (e.money) useSectStore.getState().adjustResources(e.money);
  if (e.material) addMaterial(e.material.id, e.material.qty);
  if (e.fame) for (const d of present) ds.update(d.id, { fame: (d.fame ?? 0) + e.fame });
  if (e.relationBump) relBump(present.map((d) => d.id));
  if (e.persona || e.stressDelta) {
    for (const d of present) {
      if (e.persona) ds.update(d.id, { personality: shiftPersona(d, e.persona as Partial<PersonalityTraits>) });
      if (e.stressDelta) ds.adjustStress(d.id, e.stressDelta);
    }
  }
  if (e.woundSeverity) {
    const dest = active.destId ? findExpeditionDest(active.destId) : undefined;
    const victim = present[Math.floor(random() * present.length)];
    if (victim && dest) inflictWound(victim.id, dest.woundType, e.woundSeverity, (6 - e.woundSeverity) * 5);
  }
  if (e.jianghuNews) {
    const day = useTimeStore.getState().totalDay;
    useInboxStore.getState().add({
      id: `xnews-${active.id}-${day}`,
      kind: 'report',
      title: '강호 풍문',
      preview: e.jianghuNews,
      body: e.jianghuNews,
      priority: 'normal',
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: { domain: 'jianghu_news' },
    });
  }
}

const REL_UP: Record<RelationLevel, RelationLevel> = {
  enemy: 'distant',
  distant: 'neutral',
  neutral: 'friend',
  friend: 'sworn',
  sworn: 'sworn',
};
function relBump(ids: string[]): void {
  const ds = useDiscipleStore.getState();
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ds.disciples[ids[i]];
      const b = ds.disciples[ids[j]];
      if (!a || !b) continue;
      ds.setRelation(ids[i], ids[j], REL_UP[a.relationships[ids[j]] ?? 'neutral']);
      ds.setRelation(ids[j], ids[i], REL_UP[b.relationships[ids[i]] ?? 'neutral']);
    }
  }
}

// 서신함 해소 → 선택 효과 적용. inboxResolve 에서 호출.
export function applyExpeditionEventChoice(activityId: string, choice: ExpeditionChoiceView): void {
  const store = useActivityStore.getState();
  const active = store.active.find((a) => a.id === activityId);
  if (!active) return;
  const dest = active.destId ? findExpeditionDest(active.destId) : undefined;
  if (choice.cost > 0) useSectStore.getState().adjustResources(-choice.cost);

  // 확률 판정 — 현재 역량 기반. 실패면 failEffect.
  let e = choice.effect;
  if (choice.roll) {
    const cap = capValue(active, choice.roll.by);
    const p = Math.max(0.1, Math.min(0.95, choice.roll.base + (cap / 100) * (1 - choice.roll.base)));
    if (random() >= p) e = choice.failEffect ?? { resultText: '일은 뜻대로 풀리지 않았다.' };
  }

  const text = e.combat && dest ? resolveCombat(active, dest, e) : (applyNonCombat(active, e), e.resultText);

  // 여정 일지에 결말 적재 + 즉시 결과 서신(읽기 전용).
  const journal = [...(active.journal ?? []), text];
  store.updateActive(activityId, { journal, pendingEventId: undefined });
  const day = useTimeStore.getState().totalDay;
  const leadName = useDiscipleStore.getState().disciples[active.discipleIds[0]]?.name ?? '제자';
  useInboxStore.getState().add({
    id: `xresult-${activityId}-${day}`,
    kind: 'report',
    title: `${leadName} — 출행 중`,
    preview: text,
    body: text,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'expedition_event_result' },
  });
}

// ─── 귀환 결산 ────────────────────────────────────────────────────────────
function settleExpedition(active: ActiveActivity): Milestone | null {
  const ds = useDiscipleStore.getState();
  const dest = active.destId ? findExpeditionDest(active.destId) : undefined;
  const party = partyOf(active);
  if (!dest || party.length === 0) return null;

  // 귀환 — 여정 중 다치지 않은(아직 questing) 제자는 일과로 복귀.
  for (const d of party) if (d.status === 'questing') ds.update(d.id, { status: 'training' });

  const names = party.map((d) => d.name).join('·');
  const lead = party[0];
  const journal = active.journal ?? [];
  const body =
    journal.length > 0
      ? `강호 출행 — ${dest.name} (${names})\n\n${journal.join('\n\n')}`
      : `강호 출행 — ${dest.name} (${names})\n별다른 일 없이 견문만 넓히고 무탈히 돌아왔다.`;

  return {
    id: `exp-${active.id}-${active.dueDay}`,
    kind: 'quest', // 파견 결산 — 의뢰와 같은 서신 경로 재사용.
    discipleId: lead.id,
    discipleName: lead.name,
    title: `출행 귀환 — ${dest.name}`,
    body,
  };
}

// activitySystem.tickActivities 가 expedition 활동마다 위임 — 사건 발동 또는 귀환 결산.
// 반환: 결산 마일스톤(귀환 시) 또는 null(진행 중·사건 대기). 활동 제거 여부는 두 번째 값.
export function tickExpedition(active: ActiveActivity): { milestone: Milestone | null; done: boolean } {
  const today = useTimeStore.getState().totalDay;
  if (active.pendingEventId) return { milestone: null, done: false }; // 미해소 사건 — 보류
  const dest = active.destId ? findExpeditionDest(active.destId) : undefined;
  const fired = active.firedCount ?? 0;
  const days = active.eventDays ?? [];
  // 예정된 다음 사건일이 도래 — 발동(서신 강제선택). 한 번에 하나.
  if (dest && fired < days.length && today >= days[fired]) {
    fireEvent(active, dest);
    return { milestone: null, done: false };
  }
  // 기한 도래 + 사건 전부 소화 → 귀환 결산.
  if (today >= active.dueDay && fired >= days.length) {
    return { milestone: settleExpedition(active), done: true };
  }
  return { milestone: null, done: false };
}
