// GameState 캡처/커밋 무결성 — docs/31. 실행: npx tsx scripts/sim/gamestate.ts
// 서버 흐름(DB→GameState→엔진→GameState→DB)의 로드/세이브 계약 검증:
// 라운드트립 항등(capture→commit→capture)·복원·클론 독립.
import './_storageShim';
import { captureGameState, commitGameState, cloneGameState } from '../../src/engine/gameState';
import { useTimeStore } from '../../src/stores/timeStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useItemStore } from '../../src/stores/itemStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import type { Disciple } from '../../src/types';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const J = (x: unknown) => JSON.stringify(x);

function addDisc(id: string, realm = 'samryu'): void {
  useDiscipleStore.getState().add({ id, name: id, status: 'training', relationships: {}, martialArts: [], realm, darknessLevel: 0 } as unknown as Disciple);
}

console.log('═══ GameState 캡처/커밋 무결성 ═══\n');

// 초기 상태 시드.
useTimeStore.getState().reset();
useDiscipleStore.getState().reset();
useSectStore.getState().setSect({ name: '시험문', hanjaName: '試驗門', reputation: 10, resources: 5000, facilities: [] } as never);
useItemStore.setState({ items: [{ id: 'herb-x', name: '약초', category: 'material', count: 3 } as never] });
useInboxStore.getState().reset();
addDisc('d1');
addDisc('d2', 'iryu');

// 1) 캡처 — 18 슬롯 모두.
const EXPECTED_KEYS = ['time', 'master', 'sect', 'sectAtmosphere', 'disciple', 'codex', 'item', 'quest', 'activity', 'alchemy', 'schedule', 'reputation', 'jianghu', 'graduate', 'outreach', 'npc', 'eventHistory', 'inbox'];
const snap = captureGameState();
check('18 슬롯 캡처', EXPECTED_KEYS.every((k) => k in snap), Object.keys(snap).length + '개');
check('제자 2명 캡처', (snap.disciple.order as string[]).length === 2);
check('사문 자금 캡처', (snap.sect.sect as { resources: number } | null)?.resources === 5000);
check('아이템 캡처', (snap.item.items as unknown[]).length === 1);

// 2) 라운드트립 항등 — capture → commit(captured) → recapture 가 동일.
const before = J(snap);
commitGameState(snap);
const after = J(captureGameState());
check('라운드트립 항등(capture→commit→capture)', before === after);

// 3) 복원 — 스냅 후 변경 → 원본 commit → 원본 복원(변경본과 다름).
const original = cloneGameState(captureGameState());
useSectStore.getState().setSect({ name: '바뀜', hanjaName: '變', reputation: 99, resources: 1, facilities: [] } as never);
addDisc('d3');
const mutated = J(captureGameState());
check('변경 후 상태 달라짐', mutated !== J(original));
commitGameState(original);
const restored = J(captureGameState());
check('원본 commit → 완전 복원', restored === J(original));
check('복원 후 제자 2명(d3 사라짐)', useDiscipleStore.getState().order.length === 2);
check('복원 후 자금 5000', useSectStore.getState().sect?.resources === 5000);

// 4) 클론 독립 — 클론 후 스토어 변경해도 클론 불변(엔진이 원본 안 건드림 보장).
const clone = cloneGameState(captureGameState());
const cloneBefore = J(clone);
useItemStore.setState({ items: [] }); // 스토어 변경
useTimeStore.getState().advanceDay();
check('클론은 이후 스토어 변경에 불변', J(clone) === cloneBefore);

// 5) 전방호환(옛 세이브 로드) — 라이브에서 스토어/필드가 늘어나도 기존 플레이어 세이브가 깨지면 안 됨.
//    DB의 옛 GameState 는 나중 추가된 스토어·필드가 없다 → commit 이 크래시 없이 기본값을 지켜야 한다.
useTimeStore.getState().reset();
useDiscipleStore.getState().reset();
useSectStore.getState().setSect({ name: '구판문', hanjaName: '舊版門', reputation: 7, resources: 4200, facilities: [] } as never);
addDisc('old1');
const fullSave = cloneGameState(captureGameState());

// (a) 스토어 통째 누락 — 'inbox'·'alchemy'·'jianghu' 가 없는 옛 세이브.
const noStores = cloneGameState(fullSave) as Record<string, unknown>;
delete noStores.inbox; delete noStores.alchemy; delete noStores.jianghu;
useInboxStore.getState().add({ id: 'pre', kind: 'rumor', read: false } as never); // commit 전 값 — 누락분은 현재값 유지돼야
let crashed = false;
try { commitGameState(noStores as never); } catch { crashed = true; }
check('옛 세이브(스토어 3종 누락) commit 크래시 없음', !crashed);
check('누락 스토어는 현재 기본값 유지(undefined 아님)', !crashed && Array.isArray(useInboxStore.getState().items) && useInboxStore.getState().items.length === 1);
check('존재하는 스토어는 정상 반영(자금 4200)', useSectStore.getState().sect?.resources === 4200);

// (b) 스토어는 있으나 필드 누락 — sect 객체에 신규 필드가 없던 옛 세이브.
const missingField = cloneGameState(fullSave) as Record<string, Record<string, unknown>>;
const sectSlice = missingField.sect.sect as Record<string, unknown>;
delete sectSlice.facilities; // 나중 추가됐다 치고 제거
let crashed2 = false;
try { commitGameState(missingField as never); } catch { crashed2 = true; }
check('옛 세이브(필드 누락) commit 크래시 없음', !crashed2);
check('필드 누락 시 자금은 보존(4200)', useSectStore.getState().sect?.resources === 4200);

// (c) 빈 세이브({}) commit — 최악(완전 빈 DB row) 도 크래시 없이 전 스토어 기본값.
let crashed3 = false;
try { commitGameState({} as never); } catch { crashed3 = true; }
check('빈 세이브({}) commit 크래시 없음', !crashed3);
check('빈 세이브 후에도 스토어 정상 동작(자금 4200 유지)', useSectStore.getState().sect?.resources === 4200);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
