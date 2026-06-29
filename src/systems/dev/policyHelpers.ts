// 플레이 정책 공용 헬퍼 — 두 정책(random/growth)이 게임의 모든 결정 표면을 다루게 한다.
// 결정 표면: 훈련 카테고리·세부종목, 무공축(심법/초식/경공), 무공서 변경, 영약 복용, 의뢰 파견, 4지선다.
//
// random  = 모든 결정을 무작위로.
// optimal = 경지 상승(궁극 화경)을 향해 합리적으로. 무공서는 **계보 트리를 합법적으로 타고 올라간다**:
//           한번 정한 무공 계열의 선행조건(prerequisites)을 차례로 충족하며 상위 무공으로 갈아탄다
//           (텔레포트 X). 정점(절품 무공서) + 내공/외공/성 게이트 + 신품 영약 → 화경.

import { random } from '@/systems/rng';
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
import { grantDivineElixir, hasDivineElixir, divineElixirCount } from '@/systems/elixirSystem';
import { DIVINE_ELIXIR_FOR_HWAGYEONG } from '@/data/elixirs';
import { canDispatch, dispatchQuest } from '@/systems/questSystem';
import { currentAge } from '@/systems/discipleCtx';
import { QUEST_GRADE_ORDER } from '@/data/quests';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useQuestStore } from '@/stores/questStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, InboxItem, MartialArt, MoralChoice, TrainingCategory } from '@/types';

const rand = () => random();
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

export function goalArtFor(d: Disciple): MartialArt | null {
  // 보유 비급 기준 **모든 등급** 후보 — 사문 오리지널 폐기 후 보장 정점이 없으므로,
  // 드랍이 모이는 대로 더 높은 등급 트리로 동적으로 갈아탄다(초반엔 공용 중품이 목표).
  const candidates = MARTIAL_ARTS.filter(
    (a) =>
      a.minDarkness == null && // 마공 트리는 최적 정책에서 제외(흑화 대가)
      chainOwned(a),
  );
  if (candidates.length === 0) return null;
  // 등급 우선 → **이미 투자한 계보 우선**(같은 등급이면) → 갈래 효율(특화>상성>보통>미숙>상극).
  // 계보 우선이 핵심(2026-06-25 버그 수정): 같은 등급 무공이 여러 계보에 있을 때, 제자가 이미 키운
  // 계보를 두고 다른 계보로 목표를 바꾸면 그 계보 하품 뿌리(예: 보법 chosangbi)부터 재등반하느라
  // 주력 등급천장이 후퇴(절정→일류)해 일류에 헛묶인다(factorysweep 화경 0% 회귀 원인). 현 주력 계보를
  // 유지하면 같은 계보 상위 무공으로 곧장 이어 올라간다.
  const effRank: Record<string, number> = { 특화: 4, 상성: 3, 보통: 2, 미숙: 1, 상극: 0 };
  // 'common'(공용 스타터 풀: chosangbi 등)은 '투자한 계보'가 아니다 — 공용 계보를 우선하면 유일한
  // 공용 grandmaster(common-mumyeong-simbeop·qigong)가 빌드 갈래(효율 특화)를 가로채 카리가 검 대신
  // 공용 심법 사슬을 타 일류 정체(factorysweep 화경 0%). 실 계보만 투자로 보고, 공용은 효율이 결정. docs/37 G3.
  const rawLineage = mainArtOf(d)?.lineage;
  const mainLineage = rawLineage && rawLineage !== 'common' ? rawLineage : undefined;
  candidates.sort((a, b) => {
    const g = GOAL_GRADE_RANK[b.grade] - GOAL_GRADE_RANK[a.grade];
    if (g !== 0) return g;
    if (mainLineage) {
      const al = a.lineage === mainLineage ? 1 : 0;
      const bl = b.lineage === mainLineage ? 1 : 0;
      if (al !== bl) return bl - al; // 현 주력과 같은 계보 우선
    }
    return (effRank[d.efficiency?.[b.school] ?? '보통'] ?? 2) - (effRank[d.efficiency?.[a.school] ?? '보통'] ?? 2);
  });
  // 우선순위 순회하며 **첫 도달 가능 후보**를 목표로 — 도달 불가 정점(업적 legendary 등, planArtToward=null)을
  // 건너뛴다. god-mode 전권엔 dokgo-gugeom(독고구검·legendary)처럼 사슬 진입 불가 무공이 들어와, 등급
  // 최우선이라 그걸 목표로 잡으면 carry 가 한 발도 못 떼고 주력 chosangbi 에 영영 고착(factorysweep 화경 0%). docs/37 G4.
  for (const c of candidates) {
    if (canLearnArt(d, c) || owns(d, c.id) || planArtToward(d, c) != null) return c;
  }
  return candidates[0]; // 전부 도달 불가 — 최상위 반환(현 주력 유지 폴백)
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

// 휴식 보장(2026-06-29, docs/49 C6 ⓑ · docs/37 G2 형제) — 봇이 스트레스·심마를 관리하지 않아
// 주화입마 죽음의 소용돌이(고스트레스→심마→발작→내공흩어짐+내상→무성장)에 빠지던 것 차단.
// 심마는 stress<30 에서만 가라앉으므로(simmaSystem), 고수위면 안정될 때까지 휴식 주간으로 끌어내린다.
const REST_WEEK: TrainingCategory[] = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
const REST_STRESS_ON = 55; // 발작 신호(55) 도달 즈음 휴식 진입
const REST_STRESS_OFF = 25; // stress<30 이라야 심마가 가라앉음 → 25까지 끌어내려 회복 보장
const REST_SIMMA_ON = 48; // 발작 임계(60)·신호(55) 전에 예방 휴식
const REST_SIMMA_OFF = 38;

// 휴식 보장 공용 — 캐리·서포트 양쪽이 같은 "헛휴식" 버그(rest 종목 미설정 → 휴식일 stress 0 →
// 심마 climb → 발작 소용돌이)에 빠지던 것 차단. ① 휴식일에 강한 해소 종목(마을 −20). ② 스트레스/심마
// 고수위면 안정될 때까지 휴식 주간(히스테리시스). 반환 true = 오늘 휴식 → 상위 훈련 설정 생략.
function ensureRest(id: string, d: Disciple): boolean {
  const sched = useScheduleStore.getState();
  sched.setDailyChoice(id, 'rest', 'rest_village');
  const stress = d.stress ?? 0;
  const simma = d.simma ?? 0;
  const pat = sched.individualPatterns[id];
  const resting = pat != null && pat.length > 0 && pat.every((c) => c === 'rest');
  const needRest = stress >= REST_STRESS_ON || simma >= REST_SIMMA_ON;
  const calmEnough = stress <= REST_STRESS_OFF && simma <= REST_SIMMA_OFF;
  if (needRest || (resting && !calmEnough)) {
    sched.setIndividualPattern(id, [...REST_WEEK]);
    return true;
  }
  return false;
}

// 한 제자의 전투 캐리 훈련(무공서 트리 climbing + 내공·성·외공 균형). 반환: 초절정↑(화경 임박).
// 목표 무공의 사슬 집합 — 목표 + 전이적 선행 전부. 천장 블록이 "목표 사다리 위의 무공"을 우선 고르게.
function chainSetToward(goal: MartialArt, depth = 0, acc = new Set<string>()): Set<string> {
  if (depth > 8 || acc.has(goal.id)) return acc;
  acc.add(goal.id);
  for (const p of goal.prerequisites ?? []) {
    const pre = findMartialArt(p.artId);
    if (pre) chainSetToward(pre, depth + 1, acc);
  }
  return acc;
}

function configureCarryTraining(id: string): boolean {
  const sched = useScheduleStore.getState();
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[id];
  if (!d || d.status !== 'training') return false;

  // 0) 휴식 보장 — 심마·스트레스 관리(공용 ensureRest). 고수위면 안정될 때까지 휴식, 아니면 사문 패턴 복귀.
  if (ensureRest(id, d)) return realmIndex(d.realm) >= realmIndex('chojeoljeong');
  sched.clearIndividualPattern(id);

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
      realmIndex(effectiveRealmCeiling(plannedArt.grade)) < realmIndex(nextR)
    ) {
      // 매일 구제(종전 격일 제한 제거, 2026-06-25): 계획 무공의 천장이 다음 경지에 못 미치면 그 즉시
      // "지금 키울 수 있는 최고 천장 무공"을 주력으로 — 하품 뿌리에 며칠씩 묶여 시간 낭비하지 않게.
      const effRank: Record<string, number> = { 특화: 4, 상성: 3, 보통: 2, 미숙: 1, 상극: 0 };
      // 목표 사다리(goal 의 사슬) — 천장 블록이 사슬 밖 막다른 고천장 검(예: samjae-sword)으로 새지 않고
      // 목표로 이어지는 무공을 우선 잡게. 사슬 위가 없을 때만 off-chain 다리로 폴백. docs/37 G4.
      const chainSet = goal ? chainSetToward(goal) : new Set<string>();
      const ceilingArt = MARTIAL_ARTS.filter(
        (a) =>
          a.minDarkness == null &&
          (goal == null || a.school === goal.school) && // 빌드 갈래 유지
          realmIndex(effectiveRealmCeiling(a.grade)) >= realmIndex(nextR) &&
          (owns(d, a.id) || (chainOwned(a) && canLearnArt(d, a))),
      ).sort((a, b) => {
        const ca = chainSet.has(a.id) ? 1 : 0; // 목표 사다리 위의 무공 우선
        const cb = chainSet.has(b.id) ? 1 : 0;
        if (ca !== cb) return cb - ca;
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
  // 화경 임박 시 N과(DIVINE_ELIXIR_FOR_HWAGYEONG)까지 채워준다 — 분리 레버 도입 후 1과만 주면 화경 못 넘음.
  // elixirBudget = 회차당 확보 가능한 신품 영약 총수(화경 1회 = N과 소모). budget 0(천장 sim)이면 no-op.
  if (near && divineElixirCount() < DIVINE_ELIXIR_FOR_HWAGYEONG && elixirGranted < elixirBudget) {
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
  const d = useDiscipleStore.getState().disciples[id];
  if (!d) return;
  // 휴식 보장 — 서포트도 같은 헛휴식 버그 대상(공부 종목 stress 7~12). 고수위면 휴식 우선.
  if (ensureRest(id, d)) return;
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
      ds.update(id, { status: 'training', wounds: undefined });
      healed += 1;
    } else if (includeDeath && d.status === 'departed') {
      ds.update(id, { status: 'training', wounds: undefined });
      saved += 1;
    }
  }
  return { healed, saved };
}

// 최적 4지선다 — ① 폐관 청원은 **항상 허락**(깨달음 벽 돌파 기회). ② 도덕 사건은 **선한 양육**:
// 흑화 증가폭이 가장 작은(또는 낮추는) 선택을 고른다. 종전 무작위 양육이 저저항 제자(이청하)를 흑화시켜
// 심마 소용돌이를 만들던 것 차단(docs/49 C6 · 2026-06-29). ③ 그 외는 랜덤(효과 정량 미노출).
// random 봇(RandomPolicy)은 이 함수를 안 쓰므로 흑화 발화 QA는 그대로 유지된다.
export function pickOptimalInboxKey(
  item: InboxItem,
  options: { key: string; label: string }[],
): string {
  const p = item.payload as
    | { domain?: string; choices?: MoralChoice[]; options?: { key: string; effects?: MeetingEffectLike }[] }
    | undefined;
  const domain = p?.domain;
  if (domain === 'seclusion_petition') {
    const allow = options.find((o) => o.key === 'allow');
    if (allow) return allow.key;
  }
  if (domain === 'moral' && Array.isArray(p?.choices)) {
    // 도덕 사건: 흑화 압력 최소(선한 양육). 직접 흑화창은 절대 회피 + 자비·강직·신뢰를 높이는(=장래
    // darknessScore 를 낮추는) 선택을 고른다. 종전 "위험도 최소"는 harsh(punish)를 골라 자비를 깎아
    // 오히려 점수 경로로 흑화시켰다(이청하 mercy16→3). docs/49 C6.
    const choices = p.choices;
    let best: string | undefined;
    let bestP = Infinity;
    for (const o of options) {
      const e = choices.find((c) => c.tone === o.key)?.perpetrator;
      const pr = darknessPressure(e?.darknessLevelBump, e?.trustDelta, e?.personalityShift);
      if (pr < bestP) {
        best = o.key;
        bestP = pr;
      }
    }
    if (best) return best;
  }
  if (domain === 'meeting' && Array.isArray(p?.options)) {
    // 면담도 같은 축 — 인격(자비·강직·온정)을 깎는 냉정한 답이 장래 흑화를 키운다. 따뜻·신뢰 답을 고른다.
    const mopts = p.options;
    let best: string | undefined;
    let bestP = Infinity;
    for (const o of options) {
      const e = mopts.find((m) => m.key === o.key)?.effects;
      const pr = darknessPressure(e?.darkness, e?.trust, e?.persona);
      if (pr < bestP) {
        best = o.key;
        bestP = pr;
      }
    }
    if (best) return best;
  }
  return options[Math.floor(rand() * options.length)].key;
}

// 면담 효과의 흑화 관련 부분(구조적 읽기 — meetingSystem MeetingEffect 미러).
type MeetingEffectLike = {
  darkness?: number;
  trust?: number;
  persona?: Partial<Record<string, number>>;
};

// 한 선택의 "흑화 압력" — 낮을수록 선한 양육. darknessScore 구동축(자비·강직↑=선, 야망↑=악, 직접
// 흑화창은 절대 회피). 도덕(perpetrator)·면담(meeting effects) 공용. docs/13 darknessScore 미러.
function darknessPressure(
  levelBump: number | undefined,
  trust: number | undefined,
  persona: Partial<Record<string, number>> | undefined,
): number {
  return (
    (levelBump ?? 0) * 1000 - // 직접 흑화 단계 +N 은 무조건 회피
    (persona?.mercy ?? 0) * 0.6 -
    (persona?.integrity ?? 0) * 0.4 -
    (persona?.warmth ?? 0) * 0.2 +
    (persona?.ambition ?? 0) * 0.3 -
    (trust ?? 0) * 0.1
  );
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
