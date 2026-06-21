// 훈련 엔진 v2 — docs/06_훈련_일정.md "훈련 3층 구조".
// 매일 [진행] 시 졸업·하산 제외 전원에 대해:
// 1. 그날 계획 해소: 3층 임시명령 > 카테고리(개인/사문 주간패턴) → 세부 종목(일일 선택)
// 2. 현재 체력·스트레스 변동
// 3. 진척 배수 = 체력비율 효율 × 익일 잔여피로(fatiguePenalty)
// 4. 무공(카테고리=무공/폐관): 선택한 1개 무공만 단계 진행
// 5. 체력·공부 종목: 적성 배율 × 효율 만큼 단련 스탯 EXP 적립 (Lv/EXP)
// 6. 현재 체력 0 도달 시 강제 휴식 (triggerCollapse)
// 7. 종목 lingering 을 내일 fatiguePenalty 로 적재

import { random } from '@/systems/rng';
import {
  findMartialArt,
  EXP_BASE_BY_STAGE,
  GRADE_LEARN_MULT,
  expToNextSeong,
  seongCap,
  seongToStage,
} from '@/data/martialArts';
import { PLATEAU } from '@/data/constants';
import { EFFICIENCY_MULTIPLIER, BODY_EFFICIENCY_MULTIPLIER } from '@/data/efficiency';
import { playCutscene } from './cutsceneSystem';
import { currentAge } from './discipleCtx';
import {
  BASE_MAX_STAMINA,
  findTrainingOption,
  defaultOptionFor,
} from '@/data/training';
import { useDiscipleStore } from '@/stores/discipleStore';
import { categoryFor, useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  Disciple,
  DiscipleOverrideCommand,
  MartialArt,
  MartialArtInstance,
  MartialStage,
  StatId,
  TrainingCategory,
} from '@/types';
import { MARTIAL_STAGE_ORDER } from '@/types/martialArt';
// (MARTIAL_STAGE_ORDER 는 밴드 승급 방향 비교에 사용)
import {
  MARTIAL_AXES,
  MARTIAL_AXIS_LABEL,
  type MartialAxis,
} from '@/types/training';
import type { Realm } from '@/types/realm';
import {
  ENLIGHTENMENT_PITY_GUARANTEE,
  ENLIGHTENMENT_PITY_STEP,
  REALM_GAIN,
  REALM_INTERNAL_REQ,
  REALM_EXTERNAL_REQ,
  REALM_SEONG_GATE,
  REALM_SEONG_CAP,
  effectiveRealmCeiling,
  enlightenmentChance,
  externalSupportReq,
  greatEnlightenmentChance,
  isWallTransition,
  nextRealm,
  realmCeiling,
  realmIndex,
  wallInternalReq,
} from '@/data/realm';
import { realmUpToInbox, seclusionPetitionToInbox } from './eventInbox';
import { activeOverrideOf, cancelOverride } from './overrideSystem';
import { consumeDivineElixir, hasDivineElixir } from './elixirSystem';
import { attemptBoneRebirth } from './boneRebirthSystem';
import { recordDaeoh } from './dev/daeohTelemetry';
import { parseDaeryeonChoice, resolveDaeryeon } from './daeryeonSystem';
import { applyPrereqTrickle } from './martialExp';
import { consumeElixirItem, elixirItemCount } from './alchemySystem';
import { addSimma, onForcedBreakthroughFail } from './simmaSystem';
import { staminaRatioMultiplier, triggerCollapse } from './staminaSystem';

// 무공 카테고리 1일치 체력·스트레스 (종목 데이터엔 없으므로 상수).
const MARTIAL_STAMINA_DELTA = -10;
const MARTIAL_STRESS_DELTA = 5;

// 성 안에서의 정체기 — EXP 충전률(0~100%) 기준. docs/26.
function plateauMultiplier(exp: number, seong: number): number {
  const frac = (exp / expToNextSeong(seong)) * 100;
  if (frac >= PLATEAU.SECOND_START) return PLATEAU.SECOND_MULTIPLIER;
  if (frac >= PLATEAU.FIRST_START) return PLATEAU.FIRST_MULTIPLIER;
  return 1.0;
}

// 무공 학습 효율 배율 — 갈래 효율맵. 미기재 갈래 = '보통'. docs/28 §2.
function learnMultiplier(art: MartialArt, d: Disciple): number {
  return EFFICIENCY_MULTIPLIER[d.efficiency?.[art.school] ?? '보통'];
}

// 외공(근골) 능력치 — 근력(외공 기둥)·체력(최대 체력). docs/28 §5-1.
const BODY_STATS: readonly StatId[] = ['strength', 'endurance'];

// 외공 나이 보정 — "근골은 어릴 때 다진다". 7~12세 폭발, 17세부터 급감. docs/28 §5-1.
// → 어릴 때 몸 만들고(절정~초절정 외공), 자라선 무공 성·내공·깨달음 천착하는 양육 결.
export function bodyAgeMultiplier(age: number): number {
  if (age <= 12) return 6.0; // 각인기 — 근골 폭발
  if (age <= 14) return 4.0;
  if (age <= 16) return 2.4;
  if (age <= 18) return 1.1; // 출도기 — 둔화
  return 0.55; // 장성 후 — 근골은 거의 굳음
}

// 환골탈태 후 나이 보정 하한 — 젊은 육체(15~16세 수준)로 회귀, 몸이 다시 자란다. docs/23 §5.
export const BONE_REBIRTH_AGE_FLOOR = 2.4;

// 단련/비무공 능력치 학습 효율 — 영역 효율맵. 미기재 영역 = '보통'. docs/28 §2.
// 외공(근력·체력)은 무공보다 노력 의존(압축 효율) + 어릴 때 강함(나이 보정). docs/28 §5-1.
function aptitudeMultiplier(d: Disciple, statId: StatId): number {
  const tier = d.efficiency?.[statId] ?? '보통';
  if (BODY_STATS.includes(statId)) {
    // 환골탈태 — 몸이 다시 태어나 젊은 육체로 회귀(정통무협). 나이 보정이 청년기(×2.4) 밑으로 안 떨어짐.
    const ageMul = d.boneReborn
      ? Math.max(bodyAgeMultiplier(currentAge(d)), BONE_REBIRTH_AGE_FLOOR)
      : bodyAgeMultiplier(currentAge(d));
    return BODY_EFFICIENCY_MULTIPLIER[tier] * ageMul;
  }
  return EFFICIENCY_MULTIPLIER[tier];
}

// 무공 카테고리에서 진행할 무공 — 일일 선택 > 메인 > 첫 무공.
function selectedArtId(d: Disciple): string | undefined {
  const choice = useScheduleStore.getState().dailyChoice[d.id]?.martial;
  if (choice && d.martialArts.some((a) => a.artId === choice)) return choice;
  if (d.mainMartialArtId && d.martialArts.some((a) => a.artId === d.mainMartialArtId)) {
    return d.mainMartialArtId;
  }
  return d.martialArts[0]?.artId;
}

// ─── 그날 계획 ────────────────────────────────────────────────────────────────

interface DayPlan {
  category: TrainingCategory;
  optionId?: string; // 체력/공부/휴식 종목 id, 무공이면 artId
  optionLabel?: string;
  staminaDelta: number;
  stressDelta: number;
  intensity: number; // 무공 진척 배수 (폐관 1.5, 일반 무공 1.0, 그 외 0)
  lingering: number; // 내일로 넘길 fatiguePenalty
  grantStat?: StatId;
  expBase: number;
  artId?: string; // 진척시킬 무공 (무공/폐관)
  sparPartnerId?: string; // 대련 상대 (daeryeonSystem 짝 해소)
}

function resolveDayPlan(d: Disciple, day: number): DayPlan {
  // 3층: 임시 명령이 디폴트보다 우선.
  const ov = activeOverrideOf(d.id);
  if (ov && ov.command !== 'default') {
    if (ov.command === 'seclusion') {
      const artId = selectedArtId(d);
      const art = artId ? findMartialArt(artId) : undefined;
      return {
        category: 'martial',
        optionId: artId,
        optionLabel: art?.name,
        staminaDelta: Math.round(MARTIAL_STAMINA_DELTA * 1.5),
        stressDelta: MARTIAL_STRESS_DELTA,
        intensity: 1.5,
        lingering: 0,
        expBase: 0,
        artId,
      };
    }
    if (ov.command === 'quest') {
      return {
        category: 'rest',
        staminaDelta: -5,
        stressDelta: 0,
        intensity: 0,
        lingering: 0,
        expBase: 0,
      };
    }
    // healing
    return {
      category: 'rest',
      staminaDelta: 25,
      stressDelta: -10,
      intensity: 0,
      lingering: 0,
      expBase: 0,
    };
  }

  // 1층/2층: 주간 패턴(개인>사문) 카테고리 → 일일 선택 종목.
  const category = categoryFor(useScheduleStore.getState(), d.id, day);

  if (category === 'martial') {
    // 주력 무공은 그대로 진행하고, 무공 축(심법/경공/초식/대련)은 일일 선택으로 기록.
    const artId = selectedArtId(d);
    const axisRaw = useScheduleStore.getState().dailyChoice[d.id]?.martial;
    // 대련('daeryeon:<상대id>') — 짝 수련. 무공 진척은 짝 해소(daeryeonSystem)가 처리.
    const sparPartnerId = parseDaeryeonChoice(axisRaw);
    if (sparPartnerId) {
      return {
        category,
        optionId: 'daeryeon',
        optionLabel: '대련',
        staminaDelta: MARTIAL_STAMINA_DELTA - 2, // 맞상대는 혼자 수련보다 고되다
        stressDelta: MARTIAL_STRESS_DELTA,
        intensity: 0, // 개별 초식 틱 없음 — 성장은 대련 해소에서
        lingering: 0,
        expBase: 0,
        artId,
        sparPartnerId,
      };
    }
    const axis: MartialAxis = (MARTIAL_AXES as readonly string[]).includes(axisRaw ?? '')
      ? (axisRaw as MartialAxis)
      : 'chosik';
    const plan: DayPlan = {
      category,
      optionId: axis,
      optionLabel: MARTIAL_AXIS_LABEL[axis],
      staminaDelta: MARTIAL_STAMINA_DELTA,
      stressDelta: MARTIAL_STRESS_DELTA,
      // 초식만 무공 형(숙련도) 진행. 심법=내공, 경공=민첩 → 무공 숙련 X.
      intensity: axis === 'chosik' ? 1.0 : 0,
      lingering: 0,
      expBase: 0,
      artId,
    };
    // 경공 = 민첩 단련. (경지 막대는 applyRealmTick 에서 축별 처리: 초식→무공막대, 심법→내공)
    if (axis === 'gyeonggong') {
      plan.grantStat = 'agility';
      plan.expBase = 8;
    }
    return plan;
  }

  // physical / study / rest — 일일 선택 메모리 > 카테고리 기본.
  const chosenId = useScheduleStore.getState().dailyChoice[d.id]?.[category];
  const opt =
    (chosenId ? findTrainingOption(chosenId) : undefined) ?? defaultOptionFor(category);
  if (!opt || opt.category !== category) {
    // 안전 폴백 — 데이터 누락 시 휴식 취급.
    return {
      category,
      staminaDelta: category === 'rest' ? 15 : -5,
      stressDelta: 0,
      intensity: 0,
      lingering: 0,
      expBase: 0,
    };
  }
  return {
    category,
    optionId: opt.id,
    optionLabel: opt.label,
    staminaDelta: opt.staminaDelta,
    stressDelta: opt.stressDelta,
    intensity: 0,
    lingering: opt.lingering ?? 0,
    grantStat: opt.grantsStat,
    expBase: opt.expBase ?? 0,
  };
}

// ─── 진척 ────────────────────────────────────────────────────────────────────

// 기초 수련(혼자 초식·폐관)의 대성(7성~) 구간 정체 배율 — "온실 수재는 6성까지". docs/26. 🔧
const SOLO_GREAT_MULT = 0.15;

export interface TickResult {
  artId: string;
  delta: number;
  seongBefore: number;
  seong: number; // 적립 후 성
  promoted?: MartialStage; // 명칭 밴드를 넘어섰을 때만 (서신함 변곡점)
}

function tickDiscipleArt(
  d: Disciple,
  instance: MartialArtInstance,
  intensity: number,
  progressMul: number,
): { next: MartialArtInstance; result: TickResult } | null {
  const art = findMartialArt(instance.artId);
  if (!art) return null;

  // 성 상한 = min(별 등급 한계, 현재 경지 한계). 경지가 받쳐줘야 더 깊어진다. docs/26.
  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[d.realm ?? 'samryu']);
  const seongBefore = instance.seong;
  const bandBefore = seongToStage(seongBefore);

  const base = EXP_BASE_BY_STAGE[bandBefore];
  const tMul = learnMultiplier(art, d);
  const pMul = plateauMultiplier(instance.exp, instance.seong);
  // 혼자 수련의 한계 — 대성(7성) 문턱부터는 "더 짜낼 형이 없다". 대련·의뢰(실전)가 주 통로. docs/26·06.
  // (이 함수는 기초 수련·폐관 전용 — 의뢰는 gainMainSeongExp, 대련은 daeryeonSystem 별도 경로라 영향 없음.)
  const soloMul = instance.seong + 1 >= 7 ? SOLO_GREAT_MULT : 1;
  // 하품 비급은 금방 뗀다 — 등급별 학습 속도(디딤돌 가속). docs/26.
  const delta = base * tMul * pMul * intensity * progressMul * soloMul * GRADE_LEARN_MULT[art.grade];

  let seong = instance.seong;
  let exp = instance.exp + delta;

  // 상한 전까지만 성 승급. 넘친 EXP 이월. docs/26.
  while (seong < cap && exp >= expToNextSeong(seong)) {
    exp -= expToNextSeong(seong);
    seong += 1;
  }
  if (seong >= cap) {
    seong = cap;
    exp = 0; // 상한 도달 — EXP 멈춤 ("(최대)")
  }

  // 명칭 밴드를 위로 넘었으면 승급 변곡점.
  const bandAfter = seongToStage(seong);
  const promoted =
    MARTIAL_STAGE_ORDER.indexOf(bandAfter) > MARTIAL_STAGE_ORDER.indexOf(bandBefore)
      ? bandAfter
      : undefined;

  return {
    next: { ...instance, seong, exp },
    result: { artId: instance.artId, delta, seongBefore, seong, promoted },
  };
}

export interface StatGain {
  statId: StatId;
  expDelta: number;
  levelUps: number;
  newLevel: number;
}

export interface DiscipleTickReport {
  discipleId: string;
  category: TrainingCategory;
  optionId?: string;
  optionLabel?: string;
  overrideCommand: DiscipleOverrideCommand | null; // 'default' 는 null 로 통일
  staminaBefore: number;
  staminaAfter: number;
  maxStamina: number;
  stressBefore: number;
  stressAfter: number;
  collapsed: boolean;
  arts: TickResult[];
  statGains: StatGain[];
  // 대련 결과 풍경 — 일지(dailyLog)에 그대로 실린다. 숫자 비노출 신호. docs/06.
  sparNote?: string;
}

// 경지 갱신 + 자동 승급 — 세 기둥 게이트. docs/28 §5.
// 경지 = 내공(심법 누적) + 외공(strength level) + 주력 무공서(등급 천장 + 성 게이트) + 깨달음(벽).
// 가장 약한 기둥이 경지를 잡아끈다(lockstep): 약학만 → 무공서 없어 삼류, 체력만 → 내공·무공 0이라 못 오름.
// 자동 승급: 내공·외공 ≥ 요구 + 무공서 성 ≥ 게이트(초절정5·화경7) + 천장 이내 + 벽 아님. 벽이면 깨달음.
function applyRealmTick(
  discipleId: string,
  plan: DayPlan,
  progressMul: number,
  isSeclusion: boolean,
): void {
  const store = useDiscipleStore.getState();
  const d = store.disciples[discipleId];
  if (!d) return;

  let internal = d.realmProgress?.internal ?? 0;
  let pity = d.realmProgress?.pity ?? 0;
  let petitioned = d.realmProgress?.petitioned ?? false;
  let realm: Realm = d.realm ?? 'samryu';
  const eff = Math.max(0, progressMul);
  const startRealm = realm;

  // 심법 → 내공 누적 (이월·불감소). 그 외 축은 내공에 기여 X.
  if (plan.category === 'martial' && plan.optionId === 'simbeop') {
    internal += REALM_GAIN.internalPerDay * eff;
  }

  // 경지 천장 = 별 잠재 ∧ 주력 무공서 등급. 비급이 받쳐줘야 위로 간다. docs/04 · docs/23.
  // (경지는 내공+깨달음이 민다. 무공 성은 경지를 따라 자랄 뿐, 승급 요구치는 아님 — 정통 무협.)
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const mainGrade = mainId ? findMartialArt(mainId)?.grade : undefined;
  const ceiling = mainGrade ? effectiveRealmCeiling(mainGrade) : realmCeiling();

  // 외공(체력·근골 ≈ strength level) + 주력 무공서 성 — 나머지 두 기둥. docs/28 §5.
  const external = d.stats?.strength?.level ?? 0;
  const mainSeong = mainId ? (d.martialArts.find((a) => a.artId === mainId)?.seong ?? 0) : 0;

  // 자동 승급 — 벽 없는 전이. 세 기둥(내공·외공·무공서 성) 모두 충족 + 천장 이내.
  for (;;) {
    const target = nextRealm(realm);
    if (!target) break;
    if (realmIndex(target) > realmIndex(ceiling)) break; // 천장(무공서 등급) 초과
    if (internal < REALM_INTERNAL_REQ[target]) break; // 내공 부족
    if (external < REALM_EXTERNAL_REQ[target]) break; // 외공 부족
    if (mainSeong < REALM_SEONG_GATE[target]) break; // 무공서 성 게이트(초절정↑)
    if (isWallTransition(target)) break; // 깨달음 벽 — 자동 X
    realm = target;
    pity = 0;
    petitioned = false;
  }

  // 벽 도달 — 세 기둥 다 찼는데 깨달음 게이트.
  // 외공은 "스스로 단련한 받침"(externalSupportReq)으로 판정 — 화경(70)만 마지막 8을
  // 환골탈태(영약 복용 시 외공 +8)가 채우므로 받침 62로 벽에 설 수 있다. docs/23 §5.
  const wallTarget = nextRealm(realm);
  const atWall =
    wallTarget != null &&
    realmIndex(wallTarget) <= realmIndex(ceiling) &&
    internal >= wallInternalReq(wallTarget) && // 화경은 초절정 내공이면 벽에 선다(나머진 환골탈태)
    external >= externalSupportReq(wallTarget) &&
    mainSeong >= REALM_SEONG_GATE[wallTarget] &&
    isWallTransition(wallTarget);

  let forcedFail = false;
  if (atWall && wallTarget) {
    if (isSeclusion) {
      // 폐관엔 **벽곡단**(곡기 끊는 단약)이 필수 — 2개/일. 없으면 그날 폐관 수행 불가(깨달음 굴림 X).
      if (!consumeByeokgokdan(BYEOKGOKDAN_PER_DAY)) {
        // 벽곡단 부족 — 폐관을 버티지 못해 그날 진척 없음(다음에 벽곡단 갖춰 재도전).
      } else if (wallTarget === 'hwagyeong') {
        // 화경 벽 — 신품 영약으로 환골탈태(boneRebirthSystem). 심마 굴림 성공 시에만 영약 소모 + 돌파.
        // 실패(주화입마)면 영약 보존 — 심마 다스린 뒤 재도전. docs/23 §5 · docs/28 §5-1.
        if (!hasDivineElixir()) {
          // 영약 없는 폐관(헛폐관) — 청원 자격 회복. 영약이 생기면 다시 청원하게 한다.
          // (없으면 "벽당 1회 청원" 룰 때문에 영약을 늦게 구한 회차가 영영 화경 기회를 잃는다.)
          petitioned = false;
        } else if (random() >= greatEnlightenmentChance(d.insight, 'seclude')) {
          // 대오(大悟)가 오지 않았다 — 마음이 열리기 전엔 약도 몸도 소용없다. 보장 없음(운×실력).
          // 폐관은 매일 굴리되 확률이 아주 낮다 — 화경 돈오는 실전(위험·극험 의뢰)에서 잘 온다.
          recordDaeoh('seclude', false);
        } else if (attemptBoneRebirth(discipleId)) {
          // 여기 도달 = 폐관 안에서 화경 대오가 터진 희귀 순간 — 업적 "면벽돈오"(docs/32) 발화 지점.
          recordDaeoh('seclude', true);
          consumeDivineElixir();
          internal = Math.max(internal, REALM_INTERNAL_REQ.hwagyeong); // 환골탈태 — 임독양맥 타통, 내공 도약(화경 내공)
          realm = wallTarget;
          pity = 0;
          petitioned = false;
          cancelOverride(discipleId);
        } else {
          // 주화입마 — 발작(내상)으로 폐관이 깨졌다. 영약은 토해내 보존, 회복 후 재청원 가능.
          recordDaeoh('seclude', true); // 대오는 왔으나 환골탈태(심마) 실패
          petitioned = false;
          cancelOverride(discipleId);
        }
      } else {
        // 절정·초절정 벽 → 깨달음 굴림 (오성 + pity, 보장치 도달 시 성공). 폐관은 확률 낮고 느리다.
        const insight = d.insight;
        const chance = enlightenmentChance(insight, wallTarget) + pity * ENLIGHTENMENT_PITY_STEP;
        const guaranteed = pity + 1 >= ENLIGHTENMENT_PITY_GUARANTEE;
        if (guaranteed || random() < chance) {
          realm = wallTarget; // 돌파!
          pity = 0;
          petitioned = false;
          cancelOverride(discipleId); // 폐관 해제 — 벽 넘음
          playCutscene('enlightenment', { id: discipleId, name: d.name }); // 깨달음 컷씬 — docs/20
        } else {
          pity += 1;
          forcedFail = true; // 무리한 강행 실패 → 진기 흩어짐(심마·주화입마 위험)
        }
      }
    } else if (!petitioned && (wallTarget !== 'hwagyeong' || hasDivineElixir())) {
      // 벽인데 폐관 안 함 → 제자가 폐관 청원 (once per 벽).
      // 화경 벽만 예외: 신품 영약이 사문에 있어야 청원 — 영약 없는 폐관(헛폐관) 낭비 방지.
      // 벽 도달 자체는 제자 상세의 "벽에 닿음"으로 노출(docs/23 §10), 영약이 생기는 순간 청원이 온다.
      seclusionPetitionToInbox(d, wallTarget);
      petitioned = true;
    }
  }

  store.update(discipleId, {
    realm,
    realmProgress: {
      // 내공은 실수로 누적 — 매일 round 하면 소수부(2.5→3)가 매번 올림돼 누적 총량이 설계치를
      // 초과한다(eff=1.0 심법 1일 +2.5 → +3, +20% 누수). alchemySystem.tickElixirAbsorb 와 동일 결.
      // 표시는 DiscipleStatusPanel 이 round. docs/23·28 정통 내공 페이싱.
      internal,
      pity,
      petitioned,
    },
  });

  if (realm !== startRealm) realmUpToInbox(d, realm);

  // 무리한 폐관 돌파 실패 — 진기 강행의 대가(심마 급증 + 주화입마 즉석 굴림). 최종 store.update 뒤에 적용
  // (발작이 내공·상태를 다시 쓰므로 순서 중요). docs/13·26.
  if (forcedFail) onForcedBreakthroughFail(discipleId);
}

// ─── 벽곡단(폐관 소모재) ─────────────────────────────────────────────────────
// 폐관 1일당 벽곡단 소모(2개). 현질·제작·상점(게임머니)으로 확보. 없으면 폐관 못 버틴다.
// 기본 Infinity(실 게임 — 아이템 연동 전). 시뮬은 setByeokgokdanBudget 으로 과금 등급 모델링.
export const BYEOKGOKDAN_PER_DAY = 2;
let byeokgokdanBudget = Infinity;
let byeokgokdanUsed = 0;
export function setByeokgokdanBudget(n: number): void {
  byeokgokdanBudget = n;
  byeokgokdanUsed = 0;
}
function consumeByeokgokdan(n: number): boolean {
  // 실제 크래프트한 벽곡단 아이템 우선 소모.
  if (elixirItemCount('byeokgokdan') >= n) {
    consumeElixirItem('byeokgokdan', n);
    return true;
  }
  // 없으면 시뮬/과금 예산(budget) 폴백.
  if (byeokgokdanUsed + n > byeokgokdanBudget) return false;
  byeokgokdanUsed += n;
  return true;
}

// ─── 의뢰(실전) 깨달음 — 폐관보다 높은 확률로 벽 돌파 ───────────────────────────
// 결투·큰의뢰 성공 후 호출. 세 기둥(내공·외공·성)을 채웠고 벽(절정/초절정/화경) 앞이면,
// 실전 깨달음을 굴린다. 폐관 대비 chanceBonus 만큼 높다(실전이 더 잘 뚫림 — docs/28 §5).
// 화경 벽은 신품 영약 필수(보유 시 소모). 성공 시 경지 상승. 반환: 돌파한 경지 or null.
export function attemptQuestEnlightenment(discipleId: string, chanceBonus: number): Realm | null {
  const store = useDiscipleStore.getState();
  const d = store.disciples[discipleId];
  if (!d) return null;
  const realm = d.realm ?? 'samryu';
  const wallTarget = nextRealm(realm);
  if (!wallTarget || !isWallTransition(wallTarget)) return null;

  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const mainGrade = mainId ? findMartialArt(mainId)?.grade : undefined;
  const ceiling = mainGrade ? effectiveRealmCeiling(mainGrade) : realmCeiling();
  if (realmIndex(wallTarget) > realmIndex(ceiling)) return null;

  const internal = d.realmProgress?.internal ?? 0;
  const external = d.stats?.strength?.level ?? 0;
  const mainSeong = mainId ? (d.martialArts.find((a) => a.artId === mainId)?.seong ?? 0) : 0;
  if (
    internal < wallInternalReq(wallTarget) || // 화경은 초절정 내공이면 벽에 선다(나머진 환골탈태)
    external < externalSupportReq(wallTarget) || // 화경은 받침 62 — 나머지 8은 환골탈태가 채움
    mainSeong < REALM_SEONG_GATE[wallTarget]
  ) {
    return null; // 세 기둥 미충족 — 아직 벽 앞이 아님
  }

  const pity = d.realmProgress?.pity ?? 0;
  if (wallTarget === 'hwagyeong') {
    if (!hasDivineElixir()) return null; // 화경은 신품 영약 필수
    // 대오(大悟) — 실전에서 크게 깨닫는다(폐관보다 잘 옴). 보장 없음 — 운×실력. docs/23 §6.
    // chanceBonus(+0.3, 절정·초절정용 실전 보정)는 적용 X — 대오에 더하면 사실상 보장이 된다.
    // "실전이 더 잘 됨"은 greatEnlightenmentChance 의 quest 모드 자체에 이미 들어 있다.
    const daeohCame = random() < greatEnlightenmentChance(d.insight, 'quest');
    recordDaeoh('quest', daeohCame);
    if (!daeohCame) return null;
    if (!attemptBoneRebirth(discipleId)) return null; // 주화입마 — 영약 보존, 회복 후 재도전
    consumeDivineElixir();
    const boosted = Math.max(internal, REALM_INTERNAL_REQ.hwagyeong); // 환골탈태 — 임독양맥 타통, 내공 도약
    store.update(discipleId, { realm: wallTarget, realmProgress: { internal: boosted, pity: 0, petitioned: false } });
    realmUpToInbox(d, wallTarget);
    return wallTarget;
  }
  const chance = enlightenmentChance(d.insight, wallTarget) + pity * ENLIGHTENMENT_PITY_STEP + chanceBonus;
  const guaranteed = pity + 1 >= ENLIGHTENMENT_PITY_GUARANTEE;
  if (guaranteed || random() < chance) {
    store.update(discipleId, { realm: wallTarget, realmProgress: { internal, pity: 0, petitioned: false } });
    realmUpToInbox(d, wallTarget);
    playCutscene('enlightenment', { id: discipleId, name: d.name }); // 실전 깨달음 컷씬 — docs/20
    return wallTarget;
  }
  store.update(discipleId, {
    realmProgress: { internal, pity: pity + 1, petitioned: d.realmProgress?.petitioned ?? false },
  });
  addSimma(discipleId, 6); // 실전 돌파 실패 — 폐관 강행보단 약하나 마음에 응어리(심마). 즉석 발작은 일일 tick에 맡김
  return null;
}

// 부상 중 휴식 시 하루 체력 회복량(수련 진척은 없음). docs/37 R1.
const INJURED_REST_STAMINA = 12;

export function tickDailyTraining(): DiscipleTickReport[] {
  const store = useDiscipleStore.getState();
  const day = useTimeStore.getState().current.day; // 1~7
  const reports: DiscipleTickReport[] = [];
  const sparRequests: SparRequest[] = [];

  for (const id of store.order) {
    const d = store.disciples[id];
    if (!d) continue;
    // 졸업·하산·파견(의뢰)·연단 제자는 사문 일과(수련)에 포함되지 않는다.
    if (
      d.status === 'graduated' ||
      d.status === 'departed' ||
      d.status === 'questing' ||
      d.status === 'crafting'
    )
      continue;

    // 부상(injured) 중엔 수련 대신 회복에 전념 — 진척 없이 쉬며 체력만 회복(상처 회복 자체는
    // woundSystem.tickWoundRecovery / 탈진은 override 만료). 다쳐도 평소처럼 수련하던 구멍 차단(R1). docs/37.
    if (d.status === 'injured') {
      store.adjustStamina(id, INJURED_REST_STAMINA);
      continue;
    }

    const plan = resolveDayPlan(d, day);

    const ov = activeOverrideOf(id);
    const overrideCommand: DiscipleOverrideCommand | null =
      ov && ov.command !== 'default' ? ov.command : null;

    const staminaBefore = d.stamina;
    const maxStamina = d.maxStamina ?? BASE_MAX_STAMINA;
    const stressBefore = d.stress ?? 0;
    const incomingPenalty = d.fatiguePenalty ?? 0;

    // 효율 = 체력 비율(소모 전 기준) × 어제 잔여 피로.
    // 스트레스 → 훈련 효율 ↓ (멘탈. 100이면 −40%). 휴식으로 해소되면 회복.
    const stressFactor = 1 - Math.min(0.4, (stressBefore / 100) * 0.4);
    const progressMul =
      staminaRatioMultiplier(staminaBefore, maxStamina) * (1 - incomingPenalty) * stressFactor;

    // 1) 체력·스트레스 변동.
    store.adjustStamina(id, Math.round(plan.staminaDelta));
    if (plan.stressDelta !== 0) store.adjustStress(id, plan.stressDelta);

    const updated = store.disciples[id];
    const staminaAfter = updated?.stamina ?? 0;
    const stressAfter = updated?.stress ?? 0;

    // 2) 강제 휴식 — 현재 체력 0.
    if (updated && updated.stamina <= 0 && updated.status !== 'injured') {
      triggerCollapse(id);
      store.setFatiguePenalty(id, 0);
      reports.push({
        discipleId: id,
        category: plan.category,
        optionId: plan.optionId,
        optionLabel: plan.optionLabel,
        overrideCommand,
        staminaBefore,
        staminaAfter,
        maxStamina,
        stressBefore,
        stressAfter,
        collapsed: true,
        arts: [],
        statGains: [],
      });
      continue;
    }

    // 3) 단련 스탯 EXP (체력·공부 종목).
    const statGains: StatGain[] = [];
    if (plan.grantStat && plan.expBase > 0 && progressMul > 0) {
      const aptMul = aptitudeMultiplier(d, plan.grantStat);
      const expDelta = Math.max(1, Math.round(plan.expBase * aptMul * progressMul));
      const levelUps = store.addStatExp(id, plan.grantStat, expDelta);
      const track = store.disciples[id]?.stats?.[plan.grantStat];
      statGains.push({
        statId: plan.grantStat,
        expDelta,
        levelUps,
        newLevel: track?.level ?? 0,
      });
    }

    // 4) 무공 진척 — 선택한 1개 무공만 (무공 카테고리 / 폐관).
    const arts: TickResult[] = [];
    if (plan.artId && plan.intensity > 0 && progressMul > 0) {
      const inst = d.martialArts.find((a) => a.artId === plan.artId);
      if (inst) {
        const r = tickDiscipleArt(d, inst, plan.intensity, progressMul);
        if (r) {
          const nextArts = d.martialArts.map((a) =>
            a.artId === plan.artId ? r.next : a,
          );
          // 수련 낙수 — 닦은 무공의 직계 선행도 함께 무르익는다(클릭 0 키트 빌딩). docs/26 §낙수.
          store.update(id, {
            martialArts: applyPrereqTrickle(nextArts, plan.artId, r.result.delta, d.realm),
          });
          arts.push(r.result);
        }
      }
    }

    // 5) 경지 막대 — 초식→무공막대, 심법→내공, 외도→감소 + 자동승급(벽 없는 구간) + 폐관 깨달음.
    applyRealmTick(id, plan, progressMul, overrideCommand === 'seclusion');

    // 6) 내일 잔여 피로 — 오늘 종목 lingering 으로 교체 (어제치는 소멸).
    store.setFatiguePenalty(id, plan.lingering);

    reports.push({
      discipleId: id,
      category: plan.category,
      optionId: plan.optionId,
      optionLabel: plan.optionLabel,
      overrideCommand,
      staminaBefore,
      staminaAfter,
      maxStamina,
      stressBefore,
      stressAfter,
      collapsed: false,
      arts,
      statGains,
    });

    if (plan.sparPartnerId) sparRequests.push({ id, partnerId: plan.sparPartnerId });
  }

  // ── 대련 짝 해소 — 개별 일과 처리 후, 유효한 짝만 한 판씩. docs/06·26.
  // 상대 조건: 그날 무공일 + 가용(training) + 쓰러지지 않음. 무산되면 풍경 한 줄로 알린다.
  resolveSparRequests(sparRequests, reports, day);

  return reports;
}

interface SparRequest {
  id: string;
  partnerId: string;
}

function resolveSparRequests(
  requests: SparRequest[],
  reports: DiscipleTickReport[],
  day: number,
): void {
  if (requests.length === 0) return;
  const store = useDiscipleStore.getState();
  const reportOf = (id: string) => reports.find((r) => r.discipleId === id);
  const sparred = new Set<string>();

  for (const req of requests) {
    if (sparred.has(req.id) || sparred.has(req.partnerId)) continue;
    const me = store.disciples[req.id];
    const partner = store.disciples[req.partnerId];
    const myReport = reportOf(req.id);
    if (!me || !myReport || myReport.collapsed) continue;

    // 상대 가용성 — 무공일 + training + 미붕괴. 아니면 무산(혼자 형 연습으로 보냄).
    const partnerReport = reportOf(req.partnerId);
    const partnerAvailable =
      partner != null &&
      partner.status === 'training' &&
      partnerReport != null &&
      !partnerReport.collapsed &&
      partnerReport.category === 'martial' &&
      partnerReport.overrideCommand == null;
    if (!partnerAvailable) {
      myReport.sparNote = `${me.name}이(가) 대련 상대를 기다렸으나 ${partner?.name ?? '상대'}이(가) 응할 형편이 아니었다 — 홀로 형을 다듬었다.`;
      continue;
    }

    const outcome = resolveDaeryeon(req.id, req.partnerId);
    if (!outcome) continue;
    sparred.add(req.id);
    sparred.add(req.partnerId);

    // 결과 풍경 + 성 변화를 양쪽 결산에 싣는다.
    myReport.sparNote = outcome.note;
    if (partnerReport) partnerReport.sparNote = outcome.note;
    for (const [pid, g] of Object.entries(outcome.artDelta)) {
      const rep = reportOf(pid);
      if (rep) {
        rep.arts.push({
          artId: g.artId,
          delta: g.delta,
          seongBefore: g.seongBefore,
          seong: g.seong,
          promoted: undefined,
        });
      }
    }
  }
  void day;
}
