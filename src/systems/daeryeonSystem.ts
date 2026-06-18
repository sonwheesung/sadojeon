// 대련(對練) — 사부가 짝을 지어주는 훈련 종목. docs/06·26 §실전·33(관계 채널).
// 정통 결: 기초는 형(形)을 만들고, 실전(대련·의뢰)은 형을 깨서 내 것으로 만든다.
//   · 입문(1~3성): 대련은 거의 무익 — 형도 없이 맞붙으면 얻어맞기만 한다(배율↓·부상↑).
//   · 소성(4~6성): 대련의 황금기 — 혼자 수련보다 빠르다.
//   · 대성(7성~): 혼자 수련은 정체(trainingSystem SOLO_GREAT_MULT) — 대련·의뢰가 주 통로.
// 결과 4단계(박빙/우세/압도/사고)가 보상을 정한다 — 배움은 박빙에서 나오고, 압도전에선 아무도 못 배운다.
// 숫자는 비노출 — 결과 풍경(일지 텍스트)으로만 인지(숨은 변수 룰).

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import {
  findMartialArt,
  seongCap,
  expToNextSeong,
  EXP_BASE_BY_STAGE,
  GRADE_LEARN_MULT,
  seongToStage,
} from '@/data/martialArts';
import { REALM_SEONG_CAP } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple } from '@/types';
import { REL_UP, REL_DOWN } from '@/data/relationTransitions';
import type { CombatTier } from '@/types/combat';
import { combatantFromDisciple, simulateCombat } from './combat';
import { inflictWound } from './woundSystem';
import { applyPrereqTrickle } from './martialExp';
import { shiftPersona } from './personaShift';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ─── 일일 선택 값 — 'daeryeon:<상대id>' (dailyChoice.martial 슬롯 재사용) ─────────
export const DAERYEON_PREFIX = 'daeryeon:';
export function daeryeonChoiceValue(partnerId: string): string {
  return `${DAERYEON_PREFIX}${partnerId}`;
}
export function parseDaeryeonChoice(value: string | undefined): string | null {
  if (!value || !value.startsWith(DAERYEON_PREFIX)) return null;
  const pid = value.slice(DAERYEON_PREFIX.length);
  return pid.length > 0 ? pid : null;
}

// ─── 결과 4단계 — 전투 엔진(combat)이 한 판을 굴려 구간·승패를 정한다. docs/35.
// 구간은 사전 실력차가 아니라 *실제 싸움의 내용*(잔존 전력차 margin)에서 나온다.
export type DaeryeonTier = CombatTier; // 박빙(close) / 우세(edge) / 압도(crush)

// 성 EXP 배율 — (승자, 패자). 배움은 박빙에서, 우세전은 패자에게.
const TIER_EXP: Record<DaeryeonTier, { winner: number; loser: number }> = {
  close: { winner: 1.5, loser: 1.5 },
  edge: { winner: 0.4, loser: 1.2 },
  crush: { winner: 0, loser: 0.1 },
};

// 입문(다음 성 ≤ 4) 대련 비효율 — 형이 없으면 못 배운다.
const NOVICE_SPAR_MULT = 0.3;
// 깨달음 불씨 — 박빙 한정, 낮은 확률로 한쪽이 큰 진전.
const SPARK_CHANCE = 0.05;
const SPARK_EXP_MULT = 3;

// 부상(사고) 확률 가산 🔧 — 기본율·현격차 몫은 엔진(combat/engine ACCIDENT_*)이 굴리고,
// 여기선 *사람 사이의 사정*(감정·기질·살기)만 얹어서 넘긴다 — 엔진은 관계를 모른다.
const INJURY_ENEMY = 0.1; //   적대 관계 — 감정이 실린 손속
const INJURY_IMPULSIVE = 0.03; // 충동 인격(신중<35) 한쪽이라도
const INJURY_DARK_ART = 0.03; // 마공 수련자 — 살기


export interface DaeryeonOutcome {
  tier: DaeryeonTier;
  injured: boolean;
  // 일지에 실을 한 줄 풍경 — 양쪽 공용.
  note: string;
  // 성 변화 (결산 표시용) — id → {artId, seongBefore, seongAfter, delta}
  artDelta: Record<string, { artId: string; seongBefore: number; seong: number; delta: number }>;
}

function hasDarkArt(d: Disciple): boolean {
  return d.martialArts.some((a) => findMartialArt(a.artId)?.path === 'ma');
}

// 주력 무공에 실전(대련) EXP 적립 — questSystem.gainMainSeongExp 와 같은 규칙(상한 = 등급∧경지).
// 입문 구간(다음 성 ≤ 4)은 NOVICE_SPAR_MULT 로 깎인다. 반환: 적립 결과(표시용).
function gainSparSeongExp(
  d: Disciple,
  tierMult: number,
): { artId: string; seongBefore: number; seong: number; delta: number } | null {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  if (!mainId || tierMult <= 0) return null;
  const art = findMartialArt(mainId);
  const inst = d.martialArts.find((a) => a.artId === mainId);
  if (!art || !inst) return null;

  const noviceMult = inst.seong + 1 <= 4 ? NOVICE_SPAR_MULT : 1;
  const base = EXP_BASE_BY_STAGE[seongToStage(inst.seong)];
  // 대련 1회 = 기초 수련 하루치 기준 × 결과 배율 × 등급 학습 속도(하품은 금방 뗀다, docs/26).
  // (정체기 보정 없음 — 맞상대가 정체를 깬다.)
  const exp = Math.max(0, Math.round(base * tierMult * noviceMult * GRADE_LEARN_MULT[art.grade]));
  if (exp <= 0) return null;

  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[d.realm ?? 'samryu']);
  const seongBefore = inst.seong;
  let seong = inst.seong;
  let e = inst.exp + exp;
  while (seong < cap && e >= expToNextSeong(seong)) {
    e -= expToNextSeong(seong);
    seong += 1;
  }
  if (seong >= cap) {
    seong = cap;
    e = 0;
  }
  const martialArts = d.martialArts.map((a) =>
    a.artId === mainId ? { ...a, seong, exp: e } : a,
  );
  // 수련 낙수 — 대련에서 주력을 쓰면 그 뿌리도 단련된다. docs/26 §낙수.
  useDiscipleStore.getState().update(d.id, {
    martialArts: applyPrereqTrickle(martialArts, mainId, exp, d.realm ?? 'samryu'),
  });
  return { artId: mainId, seongBefore, seong, delta: exp };
}

// 대련 한 판 해소 — 호출 전제: 둘 다 그날 무공일·가용(training). trainingSystem 이 짝을 검증해 호출.
export function resolveDaeryeon(aId: string, bId: string): DaeryeonOutcome | null {
  const ds = useDiscipleStore.getState();
  const a = ds.disciples[aId];
  const b = ds.disciples[bId];
  if (!a || !b) return null;

  // 한 판 굴림 — 전투 엔진(대련 모드). 사람 사이의 사정(감정·기질·살기)은 사고 가산으로 넘긴다.
  const enemyPair = a.relationships[b.id] === 'enemy' || b.relationships[a.id] === 'enemy';
  const impulsive = a.personality.prudence < 35 || b.personality.prudence < 35;
  const extraAccidentChance =
    (enemyPair ? INJURY_ENEMY : 0) +
    (impulsive ? INJURY_IMPULSIVE : 0) +
    (hasDarkArt(a) || hasDarkArt(b) ? INJURY_DARK_ART : 0);

  const result = simulateCombat(
    [combatantFromDisciple(a)],
    [combatantFromDisciple(b)],
    { mode: 'spar', extraAccidentChance },
  );

  const tier: DaeryeonTier = result.tier;
  // 무승부면 박빙 — 승자는 서사용으로만 갈라둔다.
  const winner =
    result.winner === 'A' ? a : result.winner === 'B' ? b : random() < 0.5 ? a : b;
  const loser = winner.id === a.id ? b : a;
  const injured = result.accident != null;

  const artDelta: DaeryeonOutcome['artDelta'] = {};

  if (injured && result.accident) {
    // 사고 — 엔진이 지목한 피해자가 다친다(경상). 때린 쪽은 죄책감. 배움 없이 끝.
    const victim = result.accident.victimId === a.id ? a : b;
    const striker = victim.id === a.id ? b : a;
    const suggested = result.combatants.find((c) => c.id === victim.id)?.wound;
    inflictWound(victim.id, suggested?.type ?? 'wound', suggested?.severity ?? 4, suggested?.days ?? 10);
    ds.update(striker.id, { stress: clamp((striker.stress ?? 0) + 6) });
    // 관계 — 보통은 틀어진다. 적대 페어만 낮은 확률로 "치고받고 인정"(화해 불씨).
    const vRel = victim.relationships[striker.id] ?? 'neutral';
    const sRel = striker.relationships[victim.id] ?? 'neutral';
    if (enemyPair && random() < 0.12) {
      ds.setRelation(victim.id, striker.id, REL_UP[vRel]);
      ds.setRelation(striker.id, victim.id, REL_UP[sRel]);
      return {
        tier,
        injured,
        note: `${josa(victim.name, '이', '가')} ${striker.name}의 손속에 다쳤다 — 그런데 일으켜 세우는 손을 뿌리치지 않았다.`,
        artDelta,
      };
    }
    if (random() < 0.3) {
      ds.setRelation(victim.id, striker.id, REL_DOWN[vRel]);
    }
    return {
      tier,
      injured,
      note: `대련이 과열됐다. ${striker.name}의 손속이 지나쳐 ${josa(victim.name, '이', '가')} 다쳤다.`,
      artDelta,
    };
  }

  // 성장 — 결과 구간별 배율 (배움은 패자에).
  const wGain = gainSparSeongExp(winner, TIER_EXP[tier].winner);
  const lGain = gainSparSeongExp(loser, TIER_EXP[tier].loser);
  if (wGain) artDelta[winner.id] = wGain;
  if (lGain) artDelta[loser.id] = lGain;

  // 깨달음 불씨 — 박빙 한정. 한쪽이 상대의 검에서 답을 본다.
  let spark: Disciple | null = null;
  if (tier === 'close' && random() < SPARK_CHANCE) {
    spark = random() < 0.5 ? a : b;
    // 신선한 상태 재읽기 — winner/loser EXP 가 이미 적용된 뒤라 stale ds 스냅샷을 쓰면 그 적립을 덮어쓴다.
    const fresh = useDiscipleStore.getState().disciples[spark.id] ?? spark;
    const extra = gainSparSeongExp(fresh, SPARK_EXP_MULT);
    if (extra) artDelta[spark.id] = extra;
  }

  // 관계·기질 — 구간별.
  const wRel = winner.relationships[loser.id] ?? 'neutral';
  const lRel = loser.relationships[winner.id] ?? 'neutral';
  if (tier === 'close') {
    if (random() < 0.3) {
      ds.setRelation(winner.id, loser.id, REL_UP[wRel]);
      ds.setRelation(loser.id, winner.id, REL_UP[lRel]);
    }
  } else if (tier === 'edge') {
    if (random() < 0.15) {
      ds.setRelation(loser.id, winner.id, REL_UP[lRel]); // 한 수 위를 향한 존경
    }
    ds.update(winner.id, { personality: shiftPersona(winner, { warmth: 1 }) }); // 가르친 보람
  } else {
    // 압도 — 약자는 기죽는다. 무뚝뚝·야심가는 앙금.
    ds.update(loser.id, { stress: clamp((loser.stress ?? 0) + 6) });
    const resentful = loser.personality.warmth < 40 || loser.personality.ambition > 65;
    if (resentful && random() < 0.2) {
      ds.setRelation(loser.id, winner.id, REL_DOWN[lRel]);
    }
  }

  // 결과 풍경 — 숫자 없이 구간을 읽게 한다.
  const note =
    spark != null
      ? `${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 손을 맞췄다 — 합이 무르익던 중, ${josa(spark.name, '이', '가')} 상대의 초식에서 제 무공의 답을 보았다.`
      : tier === 'close'
        ? `${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 팽팽하게 손을 맞췄다. 서로의 빈틈을 짚어주며 둘 다 적잖이 얻었다.`
        : tier === 'edge'
          ? `${josa(winner.name, '이', '가')} 반 수 위였다. ${josa(loser.name, '은', '는')} 받아내며 더 많이 배웠다.`
          : `${winner.name}의 무위가 한참 위라 ${josa(loser.name, '은', '는')} 손도 제대로 못 섞었다 — 이 짝으로는 서로 얻을 게 없다.`;

  return { tier, injured, note, artDelta };
}
