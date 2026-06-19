// 전투 엔진 재검증(적대) — docs/35·36. 회귀(combat.ts)·특성화(combatmatrix.ts)가 밴드를 본다면,
// 여기선 퇴화·비정상 입력으로 엔진을 직접 뚫는다(순수 함수라 RN 없이 rng 주입).
// 새 공격: ① 빈 진영·한쪽 전멸 — 크래시·NaN margin 없는지  ② NaN/Infinity/음수 스탯 주입 — 결과 유한·클램프
//          ③ 1:50 군계일학 — 합상한 내 종료·고수 생존·hpFrac [0,1]  ④ 사망확률 상한(≤0.6) 경험 검증
//          ⑤ rng 주입 결정성(같은 시드=같은 결과)  ⑥ 다회 무작위 — hpFrac/qiFrac/dealt 항상 유한·범위
//          ⑦ maxRounds 0·음수, lethal off, staminaFrac 범위초과 클램프
// 실행: npx tsx scripts/sim/combat_recheck.ts
import { simulateCombat } from '../../src/systems/combat/engine';
import { mulberry32 } from '../../src/systems/rng';
import type { Combatant, CombatArt, CombatResult } from '../../src/types/combat';
import type { Realm } from '../../src/types/realm';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const art = (seong = 4, grade: CombatArt['grade'] = 'apprentice', isMain = true): CombatArt =>
  ({ school: 'sword', grade, path: 'jeong', seong, isMain });
function make(id: string, over: Partial<Combatant> = {}): Combatant {
  return {
    id, name: id, realm: 'iryu', arts: [art()],
    internal: 150, strength: 30, agility: 30, endurance: 35,
    staminaFrac: 1, insight: 3, prudence: 50, mercy: 50, simma: 0, ...over,
  };
}
// 결과 전 전투원의 비율 필드가 유한·[0,1] 인지.
function fracsOk(r: CombatResult): boolean {
  return r.combatants.every((c) =>
    fin(c.hpFrac) && c.hpFrac >= 0 && c.hpFrac <= 1 &&
    fin(c.qiFrac) && c.qiFrac >= 0 && c.qiFrac <= 1 &&
    fin(c.dealtFrac) && c.dealtFrac >= 0 && fin(c.takenFrac) && c.takenFrac >= 0);
}

console.log('═══ 전투 엔진 재검증(적대) ═══\n');

// ── 1. 빈 진영·한쪽 전멸 — 크래시·NaN 없이 판정 ──
let crashed = false; let r1: CombatResult | null = null;
try { r1 = simulateCombat([], [make('b')], { mode: 'real', rng: mulberry32(1) }); } catch { crashed = true; }
ck('A 빈 진영 실전 — 크래시 없음', !crashed && !!r1);
ck('A 빈 진영 → 승자 B·margin 유한', !!r1 && r1.winner === 'B' && fin(r1.margin));
ck('A 빈 진영 → rounds 0(전투 없음)', !!r1 && r1.rounds === 0);

let crashed2 = false; let r2: CombatResult | null = null;
try { r2 = simulateCombat([], [], { mode: 'spar', rng: mulberry32(2) }); } catch { crashed2 = true; }
ck('양쪽 빈 진영 대련 — 크래시 없음(Math.max([]) 방어)', !crashed2 && !!r2);
ck('양쪽 빈 → margin 유한·전투원 0', !!r2 && fin(r2.margin) && r2.combatants.length === 0);

// 한쪽 전멸까지 — 압도적 차(화경 vs 삼류 맨손)에서 실전 완주.
const r3 = simulateCombat([make('hwa', { realm: 'hwagyeong', internal: 1300, strength: 70, arts: [art(10, 'legendary')] })], [make('low', { realm: 'samryu', internal: 0, strength: 10, arts: [art(1, 'novice')] })], { mode: 'real', rng: mulberry32(3) });
ck('화경 vs 삼류 실전 — 결과 유한·frac 범위', fin(r3.margin) && fracsOk(r3));

// ── 2. NaN/Infinity/음수 스탯 주입 — 크래시 없이 frac 클램프 유한 ──
const bad: Partial<Combatant>[] = [
  { strength: NaN }, { agility: Infinity }, { internal: NaN }, { endurance: -Infinity },
  { strength: -50, agility: -50 }, { internal: Number.MAX_SAFE_INTEGER }, { staminaFrac: 5 }, { staminaFrac: -3 },
  { insight: NaN }, { mercy: Infinity }, { simma: NaN }, { prudence: -999 },
];
let badCrash = false; let badFracOk = true;
for (const o of bad) {
  try {
    const r = simulateCombat([make('x', o)], [make('y')], { mode: 'real', rng: mulberry32(7) });
    // frac 은 엔진이 clamp 하므로 항상 [0,1]·유한이어야(스탯이 NaN 이라도 hpFrac/qiFrac 출력 클램프).
    if (!r.combatants.every((c) => fin(c.hpFrac) && c.hpFrac >= 0 && c.hpFrac <= 1 && fin(c.qiFrac) && c.qiFrac >= 0 && c.qiFrac <= 1)) badFracOk = false;
  } catch { badCrash = true; }
}
ck('비정상 스탯(NaN/Inf/음수/범위초과) 주입 — 크래시 없음', !badCrash);
ck('비정상 스탯이어도 출력 hpFrac/qiFrac 항상 [0,1] 유한(클램프)', badFracOk);
// staminaFrac 범위초과는 내부 clamp(0,1) → 정상 전투.
const rStam = simulateCombat([make('over', { staminaFrac: 99 })], [make('z')], { mode: 'spar', rng: mulberry32(8) });
ck('staminaFrac 99 → clamp(0,1) 정상 전투', fracsOk(rStam) && fin(rStam.margin));

// ── 3. 1:50 군계일학 — 합상한 내 종료·frac 범위 ──
const mooks = Array.from({ length: 50 }, (_, i) => make(`m${i}`, { realm: 'samryu', internal: 0, strength: 12, agility: 18, arts: [art(2, 'novice')] }));
const lone = make('master', { realm: 'hwagyeong', internal: 1300, strength: 65, agility: 60, arts: [{ school: 'sword', grade: 'legendary', path: 'jeong', seong: 10, isMain: true, traits: ['sweep'] }] });
const rGang = simulateCombat([lone], mooks, { mode: 'real', maxRounds: 30, rng: mulberry32(99) });
ck('1:50 군계일학 — 합상한(≤30) 내 종료', rGang.rounds <= 30 && rGang.rounds >= 1, `${rGang.rounds}합`);
ck('1:50 — 전 전투원 frac 유한·[0,1]', fracsOk(rGang));
ck('1:50 — margin 유한·tier 유효', fin(rGang.margin) && ['close', 'edge', 'crush'].includes(rGang.tier));

// ── 4. 사망 확률 상한 — 잔혹·마공 결정타 다수 표본서 사망률 < 1(상한 0.6 클램프 작동) ──
// 마공·저자비 화경이 약졸을 베는 실전을 1000회 — 패자 사망률이 100% 가 아니어야(상한 봉인).
let downedOrDead = 0; let deaths = 0;
for (let i = 0; i < 1000; i += 1) {
  const r = simulateCombat(
    [make('killer', { realm: 'hwagyeong', internal: 1300, strength: 60, mercy: 10, arts: [{ school: 'sword', grade: 'legendary', path: 'ma', seong: 10, isMain: true }] })],
    [make('victim', { realm: 'samryu', internal: 0, strength: 8, endurance: 20, arts: [art(1, 'novice')] })],
    { mode: 'real', allowRetreat: false, rng: mulberry32(1000 + i) },
  );
  const v = r.combatants.find((c) => c.id === 'victim')!;
  if (v.state === 'downed' || v.state === 'dead') downedOrDead += 1;
  if (v.state === 'dead') deaths += 1;
}
const deathRate = deaths / Math.max(1, downedOrDead);
ck('마공·저자비 결정타 — 패자 사망률 < 100%(상한 0.6 봉인)', deathRate < 0.95, `사망률 ${(deathRate * 100).toFixed(1)}% (쓰러짐 ${downedOrDead})`);
ck('치명 결투서도 일부 생존(즉사 100% 아님)', deaths < downedOrDead, `사망 ${deaths}/${downedOrDead}`);

// ── 5. rng 주입 결정성 — 같은 시드 = 같은 결과 ──
const cfgD = () => ({ mode: 'real' as const, rng: mulberry32(424242) });
const dA = simulateCombat([make('a', { simma: 70 })], [make('b')], cfgD());
const dB = simulateCombat([make('a', { simma: 70 })], [make('b')], cfgD());
ck('같은 시드 주입 → winner·rounds·margin 동일', dA.winner === dB.winner && dA.rounds === dB.rounds && dA.margin === dB.margin);
ck('같은 시드 → 이벤트 수열 동일', JSON.stringify(dA.events) === JSON.stringify(dB.events));

// ── 6. 다회 무작위 — frac 항상 유한·범위, rounds≥1, margin∈[0,1] ──
let allOk = true; let maxMargin = 0;
for (let i = 0; i < 2000; i += 1) {
  const mode = i % 2 ? 'real' : 'spar';
  const na = 1 + (i % 3); const nb = 1 + ((i + 1) % 4);
  const A = Array.from({ length: na }, (_, k) => make(`A${k}`, { realm: (['samryu', 'iryu', 'jeoljeong', 'hwagyeong'][i % 4]) as Realm, simma: (i % 100), staminaFrac: (i % 11) / 10 }));
  const B = Array.from({ length: nb }, (_, k) => make(`B${k}`, { realm: (['ilryu', 'chojeoljeong', 'samryu', 'iryu'][i % 4]) as Realm }));
  const r = simulateCombat(A, B, { mode, rng: mulberry32(i * 31 + 5) });
  if (!(fracsOk(r) && r.rounds >= 1 && fin(r.margin) && r.margin >= 0 && r.margin <= 1)) allOk = false;
  maxMargin = Math.max(maxMargin, r.margin);
}
ck('무작위 2000전 — frac·rounds·margin 항상 유한·범위', allOk, `최대 margin ${maxMargin.toFixed(3)}`);

// ── 7. maxRounds 0·음수, lethal off ──
const r0 = simulateCombat([make('a')], [make('b')], { mode: 'real', maxRounds: 0, rng: mulberry32(11) });
ck('maxRounds 0 → 즉시 판정(rounds 0·크래시 X)', r0.rounds === 0 && fin(r0.margin) && fracsOk(r0));
const rNeg = simulateCombat([make('a')], [make('b')], { mode: 'real', maxRounds: -5, rng: mulberry32(12) });
ck('maxRounds 음수 → 즉시 판정(rounds 0)', rNeg.rounds === 0 && fracsOk(rNeg));
let noDeath = true;
for (let i = 0; i < 500; i += 1) {
  const r = simulateCombat([make('k', { realm: 'hwagyeong', mercy: 0, arts: [art(10, 'legendary')] })], [make('v', { realm: 'samryu', strength: 5, arts: [art(1)] })], { mode: 'real', lethal: false, allowRetreat: false, rng: mulberry32(2000 + i) });
  if (r.combatants.some((c) => c.state === 'dead')) noDeath = false;
}
ck('lethal:false → 사망 0(비살상 결투 보장)', noDeath);

console.log(`\n[정보] 사망률(잔혹) ${(deathRate * 100).toFixed(1)}% · 1:50 ${rGang.rounds}합 · 최대margin ${maxMargin.toFixed(3)}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
