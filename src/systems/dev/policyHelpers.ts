// 플레이 정책 공용 헬퍼 — 두 정책(random/growth)이 게임의 모든 결정 표면을 다루게 한다.
// 결정 표면: 훈련 카테고리·세부종목, 무공축(심법/초식/경공), 무공서 변경, 영약 복용, 의뢰 파견, 4지선다.
//
// random  = 모든 결정을 무작위로.
// optimal = 경지 상승(궁극 화경)을 향해 합리적으로: 등급천장 높은 무공서로 갈아타고,
//           내공/외공/성 게이트를 채우고, 초절정에서 신품 영약을 확보한다.

import { MARTIAL_ARTS, findMartialArt } from '@/data/martialArts';
import {
  REALM_EXTERNAL_REQ,
  REALM_INTERNAL_REQ,
  REALM_SEONG_GATE,
  artGradeLearnRealm,
  nextRealm,
  realmIndex,
} from '@/data/realm';
import { TRAINING_OPTIONS } from '@/data/training';
import { grantDivineElixir, hasDivineElixir } from '@/systems/elixirSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import type { Disciple, MartialArtGrade, TrainingCategory } from '@/types';

const rand = () => Math.random();
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

const GRADE_RANK: Record<MartialArtGrade, number> = {
  novice: 0,
  apprentice: 1,
  master: 2,
  grandmaster: 3,
  legendary: 4,
};

const CATEGORIES: TrainingCategory[] = ['martial', 'physical', 'study', 'rest'];
const MARTIAL_AXES = ['simbeop', 'chosik', 'gyeonggong'] as const;

function mainArtOf(d: Disciple) {
  return findMartialArt(d.mainMartialArtId ?? d.martialArts[0]?.artId ?? '');
}

// 현재 경지에서 익힐 수 있는 무공(학습 경지 게이트 통과). 사문은 전 비급 보유(newRun).
function learnableArts(d: Disciple) {
  const ri = realmIndex(d.realm);
  return MARTIAL_ARTS.filter((a) => ri >= realmIndex(artGradeLearnRealm(a.grade)));
}

// 최적 무공서 — 학습가능한 **최고 등급**(등급천장=화경 확보가 최우선). 동급이면 같은 계열 우선
// (효율 보존). 현 무공보다 등급이 높을 때만 갈아탄다. 화경은 절품(grandmaster)↑ 무공서로만 가능
// (현 데이터: 이십사수매화검/혈마공 2종) — 그래서 필요하면 타 계열로도 갈아탄다.
export function bestArtFor(d: Disciple): string | null {
  const main = mainArtOf(d);
  const arts = learnableArts(d);
  if (arts.length === 0) return main?.id ?? null;
  const mainSchool = main?.school;
  arts.sort((a, b) => {
    const g = GRADE_RANK[b.grade] - GRADE_RANK[a.grade];
    if (g !== 0) return g;
    return (a.school === mainSchool ? 0 : 1) - (b.school === mainSchool ? 0 : 1);
  });
  const best = arts[0];
  if (!main) return best.id;
  return GRADE_RANK[best.grade] > GRADE_RANK[main.grade] ? best.id : main.id;
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

    // 1) 무공서 변경 — 등급천장 높은 같은계열 무공으로 갈아탄다(화경 천장 확보).
    const best = bestArtFor(d);
    if (best && best !== d.mainMartialArtId) ds.assignMainMartialArt(id, best);

    // 2) 무공축 — 다음 경지 게이트를 균형있게 채운다: 성 게이트 미달이면 초식(성), 아니면
    //    내공 미달이면 심법(내공), 둘 다 충족이면 초식(다음 경지 성 선행 적립).
    //    (내공만 파면 성이 안 올라 화경 7성 게이트를 영영 못 넘는다.)
    const next = nextRealm(d.realm);
    const internal = d.realmProgress?.internal ?? 0;
    const mainInst = d.martialArts.find((a) => a.artId === d.mainMartialArtId) ?? d.martialArts[0];
    const seong = mainInst?.seong ?? 1;
    const seongGate = next ? (REALM_SEONG_GATE[next] ?? 0) : 0;
    const internalReq = next ? (REALM_INTERNAL_REQ[next] ?? 0) : 0;
    const axis = seong < seongGate ? 'chosik' : internal < internalReq ? 'simbeop' : 'chosik';
    sched.setDailyChoice(id, 'martial', axis);

    // 3) 체력 — 외공(근력) 요건 채울 때까지 기마자세, 채우면 암벽(체력Lv→스태미나).
    const strengthLv = d.stats?.strength?.level ?? 0;
    const extReq = next ? (REALM_EXTERNAL_REQ[next] ?? 0) : 0;
    sched.setDailyChoice(id, 'physical', strengthLv < extReq ? 'phys_horse' : 'phys_climb');

    if (realmIndex(d.realm) >= realmIndex('chojeoljeong')) nearHwagyeong = true;
  }

  // 4) 영약 — 초절정 도달 제자가 있으면 신품 영약 확보(화경 벽 통과 열쇠). 없으면 지급.
  if (nearHwagyeong && !hasDivineElixir()) grantDivineElixir();
}

// ── 올랜덤 플레이: 매일 호출 ──────────────────────────────────────────────
export function configureRandom(): void {
  const sched = useScheduleStore.getState();
  // 매일 무작위 주간 패턴 → 그날 카테고리도 사실상 랜덤.
  sched.setSchedule({
    weeklyPattern: Array.from({ length: 7 }, () => pick(CATEGORIES)),
    monthlyQuests: 0,
  });

  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status !== 'training') continue;

    // 무공축 랜덤.
    sched.setDailyChoice(id, 'martial', pick(MARTIAL_AXES));
    // 체력·공부 종목 랜덤.
    const physOpts = TRAINING_OPTIONS.filter((o) => o.category === 'physical');
    const studyOpts = TRAINING_OPTIONS.filter((o) => o.category === 'study');
    sched.setDailyChoice(id, 'physical', pick(physOpts).id);
    sched.setDailyChoice(id, 'study', pick(studyOpts).id);

    // 가끔 무공서 무작위 변경.
    if (rand() < 0.004) {
      const arts = learnableArts(d);
      if (arts.length) ds.assignMainMartialArt(id, pick(arts).id);
    }
  }

  // 가끔 영약 무작위 지급(먹이는 케이스 노출).
  if (rand() < 0.002 && !hasDivineElixir()) grantDivineElixir();
}
