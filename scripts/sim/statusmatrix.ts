// 상태이상 × 진형(1:1·1:多·多대多) × 경지 매트릭스 — docs/35·36. 실행: npx tsx scripts/sim/statusmatrix.ts
// 각 시나리오에서 A진영 전원에게 상태이상을 걸고 만전 대비 승률 변화를 본다.
// "상태이상이 진형·경지에 따라 전투에 어떻게 다르게 먹히는가"를 한 판에 확인. 측정 2026-06-13.
import { simulateCombat } from '../../src/systems/combat/engine';
import { makeNpcCombatant, type NpcArchetype } from '../../src/systems/combat/npc';
import type { Combatant } from '../../src/types/combat';
import type { Realm } from '../../src/types/realm';

const N = 10000;

const npc = (realm: Realm, archetype: NpcArchetype, i: number, quality = 0.5): Combatant =>
  makeNpcCombatant({ id: `n${i}`, name: `${archetype}${i}`, realm, archetype, quality });
const aff = (c: Combatant, over: Partial<Combatant>): Combatant => ({ ...c, ...over });

// 거는 상태이상 — A진영 전원에게. 상처는 위중(sev2)으로 통일(종류 결이 또렷이 갈리는 깊이).
const CONDS: { key: string; label: string; over: Partial<Combatant> }[] = [
  { key: 'base', label: '만전', over: {} },
  { key: 'wound', label: '외상 위중', over: { woundSeverity: 2, woundType: 'wound' } },
  { key: 'frost', label: '동상 위중', over: { woundSeverity: 2, woundType: 'frost' } },
  { key: 'poison', label: '중독 위중', over: { woundSeverity: 2, woundType: 'poison' } },
  { key: 'burn', label: '화상 위중', over: { woundSeverity: 2, woundType: 'burn' } },
  { key: 'inner', label: '내상 위중', over: { woundSeverity: 2, woundType: 'inner' } },
  { key: 'stam', label: '체력30%', over: { staminaFrac: 0.3 } },
  { key: 'simma', label: '심마폭주', over: { simma: 60 } },
];

interface Scn {
  label: string;
  // over 를 A진영 전원에게 적용해 전투원 배열을 만든다(매 판 새로 생성 — NPC jitter).
  a: (over: Partial<Combatant>) => Combatant[];
  b: () => Combatant[];
}

const SCENARIOS: Scn[] = [
  // ── 1:1 동급 거울 (경지별) ──
  { label: '1:1  삼류 거울', a: (o) => [aff(npc('samryu', 'bandit', 1), o)], b: () => [npc('samryu', 'bandit', 2)] },
  { label: '1:1  일류 거울', a: (o) => [aff(npc('ilryu', 'orthodox', 1), o)], b: () => [npc('ilryu', 'orthodox', 2)] },
  { label: '1:1  절정 거울', a: (o) => [aff(npc('jeoljeong', 'orthodox', 1, 0.7), o)], b: () => [npc('jeoljeong', 'orthodox', 2, 0.7)] },
  { label: '1:1  초절정 거울', a: (o) => [aff(npc('chojeoljeong', 'orthodox', 1, 0.7), o)], b: () => [npc('chojeoljeong', 'orthodox', 2, 0.7)] },
  // ── 1:多 (군계일학·무쌍 — 고수 한 명에게 상태이상) ──
  { label: '1:多  절정1 vs 일류3', a: (o) => [aff(npc('jeoljeong', 'orthodox', 1, 0.7), o)], b: () => [11, 12, 13].map((i) => npc('ilryu', 'orthodox', i)) },
  { label: '1:多  초절정1 vs 일류10', a: (o) => [aff(npc('chojeoljeong', 'orthodox', 1, 0.8), o)], b: () => Array.from({ length: 10 }, (_, i) => npc('ilryu', 'orthodox', 20 + i)) },
  { label: '1:多  화경1 vs 일류10', a: (o) => [aff(npc('hwagyeong', 'orthodox', 1, 1), o)], b: () => Array.from({ length: 10 }, (_, i) => npc('ilryu', 'orthodox', 40 + i)) },
  // ── 多대多 거울 (A진영 전원 상태이상) ──
  { label: '多대多 일류 3:3', a: (o) => [1, 2, 3].map((i) => aff(npc('ilryu', 'orthodox', i), o)), b: () => [11, 12, 13].map((i) => npc('ilryu', 'orthodox', i)) },
  { label: '多대多 일류 5:5', a: (o) => [1, 2, 3, 4, 5].map((i) => aff(npc('ilryu', 'orthodox', i), o)), b: () => [11, 12, 13, 14, 15].map((i) => npc('ilryu', 'orthodox', i)) },
];

function winRate(scn: Scn, over: Partial<Combatant>): { winA: number; rounds: number } {
  let winA = 0, rounds = 0;
  for (let i = 0; i < N; i += 1) {
    const r = simulateCombat(scn.a(over), scn.b(), { mode: 'real' });
    if (r.winner === 'A') winA += 1;
    rounds += r.rounds;
  }
  return { winA: (winA / N) * 100, rounds: rounds / N };
}

function runMatrix() {
  console.log(`═══ 상태이상 × 진형 × 경지 (실전, 판당 ${N}회, A진영에 상태이상) ═══`);
  console.log('  각 칸 = A 승률%(만전 대비 Δ). 만전은 절대값. 측정 2026-06-13.\n');

  const head = ['시나리오'.padEnd(20), ...CONDS.map((c) => c.label.padEnd(11))].join('');
  console.log(head);
  console.log('─'.repeat(head.length));

  for (const scn of SCENARIOS) {
    const base = winRate(scn, {}).winA;
    const cells = CONDS.map((c) => {
      if (c.key === 'base') return `${base.toFixed(0)}%`.padEnd(11);
      const w = winRate(scn, c.over).winA;
      const d = w - base;
      return `${w.toFixed(0)}%(${d >= 0 ? '+' : ''}${d.toFixed(0)})`.padEnd(11);
    });
    console.log([scn.label.padEnd(20), ...cells].join(''));
  }

  console.log('\n읽는 법: 만전 대비 Δ가 클수록 그 상태이상이 그 진형·경지에서 치명적.');
  console.log('동상=신법↓ / 중독·화상=합당 지속피해 / 내상=내공↓ / 외상=공세↓. 심도(위중 sev2) 고정.');
}

// ── 무쌍 한계 스트레스 — 화경/초절정 한 명이 *치명상*을 안고 일류 다수를 상대.
// "경지 격차 무쌍이 상태이상에 끝까지 끄떡없는가, 어디서 균열이 가는가" 확인.
function runStress() {
  console.log(`═══ 무쌍 한계 스트레스 — 고수 1명(치명상 sev1) vs 일류 다수 (판당 ${N}회) ═══\n`);
  const STRESS_CONDS: { label: string; over: Partial<Combatant> }[] = [
    { label: '만전', over: {} },
    { label: '외상 치명상', over: { woundSeverity: 1, woundType: 'wound' } },
    { label: '중독 치명상', over: { woundSeverity: 1, woundType: 'poison' } },
    { label: '동상 치명상', over: { woundSeverity: 1, woundType: 'frost' } },
    { label: '내상 치명상', over: { woundSeverity: 1, woundType: 'inner' } },
    { label: '체력20%', over: { staminaFrac: 0.2 } },
  ];
  const heroes: { label: string; realm: Realm; q: number }[] = [
    { label: '초절정', realm: 'chojeoljeong', q: 0.8 },
    { label: '화경', realm: 'hwagyeong', q: 1 },
  ];
  const counts = [10, 30, 100];
  const head = ['고수 / 일류 수'.padEnd(18), ...STRESS_CONDS.map((c) => c.label.padEnd(12))].join('');
  console.log(head);
  console.log('─'.repeat(head.length));
  for (const h of heroes) {
    for (const cnt of counts) {
      const scn: Scn = {
        label: `${h.label} 1 vs ${cnt}`,
        a: (o) => [aff(npc(h.realm, 'orthodox', 1, h.q), o)],
        b: () => Array.from({ length: cnt }, (_, i) => npc('ilryu', 'orthodox', 200 + i)),
      };
      const cells = STRESS_CONDS.map((c) => `${winRate(scn, c.over).winA.toFixed(0)}%`.padEnd(12));
      console.log([scn.label.padEnd(18), ...cells].join(''));
    }
  }
  console.log('\n읽는 법: 치명상을 안겨도 승률이 안 떨어지면 그 경지 격차는 상태이상으로 못 흔든다(무쌍).');
}

if (process.argv[2] === 'stress') runStress();
else runMatrix();
