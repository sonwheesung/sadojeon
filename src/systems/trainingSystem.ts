// 훈련 엔진 v2 — docs/06_훈련_일정.md "훈련 3층 구조".
// 매일 [진행] 시 졸업·하산 제외 전원에 대해:
// 1. 그날 계획 해소: 3층 임시명령 > 카테고리(개인/사문 주간패턴) → 세부 종목(일일 선택)
// 2. 현재 체력·스트레스 변동
// 3. 진척 배수 = 체력비율 효율 × 익일 잔여피로(fatiguePenalty)
// 4. 무공(카테고리=무공/폐관): 선택한 1개 무공만 단계 진행
// 5. 체력·공부 종목: 적성 배율 × 효율 만큼 단련 스탯 EXP 적립 (Lv/EXP)
// 6. 현재 체력 0 도달 시 강제 휴식 (triggerCollapse)
// 7. 종목 lingering 을 내일 fatiguePenalty 로 적재

import {
  findMartialArt,
  EXP_BASE_BY_STAGE,
  expToNextSeong,
  seongCap,
  seongToStage,
} from '@/data/martialArts';
import { PLATEAU } from '@/data/constants';
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
  Talents,
  TrainingCategory,
} from '@/types';
import { MARTIAL_STAGE_ORDER } from '@/types/martialArt';
// (MARTIAL_STAGE_ORDER 는 밴드 승급 방향 비교에 사용)
import {
  MARTIAL_AXES,
  MARTIAL_AXIS_LABEL,
  STAT_APTITUDE,
  type MartialAxis,
} from '@/types/training';
import type { Realm } from '@/types/realm';
import {
  ENLIGHTENMENT_PITY_GUARANTEE,
  ENLIGHTENMENT_PITY_STEP,
  REALM_GAIN,
  REALM_INTERNAL_REQ,
  REALM_SEONG_CAP,
  effectiveRealmCeiling,
  enlightenmentChance,
  isWallTransition,
  nextRealm,
  realmCeiling,
  realmIndex,
} from '@/data/realm';
import { realmUpToInbox, seclusionPetitionToInbox } from './eventInbox';
import { activeOverrideOf, cancelOverride } from './overrideSystem';
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

function talentMultiplier(art: MartialArt, talents: Talents): number {
  if (art.preferredTalents.length === 0) return 1.0;
  const sum = art.preferredTalents.reduce((acc, axis) => acc + talents[axis], 0);
  const avg = sum / art.preferredTalents.length;
  return Math.max(0.5, avg / 3);
}

// 단련 스탯 적성 배율 — "진법 특화 제자는 같은 공부로 EXP 더". talents 축 기준.
function aptitudeMultiplier(talents: Talents, statId: StatId): number {
  const axis = STAT_APTITUDE[statId];
  return Math.max(0.5, talents[axis] / 3);
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
    // 주력 무공은 그대로 진행하고, 무공 축(심법/경공/초식)은 일일 선택으로 기록.
    const artId = selectedArtId(d);
    const axisRaw = useScheduleStore.getState().dailyChoice[d.id]?.martial;
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
  const tMul = talentMultiplier(art, d.talents);
  const pMul = plateauMultiplier(instance.exp, instance.seong);
  const delta = base * tMul * pMul * intensity * progressMul;

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
}

// 경지 갱신 + 자동 승급. docs/23 · docs/26 · project_realm_seong_design.
// 경지 = 내공(심법 누적) + 주력 무공 성(숙련) + 깨달음(벽). 별도 "무공 막대" 없음.
// 심법 → 내공 누적. 초식/경공은 여기서 막대 기여 X (초식은 tickDiscipleArt 에서 성 EXP 로 처리).
// 자동 승급: 내공 ≥ 요구 + 주력무공 성 ≥ 현 경지 상한 + 천장 이내 + 벽 아님. 벽이면 깨달음 게이트.
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
  const star = d.starRank ?? 1;
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
  const ceiling = mainGrade ? effectiveRealmCeiling(star, mainGrade) : realmCeiling(star);

  // 자동 승급 — 벽 없는 전이. 내공 ≥ 요구 + 천장 이내.
  for (;;) {
    const target = nextRealm(realm);
    if (!target) break;
    if (realmIndex(target) > realmIndex(ceiling)) break; // 천장 초과
    if (internal < REALM_INTERNAL_REQ[target]) break; // 내공 부족
    if (isWallTransition(star, target)) break; // 깨달음 벽 — 자동 X
    realm = target;
    pity = 0;
    petitioned = false;
  }

  // 벽 도달 — 내공 찼는데 깨달음 게이트.
  const wallTarget = nextRealm(realm);
  const atWall =
    wallTarget != null &&
    realmIndex(wallTarget) <= realmIndex(ceiling) &&
    internal >= REALM_INTERNAL_REQ[wallTarget] &&
    isWallTransition(star, wallTarget);

  if (atWall && wallTarget) {
    if (isSeclusion) {
      // 폐관 중 → 깨달음 굴림 (오성 + pity, 보장치 도달 시 성공).
      const insight = d.talents.insight ?? 1;
      const chance = enlightenmentChance(insight, wallTarget) + pity * ENLIGHTENMENT_PITY_STEP;
      const guaranteed = pity + 1 >= ENLIGHTENMENT_PITY_GUARANTEE;
      if (guaranteed || Math.random() < chance) {
        realm = wallTarget; // 돌파!
        pity = 0;
        petitioned = false;
        cancelOverride(discipleId); // 폐관 해제 — 벽 넘음
      } else {
        pity += 1;
      }
    } else if (!petitioned) {
      // 벽인데 폐관 안 함 → 제자가 폐관 청원 (once per 벽).
      seclusionPetitionToInbox(d, wallTarget);
      petitioned = true;
    }
  }

  store.update(discipleId, {
    realm,
    realmProgress: {
      internal: Math.round(internal),
      pity,
      petitioned,
    },
  });

  if (realm !== startRealm) realmUpToInbox(d, realm);
}

export function tickDailyTraining(): DiscipleTickReport[] {
  const store = useDiscipleStore.getState();
  const day = useTimeStore.getState().current.day; // 1~7
  const reports: DiscipleTickReport[] = [];

  for (const id of store.order) {
    const d = store.disciples[id];
    if (!d) continue;
    // 졸업·하산 제자는 더 이상 사문 일정에 포함되지 않는다.
    if (d.status === 'graduated' || d.status === 'departed') continue;

    const plan = resolveDayPlan(d, day);

    const ov = activeOverrideOf(id);
    const overrideCommand: DiscipleOverrideCommand | null =
      ov && ov.command !== 'default' ? ov.command : null;

    const staminaBefore = d.stamina;
    const maxStamina = d.maxStamina ?? BASE_MAX_STAMINA;
    const stressBefore = d.stress ?? 0;
    const incomingPenalty = d.fatiguePenalty ?? 0;

    // 효율 = 체력 비율(소모 전 기준) × 어제 잔여 피로.
    const progressMul =
      staminaRatioMultiplier(staminaBefore, maxStamina) * (1 - incomingPenalty);

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
      const aptMul = aptitudeMultiplier(d.talents, plan.grantStat);
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
          store.update(id, { martialArts: nextArts });
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
  }

  return reports;
}
