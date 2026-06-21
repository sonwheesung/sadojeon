// 동문 야망 충돌 — docs/19·33 §4. 발화 게이트(활동·출도전기·야망60+·상호친밀·미발화)·중복차단·
// 4분기 해소 효과(관계 전이·인격·신뢰·집계·발화 마커)·해소 선택지·크래시 안전을 헤드리스로 검증.
// 실행: npx tsx scripts/sim/ambition.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useTallyStore } from '../../src/stores/tallyStore';
import { useTimeStore } from '../../src/stores/timeStore';
import {
  triggerAmbitionConflict,
  resolveAmbitionConflict,
  ambitionChoices,
} from '../../src/systems/ambitionConflictSystem';
import { MIND_TALLY } from '../../src/data/tallyKeys';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, RelationLevel } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const LEVEL_SET = new Set<string>(['enemy', 'distant', 'neutral', 'friend', 'sworn']);

function disc(id: string, ambition: number, status: Disciple['status'] = 'training'): Disciple {
  return {
    id, name: id, status, relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, darknessRisk: 'low', trustToMaster: 50, stress: 0,
    age: 10, entryYear: 1,
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition },
  } as unknown as Disciple;
}
// 상호 친밀(서로 friend)로 a↔b 세팅.
function pairClose(a: string, b: string, lv: RelationLevel = 'friend'): void {
  const ds = useDiscipleStore.getState();
  ds.setRelation(a, b, lv); ds.setRelation(b, a, lv);
}
function inboxConflicts(): number {
  return useInboxStore.getState().items.filter(
    (i) => !i.resolved && (i.payload as { domain?: string } | undefined)?.domain === 'ambition_conflict',
  ).length;
}
function clearInbox(): void { useInboxStore.setState({ items: [] } as never); }
function allRelationsValid(): boolean {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    for (const lv of Object.values(ds.disciples[id]?.relationships ?? {})) {
      if (!LEVEL_SET.has(lv as string)) return false;
    }
  }
  return true;
}
// 출도전기 진입(양육 14년차) — year 15, entryYear 1 → raised 14.
function setupPair(ambA = 70, ambB = 70): void {
  clearInbox();
  useDiscipleStore.getState().setAll([disc('a', ambA), disc('b', ambB)]);
  pairClose('a', 'b');
}

seedAmbient(20260621);
useTimeStore.getState().setTime({ year: 15, season: 'spring', week: 1, day: 1, phase: 'morning' });
console.log('═══ 동문 야망 충돌 (발화·중복차단·4분기·선택지) ═══\n');

// ── 1. 발화 게이트 ──
setupPair();
triggerAmbitionConflict();
ck('정상 조건(활동·14년차·야망70·상호친밀) — 결정 1건 발화', inboxConflicts() === 1);

// 중복 차단 — 미해소 중엔 또 안 띄움.
triggerAmbitionConflict(); triggerAmbitionConflict();
ck('미해소 중 재트리거 — 중복 발화 없음(1건 유지)', inboxConflicts() === 1);

// 야망 미달.
setupPair(50, 70); triggerAmbitionConflict();
ck('한쪽 야망<60 — 발화 없음', inboxConflicts() === 0);

// 상호 친밀 아님(한쪽만 친밀).
clearInbox();
useDiscipleStore.getState().setAll([disc('a', 70), disc('b', 70)]);
useDiscipleStore.getState().setRelation('a', 'b', 'friend'); // b->a 는 neutral
triggerAmbitionConflict();
ck('상호 친밀 아님(한쪽만) — 발화 없음', inboxConflicts() === 0);

// 한쪽 비활동(의뢰 중).
clearInbox();
useDiscipleStore.getState().setAll([disc('a', 70), disc('b', 70, 'questing')]);
pairClose('a', 'b'); triggerAmbitionConflict();
ck('한쪽 활동 아님(questing) — 발화 없음', inboxConflicts() === 0);

// 출도전기 미도달(year 10 → raised 9).
clearInbox();
useTimeStore.getState().setTime({ year: 10, season: 'spring', week: 1, day: 1, phase: 'morning' });
setupPair(); triggerAmbitionConflict();
ck('출도전기 미도달(9년차) — 발화 없음', inboxConflicts() === 0);
useTimeStore.getState().setTime({ year: 15, season: 'spring', week: 1, day: 1, phase: 'morning' });

// 이미 발화(ambitionRivalry 마커).
clearInbox();
useDiscipleStore.getState().setAll([disc('a', 70), disc('b', 70)]);
pairClose('a', 'b');
useDiscipleStore.getState().update('a', { ambitionRivalry: { withId: 'b', outcome: 'defer' } });
triggerAmbitionConflict();
ck('이미 발화한 제자 — 재발화 없음(회차 1회)', inboxConflicts() === 0);

// ── 2. 발화 항목 payload + 해소 선택지 ──
// (inboxResolve 의 isRespondable/responseOptionsFor 배선은 tsc + 화면 테스트가 검증 — 헤드리스에선
//  react-native 전이 import 라 직접 호출 불가. 여기선 발화 payload 형태와 선택지 데이터를 본다.)
setupPair(); triggerAmbitionConflict();
const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string }).domain === 'ambition_conflict');
const ip = (item?.payload ?? {}) as Record<string, unknown>;
ck('발화 항목 kind=event(결정형 게이트)', item?.kind === 'event');
ck('발화 payload — aId·bId·aName·bName 구비', ip.aId === 'a' && ip.bId === 'b' && ip.aName === 'a' && ip.bName === 'b');
const opts = ambitionChoices('갑', '을');
ck('해소 선택지 4종(양보·동맹·격려·무관심)', opts.length === 4 && opts.map((o) => o.key).join(',') === 'defer,ally,challenge,ignore');
ck('ambitionChoices 라벨 채워짐', opts.every((c) => c.label.length > 0));

// ── 3. 4분기 해소 효과 ──
const tally = useTallyStore.getState();
// A 양보 — 야망 낮은 쪽이 물러섬(야망↓), 신뢰↑, 관계 불변, 마커·집계.
setupPair(80, 60); // b(60)가 deferrer
const t0 = tally.n(MIND_TALLY.ambitionConflict), d0 = tally.n(MIND_TALLY.ambitionDefer);
const bAmb0 = useDiscipleStore.getState().disciples['b'].personality.ambition;
const aTrust0 = useDiscipleStore.getState().disciples['a'].trustToMaster;
resolveAmbitionConflict('a', 'b', 'defer');
{
  const ds = useDiscipleStore.getState();
  ck('A양보 — deferrer(b) 야망 감소', ds.disciples['b'].personality.ambition < bAmb0, `${bAmb0}→${ds.disciples['b'].personality.ambition}`);
  ck('A양보 — 신뢰 상승(a)', ds.disciples['a'].trustToMaster > aTrust0);
  ck('A양보 — 관계 불변(친밀 유지)', ds.disciples['a'].relationships['b'] === 'friend');
  ck('A양보 — 마커 양쪽 기록', ds.disciples['a'].ambitionRivalry?.outcome === 'defer' && ds.disciples['b'].ambitionRivalry?.withId === 'a');
  ck('A양보 — 집계(충돌+양보)', tally.n(MIND_TALLY.ambitionConflict) === t0 + 1 && tally.n(MIND_TALLY.ambitionDefer) === d0 + 1);
}

// B 동맹 — 관계 한 단계↑(친밀→의형제), 신뢰 크게↑.
setupPair();
const aTrustB0 = useDiscipleStore.getState().disciples['a'].trustToMaster;
resolveAmbitionConflict('a', 'b', 'ally');
{
  const ds = useDiscipleStore.getState();
  ck('B동맹 — 관계 한 단계↑(friend→sworn)', ds.disciples['a'].relationships['b'] === 'sworn' && ds.disciples['b'].relationships['a'] === 'sworn');
  ck('B동맹 — 신뢰 +8', ds.disciples['a'].trustToMaster === aTrustB0 + 8);
  ck('B동맹 — 집계(동맹)', tally.n(MIND_TALLY.ambitionAlly) >= 1);
}

// C 격려 — 관계 한 단계↓(친밀→무관), 스트레스↑, 야망↑.
setupPair();
const aAmbC0 = useDiscipleStore.getState().disciples['a'].personality.ambition;
resolveAmbitionConflict('a', 'b', 'challenge');
{
  const ds = useDiscipleStore.getState();
  ck('C격려 — 관계 한 단계↓(friend→neutral)', ds.disciples['a'].relationships['b'] === 'neutral');
  ck('C격려 — 스트레스 상승', (ds.disciples['a'].stress ?? 0) > 0);
  ck('C격려 — 야망 상승', ds.disciples['a'].personality.ambition > aAmbC0);
  ck('C격려 — 집계(결투)', tally.n(MIND_TALLY.ambitionDuel) >= 1);
}

// D 무관심 — 관계 두 단계↓(친밀→소원), 신뢰↓, 스트레스↑.
setupPair();
const aTrustD0 = useDiscipleStore.getState().disciples['a'].trustToMaster;
resolveAmbitionConflict('a', 'b', 'ignore');
{
  const ds = useDiscipleStore.getState();
  ck('D무관심 — 관계 두 단계↓(friend→distant)', ds.disciples['a'].relationships['b'] === 'distant');
  ck('D무관심 — 신뢰 하락', ds.disciples['a'].trustToMaster < aTrustD0);
  ck('D무관심 — 스트레스 상승', (ds.disciples['a'].stress ?? 0) > 0);
  ck('D무관심 — 집계(비극)', tally.n(MIND_TALLY.ambitionTragedy) >= 1);
}

// ── 4. 크래시 안전 ──
let crash = false;
try {
  resolveAmbitionConflict('a', 'missing', 'defer'); // 없는 상대
  resolveAmbitionConflict('missing', 'a', 'ally');
  setupPair();
  resolveAmbitionConflict('a', 'b', 'gibberish'); // 미지정 키 → ignore 로 폴백
} catch (e) { crash = true; console.log('   ', e); }
ck('없는 제자·미지정 키 해소 — 크래시 0', !crash);
ck('미지정 키 → 무관심(ignore) 폴백', useDiscipleStore.getState().disciples['a'].ambitionRivalry?.outcome === 'ignore');
ck('모든 해소 후 관계 그래프 유효', allRelationsValid());

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
