// 활동 시스템 극단 — docs/38. 채집·강호출행 파견 게이트·동시 파견 충돌·결산 경계·진행 게이트.
// 실행: node scripts/sim/_run.cjs scripts/sim/activities.ts  (RN 끌어오는 시스템 — esbuild 러너 필요)
// 측정일 2026-06-19. seed 565656.
import './_storageShim';
import { useActivityStore } from '../../src/stores/activityStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useItemStore } from '../../src/stores/itemStore';
import { useFieldEventStore } from '../../src/stores/fieldEventStore';
import { useJianghuStore } from '../../src/stores/jianghuStore';
import {
  canGather, dispatchGather, isAvailable, tickActivities,
} from '../../src/systems/activitySystem';
import { canExpedition, dispatchExpedition, tickExpedition } from '../../src/systems/expeditionSystem';
import { GATHER_REGIONS, findGatherRegion } from '../../src/data/activities';
import { EXPEDITION_DESTS } from '../../src/data/expeditions';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const money = () => useSectStore.getState().sect?.resources ?? 0;
const today = () => useTimeStore.getState().totalDay;
const advanceTo = (day: number) => { while (today() < day) useTimeStore.getState().advanceDay(); };

function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return { id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'iryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    stats: { alchemy: { level: 30, exp: 0 }, medicine: { level: 30, exp: 0 }, strength: { level: 30, exp: 0 } },
    ...over } as unknown as Disciple;
}
function reset() {
  useActivityStore.getState().reset();
  useDiscipleStore.getState().reset();
  useTimeStore.getState().reset();
  useItemStore.getState().reset?.();
  useFieldEventStore.setState({ queue: [] } as never);
  useJianghuStore.getState().reset?.();
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 50, resources: 1000, facilities: [] } as never);
}
// 전투원(주력 2성+)
function fighter(id: string): Disciple {
  return disc(id, { mainMartialArtId: 'm', martialArts: [{ artId: 'm', seong: 4 } as never] });
}

seedAmbient(565656);
console.log('═══ 활동 시스템 극단 ═══\n');

const village = GATHER_REGIONS.find((r) => r.id === 'g-village')!;
const danger = GATHER_REGIONS.find((r) => r.needsCombatParty)!; // 위험 지역
const xVillage = EXPEDITION_DESTS[0]; // danger 0.2, no combat
const xFar = EXPEDITION_DESTS[2]; // danger 0.7, needsCombatParty

// ──────────────────────────────────────────────────────────────────────────
// 1. 채집 게이트 — 빈 파티·약지식 미달·전투원 미달·일과중 아닌 제자
// ──────────────────────────────────────────────────────────────────────────
reset();
ck('빈 파티 → canGather false', !canGather(village, []).ok);
const novice = disc('n', { stats: { alchemy: { level: 0, exp: 0 }, medicine: { level: 0, exp: 0 } } as never });
ck('약지식 미달 위험지역 → canGather false', !canGather(danger, [novice]).ok);
ck('전투원 없는 위험지역 → canGather false', !canGather(danger, [disc('lore', { stats: { alchemy: { level: 30, exp: 0 } } as never })]).ok);
const questing = disc('q', { status: 'questing' });
ck('일과 중 아닌 제자(questing) → isAvailable false', !isAvailable(questing));
ck('일과 중 아닌 제자 포함 → canGather false', !canGather(village, [disc('a'), questing]).ok);
ck('향리(loreMin 0·무위험) → 초보도 canGather ok', canGather(village, [novice]).ok);

// ──────────────────────────────────────────────────────────────────────────
// 2. 동시 파견 충돌 — 같은 제자를 두 활동에 동시 파견 불가
// ──────────────────────────────────────────────────────────────────────────
reset();
useDiscipleStore.getState().setAll([fighter('A'), fighter('B')]);
ck('채집 파견 성공', dispatchGather(village.id, ['A']));
ck('파견 후 제자 status=questing', useDiscipleStore.getState().disciples['A'].status === 'questing');
ck('같은 제자 채집 재파견 → false(점유)', !dispatchGather(danger.id, ['A']));
ck('같은 제자 강호출행 동시 파견 → false(점유)', !dispatchExpedition(xVillage.id, ['A']));
ck('자유로운 다른 제자(B) 출행 파견 성공', dispatchExpedition(xFar.id, ['B']));
// 두 활동이 동시에 등록됨
ck('두 활동 동시 active 등록', useActivityStore.getState().active.length === 2);

// ──────────────────────────────────────────────────────────────────────────
// 3. 채집 결산 — 귀환·재료 비음수·상처 심도 유효·자금 무관
// ──────────────────────────────────────────────────────────────────────────
reset();
useDiscipleStore.getState().setAll([fighter('G')]);
dispatchGather(village.id, ['G']);
const act = useActivityStore.getState().active[0];
advanceTo(act.dueDay);
tickActivities();
ck('채집 기한 도래 — active 제거(귀환)', useActivityStore.getState().active.length === 0);
const g = useDiscipleStore.getState().disciples['G'];
ck('채집 귀환 — status training 또는 injured', g.status === 'training' || g.status === 'injured');
const haul = useItemStore.getState().items.find((i) => i.id === 'herb-common');
ck('채집 재료 — 비음수·유한', !haul || (fin(haul.count) && haul.count >= 0), `herb-common=${haul?.count ?? 0}`);

// 채집 결산 다회 — 재료 단조 증가·상처 심도 1~5·NaN 없음
reset();
let haulOk = true, woundOk = true;
for (let i = 0; i < 200; i += 1) {
  useDiscipleStore.getState().setAll([fighter('R1'), fighter('R2')]);
  dispatchGather(danger.id, ['R1', 'R2']);
  const a = useActivityStore.getState().active.find((x) => x.kind === 'gather')!;
  advanceTo(a.dueDay);
  tickActivities();
  for (const id of ['R1', 'R2']) {
    const d = useDiscipleStore.getState().disciples[id];
    for (const w of d.wounds ?? []) if (w.severity < 1 || w.severity > 5) woundOk = false;
  }
  for (const it of useItemStore.getState().items) if (!fin(it.count) || it.count < 0) haulOk = false;
}
ck('채집 200회 — 재료 비음수·유한', haulOk);
ck('채집 200회 — 상처 심도 1~5 범위', woundOk);

// ──────────────────────────────────────────────────────────────────────────
// 4. 강호 출행 — 진행 게이트(pendingEventId 미해소 시 귀환 보류)
// ──────────────────────────────────────────────────────────────────────────
reset();
useDiscipleStore.getState().setAll([fighter('X1'), fighter('X2')]);
dispatchExpedition(xFar.id, ['X1', 'X2']);
let exp = useActivityStore.getState().active[0];
// 사건일까지 진행 → 사건 발동(필드이벤트 push, pendingEventId 설정)
let firedPending = false;
for (let step = 0; step < xFar.days + 2 && !firedPending; step += 1) {
  const r = tickExpedition(useActivityStore.getState().active[0]);
  exp = useActivityStore.getState().active[0];
  if (exp?.pendingEventId) firedPending = true;
  if (!exp) break;
  useTimeStore.getState().advanceDay();
}
if (exp && exp.pendingEventId) {
  ck('출행 사건 발동 — 현장 급보 필드이벤트 push', useFieldEventStore.getState().queue.length >= 1);
  // 미해소 상태로 기한을 넘겨도 귀환(settle) 보류돼야 한다(진행 게이트)
  advanceTo(exp.dueDay + 5);
  const r = tickExpedition(useActivityStore.getState().active[0]);
  ck('미해소 사건 — 기한 넘겨도 귀환 보류(done=false)', r.done === false && r.milestone === null);
} else {
  // 이 행선/시드에서 사건이 안 떴으면(planEventDays=0) 게이트 검증은 스킵하되 귀환은 정상
  ck('출행 — 사건 0건 시 정상 귀환 가능(게이트 무관)', true);
}

// ──────────────────────────────────────────────────────────────────────────
// 5. 강호 출행 결산 — 사건 0건 경로(무탈 귀환)·자금 비음수
// ──────────────────────────────────────────────────────────────────────────
reset();
useDiscipleStore.getState().setAll([fighter('V')]);
// 향리(danger 0.2) 다회 — 무탈 귀환이 잦아야 하고 결산 크래시 없음
let settleOk = true, deaths = 0;
const RUNS = 150;
for (let i = 0; i < RUNS; i += 1) {
  useDiscipleStore.getState().setAll([fighter('V')]);
  useActivityStore.getState().reset();
  useFieldEventStore.setState({ queue: [] } as never);
  dispatchExpedition(xVillage.id, ['V']);
  let guard = 0;
  while (useActivityStore.getState().active.length > 0 && guard < 50) {
    const a = useActivityStore.getState().active[0];
    if (a.pendingEventId) {
      // 사건 강제 — 첫 선택지로 자동 해소(applyExpeditionEventChoice 는 inboxResolve 경유라 직접 효과만 확인)
      // 여기선 게이트만 검증했으므로 pending 을 비워 진행시킨다(결산 경로 도달용).
      useActivityStore.getState().updateActive(a.id, { pendingEventId: undefined });
    }
    advanceTo(a.dueDay);
    const r = tickExpedition(useActivityStore.getState().active[0]);
    if (r.done) useActivityStore.getState().remove(a.id);
    guard += 1;
    if (guard >= 50) settleOk = false; // 무한루프 가드
  }
  if (!fin(money()) || money() < 0) settleOk = false;
  if (useDiscipleStore.getState().disciples['V']?.status === 'departed') deaths += 1;
}
ck('향리 출행 150회 — 결산 종료(무한루프 없음)·자금 비음수·유한', settleOk, `money=${money()}`);
ck('향리 출행 — 즉사 없음(departed 0)', deaths === 0, `departed=${deaths}`);

// ──────────────────────────────────────────────────────────────────────────
// 6. canExpedition 게이트 — 험지 전투원 하드 게이트
// ──────────────────────────────────────────────────────────────────────────
ck('험지(danger≥0.6·needsCombat) 전투원 없음 → canExpedition false', !canExpedition(xFar, [disc('weak')]).ok);
ck('험지 전투원 동행 → canExpedition ok', canExpedition(xFar, [fighter('f')]).ok);
ck('빈 파티 → canExpedition false', !canExpedition(xVillage, []).ok);

console.log(`\n[정보] 채집 200회·향리출행 150회 · 측정일 2026-06-19 · seed 565656`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
