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
import { findMartialArt, expToNextSeong, seongCap } from '@/data/martialArts';
import { REALM_SEONG_CAP } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useQuestStore } from '@/stores/questStore';
import { useSectStore } from '@/stores/sectStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  ActiveQuest,
  Disciple,
  Milestone,
  PersonalityTraits,
  Quest,
  QuestDomain,
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

  if (scale.money > 0) {
    useSectStore.getState().adjustResources(Math.round(q.reward.money * scale.money));
  }
  if (scale.fame > 0) {
    useSectStore.getState().adjustReputation(Math.round(q.reward.fame * scale.fame * 0.3));
  }
  // 사문 분위기 — 의뢰 사상색(정파/사파·회색) 누적. docs/28 §7.
  if (outcome !== 'fail') {
    const righteousness = QUEST_DOMAIN_RIGHTEOUSNESS[q.domain] + (q.gray ? -3 : 0);
    useSectAtmosphereStore.getState().adjust({
      righteousness,
      unity: present.length >= 2 ? 2 : 0,
    });
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
      fame: (d.fame ?? 0) + Math.round(q.reward.fame * scale.fame),
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
  const due = qs.active.filter((a) => today >= a.dueDay);
  if (due.length === 0) return;
  const milestones: Milestone[] = [];
  for (const a of due) {
    milestones.push(resolveQuest(a));
    qs.removeActive(a.quest.id);
  }
  usePendingStore.getState().pushMilestones(milestones);
}
