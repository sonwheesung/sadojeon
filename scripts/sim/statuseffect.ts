// 상태이상 → 전투 영향 측정 스위트 — docs/35·36. 실행: npx tsx scripts/sim/statuseffect.ts
// 동일 베이스라인 둘을 1:1 실전으로 붙이되, A에게만 상태이상을 걸어 승률 변화를 잰다.
// "상태이상이 전투에 실제로 영향을 주는가"를 수치로 확인하는 회귀 스위트.
// 측정 기준: 2026-06-13. 통계 룰(docs/36): 판당 N=10000.
import { simulateCombat } from '../../src/systems/combat/engine';
import type { Combatant, CombatArt } from '../../src/types/combat';

const N = 10000;

const art = (school: CombatArt['school'], seong = 4, grade: CombatArt['grade'] = 'apprentice', isMain = false): CombatArt =>
  ({ school, grade, path: 'jeong', seong, isMain });

// 베이스라인 전투원 — 호각 1:1 (combat.ts 의 make 와 동일 세팅).
const make = (id: string, over: Partial<Combatant> = {}): Combatant => ({
  id, name: id, realm: 'iryu',
  arts: [art('sword', 4, 'apprentice', true)],
  internal: 150, strength: 30, agility: 30, endurance: 35,
  staminaFrac: 1, insight: 3, prudence: 50, mercy: 50, simma: 0, ...over,
});

// A 에게만 상태이상을 건 채 만전의 B 와 1:1 실전 N판 — A 승률·평균합·A 사망률.
function measure(over: Partial<Combatant>): { winA: number; rounds: number; deathA: number } {
  let winA = 0, rounds = 0, deathA = 0;
  for (let i = 0; i < N; i += 1) {
    const r = simulateCombat([make('a', over)], [make('b')], { mode: 'real' });
    if (r.winner === 'A') winA += 1;
    rounds += r.rounds;
    if (r.combatants.find((c) => c.side === 'A')?.state === 'dead') deathA += 1;
  }
  return { winA: (winA / N) * 100, rounds: rounds / N, deathA: (deathA / N) * 100 };
}

const row = (label: string, note: string, over: Partial<Combatant>) => {
  const m = measure(over);
  console.log(`  ${label.padEnd(18)} ${note.padEnd(22)} winA ${m.winA.toFixed(1).padStart(5)}%  사망A ${m.deathA.toFixed(1).padStart(4)}%  평균합 ${m.rounds.toFixed(1)}`);
};

console.log(`═══ 상태이상 → 전투 영향 (1:1 실전, 판당 ${N}회, 동일 베이스라인) ═══\n`);

console.log('[기준선]');
row('만전 (무상태)', '—', {});

// woundSeverity → atk ×(0.55 + 0.09·sev). sheet.ts:87. 심도만 본다(타입 무관).
console.log('\n[상처 심도 — 공세 ×(0.55+0.09·심도)]');
row('경미 sev5', 'atk×1.00', { woundSeverity: 5 });
row('가벼운 상처 sev4', 'atk×0.91', { woundSeverity: 4 });
row('중상 sev3', 'atk×0.82', { woundSeverity: 3 });
row('위중 sev2', 'atk×0.73', { woundSeverity: 2 });
row('치명상 sev1', 'atk×0.64', { woundSeverity: 1 });

// 속성별 상처 — 공통 공세 저하(심도)에 종류별 결을 얹는다. docs/35 §6-1b.
// 동상=신법↓ / 중독·화상=합마다 지속 피해 / 내상=내공 빨리 마름 / 외상=공세만.
console.log('\n[속성별 상처 — 같은 중상(sev3)이라도 종류별 결이 다르다]');
row('외상 sev3', '공세만(기준)', { woundSeverity: 3, woundType: 'wound' });
row('동상 sev3', '신법 -19%', { woundSeverity: 3, woundType: 'frost' });
row('중독 sev3', '합당 지속피해', { woundSeverity: 3, woundType: 'poison' });
row('화상 sev3', '합당 지속피해(약)', { woundSeverity: 3, woundType: 'burn' });
row('내상 sev3', '내공 소모 1.3배', { woundSeverity: 3, woundType: 'inner' });
console.log('  ── 치명상(sev1)일 때 종류별 결 (심도가 세기를 키운다) ──');
row('외상 sev1', '공세만', { woundSeverity: 1, woundType: 'wound' });
row('동상 sev1', '신법 -25%', { woundSeverity: 1, woundType: 'frost' });
row('중독 sev1', '합당 1.5% 지속', { woundSeverity: 1, woundType: 'poison' });
row('화상 sev1', '합당 1.0% 지속', { woundSeverity: 1, woundType: 'burn' });
row('내상 sev1', '내공 소모 1.6배', { woundSeverity: 1, woundType: 'inner' });

// staminaFrac → atk ×(0.7+0.3·frac) + 시작 내공 ×(0.6+0.4·frac). sheet.ts:86, engine.ts:148.
console.log('\n[체력 — 공세 ×(0.7+0.3·체력) + 시작 내공 ×(0.6+0.4·체력)]');
row('체력 100%', 'atk×1.00', { staminaFrac: 1.0 });
row('체력 80%', 'atk×0.94', { staminaFrac: 0.8 });
row('체력 60%', 'atk×0.88', { staminaFrac: 0.6 });
row('체력 40%', 'atk×0.82', { staminaFrac: 0.4 });
row('체력 20%', 'atk×0.76', { staminaFrac: 0.2 });

// simma ≥60 (실전) → burst: effAtk ×1.15, effDef ×0.85. engine.ts:83,86,152.
console.log('\n[심마 — 실전 폭주(심마≥60): 공세×1.15 방어×0.85]');
row('심마 0 (정상)', '폭주X', { simma: 0 });
row('심마 59 (직전)', '폭주X (임계 미만)', { simma: 59 });
row('심마 60 (폭주)', '공↑방↓ 트레이드', { simma: 60 });
row('심마 100 (폭주)', '60과 동일(임계제)', { simma: 100 });

console.log('\n측정 끝. 상처 심도·체력·심마(폭주) 반영 + 속성 종류별 결 차등(동상=신법↓·중독/화상=지속피해·내상=내공↓).');
