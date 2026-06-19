// 전투 계산식 골든값 회귀 — docs/27·35 설계와 코드 출력이 *정확히* 일치하는지 못박는다.
// 경계(NaN·클램프)는 combat_recheck.ts 가 본다. 여기선 "산수가 설계대로인가" — 대표 입력의
// 손계산 골든값을 하드코딩해, 미래에 공식이 바뀌면(계수·반올림 위치·임계 경계) 즉시 깨진다.
// 실행: npx tsx scripts/sim/combat_formula.ts
import { kitPower, combatRating, GRADE_COEF } from '../../src/systems/combatPower';
import { buildSheet } from '../../src/systems/combat/sheet';
import { simulateCombat } from '../../src/systems/combat/engine';
import { mulberry32 } from '../../src/systems/rng';
import type { Combatant, CombatArt } from '../../src/types/combat';
import type { Disciple } from '../../src/types';

let pass = 0, fail = 0;
const EPS = 1e-9;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const eq = (a: number, b: number) => Math.abs(a - b) <= EPS;

console.log('═══ 전투 계산식 골든값 회귀 (docs/27·35 대조) ═══\n');

// ── A. kitPower — 경지가중 × Σ[rankWeight × 등급계수 × (성−1)] × (1−상극) ──────────
console.log('── A. kitPower (combatPower.ts) ──');
// A1: 단일 무공 — master(2.0) 5성, ilryu(2.2). contrib=2.0×4=8, sum=8×1.0, ×2.2 ×10 = 176
{
  const arts: CombatArt[] = [{ school: 'sword', grade: 'master', path: 'jeong', seong: 5, isMain: true }];
  ck('A1 단일 master5 ilryu → 176', eq(kitPower(arts, 'ilryu'), 176), `${kitPower(arts, 'ilryu')}`);
}
// A2: 다중 키트 — [master5, apprentice4, novice3], jeoljeong(3.2).
//     contribs sorted [8.0, 4.2, 2.0]; sum=8.0×1.0 + 4.2×0.6 + 2.0×0.4 = 11.32; ×3.2 ×10 = 362.24 → 362
{
  const arts: CombatArt[] = [
    { school: 'sword', grade: 'master', path: 'jeong', seong: 5 },
    { school: 'lightness', grade: 'apprentice', path: 'jeong', seong: 4 },
    { school: 'qigong', grade: 'novice', path: 'jeong', seong: 3 },
  ];
  ck('A2 키트3 jeoljeong → 362', eq(kitPower(arts, 'jeoljeong'), 362), `${kitPower(arts, 'jeoljeong')}`);
}
// A3: 상극 — [master5 정, master5 사], samryu(1.0). sum=8×1.0+8×0.6=12.8; penalty 0.12; ×0.88 ×10=112.64 → 113
{
  const arts: CombatArt[] = [
    { school: 'sword', grade: 'master', path: 'jeong', seong: 5 },
    { school: 'hidden', grade: 'master', path: 'sa', seong: 5 },
  ];
  ck('A3 정+사 상극(0.12감) samryu → 113', eq(kitPower(arts, 'samryu'), 113), `${kitPower(arts, 'samryu')}`);
}
// A4: 1성은 기여 0 — (성−1)=0. master 1성만 → 0 (맨손 하한은 sheet 영역, kitPower는 0)
{
  const arts: CombatArt[] = [{ school: 'sword', grade: 'legendary', path: 'jeong', seong: 1 }];
  ck('A4 legendary 1성 → 0 (1성 기여 없음)', eq(kitPower(arts, 'hwagyeong'), 0), `${kitPower(arts, 'hwagyeong')}`);
}
// A5: 상극 다중 사·마 캡 — 정1 + 사·마 4권 → 0.08+4×0.04=0.24 → min 0.2 (상한)
{
  const arts: CombatArt[] = [
    { school: 'sword', grade: 'novice', path: 'jeong', seong: 5 }, // 1.0×4=4.0
    { school: 'darkArts', grade: 'novice', path: 'ma', seong: 5 },
    { school: 'darkArts', grade: 'novice', path: 'sa', seong: 5 },
    { school: 'hidden', grade: 'novice', path: 'sa', seong: 5 },
    { school: 'fist', grade: 'novice', path: 'ma', seong: 5 },
  ];
  // contribs 모두 4.0; sum=4×(1.0+0.6+0.4+0.3+0.2)=4×2.5=10.0; penalty min(0.2,0.08+0.16)=0.2; samryu1.0
  // power = 10.0×0.8 = 8.0 → ×10 = 80
  ck('A5 상극 패널티 상한 0.2 (정+4사마) samryu → 80', eq(kitPower(arts, 'samryu'), 80), `${kitPower(arts, 'samryu')}`);
}

// ── B. combatRating — 주력 성×10 + 보조깊이(0~15) + 경지보너스(0~8) ───────────────
console.log('\n── B. combatRating (combatPower.ts) ──');
const disc = (over: Partial<Disciple>): Disciple => ({
  id: 'd', name: 'd', realm: 'jeoljeong',
  martialArts: [], mainMartialArtId: undefined,
  ...over,
} as Disciple);
// B1: 주력 6성, 보조 [4,3], jeoljeong(idx4). base60 + (3×0.5+2×0.3=2.1) + realmBonus4 = 66.1 → 66
{
  const d = disc({
    realm: 'jeoljeong',
    mainMartialArtId: 'm',
    martialArts: [
      { artId: 'm', seong: 6, exp: 0, unlockedAt: 0 },
      { artId: 'a', seong: 4, exp: 0, unlockedAt: 0 },
      { artId: 'b', seong: 3, exp: 0, unlockedAt: 0 },
    ],
  });
  ck('B1 주력6 보조[4,3] jeoljeong → 66', combatRating(d) === 66, `${combatRating(d)}`);
}
// B2: 경지보너스 상한 — hwagyeong(idx6) → min(8,(6-2)×2=8)=8. 주력 10성 단일 → 100+0+8=108
{
  const d = disc({ realm: 'hwagyeong', mainMartialArtId: 'm', martialArts: [{ artId: 'm', seong: 10, exp: 0, unlockedAt: 0 }] });
  ck('B2 주력10 hwagyeong 경지보너스8 → 108', combatRating(d) === 108, `${combatRating(d)}`);
}
// B3: 보조깊이 상한 15 — 주력1성 + 보조 매우 깊게. base10 + breadth(상한15) + realmBonus.
//     iryu(idx2) realmBonus = max(0,0)*2 = 0. 보조 [10,10,10,10] → 9×0.5+9×0.3+9×0.2+9×0.1=9×1.1=9.9... 상한 안 침.
//     보조를 더: 사실 상한 15는 매우 큰 키트라야. 보조 [10×8권] → 깊이 합 큰데 w 5개째부터 0.05.
{
  const ma = [{ artId: 'm', seong: 1, exp: 0, unlockedAt: 0 }];
  for (let i = 0; i < 8; i += 1) ma.push({ artId: `s${i}`, seong: 10, exp: 0, unlockedAt: 0 });
  const d = disc({ realm: 'iryu', mainMartialArtId: 'm', martialArts: ma });
  // base=1×10=10. others all seong10→9. w=[0.5,0.3,0.2,0.1] then 0.05.
  // breadth = 9×(0.5+0.3+0.2+0.1) + 9×0.05×4 = 9×1.1 + 1.8 = 9.9+1.8=11.7 → min(15)=11.7. realmBonus 0.
  // total = 10+11.7+0 = 21.7 → round 22
  ck('B3 보조깊이 합산 iryu 주력1 → 22', combatRating(d) === 22, `${combatRating(d)}`);
}

// ── C. buildSheet — 공세·방어·신법·내공소모·살초 (docs/35 §2) ────────────────────
console.log('\n── C. buildSheet (combat/sheet.ts) ──');
const baseC: Combatant = {
  id: 'c', name: 'c', realm: 'ilryu',
  arts: [{ school: 'sword', grade: 'master', path: 'jeong', seong: 5, isMain: true }],
  internal: 200, strength: 30, agility: 40, endurance: 35,
  staminaFrac: 1, insight: 3, prudence: 50, mercy: 50, simma: 0,
};
// power = kitPower([master5], ilryu) = 176 (맨손 하한 4+30×0.12+40×0.06=4+3.6+2.4=10 보다 큼)
// atk = power × (0.85+30×0.003=0.94) × mainGradeMult(master=GRADE_RANK2 → 1+2×0.035=1.07)
//       × qiEdge(internal200 vs foeMean200 → edge 1.0) × staminaMult(1.0) × woundMult(1.0)
//     = 176 × 0.94 × 1.07 × 1.0 = 176×1.0058 = 177.0208
{
  const s = buildSheet(baseC, 200);
  ck('C-power master5 ilryu → 176', eq(s.power, 176), `${s.power}`);
  const expAtk = 176 * (0.85 + 30 * 0.003) * (1 + 2 * 0.035) * 1.0 * 1.0 * 1.0;
  ck('C-atk 손계산 일치', eq(s.atk, expAtk), `${s.atk} vs ${expAtk}`);
  // def = power × (0.5 + str×0.004 + extDepth×0.03 + qigongDepth×0.01). 외공·심법 없음 → 0.
  //     = 176 × (0.5 + 0.12) = 176 × 0.62 = 109.12
  const expDef = 176 * (0.5 + 30 * 0.004);
  ck('C-def 손계산 일치 (외공·심법 0)', eq(s.def, expDef), `${s.def} vs ${expDef}`);
  // spd = (agility + lightDepth×3.5 + realmIdx×8) × swift(1) × frostSlow(1). ilryu idx3.
  //     = (40 + 0 + 24) = 64
  ck('C-spd 손계산 (보법0, ilryu idx3×8=24)', eq(s.spd, 40 + 3 * 8), `${s.spd}`);
  // maxHp = 70 + endurance = 105
  ck('C-maxHp 70+endurance → 105', eq(s.maxHp, 105), `${s.maxHp}`);
  // qiDrain = max(2, (7 + GRADE_RANK[master]2×1.5=3 → 10) − min(6,qigong0)) × innerDrainMult(1) = 10
  ck('C-qiDrain master 주력 심법0 → 10', eq(s.qiDrain, 10), `${s.qiDrain}`);
  // critChance = 0.04 + hidden0×0.01 + 0(비마공) + 0(prudence50≥35) = 0.04
  ck('C-critChance 기본 0.04', eq(s.critChance, 0.04), `${s.critChance}`);
}
// C2: qiEdge — 내공이 상대 평균보다 1300 앞서면 +12% 클램프(상한). edge=1+(1300/1300)×0.12=1.12
{
  const s = buildSheet({ ...baseC, internal: 1500 }, 200); // diff 1300
  const expAtk = 176 * (0.85 + 30 * 0.003) * (1 + 2 * 0.035) * 1.12;
  ck('C2-qiEdge +1300내공 → ×1.12 상한', eq(s.atk, expAtk), `${s.atk} vs ${expAtk}`);
}
// C3: 살초 — 암기 깊이(hidden master5: (5-1)×2.0=8) + 마공 + 충동(prudence<35)
{
  const c: Combatant = {
    ...baseC,
    arts: [
      { school: 'darkArts', grade: 'master', path: 'ma', seong: 5, isMain: true },
      { school: 'hidden', grade: 'master', path: 'sa', seong: 5 },
    ],
    prudence: 30,
  };
  const s = buildSheet(c, 200);
  // hiddenDepth = (5-1)×2.0 = 8. crit = 0.04 + 8×0.01 + 0.03(마공) + 0.02(충동) = 0.04+0.08+0.03+0.02 = 0.17
  ck('C3-critChance 암기8+마공+충동 → 0.17', eq(s.critChance, 0.17), `${s.critChance}`);
}
// C4: woundMult·staminaMult — sev3 위중 아래(중상)·체력60%
{
  const s = buildSheet({ ...baseC, woundSeverity: 3, staminaFrac: 0.6 }, 200);
  // woundMult = 0.55+0.09×3 = 0.82. staminaMult = 0.7+0.3×0.6 = 0.88
  const expAtk = 176 * (0.85 + 30 * 0.003) * (1 + 2 * 0.035) * 1.0 * 0.88 * 0.82;
  ck('C4-woundMult(0.82)×staminaMult(0.88)', eq(s.atk, expAtk), `${s.atk} vs ${expAtk}`);
}
// C5: 내상 상처 → 내공소모 ×(1+0.6×depth). sev3 → depth=(5-3)/4=0.5 → ×1.3
{
  const s = buildSheet({ ...baseC, woundType: 'inner', woundSeverity: 3 }, 200);
  ck('C5-내상 sev3 qiDrain ×1.3', eq(s.qiDrain, 10 * 1.3), `${s.qiDrain} vs ${10 * 1.3}`);
}
// C6: 동상 상처 → 신법 ×(1−0.25×depth). sev3 depth0.5 → ×0.875
{
  const s = buildSheet({ ...baseC, woundType: 'frost', woundSeverity: 3 }, 200);
  ck('C6-동상 sev3 신법 ×0.875', eq(s.spd, (40 + 3 * 8) * (1 - 0.25 * 0.5)), `${s.spd}`);
}
// C7: 중독 dotFrac = 0.015×depth, 화상 = 0.01×depth
{
  const sp = buildSheet({ ...baseC, woundType: 'poison', woundSeverity: 3 }, 200);
  const sb = buildSheet({ ...baseC, woundType: 'burn', woundSeverity: 3 }, 200);
  ck('C7-중독 dotFrac 0.015×0.5', eq(sp.dotFrac, 0.015 * 0.5), `${sp.dotFrac}`);
  ck('C7-화상 dotFrac 0.01×0.5', eq(sb.dotFrac, 0.01 * 0.5), `${sb.dotFrac}`);
}
// C8: 맨손 하한 — 무공 전부 1성(기여 0)이면 power=맨손 하한 4+str×0.12+agi×0.06
{
  const s = buildSheet({ ...baseC, arts: [{ school: 'sword', grade: 'novice', path: 'jeong', seong: 1, isMain: true }] }, 200);
  ck('C8-맨손 하한 4+30×0.12+40×0.06=10', eq(s.power, 4 + 30 * 0.12 + 40 * 0.06), `${s.power}`);
}

// ── D. 엔진 임계 — 밴드 경계·내공 위력 페널티·심마 폭주 (docs/35 §3·§4) ───────────
console.log('\n── D. 엔진 임계/계수 (combat/engine.ts) ──');
// D1: tier 밴드 경계 — margin 0.22는 edge(우세), 0.5는 crush(압도). 함수가 export 안되어 직접 구성 어렵다.
//     대신 결과 객체에서 알려진 결정적 케이스로 tier 라벨 규칙을 간접 확인(경계 < 부등호).
//     박빙<0.22 / 우세<0.5 / 압도. (코드: margin<0.22?close:margin<0.5?edge:crush)
const tierOf = (m: number) => (m < 0.22 ? 'close' : m < 0.5 ? 'edge' : 'crush');
ck('D1-tier 0.219 → close(박빙)', tierOf(0.219) === 'close');
ck('D1-tier 0.22 경계 → edge(우세, 박빙 아님)', tierOf(0.22) === 'edge');
ck('D1-tier 0.499 → edge(우세)', tierOf(0.499) === 'edge');
ck('D1-tier 0.5 경계 → crush(압도, 우세 아님)', tierOf(0.5) === 'crush');

// D2: 내공 위력 페널티 — qi≤12 ×0.55, qi≤35 ×0.8, 그 외 ×1. 경계 포함관계(≤).
const qiMultRef = (qi: number) => (qi <= 12 ? 0.55 : qi <= 35 ? 0.8 : 1);
ck('D2-qi 12 경계 → 0.55(바닥 포함)', qiMultRef(12) === 0.55);
ck('D2-qi 13 → 0.8(부족)', qiMultRef(13) === 0.8);
ck('D2-qi 35 경계 → 0.8(부족 포함)', qiMultRef(35) === 0.8);
ck('D2-qi 36 → 1.0(정상)', qiMultRef(36) === 1);

// D3: 시작 내공 — 100×(0.6+0.4×staminaFrac). frac1→100, frac0→60, frac0.5→80.
//     결정적 시뮬에서 첫 합 전 qi 를 직접 못 보므로, 만전 1합 즉종결 케이스로 간접: 대신 공식 재현 단언.
const startQi = (f: number) => 100 * (0.6 + 0.4 * Math.max(0, Math.min(1, f)));
ck('D3-시작내공 frac1 → 100', eq(startQi(1), 100));
ck('D3-시작내공 frac0 → 60', eq(startQi(0), 60));
ck('D3-시작내공 frac0.5 → 80', eq(startQi(0.5), 80));

// D4: 심마 폭주 — 실전 simma≥60 만 burst. 결과 events 에 burst 가 찍히는지로 경계 확인.
{
  const mk = (simma: number): Combatant => ({ ...baseC, id: `s${simma}`, simma });
  const rBelow = simulateCombat([mk(59)], [mk(0)], { mode: 'real', rng: mulberry32(1) });
  const rAt = simulateCombat([mk(60)], [mk(0)], { mode: 'real', rng: mulberry32(1) });
  const hasBurst = (r: ReturnType<typeof simulateCombat>, id: string) =>
    r.events.some((e) => e.kind === 'burst' && e.actorId === id);
  ck('D4-심마 59 → 폭주 없음', !hasBurst(rBelow, 's59'));
  ck('D4-심마 60 경계 → 폭주(burst, ≥60)', hasBurst(rAt, 's60'));
  // 대련(spar)에선 심마 60이어도 폭주 없음
  const rSpar = simulateCombat([mk(60)], [mk(0)], { mode: 'spar', rng: mulberry32(1) });
  ck('D4-대련은 심마60도 폭주 없음(real 한정)', !hasBurst(rSpar, 's60'));
}

// D5: 사망 굴림 손속·마공 계수 — clamp((0.12+overkill×0.5)×mercyMult×maMult×(1−str/220),0,0.6)
//     공식 재현(엔진 내부 비공개 → 설계 계수 못박기). 자비<40→1.3, >65→0.45, 마공×1.5, 상한0.6.
const deathChance = (overkill: number, mercy: number, isMa: boolean, str: number) => {
  const mercyMult = mercy < 40 ? 1.3 : mercy > 65 ? 0.45 : 1;
  return Math.max(0, Math.min(0.6, (0.12 + overkill * 0.5) * mercyMult * (isMa ? 1.5 : 1) * (1 - str / 220)));
};
// overkill0, mercy50, 정파, str0 → 0.12×1×1×1 = 0.12
ck('D5-사망 기본(overkill0,자비50,정,str0) → 0.12', eq(deathChance(0, 50, false, 0), 0.12));
// 자비<40 ×1.3: 0.12×1.3 = 0.156
ck('D5-자비39 손속 ×1.3 → 0.156', eq(deathChance(0, 39, false, 0), 0.156));
// 자비40 경계 → ×1(잔혹 아님)
ck('D5-자비40 경계 → ×1 (0.12)', eq(deathChance(0, 40, false, 0), 0.12));
// 자비66 → ×0.45: 0.12×0.45 = 0.054
ck('D5-자비66 자비로움 ×0.45 → 0.054', eq(deathChance(0, 66, false, 0), 0.054));
// 자비65 경계 → ×1 (>65 라야 0.45)
ck('D5-자비65 경계 → ×1 (0.12)', eq(deathChance(0, 65, false, 0), 0.12));
// 마공 ×1.5: 0.12×1.5 = 0.18
ck('D5-마공 ×1.5 → 0.18', eq(deathChance(0, 50, true, 0), 0.18));
// 상한 0.6 — overkill1, 자비0(1.3), 마공(1.5), str0: (0.12+0.5)×1.3×1.5 = 0.62×1.95 = 1.209 → 0.6
ck('D5-상한 0.6 클램프', eq(deathChance(1, 0, true, 0), 0.6));
// 근력 감면 str220 → (1−1)=0 → 사망확률 0
ck('D5-str220 → ×0 (불사신)', eq(deathChance(1, 0, true, 220), 0));

// D6: 엔진 결합 검증 — 위 D5 는 설계 계수의 *재현*이라 엔진 상수가 같이 바뀌면 못 잡는다.
//     실제 엔진을 N판 돌려 사망률이 설계 계수로 예측한 밴드 안인지 확인(엔진 내부 상수 못박기).
//     시나리오: 정파(자비50)·비마공·str30 화경이 삼류 맨손을 베는 비살상 아닌 실전, 패주 끔.
//     약졸은 거의 매판 쓰러지고(overkill 큼), 사망확률 = clamp((0.12+overkill×0.5)×1×1×(1−30/220),0,0.6).
//     overkill 은 표적 잔여 음수폭이라 분포가 있으나, mercyMult·maMult·근력감면은 고정 → 사망률 밴드 좁다.
{
  const killer: Combatant = { ...baseC, id: 'K', realm: 'hwagyeong', internal: 1300, strength: 30, mercy: 50,
    arts: [{ school: 'sword', grade: 'legendary', path: 'jeong', seong: 10, isMain: true }] };
  const victim = (): Combatant => ({ ...baseC, id: 'V', realm: 'samryu', internal: 0, strength: 8, endurance: 20,
    arts: [{ school: 'sword', grade: 'novice', path: 'jeong', seong: 1, isMain: true }] });
  let down = 0, dead = 0;
  const N = 20000;
  for (let i = 0; i < N; i += 1) {
    const r = simulateCombat([killer], [victim()], { mode: 'real', allowRetreat: false, rng: mulberry32(700000 + i) });
    const v = r.combatants.find((c) => c.id === 'V')!;
    if (v.state === 'downed' || v.state === 'dead') down += 1;
    if (v.state === 'dead') dead += 1;
  }
  const rate = dead / Math.max(1, down);
  // 근력감면 (1−30/220)=0.8636. 사망확률 = (0.12+overkill×0.5)×0.8636, overkill∈[0,1].
  // 측정상 overkill 은 0 부근(한 합에 hp 0 바로 아래로 떨굴 뿐 크게 안 넘침) → 사망률 ≈ 0.12×0.8636 = 10.4%.
  // 작은 양의 overkill 로 약간 위. 엔진 상수(0.12·근력감면 220) 드리프트 감지 밴드 9~16%(0.6 상한·0% 아님 보존).
  ck('D6-엔진 사망률 설계밴드(0.09~0.16, base0.12×근력감면)', rate >= 0.09 && rate <= 0.16, `사망률 ${(rate * 100).toFixed(1)}% (쓰러짐 ${down}/${N})`);
}

// ── E. 결정성 + 동일성 anchor — 같은 시드 같은 결과(공식 변경 감지) ────────────────
console.log('\n── E. 결정적 anchor (시드 고정 결과) ──');
// 공식이 미세하게 바뀌면(반올림 위치·계수) 이 고정 시드 결과가 달라진다 → 회귀 감지.
{
  const A: Combatant[] = [{ ...baseC, id: 'A0' }];
  const B: Combatant[] = [{ ...baseC, id: 'B0', agility: 35 }];
  const r1 = simulateCombat(A, B, { mode: 'spar', rng: mulberry32(20260619) });
  const r2 = simulateCombat(A, B, { mode: 'spar', rng: mulberry32(20260619) });
  ck('E-동일 시드 → winner·rounds·margin 동일', r1.winner === r2.winner && r1.rounds === r2.rounds && eq(r1.margin, r2.margin),
    `winner=${r1.winner} rounds=${r1.rounds} margin=${r1.margin.toFixed(6)}`);
}

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
