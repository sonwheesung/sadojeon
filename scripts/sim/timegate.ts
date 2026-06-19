// 시간 진행 + 진행 게이트 극단 — docs/12·37. timeStore 시간 math(단조·경계) + inbox prune·게이트 단일집합.
// 실행: npx tsx scripts/sim/timegate.ts  (timeStore·inboxStore 는 RN 무관 — tsx 직접)
// 측정일 2026-06-19.
import './_storageShim';
import { useTimeStore } from '../../src/stores/timeStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { DECISION_KINDS, isDecisionKind } from '../../src/types/inbox';
import { GAME } from '../../src/data/constants';
import type { InboxItem, InboxKind } from '../../src/types/inbox';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
const ts = () => useTimeStore.getState();
const ib = () => useInboxStore.getState();

console.log('═══ 시간 진행 + 진행 게이트 극단 ═══\n');

// ──────────────────────────────────────────────────────────────────────────
// 1. totalDay 단조 증가 — advanceDay 다회·연 경계·15년 완주
// ──────────────────────────────────────────────────────────────────────────
ts().reset();
ck('초기 totalDay 0', ts().totalDay === 0);
const DAYS_PER_YEAR = GAME.SEASONS_PER_YEAR * GAME.WEEKS_PER_SEASON * GAME.DAYS_PER_WEEK; // 4*12*7=336
let prev = ts().totalDay;
let mono = true, neg = false;
const TOTAL = DAYS_PER_YEAR * 15; // 15년 완주
for (let i = 0; i < TOTAL; i += 1) {
  ts().advanceDay();
  const td = ts().totalDay;
  if (td <= prev) mono = false; // 엄격 증가
  if (td < 0 || !fin(td)) neg = true;
  prev = td;
}
ck('15년(336일×15) advanceDay — totalDay 엄격 증가', mono);
ck('15년 advanceDay — totalDay 비음수·유한', !neg);
ck('15년 후 totalDay == 일수 합', ts().totalDay === TOTAL, `totalDay=${ts().totalDay} expect=${TOTAL}`);

// 연 경계 정확성 — 1년치 advance 후 year=2, season=spring, week=1, day=1
ts().reset();
for (let i = 0; i < DAYS_PER_YEAR; i += 1) ts().advanceDay();
const t = ts().current;
ck('정확히 1년치 진행 → year 2·봄·1주·1일', t.year === 2 && t.season === 'spring' && t.week === 1 && t.day === 1,
  `${t.year}/${t.season}/${t.week}/${t.day}`);

// advance(phase) 3회 == advanceDay 1회 (totalDay)
ts().reset();
ts().advance(); ts().advance(); ts().advance(); // morning→afternoon→evening→다음날 morning
const afterPhases = ts().totalDay;
ts().reset();
ts().advanceDay();
ck('phase 3회(아침·낮·저녁) == advanceDay 1회 (totalDay)', afterPhases === ts().totalDay, `phase=${afterPhases} day=${ts().totalDay}`);

// computeTotalDay 일관성 — setTime 으로 임의 시점 → totalDay 가 incremental 과 일치
ts().reset();
for (let i = 0; i < 100; i += 1) ts().advanceDay();
const incremental = ts().totalDay;
const snapshot = { ...ts().current };
ts().reset();
ts().setTime(snapshot);
ck('setTime → totalDay == incremental 도달값(일관성)', ts().totalDay === incremental, `set=${ts().totalDay} inc=${incremental}`);

// ──────────────────────────────────────────────────────────────────────────
// 2. 진행 게이트 — decisionPendingCount 가 미해소 결정형만 센다
// ──────────────────────────────────────────────────────────────────────────
function mkItem(id: string, kind: InboxKind, resolved = false): InboxItem {
  return { id, kind, title: id, preview: '', body: '', priority: 'normal', createdAtDay: 0, read: false, resolved } as InboxItem;
}
ib().reset();
ck('빈 서신함 — 게이트 0(진행 가능)', ib().decisionPendingCount() === 0);
ib().add(mkItem('r1', 'report')); // 정보성
ib().add(mkItem('n1', 'jianghu_news' as InboxKind)); // 정보성
ck('정보성만 있음 — 게이트 0(진행 가능)', ib().decisionPendingCount() === 0, `n=${ib().decisionPendingCount()}`);
ib().add(mkItem('e1', 'event')); // 결정형 미해소
ck('미해소 결정형 1건 — 게이트 1(진행 불가)', ib().decisionPendingCount() === 1);
ib().add(mkItem('m1', 'meeting_request'));
ib().add(mkItem('q1', 'quest_offer'));
ck('미해소 결정형 3건 — 게이트 3', ib().decisionPendingCount() === 3);
// 해소하면 게이트 감소
ib().markResolved('e1');
ck('결정형 1건 해소 → 게이트 2', ib().decisionPendingCount() === 2, `n=${ib().decisionPendingCount()}`);
// 전 DECISION_KINDS 가 게이트에 잡히는지(단일 집합)
ib().reset();
for (const k of DECISION_KINDS) ib().add(mkItem(`d-${k}`, k));
ck('모든 DECISION_KINDS 미해소 → 게이트 == DECISION_KINDS 수', ib().decisionPendingCount() === DECISION_KINDS.length,
  `n=${ib().decisionPendingCount()} kinds=${DECISION_KINDS.length}`);

// ──────────────────────────────────────────────────────────────────────────
// 3. prune — 미해소 결정형 절대 보존(게이트와 동일 집합), 정보성만 cap
// ──────────────────────────────────────────────────────────────────────────
ib().reset();
// 결정형 미해소 200건(cap 120 초과) — 단 하나도 안 잘려야 한다(소프트락 방지)
for (let i = 0; i < 200; i += 1) ib().add(mkItem(`dec-${i}`, DECISION_KINDS[i % DECISION_KINDS.length]));
ib().prune(120);
const decKept = ib().items.filter((it) => !it.resolved && isDecisionKind(it.kind)).length;
ck('미해소 결정형 200건 — prune(120) 후에도 전부 보존(소프트락 방지)', decKept === 200, `kept=${decKept}`);
ck('prune 후 게이트 == 보존 결정형 수(단일 집합 일치)', ib().decisionPendingCount() === decKept);

// 정보성 과적 — cap 까지만 남고 나머지 정리(미읽음이어도)
ib().reset();
for (let i = 0; i < 500; i += 1) ib().add(mkItem(`info-${i}`, 'report')); // 전부 정보성 미읽음
ib().prune(120);
ck('정보성 500건 — prune(120) 후 ≤120 (무한 누적 방지)', ib().items.length <= 120, `n=${ib().items.length}`);

// 혼합 — 결정형 보존 + 정보성 cap, 합이 cap 이상일 수 있으나 결정형은 안 잘림
ib().reset();
for (let i = 0; i < 150; i += 1) ib().add(mkItem(`mx-dec-${i}`, 'event'));
for (let i = 0; i < 500; i += 1) ib().add(mkItem(`mx-info-${i}`, 'report'));
ib().prune(120);
const mxDec = ib().items.filter((it) => it.kind === 'event' && !it.resolved).length;
const mxInfo = ib().items.filter((it) => it.kind === 'report').length;
ck('혼합 과적 — 결정형 150 전부 보존', mxDec === 150, `dec=${mxDec}`);
ck('혼합 과적 — 정보성은 cap 잔여분만(room=0이면 0)', mxInfo === Math.max(0, 120 - 150), `info=${mxInfo}`);

// ──────────────────────────────────────────────────────────────────────────
// 4. clearExpired — 만료분 제거·비만료 보존
// ──────────────────────────────────────────────────────────────────────────
ib().reset();
ib().add({ ...mkItem('exp1', 'report'), expiresAtDay: 5 } as InboxItem);
ib().add({ ...mkItem('exp2', 'report'), expiresAtDay: 20 } as InboxItem);
ib().add(mkItem('noexp', 'event')); // 만료 없음
ib().clearExpired(10); // 오늘 10일 — exp1(5) 만료, exp2(20) 생존
ck('clearExpired(10) — 만료(expiresAtDay<10) 제거', !ib().items.some((it) => it.id === 'exp1'));
ck('clearExpired — 미만료 보존', ib().items.some((it) => it.id === 'exp2'));
ck('clearExpired — 만료필드 없는 항목 보존', ib().items.some((it) => it.id === 'noexp'));

console.log(`\n[정보] 15년=${TOTAL}일 진행·prune 과적 200/500/650건 · 측정일 2026-06-19`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
