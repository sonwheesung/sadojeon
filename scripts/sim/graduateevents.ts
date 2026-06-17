// 졸업 동문 강호 사건 엔진 — docs/08. 실행: npx tsx scripts/sim/graduateevents.ts
// 레지스트리(충돌·노선갈등·의기투합·의거·소원·해후) + 복수(연쇄) + 관계 변화가 도는지 검증.
// 시나리오별로 매 반복 초기화 후 tickGraduateEvents 1회 → 사건 종류·상태·관계 변동 분포 확인.
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { tickGraduateEvents } from '../../src/systems/graduateEvents';
import type { RouteId } from '../../src/data/careers';
import type { GraduateStatus } from '../../src/stores/graduateStore';
import type { Disciple } from '../../src/types/disciple';
import type { RelationLevel } from '../../src/types';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

function reset(): void {
  useDiscipleStore.getState().reset();
  useGraduateStore.getState().reset();
  useInboxStore.getState().reset();
  useTimeStore.getState().reset();
  useSectStore.getState().setSect({ name: '시문', hanjaName: '試門', reputation: 10, resources: 1000, facilities: [] } as never);
}
function addGrad(id: string, name: string, route: RouteId, status: GraduateStatus = 'active', slainBy?: string): void {
  useDiscipleStore.getState().add({ id, name, status: 'graduated', relationships: {}, martialArts: [] } as unknown as Disciple);
  useGraduateStore.getState().add({ id, name, route, level: 1, title: '직책', power: 50, fame: 30, status, graduatedYear: 1, slainBy });
}
function rel(a: string, b: string, level: RelationLevel): void {
  useDiscipleStore.getState().setRelation(a, b, level);
  useDiscipleStore.getState().setRelation(b, a, level);
}
function newsHas(kw: string): boolean {
  return useInboxStore.getState().items.some((i) => (i.title ?? '').includes(kw) || (i.preview ?? '').includes(kw));
}
function statusOf(id: string): GraduateStatus | undefined {
  return useGraduateStore.getState().records.find((r) => r.id === id)?.status;
}
function relOf(a: string, b: string): RelationLevel | undefined {
  return useDiscipleStore.getState().disciples[a]?.relationships?.[b] as RelationLevel | undefined;
}

const N = 2000;
console.log(`═══ 졸업 동문 강호 사건 엔진 (표본 ${N}) ═══\n`);

// C1 충돌(은원) — 적대 쌍 → 충돌만 발동, 진 쪽 상태 변동.
{
  let clash = 0;
  let hurt = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous');
    addGrad('b', '을', 'righteous');
    rel('a', 'b', 'enemy');
    tickGraduateEvents();
    if (newsHas('은원')) clash += 1;
    if (statusOf('a') !== 'active' || statusOf('b') !== 'active') hurt += 1;
  }
  check('적대 쌍 → 충돌 발동', clash > N * 0.8, `${((clash / N) * 100).toFixed(0)}%`);
  check('충돌로 한쪽 상태 변동(부상/사망)', hurt > 0, `${((hurt / N) * 100).toFixed(0)}%`);
}

// C2 의거/의기투합 — 친한 정도(光) 쌍 → 관계 sworn 상승 + 사문 명성 가끔↑.
{
  let deedOrAlly = 0;
  let sworn = 0;
  let sectUp = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous'); // 같은 블록(orthodox) 정도 쌍 — 소원(블록 다를 때) 배제, 의거/의기투합만
    addGrad('b', '을', 'daoist');
    rel('a', 'b', 'friend');
    tickGraduateEvents();
    if (newsHas('의거') || newsHas('의기투합')) deedOrAlly += 1;
    if (relOf('a', 'b') === 'sworn') sworn += 1;
    if ((useSectStore.getState().sect?.reputation ?? 10) > 10) sectUp += 1;
  }
  check('친한 정도 쌍 → 의거/의기투합', deedOrAlly > N * 0.8, `${((deedOrAlly / N) * 100).toFixed(0)}%`);
  check('관계 friend→sworn 상승', sworn > N * 0.8, `${((sworn / N) * 100).toFixed(0)}%`);
  check('의거 시 사문 명성↑ 발생', sectUp > 0, `${((sectUp / N) * 100).toFixed(0)}%`);
}

// C3 소원 — 친하되 노선(블록) 다른 쌍 → 소원(관계 식음) 또는 의기투합 둘 다 가능.
{
  let estrange = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous'); // orthodox
    addGrad('b', '을', 'shadow'); //    unorthodox
    rel('a', 'b', 'friend');
    tickGraduateEvents();
    if (newsHas('소원') || relOf('a', 'b') === 'neutral') estrange += 1;
  }
  check('블록 다른 친구 → 소원 발생', estrange > 0, `${((estrange / N) * 100).toFixed(0)}%`);
}

// C4 노선 갈등 — 중립 관계 정파 vs 마도 → 이념 충돌(은원 싹틈).
{
  let bloc = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous'); // orthodox
    addGrad('b', '을', 'demonic'); //   demonic
    rel('a', 'b', 'neutral');
    tickGraduateEvents();
    if (newsHas('정사') || newsHas('충돌')) bloc += 1;
  }
  check('정파↔마도 중립 → 노선 갈등', bloc > N * 0.8, `${((bloc / N) * 100).toFixed(0)}%`);
}

// C5 복수(연쇄) — 죽은 동문의 친구가 가해자를 쫓는다. slainBy 소비.
{
  let vendetta = 0;
  let seedConsumed = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('k', '흑수', 'assassin'); //          가해자(생존)
    addGrad('d', '망자', 'righteous', 'dead', 'k'); // 죽은 동문(가해자=k)
    addGrad('v', '복수자', 'righteous'); //         망자의 벗
    rel('v', 'd', 'sworn'); // 복수자와 망자는 의형제
    tickGraduateEvents();
    if (newsHas('복수')) vendetta += 1;
    if (useGraduateStore.getState().records.find((r) => r.id === 'd')?.slainBy === undefined) seedConsumed += 1;
  }
  check('망자의 벗 → 복수 발동', vendetta > N * 0.8, `${((vendetta / N) * 100).toFixed(0)}%`);
  check('복수 후 slainBy 소비(반복 방지)', seedConsumed > N * 0.95, `${((seedConsumed / N) * 100).toFixed(0)}%`);
}

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
