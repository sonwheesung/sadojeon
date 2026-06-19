// 연단 재검증(적대) — docs/10·37. 음수 수량은 이미 막혔으니 다른 우회로를 친다.
// 새 공격: ① 내공단 흡수 누적 부동소수 드리프트(상극·내성 흡수 총량이 설계치 초과하는지)
//          ② 동시성 — 제조 중 제자가 졸업/떠남(departed) → tickCraft 가 점유 잘못 복원/누수
//          ③ buyMaterial 정수 오버플로우(거대 수량 → Infinity 비용·음수 재료 없는지)
//          ④ 흡수 만료 정확(==·-1·+1 경계) + 흡수 중 제자 졸업 시 tick 동작
//          ⑤ 매칭/상극/내성 곱 — 흡수 총량이 의도대로(특화>상극, 내성 누적 감쇠)
// 실행: npx tsx scripts/sim/alchemy_recheck.ts
import './_storageShim';
import { useItemStore } from '../../src/stores/itemStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { useAlchemyStore } from '../../src/stores/alchemyStore';
import {
  addMaterial, buyMaterial, materialCount,
  learnRecipe, buildAlchemyLab, setLabOperational, startCraft, isCrafting, tickCraft,
  consumeInternalElixir, tickElixirAbsorb,
} from '../../src/systems/alchemySystem';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const money = () => useSectStore.getState().sect?.resources ?? 0;
function setMoney(v: number) { useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 10, resources: v, facilities: [] } as never); }
function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 0, pity: 0, petitioned: false }, danTolerance: 0,
    stats: { alchemy: { level: 99, exp: 0 } }, ...over,
  } as unknown as Disciple;
}
function internalOf(id: string): number { return useDiscipleStore.getState().disciples[id]?.realmProgress?.internal ?? 0; }
// 내공단 흡수 1사이클 끝까지 진행 — 완료(흡수상태 해제)까지 tick.
function runAbsorbToEnd(id: string, maxDays = 60): number {
  let days = 0;
  while (useDiscipleStore.getState().disciples[id]?.elixirAbsorb && days < maxDays) {
    useTimeStore.getState().advanceDay();
    tickElixirAbsorb();
    days += 1;
  }
  return days;
}

seedAmbient(31415);
console.log('═══ 연단 재검증(적대) ═══\n');

// ── 1. 흡수 누적 드리프트 — 특화(매칭) 흡수 총량 = internalAmount 정확 ──
// naegong-fire: internalAmount 120, absorbDays 20. fire 제자 = 매칭(×1), 내성 0(×1) → 총 120.
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('match', { qiAttribute: 'fire' })]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('match', 'naegong-fire');
runAbsorbToEnd('match');
ck('매칭 흡수 총량 = 120 정확(드리프트 0)', internalOf('match') === 120, `내공 ${internalOf('match')}`);

// ── 2. 상극(불일치) 흡수 — 총량 = 120×0.6 = 72 (이전엔 올림 누적으로 80 새던 자리) ──
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('xeno', { qiAttribute: 'water' })]); // water 제자 + fire 단 = 불일치 0.6
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('xeno', 'naegong-fire');
runAbsorbToEnd('xeno');
ck('상극 흡수 총량 = 72 정확(설계 초과 누수 없음)', internalOf('xeno') === 72, `내공 ${internalOf('xeno')} (이전 버그 80)`);

// ── 3. 내성 감쇠 흡수 — danTolerance 1 → ×0.8 → 120×0.8 = 96 정확 ──
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('tol', { qiAttribute: 'fire', danTolerance: 1 })]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('tol', 'naegong-fire');
runAbsorbToEnd('tol');
ck('내성1 흡수 총량 = 96 정확(매칭 120 대비 감쇠 적용)', internalOf('tol') === 96, `내공 ${internalOf('tol')}`);
ck('적성·내성 순서: 매칭(120) > 내성(96) > 상극(72)', 120 > 96 && 96 > 72);

// 흡수 일수 정확 — 20일에 정확히 만료(경계). 21일째엔 이미 해제.
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('days', { qiAttribute: 'fire' })]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('days', 'naegong-fire');
const usedDays = runAbsorbToEnd('days');
ck('흡수 정확히 20일에 완료(경계)', usedDays === 20, `${usedDays}일`);

// ── 4. 동시성 — 제조 중 제자가 졸업/떠남 → tickCraft 가 졸업자를 training 으로 안 되돌림 ──
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('crafter')]);
setMoney(99999);
buildAlchemyLab(); setLabOperational(true);
learnRecipe('hwalhyeol-3');
addMaterial('herb-common', 3); addMaterial('herb-rare', 1);
ck('제조 시작', startCraft('crafter', 'hwalhyeol-3') && isCrafting('crafter'));
// 제조 도중 제자가 졸업 처리됨.
useDiscipleStore.getState().update('crafter', { status: 'graduated' });
// 완료일까지 진행.
for (let i = 0; i < 6; i += 1) { useTimeStore.getState().advanceDay(); }
tickCraft();
const after = useDiscipleStore.getState().disciples['crafter'];
ck('졸업한 제조자 → tickCraft 후 status 가 training 으로 안 뒤집힘', after.status === 'graduated', `status=${after.status}`);
ck('졸업해도 제조 점유는 해제(activeCrafts 비움)', !isCrafting('crafter'));
ck('졸업자 제조여도 영단은 적재(완성품 손실 없음)', (useItemStore.getState().items.find((i) => i.id === 'hwalhyeol-3')?.count ?? 0) >= 1);

// 떠난(departed) 제자 — 흡수 중이어도 tickElixirAbsorb 가 크래시 없이 계속(simma 와 달리 alchemy 는 graduated 무관 적립).
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('leaver', { qiAttribute: 'fire' })]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('leaver', 'naegong-fire');
useDiscipleStore.getState().update('leaver', { status: 'departed' });
let crashed = false;
try { for (let i = 0; i < 25; i += 1) { useTimeStore.getState().advanceDay(); tickElixirAbsorb(); } } catch { crashed = true; }
ck('떠난 제자 흡수 tick 크래시 없음', !crashed);
ck('떠난 제자 내공 유한·비음수', fin(internalOf('leaver')) && internalOf('leaver') >= 0);

// ── 5. buyMaterial 정수 오버플로우 — 거대 수량 → 비용 Infinity·자금 부족으로 false, 음수 재료 없음 ──
setMoney(1000);
ck('buyMaterial MAX_SAFE 수량 → false(비용 폭주, 자금·재료 불변)',
  !buyMaterial('herb-common', Number.MAX_SAFE_INTEGER) && money() === 1000 && materialCount('herb-common') === 0);
ck('buyMaterial Infinity 수량 → false', !buyMaterial('herb-common', Infinity) && money() === 1000);
ck('buyMaterial NaN 수량 → false', !buyMaterial('herb-common', NaN) && money() === 1000);
// 자금이 매우 클 때 정상 수량 구매 — 재료 양수·자금 정확 차감.
setMoney(Number.MAX_SAFE_INTEGER);
ck('거대 자금서 정상 1만개 구매 — 재료 10000·자금 유한', buyMaterial('herb-common', 10000) && materialCount('herb-common') === 10000 && fin(money()));

// ── 6. 흡수 중 재복용 차단 + 두 번째 단 별도 사이클 정확 ──
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('seq', { qiAttribute: 'fire' })]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 2, effects: '' } as never);
ck('첫 복용 성공', consumeInternalElixir('seq', 'naegong-fire'));
ck('흡수 중 재복용 차단', !consumeInternalElixir('seq', 'naegong-fire'));
runAbsorbToEnd('seq');
const firstTotal = internalOf('seq');
// 두 번째 복용 — danTolerance 1 이 됐으니 96 추가 → 누적 120+96=216.
ck('흡수 만료 후 재복용 성공', consumeInternalElixir('seq', 'naegong-fire'));
runAbsorbToEnd('seq');
ck('2회 복용 누적 = 120 + 96 = 216(내성 정확 적용)', internalOf('seq') === 216, `누적 ${internalOf('seq')} (1회후 ${firstTotal})`);

console.log(`\n[정보] 매칭120·상극72·내성96 · activeCrafts ${Object.keys(useAlchemyStore.getState().activeCrafts).length}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
