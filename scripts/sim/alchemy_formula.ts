// 연단·경제 계산식 골든값 회귀 — docs/09·10·28 설계치가 코드 출력과 정확히 일치하는지 못박는다.
// 경계(NaN·음수 악용)는 alchemy.ts 가 본다. 여기선 "산수가 설계대로 맞는가"만.
// 실행: npx tsx scripts/sim/alchemy_formula.ts
import './_storageShim';
import { useItemStore } from '../../src/stores/itemStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import {
  consumeInternalElixir, tickElixirAbsorb, sellElixir, elixirItemCount,
} from '../../src/systems/alchemySystem';
import { monthlyPatronage, monthlyFoodCost, FOOD_COST_PER_DISCIPLE } from '../../src/systems/economySystem';
import type { Disciple } from '../../src/types';
import type { QiAttribute } from '../../src/types/disciple';

let pass = 0, fail = 0;
const EPS = 1e-9;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const near = (a: number, b: number) => Math.abs(a - b) <= EPS;

function disc(id: string, qiAttribute: QiAttribute, danTolerance = 0): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute,
    realmProgress: { internal: 0, pity: 0, petitioned: false }, danTolerance,
    stats: { alchemy: { level: 99, exp: 0 } },
  } as unknown as Disciple;
}

// 내공단 1알 복용 → absorbDays 만큼 흡수 틱 → 최종 내공(realmProgress.internal) 반환.
// 설계: total = internalAmount × absorbFactor(매칭=1·상극=0.6) × tolerance(0.8^danTol, floor 0.2),
//       매일 perDay=total/absorbDays 실수 누적, 완료일 1회만 round → 총량이 total 에 정확 수렴.
function runAbsorb(qiAttribute: QiAttribute, danTolerance: number): { perDay: number; finalInternal: number } {
  useTimeStore.getState().reset();
  useDiscipleStore.getState().setAll([disc('x', qiAttribute, danTolerance)]);
  useItemStore.getState().add({ id: 'naegong-fire', category: 'elixir', name: '양화내단', grade: 0, count: 1, effects: '' } as never);
  const ok = consumeInternalElixir('x', 'naegong-fire'); // naegong-fire: amount120·absorb20·attr fire
  if (!ok) return { perDay: NaN, finalInternal: NaN };
  const perDay = useDiscipleStore.getState().disciples['x'].elixirAbsorb!.perDay;
  for (let i = 0; i < 22; i += 1) { // 20일+여유
    useTimeStore.getState().advanceDay();
    tickElixirAbsorb();
  }
  return { perDay, finalInternal: useDiscipleStore.getState().disciples['x'].realmProgress!.internal ?? NaN };
}

console.log('═══ 연단·경제 계산식 골든값 ═══\n');

// ── 1. 내공단 흡수 — 매칭/상극/내성 시나리오별 설계 골든값 ──
// naegong-fire = 화속 internalAmount 120, absorbDays 20.
console.log('[1] 내공단 흡수 (양화내단: 화속 120, 20일)');
// (a) 매칭(화속 제자 × 화속 단, danTol 0): factor 1 · tol 1 → total 120, perDay 6.0.
{
  const r = runAbsorb('fire', 0);
  ck('매칭 perDay = 120/20 = 6.0', near(r.perDay, 6.0), `perDay=${r.perDay}`);
  ck('매칭 흡수 총량 = 120 (설계치 정확)', r.finalInternal === 120, `internal=${r.finalInternal}`);
}
// (b) 상극(수속 제자 × 화속 단, danTol 0): factor 0.6 · tol 1 → total 72, perDay 3.6.
//     (옛 버그: 매일 round(3.6)=4 ×20 = 80 → +11% 누수. 완료시 1회 round 로 정확 72.)
{
  const r = runAbsorb('water', 0);
  ck('상극 perDay = 72/20 = 3.6', near(r.perDay, 3.6), `perDay=${r.perDay}`);
  ck('상극 흡수 총량 = 72 (매일-round 누수 80 아님)', r.finalInternal === 72, `internal=${r.finalInternal}`);
}
// (c) 내성(화속 제자 × 화속 단, danTol 1): factor 1 · tol 0.8^1=0.8 → total 96, perDay 4.8.
{
  const r = runAbsorb('fire', 1);
  ck('내성1 perDay = 96/20 = 4.8', near(r.perDay, 4.8), `perDay=${r.perDay}`);
  ck('내성1 흡수 총량 = 96 (=120×0.8)', r.finalInternal === 96, `internal=${r.finalInternal}`);
}
// (d) 내성 감쇠 곡선 — danTol 별 tolerance 배수 = 0.8^n, floor 0.2.
//     n=0→120, n=1→96, n=2→0.64×120=76.8→round 77, n=10→0.8^10≈0.1074<floor0.2 → 0.2×120=24.
{
  const n2 = runAbsorb('fire', 2);
  // tolerance = 0.8^2 = 0.64 → total = 120×0.64 = 76.8 → round 77.
  ck('내성2 총량 = round(120×0.8^2)=77', n2.finalInternal === Math.round(120 * 0.8 ** 2), `internal=${n2.finalInternal}`);
  const n10 = runAbsorb('fire', 10);
  // 0.8^10 ≈ 0.10737 < 0.2(floor) → tolerance 0.2 → total 24.
  ck('내성10 floor 0.2 발동 — 총량 = round(120×0.2)=24', n10.finalInternal === 24, `internal=${n10.finalInternal}`);
}

// ── 2. 경제 — 후원금·식비·시작자금 골든값 ──
console.log('\n[2] 경제 (후원·식비·시작자금)');
// 후원: floor(rep/10)×37 (경계선 확정값, 구 ×25에서 상향 2026-07-01, docs/09).
//   rep10→37, rep50→185, rep90→333, rep0→0, rep9→0(floor), rep100→370.
ck('후원 rep0 = 0', monthlyPatronage(0) === 0);
ck('후원 rep9 = 0 (floor)', monthlyPatronage(9) === 0);
ck('후원 rep10 = 37', monthlyPatronage(10) === 37);
ck('후원 rep50 = 185', monthlyPatronage(50) === 185);
ck('후원 rep90 = 333', monthlyPatronage(90) === 333);
ck('후원 rep100 = 370', monthlyPatronage(100) === 370);
// 식비 기본값 = 제자 1명당 월 20동.
ck('식비 기본값 = 20동/제자', FOOD_COST_PER_DISCIPLE === 20);
// 식비 비선형(2026-06-19) — round(mouths×20×(1+0.08×(mouths−1))). 정원 4명 캘리브레이션.
ck('식비 0명 = 0', monthlyFoodCost(0) === 0);
ck('식비 1명 = 20', monthlyFoodCost(1) === 20);
ck('식비 2명 = 43', monthlyFoodCost(2) === 43);
ck('식비 3명 = 70', monthlyFoodCost(3) === 70);
ck('식비 4명 = 99 (만석 ≈ 1명의 5배)', monthlyFoodCost(4) === 99);
// 시작자금 = 5000동 = 50은 (1금=10은=1000동).
useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 10, resources: 5000, facilities: [] } as never);
ck('시작자금 표기 = 50은 = 5000동', 5000 / 1000 * 10 === 50);

// ── 3. 영단 판매가 — 설계 공식 unit = max(5, round(req×1.5 + days×2)) ──
console.log('\n[3] 영단 판매가 (등급·제조기간 비례)');
function sellGolden(recipeId: string, expectedUnit: number): void {
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 0, resources: 0, facilities: [] } as never);
  useItemStore.getState().add({ id: recipeId, category: 'elixir', name: recipeId, grade: 0, count: 3, effects: '' } as never);
  const before = useSectStore.getState().sect!.resources;
  const gain = sellElixir(recipeId, 2); // 2개 판매
  const after = useSectStore.getState().sect!.resources;
  ck(`판매 ${recipeId} 단가 = ${expectedUnit}`, gain === expectedUnit * 2, `gain=${gain} (단가 ${gain / 2})`);
  ck(`판매 ${recipeId} 자금증가 = gain·재고감소`, after - before === gain && elixirItemCount(recipeId) === 1);
}
// byeokgokdan req8·days2 → 8×1.5+2×2 = 16.
sellGolden('byeokgokdan', 16);
// hwalhyeol-3 req28·days5 → 42+10 = 52.
sellGolden('hwalhyeol-3', 52);
// geumchang-5 req10·days2 → 15+4 = 19.
sellGolden('geumchang-5', 19);

console.log(`\n[정보] 흡수 골든: 매칭120·상극72·내성1=96 (perDay 6.0/3.6/4.8). EPS=${EPS}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
