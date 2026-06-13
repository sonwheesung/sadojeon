// 전투 시트 — 전투원 스냅샷(Combatant)에서 교전 수치를 파생. docs/35 §2. 🔧 그레이박스.
// 단일 출처: 종합 위력은 combatPower.kitPower 를 그대로 쓴다(전투력 풍문과 실제 교전이 같은 척도).
//   공격 = 위력 × 근력 보정 × 내공 기세(상대 대비)
//   방어 = 위력 받침 + 근력 + 외공 무공(금종조·역근경류)
//   신법 = 민첩 + 보법 무공 + 경지(몸놀림의 격)
//   체력 = 지구력 기반, 입장 체력·기존 부상으로 깎인 채 시작
//   뒷심 = 내공 보유고 — 합마다 소모, 심법 깊으면 천천히 마른다. 떨어지면 위력 급감.

import type { CombatArt, Combatant } from '@/types/combat';
import type { MartialArtGrade, MartialArtSchool, MartialTrait } from '@/types/martialArt';
import { REALM_ORDER } from '@/types/realm';
import { GRADE_COEF, kitPower } from '../combatPower';
import { defaultArtTraits, resistsPoison } from '@/data/martialArts';

// CombatArt 의 실효 특성 — 명시값 우선, 없으면 갈래·등급·노선 기본값(테스트 헬퍼 등 traits 미지정 대비).
function traitsOf(a: CombatArt): MartialTrait[] {
  return a.traits ?? defaultArtTraits(a);
}

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
  // 주력 무공 특성(트레이트) — 공격 성질. 광역·흡공·속성·파공·쾌는 주력을 따른다. docs/35 §3-A·§3-B.
  sweep: boolean; // 다인기(광역, 적만)
  wild: boolean; // 광폭 — 광역이 아군까지 휩쓴다(난전 오사)
  drain: boolean; // 흡공(내공 흡수)
  poison: boolean; // 중독 속성 → 중독 상처
  burn: boolean; // 화염 속성 → 화상 상처
  frost: boolean; // 빙한 속성 → 동상 상처
  pierce: boolean; // 파공(호신강기 관통)
  guard: boolean; // 호신강기 — 보유 무공 아무거나 guard면 방어(주력 아니어도)
  dotFrac: number; // 합마다 받는 지속 피해(최대체력 비율) — 중독·화상 상처. 0이면 없음.
}

// 상처 종류별 추가 결 — 심도(severity 1치명~5경미)가 세기를 정한다. depth: 경미 0 ~ 치명 1.
// 공통 공세 저하(woundMult)는 모든 종류에 이미 걸려 있고, 여기서 종류별 결을 얹는다(속성 상처가
// 외상보다 독해 해독약을 서둘러야 하는 이유). docs/35 §6-1b.
function woundDepth(severity?: number): number {
  if (severity == null) return 0;
  return Math.max(0, Math.min(1, (5 - severity) / 4));
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

  // 상처 종류별 결 — 동상(신법↓)·내상(내공 소모↑)·중독/화상(지속 피해). 심도가 세기.
  const wd = woundDepth(c.woundSeverity);
  const frostSlow = c.woundType === 'frost' ? 1 - 0.25 * wd : 1; // 동상: 신법 최대 -25%
  const innerDrainMult = c.woundType === 'inner' ? 1 + 0.6 * wd : 1; // 내상: 내공 소모 최대 1.6배
  // 독 면역(천독불침·만독불침)이면 중독 지속 피해가 안 먹힌다.
  const poisonBites =
    c.woundType === 'poison' &&
    !resistsPoison((c.poisonResist ?? 0) as 0 | 1 | 2, c.woundSeverity ?? 5);
  const dotFrac = poisonBites ? 0.015 * wd : c.woundType === 'burn' ? 0.01 * wd : 0; // 합당 지속 피해

  const main = mainArt(c);
  const isMa = main?.path === 'ma';
  const mainTraits = main ? traitsOf(main) : [];
  const hasTrait = (t: MartialTrait) => mainTraits.includes(t);
  const swift = hasTrait('swift');
  // 호신강기 — 주력이 아니어도 보유 무공 아무거나 guard면 몸을 지킨다(외공·내공서 동행).
  const guard = c.arts.some((a) => traitsOf(a).includes('guard'));

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
  // 보법 우위 ↔ 외공 받아내기가 문파전에서 맞서도록 캘리브레이션(2026-06-11, docs/35 §6).
  const def = power * (0.5 + c.strength * 0.004 + extDepth * 0.03 + qigongDepth * 0.01);
  // 쾌(swift) — 주력이 쾌속 무공이면 신법 가산(선공·회피). 동상 상처면 몸이 굳어 신법이 깎인다. 🔧
  const spd = (c.agility + lightDepth * 3.5 + realmIdx * 8) * (swift ? 1.12 : 1) * frostSlow;
  const maxHp = 70 + c.endurance;

  // 내공 소모 — 주력이 무거울수록(상승 비급) 한 수가 크고, 심법이 깊으면 호흡이 길다.
  // 내상 상처면 진기가 새어 같은 수에도 내공이 빨리 마른다(후반 위력 급감). 🔧
  const qiDrain =
    Math.max(2, (7 + (main ? GRADE_RANK[main.grade] * 1.5 : 0)) - Math.min(6, qigongDepth * 0.8)) *
    innerDrainMult;

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
    sweep: hasTrait('sweep'),
    wild: hasTrait('wild'),
    drain: hasTrait('drain'),
    poison: hasTrait('poison'),
    burn: hasTrait('burn'),
    frost: hasTrait('frost'),
    pierce: hasTrait('pierce'),
    guard,
    dotFrac,
  };
}
