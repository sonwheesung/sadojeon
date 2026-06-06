// 의뢰 시스템 — docs/28 §4 경로 B. 파견·진행·결산.
// 게시판(사문 명성 게이트) → 파견(1~N명) → 주(일) 진행 → 결산 outcome 5분기.
// 도메인 성장(능력치 EXP) + 자금 + 명성(제자·사문) + 위험(부상·사망).

import {
  QUEST_DOMAIN_LABEL,
  QUEST_DOMAIN_STAT,
  QUEST_GRADE_LABEL,
  QUEST_GRADE_ORDER,
  QUEST_GRADE_RISK,
  QUEST_POOL,
  maxGradeForReputation,
} from '@/data/quests';
import { useDiscipleStore } from '@/stores/discipleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useQuestStore } from '@/stores/questStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  ActiveQuest,
  Disciple,
  Milestone,
  Quest,
  QuestDomain,
  QuestOutcome,
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

// 결산 적용 + 마일스톤 1건 반환.
function resolveQuest(active: ActiveQuest): Milestone {
  const q = active.quest;
  const outcome = rollOutcome(active);
  const scale = OUTCOME_SCALE[outcome];
  const ds = useDiscipleStore.getState();
  const stat = QUEST_DOMAIN_STAT[q.domain];

  // 자금 — 사문 금고.
  if (scale.money > 0) useSectStore.getState().adjustResources(Math.round(q.reward.money * scale.money));
  // 사문 명성 — 제자 명성 합의 일부.
  if (scale.fame > 0) useSectStore.getState().adjustReputation(Math.round(q.reward.fame * scale.fame * 0.3));

  const present = active.discipleIds.filter((id) => ds.disciples[id]);
  // 부상/사망 대상 (위기=1명 부상, 재난=1명 상실).
  const victimIdx = present.length ? Math.floor(Math.random() * present.length) : -1;

  for (let i = 0; i < present.length; i += 1) {
    const id = present[i];
    const d = ds.disciples[id];
    if (!d) continue;
    // 성장 — stat 도메인만(duel/grand 무공 성장은 B2).
    if (stat && scale.growth > 0) {
      ds.addStatExp(id, stat, Math.max(1, Math.round(35 * scale.growth)));
    }
    // 명성 — 나간 사람 몫.
    const fameGain = Math.round(q.reward.fame * scale.fame);
    const patch: Partial<Disciple> = { fame: (d.fame ?? 0) + fameGain };
    // 상태 — 재난 희생자=상실, 위기 희생자=부상, 그 외 복귀.
    if (outcome === 'disaster' && i === victimIdx) {
      patch.status = 'departed';
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

  const lead = ds.disciples[present[0]] ?? ds.disciples[active.discipleIds[0]];
  const leadName = lead?.name ?? '제자';
  const names = present.map((id) => ds.disciples[id]?.name ?? '?').join('·');
  const rewardLine =
    outcome === 'disaster'
      ? '돌아오지 못한 이가 있다.'
      : `보상 — 자금 ${Math.round(q.reward.money * scale.money)} · 명성 ${
          scale.fame > 0 ? '↑' : '—'
        }${stat && scale.growth > 0 ? ` · ${QUEST_DOMAIN_LABEL[q.domain]} 경험 ↑` : ''}`;

  return {
    id: `quest-${q.id}-${active.dueDay}`,
    kind: 'quest',
    discipleId: present[0] ?? active.discipleIds[0],
    discipleName: leadName,
    title: `의뢰 ${OUTCOME_LABEL[outcome]}`,
    body: `[${QUEST_GRADE_LABEL[q.grade]}·${QUEST_DOMAIN_LABEL[q.domain]}] ${q.title} — ${names}\n${OUTCOME_LABEL[outcome]}. ${rewardLine}`,
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
