// 대련(對練) — 사부가 짝을 지어주는 훈련 종목. docs/06·26 §실전·33(관계 채널).
// 정통 결: 기초는 형(形)을 만들고, 실전(대련·의뢰)은 형을 깨서 내 것으로 만든다.
//   · 입문(1~3성): 대련은 거의 무익 — 형도 없이 맞붙으면 얻어맞기만 한다(배율↓·부상↑).
//   · 소성(4~6성): 대련의 황금기 — 혼자 수련보다 빠르다.
//   · 대성(7성~): 혼자 수련은 정체(trainingSystem SOLO_GREAT_MULT) — 대련·의뢰가 주 통로.
// 결과 4단계(박빙/우세/압도/사고)가 보상을 정한다 — 배움은 박빙에서 나오고, 압도전에선 아무도 못 배운다.
// 숫자는 비노출 — 결과 풍경(일지 텍스트)으로만 인지(숨은 변수 룰).

import { findMartialArt, seongCap, expToNextSeong, EXP_BASE_BY_STAGE } from '@/data/martialArts';
import { REALM_SEONG_CAP } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple, RelationLevel } from '@/types';
import { seongToStage } from '@/data/martialArts';
import { combatRating } from './combatPower';
import { inflictWound } from './woundSystem';
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

// ─── 결과 4단계 — 실력차(전투력)로 구간, 굴림으로 승패 🔧 그레이박스 ─────────────
export type DaeryeonTier = 'close' | 'edge' | 'crush'; // 박빙 / 우세 / 압도
const GAP_CLOSE = 14; // 전투력 차 ≤ → 박빙
const GAP_EDGE = 38; //  전투력 차 ≤ → 우세 (그 위는 압도)

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

// 부상(사고) 확률 가산 🔧
const INJURY_BASE = 0.02;
const INJURY_ENEMY = 0.1; //   적대 관계 — 감정이 실린 손속
const INJURY_CRUSH = 0.05; //  현격 차 — 하수가 못 받아냄
const INJURY_IMPULSIVE = 0.03; // 충동 인격(신중<35) 한쪽이라도
const INJURY_DARK_ART = 0.03; // 마공 수련자 — 살기

const REL_UP: Record<RelationLevel, RelationLevel> = {
  enemy: 'distant',
  distant: 'neutral',
  neutral: 'friend',
  friend: 'sworn',
  sworn: 'sworn',
};
const REL_DOWN: Record<RelationLevel, RelationLevel> = {
  sworn: 'friend',
  friend: 'neutral',
  neutral: 'distant',
  distant: 'enemy',
  enemy: 'enemy',
};

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
  // 대련 1회 = 기초 수련 하루치 기준 × 결과 배율. (정체기 보정 없음 — 맞상대가 정체를 깬다.)
  const exp = Math.max(0, Math.round(base * tierMult * noviceMult));
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
  useDiscipleStore.getState().update(d.id, { martialArts });
  return { artId: mainId, seongBefore, seong, delta: exp };
}

// 대련 한 판 해소 — 호출 전제: 둘 다 그날 무공일·가용(training). trainingSystem 이 짝을 검증해 호출.
export function resolveDaeryeon(aId: string, bId: string): DaeryeonOutcome | null {
  const ds = useDiscipleStore.getState();
  const a = ds.disciples[aId];
  const b = ds.disciples[bId];
  if (!a || !b) return null;

  // 실력차 → 구간, 굴림 → 승패.
  const ra = combatRating(a);
  const rb = combatRating(b);
  const gap = Math.abs(ra - rb);
  const tier: DaeryeonTier = gap <= GAP_CLOSE ? 'close' : gap <= GAP_EDGE ? 'edge' : 'crush';
  const strongFirst = ra >= rb;
  const pStrongWins = clamp(0.5 + gap / 80, 0, 0.95);
  const strongWins = Math.random() < pStrongWins;
  const winner = strongFirst === strongWins ? a : b;
  const loser = winner.id === a.id ? b : a;

  // 사고 굴림 — 감정·차이·기질·살기.
  const enemyPair = a.relationships[b.id] === 'enemy' || b.relationships[a.id] === 'enemy';
  const impulsive = a.personality.prudence < 35 || b.personality.prudence < 35;
  const injuryChance =
    INJURY_BASE +
    (enemyPair ? INJURY_ENEMY : 0) +
    (tier === 'crush' ? INJURY_CRUSH : 0) +
    (impulsive ? INJURY_IMPULSIVE : 0) +
    (hasDarkArt(a) || hasDarkArt(b) ? INJURY_DARK_ART : 0);
  const injured = Math.random() < injuryChance;

  const artDelta: DaeryeonOutcome['artDelta'] = {};

  if (injured) {
    // 사고 — 약한 쪽이 다친다(경상). 때린 쪽은 죄책감. 배움 없이 끝.
    const victim = strongFirst ? b : a;
    const striker = victim.id === a.id ? b : a;
    inflictWound(victim.id, 'wound', 4, 10);
    ds.update(striker.id, { stress: clamp((striker.stress ?? 0) + 6) });
    // 관계 — 보통은 틀어진다. 적대 페어만 낮은 확률로 "치고받고 인정"(화해 불씨).
    const vRel = victim.relationships[striker.id] ?? 'neutral';
    const sRel = striker.relationships[victim.id] ?? 'neutral';
    if (enemyPair && Math.random() < 0.12) {
      ds.setRelation(victim.id, striker.id, REL_UP[vRel]);
      ds.setRelation(striker.id, victim.id, REL_UP[sRel]);
      return {
        tier,
        injured,
        note: `${victim.name}이(가) ${striker.name}의 손속에 다쳤다 — 그런데 일으켜 세우는 손을 뿌리치지 않았다.`,
        artDelta,
      };
    }
    if (Math.random() < 0.3) {
      ds.setRelation(victim.id, striker.id, REL_DOWN[vRel]);
    }
    return {
      tier,
      injured,
      note: `대련이 과열됐다. ${striker.name}의 손속이 지나쳐 ${victim.name}이(가) 다쳤다.`,
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
  if (tier === 'close' && Math.random() < SPARK_CHANCE) {
    spark = Math.random() < 0.5 ? a : b;
    const extra = gainSparSeongExp(ds.disciples[spark.id] ?? spark, SPARK_EXP_MULT);
    if (extra) artDelta[spark.id] = extra;
  }

  // 관계·기질 — 구간별.
  const wRel = winner.relationships[loser.id] ?? 'neutral';
  const lRel = loser.relationships[winner.id] ?? 'neutral';
  if (tier === 'close') {
    if (Math.random() < 0.3) {
      ds.setRelation(winner.id, loser.id, REL_UP[wRel]);
      ds.setRelation(loser.id, winner.id, REL_UP[lRel]);
    }
  } else if (tier === 'edge') {
    if (Math.random() < 0.15) {
      ds.setRelation(loser.id, winner.id, REL_UP[lRel]); // 한 수 위를 향한 존경
    }
    ds.update(winner.id, { personality: shiftPersona(winner, { warmth: 1 }) }); // 가르친 보람
  } else {
    // 압도 — 약자는 기죽는다. 무뚝뚝·야심가는 앙금.
    ds.update(loser.id, { stress: clamp((loser.stress ?? 0) + 6) });
    const resentful = loser.personality.warmth < 40 || loser.personality.ambition > 65;
    if (resentful && Math.random() < 0.2) {
      ds.setRelation(loser.id, winner.id, REL_DOWN[lRel]);
    }
  }

  // 결과 풍경 — 숫자 없이 구간을 읽게 한다.
  const note =
    spark != null
      ? `${a.name}과(와) ${b.name}이(가) 손을 맞췄다 — 합이 무르익던 중, ${spark.name}이(가) 상대의 초식에서 제 무공의 답을 보았다.`
      : tier === 'close'
        ? `${a.name}과(와) ${b.name}이(가) 팽팽하게 손을 맞췄다. 서로의 빈틈을 짚어주며 둘 다 적잖이 얻었다.`
        : tier === 'edge'
          ? `${winner.name}이(가) 반 수 위였다. ${loser.name}은(는) 받아내며 더 많이 배웠다.`
          : `${winner.name}의 무위가 한참 위라 ${loser.name}은(는) 손도 제대로 못 섞었다 — 이 짝으로는 서로 얻을 게 없다.`;

  return { tier, injured, note, artDelta };
}
