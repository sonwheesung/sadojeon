// 플레이 정책 공용 헬퍼 — 두 정책(random/growth)이 게임의 모든 결정 표면을 다루게 한다.
// 결정 표면: 훈련 카테고리·세부종목, 무공축(심법/초식/경공), 무공서 변경, 영약 복용, 의뢰 파견, 4지선다.
//
// random  = 모든 결정을 무작위로.
// optimal = 경지 상승(궁극 화경)을 향해 합리적으로. 무공서는 **계보 트리를 합법적으로 타고 올라간다**:
//           한번 정한 무공 계열의 선행조건(prerequisites)을 차례로 충족하며 상위 무공으로 갈아탄다
//           (텔레포트 X). 정점(절품 무공서) + 내공/외공/성 게이트 + 신품 영약 → 화경.

import {
  MARTIAL_ARTS,
  canLearnArt,
  findMartialArt,
} from '@/data/martialArts';
import {
  REALM_EXTERNAL_REQ,
  effectiveRealmCeiling,
  externalSupportReq,
  REALM_INTERNAL_REQ,
  REALM_SEONG_GATE,
  nextRealm,
  realmIndex,
} from '@/data/realm';
import { TRAINING_OPTIONS } from '@/data/training';
import { grantDivineElixir, hasDivineElixir } from '@/systems/elixirSystem';
import { canDispatch, dispatchQuest } from '@/systems/questSystem';
import { currentAge } from '@/systems/discipleCtx';
import { QUEST_GRADE_ORDER } from '@/data/quests';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useQuestStore } from '@/stores/questStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, InboxItem, MartialArt, TrainingCategory } from '@/types';

const rand = () => Math.random();
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

// 과금 등급 = 회차당 확보 가능한 신품 영약 수(화경 벽 1개 소모). 0=무과금.
// setElixirBudget 로 회차 시작 때 설정(grant 카운트 리셋).
let elixirBudget = 0;
let elixirGranted = 0;
export function setElixirBudget(n: number): void {
  elixirBudget = n;
  elixirGranted = 0;
}

const CATEGORIES: TrainingCategory[] = ['martial', 'physical', 'study', 'rest'];
const MARTIAL_AXES = ['simbeop', 'chosik', 'gyeonggong'] as const;

function mainArtOf(d: Disciple): MartialArt | undefined {
  return findMartialArt(d.mainMartialArtId ?? d.martialArts[0]?.artId ?? '');
}
function owns(d: Disciple, artId: string): boolean {
  return d.martialArts.some((a) => a.artId === artId);
}
function seongOf(d: Disciple, artId: string): number {
  return d.martialArts.find((a) => a.artId === artId)?.seong ?? 0;
}

// 현 경지에서 합법적으로 배울 수 있는 무공(경지 게이트 + 선행조건 충족).
function learnableArts(d: Disciple): MartialArt[] {
  return MARTIAL_ARTS.filter((a) => !owns(d, a.id) && canLearnArt(d, a));
}

// ── 계보 트리 climbing ─────────────────────────────────────────────────────
// 제자의 최종 목표 무공 — **사문이 비급을 보유한**(코덱스) 정점 무공 중 최고 등급.
// 습득 경로 게이트(2026-06-10) 후로는 의뢰 드랍으로 비급이 모여야 상위 트리가 열린다.
// 기본 보장 경로 = 본문 흑야권법(신품, 시작 소장 — 백운권법 7성 선행).
const GOAL_GRADE_RANK: Record<MartialArt['grade'], number> = {
  novice: 0, apprentice: 1, master: 2, grandmaster: 3, legendary: 4,
};

// 비급 보유 — 목표 + 선행 전체(전이적)가 코덱스에 있어야 그 트리를 탈 수 있다.
function chainOwned(art: MartialArt, depth = 0): boolean {
  if (depth > 8) return false;
  const codex = useCodexStore.getState();
  if (!codex.hasScroll(art.id)) return false;
  for (const p of art.prerequisites ?? []) {
    const pre = findMartialArt(p.artId);
    if (!pre || !chainOwned(pre, depth + 1)) return false;
  }
  return true;
}

function goalArtFor(d: Disciple): MartialArt | null {
  // 보유 비급 기준 **모든 등급** 후보 — 사문 오리지널 폐기 후 보장 정점이 없으므로,
  // 드랍이 모이는 대로 더 높은 등급 트리로 동적으로 갈아탄다(초반엔 공용 중품이 목표).
  const candidates = MARTIAL_ARTS.filter(
    (a) =>
      a.minDarkness == null && // 마공 트리는 최적 정책에서 제외(흑화 대가)
      chainOwned(a),
  );
  if (candidates.length === 0) return null;
  // 등급 우선, 같으면 제자 갈래 효율(특화>상성>보통>미숙>상극) 우선.
  const effRank: Record<string, number> = { 특화: 4, 상성: 3, 보통: 2, 미숙: 1, 상극: 0 };
  candidates.sort((a, b) => {
    const g = GOAL_GRADE_RANK[b.grade] - GOAL_GRADE_RANK[a.grade];
    if (g !== 0) return g;
    return (effRank[d.efficiency?.[b.school] ?? '보통'] ?? 2) - (effRank[d.efficiency?.[a.school] ?? '보통'] ?? 2);
  });
  return candidates[0];
}

// 목표를 향해 "오늘 주력으로 삼아 키울 무공" — 선행조건을 합법적으로 한 단계씩 밟는다.
// 반환: 학습/육성할 artId, 또는 null(지금은 진척 불가 → 현 주력 유지하며 경지만 올림).
function planArtToward(d: Disciple, goal: MartialArt, depth = 0): string | null {
  if (depth > 8) return null;
  if (canLearnArt(d, goal)) return goal.id; // 선행·경지 충족 → 배운다(또는 보유 중이면 키운다).
  // 못 배움 — 미충족 선행을 향해 내려간다.
  for (const p of goal.prerequisites ?? []) {
    const pre = findMartialArt(p.artId);
    if (!pre) continue;
    if (!owns(d, p.artId)) {
      const r = planArtToward(d, pre, depth + 1);
      if (r) return r; // 선행(또는 그 선행)을 먼저 배운다.
    } else if (seongOf(d, p.artId) < p.minSeong) {
      return p.artId; // 선행 보유했으나 성 부족 → 그 선행을 키워 다음을 연다.
    }
  }
  return null; // 경지 게이트만 미달 → 현 주력 유지(내공/외공으로 경지부터 올림).
}

// 어떤 무공의 성을 어디까지 올려야 다음 단계가 열리나(상위 무공 선행 요구 최대치).
function consumerMinSeong(artId: string): number {
  let m = 0;
  for (const a of MARTIAL_ARTS)
    for (const p of a.prerequisites ?? []) if (p.artId === artId) m = Math.max(m, p.minSeong);
  return m;
}

// ── 최적 플레이: 매일 호출 ────────────────────────────────────────────────
const OPTIMAL_PATTERN: TrainingCategory[] = [
  'martial', 'physical', 'martial', 'rest', 'martial', 'physical', 'rest',
];

// 한 제자의 전투 캐리 훈련(무공서 트리 climbing + 내공·성·외공 균형). 반환: 초절정↑(화경 임박).
function configureCarryTraining(id: string): boolean {
  const sched = useScheduleStore.getState();
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[id];
  if (!d || d.status !== 'training') return false;

  // 1) 무공서 — 계보 트리를 합법적으로 타고 올라간다(선행조건 충족 후 상위 무공 학습/육성).
  const goal = goalArtFor(d);
  let trainId = d.mainMartialArtId ?? d.martialArts[0]?.artId ?? '';
  if (goal) {
    const planned = canLearnArt(d, goal) || owns(d, goal.id) ? goal.id : planArtToward(d, goal);
    if (planned) trainId = planned;
  }
  // 천장 데드락 방지(2026-06-12 실측): 계획 무공이 저급 선행(예: 하품 초상비)이면 그 천장에
  // 경지가 묶여 상위 무공 학습 게이트(절정 등)에 영영 못 닿는다 — 비급 전권 보유 시 재현.
  // 격일로 "지금 배울 수 있는 최고 천장 무공"을 주력 삼아 경지를 병행 상승(실플레이 결:
  // 절품 검보를 주력으로 두고 선행은 병습).
  {
    const nextR = nextRealm(d.realm);
    const plannedArt = trainId ? findMartialArt(trainId) : undefined;
    if (
      nextR &&
      plannedArt &&
      realmIndex(effectiveRealmCeiling(plannedArt.grade)) < realmIndex(nextR) &&
      useTimeStore.getState().totalDay % 2 === 1
    ) {
      const effRank: Record<string, number> = { 특화: 4, 상성: 3, 보통: 2, 미숙: 1, 상극: 0 };
      const ceilingArt = MARTIAL_ARTS.filter(
        (a) =>
          a.minDarkness == null &&
          realmIndex(effectiveRealmCeiling(a.grade)) >= realmIndex(nextR) &&
          (owns(d, a.id) || (chainOwned(a) && canLearnArt(d, a))),
      ).sort((a, b) => {
        const g = GOAL_GRADE_RANK[b.grade] - GOAL_GRADE_RANK[a.grade];
        if (g !== 0) return g;
        return (effRank[d.efficiency?.[b.school] ?? '보통'] ?? 2) - (effRank[d.efficiency?.[a.school] ?? '보통'] ?? 2);
      })[0];
      if (ceilingArt) trainId = ceilingArt.id;
    }
  }
  if (trainId && trainId !== d.mainMartialArtId) ds.assignMainMartialArt(id, trainId);

  // 2) 무공축 — 경지(내공)와 무공 성 병행. 둘 다 부족하면 하루씩 번갈아, 한쪽만 부족하면 그쪽.
  const next = nextRealm(d.realm);
  const internal = d.realmProgress?.internal ?? 0;
  const internalReq = next ? (REALM_INTERNAL_REQ[next] ?? 0) : 0;
  const seongTarget = Math.max(
    consumerMinSeong(trainId),
    goal && trainId === goal.id && next ? (REALM_SEONG_GATE[next] ?? 0) : 0,
  );
  const needSeong = seongOf(d, trainId) < seongTarget;
  const needInternal = internal < internalReq;
  const parity = useTimeStore.getState().totalDay % 2 === 0;
  const axis = needSeong && needInternal ? (parity ? 'chosik' : 'simbeop')
    : needSeong ? 'chosik'
    : needInternal ? 'simbeop'
    : 'chosik';
  sched.setDailyChoice(id, 'martial', axis);

  // 3) 체력 — 외공 받침 채울 때까지 기마자세, 채우면 암벽.
  // 화경은 받침 62(externalSupportReq) — 마지막 8은 환골탈태(영약)가 채우므로 70을 목표로 헛수련하지 않는다.
  const strengthLv = d.stats?.strength?.level ?? 0;
  const extReq = next ? externalSupportReq(next) : 0;
  sched.setDailyChoice(id, 'physical', strengthLv < extReq ? 'phys_horse' : 'phys_climb');

  return realmIndex(d.realm) >= realmIndex('chojeoljeong');
}

function maybeGrantElixir(near: boolean): void {
  if (near && !hasDivineElixir() && elixirGranted < elixirBudget) {
    grantDivineElixir();
    elixirGranted += 1;
  }
}

export function configureOptimal(): void {
  useScheduleStore.getState().setSchedule({ weeklyPattern: [...OPTIMAL_PATTERN], monthlyQuests: 0 });
  const ds = useDiscipleStore.getState();
  let near = false;
  for (const id of ds.order) if (configureCarryTraining(id)) near = true;
  maybeGrantElixir(near);
}

// ── 1 캐리 + 3 서포트 파티 빌드 ─────────────────────────────────────────────
// 서포트 역할 → 집중 공부 종목. alchemy = 영약제조(신품영약 연단 → 무과금 캐리 화경).
const SUPPORT_OPTION: Record<string, string> = {
  medicine: 'study_medicine', // 신의급 의원 — 의뢰 동행 시 캐리 치명상 구원
  alchemy: 'study_alchemy', //   영약제조 — 신품영약 연단(tickElixirCraft) → 무과금 화경
  formation: 'study_formation', // 진법 — 의뢰 돌발 진법 굴림 유리
};
const SUPPORT_PATTERN: TrainingCategory[] = ['study', 'study', 'rest', 'study', 'study', 'study', 'rest'];

function configureSupportTraining(id: string, role: string): void {
  if (role === 'combat' || role === 'carry') {
    configureCarryTraining(id);
    return;
  }
  const sched = useScheduleStore.getState();
  sched.setIndividualPattern(id, [...SUPPORT_PATTERN]);
  const opt = SUPPORT_OPTION[role];
  if (opt) sched.setDailyChoice(id, 'study', opt);
}

// 파티 하루 세팅 — roleMap: discipleId → 'carry'|'medicine'|'alchemy'|'formation'|'combat'.
// 캐리는 전투 화경 푸시, 서포트는 자기 역할 공부. 영약제조 서포트는 연단으로 캐리에게 신품영약 공급.
export function configurePartyDay(roleMap: Record<string, string>): void {
  useScheduleStore.getState().setSchedule({ weeklyPattern: [...OPTIMAL_PATTERN], monthlyQuests: 0 });
  const ds = useDiscipleStore.getState();
  let near = false;
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training') continue;
    const role = roleMap[id] ?? 'carry';
    if (role === 'carry') {
      if (configureCarryTraining(id)) near = true;
    } else {
      configureSupportTraining(id, role);
    }
  }
  maybeGrantElixir(near);
}

// 의뢰 파견(최적) — 유휴 제자를 역량 맞는 의뢰에 보내 경험치(주력 성·외공·명성)를 먹인다.
// rate 로 빈도 조절(훈련과 병행). 파견 중엔 일과 훈련 미발동(경지 진행 멈춤) → 트레이드오프.
const gradeRank = (g: string): number => QUEST_GRADE_ORDER.indexOf(g as never);

export function optimalDispatch(rate = 0.15, minAge = 0): void {
  const board = useQuestStore.getState().board;
  if (board.length === 0) return;
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training') continue;
    if (currentAge(d) < minAge) continue; // 유년기 제외 — 청소년기(minAge)부터 의뢰.
    if (rand() > rate) continue;
    // 역량 되는 의뢰 중 **가장 높은 등급**(경험 프리미엄). 쉬운(잡일·소무)은 제외 — 경험 의뢰만 보낸다.
    // 역량 안 되는 어린 제자는 보낼 의뢰가 없어 자연히 훈련(유년기). 청소년기부터 위험 의뢰 가능.
    const fits = board.filter((q) => canDispatch(d, q) && gradeRank(q.grade) >= gradeRank('normal'));
    if (fits.length === 0) continue;
    fits.sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade));
    dispatchQuest(fits[0].id, [d.id]);
  }
}

// 파티 의뢰 파견 — 캐리를 서포트와 함께 보낸다(의원=생존, 진법=성공률). 리더(캐리)만 역량 필요.
// 영약제조 서포트는 동행 X(집에서 연단). roleMap 없으면 의술 우선으로 동행.
export function partyDispatch(carryId: string, roleMap: Record<string, string>, rate = 0.12, minAge = 13): void {
  const board = useQuestStore.getState().board;
  if (board.length === 0) return;
  const ds = useDiscipleStore.getState();
  const carry = ds.disciples[carryId];
  if (!carry || carry.status !== 'training' || currentAge(carry) < minAge) return;
  if (rand() > rate) return;
  const fits = board.filter((q) => canDispatch(carry, q) && gradeRank(q.grade) >= gradeRank('normal'));
  if (fits.length === 0) return;
  fits.sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade));
  const q = fits[0];
  // 동행 후보 — 유휴 서포트 중 영약제조(연단)는 제외, 의술(의원) 우선.
  const helpers = ds.order
    .map((id) => ds.disciples[id])
    .filter((m): m is Disciple => Boolean(m && m.id !== carryId && m.status === 'training' && roleMap[m.id] !== 'alchemy'))
    .sort((a, b) => (b.stats?.medicine?.level ?? 0) - (a.stats?.medicine?.level ?? 0));
  const party = [carryId];
  for (const h of helpers) {
    if (party.length >= Math.max(2, q.recommended)) break;
    party.push(h.id);
  }
  dispatchQuest(q.id, party);
}

// 자금 목적 파견 — 역량 되는 의뢰 중 **보상 큰 것 아무거나**(잡일·소무 포함). 청소년기부터.
// (optimalDispatch 는 보통↑ 경험 의뢰만 — 자금 벌이엔 저급도 받아야 하므로 별도.)
export function incomeDispatch(rate = 0.05, minAge = 13): void {
  const board = useQuestStore.getState().board;
  if (board.length === 0) return;
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training' || currentAge(d) < minAge) continue;
    if (rand() > rate) continue;
    const fits = board.filter((q) => canDispatch(d, q)).sort((a, b) => b.reward.money - a.reward.money);
    if (fits.length) dispatchQuest(fits[0].id, [d.id]);
  }
}

// 금창약 — 치명상(중상·부상) 회복. includeDeath 면 의뢰 재난 사망(departed)도 살린다는 가정.
// (sweep 맥락은 졸업·전직 없음 → departed=의뢰 사망이라 안전.)
export function healWithSalve(includeDeath: boolean): { healed: number; saved: number } {
  const ds = useDiscipleStore.getState();
  let healed = 0;
  let saved = 0;
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d) continue;
    if (d.status === 'injured') {
      ds.update(id, { status: 'training', injuryDaysRemaining: 0, wounds: undefined });
      healed += 1;
    } else if (includeDeath && d.status === 'departed') {
      ds.update(id, { status: 'training', injuryDaysRemaining: 0, wounds: undefined });
      saved += 1;
    }
  }
  return { healed, saved };
}

// 최적 4지선다 — 폐관 청원은 **항상 허락**(깨달음 벽 돌파 기회를 놓치지 않음). 그 외는 랜덤
// (이벤트 효과가 정량 노출 안 돼 일반적 정답을 못 고름). 경지 성장의 핵심 레버는 폐관 허락.
export function pickOptimalInboxKey(
  item: InboxItem,
  options: { key: string; label: string }[],
): string {
  const domain = (item.payload as { domain?: string } | undefined)?.domain;
  if (domain === 'seclusion_petition') {
    const allow = options.find((o) => o.key === 'allow');
    if (allow) return allow.key;
  }
  return options[Math.floor(rand() * options.length)].key;
}

// ── 올랜덤 플레이: 매일 호출 ──────────────────────────────────────────────
export function configureRandom(): void {
  const sched = useScheduleStore.getState();
  sched.setSchedule({
    weeklyPattern: Array.from({ length: 7 }, () => pick(CATEGORIES)),
    monthlyQuests: 0,
  });

  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training') continue;

    sched.setDailyChoice(id, 'martial', pick(MARTIAL_AXES));
    sched.setDailyChoice(id, 'physical', pick(TRAINING_OPTIONS.filter((o) => o.category === 'physical')).id);
    sched.setDailyChoice(id, 'study', pick(TRAINING_OPTIONS.filter((o) => o.category === 'study')).id);

    // 가끔 무공서 무작위 변경(합법 학습가능 범위 내 — 선행조건 존중).
    if (rand() < 0.004) {
      const arts = learnableArts(d);
      if (arts.length) ds.assignMainMartialArt(id, pick(arts).id);
    }
  }

  // 가끔 영약 무작위 지급(먹이는 케이스 노출).
  if (rand() < 0.002 && !hasDivineElixir()) grantDivineElixir();
}
