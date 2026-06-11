// 전투 시트 — 전투원 스냅샷(Combatant)에서 교전 수치를 파생. docs/35 §2. 🔧 그레이박스.
// 단일 출처: 종합 위력은 combatPower.kitPower 를 그대로 쓴다(전투력 풍문과 실제 교전이 같은 척도).
//   공격 = 위력 × 근력 보정 × 내공 기세(상대 대비)
//   방어 = 위력 받침 + 근력 + 외공 무공(금종조·역근경류)
//   신법 = 민첩 + 보법 무공 + 경지(몸놀림의 격)
//   체력 = 지구력 기반, 입장 체력·기존 부상으로 깎인 채 시작
//   뒷심 = 내공 보유고 — 합마다 소모, 심법 깊으면 천천히 마른다. 떨어지면 위력 급감.

import type { CombatArt, Combatant } from '@/types/combat';
import type { MartialArtGrade, MartialArtSchool } from '@/types/martialArt';
import { REALM_ORDER } from '@/types/realm';
import { GRADE_COEF, kitPower } from '../combatPower';

// 갈래별 가장 깊은 무공의 깊이 — (성−1) × 등급계수. 없으면 0.
function bestDepth(arts: CombatArt[], school: MartialArtSchool): number {
  let best = 0;
  for (const a of arts) {
    if (a.school !== school) continue;
    best = Math.max(best, Math.max(0, a.seong - 1) * GRADE_COEF[a.grade]);
  }
  return best;
}

function mainArt(c: Combatant): CombatArt | undefined {
  return c.arts.find((a) => a.isMain) ?? c.arts[0];
}

const GRADE_RANK: Record<MartialArtGrade, number> = {
  novice: 0,
  apprentice: 1,
  master: 2,
  grandmaster: 3,
  legendary: 4,
};

// 한 전투원의 교전 시트 — 전투 시작 시 1회 산출(고정), 변하는 건 hp·qi 뿐.
export interface CombatSheet {
  ref: Combatant;
  power: number; // 종합 위력 (kitPower, 맨손 하한 보정)
  atk: number; // 한 합의 공세
  def: number; // 받아내는 힘
  spd: number; // 신법 — 선후·명중·회피
  maxHp: number;
  qiDrain: number; // 공세 1회당 내공 소모 (심법 깊으면 ↓)
  critChance: number; // 살초·회심의 일격
  isMa: boolean; // 주력이 마공 — 손속에 살기
  hiddenDepth: number; // 암기 깊이 — 상처 결(독) 판정
  qigongOrMaMain: boolean; // 내상 결 판정(심법·마공 결정타)
}

// 내공 기세 — 상대 진영 평균 내공 대비. 내공이 크게 앞서면 합마다 찍어 누른다(±12%). 🔧
function qiEdge(myInternal: number, foeMeanInternal: number): number {
  const edge = 1 + ((myInternal - foeMeanInternal) / 1300) * 0.12;
  return Math.max(0.88, Math.min(1.12, edge));
}

export function buildSheet(c: Combatant, foeMeanInternal: number): CombatSheet {
  // 맨손 하한 — 무공이 없어도(전부 1성이어도) 몸은 쓴다. 입문자끼리 0÷0 방지.
  const power = Math.max(
    kitPower(c.arts, c.realm),
    4 + c.strength * 0.12 + c.agility * 0.06,
  );

  const extDepth = bestDepth(c.arts, 'external');
  const lightDepth = bestDepth(c.arts, 'lightness');
  const qigongDepth = bestDepth(c.arts, 'qigong');
  const hiddenDepth = bestDepth(c.arts, 'hidden');
  const realmIdx = Math.max(0, REALM_ORDER.indexOf(c.realm));

  // 만전이 아닌 몸 — 입장 체력·기존 부상이 공세를 깎는다.
  const staminaMult = 0.7 + 0.3 * Math.max(0, Math.min(1, c.staminaFrac));
  const woundMult = c.woundSeverity != null ? 0.55 + 0.09 * c.woundSeverity : 1;

  const main = mainArt(c);
  const isMa = main?.path === 'ma';

  // 주력의 격 — 상승 절기는 내공을 잡아먹는 대신(qiDrain) 한 수가 무겁다. 비용·보상 쌍. 🔧
  const mainGradeMult = 1 + (main ? GRADE_RANK[main.grade] * 0.035 : 0);

  const atk =
    power *
    (0.85 + c.strength * 0.003) *
    mainGradeMult *
    qiEdge(c.internal, foeMeanInternal) *
    staminaMult *
    woundMult;
  // 방어 — 외공서(금종조·역근경류)가 주 받침, 심법은 호신강기로 소폭. 🔧
  const def = power * (0.5 + c.strength * 0.004 + extDepth * 0.022 + qigongDepth * 0.01);
  const spd = c.agility + lightDepth * 4.5 + realmIdx * 8;
  const maxHp = 70 + c.endurance;

  // 내공 소모 — 주력이 무거울수록(상승 비급) 한 수가 크고, 심법이 깊으면 호흡이 길다. 🔧
  const drainBase = 7 + (main ? GRADE_RANK[main.grade] * 1.5 : 0);
  const qiDrain = Math.max(2, drainBase - Math.min(6, qigongDepth * 0.8));

  // 살초 — 암기(허를 찌름)·마공(살기)·충동(무리수)이 올린다. 🔧
  const critChance =
    0.04 + hiddenDepth * 0.01 + (isMa ? 0.03 : 0) + (c.prudence < 35 ? 0.02 : 0);

  return {
    ref: c,
    power,
    atk,
    def,
    spd,
    maxHp,
    qiDrain,
    critChance,
    isMa,
    hiddenDepth,
    qigongOrMaMain: isMa || main?.school === 'qigong',
  };
}
