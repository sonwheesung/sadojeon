// 엔진 통합 시뮬 — docs/08. 실행: npx tsx scripts/sim/integration.ts
// 격리 계약 시뮬과 달리 **월드 정세 + 졸업 직업 궤적 + 졸업 동문 사건 + 사부 개입**을
// 한 루프에서 함께 굴려, 엔진들이 조합돼도 문서(docs/08)대로 동작하는지 본다.
// 한 코호트 = 졸업 제자 8명(정/사·친/적 혼합)을 Y년간 강호에 풀어놓고, 매년:
//   ① 시간 전진 → 도달한 사부 전갈 판정  ② 정세 4계절 진행  ③ 졸업 궤적+동문 사건  ④ 어둠 노선에 호출
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore, type GraduateStatus } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useJianghuStore } from '../../src/stores/jianghuStore';
import { useOutreachStore } from '../../src/stores/outreachStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { seedWorldState, tickWorldState } from '../../src/systems/worldSystem';
import { tickCareers } from '../../src/systems/careerSystem';
import { sendSummon, tickMasterOutreach } from '../../src/systems/masterOutreachSystem';
import { ROUTE_BLOC, type RouteId } from '../../src/data/careers';
import type { Disciple } from '../../src/types/disciple';
import type { RelationLevel } from '../../src/types';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

const COHORT: { id: string; name: string; route: RouteId }[] = [
  { id: 'g1', name: '갑', route: 'righteous' },
  { id: 'g2', name: '을', route: 'righteous' },
  { id: 'g3', name: '병', route: 'healer' },
  { id: 'g4', name: '정', route: 'escort' },
  { id: 'g5', name: '무', route: 'assassin' },
  { id: 'g6', name: '기', route: 'demonic' },
  { id: 'g7', name: '경', route: 'shadow' },
  { id: 'g8', name: '신', route: 'vigilante' },
];
// 시작 관계 — 친밀(의거·소원 씨앗) + 적대(충돌·복수 씨앗).
const SEED_RELS: [string, string, RelationLevel][] = [
  ['g1', 'g2', 'friend'], // 같은 정파 친구 → 의거
  ['g1', 'g3', 'friend'], // 정파↔의원(블록 다름) → 소원 가능
  ['g5', 'g1', 'enemy'], // 살수↔정파 → 충돌·복수
  ['g6', 'g2', 'enemy'], // 마도↔정파 → 충돌
  ['g7', 'g8', 'friend'],
];

function reset(): void {
  useDiscipleStore.getState().reset();
  useGraduateStore.getState().reset();
  useInboxStore.getState().reset();
  useOutreachStore.getState().reset();
  useTimeStore.getState().reset();
  useTimeStore.setState({ totalDay: 0 });
  useSectStore.getState().setSect({ name: '시문', hanjaName: '試門', reputation: 10, resources: 1000, facilities: [] } as never);
  useJianghuStore.getState().setWorld(seedWorldState());
}
function seedCohort(): void {
  for (const c of COHORT) {
    useDiscipleStore.getState().add({ id: c.id, name: c.name, status: 'graduated', relationships: {}, martialArts: [], trustToMaster: 80 } as unknown as Disciple);
    useGraduateStore.getState().add({ id: c.id, name: c.name, route: c.route, level: 1, title: '직책', power: 45, fame: 25, status: 'active', graduatedYear: 1 });
  }
  for (const [a, b, lv] of SEED_RELS) {
    useDiscipleStore.getState().setRelation(a, b, lv);
    useDiscipleStore.getState().setRelation(b, a, lv);
  }
}
const recs = () => useGraduateStore.getState().records;
const isDark = (r: RouteId) => ROUTE_BLOC[r] === 'unorthodox' || ROUTE_BLOC[r] === 'demonic';
function newsCount(kw: string): number {
  return useInboxStore.getState().items.filter((i) => (i.title ?? '').includes(kw)).length;
}

const Y = 30; //  코호트당 연수
const R = 200; // 코호트 수

// 누적 집계
const kinds = { 은원: 0, 정사: 0, 의기투합: 0, 의거: 0, 소원: 0, 해후: 0, 복수: 0, 개심: 0, 승급: 0, 좌절: 0, 후원: 0, 비보: 0 };
let crashed = 0;
let startsLight = 0, startsDark = 0, deadLight = 0, deadDark = 0;
let convertedRuns = 0; // 어둠→정파 전환이 한 번이라도 일어난 코호트
let sponsoredGoldRuns = 0; // 후원 자금이 금고로 들어온 코호트
let relChangedRuns = 0; // 시작 관계가 바뀐 코호트
let worldFloorOk = 0; // 정통(정파) 세력 멸문 0 유지한 코호트

for (let r = 0; r < R; r += 1) {
  reset();
  seedCohort();
  const startGoldBase = 1000;
  const startDark = COHORT.filter((c) => isDark(c.route)).length;
  startsDark += startDark;
  startsLight += COHORT.length - startDark;

  try {
    let world = useJianghuStore.getState().world!;
    for (let y = 1; y <= Y; y += 1) {
      useTimeStore.setState({ totalDay: y * 336 });
      tickMasterOutreach(); // 작년에 보낸 전갈 도달 판정
      for (let s = 0; s < 4; s += 1) tickWorldState(world); // 정세 4계절
      useJianghuStore.getState().setWorld(world);
      tickCareers(); // 졸업 궤적 + 동문 사건(graduateEvents)
      // 어둠 노선 생존자에게 호출(개심 통합 경로) — pending 없을 때.
      for (const g of recs()) {
        if ((g.status === 'active' || g.status === 'injured') && isDark(g.route) && !useOutreachStore.getState().pending.some((m) => m.graduateId === g.id)) {
          sendSummon(g.id);
        }
      }
    }
  } catch (e) {
    crashed += 1;
    console.log('   ⚠ crash:', (e as Error).message);
    continue;
  }

  // 집계
  for (const k of Object.keys(kinds) as (keyof typeof kinds)[]) kinds[k] += newsCount(k);
  for (const c of COHORT) {
    const g = recs().find((x) => x.id === c.id)!;
    const dead = g.status === 'dead' || g.status === 'missing';
    if (isDark(c.route)) { if (dead) deadDark += 1; }
    else if (dead) deadLight += 1;
    // 어둠으로 시작했는데 정파로 바뀜 = 개심.
    if (isDark(c.route) && g.route === 'righteous') { convertedRuns += 1; break; }
  }
  if ((useSectStore.getState().sect?.resources ?? 0) > startGoldBase) sponsoredGoldRuns += 1;
  // 관계 변동
  const changed = SEED_RELS.some(([a, b, lv]) => (useDiscipleStore.getState().disciples[a]?.relationships?.[b] ?? lv) !== lv);
  if (changed) relChangedRuns += 1;
  // 정통 멸문 0 — 정파 세력치 floor 유지(0 초과).
  const w = useJianghuStore.getState().world;
  if (w && (w.powers.orthodox?.power ?? 0) > 0) worldFloorOk += 1;
}

console.log(`═══ 엔진 통합 시뮬 (코호트 ${R} × ${Y}년, 졸업 ${COHORT.length}명) ═══\n`);
console.log('  사건 누적(코호트 합):');
for (const [k, v] of Object.entries(kinds)) console.log(`    ${k.padEnd(6)} ${v}`);
console.log(`  사망률 — 어둠 ${((deadDark / startsDark) * 100).toFixed(0)}% (${deadDark}/${startsDark}) · 정도 ${((deadLight / startsLight) * 100).toFixed(0)}% (${deadLight}/${startsLight})`);
console.log('');

check('통합 루프 무크래시', crashed === 0, `crash ${crashed}/${R}`);
check('졸업 동문 사건 다종 발동(은원·의기투합/의거·소원·복수 ≥3종)',
  [kinds.은원 + kinds.정사, kinds.의기투합 + kinds.의거, kinds.소원, kinds.복수].filter((n) => n > 0).length >= 3,
  `은원 ${kinds.은원 + kinds.정사}·의 ${kinds.의기투합 + kinds.의거}·소원 ${kinds.소원}·복수 ${kinds.복수}`);
check('사부 개입↔커리어 통합 — 어둠 노선 개심 발생', convertedRuns > 0, `${convertedRuns}/${R} 코호트`);
check('커리어↔사문 통합 — 후원 자금 유입', sponsoredGoldRuns > 0, `${sponsoredGoldRuns}/${R} 코호트`);
check('관계 변화(졸업 시점 고정 아님)', relChangedRuns > R * 0.5, `${relChangedRuns}/${R} 코호트`);
check('어둠 노선 사망률 > 정도(docs/08 ROUTE_DANGER 결)', deadDark / startsDark > deadLight / startsLight,
  `${((deadDark / startsDark) * 100).toFixed(0)}% > ${((deadLight / startsLight) * 100).toFixed(0)}%`);
check('정통 멸문 0 — 정파 세력 floor 유지(통합 중)', worldFloorOk === R, `${worldFloorOk}/${R}`);
check('강호 풍문 다수 도달', kinds.승급 + kinds.은원 + kinds.후원 > R, `사건 서신 풍부`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
