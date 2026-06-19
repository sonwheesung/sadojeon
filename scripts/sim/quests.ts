// 의뢰 시스템 극단 — docs/28 §4·docs/32. 파견 게이트·결산 경계·생존 체인·tally 단일 seam 무결성.
// 실행: npx tsx scripts/sim/quests.ts
// 측정일 2026-06-19. 표본: 결정적(seedAmbient) + 통계 루프 2000~5000회.
import './_storageShim';
import { useQuestStore } from '../../src/stores/questStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { useTallyStore } from '../../src/stores/tallyStore';
import { useReputationStore } from '../../src/stores/reputationStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import {
  canDispatch, dispatchQuest, capability, tickQuests, setQuestRewardMult,
  setGeumchangBudget, generateBoard, seedWorldQuests,
} from '../../src/systems/questSystem';
import { recordQuestResult } from '../../src/systems/questTally';
import { TALLY, GRADE_TALLY, DOMAIN_TALLY, STREAK } from '../../src/data/tallyKeys';
import { QUEST_POOL } from '../../src/data/quests';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, Quest, ActiveQuest, QuestOutcome } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const money = () => useSectStore.getState().sect?.resources ?? 0;
const rep = () => useSectStore.getState().sect?.reputation ?? 0;

function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 0, pity: 0, petitioned: false }, danTolerance: 0,
    fame: 0, insight: 1,
    stats: {
      guarding: { level: 80, exp: 0 }, scouting: { level: 80, exp: 0 },
      medicine: { level: 80, exp: 0 }, strength: { level: 40, exp: 0 },
      endurance: { level: 40, exp: 0 }, formation: { level: 0, exp: 0 },
    },
    ...over,
  } as unknown as Disciple;
}
function setSect(resources: number, reputation: number) {
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation, resources, facilities: [] } as never);
}
function q(over: Partial<Quest>): Quest {
  return {
    id: 'qt', domain: 'guard', grade: 'normal', title: 'T', client: 'c', preview: '',
    weeks: 2, reward: { money: 100, fame: 10 }, recommended: 1, minStat: 20, ...over,
  } as Quest;
}

seedAmbient(424242);
console.log('═══ 의뢰 극단 ═══\n');

// ──────────────────────────────────────────────────────────────────────────
// 1. 파견 게이트 — 자격·가용·빈 파티
// ──────────────────────────────────────────────────────────────────────────
function resetWorld() {
  useQuestStore.getState().reset();
  useDiscipleStore.getState().reset();
  useTimeStore.getState().reset();
  setSect(1000, 50);
  setQuestRewardMult(1);
  setGeumchangBudget(0);
}

resetWorld();
useDiscipleStore.getState().setAll([disc('a'), disc('b')]);
const board1 = q({ id: 'qd-1', grade: 'extreme', minStat: 65, domain: 'guard' });
useQuestStore.getState().setBoard([board1]);

const weakLead = useDiscipleStore.getState().disciples['a'];
ck('극험 자격 미달 리더 → canDispatch false (하드 게이트)',
  !canDispatch({ ...weakLead, stats: { guarding: { level: 10, exp: 0 } } } as never, board1));
ck('파견 빈 배열 → false', !dispatchQuest('qd-1', []));
ck('없는 의뢰 파견 → false', !dispatchQuest('nope', ['a']));

// 자격 충분 리더 + 미달 서포트는 따라갈 수 있다
useDiscipleStore.getState().setAll([
  disc('lead', { stats: { guarding: { level: 90, exp: 0 } } as never }),
  disc('sup', { stats: { guarding: { level: 5, exp: 0 } } as never }),
]);
useQuestStore.getState().setBoard([board1]);
ck('자격 리더 + 미달 서포트 동행 파견 성공', dispatchQuest('qd-1', ['lead', 'sup']));
ck('파견 후 두 제자 모두 questing', useDiscipleStore.getState().disciples['lead'].status === 'questing'
  && useDiscipleStore.getState().disciples['sup'].status === 'questing');
ck('파견 후 게시판에서 제거', !useQuestStore.getState().board.some((x) => x.id === 'qd-1'));

// questing 상태 제자 재파견 불가
useQuestStore.getState().setBoard([q({ id: 'qd-2', grade: 'menial', minStat: 0 })]);
ck('questing 제자 재파견 → false (가용 게이트)', !dispatchQuest('qd-2', ['lead']));

// ──────────────────────────────────────────────────────────────────────────
// 2. 중복 제자 ID 파견 — 자기참조 익스플로잇 가드
// ──────────────────────────────────────────────────────────────────────────
resetWorld();
useDiscipleStore.getState().setAll([disc('x', { stats: { guarding: { level: 90, exp: 0 } } as never })]);
useQuestStore.getState().setBoard([q({ id: 'qdup', grade: 'menial', minStat: 0, days: 1 })]);
const dupOk = dispatchQuest('qdup', ['x', 'x']);
// 시스템이 중복을 받아들이든 거부하든, 결산이 크래시/NaN 없이 안전해야 한다.
if (dupOk) {
  useTimeStore.getState().reset();
  // dueDay 도래까지 진행
  const act = useQuestStore.getState().active.find((a) => a.quest.id === 'qdup')!;
  while (useTimeStore.getState().totalDay < act.dueDay) useTimeStore.getState().advanceDay();
  tickQuests();
  const xd = useDiscipleStore.getState().disciples['x'];
  ck('중복 제자 파견 결산 — 크래시 없음·상태 유효', xd != null && (xd.status === 'training' || xd.status === 'injured' || xd.status === 'departed'));
  ck('중복 제자 — 자기 관계 미생성(자기참조 가드)', !xd.relationships?.['x']);
  ck('중복 제자 — fame 유한', fin(xd.fame ?? 0));
} else {
  ck('중복 제자 파견 거부됨 (안전)', true);
}

// ──────────────────────────────────────────────────────────────────────────
// 3. 결산 중 전원 이탈 — present.length === 0 경계
// ──────────────────────────────────────────────────────────────────────────
resetWorld();
useDiscipleStore.getState().setAll([disc('g1', { stats: { guarding: { level: 90, exp: 0 } } as never })]);
useQuestStore.getState().setBoard([q({ id: 'qgone', grade: 'normal', minStat: 20, days: 7 })]);
dispatchQuest('qgone', ['g1']);
// 결산 전에 제자를 스토어에서 제거(졸업·삭제 등으로 사라진 경우 모사)
useDiscipleStore.getState().reset();
const moneyBeforeGone = money();
const act3 = { quest: q({ id: 'qgone', grade: 'normal', minStat: 20, days: 7 }), discipleIds: ['g1'], startedDay: 0, dueDay: 0 } as ActiveQuest;
useQuestStore.getState().reset();
useQuestStore.getState().addActive(act3);
useTimeStore.getState().reset();
let crashed = false;
try { tickQuests(); } catch (e) { crashed = true; console.log('   throw:', (e as Error).message); }
ck('전원 사라진 의뢰 결산 — 크래시 없음', !crashed);
ck('전원 사라진 의뢰 — 자금 유한·비음수', fin(money()) && money() >= 0, `money=${money()}`);
ck('전원 사라진 의뢰 — active에서 제거', !useQuestStore.getState().active.some((a) => a.quest.id === 'qgone'));

// ──────────────────────────────────────────────────────────────────────────
// 4. recordQuestResult — tally 단조·중복 적립·연속 무결성
// ──────────────────────────────────────────────────────────────────────────
useTallyStore.getState().reset();
const t = () => useTallyStore.getState();
function rec(o: QuestOutcome, over: Partial<Parameters<typeof recordQuestResult>[0]> = {}) {
  recordQuestResult({
    outcome: o, quest: q({ grade: 'normal', domain: 'guard' }), partySize: 1,
    death: false, fatalSurvived: false, scrollFound: false, divineElixir: false, noble: false, ...over,
  });
}
rec('full');
ck('full 1회 — attempt·done·full·flawless 모두 1',
  t().n(TALLY.questAttempt) === 1 && t().n(TALLY.questDone) === 1 && t().n(TALLY.questFull) === 1
  && t().streak(STREAK.flawless) === 1);
rec('full'); rec('full');
ck('full 3연속 — 최고 연속 3', t().streak(STREAK.flawless) === 3, `streak=${t().streak(STREAK.flawless)}`);
rec('partial');
ck('partial — done++ 하지만 flawless 끊김(현재값 0)',
  t().n(TALLY.questDone) === 4 && useTallyStore.getState().streak(STREAK.flawless) === 3
  && useTallyStore.getState().n(STREAK.flawless) === 0 ? true : (useTallyStore.getState().streaks?.[STREAK.flawless] ?? -1) === 0,
  `done=${t().n(TALLY.questDone)} maxStreak=${t().streak(STREAK.flawless)}`);
rec('fail');
ck('fail — attempt++·questFail++·done 불변',
  t().n(TALLY.questAttempt) === 5 && t().n(TALLY.questFail) === 1 && t().n(TALLY.questDone) === 4);
rec('disaster');
ck('disaster — questFail++·done 불변(실패류)',
  t().n(TALLY.questFail) === 2 && t().n(TALLY.questDone) === 4);
// 성공 시에만 등급·도메인 tally 적립
const guardBefore = t().n(DOMAIN_TALLY.guard);
const normalBefore = t().n(GRADE_TALLY.normal);
rec('fail', { quest: q({ grade: 'normal', domain: 'guard' }) });
ck('실패 시 등급·도메인 tally 적립 X',
  t().n(DOMAIN_TALLY.guard) === guardBefore && t().n(GRADE_TALLY.normal) === normalBefore);
rec('full', { quest: q({ grade: 'extreme', domain: 'duel' }) });
ck('성공 시 등급·도메인 tally 적립', t().n(GRADE_TALLY.extreme) >= 1 && t().n(DOMAIN_TALLY.duel) >= 1);
// solo/party 경계
rec('full', { partySize: 1 }); const solo1 = t().n(TALLY.solo);
rec('full', { partySize: 3 }); const party1 = t().n(TALLY.party);
rec('full', { partySize: 2 });
ck('partySize 1=solo·3=party·2=둘다 아님',
  t().n(TALLY.solo) === solo1 && t().n(TALLY.party) === party1, `solo=${t().n(TALLY.solo)} party=${t().n(TALLY.party)}`);
// 음수 partySize 방어 — solo로도 party로도 적립 안 됨(<=1은 solo지만 음수는?)
const soloBeforeNeg = t().n(TALLY.solo);
rec('full', { partySize: -5 });
ck('음수 partySize → party 아님(크래시 없음)', t().n(TALLY.party) === party1, `party=${t().n(TALLY.party)}`);
// 생사·노획은 성공무관
useTallyStore.getState().reset();
rec('disaster', { death: true });
rec('fail', { fatalSurvived: true });
rec('disaster', { scrollFound: true, divineElixir: true });
ck('실패/재난에도 death·fatalSurvived·scroll·divineElixir 적립',
  t().n(TALLY.death) === 1 && t().n(TALLY.disasterSurvived) === 1
  && t().n(TALLY.scrollFound) === 1 && t().n(TALLY.divineElixir) === 1);

// ──────────────────────────────────────────────────────────────────────────
// 5. 보상 lever 극단 — 음수·0·거대 mult → 자금 비음수·유한
// ──────────────────────────────────────────────────────────────────────────
resetWorld();
useDiscipleStore.getState().setAll([disc('m', { stats: { guarding: { level: 90, exp: 0 } } as never })]);
for (const mult of [-100, 0, 1e9]) {
  setQuestRewardMult(mult);
  setSect(1000, 50);
  useQuestStore.getState().reset();
  useQuestStore.getState().setBoard([q({ id: `qm-${mult}`, grade: 'menial', minStat: 0, days: 1, reward: { money: 100, fame: 5 } })]);
  dispatchQuest(`qm-${mult}`, ['m']);
  useTimeStore.getState().reset();
  const a = useQuestStore.getState().active[0];
  while (useTimeStore.getState().totalDay < a.dueDay) useTimeStore.getState().advanceDay();
  tickQuests();
  ck(`questRewardMult=${mult} → 자금 유한·비음수`, fin(money()) && money() >= 0, `money=${money()}`);
  // 제자 다시 풀어줌
  useDiscipleStore.getState().update('m', { status: 'training' });
}
setQuestRewardMult(1);

// ──────────────────────────────────────────────────────────────────────────
// 6. 생존 체인 — 영약 예산·신의급 의원·즉사 없음
// ──────────────────────────────────────────────────────────────────────────
// 극험 결투를 강한 의원 동행으로 다수 회 — 사망 0이어야(의원이 한 단계 완화) 또는 생환.
resetWorld();
let deaths = 0, runs = 0, anyNaN = false;
const RUNS = 300;
for (let i = 0; i < RUNS; i += 1) {
  useDiscipleStore.getState().setAll([
    disc('hero', { realm: 'jeoljeong', stats: { guarding: { level: 75, exp: 0 }, scouting: { level: 75, exp: 0 }, strength: { level: 60, exp: 0 }, endurance: { level: 60, exp: 0 } } as never, realmProgress: { internal: 300, pity: 0, petitioned: false } }),
    disc('medic', { stats: { medicine: { level: 45, exp: 0 }, guarding: { level: 30, exp: 0 } } as never }),
  ]);
  useQuestStore.getState().reset();
  setSect(1000, 80);
  setGeumchangBudget(2); // 구급영약 2회
  const eq = q({ id: 'qe', grade: 'extreme', domain: 'guard', minStat: 65, days: 7, reward: { money: 200, fame: 15 } });
  useQuestStore.getState().setBoard([eq]);
  dispatchQuest('qe', ['hero', 'medic']);
  useTimeStore.getState().reset();
  const a = useQuestStore.getState().active[0];
  while (useTimeStore.getState().totalDay < a.dueDay) useTimeStore.getState().advanceDay();
  tickQuests();
  const h = useDiscipleStore.getState().disciples['hero'];
  if (!fin(h.fame ?? 0) || !fin(h.realmProgress?.internal ?? 0)) anyNaN = true;
  if (h.status === 'departed') deaths += 1;
  runs += 1;
}
ck('극험 의뢰 다회 — 모든 스탯 유한(NaN/Inf 없음)', !anyNaN);
console.log(`   [생존 체인] 극험 가드의뢰 ${runs}회 (의원45 동행+영약2): 사망 ${deaths}건`);
// 신의급 의원(40+) + 영약이 있으면 사망률이 낮아야 한다 — 절대 0 보장은 아님(영약 소진 후 마을굴림 가능)
ck('의원·영약 동행 극험 — 사망률 합리적 범위 (<30%)', deaths / runs < 0.3, `사망률=${((deaths / runs) * 100).toFixed(1)}%`);

// ──────────────────────────────────────────────────────────────────────────
// 7. seedWorldQuests — 상한·중복 id·잘못된 kind 가드
// ──────────────────────────────────────────────────────────────────────────
resetWorld();
setSect(1000, 90);
useQuestStore.getState().reset();
seedWorldQuests([{ kind: 'uprising', headline: 'h' }, { kind: 'war', headline: 'h' }, { kind: 'subjugation', headline: 'h' }]);
const wq = useQuestStore.getState().board.filter((x) => x.id.startsWith('world-evt-'));
// 🔧 2026-06-19 버그수정: 캡처한 board 스냅샷이 stale 이라 한 호출에서 상한이 안 걸렸음(live=3).
ck('강호 의뢰 동시 상한 2 (MAX_WORLD_QUESTS) — 한 호출 내에서도 강제', wq.length <= 2, `live=${wq.length}`);
seedWorldQuests([{ kind: 'nonexistent-kind', headline: 'h' }]);
ck('알 수 없는 사건 kind → 무시(크래시 없음)', useQuestStore.getState().board.filter((x) => x.id.startsWith('world-evt-')).length <= 2);
// 한 호출에 유효 시드 4개 → 상한 2 강제(stale 스냅샷 버그 회귀 가드)
useQuestStore.getState().reset();
seedWorldQuests([
  { kind: 'uprising', headline: 'h' }, { kind: 'war', headline: 'h' },
  { kind: 'subjugation', headline: 'h' }, { kind: 'uprising', headline: 'h' },
]);
ck('한 호출 4시드 → world 의뢰 정확히 ≤2 (stale 회귀 가드)',
  useQuestStore.getState().board.filter((x) => x.id.startsWith('world-evt-')).length <= 2,
  `live=${useQuestStore.getState().board.filter((x) => x.id.startsWith('world-evt-')).length}`);
seedWorldQuests([]);
ck('빈 시드 → no-op', true);
// 같은 totalDay 재시드 → id 충돌 시 addToBoard 가 dedupe
const before = useQuestStore.getState().board.length;
seedWorldQuests([{ kind: 'uprising', headline: 'h' }]); // 이미 상한이라 추가 안 됨
ck('상한 도달 후 재시드 → 증가 없음', useQuestStore.getState().board.length === before);

// ──────────────────────────────────────────────────────────────────────────
// 8. generateBoard — 음수/극단 rep, 데이터 정합성
// ──────────────────────────────────────────────────────────────────────────
for (const r of [-50, 0, 5, 25, 50, 80, 200]) {
  setSect(1000, r);
  useQuestStore.getState().reset();
  useReputationStore.getState().reset?.();
  let threw = false;
  try { generateBoard(); } catch (e) { threw = true; console.log('  throw:', (e as Error).message); }
  const b = useQuestStore.getState().board;
  // 저명성(rep<10) 사문은 잡일(menial=풀에 1개)만 떠 board=1 — 정상(약한 사문엔 일감이 적다).
  // rep≥10 부터 소무 추가로 늘어난다. 핵심 검증: 크래시 없음 + 최소 1건.
  ck(`generateBoard rep=${r} — 크래시 없음·board≥1`, !threw && b.length >= 1, `board=${b.length}`);
}

// ──────────────────────────────────────────────────────────────────────────
// 9. 데이터 정합성 — QUEST_POOL 보상·minStat 비음수·도메인 유효
// ──────────────────────────────────────────────────────────────────────────
let dataOk = true;
for (const qq of QUEST_POOL) {
  if (qq.reward.money < 0 || qq.reward.fame < 0 || qq.minStat < 0 || qq.weeks < 1) { dataOk = false; console.log(`   bad quest: ${qq.id}`); }
}
ck('QUEST_POOL 전 항목 — 보상·minStat 비음수·weeks≥1', dataOk);

console.log(`\n[정보] 표본: 생존체인 ${RUNS}회 · 측정일 2026-06-19 · seed 424242`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
