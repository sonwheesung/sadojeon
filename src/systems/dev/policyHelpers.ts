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
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, MartialArt, TrainingCategory } from '@/types';

const rand = () => Math.random();
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

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

  // 4) 영약 — 초절정 도달 제자가 있으면 신품 영약 확보(화경 벽 통과 열쇠).
  if (nearHwagyeong && !hasDivineElixir()) grantDivineElixir();
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
