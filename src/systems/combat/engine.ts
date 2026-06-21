// 전투 시뮬레이션 엔진 — docs/35. 대련(spar)·실전(real), 1:1 ~ n:n.
// 순수 함수: 전투원 스냅샷 → 결과. 스토어를 읽지도 쓰지도 않는다 — 효과 적용은 호출측
// (daeryeonSystem·sparringSystem·의뢰/강호 이벤트)이 한다. RNG 주입 가능(헤드리스 시뮬).
//
// 한 판 = 합(round)의 연속. 매 합: 신법 순으로 공세 → 명중(신법 대결) → 피해(공/방 비율).
//   · 내공(뒷심): 합마다 마른다. 떨어지면 위력 급감 — 심법 없는 칼은 뒷심에서 진다.
//   · n:n 포위: 한 사람에게 여럿이 붙으면 받는 쪽 신법이 깎인다(협공).
//     단 경지가 2단계 위면 포위가 안 통한다 — 군계일학.
//   · 대련: 승부가 갈리는 순간(체력 38%·내공 고갈) 승복. 부상은 "사고"일 때만.
//   · 실전: 쓰러질 때까지. 결정타 사망 굴림(손속·자비·마공·몸의 단단함), 열세 측 패주.
// 모든 수치 🔧 그레이박스 — 숫자는 비노출, 풍경(narrate)으로만 읽힌다.

import { random } from '@/systems/rng';
import type {
  CombatConfig,
  CombatEvent,
  CombatResult,
  Combatant,
  CombatantResult,
  CombatantState,
  CombatTier,
  SuggestedWound,
} from '@/types/combat';
import type { WoundType } from '@/types/disciple';
import { REALM_ORDER } from '@/types/realm';
import { resistsWound } from '@/data/martialArts';
import { buildSheet, type CombatSheet } from './sheet';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
// NaN/Infinity 안전 클램프 — 전투원 스탯이 손상(NaN·±Infinity)돼도 엔진 출력(hpFrac·margin 등)이
// 절대 NaN/Infinity 를 내보내지 않게 하한으로 떨군다. 순수 엔진의 출력 계약(항상 유한·범위) 보증.
const safeClamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo);

// ─── 조정 상수 🔧 ─────────────────────────────────────────────────────────────
const MAX_ROUNDS_DEFAULT = 30;
const BASE_HIT = 0.74; //          기본 명중
const HIT_SPD_SCALE = 260; //      신법 차 → 명중 가감 폭
const BASE_DMG_FRAC = 0.085; //    호각 한 합의 피해(최대체력 비율)
const DMG_RATIO_EXP = 0.75; //     공/방 비율의 체감 곡선
const CRIT_MULT = 1.8;
const SPAR_YIELD_HP = 0.38; //     대련 승복선 (체력 비율)
const SPAR_YIELD_QI = 8; //        대련 승복선 (내공 잔량)
const QI_LOW = 35; //              내공 부족 — 위력 ×0.8
const QI_EMPTY = 12; //            내공 바닥 — 위력 ×0.55
const GANG_SPD_PENALTY = 0.12; //  포위 — 추가 공격자 1인당 수비측 신법 −12%
const GANG_IMMUNE_REALM_GAP = 2; // 경지 차 ≥2 면 포위 무효(군계일학) — 광역·잡졸 트리거도 겸함(docs/35 §3-A)
// ── n:n 무쌍 모델 (docs/35 §3-A, 2026-06-13) — 란체스터 제곱→선형 교정 ──
const ENGAGE_CAP = 2; //           한 표적을 한 합에 칠 수 있는 공격자 상한(초과는 분산·대기). 제곱→선형.
const MOOK_DMG_FLOOR = 0.004; //   2경지+ 아래 공격자의 피해 하한(호신강기 — 잡졸 칼이 거의 안 박힌다)
const DMG_FLOOR = 0.015; //        일반 피해 하한
const CLEAVE_BASE = 2; //          2경지+ 위 공격자의 광역(검기) 기본 추가 타격 수 (+경지차)
const CLEAVE_DMG_MULT = 0.9; //    광역 부차 타격 피해 배율(주 표적보다 약간 약하게)
const FRIENDLY_FIRE_MULT = 0.5; // 광폭(wild) 광역에 아군이 휘말릴 때 — 빗겨 맞아 절반 피해
const SWEEP_BASE = 1; //           다인기(광역) 무공이 동급에서도 추가로 휩쓰는 적 수
const DRAIN_QI = 10; //            흡공 1타당 흡수하는 적 내공(뒷심) — 자신을 채운다(흡성대법)
const PIERCE_DEF_IGNORE = 0.3; //  파공 — 상대 방어(호신강기) 무시 비율
const ACCIDENT_BASE = 0.02; //     대련 사고 기본율
const ACCIDENT_CRUSH = 0.05; //    현격한 차(위력 2.2배↑) 가산
const RETREAT_HP = 0.3; //         실전 패주 고려선 (진영 평균 체력)
const ROUT_CASUALTY_FRAC = 0.3; // 사상자 패주 — 자기 진영 3할 이상 쓰러지면 흩어질 수 있다
const ROUT_CASUALTY_GAP = 0.25; // 단 상대 사상자가 내 쪽보다 이만큼 적을 때만(일방적 도륙)
const BURST_SIMMA = 60; //         심마 폭주 임계 (실전)

interface Fighter {
  sheet: CombatSheet;
  side: 'A' | 'B';
  hp: number;
  qi: number; // 0~100 보유고
  state: CombatantState;
  dealt: number; // 가한 피해 (상대 최대체력 비율 합)
  taken: number;
  burst: boolean; // 심마 폭주 중
  drained: number; // 흡공으로 흡수한 내공 누적 — 결과로 보고(영구 내공·심마는 호출측이 적용)
  wound?: SuggestedWound;
}

function aliveOf(fs: Fighter[], side: 'A' | 'B'): Fighter[] {
  return fs.filter((f) => f.side === side && f.state === 'standing');
}

// ── 전투 공식 — 단일 소스(시뮬·문서가 베끼지 않게 export, 재구현 오라클 방지). docs/35 §3·§4. ──
export function qiPowerMult(qi: number): number {
  if (qi <= QI_EMPTY) return 0.55; // 내공 바닥 ×0.55
  if (qi <= QI_LOW) return 0.8; //   내공 부족 ×0.8
  return 1;
}
export function startQiFor(staminaFrac: number): number {
  return 100 * (0.6 + 0.4 * clamp(staminaFrac, 0, 1)); // 시작 내공 = 체력비율 60~100%
}
export function lethalChance(overkill: number, mercy: number, isMa: boolean, strength: number): number {
  const mercyMult = mercy < 40 ? 1.3 : mercy > 65 ? 0.45 : 1; // 손속(자비)
  return clamp((0.12 + overkill * 0.5) * mercyMult * (isMa ? 1.5 : 1) * (1 - strength / 220), 0, 0.6);
}
export function tierFor(margin: number): CombatTier {
  return margin < 0.22 ? 'close' : margin < 0.5 ? 'edge' : 'crush';
}

function qiMult(f: Fighter): number {
  return qiPowerMult(f.qi);
}

function effAtk(f: Fighter): number {
  return f.sheet.atk * qiMult(f) * (f.burst ? 1.15 : 1);
}
function effDef(f: Fighter): number {
  return f.sheet.def * (f.burst ? 0.85 : 1);
}

// 결정타의 상처 결 — 무공 속성을 따른다. 화염=화상·빙한=동상·중독=독·심법/마공=내상·그 외=외상.
// (속성 상처는 같은 속성 해독·치료 영약이라야 낫는다 — docs/29 §5-1, 해독약 사다리.)
// 체질(불침)이면 그 속성이 안 박힌다 — 외상으로, 외상마저 면역(금강불괴)이면 내상(충격)으로 떨어진다. docs/35 §6-1c.
function woundTypeOf(finisher: Fighter, defender: Fighter, severity: number, rng: () => number): WoundType {
  const wr = defender.sheet.ref.woundResist;
  const resisted = (t: WoundType) => resistsWound(wr?.[t], severity);
  let t: WoundType = finisher.sheet.burn
    ? 'burn'
    : finisher.sheet.frost
      ? 'frost'
      : finisher.sheet.poison || (finisher.sheet.hiddenDepth > 0 && rng() < 0.5)
        ? 'poison'
        : finisher.sheet.qigongOrMaMain
          ? 'inner'
          : 'wound';
  if ((t === 'burn' || t === 'frost' || t === 'poison') && resisted(t)) t = 'wound';
  if (t === 'wound' && resisted('wound')) t = 'inner'; // 금강불괴 — 살은 안 베여도 충격은 속을 친다
  return t;
}

function realmIdx(f: Fighter): number {
  return Math.max(0, REALM_ORDER.indexOf(f.sheet.ref.realm));
}

// 진영 잔여 전력(전투 속행 기준) — 서 있는 사람만, 평균 체력 비율. 패주 판단용.
function sideStrength(fs: Fighter[], side: 'A' | 'B'): number {
  const members = fs.filter((f) => f.side === side);
  if (members.length === 0) return 0;
  const sum = members.reduce(
    (acc, f) => acc + (f.state === 'standing' ? safeClamp(Math.max(0, f.hp) / f.sheet.maxHp, 0, 1) : 0),
    0,
  );
  return sum / members.length;
}

// 진영 잔존 상태(판정 기준) — 승복자도 남은 체력만큼 친다(꺾였을 뿐 박살난 게 아니다).
// 죽음·패주만 0. margin → tier(박빙/우세/압도)의 원료.
function sideResidual(fs: Fighter[], side: 'A' | 'B'): number {
  const members = fs.filter((f) => f.side === side);
  if (members.length === 0) return 0;
  const sum = members.reduce((acc, f) => {
    if (f.state === 'dead' || f.state === 'fled') return acc;
    return acc + safeClamp(Math.max(0, f.hp) / f.sheet.maxHp, 0, 1);
  }, 0);
  return sum / members.length;
}

export function simulateCombat(
  sideA: Combatant[],
  sideB: Combatant[],
  config: CombatConfig,
): CombatResult {
  const rng = config.rng ?? random;
  const maxRounds = config.maxRounds ?? MAX_ROUNDS_DEFAULT;
  const lethal = config.lethal ?? true;
  const allowRetreat = config.allowRetreat ?? true;
  const real = config.mode === 'real';

  const meanInternal = (cs: Combatant[]) =>
    cs.length === 0 ? 0 : cs.reduce((a, c) => a + c.internal, 0) / cs.length;
  const fighters: Fighter[] = [
    ...sideA.map((c) => ({ c, side: 'A' as const, foe: meanInternal(sideB) })),
    ...sideB.map((c) => ({ c, side: 'B' as const, foe: meanInternal(sideA) })),
  ].map(({ c, side, foe }) => {
    const sheet = buildSheet(c, foe);
    return {
      sheet,
      side,
      hp: sheet.maxHp,
      qi: startQiFor(c.staminaFrac),
      state: 'standing' as CombatantState,
      dealt: 0,
      taken: 0,
      burst: real && c.simma >= BURST_SIMMA,
      drained: 0,
    };
  });

  const events: CombatEvent[] = [];
  for (const f of fighters) {
    if (f.burst) events.push({ round: 0, kind: 'burst', actorId: f.sheet.ref.id });
  }
  // 진영별 시작 인원 — 사상자 패주(rout) 비율 계산용.
  const initCount = { A: Math.max(1, sideA.length), B: Math.max(1, sideB.length) };

  // 한 타격을 적용한다(주 표적·광역 부차 표적 공용). 피해·이벤트 + 모드별 승부처(대련 승복 / 실전
  // 쓰러짐·사망 굴림)를 처리한다. 이미 쓰러진(서 있지 않은) 대상은 건너뛴다.
  const applyStrike = (attacker: Fighter, defender: Fighter, frac: number, crit: boolean, rnd: number) => {
    if (defender.state !== 'standing') return;
    defender.hp -= frac * defender.sheet.maxHp;
    attacker.dealt += frac;
    defender.taken += frac;
    events.push({
      round: rnd,
      kind: crit ? 'crit' : 'exchange',
      actorId: attacker.sheet.ref.id,
      targetId: defender.sheet.ref.id,
      dmgFrac: frac,
    });
    if (!real) {
      if (defender.hp / defender.sheet.maxHp <= SPAR_YIELD_HP || defender.qi <= SPAR_YIELD_QI) {
        defender.state = 'yielded';
        events.push({ round: rnd, kind: 'yield', actorId: defender.sheet.ref.id });
      }
      return;
    }
    if (defender.hp > 0) return;
    // 실전 — 쓰러짐. 결정타 사망 굴림: 손속(자비)·마공 살기·넘친 힘·몸의 단단함. 🔧
    defender.state = 'downed';
    const overkill = Math.min(1, -defender.hp / defender.sheet.maxHp);
    const deathChance = lethal
      ? lethalChance(overkill, attacker.sheet.ref.mercy, attacker.sheet.isMa, defender.sheet.ref.strength)
      : 0;
    if (rng() < deathChance) {
      defender.state = 'dead';
      events.push({ round: rnd, kind: 'death', actorId: attacker.sheet.ref.id, targetId: defender.sheet.ref.id });
    } else {
      const severity = overkill > 0.3 ? 1 : 2;
      defender.wound = { type: woundTypeOf(attacker, defender, severity, rng), severity, days: severity === 1 ? 30 : 21 };
      events.push({ round: rnd, kind: 'down', actorId: attacker.sheet.ref.id, targetId: defender.sheet.ref.id });
    }
  };

  let round = 0;
  while (round < maxRounds && aliveOf(fighters, 'A').length > 0 && aliveOf(fighters, 'B').length > 0) {
    round += 1;

    // ── 지속 피해(중독·화상 상처) — 합마다 진영 무관하게 제 몸이 깎인다(독이 퍼지고 상처가 곪는다).
    //    공격자 없는 환경 피해라 절명은 없다(곪아 쓰러질 뿐). docs/35 §6-1b.
    for (const f of fighters) {
      if (f.state !== 'standing' || f.sheet.dotFrac <= 0) continue;
      f.hp -= f.sheet.dotFrac * f.sheet.maxHp;
      if (real) {
        if (f.hp <= 0) {
          f.state = 'downed';
          events.push({ round, kind: 'down', targetId: f.sheet.ref.id });
        }
      } else if (f.hp / f.sheet.maxHp <= SPAR_YIELD_HP) {
        f.state = 'yielded';
        events.push({ round, kind: 'yield', actorId: f.sheet.ref.id });
      }
    }
    if (aliveOf(fighters, 'A').length === 0 || aliveOf(fighters, 'B').length === 0) break;

    // ── 패주 — 실전, 3합 이후. ① 진영 평균 체력 바닥 + 전력 열세, 또는
    // ② 사상자 폭주(동료가 일방적으로 베여 나가면 나머지가 흩어진다 — 한 명이 다수를 베는 무쌍의
    //    완성. docs/35 §3-A). 잡졸 무리가 고수 하나에게 무너지는 결.
    if (real && allowRetreat && round >= 3) {
      for (const side of ['A', 'B'] as const) {
        const mine = aliveOf(fighters, side);
        const foes = aliveOf(fighters, side === 'A' ? 'B' : 'A');
        if (mine.length === 0 || foes.length === 0) continue;
        const myPow = mine.reduce((a, f) => a + f.sheet.power, 0);
        const foePow = foes.reduce((a, f) => a + f.sheet.power, 0);
        const myCas = 1 - mine.length / initCount[side];
        const foeCas = 1 - foes.length / initCount[side === 'A' ? 'B' : 'A'];
        const overpowered = sideStrength(fighters, side) < RETREAT_HP && myPow < foePow * 0.6;
        const slaughtered = myCas >= ROUT_CASUALTY_FRAC && foeCas <= myCas - ROUT_CASUALTY_GAP;
        if (overpowered || slaughtered) {
          const fastestFoe = Math.max(...foes.map((f) => f.sheet.spd));
          for (const f of mine) {
            const p = clamp(0.3 + (f.sheet.spd - fastestFoe) / 200, 0.1, 0.9);
            if (rng() < p) {
              f.state = 'fled';
              events.push({ round, kind: 'flee', actorId: f.sheet.ref.id });
            }
          }
        }
      }
      if (aliveOf(fighters, 'A').length === 0 || aliveOf(fighters, 'B').length === 0) break;
    }

    // ── 합 — 신법 순(±10% 운). 이번 합에 같은 상대를 노린 수가 누적되면 포위.
    const order = fighters
      .filter((f) => f.state === 'standing')
      .sort((x, y) => y.sheet.spd * (0.9 + rng() * 0.2) - x.sheet.spd * (0.9 + rng() * 0.2));
    const focusCount: Record<string, number> = {};

    for (const actor of order) {
      if (actor.state !== 'standing') continue;
      const allFoes = aliveOf(fighters, actor.side === 'A' ? 'B' : 'A');
      if (allFoes.length === 0) break;

      // 교전 인원 제한 — 한 표적엔 한 합에 ENGAGE_CAP 명까지만 실제로 붙는다. 초과 공격자는
      // 다른 적으로 분산되고, 붙을 적이 없으면 대기(물리적으로 못 붙음). 제곱→선형. docs/35 §3-A.
      const foes = allFoes.filter((f) => (focusCount[f.sheet.ref.id] ?? 0) < ENGAGE_CAP);
      if (foes.length === 0) continue;

      // 표적 — 약한(체력 낮은) 쪽으로 손이 간다(가중 무작위).
      const weights = foes.map((f) => 1.5 - f.hp / f.sheet.maxHp);
      const total = weights.reduce((a, w) => a + w, 0);
      let pick = rng() * total;
      let target = foes[foes.length - 1];
      for (let i = 0; i < foes.length; i += 1) {
        pick -= weights[i];
        if (pick <= 0) {
          target = foes[i];
          break;
        }
      }

      // 포위 — 이번 합에 이미 공격받은 만큼 신법이 깎인다. 경지 2단계 위면 무시(군계일학).
      const extras = focusCount[target.sheet.ref.id] ?? 0;
      const gap = realmIdx(actor) - realmIdx(target);
      const gangImmune = -gap >= GANG_IMMUNE_REALM_GAP;
      const targetSpd = target.sheet.spd * (gangImmune ? 1 : Math.max(0.4, 1 - GANG_SPD_PENALTY * extras));
      focusCount[target.sheet.ref.id] = extras + 1;

      // 내공 소모 — 휘두르는 것 자체가 내공이다.
      actor.qi = Math.max(0, actor.qi - actor.sheet.qiDrain);

      // 명중 — 신법 대결 + 오성(간파).
      const pHit = clamp(
        BASE_HIT +
          (actor.sheet.spd - targetSpd) / HIT_SPD_SCALE +
          actor.sheet.ref.insight * 0.012 -
          target.sheet.ref.insight * 0.01,
        0.3,
        0.96,
      );
      if (rng() >= pHit) {
        events.push({ round, kind: 'miss', actorId: actor.sheet.ref.id, targetId: target.sheet.ref.id });
        continue;
      }

      // 피해 — 공/방 비율의 체감 곡선 × 운 폭 × 살초. 파공(pierce)은 상대 방어(호신강기)를 일부 무시.
      // 2경지+ 아래 공격자는 하한이 낮다(잡졸 칼이 고수에게 거의 안 박힌다).
      const defVal = Math.max(1, effDef(target) * (actor.sheet.pierce ? 1 - PIERCE_DEF_IGNORE : 1));
      const ratio = effAtk(actor) / defVal;
      const crit = rng() < actor.sheet.critChance;
      let frac = BASE_DMG_FRAC * Math.pow(ratio, DMG_RATIO_EXP) * (0.85 + rng() * 0.3);
      if (crit) frac *= CRIT_MULT;
      frac = clamp(frac, gap <= -GANG_IMMUNE_REALM_GAP ? MOOK_DMG_FLOOR : DMG_FLOOR, 0.5);

      applyStrike(actor, target, frac, crit, round);

      // 흡공(drain) — 적의 내공(뒷심)을 빨아 자신을 채운다(흡성대법류). 영구 내공 이전·심마 누적은
      // 결과의 drained 를 보고 호출측이 적용(엔진은 순수). docs/35 §3-A.
      if (actor.sheet.drain) {
        const steal = Math.min(target.qi, DRAIN_QI);
        target.qi -= steal;
        actor.qi = Math.min(100, actor.qi + steal);
        actor.drained += steal;
      }

      // 광역(검기·검막·장풍) — 다인기 무공이 다수를 함께 친다. 2경지+ 위면 잡졸 풀쓸기(무쌍).
      // 일인기(비-광역) 무공도 고수면 잡졸을 솎되 광역의 6할만(정밀하게 하나씩). docs/35 §3-A.
      let sweep = actor.sheet.sweep ? SWEEP_BASE : 0;
      if (gap >= GANG_IMMUNE_REALM_GAP) {
        const gapBonus = CLEAVE_BASE + (gap - GANG_IMMUNE_REALM_GAP);
        sweep += actor.sheet.sweep ? gapBonus : Math.ceil(gapBonus * 0.6);
      }
      if (sweep > 0) {
        const others = aliveOf(fighters, actor.side === 'A' ? 'B' : 'A')
          .filter((f) => f !== target)
          .sort((x, y) => x.hp / x.sheet.maxHp - y.hp / y.sheet.maxHp)
          .slice(0, sweep);
        for (const o of others) applyStrike(actor, o, frac * CLEAVE_DMG_MULT, false, round);
        // 광폭(wild) — 휩쓰는 기세에 같은 편도 휘말린다(난전 오사). 빗겨 맞아 절반 피해. docs/35 §3-B.
        if (actor.sheet.wild) {
          const allies = aliveOf(fighters, actor.side)
            .filter((f) => f !== actor)
            .sort((x, y) => x.hp / x.sheet.maxHp - y.hp / y.sheet.maxHp)
            .slice(0, sweep);
          for (const a of allies) applyStrike(actor, a, frac * CLEAVE_DMG_MULT * FRIENDLY_FIRE_MULT, false, round);
        }
      }

      // 대련 — 휘두른 쪽이 내공 바닥나면 스스로 승복.
      if (!real && actor.state === 'standing' && actor.qi <= SPAR_YIELD_QI) {
        actor.state = 'yielded';
        events.push({ round, kind: 'yield', actorId: actor.sheet.ref.id });
      }
    }
  }

  // ── 판정 — 서 있는 쪽이 이긴다. 둘 다 서 있으면(합 상한) 잔존 상태로 판정.
  const standA = aliveOf(fighters, 'A').length;
  const standB = aliveOf(fighters, 'B').length;
  const rA = sideResidual(fighters, 'A');
  const rB = sideResidual(fighters, 'B');
  const winner: CombatResult['winner'] =
    standA > 0 && standB === 0
      ? 'A'
      : standB > 0 && standA === 0
        ? 'B'
        : Math.abs(rA - rB) < 0.05
          ? 'draw'
          : rA > rB
            ? 'A'
            : 'B';
  const margin = safeClamp(Math.abs(rA - rB), 0, 1);
  const tier: CombatTier = tierFor(margin);

  // ── 대련 사고 — 판 전체에 1회 굴림. 현격한 차·호출측 가산(감정·살기)으로 오른다.
  let accident: CombatResult['accident'];
  if (!real) {
    const powA = Math.max(...fighters.filter((f) => f.side === 'A').map((f) => f.sheet.power));
    const powB = Math.max(...fighters.filter((f) => f.side === 'B').map((f) => f.sheet.power));
    const ratio = Math.max(powA, powB) / Math.max(1, Math.min(powA, powB));
    const p = ACCIDENT_BASE + (ratio >= 2.2 ? ACCIDENT_CRUSH : 0) + (config.extraAccidentChance ?? 0);
    if (rng() < p) {
      // 약한 쪽이 못 받아내고 다친다.
      const weakSide: 'A' | 'B' = powA <= powB ? 'A' : 'B';
      const pool = fighters.filter((f) => f.side === weakSide);
      const victim = pool[Math.floor(rng() * pool.length)];
      const strikers = fighters.filter((f) => f.side !== weakSide);
      const striker = strikers[Math.floor(rng() * strikers.length)];
      victim.wound = { type: 'wound', severity: 4, days: 10 };
      accident = { victimId: victim.sheet.ref.id, strikerId: striker.sheet.ref.id };
      events.push({
        round,
        kind: 'accident',
        actorId: striker.sheet.ref.id,
        targetId: victim.sheet.ref.id,
      });
    }
  }

  // ── 실전 — 이긴 쪽도 만신창이면 상처를 안고 돌아간다. 🔧
  if (real) {
    for (const f of fighters) {
      if (f.state !== 'standing' || f.wound) continue;
      const frac = Math.max(0, f.hp) / f.sheet.maxHp;
      if (frac < 0.35) f.wound = { type: 'wound', severity: 3, days: 12 };
      else if (frac < 0.55) f.wound = { type: 'wound', severity: 4, days: 7 };
    }
  }

  // ── 결과 묶기.
  let mvpId: string | undefined;
  let bestDealt = -1;
  const combatants: CombatantResult[] = fighters.map((f) => {
    if (f.dealt > bestDealt) {
      bestDealt = f.dealt;
      mvpId = f.sheet.ref.id;
    }
    return {
      id: f.sheet.ref.id,
      name: f.sheet.ref.name,
      side: f.side,
      state: f.state,
      hpFrac: safeClamp(f.hp / f.sheet.maxHp, 0, 1),
      qiFrac: safeClamp(f.qi / 100, 0, 1),
      dealtFrac: Math.round(safeClamp(f.dealt, 0, Number.MAX_SAFE_INTEGER) * 100) / 100,
      takenFrac: Math.round(safeClamp(f.taken, 0, Number.MAX_SAFE_INTEGER) * 100) / 100,
      drainedQi: f.drained > 0 ? Math.round(f.drained) : undefined,
      wound: f.wound,
    };
  });

  return { mode: config.mode, rounds: round, winner, margin, tier, combatants, mvpId, events, accident };
}
