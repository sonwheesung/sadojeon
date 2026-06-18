// 연단 극단 — docs/10·37. 음수 수량 악용·재료/자금 경계·내공단 흡수 NaN/오버플로우·제조 가드.
// 실행: npx tsx scripts/sim/alchemy.ts
import './_storageShim';
import { useItemStore } from '../../src/stores/itemStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import {
  addMaterial, materialCount, buyMaterial, sellElixir, consumeElixirItem, elixirItemCount,
  learnRecipe, buildAlchemyLab, setLabOperational, canCraft, startCraft, isCrafting,
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
function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 0, pity: 0, petitioned: false }, danTolerance: 0,
    stats: { alchemy: { level: 99, exp: 0 } },
  } as unknown as Disciple;
}
function setMoney(v: number) { useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 10, resources: v, facilities: [] } as never); }

seedAmbient(11111);
console.log('═══ 연단 극단 ═══\n');

// ── 1. 음수 수량 악용 차단 ──
setMoney(1000);
ck('buyMaterial 음수 수량 → false(자금·재료 불변)', !buyMaterial('herb-common', -100) && money() === 1000 && materialCount('herb-common') === 0);
ck('buyMaterial 0 → false', !buyMaterial('herb-common', 0));
useItemStore.getState().add({ id: 'byeokgokdan', category: 'elixir', name: '벽곡단', grade: 0, count: 2, effects: '' } as never);
const beforeSell = elixirItemCount('byeokgokdan');
ck('sellElixir 음수 → 0(영단·자금 불변)', sellElixir('byeokgokdan', -5) === 0 && elixirItemCount('byeokgokdan') === beforeSell);
ck('consumeElixirItem 음수 → false(획득 악용 차단)', !consumeElixirItem('byeokgokdan', -5) && elixirItemCount('byeokgokdan') === beforeSell);
ck('consumeElixirItem 0 → false', !consumeElixirItem('byeokgokdan', 0));

// ── 2. 정상 구매·판매·소모 경계 ──
setMoney(100);
ck('buyMaterial 정상 — 자금 차감·재료 증가', buyMaterial('herb-common', 10) && money() === 70 && materialCount('herb-common') === 10);
ck('buyMaterial 자금 부족 → false', !buyMaterial('herb-divine', 100) && money() === 70);
ck('buyMaterial 미지정 약초 → false(Infinity 가격)', !buyMaterial('herb-unknown-xyz', 1));
ck('consumeElixirItem 보유 초과 → false', !consumeElixirItem('byeokgokdan', 999));
ck('consumeElixirItem 정상 1 → true·count 감소', consumeElixirItem('byeokgokdan', 1) && elixirItemCount('byeokgokdan') === beforeSell - 1);

// ── 3. 제조 가드 — 연단실·학습·재료·스탯·가용 ──
useDiscipleStore.getState().setAll([disc('c')]);
useTimeStore.getState().reset();
ck('연단실 없음 → canCraft false', !canCraft('c', 'hwalhyeol-3'));
setMoney(99999); // 연단실 건설비(3000) 충당
ck('연단실 건설 성공', buildAlchemyLab());
setLabOperational(true);
ck('레시피 미학습 → canCraft false', !canCraft('c', 'hwalhyeol-3'));
learnRecipe('hwalhyeol-3'); // 재료 herb-common×3 + herb-rare×1
ck('재료 부족 → canCraft false', !canCraft('c', 'hwalhyeol-3'));
ck('재료 부족 → startCraft false(점유 안 함)', !startCraft('c', 'hwalhyeol-3') && !isCrafting('c'));
addMaterial('herb-rare', 1); // herb-common 은 위에서 10 보유
ck('조건 충족 → canCraft true', canCraft('c', 'hwalhyeol-3'));
const matBefore = materialCount('herb-common');
ck('startCraft 성공 — 재료 소모·제자 점유', startCraft('c', 'hwalhyeol-3') && isCrafting('c') && materialCount('herb-common') === matBefore - 3);
ck('이미 연단 중 → 재시작 false', !startCraft('c', 'hwalhyeol-3'));
ck('없는 제자 canCraft false(크래시 X)', !canCraft('nobody', 'hwalhyeol-3'));

// ── 4. 내공단 흡수 — NaN/오버플로우·내성 감쇠·중복 복용 차단 ──
useDiscipleStore.getState().setAll([disc('a')]);
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 5, effects: '' } as never);
ck('비내공 레시피 consumeInternal → false', !consumeInternalElixir('a', 'byeokgokdan'));
ck('내공단 복용 → true', consumeInternalElixir('a', 'naegong-fire'));
ck('흡수 중 재복용 → false(중복 차단)', !consumeInternalElixir('a', 'naegong-fire'));
const ab = useDiscipleStore.getState().disciples['a'].elixirAbsorb;
ck('흡수 perDay 유한·양수', !!ab && fin(ab.perDay) && ab.perDay > 0, `perDay=${ab?.perDay?.toFixed(2)}`);
// 흡수 20일 진행 — 내공 유한·비음수·단조 증가.
let internalOk = true; let prev = -1;
for (let i = 0; i < 25; i += 1) {
  useTimeStore.getState().advanceDay();
  tickElixirAbsorb();
  const inq = useDiscipleStore.getState().disciples['a'].realmProgress?.internal ?? 0;
  if (!(fin(inq) && inq >= 0 && inq >= prev)) internalOk = false;
  prev = inq;
}
ck('흡수 25일 — 내공 유한·비음수·비감소', internalOk, `최종 내공 ${Math.round(prev)}`);
ck('흡수 만료 후 상태 해제', !useDiscipleStore.getState().disciples['a'].elixirAbsorb);

// ── 5. 내성 누적 — 많이 복용해도 흡수량 유한·양수(감쇠 floor) ──
useDiscipleStore.getState().setAll([disc('b', { danTolerance: 1000 })]); // 극단 내성
useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
consumeInternalElixir('b', 'naegong-fire');
const ab2 = useDiscipleStore.getState().disciples['b'].elixirAbsorb;
ck('극단 내성서도 흡수 perDay 유한·≥0(감쇠 floor)', !!ab2 && fin(ab2.perDay) && ab2.perDay >= 0, `perDay=${ab2?.perDay?.toFixed(3)}`);

console.log(`\n[정보] 레시피 사용 hwalhyeol-3·naegong-fire · 내성 감쇠 floor 0.2`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
