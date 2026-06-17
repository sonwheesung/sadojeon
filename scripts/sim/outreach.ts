// 사부 개입(서신·호출) — docs/08. 실행: npx tsx scripts/sim/outreach.ts
// 발신→1계절 지연→수용/무시 판정·효과(명성·역량·개심·치유)가 도는지 검증.
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore, type GraduateStatus } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { useOutreachStore } from '../../src/stores/outreachStore';
import { canOutreach, pendingFor, sendLetter, sendSummon, tickMasterOutreach } from '../../src/systems/masterOutreachSystem';
import type { RouteId } from '../../src/data/careers';
import type { Disciple } from '../../src/types/disciple';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

const DUE = 84;
function reset(): void {
  useDiscipleStore.getState().reset();
  useGraduateStore.getState().reset();
  useInboxStore.getState().reset();
  useTimeStore.getState().reset();
  useOutreachStore.getState().reset();
  useTimeStore.setState({ totalDay: 0 });
}
function addGrad(id: string, name: string, route: RouteId, opts: { status?: GraduateStatus; trust?: number; power?: number; fame?: number } = {}): void {
  useDiscipleStore.getState().add({ id, name, status: 'graduated', relationships: {}, martialArts: [], trustToMaster: opts.trust ?? 60 } as unknown as Disciple);
  useGraduateStore.getState().add({ id, name, route, level: 2, title: '직책', power: opts.power ?? 50, fame: opts.fame ?? 30, status: opts.status ?? 'active', graduatedYear: 1 });
}
const grad = (id: string) => useGraduateStore.getState().records.find((r) => r.id === id);
function arrive(): void { useTimeStore.setState({ totalDay: DUE }); tickMasterOutreach(); }

const N = 2000;
console.log(`═══ 사부 개입(서신·호출) (표본 ${N}) ═══\n`);

// C1 발신·큐 — 한 번에 하나, 진행 중엔 추가 발신 차단.
{
  reset();
  addGrad('a', '갑', 'righteous');
  const sent = sendLetter('a', 'encourage');
  const queued = !!pendingFor('a');
  const blocked = canOutreach(grad('a')!).ok === false;
  const secondFails = sendLetter('a', 'advise') === false;
  check('서신 발신 → 큐 적재', sent && queued);
  check('진행 중 재발신 차단', blocked && secondFails);
}

// C2 도달 전 무동작.
{
  reset();
  addGrad('a', '갑', 'righteous');
  sendLetter('a', 'encourage');
  useTimeStore.setState({ totalDay: DUE - 1 });
  tickMasterOutreach();
  check('도달 전엔 판정 안 함', !!pendingFor('a'));
}

// C3 격려 도달 — 높은 신뢰면 대체로 수용 → 명성↑, 큐 비움.
{
  let famed = 0;
  let cleared = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous', { trust: 90, fame: 30 });
    sendLetter('a', 'encourage');
    arrive();
    if ((grad('a')?.fame ?? 0) > 30) famed += 1;
    if (!pendingFor('a')) cleared += 1;
  }
  check('격려 도달 → 명성↑(고신뢰)', famed > N * 0.8, `${((famed / N) * 100).toFixed(0)}%`);
  check('도달 후 큐 비움', cleared === N);
}

// C4 경고 → 어둠 노선 개심(정파 회귀) 발생.
{
  let converted = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'assassin', { trust: 90 });
    sendLetter('a', 'warn');
    arrive();
    if (grad('a')?.route === 'righteous') converted += 1;
  }
  check('경고 → 살수 개심(정파 회귀) 발생', converted > 0 && converted < N, `${((converted / N) * 100).toFixed(0)}%`);
}

// C5 호출 → 부상 제자 치유(응했을 때).
{
  let healed = 0;
  let came = 0;
  for (let i = 0; i < N; i += 1) {
    reset();
    addGrad('a', '갑', 'righteous', { status: 'injured', trust: 95 });
    sendSummon('a');
    arrive();
    const g = grad('a');
    if (g?.status === 'active') healed += 1;
    if (g?.status === 'active' || (g?.power ?? 0) > 50) came += 1;
  }
  check('호출 → 부상 치유 발생', healed > 0, `${((healed / N) * 100).toFixed(0)}%`);
  check('호출 응함 → 효과 적용', came > N * 0.5, `${((came / N) * 100).toFixed(0)}%`);
}

// C6 사망 제자엔 못 닿음.
{
  reset();
  addGrad('a', '갑', 'righteous', { status: 'dead' });
  check('사망 제자 발신 불가', canOutreach(grad('a')!).ok === false && sendLetter('a', 'encourage') === false);
}

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
