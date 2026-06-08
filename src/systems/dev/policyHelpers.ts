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
// 제자의 최종 목표 무공(그 계열의 화경급 정점). 화경 트리는 현 데이터에 2개:
//  - 화산 검: …→이십사수매화검(grandmaster)   - 사파→마교: 흑풍권@5성→혈마공(grandmaster)
function goalArtFor(d: Disciple): MartialArt | null {
  // 이미 사파 권(흑풍권)을 든 제자는 그 트리(→혈마공)를 탄다.
  if (owns(d, 'heukpung-fist')) return findMartialArt('hyeolma-gong') ?? null;
  const school = mainArtOf(d)?.school;
  if (school === 'fist' || school === 'darkArts') return findMartialArt('hyeolma-gong') ?? null;
  // 그 외(검·내공·보법 등)는 가장 일반적인 화경 트리(화산 검)로.
  return findMartialArt('isipsa-maehwa-sword') ?? null;
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

export function configureOptimal(): void {
  const sched = useScheduleStore.getState();
  sched.setSchedule({ weeklyPattern: [...OPTIMAL_PATTERN], monthlyQuests: 0 });

  const ds = useDiscipleStore.getState();
  let nearHwagyeong = false;
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training') continue;

    // 1) 무공서 — 계보 트리를 합법적으로 타고 올라간다(선행조건 충족 후 상위 무공 학습/육성).
    const goal = goalArtFor(d);
    let trainId = d.mainMartialArtId ?? d.martialArts[0]?.artId ?? '';
    if (goal) {
      const planned = canLearnArt(d, goal) || owns(d, goal.id) ? goal.id : planArtToward(d, goal);
      if (planned) trainId = planned;
    }
    if (trainId && trainId !== d.mainMartialArtId) ds.assignMainMartialArt(id, trainId);

    // 2) 무공축 — 경지(내공)와 무공 성을 **병행**한다. 상위 무공은 경지 게이트(예: 매화검=이류,
    //    이십사수매화검=절정)와 선행 성을 둘 다 요구하므로, 둘 다 부족하면 하루씩 번갈아 올린다.
    //    한쪽만 부족하면 그쪽을, 둘 다 충족이면 초식(다음 단계 성 선행).
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

    // 3) 체력 — 외공(근력) 요건 채울 때까지 기마자세, 채우면 암벽(체력Lv).
    const strengthLv = d.stats?.strength?.level ?? 0;
    const extReq = next ? (REALM_EXTERNAL_REQ[next] ?? 0) : 0;
    sched.setDailyChoice(id, 'physical', strengthLv < extReq ? 'phys_horse' : 'phys_climb');

    if (realmIndex(d.realm) >= realmIndex('chojeoljeong')) nearHwagyeong = true;
  }

  // 4) 영약 — 초절정 도달 제자가 있고 과금 예산이 남았으면 신품 영약 확보(화경 벽 통과 열쇠).
  //    무과금(budget 0)은 여기서 지급 안 함 → 화경 벽에서 막힌다(영약제조 제자 연단 경로는 별도).
  if (nearHwagyeong && !hasDivineElixir() && elixirGranted < elixirBudget) {
    grantDivineElixir();
    elixirGranted += 1;
  }
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
      ds.update(id, { status: 'training', injuryDaysRemaining: 0 });
      healed += 1;
    } else if (includeDeath && d.status === 'departed') {
      ds.update(id, { status: 'training', injuryDaysRemaining: 0 });
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
