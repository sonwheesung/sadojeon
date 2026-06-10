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
import { buildSheet, type CombatSheet } from './sheet';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

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
const GANG_IMMUNE_REALM_GAP = 2; // 경지 차 ≥2 면 포위 무효(군계일학)
const ACCIDENT_BASE = 0.02; //     대련 사고 기본율
const ACCIDENT_CRUSH = 0.05; //    현격한 차(위력 2.2배↑) 가산
const RETREAT_HP = 0.3; //         실전 패주 고려선 (진영 평균 체력)
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
  wound?: SuggestedWound;
}

function aliveOf(fs: Fighter[], side: 'A' | 'B'): Fighter[] {
  return fs.filter((f) => f.side === side && f.state === 'standing');
}

function qiMult(f: Fighter): number {
  if (f.qi <= QI_EMPTY) return 0.55;
  if (f.qi <= QI_LOW) return 0.8;
  return 1;
}

function effAtk(f: Fighter): number {
  return f.sheet.atk * qiMult(f) * (f.burst ? 1.15 : 1);
}
function effDef(f: Fighter): number {
  return f.sheet.def * (f.burst ? 0.85 : 1);
}

// 결정타의 상처 결 — 암기는 독, 심법·마공은 내상, 그 외는 외상.
function woundTypeOf(finisher: Fighter, rng: () => number): WoundType {
  if (finisher.sheet.hiddenDepth > 0 && rng() < 0.5) return 'poison';
  if (finisher.sheet.qigongOrMaMain) return 'inner';
  return 'wound';
}

function realmIdx(f: Fighter): number {
  return Math.max(0, REALM_ORDER.indexOf(f.sheet.ref.realm));
}

// 진영 잔여 전력(전투 속행 기준) — 서 있는 사람만, 평균 체력 비율. 패주 판단용.
function sideStrength(fs: Fighter[], side: 'A' | 'B'): number {
  const members = fs.filter((f) => f.side === side);
  if (members.length === 0) return 0;
  const sum = members.reduce(
    (acc, f) => acc + (f.state === 'standing' ? Math.max(0, f.hp) / f.sheet.maxHp : 0),
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
    return acc + Math.max(0, f.hp) / f.sheet.maxHp;
  }, 0);
  return sum / members.length;
}

export function simulateCombat(
  sideA: Combatant[],
  sideB: Combatant[],
  config: CombatConfig,
): CombatResult {
  const rng = config.rng ?? Math.random;
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
      qi: 100 * (0.6 + 0.4 * clamp(c.staminaFrac, 0, 1)),
      state: 'standing' as CombatantState,
      dealt: 0,
      taken: 0,
      burst: real && c.simma >= BURST_SIMMA,
    };
  });

  const events: CombatEvent[] = [];
  for (const f of fighters) {
    if (f.burst) events.push({ round: 0, kind: 'burst', actorId: f.sheet.ref.id });
  }

  let round = 0;
  while (round < maxRounds && aliveOf(fighters, 'A').length > 0 && aliveOf(fighters, 'B').length > 0) {
    round += 1;

    // ── 패주 — 실전, 3합 이후. 진영 평균 체력이 바닥이고 전력이 한참 밀리면 달아난다.
    if (real && allowRetreat && round >= 3) {
      for (const side of ['A', 'B'] as const) {
        const mine = aliveOf(fighters, side);
        const foes = aliveOf(fighters, side === 'A' ? 'B' : 'A');
        if (mine.length === 0 || foes.length === 0) continue;
        const myPow = mine.reduce((a, f) => a + f.sheet.power, 0);
        const foePow = foes.reduce((a, f) => a + f.sheet.power, 0);
        if (sideStrength(fighters, side) < RETREAT_HP && myPow < foePow * 0.6) {
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
      const foes = aliveOf(fighters, actor.side === 'A' ? 'B' : 'A');
      if (foes.length === 0) break;

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
      const gangImmune = realmIdx(target) - realmIdx(actor) >= GANG_IMMUNE_REALM_GAP;
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

      // 피해 — 공/방 비율의 체감 곡선 × 운 폭 × 살초.
      const ratio = effAtk(actor) / Math.max(1, effDef(target));
      const crit = rng() < actor.sheet.critChance;
      let frac = BASE_DMG_FRAC * Math.pow(ratio, DMG_RATIO_EXP) * (0.85 + rng() * 0.3);
      if (crit) frac *= CRIT_MULT;
      frac = clamp(frac, 0.015, 0.5);

      const dmg = frac * target.sheet.maxHp;
      target.hp -= dmg;
      actor.dealt += frac;
      target.taken += frac;
      events.push({
        round,
        kind: crit ? 'crit' : 'exchange',
        actorId: actor.sheet.ref.id,
        targetId: target.sheet.ref.id,
        dmgFrac: frac,
      });

      // ── 승부처 — 모드별.
      if (!real) {
        // 대련 — 승부가 갈리는 순간 승복. 다치지 않는다(사고는 별도 굴림).
        if (target.hp / target.sheet.maxHp <= SPAR_YIELD_HP || target.qi <= SPAR_YIELD_QI) {
          target.state = 'yielded';
          events.push({ round, kind: 'yield', actorId: target.sheet.ref.id });
        }
        if (actor.qi <= SPAR_YIELD_QI) {
          actor.state = 'yielded';
          events.push({ round, kind: 'yield', actorId: actor.sheet.ref.id });
        }
      } else if (target.hp <= 0) {
        // 실전 — 쓰러짐. 결정타 사망 굴림: 손속(자비)·마공 살기·넘친 힘·몸의 단단함. 🔧
        target.state = 'downed';
        const overkill = Math.min(1, -target.hp / target.sheet.maxHp);
        const mercyMult =
          actor.sheet.ref.mercy < 40 ? 1.3 : actor.sheet.ref.mercy > 65 ? 0.45 : 1;
        const deathChance = lethal
          ? clamp(
              (0.12 + overkill * 0.5) *
                mercyMult *
                (actor.sheet.isMa ? 1.5 : 1) *
                (1 - target.sheet.ref.strength / 220),
              0,
              0.6,
            )
          : 0;
        if (rng() < deathChance) {
          target.state = 'dead';
          events.push({ round, kind: 'death', actorId: actor.sheet.ref.id, targetId: target.sheet.ref.id });
        } else {
          const severity = overkill > 0.3 ? 1 : 2;
          target.wound = {
            type: woundTypeOf(actor, rng),
            severity,
            days: severity === 1 ? 30 : 21,
          };
          events.push({ round, kind: 'down', actorId: actor.sheet.ref.id, targetId: target.sheet.ref.id });
        }
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
  const margin = Math.abs(rA - rB);
  const tier: CombatTier = margin < 0.22 ? 'close' : margin < 0.5 ? 'edge' : 'crush';

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
      hpFrac: clamp(f.hp / f.sheet.maxHp, 0, 1),
      qiFrac: clamp(f.qi / 100, 0, 1),
      dealtFrac: Math.round(f.dealt * 100) / 100,
      takenFrac: Math.round(f.taken * 100) / 100,
      wound: f.wound,
    };
  });

  return { mode: config.mode, rounds: round, winner, margin, tier, combatants, mvpId, events, accident };
}
