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

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
