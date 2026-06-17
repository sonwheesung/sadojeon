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
import { MARTIAL_ARTS } from '@/data/martialArts';
import { useCodexStore } from '@/stores/codexStore';
import { realmIndex } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useQuestStore } from '@/stores/questStore';
import { useFieldEventStore, type FieldEventChoiceView } from '@/stores/fieldEventStore';
import { useSectStore } from '@/stores/sectStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import { FACTIONS, repTier } from '@/data/factions';
import { useReputationStore } from '@/stores/reputationStore';
import { useJianghuStore } from '@/stores/jianghuStore';
import { worldThreat } from './worldSystem';
import { adjustDiscipleRep, adjustSectRep, applyAlignmentReputation, applyCovertReputation } from './reputationSystem';
import { shiftPersona } from './personaShift';
import { gainMainSeongExpArts } from './martialExp';
import { isResearchInstant } from './researchSystem';
import { combatantFromDisciple, makeNpcCombatant, narrateCombat, simulateCombat, type NpcArchetype } from './combat';
import { playCutscene } from './cutsceneSystem';
import type { Realm } from '@/types/realm';
import { combatRating } from './combatPower';
import { grantDivineElixir } from './elixirSystem';
import { DIVINE_ELIXIR_DROP_RATE } from '@/data/elixirs';
import { BODY_EFFICIENCY_MULTIPLIER } from '@/data/efficiency';
import { bodyAgeMultiplier, attemptQuestEnlightenment } from './trainingSystem';
import { consumeElixirItem } from './alchemySystem';
import { inflictWound } from './woundSystem';
import { currentAge } from './discipleCtx';
import type { WoundType } from '@/types/disciple';
import type { MartialArtGrade, MartialArtSchool } from '@/types/martialArt';
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
  QuestGrade,
  QuestOutcome,
  RelationLevel,
} from '@/types';

// ─── 역량·자격 ────────────────────────────────────────────────────────────

// 제자의 의뢰 도메인 역량 0~100. (stat 도메인=능력치 Lv, duel/grand=전투력 무위 combatRating)
// combatRating = 주력 성×10 앵커(기존 밸런스 보존) + 익힌 무공 깊이·경지 보너스. docs/27 §5.
export function capability(d: Disciple, domain: QuestDomain): number {
  const stat = QUEST_DOMAIN_STAT[domain];
  if (stat) return d.stats?.[stat]?.level ?? 0;
  const rating = combatRating(d);
  if (domain === 'grand') {
    return Math.max(rating, d.stats?.guarding?.level ?? 0, d.stats?.scouting?.level ?? 0);
  }
  return rating; // duel
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

// 우호(≥우호) 문파 후원 의뢰 — 상위 2개 문파가 더 좋은(보상↑) 의뢰를 사문에 맡긴다. docs/30.
// 정파 문파=정도 의뢰, 사파 문파=회색 의뢰 템플릿. 완수 시 그 문파 평판 강화(settle).
function sponsoredQuests(maxIdx: number, activeIds: Set<string>): Quest[] {
  const repMap = useReputationStore.getState().sect;
  const allies = FACTIONS.filter((f) => {
    const t = repTier(repMap[f.id] ?? 0);
    return t === 'friendly' || t === 'ally';
  })
    .sort((a, b) => (repMap[b.id] ?? 0) - (repMap[a.id] ?? 0))
    .slice(0, 2);
  const out: Quest[] = [];
  for (const f of allies) {
    const id = `spon-${f.id}`;
    if (activeIds.has(id)) continue;
    const sapa = f.alignment === 'sapa' || f.alignment === 'magyo';
    const cand = QUEST_POOL.filter(
      (q) =>
        QUEST_GRADE_ORDER.indexOf(q.grade) <= maxIdx &&
        q.grade !== 'menial' &&
        (sapa ? !!q.gray : !q.gray),
    );
    if (cand.length === 0) continue;
    const tmpl = cand[Math.floor(Math.random() * cand.length)];
    out.push({
      ...tmpl,
      id,
      client: f.name,
      title: `${f.name} 후원 — ${tmpl.title}`,
      reward: {
        money: Math.round(tmpl.reward.money * 1.4),
        fame: Math.round(tmpl.reward.fame * 1.4),
      },
      faction: f.id,
    });
  }
  return out;
}

// 사문 명성 구간 ≤ 등급 의뢰 중 최대 6개 랜덤 + 우호 문파 후원 의뢰. 활성 의뢰는 제외.
export function generateBoard(): void {
  const rep = useSectStore.getState().sect?.reputation ?? 10;
  const maxIdx = QUEST_GRADE_ORDER.indexOf(maxGradeForReputation(rep));
  const activeIds = new Set(useQuestStore.getState().active.map((a) => a.quest.id));
  const pool = QUEST_POOL.filter(
    (q) => QUEST_GRADE_ORDER.indexOf(q.grade) <= maxIdx && !activeIds.has(q.id),
  );
  // 적대 문파 의뢰 차단 — 정파와 척질수록 들어오는 일감이 준다(최소 2). docs/30.
  const repMap = useReputationStore.getState().sect;
  const hostileRight = FACTIONS.filter(
    (f) => f.alignment === 'right' && repTier(repMap[f.id] ?? 0) === 'hostile',
  ).length;
  const baseCount = Math.max(2, 6 - Math.min(3, hostileRight));
  // 강호 정세 반영 — 위기도(봉기·전쟁 등)가 높을수록 평화 잡일(menial·minor)을 억누르고
  // 무력·위기 의뢰(토벌·정찰·구원, dangerous+)를 띄운다. 사파가 마을 습격 중인데 '마을 청소'가 뜨는 일 방지. docs/08·29.
  const threat = worldThreat(useJianghuStore.getState().world);
  const base = weightedSample(pool, (q) => questThreatWeight(q.grade, q.domain, threat), baseCount);
  const sponsored = sponsoredQuests(maxIdx, activeIds);
  // 강호 사건 의뢰(world-evt-*)는 매월 재생성 때도 보존 — 강호 정세가 띄운 일감이 한 달 만에 증발하지 않게.
  const worldQuests = useQuestStore.getState().board.filter((q) => q.id.startsWith(WORLD_QUEST_PREFIX));
  useQuestStore.getState().setBoard([...worldQuests, ...sponsored, ...base]);
}

// 의뢰 한 건의 게시 가중 — 위기도(threat 0~1)에 따라. 평온(0)이면 전 등급 균등(종전 동작 유지).
// 위기↑: 평화 잡일↓(마을 청소·짐 운반), 위험·극험·무력 도메인↑. 계약·기대 분포는 docs/37 §B6.
function questThreatWeight(grade: QuestGrade, domain: QuestDomain, threat: number): number {
  const gradeW: Record<QuestGrade, number> = {
    menial: 1 - 0.85 * threat, //   평화 잡일 — 위기엔 거의 사라짐
    minor: 1 - 0.4 * threat,
    normal: 1,
    dangerous: 1 + 1.2 * threat, // 토벌·정찰·호행
    extreme: 1 + 1.5 * threat, //   대형 위기(평판 상한 별도)
  };
  // 무력·위기 도메인은 난세에 더, 의술은 전장 부상자로 약간↑, 청부(gray)는 정세 무관.
  const domainW: Record<QuestDomain, number> = {
    duel: 1 + 0.6 * threat,
    grand: 1 + 0.6 * threat,
    scout: 1 + 0.4 * threat,
    guard: 1 + 0.3 * threat,
    medicine: 1 + 0.2 * threat,
    assassin: 1,
  };
  return Math.max(0.0001, gradeW[grade] * domainW[domain]);
}

// 가중 무복원 추출 — 가중치 비례로 count 개 뽑는다(중복 없음).
function weightedSample<T>(items: readonly T[], weightFn: (x: T) => number, count: number): T[] {
  const pool = items.map((x) => ({ x, w: Math.max(0.0001, weightFn(x)) }));
  const picked: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx += 1) {
      r -= pool[idx].w;
      if (r <= 0) break;
    }
    picked.push(pool[idx].x);
    pool.splice(idx, 1);
  }
  return picked;
}

// ─── 강호 정세 → 의뢰 시드 (worldDriver 가 큰 사건 결말 시 호출) ──────────────
const WORLD_QUEST_PREFIX = 'world-evt-';
const MAX_WORLD_QUESTS = 2; // 게시판에 동시에 떠 있는 강호 사건 의뢰 상한

interface WorldQuestSeed {
  kind: string; // 사건 종류 id
  headline: string; // 사건 제목(풍문)
}

// 사건 종류 → 의뢰 틀(도메인·기본 등급·의뢰 문구). 정파가 동원되는 사건만 의뢰화된다.
const WORLD_QUEST_TEMPLATE: Record<
  string,
  { domain: QuestDomain; grade: QuestGrade; title: string; client: string; preview: string }
> = {
  uprising: {
    domain: 'guard', grade: 'dangerous', title: '사파 봉기 — 변경 방비', client: '무림맹',
    preview: '봉기한 흑도가 길목을 위협한다. 일대 방비에 손을 보탤 의협을 구한다.',
  },
  subjugation: {
    domain: 'duel', grade: 'dangerous', title: '사파 토벌 동참', client: '무림맹',
    preview: '토벌대가 사파 거점으로 향한다. 무위 있는 이의 동참을 청한다.',
  },
  war: {
    domain: 'grand', grade: 'extreme', title: '대전 — 정예 차출', client: '무림맹',
    preview: '강호를 가른 대전에 정예가 모인다. 사문의 이름을 걸 자를 부른다.',
  },
};

const GRADE_REWARD: Record<QuestGrade, { money: number; fame: number; minStat: number; weeks: number }> = {
  menial: { money: 60, fame: 1, minStat: 0, weeks: 1 },
  minor: { money: 150, fame: 4, minStat: 20, weeks: 2 },
  normal: { money: 280, fame: 8, minStat: 35, weeks: 3 },
  dangerous: { money: 480, fame: 14, minStat: 55, weeks: 4 },
  extreme: { money: 1000, fame: 28, minStat: 72, weeks: 6 },
};

// 큰 강호 사건 결말 → 관련 의뢰를 게시판에 띄운다. 사문 평판 등급으로 상한(약한 사문엔 극험 안 뜸).
export function seedWorldQuests(seeds: WorldQuestSeed[]): void {
  if (seeds.length === 0) return;
  const qs = useQuestStore.getState();
  const rep = useSectStore.getState().sect?.reputation ?? 10;
  const maxIdx = QUEST_GRADE_ORDER.indexOf(maxGradeForReputation(rep));

  for (const seed of seeds) {
    const tpl = WORLD_QUEST_TEMPLATE[seed.kind];
    if (!tpl) continue;
    const live = qs.board.filter((q) => q.id.startsWith(WORLD_QUEST_PREFIX)).length;
    if (live >= MAX_WORLD_QUESTS) break;
    // 등급 상한 — 사문 평판이 낮으면 사건 등급을 낮춰 띄운다.
    const gradeIdx = Math.min(QUEST_GRADE_ORDER.indexOf(tpl.grade), Math.max(0, maxIdx));
    const grade = QUEST_GRADE_ORDER[gradeIdx];
    const r = GRADE_REWARD[grade];
    const id = `${WORLD_QUEST_PREFIX}${seed.kind}-${useTimeStore.getState().totalDay}`;
    qs.addToBoard({
      id,
      domain: tpl.domain,
      grade,
      title: tpl.title,
      client: tpl.client,
      preview: tpl.preview,
      weeks: r.weeks,
      reward: { money: r.money, fame: r.fame },
      recommended: grade === 'extreme' ? 2 : 1,
      minStat: r.minStat,
    });
  }
}

// ─── 파견 ─────────────────────────────────────────────────────────────────

export function dispatchQuest(questId: string, discipleIds: string[]): boolean {
  const qs = useQuestStore.getState();
  const quest = qs.board.find((q) => q.id === questId);
  if (!quest || discipleIds.length === 0) return false;
  const ds = useDiscipleStore.getState();
  // 리더(첫 제자=캐리)만 역량 게이트 통과하면 된다. 동행 서포트(의원·진법 등)는 역량 미달이어도
  // 따라갈 수 있다 — 캐리가 의뢰를 이끌고 서포트는 보조(생존·성공률). 가용(training)만 확인.
  const leadId = discipleIds[0];
  const leadD = ds.disciples[leadId];
  if (!leadD || !canDispatch(leadD, quest)) return false;
  for (const id of discipleIds.slice(1)) {
    const m = ds.disciples[id];
    if (!m || m.status !== 'training') return false;
  }
  const today = useTimeStore.getState().totalDay;
  const durationDays = quest.days ?? quest.weeks * 7; // 잡일류는 days(1~3일)로 단기.
  qs.addActive({ quest, discipleIds, startedDay: today, dueDay: today + durationDays });
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
  // 현장 급보 — 서신함이 아니라 컷씬+모달로 그 자리에서 선택(턴 진행 흐름 안). docs/20·38.
  const evId = `qevent-${active.quest.id}-${event.id}`;
  useFieldEventStore.getState().push({
    id: evId,
    source: 'quest',
    refId: active.quest.id,
    title: `의뢰 중 급보 — ${QUEST_GRADE_LABEL[active.quest.grade]}·${QUEST_DOMAIN_LABEL[active.quest.domain]}`,
    hanzi: '急',
    tone: 'ink',
    sceneLine: `「${active.quest.title}」 도중, ${names}에게 뜻밖의 일이 닥쳤다.`,
    prompt: event.prompt,
    who: names,
    choices: choices as unknown as FieldEventChoiceView[],
  });
  useQuestStore.getState().updateActive(active.quest.id, { pendingEventId: evId });
}

// 구한 이의 정체 공개 — 평민/명문(정파)/사파 무작위. 명문·사파는 그 문파 평판↑(동행 제자 인연도).
// docs/30. 명문=귀인 보상(noble), 사파=은밀한 사례(소폭 보상).
function rollRescueReveal(active: ActiveQuest): {
  text: string;
  rewardFlag?: 'noble';
  rewardMult: number;
} {
  const r = Math.random();
  if (r < 0.5) {
    // 평민 — 특정 문파 X. 선행 소문이 돌아 사문 전반의 덕망(명성)↑.
    useSectStore.getState().adjustReputation(3);
    return {
      text: '알고 보니 평범한 길손이었다. 그를 살렸다는 말이 돌아 사문의 덕망이 조금 올랐다.',
      rewardMult: 1,
    };
  }
  const isRight = r < 0.9; // 0.5~0.9 명문 정파 / 0.9~ 사파
  const pool = FACTIONS.filter((f) => f.alignment === (isRight ? 'right' : 'sapa'));
  const f = pool[Math.floor(Math.random() * pool.length)];
  if (!f) return { text: '구한 이는 말없이 사라졌다.', rewardMult: 1 };
  const amount = isRight ? 8 : 6;
  adjustSectRep(f.id, amount);
  for (const id of active.discipleIds) adjustDiscipleRep(id, f.id, Math.ceil(amount / 2));
  if (isRight) {
    return {
      text: `구한 이는 ${f.name}의 고인(高人)이었다. ${f.name}과의 인연이 두터워졌다.`,
      rewardFlag: 'noble',
      rewardMult: 1,
    };
  }
  return {
    text: `구한 이는 ${f.name}의 사람이었다. ${f.name}이 은밀히 사례하니, 그쪽과의 관계가 두터워졌다.`,
    rewardMult: 1.1,
  };
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

  // 구조 성공 시 정체 공개 → 문파 평판. (실패 effect엔 revealRescue 없음 = 죽어서 공개 X)
  const reveal = e.revealRescue ? rollRescueReveal(active) : null;

  qs.updateActive(questId, {
    successDelta: (active.successDelta ?? 0) + (e.successDelta ?? 0),
    riskDelta: (active.riskDelta ?? 0) + (e.riskDelta ?? 0),
    rewardMult: (active.rewardMult ?? 1) * (e.rewardMult ?? 1) * (reveal?.rewardMult ?? 1),
    rewardFlag: reveal?.rewardFlag ?? e.rewardFlag ?? active.rewardFlag,
    pendingEventId: undefined,
  });
  if (e.persona || e.stressDelta) {
    const ds = useDiscipleStore.getState();
    for (const id of active.discipleIds) {
      const d = ds.disciples[id];
      if (!d) continue;
      if (e.persona) {
        ds.update(id, { personality: shiftPersona(d, e.persona as Partial<PersonalityTraits>) });
      }
      if (e.stressDelta) ds.adjustStress(id, e.stressDelta);
    }
  }

  // 결과 서신 — 사부가 급보의 결말을 전해 듣는다(읽기만).
  const day = useTimeStore.getState().totalDay;
  const leadName = useDiscipleStore.getState().disciples[active.discipleIds[0]]?.name ?? '제자';
  const text = [e.resultText ?? '강호의 일은 그렇게 지나갔다.', reveal?.text]
    .filter(Boolean)
    .join('\n');
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

// ─── 비급 드랍 — 의뢰 등급↔비급 등급, 도메인↔갈래 결 매칭. docs/05·09 (2026-06-10). 🔧 ───
// 잡일은 비급이 없고, 위로 갈수록 확률·등급이 오른다. 신품은 드랍 없음(업적·사문 전승만).
// 드랍 즉시 식별 완료(연구 시스템 연결은 후속 — docs/05 연구도 회차 리셋과 함께 배선 예정).
const SCROLL_DROP: Partial<
  Record<QuestGrade, { chance: number; grades: MartialArtGrade[] }>
> = {
  minor: { chance: 0.04, grades: ['novice'] },
  normal: { chance: 0.1, grades: ['novice', 'apprentice'] },
  dangerous: { chance: 0.25, grades: ['apprentice', 'master'] },
  extreme: { chance: 0.75, grades: ['master', 'grandmaster'] },
};

// 도메인 ↔ 갈래 결 — 맞는 갈래의 비급이 3배 잘 나온다(살수 의뢰에서 살수 비급).
const DOMAIN_SCHOOL_AFFINITY: Record<QuestDomain, MartialArtSchool[]> = {
  guard: ['external', 'saber', 'fist'],
  scout: ['lightness', 'hidden'],
  duel: ['sword', 'saber', 'fist'],
  medicine: ['medical', 'qigong'],
  assassin: ['hidden', 'sword', 'darkArts'],
  grand: ['sword', 'saber', 'fist', 'qigong', 'external'],
};

function maybeDropScroll(q: Quest): void {
  const rule = SCROLL_DROP[q.grade];
  if (!rule || Math.random() >= rule.chance) return;
  const codex = useCodexStore.getState();
  // 풀 = 의뢰 등급에 맞는 비급 ∪ **다음 권**(선행 비급을 모두 보유한 무공 — 등급 무관).
  // 트리가 깊어진 카탈로그(640권)에서 고급 의뢰만 돌면 사다리 중간 권이 영영 안 모이는 문제 봉합:
  // "사문이 찾는 다음 권은 어느 의뢰판에서든 눈에 띈다" (2026-06-11). 신품은 여전히 드랍 없음.
  const pool = MARTIAL_ARTS.filter((a) => {
    if (a.acquisition !== 'quest' || codex.hasScroll(a.id)) return false;
    if (rule.grades.includes(a.grade)) return true;
    return (
      a.grade !== 'legendary' &&
      (a.prerequisites?.length ?? 0) > 0 &&
      a.prerequisites!.every((pr) => codex.hasScroll(pr.artId))
    );
  });
  if (pool.length === 0) return;
  const affinity = DOMAIN_SCHOOL_AFFINITY[q.domain] ?? [];
  // 가중 추첨 — ① 결 맞는 갈래 ×3 ② **다음 권 결 ×8**: 선행 비급을 모두 보유한 무공(트리의 다음 권)이
  // 잘 나온다 — "한 문파의 비급은 함께 강호를 돈다". 트리가 자연히 완성되는 장치(보장 정점 폐기 보완).
  // ×3→×8 (2026-06-11): 카탈로그 640권 확장으로 풀이 희석돼 절품 트리 완성이 늦어짐(화경 38%) → 사슬 강화. 🔧
  const weighted = pool.flatMap((a) => {
    let w = 1;
    if (affinity.includes(a.school)) w *= 3;
    const chainNext = (a.prerequisites ?? []).every((pr) => codex.hasScroll(pr.artId));
    if (a.prerequisites?.length && chainNext) w *= 8;
    return Array(w).fill(a) as typeof pool;
  });
  const art = weighted[Math.floor(Math.random() * weighted.length)];
  const day = useTimeStore.getState().totalDay;
  codex.addScroll({
    artId: art.id,
    acquiredAtRun: 1,
    acquiredAtDay: day,
    // 드랍 비급은 미연구 — 사부가 풀어야(실시간 연구, researchSystem) 가르칠 수 있다. docs/05.
    status: isResearchInstant() ? 'complete' : 'identified',
    researchProgress: isResearchInstant() ? 100 : 0,
    isTrap: false,
    isIncomplete: false,
  });
  useInboxStore.getState().add({
    id: `scroll-${art.id}-${day}`,
    kind: 'report',
    title: `비급 입수 — ${art.name}`,
    preview: `의뢰 끝에 비급 「${art.name}(${art.hanjaName})」이 사문에 들었다.`,
    body: `의뢰를 마치고 돌아온 짐 속에서 비급 한 권이 나왔다. **${art.name}(${art.hanjaName})** — ${art.description} 사문의 서고에 고이 들였다.`,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// 재난(disaster) 발생 시 희생자가 *사망*할 확률. 나머지는 중상으로 생존. docs/29.
// 극험 의뢰를 반복해도 한 번의 운으로 핵심 제자를 잃는 빈도를 낮춘다(극험만 양육 시 회당 ~20% 사망).
const QUEST_DISASTER_FATALITY = 0.2;

// 금강불괴 결 — 단단한 몸(외공)이 치명타를 받아낸다. 사망 굴림에 곱하는 감쇄: 외공 0이면 그대로,
// 외공이 높을수록 치명상 확률↓ (외공 48 절정몸 ~13.6% · 70 환골탈태 ~10.7% · 100 ~6.7%).
// 외공 양육·환골탈태의 실전 메리트 — "몸을 다시 빚은 제자는 사지에서 돌아온다". docs/23 §5·29 §5. 🔧
function bodyToughnessMult(d: Disciple): number {
  const strength = d.stats?.strength?.level ?? 0;
  return 1 - Math.min(100, strength) / 150;
}

// 실전 의뢰 경험 — **위험 등급 × 기간**에 비례. 위험(부상·사망)을 감수하는 경험 의뢰는 같은 기간
// 훈련보다 값지게(주력 성·외공 프리미엄). 쉬운(잡일·소무) 의뢰는 거의 경험 안 됨. docs/28 §5-1·docs/29.
// **실전이 공력을 키운다(2026-06-13, 정통 페이싱)** — 강호 경험(생사 결투)에서 내공도 적립된다. 은둔 수련자는
// 심법으로, 모험가는 실전으로 내공을 쌓아 둘 다 정통 속도로 경지가 오른다(느린 자연 내공이 의뢰형을 굶기던 문제 해소).
const QUEST_SEONG_EXP_PER_WEEK = 55; // 주력 무공 성 EXP/주 (훈련 초식 ~56/주 대비, 등급배수로 우위)
const QUEST_BODY_EXP_PER_WEEK = 45; //  외공(근력) EXP/주 (효율·나이 보정 별도)
const QUEST_INTERNAL_PER_WEEK = 1.5; // 내공 적립/주 (위험등급×기간 비례, 심법과 보완 — 🔧 시뮬 튜닝 2026-06-13)
const QUEST_STAT_EXP_PER_WEEK = 28; //  비전투(호위·정탐·의술) 능력치 EXP/주
const QUEST_GRADE_GROWTH: Record<QuestGrade, number> = {
  menial: 0.2, //   잡일 — 경험 거의 없음(쉬운 의뢰)
  minor: 0.5, //    소무
  normal: 1.0, //   보통
  dangerous: 1.7, // 위험(중상 가능) — 경험 프리미엄
  extreme: 2.6, //  극험(사망 가능) — 최고 프리미엄
};

// 실전 깨달음 가산 — 의뢰(실전)는 폐관보다 +30%p 높은 확률로 벽을 뚫는다(강호 경험의 묘리). docs/28 §5.
const QUEST_ENLIGHTENMENT_BONUS = 0.3;

// 의뢰 보상(자금) 배수 — 밸런스 레버(런타임 조정). 기본 1.
let questRewardMult = 1;
export function setQuestRewardMult(n: number): void {
  questRewardMult = n;
}

// ─── 의뢰 치명상 생존 체인 (즉사 없음) ──────────────────────────────────────
// 신의급(만렙) 의술 임계 — 동행 의원이 이 이상이면 치명상 동문을 살린다(본인은 못 살림).
const DIVINE_DOCTOR_MEDICINE = 40;

// 구급 영약(금창약) — 치명상 1회 회복. 현질·제작·상점. 기본 0(무과금), 시뮬은 setGeumchangBudget.
let geumchangBudget = 0;
let geumchangUsed = 0;
export function setGeumchangBudget(n: number): void {
  geumchangBudget = n;
  geumchangUsed = 0;
}
function consumeGeumchang(): boolean {
  // 실제 크래프트한 구급 영약(생사인=외상1등급·치명상약) 우선 소모.
  if (consumeElixirItem('saengsa-1')) return true;
  // 없으면 시뮬/과금 예산(budget) 폴백.
  if (geumchangUsed >= geumchangBudget) return false;
  geumchangUsed += 1;
  return true;
}

// 마을 이송 생존율 — 마지막 보루(업고 달린다). 경지(내실)가 버티는 힘이지만 확정은 없다. 🔧
function villageSurviveChance(realm: Disciple['realm']): number {
  return Math.min(0.8, 0.45 + realmIndex(realm) * 0.05);
}

// 치명상 생존 체인 — **즉사 없음**(사용자 확정 2026-06-11). 어느 단도 없이 바로 죽지 않는다:
//  ① 최상급 구급영약(보유 시 소모 — 확정 소생)
//  ② 의술 거의 최상위(신의급) 의원 동행(본인 제외 — 확정 소생)
//  ③ 마을로 업고 달린다 — 생존 굴림(경지별 45~80%, 실패하면 그때 죽는다)
// 반환: 살린 경로 또는 null(마을에서도 끝내).
// 선천진기 생환 대가 — 진원을 태운 근본 손상. 내공·체력 영구 하락(경지=깨달음은 유지, 공력만 잃음).
// 일회성 정액(경지 페이싱과 독립). 거듭 쓰면 폐인(내공 바닥 → 더는 생환 불가 = 진짜 죽음). docs/23·29.
const SEONCHEON_INTERNAL_COST = 150;
const SEONCHEON_ENDURANCE_COST = 4;

type RescueRoute = 'elixir' | 'medic' | 'innate' | 'village';
function survivesFatalBlow(
  victim: Disciple,
  partyIds: string[],
  ds: ReturnType<typeof useDiscipleStore.getState>,
): RescueRoute | null {
  if (consumeGeumchang()) return 'elixir';
  const hasDivineDoctor = partyIds.some((pid) => {
    if (pid === victim.id) return false; // 의원 본인이 치명상이면 자기 못 살림
    const m = ds.disciples[pid];
    return Boolean(m && m.status !== 'departed' && (m.stats?.medicine?.level ?? 0) >= DIVINE_DOCTOR_MEDICINE);
  });
  if (hasDivineDoctor) return 'medic';
  // 선천진기(자력) — 영약·의원 없는 사경. 타고난 진원(오성)과 살려는 의지(야망)가 받쳐주면 진원을 태워 산다.
  // 내공이 영구 손상 최소치 미만이면 태울 진원이 없다 → 발동 불가(폐인 = 진짜 죽음). 대가는 호출측이 적용.
  const internal = victim.realmProgress?.internal ?? 0;
  if (internal >= SEONCHEON_INTERNAL_COST) {
    const insight = victim.insight ?? 1;
    const ambition = victim.personality?.ambition ?? 50;
    const innateChance = Math.max(0.05, Math.min(0.5, 0.1 + insight * 0.05 + ((ambition - 50) / 100) * 0.15));
    if (Math.random() < innateChance) return 'innate';
  }
  return Math.random() < villageSurviveChance(victim.realm) ? 'village' : null;
}

function rollOutcome(active: ActiveQuest): QuestOutcome {
  const q = active.quest;
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null);
  const caps = party.map((d) => capability(d, q.domain));
  // **캐리 주도** — 의뢰 성패는 가장 강한 동문(캐리)이 이끈다. 약한 서포트가 평균을 깎지 않는다.
  const lead = caps.length ? Math.max(...caps) : 0;
  const headFactor = active.discipleIds.length / Math.max(1, q.recommended);
  let s = (lead - q.minStat) / Math.max(20, q.minStat) + (headFactor - 1) * 0.2;
  // 조합 시너지 — 역량 있는 동행이 둘 이상이면 합공 보너스. docs/28 §7.
  const capable = caps.filter((c) => c >= q.minStat).length;
  s += Math.max(0, capable - 1) * 0.12;
  // 진법 서포트 — 동행 중 진법(formation) 숙련자가 있으면 기관·진세 간파로 성공률↑.
  const bestFormation = Math.max(0, ...party.map((d) => d.stats?.formation?.level ?? 0));
  if (bestFormation >= 20) s += 0.15;
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

// 도메인 기본 상처 속성 — 의뢰가 woundType 을 명시하면 그쪽 우선(환경 위험: 화공·설산·맹독 등).
const DOMAIN_WOUND: Record<QuestDomain, WoundType> = {
  guard: 'wound',
  duel: 'wound',
  grand: 'wound',
  scout: 'wound',
  assassin: 'poison', // 암기·독
  medicine: 'wound',
};

function questWoundType(q: Quest): WoundType {
  return q.woundType ?? DOMAIN_WOUND[q.domain];
}

function gainMainSeongExp(d: Disciple, expIn: number): void {
  // 순수 계산은 martialExp(스토어·RN 무관)에 — 의뢰·강호 출행 공용. 여기선 스토어 반영만.
  const martialArts = gainMainSeongExpArts(d, expIn);
  if (martialArts) useDiscipleStore.getState().update(d.id, { martialArts });
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

// ── 결투 의뢰 — 전투 엔진(docs/35) 실전 1판으로 결산. 판정식이 아니라 실제 싸움. 🔧 ──────
// 의뢰 등급 → 상대 풀(경지 혼합 + 영글기 범위 — 만나기 전엔 모르는 상대의 격).
// 캘리브레이션(2026-06-11, 1500판×9조합): 적정 등급 성공(완수+위기) 76~89% / 한 등급 위
// 도전은 성공 ~10%대·재난 6~14%(도박) / 아래 등급은 100%(안전 파밍). 재난도 생존 체인(즉사 X).
interface DuelFoePool {
  realm: Realm;
  qMin: number;
  qMax: number;
  w: number;
}
const DUEL_POOL: Record<QuestGrade, DuelFoePool[]> = {
  menial: [{ realm: 'samryu', qMin: 0.1, qMax: 0.3, w: 1 }], // 잡일엔 결투가 없지만 타입 충족용
  minor: [{ realm: 'samryu', qMin: 0.3, qMax: 0.8, w: 1 }],
  normal: [
    { realm: 'iryu', qMin: 0.3, qMax: 0.9, w: 8 },
    { realm: 'ilryu', qMin: 0.15, qMax: 0.35, w: 1.5 },
  ],
  dangerous: [
    { realm: 'ilryu', qMin: 0.3, qMax: 0.8, w: 6 },
    { realm: 'iryu', qMin: 0.7, qMax: 1, w: 1 },
    { realm: 'jeoljeong', qMin: 0.2, qMax: 0.4, w: 2 },
  ],
  extreme: [
    { realm: 'jeoljeong', qMin: 0.4, qMax: 0.8, w: 6 },
    { realm: 'ilryu', qMin: 0.8, qMax: 1, w: 1 },
    { realm: 'chojeoljeong', qMin: 0.15, qMax: 0.35, w: 2 },
  ],
};
const DUEL_ARCHETYPES: NpcArchetype[] = ['orthodox', 'rogue', 'soldier', 'assassin'];

// 의뢰별 상대 호칭(서사용) — 미지정은 결 무난한 기본값.
const DUEL_FOE_NAME: Record<string, string> = {
  'q-duel-challenge': '무관의 고수',
  'q-bandit': '산채 두목',
  'q-duel-master': '이름난 무인',
  'q-hyeolsu': "'혈수'",
};

interface DuelResolution {
  outcome: QuestOutcome;
  championId: string;
  note: string;
  // 패배(실패)의 중상 — 결과 분기 밖에서 별도 적용(실패는 보상 0이지만 몸은 상한다).
  failWound?: { severity: number; days: number };
}

function resolveDuelByEngine(active: ActiveQuest): DuelResolution | null {
  const q = active.quest;
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => d != null && d.status !== 'departed');
  if (party.length === 0) return null;
  const champion = party.reduce((a, b) => (combatRating(a) >= combatRating(b) ? a : b));

  // 상대 뽑기 — 풀 가중 + 돌발 이벤트 성공 보정은 영글기(컨디션)로 환산.
  const pool = DUEL_POOL[q.grade];
  const total = pool.reduce((a, p) => a + p.w, 0);
  let roll = Math.random() * total;
  let pick = pool[0];
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) {
      pick = p;
      break;
    }
  }
  const quality = Math.max(
    0.05,
    Math.min(1, pick.qMin + Math.random() * (pick.qMax - pick.qMin) - (active.successDelta ?? 0) * 0.3),
  );
  const npc = makeNpcCombatant({
    id: 'duel-foe',
    name: DUEL_FOE_NAME[q.id] ?? '맞수',
    realm: pick.realm,
    archetype: DUEL_ARCHETYPES[Math.floor(Math.random() * DUEL_ARCHETYPES.length)],
    quality,
  });

  // lethal:false — 죽음은 엔진이 아니라 의뢰 생존 체인(즉사 금지)이 정한다. 결투장이라 패주 없음.
  const r = simulateCombat([combatantFromDisciple(champion)], [npc], {
    mode: 'real',
    lethal: false,
    allowRetreat: false,
  });
  const me = r.combatants.find((c) => c.id === champion.id);
  const won = r.winner === 'A';
  // 만신창이 승리(피 흘리며 이김)만 위기후성공 — 가벼운 생채기는 완수.
  const bloodied = me?.wound != null && me.wound.severity <= 3;

  let outcome: QuestOutcome;
  let failWound: DuelResolution['failWound'];
  if (won) {
    outcome = bloodied ? 'crisis' : 'full';
  } else if (me?.wound?.severity === 1) {
    outcome = 'disaster'; // 치명상 — 사망 굴림 + 생존 체인(영약→의원→마을)으로.
  } else {
    outcome = 'fail'; // 패배 — 보상은 없지만 몸도 성치 않다(중상 별도 적용).
    failWound = { severity: me?.wound?.severity ?? 2, days: me?.wound?.days ?? 21 };
  }

  return { outcome, championId: champion.id, note: narrateCombat(r), failWound };
}

// 결산 적용 + 마일스톤 1건 반환.
function resolveQuest(active: ActiveQuest): Milestone {
  const q = active.quest;
  // 결투 도메인은 전투 엔진이 실전 1판을 굴려 결과를 정한다 — 그 외는 역량 판정식.
  const duel = q.domain === 'duel' ? resolveDuelByEngine(active) : null;
  let outcome = duel ? duel.outcome : rollOutcome(active);

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
    useSectStore.getState().adjustResources(Math.round(q.reward.money * scale.money * mult * questRewardMult));
  }
  if (scale.fame > 0) {
    // 사문 명성 적립 ×0.6 (🔧 2026-06-10 0.3→0.6): 0.3에선 잡일·소무 명성이 반올림 0으로 증발해
    // 15년에도 보통급 게시판(명성 25)이 안 열리던 정체 해소 — 활발히 뛰면 ~1년 보통·~3년 위험·~5년 극험.
    useSectStore.getState().adjustReputation(Math.round(q.reward.fame * scale.fame * mult * 0.6));
  }
  // 사문 분위기 — 의뢰 사상색(정파/사파·회색) 누적. docs/28 §7.
  // (분위기·인격은 평판과 달리 **사문 안의 사실** — 무흔이어도 한 일은 한 일이라 그대로 적용.)
  const righteousness = QUEST_DOMAIN_RIGHTEOUSNESS[q.domain] + (q.gray ? -3 : 0);
  if (outcome !== 'fail') {
    useSectAtmosphereStore.getState().adjust({
      righteousness,
      unity: present.length >= 2 ? 2 : 0,
    });
  }
  // 문파 평판 — docs/30.
  if (q.gray) {
    // 은밀의 결(사용자 결정 2026-06-11): **평판은 알려진 것에만 반응한다.**
    //  · 정파 하락 = 발각 정도 — 무흔 완수 0 / 흔적(부분)·어설픈 실패 0.5 / 요란(위기·재난) 1.
    //  · 사파 신용 = 일처리 — 깔끔한 완수 1 / 부분·위기 0.5 / 실패·재난 0(어둠의 세계에서도 신용을 잃음).
    const mag = Math.max(1, Math.round(Math.abs(righteousness) * 0.6));
    const exposure = outcome === 'full' ? 0 : outcome === 'partial' || outcome === 'fail' ? 0.5 : 1;
    const credit = outcome === 'full' ? 1 : outcome === 'partial' || outcome === 'crisis' ? 0.5 : 0;
    applyCovertReputation(mag, exposure, credit, present);
  } else if (outcome !== 'fail') {
    // 정도(비회색) 의뢰 — 알려질수록 좋은 일이라 기존 그대로(정파↑·사파↓).
    applyAlignmentReputation(righteousness, scale.growth || 0.5, present);
  }
  if (outcome !== 'fail' && q.faction) {
    // 후원 의뢰 완수 → 그 문파 평판 직접 강화(의뢰인은 늘 안다 — 회색이어도).
    adjustSectRep(q.faction, 6);
    for (const id of present) adjustDiscipleRep(id, q.faction, 3);
  }

  // 신품 영약 드랍 — 극험(extreme) 의뢰를 온전히/위기 끝에 완수 시 낮은 확률(운). 화경의 열쇠. docs/28 §5-1.
  if (
    q.grade === 'extreme' &&
    (outcome === 'full' || outcome === 'crisis') &&
    Math.random() < DIVINE_ELIXIR_DROP_RATE
  ) {
    grantDivineElixir();
    const day = useTimeStore.getState().totalDay;
    useInboxStore.getState().add({
      id: `elixir-${q.id}-${day}`,
      kind: 'report',
      title: '신품 영약 — 천운',
      preview: '극험의 의뢰 끝에 신품 영약 구전대환단을 얻었다.',
      body: '극험의 의뢰 끝에 천운이 따랐다. 신품 영약 **구전대환단**이 사문에 들었다. 화경의 벽 앞에 선 제자가 폐관 중 복용하면, 그 마지막 벽을 넘을 수 있다 한다.',
      priority: 'high',
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: { domain: 'jianghu_news' },
    });
  }

  // 비급 드랍 — 의뢰 성공(완수·위기) 시 등급·도메인에 맞는 미보유 비급을 얻을 수 있다. docs/05·04·09.
  if (outcome === 'full' || outcome === 'crisis') maybeDropScroll(q);

  // 결투 의뢰는 싸운 당사자(대표)가 위험을 진다 — 그 외엔 무작위.
  const victimIdx = duel
    ? Math.max(0, present.indexOf(duel.championId))
    : present.length
      ? Math.floor(Math.random() * present.length)
      : -1;
  let lostName = '';
  let gravelyHurtName = ''; // 재난에서 죽지 않고 중상으로 살아남은 자(있으면)
  let rescueRoute: RescueRoute | null = null; // 치명상을 살린 경로(영약/의원/마을)

  for (let i = 0; i < present.length; i += 1) {
    const id = present[i];
    const d = ds.disciples[id];
    if (!d) continue;
    // 성장 — 능력치(호위·정탐·의술) 또는 무공 성(결투·큰의뢰).
    let internalGain = 0;
    if (scale.growth > 0) {
      // 경험치 = 기간(주) × 위험등급 배수 × 성과. 위험·장기 의뢰일수록 훈련 대비 값지다.
      const expFactor = (q.weeks ?? 1) * (QUEST_GRADE_GROWTH[q.grade] ?? 1) * scale.growth;
      if (stat) {
        ds.addStatExp(id, stat, Math.max(1, Math.round(QUEST_STAT_EXP_PER_WEEK * expFactor)));
      } else if (isMartial) {
        // 결투·큰의뢰 — 주력 무공 성(실전 깨우침) + 외공(근골).
        gainMainSeongExp(d, Math.max(1, Math.round(QUEST_SEONG_EXP_PER_WEEK * expFactor)));
        const bodyTier = d.efficiency?.strength ?? '보통';
        const bodyExp = Math.round(
          QUEST_BODY_EXP_PER_WEEK * expFactor * BODY_EFFICIENCY_MULTIPLIER[bodyTier] * bodyAgeMultiplier(currentAge(d)),
        );
        if (bodyExp > 0) ds.addStatExp(id, 'strength', bodyExp);
      }
      // 실전이 공력을 키운다 — 모든 성장 의뢰가 내공 적립(위험·장기일수록↑). 정통 페이싱: 모험가형도 경지 성장.
      internalGain = Math.round(QUEST_INTERNAL_PER_WEEK * expFactor);
    }
    // 인격 변화 — 나이·관성 반영. docs/28 §6.
    const baseRp = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
    const patch: Partial<Disciple> = {
      fame: (d.fame ?? 0) + Math.round(q.reward.fame * scale.fame * mult),
      personality: shiftPersona(d, personaDeltas(q, outcome)),
      ...(internalGain > 0 ? { realmProgress: { ...baseRp, internal: baseRp.internal + internalGain } } : {}),
    };
    // 상태 — 재난 희생자=치명상. **즉사 없음** — 생존 체인(구급영약→신의급 의원→자력)으로 살리고,
    // 다 실패하면 그때 사망. 그 외 속성 상처(외상·화상·중독·동상)로 몸져눕는다. 심도는 결과에 비례.
    // (영약 속성·등급 매칭 또는 자연치유로 회복. inflictWound 가 status='injured'+wound 세팅.)
    const wtype = questWoundType(q);
    let inflicted: { severity: number; days: number } | null = null;
    if (outcome === 'disaster' && i === victimIdx) {
      // 사망 굴림 — 외공(금강불괴)이 치명상 확률을 깎는다. bodyToughnessMult.
      if (Math.random() < QUEST_DISASTER_FATALITY * bodyToughnessMult(d)) {
        const rescue = survivesFatalBlow(d, present, ds);
        if (rescue) {
          inflicted = { severity: 1, days: 28 }; // 치명상에서 살아남아 오래 몸져눕는다
          gravelyHurtName = d.name;
          rescueRoute = rescue;
          // 선천진기(자력) — 진원을 태워 살았다. 내공·체력 영구 하락(근본 손상). 경지(깨달음)는 유지.
          if (rescue === 'innate') {
            const rp = patch.realmProgress ?? baseRp;
            patch.realmProgress = { ...rp, internal: Math.max(0, rp.internal - SEONCHEON_INTERNAL_COST) };
            const end = d.stats?.endurance;
            if (end) {
              patch.stats = { ...(d.stats ?? {}), endurance: { ...end, level: Math.max(0, end.level - SEONCHEON_ENDURANCE_COST) } };
            }
          }
          // 구사일생 컷씬 — 살린 경로(영약/의술/선천진기/마을)마다 다른 컷. docs/20.
          playCutscene(`fatal_rescue_${rescue}`, { id: d.id, name: d.name });
        } else {
          patch.status = 'departed'; // 마을까지 업혀 갔으나 끝내 쓰러진다
          lostName = d.name;
        }
      } else {
        inflicted = { severity: 2, days: 28 }; // 중상
        gravelyHurtName = d.name;
      }
    } else if (outcome === 'disaster') {
      inflicted = { severity: 3, days: 21 }; // 부상
    } else if (outcome === 'crisis' && i === victimIdx) {
      inflicted = { severity: 4, days: 14 }; // 경상
    } else if (
      outcome === 'partial' &&
      i === victimIdx &&
      (q.grade === 'dangerous' || q.grade === 'extreme')
    ) {
      inflicted = { severity: 5, days: 5 }; // 위험·극험은 이겨도 찰과상 정도는 남는다(금창약으로 즉시 처치 가능)
    } else if (outcome === 'fail' && duel?.failWound && i === victimIdx) {
      inflicted = duel.failWound; // 결투 패배 — 보상 없는 실패여도 중상을 안고 돌아온다(엔진 결과)
    } else {
      patch.status = 'training';
    }
    ds.update(id, patch);
    if (inflicted) inflictWound(id, wtype, inflicted.severity, inflicted.days);
    // 실전 깨달음 — 결투·큰의뢰 생존 시 벽 돌파 시도(폐관보다 높은 확률). 세 기둥 충족 시만.
    if (isMartial && patch.status !== 'departed' && scale.growth > 0) {
      attemptQuestEnlightenment(id, QUEST_ENLIGHTENMENT_BONUS);
    }
    // (약초 채집은 의뢰가 아니라 활동(activitySystem)으로 일원화 — 2026-06-16. docs/38)
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
    body = `${tag} ${q.title} — ${names}\n임무 도중 ${lostName}이(가) 치명상을 입었다. 동문들이 마을 의원까지 업고 달렸으나 — 끝내 돌아오지 못했다.`;
  } else if (outcome === 'disaster' && gravelyHurtName) {
    const rescueNote =
      rescueRoute === 'elixir'
        ? '최상급 구급영약이 끊어지던 숨을 붙들었다.'
        : rescueRoute === 'medic'
          ? '동행한 의원의 손이 죽음의 문턱에서 끌어냈다.'
          : rescueRoute === 'innate'
            ? '영약도 의원도 없는 사경에서, 타고난 진원(先天眞氣)을 끌어올려 스스로 죽음을 떨쳤다. 허나 근본이 상해 공력을 잃었다.'
            : '동문들이 마을 의원까지 업고 달린 끝에 가까스로 살렸다.';
    body = `${tag} ${q.title} — ${names}\n재난에 가까운 위기였다. ${gravelyHurtName}이(가) 치명상을 입었으나 ${rescueNote} 오래 몸져눕는다.`;
  } else {
    const reward = `자금 ${Math.round(q.reward.money * scale.money)}${
      scale.fame > 0 ? ' · 명성 ↑' : ''
    }${scale.growth > 0 ? ` · ${QUEST_DOMAIN_LABEL[q.domain]} 경험 ↑` : ''}`;
    const medicNote = medicSaved ? ' (동행한 의원이 큰 화를 막았다)' : '';
    body = `${tag} ${q.title} — ${names}\n${OUTCOME_LABEL[outcome]}.${medicNote} ${reward}`;
  }
  // 결투 의뢰 — 엔진이 굴린 실제 싸움의 풍경을 싣는다(docs/35 §7).
  if (duel) body += `\n\n${duel.note}`;

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
