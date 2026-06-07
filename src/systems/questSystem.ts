// 의뢰 시스템 — docs/28 §4 경로 B. 파견·진행·결산.
// 게시판(사문 명성 게이트) → 파견(1~N명) → 주(일) 진행 → 결산 outcome 5분기.
// 도메인 성장(능력치 EXP) + 자금 + 명성(제자·사문) + 위험(부상·사망).

import {
  QUEST_DOMAIN_LABEL,
  QUEST_DOMAIN_RIGHTEOUSNESS,
  QUEST_DOMAIN_STAT,
  QUEST_GRADE_LABEL,
  QUEST_GRADE_ORDER,
  QUEST_GRADE_RISK,
  QUEST_POOL,
  maxGradeForReputation,
} from '@/data/quests';
import { QUEST_EVENTS, QUEST_EVENT_CHANCE } from '@/data/questEvents';
import { findMartialArt, expToNextSeong, seongCap } from '@/data/martialArts';
import { REALM_SEONG_CAP } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useQuestStore } from '@/stores/questStore';
import { useSectStore } from '@/stores/sectStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import { applyQuestReputation } from './reputationSystem';
import { STAT_LABEL, type StatId } from '@/types/training';
import type {
  ActiveQuest,
  Disciple,
  Milestone,
  PersonalityTraits,
  Quest,
  QuestDomain,
  QuestEvent,
  QuestEventChoice,
  QuestEventEffect,
  QuestEventRoll,
  QuestOutcome,
  RelationLevel,
} from '@/types';

// ─── 역량·자격 ────────────────────────────────────────────────────────────

// 제자의 의뢰 도메인 역량 0~100. (stat 도메인=능력치 Lv, duel/grand=주력 무공 성×10)
export function capability(d: Disciple, domain: QuestDomain): number {
  const stat = QUEST_DOMAIN_STAT[domain];
  if (stat) return d.stats?.[stat]?.level ?? 0;
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const seong = (mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong : 0) ?? 0;
  if (domain === 'grand') {
    return Math.max(seong * 10, d.stats?.guarding?.level ?? 0, d.stats?.scouting?.level ?? 0);
  }
  return seong * 10; // duel
}

// 적합 가늠 풍경 (효율 등급 직접 노출 X — feedback_hidden_game_state).
export function fitPhrase(d: Disciple, q: Quest): string {
  const gap = capability(d, q.domain) - q.minStat;
  if (gap >= 30) return '이 일에 능하다';
  if (gap >= 0) return '해볼 만하다';
  if (gap >= -25) return '버거워 보인다';
  return '무리다';
}

// 극험은 하드 게이트(자격 미달 파견 불가). 그 외는 소프트(보내되 성공률↓·위험↑).
export function canDispatch(d: Disciple, q: Quest): boolean {
  if (d.status !== 'training') return false;
  if (q.grade === 'extreme') return capability(d, q.domain) >= q.minStat;
  return true;
}

// ─── 게시판 ───────────────────────────────────────────────────────────────

// 사문 명성 구간 ≤ 등급 의뢰 중 최대 6개 랜덤. 활성 의뢰는 제외.
export function generateBoard(): void {
  const rep = useSectStore.getState().sect?.reputation ?? 10;
  const maxIdx = QUEST_GRADE_ORDER.indexOf(maxGradeForReputation(rep));
  const activeIds = new Set(useQuestStore.getState().active.map((a) => a.quest.id));
  const pool = QUEST_POOL.filter(
    (q) => QUEST_GRADE_ORDER.indexOf(q.grade) <= maxIdx && !activeIds.has(q.id),
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
  useQuestStore.getState().setBoard(shuffled);
}

// ─── 파견 ─────────────────────────────────────────────────────────────────

export function dispatchQuest(questId: string, discipleIds: string[]): boolean {
  const qs = useQuestStore.getState();
  const quest = qs.board.find((q) => q.id === questId);
  if (!quest || discipleIds.length === 0) return false;
  const ds = useDiscipleStore.getState();
  for (const id of discipleIds) {
    const d = ds.disciples[id];
    if (!d || !canDispatch(d, quest)) return false;
  }
  const today = useTimeStore.getState().totalDay;
  qs.addActive({ quest, discipleIds, startedDay: today, dueDay: today + quest.weeks * 7 });
  qs.removeFromBoard(questId);
  for (const id of discipleIds) ds.update(id, { status: 'questing' });
  return true;
}

// ─── 결산 ─────────────────────────────────────────────────────────────────

// ─── 의뢰 중 돌발 이벤트 ─────────────────────────────────────────────────

function mainSeongOf(d: Disciple): number {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  return (mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong : 0) ?? 0;
}

// 직렬화된 선택지 — 서신함 payload·해소에 쓰임. 게이트는 발동 시점에 미리 평가.
export interface QuestEventChoiceView {
  key: string;
  label: string;
  available: boolean;
  note?: string;
  effect: QuestEventEffect;
  failEffect?: QuestEventEffect;
  roll?: QuestEventRoll;
  cost: number;
}

// 파티의 판정 역량 0~100 (무공=주력 성×10, 그 외=능력치 Lv 최고).
function capValue(active: ActiveQuest, by: QuestEventRoll['by']): number {
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null);
  if (by === 'martial') return party.reduce((m, d) => Math.max(m, mainSeongOf(d) * 10), 0);
  return party.reduce((m, d) => Math.max(m, d.stats?.[by as StatId]?.level ?? 0), 0);
}

function evalRequire(active: ActiveQuest, c: QuestEventChoice): { available: boolean; note?: string } {
  const req = c.require;
  if (!req) return { available: true };
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null);
  if (req.stat && req.min != null) {
    const max = party.reduce((m, d) => Math.max(m, d.stats?.[req.stat as StatId]?.level ?? 0), 0);
    if (max < req.min) return { available: false, note: `${STAT_LABEL[req.stat as StatId]} ${req.min}↑ 필요` };
  }
  if (req.martialSeong != null) {
    const max = party.reduce((m, d) => Math.max(m, mainSeongOf(d)), 0);
    if (max < req.martialSeong) return { available: false, note: `무공 ${req.martialSeong}성↑ 필요` };
  }
  if (req.money != null) {
    if ((useSectStore.getState().sect?.resources ?? 0) < req.money) {
      return { available: false, note: `자금 ${req.money} 필요` };
    }
  }
  return { available: true };
}

function pickEvent(active: ActiveQuest): QuestEvent | null {
  const gradeIdx = QUEST_GRADE_ORDER.indexOf(active.quest.grade);
  const pool = QUEST_EVENTS.filter(
    (e) =>
      e.domains.includes(active.quest.domain) &&
      (!e.minGrade || QUEST_GRADE_ORDER.indexOf(e.minGrade) <= gradeIdx),
  );
  if (pool.length === 0) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}

// 중반 1회 — 등급 확률로 돌발 이벤트 발동 → 서신함 강제 선택(결산 보류).
function maybeFireEvent(active: ActiveQuest): void {
  if (Math.random() >= QUEST_EVENT_CHANCE[active.quest.grade]) return;
  const event = pickEvent(active);
  if (!event) return;
  const ds = useDiscipleStore.getState();
  const leadName = ds.disciples[active.discipleIds[0]]?.name ?? '제자';
  const names = active.discipleIds.map((id) => ds.disciples[id]?.name ?? '?').join('·');
  const choices: QuestEventChoiceView[] = event.choices.map((c) => {
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
  const itemId = `qevent-${active.quest.id}-${event.id}`;
  useInboxStore.getState().add({
    id: itemId,
    kind: 'event',
    eventId: event.id,
    title: `${leadName} — 의뢰 중 급보`,
    preview: `[${QUEST_GRADE_LABEL[active.quest.grade]}·${QUEST_DOMAIN_LABEL[active.quest.domain]}] ${active.quest.title} (${names})\n${event.prompt}`,
    priority: 'high',
    createdAtDay: useTimeStore.getState().totalDay,
    read: false,
    resolved: false,
    payload: { domain: 'quest_event', questId: active.quest.id, choices },
  });
  useQuestStore.getState().updateActive(active.quest.id, { pendingEventId: itemId });
}

// 서신함 해소 → 선택 효과를 의뢰·제자에 적용. inboxResolve 에서 호출.
export function applyQuestEventChoice(questId: string, choice: QuestEventChoiceView): void {
  const qs = useQuestStore.getState();
  const active = qs.active.find((a) => a.quest.id === questId);
  if (!active) return;
  if (choice.cost > 0) useSectStore.getState().adjustResources(-choice.cost);

  // 확률 판정 — 현재 스탯/무공으로 성공률. 실패면 failEffect.
  let e = choice.effect;
  if (choice.roll) {
    const cap = capValue(active, choice.roll.by);
    const p = Math.max(0.1, Math.min(0.95, choice.roll.base + (cap / 100) * (1 - choice.roll.base)));
    if (Math.random() >= p) e = choice.failEffect ?? {};
  }

  qs.updateActive(questId, {
    successDelta: (active.successDelta ?? 0) + (e.successDelta ?? 0),
    riskDelta: (active.riskDelta ?? 0) + (e.riskDelta ?? 0),
    rewardMult: (active.rewardMult ?? 1) * (e.rewardMult ?? 1),
    rewardFlag: e.rewardFlag ?? active.rewardFlag,
    pendingEventId: undefined,
  });
  if (e.persona || e.stressDelta) {
    const ds = useDiscipleStore.getState();
    for (const id of active.discipleIds) {
      const d = ds.disciples[id];
      if (!d) continue;
      if (e.persona) {
        const persona: PersonalityTraits = { ...d.personality };
        for (const k of Object.keys(e.persona)) {
          const kk = k as keyof PersonalityTraits;
          persona[kk] = Math.max(1, Math.min(100, persona[kk] + (e.persona[k] ?? 0)));
        }
        ds.update(id, { personality: persona });
      }
      if (e.stressDelta) ds.adjustStress(id, e.stressDelta);
    }
  }

  // 결과 서신 — 사부가 급보의 결말을 전해 듣는다(읽기만).
  const day = useTimeStore.getState().totalDay;
  const leadName = useDiscipleStore.getState().disciples[active.discipleIds[0]]?.name ?? '제자';
  const text = e.resultText ?? '강호의 일은 그렇게 지나갔다.';
  useInboxStore.getState().add({
    id: `qresult-${questId}-${day}`,
    kind: 'report',
    title: `${leadName} — 의뢰 중`,
    preview: text,
    body: text,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'quest_event_result' },
  });
}

// ─── 결산 ─────────────────────────────────────────────────────────────────

const OUTCOME_LABEL: Record<QuestOutcome, string> = {
  full: '완수',
  partial: '성공',
  crisis: '위기 끝에 성공',
  fail: '실패',
  disaster: '재난',
};

// outcome별 보상 배수 [money, fame, growth].
const OUTCOME_SCALE: Record<QuestOutcome, { money: number; fame: number; growth: number }> = {
  full: { money: 1, fame: 1, growth: 1 },
  partial: { money: 0.6, fame: 0.5, growth: 0.6 },
  crisis: { money: 1, fame: 1, growth: 1 },
  fail: { money: 0.1, fame: 0, growth: 0.2 },
  disaster: { money: 0, fame: 0, growth: 0 },
};

function rollOutcome(active: ActiveQuest): QuestOutcome {
  const q = active.quest;
  const ds = useDiscipleStore.getState();
  const caps = active.discipleIds
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null)
    .map((d) => capability(d, q.domain));
  const avg = caps.length ? caps.reduce((a, b) => a + b, 0) / caps.length : 0;
  const headFactor = active.discipleIds.length / Math.max(1, q.recommended);
  let s = (avg - q.minStat) / Math.max(20, q.minStat) + (headFactor - 1) * 0.4;
  // 조합 시너지 — 자격 있는 동행이 둘 이상이면 합공·정탐 더블 보너스. docs/28 §7.
  const capable = caps.filter((c) => c >= q.minStat).length;
  s += Math.max(0, capable - 1) * 0.12;
  s += active.successDelta ?? 0; // 돌발 이벤트 선택 보정
  s = Math.max(-1, Math.min(1.5, s));
  const r = Math.random();
  const risk = QUEST_GRADE_RISK[q.grade];
  if (s >= 0.6) return r < 0.85 ? 'full' : 'partial';
  if (s >= 0.2) return r < 0.5 ? 'full' : r < 0.85 ? 'partial' : risk.injury ? 'crisis' : 'partial';
  if (s >= -0.2) return r < 0.35 ? 'partial' : r < 0.7 ? (risk.injury ? 'crisis' : 'partial') : 'fail';
  if (r < 0.3) return 'fail';
  if (r < 0.7) return risk.injury ? 'crisis' : 'fail';
  return risk.death ? 'disaster' : risk.injury ? 'crisis' : 'fail';
}

// 무공 도메인(결투·큰의뢰) — 주력 무공 성 EXP 적립(상한 = min(등급, 경지)).
const MARTIAL_DOMAINS: readonly QuestDomain[] = ['duel', 'grand'];

function gainMainSeongExp(d: Disciple, exp: number): void {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  if (!mainId || exp <= 0) return;
  const art = findMartialArt(mainId);
  if (!art) return;
  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[d.realm]);
  const martialArts = d.martialArts.map((a) => {
    if (a.artId !== mainId) return a;
    let seong = a.seong;
    let e = a.exp + exp;
    while (seong < cap && e >= expToNextSeong(seong)) {
      e -= expToNextSeong(seong);
      seong += 1;
    }
    if (seong >= cap) {
      seong = cap;
      e = 0;
    }
    return { ...a, seong, exp: e };
  });
  useDiscipleStore.getState().update(d.id, { martialArts });
}

// 의뢰 수행 → 인격 6축 미세 변화. 도메인·회색·결과가 사람을 빚는다. docs/28 §6.
function personaDeltas(
  q: Quest,
  outcome: QuestOutcome,
): Partial<Record<keyof PersonalityTraits, number>> {
  const d: Partial<Record<keyof PersonalityTraits, number>> = {};
  const add = (k: keyof PersonalityTraits, v: number) => {
    d[k] = (d[k] ?? 0) + v;
  };
  if (outcome !== 'fail') {
    switch (q.domain) {
      case 'guard': // 자비·충성(의무)
        add('mercy', 2);
        add('freedom', -1);
        break;
      case 'scout':
        add('prudence', 2);
        break;
      case 'duel':
        add('integrity', 1);
        add('ambition', 2);
        break;
      case 'medicine':
        add('mercy', 3);
        add('warmth', 2);
        break;
      case 'assassin': // 냉정·실리
        add('mercy', -3);
        add('ambition', 1);
        break;
      case 'grand':
        add('integrity', 1);
        add('ambition', 2);
        break;
    }
  }
  if (q.gray) {
    add('mercy', -3); // 어둠의 일은 마음을 식힌다
    add('prudence', 1);
  }
  if (outcome === 'disaster' || outcome === 'crisis') add('prudence', 2); // 사선의 흔적
  return d;
}

// 같은 의뢰 동행 → 호감도 한 단계 상승. docs/28 §7·§8.
const REL_UP: Record<RelationLevel, RelationLevel> = {
  enemy: 'distant',
  distant: 'neutral',
  neutral: 'friend',
  friend: 'sworn',
  sworn: 'sworn',
};

function bumpRelations(ids: string[]): void {
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

// 결산 적용 + 마일스톤 1건 반환.
function resolveQuest(active: ActiveQuest): Milestone {
  const q = active.quest;
  let outcome = rollOutcome(active);

  // 돌발 이벤트 위험 보정 — 부상·사망 확률 가산(무모한 선택의 대가).
  if (active.riskDelta && Math.random() < active.riskDelta) {
    if (outcome === 'full' || outcome === 'partial') outcome = 'crisis';
    else if (outcome === 'crisis') outcome = QUEST_GRADE_RISK[q.grade].death ? 'disaster' : 'crisis';
  }

  const ds = useDiscipleStore.getState();
  const present = active.discipleIds.filter((id) => ds.disciples[id]);

  // 조합 시너지 — 의원(의술 ≥30) 동행 시 부상·사망 한 단계 완화. docs/28 §7 "호위+의술".
  const hasMedic = present.some((id) => (ds.disciples[id]?.stats?.medicine?.level ?? 0) >= 30);
  let medicSaved = false;
  if (hasMedic) {
    if (outcome === 'disaster') {
      outcome = 'crisis';
      medicSaved = true;
    } else if (outcome === 'crisis') {
      outcome = 'partial';
      medicSaved = true;
    }
  }

  const scale = OUTCOME_SCALE[outcome];
  const stat = QUEST_DOMAIN_STAT[q.domain];
  const isMartial = MARTIAL_DOMAINS.includes(q.domain);
  // 돌발 이벤트 보상 배수 + 귀인(noble) 후사.
  const mult = (active.rewardMult ?? 1) * (active.rewardFlag === 'noble' ? 1.5 : 1);

  if (scale.money > 0) {
    useSectStore.getState().adjustResources(Math.round(q.reward.money * scale.money * mult));
  }
  if (scale.fame > 0) {
    useSectStore.getState().adjustReputation(Math.round(q.reward.fame * scale.fame * mult * 0.3));
  }
  // 사문 분위기 — 의뢰 사상색(정파/사파·회색) 누적. docs/28 §7.
  if (outcome !== 'fail') {
    const righteousness = QUEST_DOMAIN_RIGHTEOUSNESS[q.domain] + (q.gray ? -3 : 0);
    useSectAtmosphereStore.getState().adjust({
      righteousness,
      unity: present.length >= 2 ? 2 : 0,
    });
    // 문파 평판 — 같은 사상색으로 정파↑·사파↓(동행 제자는 개인 인연도). docs/30.
    applyQuestReputation(righteousness, scale.growth || 0.5, present);
  }

  const victimIdx = present.length ? Math.floor(Math.random() * present.length) : -1;
  let lostName = '';

  for (let i = 0; i < present.length; i += 1) {
    const id = present[i];
    const d = ds.disciples[id];
    if (!d) continue;
    // 성장 — 능력치(호위·정탐·의술) 또는 무공 성(결투·큰의뢰).
    if (scale.growth > 0) {
      if (stat) ds.addStatExp(id, stat, Math.max(1, Math.round(35 * scale.growth)));
      else if (isMartial) gainMainSeongExp(d, Math.max(1, Math.round(60 * scale.growth)));
    }
    // 인격 변화.
    const deltas = personaDeltas(q, outcome);
    const persona: PersonalityTraits = { ...d.personality };
    for (const k of Object.keys(deltas) as (keyof PersonalityTraits)[]) {
      persona[k] = Math.max(1, Math.min(100, persona[k] + (deltas[k] ?? 0)));
    }
    const patch: Partial<Disciple> = {
      fame: (d.fame ?? 0) + Math.round(q.reward.fame * scale.fame * mult),
      personality: persona,
    };
    // 상태 — 재난 희생자=상실, 재난 생존/위기 희생자=부상, 그 외 복귀.
    if (outcome === 'disaster' && i === victimIdx) {
      patch.status = 'departed';
      lostName = d.name;
    } else if (outcome === 'disaster') {
      patch.status = 'injured';
      patch.injuryDaysRemaining = 21;
    } else if (outcome === 'crisis' && i === victimIdx) {
      patch.status = 'injured';
      patch.injuryDaysRemaining = 14;
    } else {
      patch.status = 'training';
    }
    ds.update(id, patch);
  }

  // 친밀도 — 함께 살아 돌아온 동문은 가까워진다.
  const survivors = present.filter((id) => ds.disciples[id]?.status !== 'departed');
  if (outcome !== 'disaster' && survivors.length >= 2) bumpRelations(survivors);

  const names = present.map((id) => ds.disciples[id]?.name ?? '?').join('·');
  const leadId = present[0] ?? active.discipleIds[0];
  const leadName = ds.disciples[present[0]]?.name ?? '제자';
  const tag = `[${QUEST_GRADE_LABEL[q.grade]}·${QUEST_DOMAIN_LABEL[q.domain]}]`;

  let body: string;
  if (outcome === 'disaster' && lostName) {
    body = `${tag} ${q.title} — ${names}\n임무 도중 ${lostName}이(가) 돌아오지 못했다. 남은 이들은 상처를 안고 사문으로 돌아왔다.`;
  } else {
    const reward = `자금 ${Math.round(q.reward.money * scale.money)}${
      scale.fame > 0 ? ' · 명성 ↑' : ''
    }${scale.growth > 0 ? ` · ${QUEST_DOMAIN_LABEL[q.domain]} 경험 ↑` : ''}`;
    const medicNote = medicSaved ? ' (동행한 의원이 큰 화를 막았다)' : '';
    body = `${tag} ${q.title} — ${names}\n${OUTCOME_LABEL[outcome]}.${medicNote} ${reward}`;
  }

  return {
    id: `quest-${q.id}-${active.dueDay}`,
    kind: 'quest',
    discipleId: leadId,
    discipleName: leadName,
    title: `의뢰 ${OUTCOME_LABEL[outcome]}`,
    body,
  };
}

// advanceTurn 훅 — 기한 도래 의뢰 결산.
export function tickQuests(): void {
  const today = useTimeStore.getState().totalDay;
  const qs = useQuestStore.getState();
  // 1) 돌발 이벤트 — 의뢰당 1회, 기간 중반 이후.
  for (const a of qs.active) {
    if (a.eventRolled) continue;
    const span = a.dueDay - a.startedDay;
    if (today - a.startedDay < Math.ceil(span / 2)) continue;
    qs.updateActive(a.quest.id, { eventRolled: true });
    maybeFireEvent(a);
  }
  // 2) 결산 — 기한 도래 + 미해소 이벤트 없을 때만(강제 선택 대기).
  const due = useQuestStore
    .getState()
    .active.filter((a) => today >= a.dueDay && !a.pendingEventId);
  if (due.length === 0) return;
  const milestones: Milestone[] = [];
  for (const a of due) {
    milestones.push(resolveQuest(a));
    useQuestStore.getState().removeActive(a.quest.id);
  }
  usePendingStore.getState().pushMilestones(milestones);
}
