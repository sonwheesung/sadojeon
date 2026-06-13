// 전투 엔진 회귀 스위트 — docs/36. 실행: npx tsx scripts/sim/combat.ts
// 시나리오마다 기대 범위(band)와 비교해 PASS/WARN 출력 — 엔진·시트·카탈로그를 만진 뒤 돌려서
// 결이 깨졌는지 1분 안에 확인한다. 범위는 2026-06-11 캘리브레이션 측정값 기준(±여유).
import { simulateCombat } from '../../src/systems/combat/engine';
import { makeNpcCombatant } from '../../src/systems/combat/npc';
import type { Combatant, CombatArt } from '../../src/types/combat';

// 통계 룰(✅ 사용자 확정 2026-06-12, docs/36 §원칙): 통계는 최소 1만 판.
const N = 10000;

const art = (school: CombatArt['school'], seong = 4, grade: CombatArt['grade'] = 'apprentice', isMain = false): CombatArt =>
  ({ school, grade, path: 'jeong', seong, isMain });

const make = (id: string, over: Partial<Combatant> = {}): Combatant => ({
  id, name: id, realm: 'iryu',
  arts: [art('sword', 4, 'apprentice', true)],
  internal: 150, strength: 30, agility: 30, endurance: 35,
  staminaFrac: 1, insight: 3, prudence: 50, mercy: 50, simma: 0, ...over,
});

interface Scenario {
  label: string;
  a: () => Combatant[];
  b: () => Combatant[];
  mode: 'spar' | 'real';
  extra?: number;
  // 검사 항목: [지표, min, max]
  bands: [keyof Metrics, number, number][];
}
interface Metrics {
  winA: number; // %
  close: number; // %
  accident: number; // %
  death: number; // 사망 연인원/판 ×100
  rounds: number; // 평균 합
}

function measure(s: Scenario): Metrics {
  let winA = 0, close = 0, acc = 0, dead = 0, rounds = 0;
  for (let i = 0; i < N; i += 1) {
    const r = simulateCombat(s.a(), s.b(), { mode: s.mode, extraAccidentChance: s.extra ?? 0 });
    if (r.winner === 'A') winA += 1;
    if (r.tier === 'close') close += 1;
    if (r.accident) acc += 1;
    rounds += r.rounds;
    dead += r.combatants.filter((c) => c.state === 'dead').length;
  }
  return {
    winA: (winA / N) * 100,
    close: (close / N) * 100,
    accident: (acc / N) * 100,
    death: (dead / N) * 100,
    rounds: rounds / N,
  };
}

const npc = (realm: Parameters<typeof makeNpcCombatant>[0]['realm'], archetype: Parameters<typeof makeNpcCombatant>[0]['archetype'], i = 0) =>
  makeNpcCombatant({ id: `n${i}`, name: `${archetype}${i}`, realm, archetype });

const SCENARIOS: Scenario[] = [
  {
    label: '호각 1:1 대련', mode: 'spar',
    a: () => [make('a')], b: () => [make('b')],
    bands: [['winA', 43, 57], ['close', 45, 70], ['accident', 0.8, 3.5], ['rounds', 5, 9]],
  },
  {
    label: '같은 무공 성+1 (5vs4)', mode: 'spar',
    a: () => [make('a', { arts: [art('sword', 5, 'apprentice', true)] })], b: () => [make('b')],
    bands: [['winA', 78, 95]],
  },
  {
    label: '적대 대련 (사고 가산 0.1)', mode: 'spar', extra: 0.1,
    a: () => [make('a')], b: () => [make('b')],
    bands: [['accident', 8, 17]],
  },
  {
    label: '갈래 역할 — 보법 vs 도법(동위력)', mode: 'spar',
    a: () => [make('a', { arts: [art('sword', 4, 'apprentice', true), art('lightness')] })],
    b: () => [make('b', { arts: [art('sword', 4, 'apprentice', true), art('saber')] })],
    bands: [['winA', 66, 86]],
  },
  {
    label: '갈래 역할 — 외공 vs 도법(동위력)', mode: 'spar',
    a: () => [make('a', { arts: [art('sword', 4, 'apprentice', true), art('external')] })],
    b: () => [make('b', { arts: [art('sword', 4, 'apprentice', true), art('saber')] })],
    bands: [['winA', 55, 75]],
  },
  {
    label: '지친 몸(체력 30%)', mode: 'spar',
    a: () => [make('a', { staminaFrac: 0.3 })], b: () => [make('b')],
    bands: [['winA', 5, 25]],
  },
  {
    label: '호각 1:1 실전', mode: 'real',
    a: () => [make('a')], b: () => [make('b')],
    bands: [['winA', 43, 57], ['death', 5, 20], ['rounds', 8, 16]],
  },
  {
    label: '군계일학 — 절정 1 vs 삼류 3 실전', mode: 'real',
    a: () => [make('a', { realm: 'jeoljeong', internal: 600, strength: 50, arts: [art('sword', 7, 'master', true)] })],
    b: () => [1, 2, 3].map((i) => npc('samryu', 'bandit', i)),
    bands: [['winA', 96, 100]],
  },
  {
    label: '경지 벽 — 이류 1 vs 일류 살수 실전', mode: 'real',
    a: () => [make('a')], b: () => [npc('ilryu', 'assassin')],
    bands: [['winA', 0, 4]],
  },
  {
    label: '주력 선택 — 절품 vs 하품 주력(같은 키트)', mode: 'spar',
    a: () => [make('a', { arts: [art('sword', 7, 'grandmaster', true), art('saber', 4, 'novice')] })],
    b: () => [make('b', { arts: [art('sword', 7, 'grandmaster'), art('saber', 4, 'novice', true)] })],
    bands: [['winA', 42, 62]],
  },
  // ── n:n 무쌍 모델 (docs/35 §3-A, 2026-06-13) ──
  {
    label: 'n:n 거울 3:3 (공정)', mode: 'real',
    a: () => [1, 2, 3].map((i) => npc('ilryu', 'orthodox', i)),
    b: () => [11, 12, 13].map((i) => npc('ilryu', 'orthodox', i)),
    bands: [['winA', 43, 58]],
  },
  {
    label: 'n:n 수적 우위 3 vs 2', mode: 'real',
    a: () => [1, 2, 3].map((i) => npc('ilryu', 'orthodox', i)),
    b: () => [11, 12].map((i) => npc('ilryu', 'orthodox', i)),
    bands: [['winA', 90, 100]],
  },
  {
    // 영근 절정(q0.7)은 일류 셋을 감당하되 트레이드가 있는 진짜 싸움(군계일학 미적용 — 1경지차).
    label: '질vs양 절정 1 vs 일류 3', mode: 'real',
    a: () => [makeNpcCombatant({ id: 'a', name: '절정', realm: 'jeoljeong', archetype: 'orthodox', quality: 0.7 })],
    b: () => [11, 12, 13].map((i) => npc('ilryu', 'orthodox', i)),
    bands: [['winA', 60, 85]],
  },
  {
    // 정점 화경(q1.0)이 일류 100을 검기로 쓸어버린다(무쌍). 2경지+차 광역·잡졸·군계일학 전부 작동.
    label: '무쌍 화경 1 vs 일류 100', mode: 'real',
    a: () => [makeNpcCombatant({ id: 'a', name: '화경', realm: 'hwagyeong', archetype: 'orthodox', quality: 1 })],
    b: () => Array.from({ length: 100 }, (_, i) => npc('ilryu', 'orthodox', 100 + i)),
    bands: [['winA', 88, 100]],
  },
];

let warn = 0;
console.log(`═══ 전투 엔진 회귀 (판당 ${N}회) ═══`);
for (const s of SCENARIOS) {
  const m = measure(s);
  const checks = s.bands.map(([k, lo, hi]) => {
    const v = m[k];
    const ok = v >= lo && v <= hi;
    if (!ok) warn += 1;
    return `${ok ? '✓' : '⚠'} ${k}=${v.toFixed(1)}(${lo}~${hi})`;
  });
  console.log(`${checks.every((c) => c.startsWith('✓')) ? 'PASS' : 'WARN'}  ${s.label.padEnd(30)} ${checks.join('  ')}`);
}
console.log(warn === 0 ? '\n전부 기대 범위 안 — 전투 결 유지.' : `\n⚠ ${warn}개 지표가 범위 밖 — 의도한 변화인지 확인 후 docs/36 범위를 갱신할 것.`);
process.exitCode = warn === 0 ? 0 : 1;
