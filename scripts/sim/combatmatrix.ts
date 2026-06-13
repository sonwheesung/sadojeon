// 전투 엔진 종합 특성화 — 경지 풀 그리드 · 수적 우위 곡선 · 군계일학 · 트레이트 가치.
// 실행: npx tsx scripts/sim/combatmatrix.ts   (docs/35·36). 측정 2026-06-14.
// 회귀(combat.ts)가 "결이 안 깨졌나"라면, 이건 "엔진이 전반적으로 어떻게 행동하나"의 지도.
import { simulateCombat } from '../../src/systems/combat/engine';
import { makeNpcCombatant } from '../../src/systems/combat/npc';
import type { Combatant, CombatArt } from '../../src/types/combat';
import type { Realm } from '../../src/types/realm';
import type { MartialTrait } from '../../src/types/martialArt';

const N = 10000; //   1:1 셀
const N_NN = 4000; // 소규모 n:n
const N_BIG = 1500; // 대규모 n:n(화경 vs 다수)

const REALMS: { key: Realm; label: string }[] = [
  { key: 'samryu', label: '삼류' },
  { key: 'iryu', label: '이류' },
  { key: 'ilryu', label: '일류' },
  { key: 'jeoljeong', label: '절정' },
  { key: 'chojeoljeong', label: '초절정' },
  { key: 'hwagyeong', label: '화경' },
];

const npc = (realm: Realm, i: number, q = 0.5): Combatant =>
  makeNpcCombatant({ id: `n${realm}${i}`, name: `${realm}${i}`, realm, archetype: 'orthodox', quality: q });

function winA(a: () => Combatant[], b: () => Combatant[], n = N): number {
  let w = 0;
  for (let i = 0; i < n; i += 1) {
    if (simulateCombat(a(), b(), { mode: 'real' }).winner === 'A') w += 1;
  }
  return (w / n) * 100;
}

// ── 1. 경지 1:1 풀 그리드 — 행(A) vs 열(B), A 승률%. q0.5 동일. ──────────────────
console.log(`═══ 전투 엔진 종합 특성화 (실전) — 측정 2026-06-14 ═══`);
console.log(`\n[1] 경지 1:1 풀 그리드 — A(행) vs B(열) A승률%, q0.5 (판당 ${N})`);
console.log('      ' + REALMS.map((r) => r.label.padStart(6)).join(''));
for (const A of REALMS) {
  const row = REALMS.map((B) => {
    if (A.key === B.key) return '  ~50'; // 동급 거울(생략, ~50)
    const w = winA(() => [npc(A.key, 1)], () => [npc(B.key, 2)]);
    return `${w.toFixed(0)}`.padStart(6);
  });
  console.log(`  ${A.label.padEnd(4)}` + row.join(''));
}

// ── 2. 동급 수적 열세 — 1 vs N 동급(같은 경지). 1명이 동급 다수를 상대. ───────────
console.log(`\n[2] 동급 수적 — 1 vs N 동급(일류 기준) A승률% (판당 ${N_NN})`);
for (const cnt of [1, 2, 3, 5]) {
  const w = winA(
    () => [npc('ilryu', 1)],
    () => Array.from({ length: cnt }, (_, i) => npc('ilryu', 10 + i)),
    N_NN,
  );
  console.log(`  일류 1 vs 일류 ${cnt}: ${w.toFixed(0)}%`);
}

// ── 3. 군계일학 — 고수 1 vs N 일류. 경지 격차로 몇을 감당하나. ────────────────────
console.log(`\n[3] 군계일학 — 고수(q0.8) 1 vs N 일류 A승률%`);
for (const hero of [{ k: 'jeoljeong' as Realm, l: '절정' }, { k: 'chojeoljeong' as Realm, l: '초절정' }, { k: 'hwagyeong' as Realm, l: '화경' }]) {
  const cells = [3, 5, 10, 30, 100].map((cnt) => {
    const n = cnt >= 30 ? N_BIG : N_NN;
    const w = winA(
      () => [npc(hero.k, 1, 0.8)],
      () => Array.from({ length: cnt }, (_, i) => npc('ilryu', 200 + i)),
      n,
    );
    return `${cnt}명 ${w.toFixed(0)}%`;
  });
  console.log(`  ${hero.l.padEnd(4)} | ${cells.join(' · ')}`);
}

// ── 4. 트레이트 가치 — 동위력 1:1, A가 트레이트 보유 vs B 무특성. (광역은 1:1선 무의미 → 제외) ──
console.log(`\n[4] 트레이트 가치 — 동위력 일류 1:1, A 트레이트 vs B 무특성 A승률% (판당 ${N})`);
const art = (traits?: MartialTrait[]): CombatArt => ({ school: 'sword', grade: 'apprentice', path: 'jeong', seong: 5, isMain: true, traits: traits ?? [] });
const mk = (id: string, traits?: MartialTrait[]): Combatant => ({
  id, name: id, realm: 'ilryu', arts: [art(traits)],
  internal: 250, strength: 35, agility: 35, endurance: 38,
  staminaFrac: 1, insight: 3, prudence: 50, mercy: 50, simma: 0,
});
for (const [label, traits] of [
  ['쾌속(swift)', ['swift']],
  ['파공(pierce)', ['pierce']],
  ['호신(guard)', ['guard']],
  ['흡공(drain)', ['drain']],
  ['파공+쾌속', ['pierce', 'swift']],
] as [string, MartialTrait[]][]) {
  const w = winA(() => [mk('a', traits)], () => [mk('b')]);
  console.log(`  ${label.padEnd(14)} ${w.toFixed(0)}% (vs 무특성 50 기준)`);
}

console.log('\n끝. [1] 경지 격차의 벽 · [2] 동급 수적의 무게 · [3] 군계일학 한계 · [4] 트레이트 단독 가치.');
