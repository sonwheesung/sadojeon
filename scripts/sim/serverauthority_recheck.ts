// 서버 권위 재검증(적대) — docs/31·37. 서버 advance/newRun 의 결정성·격리는 두 토대 위에 선다:
//   ① RNG 앰비언트 커서 라운드트립(같은 시드/커서 = 같은 수열, 전진된 커서 저장→복원이 정확)
//   ② GameState PRISTINE 2단 리셋(들어온 키 누락 시 직전 유저 잔류 0 — 웜 인스턴스 누수 차단)
// serverEngine 본체는 timeSystem 경유로 react-native 를 끌어 헤드리스(tsx) 불가(Vercel esbuild 전용,
// docs/31 §RN 비순수). 그래서 그 두 토대를 RN-free 로 직접 적대 검증한다 — 누수·세이브스커밍의 실제 방어선.
// 새 공격: 커서 정확 전진(off-by-one)·재시드 항등·키 누락 advance 의 PRISTINE 폴백·부분 슬라이스 누수·
//          빈/null/깨진 슬라이스 주입·클론 깊은 독립·라운드트립 항등(수천 회 반복 드리프트).
// 실행: npx tsx scripts/sim/serverauthority_recheck.ts
import './_storageShim';
import { captureGameState, commitGameState, cloneGameState, type GameState } from '../../src/engine/gameState';
import { seedAmbient, ambientCursor, restoreAmbient, random } from '../../src/systems/rng';
import { useTimeStore } from '../../src/stores/timeStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useItemStore } from '../../src/stores/itemStore';
import type { Disciple } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const J = (x: unknown) => JSON.stringify(x);
function addDisc(id: string, realm = 'samryu'): void {
  useDiscipleStore.getState().add({ id, name: id, status: 'training', relationships: {}, martialArts: [], realm, darknessLevel: 0 } as unknown as Disciple);
}
function setMoney(v: number) {
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation: 10, resources: v, facilities: [] } as never);
}

console.log('═══ 서버 권위 재검증(적대) ═══\n');

// 모듈 로드 직후의 회차 초기 상태 = serverEngine PRISTINE 의 등가물.
useTimeStore.getState().reset();
useDiscipleStore.getState().reset();
const PRISTINE = cloneGameState(captureGameState());
const pristineOrder = (PRISTINE.disciple.order as string[]) ?? [];

// ── 1. RNG 커서 정확 전진(off-by-one) — 저장한 커서를 복원하면 그 시점 이후 수열이 정확 일치 ──
seedAmbient(13579);
const head = Array.from({ length: 5 }, random); // 앞 5개 소비
const savedCursor = ambientCursor(); // 서버가 DB 에 저장하는 값
const tail = Array.from({ length: 5 }, random); // 다음 5개
restoreAmbient(savedCursor);
const tailAgain = Array.from({ length: 5 }, random);
ck('커서 복원 → 후속 수열 정확 일치(off-by-one 없음)', J(tail) === J(tailAgain));
ck('복원 전후 head 와 tail 은 다름(커서가 실제 전진)', J(head) !== J(tail));

// 재시드 항등 — 같은 시드 두 번 = 같은 수열(세이브 스커밍 봉쇄).
seedAmbient(2468); const sA = Array.from({ length: 20 }, random);
seedAmbient(2468); const sB = Array.from({ length: 20 }, random);
ck('같은 시드 재시드 → 동일 20수열', J(sA) === J(sB));

// 수천 회 전진 후 커서 라운드트립 — 장기 드리프트 없이 복원 정확.
seedAmbient(99); for (let i = 0; i < 5000; i += 1) random();
const c5000 = ambientCursor(); const next3 = Array.from({ length: 3 }, random);
restoreAmbient(c5000); const next3Again = Array.from({ length: 3 }, random);
ck('5000회 전진 후에도 커서 복원 정확', J(next3) === J(next3Again));
ck('커서는 32비트 부호없는 정수', Number.isInteger(c5000) && c5000 >= 0 && c5000 <= 0xffffffff, `${c5000}`);

// ── 2. 웜 인스턴스 누수 — 직전 유저 상태를 PRISTINE+commit 2단으로 덮으면 잔류 0 ──
// 시나리오: 인스턴스에 유저 X(제자 3명·자금 8000)가 남아있다. 다음 요청은 제자 1명·자금 500 인 유저 Y.
function loadRequest(state: GameState): void {
  // serverEngine.advance 의 2단 클린슬레이트 재현.
  commitGameState(cloneGameState(PRISTINE)); // ① 초기화(직전 유저 제거)
  commitGameState(cloneGameState(state)); //    ② 이번 요청 상태 덮기
}
// 유저 Y 의 완전한 세이브 준비.
useTimeStore.getState().reset(); useDiscipleStore.getState().reset();
setMoney(500); addDisc('Y-only');
const userY = cloneGameState(captureGameState());

// 인스턴스를 유저 X 로 더럽힌다.
useDiscipleStore.getState().reset();
setMoney(8000); addDisc('X1'); addDisc('X2'); addDisc('X3');
ck('인스턴스 X 로 워밍됨(제자 3명)', useDiscipleStore.getState().order.length === 3);

loadRequest(userY);
ck('유저 Y 로드 후 제자 1명(X 누수 0)', useDiscipleStore.getState().order.length === 1 && !!useDiscipleStore.getState().disciples['Y-only']);
ck('유저 Y 자금 500(X 의 8000 안 샘)', useSectStore.getState().sect?.resources === 500);

// ── 3. 키(슬라이스) 누락 advance — 누락 슬롯은 PRISTINE 기본값(직전 유저로 안 샘) ──
// 유저 Z 세이브에서 disciple 슬롯을 통째 제거(옛 세이브). 직전이 X(3명)여도 Z 진행 시 제자는 PRISTINE(0명).
useDiscipleStore.getState().reset();
setMoney(8000); addDisc('X1'); addDisc('X2'); addDisc('X3'); // 다시 X 로 워밍
const userZ = cloneGameState(userY) as Record<string, unknown>;
delete userZ.disciple; // disciple 슬롯 누락
loadRequest(userZ as unknown as GameState);
ck('disciple 누락 세이브 → 제자 PRISTINE(0명, X 의 3명 안 샘)', useDiscipleStore.getState().order.length === pristineOrder.length, `현재 ${useDiscipleStore.getState().order.length} / pristine ${pristineOrder.length}`);
ck('disciple 누락이어도 다른 슬롯(자금)은 Z 값 반영', useSectStore.getState().sect?.resources === 500);

// ── 4. 빈/null/깨진 슬라이스 주입 — 크래시 없이 PRISTINE 유지 ──
useDiscipleStore.getState().reset(); setMoney(8000); addDisc('X1'); addDisc('X2');
let crashed = false;
try {
  loadRequest({} as unknown as GameState); // 빈 세이브
} catch { crashed = true; }
ck('빈 세이브({}) 로드 크래시 없음', !crashed);
ck('빈 세이브 → 제자 PRISTINE(0명)', useDiscipleStore.getState().order.length === pristineOrder.length);

// null·비객체 슬라이스 — commit 가 건너뛰어 PRISTINE 유지.
useDiscipleStore.getState().reset(); setMoney(8000); addDisc('X1');
let crashed2 = false;
try {
  commitGameState(cloneGameState(PRISTINE));
  commitGameState({ disciple: null, sect: 'broken', item: 123 } as unknown as GameState);
} catch { crashed2 = true; }
ck('null/문자열/숫자 슬라이스 주입 크래시 없음', !crashed2);
ck('깨진 슬라이스 → 제자 PRISTINE 유지', useDiscipleStore.getState().order.length === pristineOrder.length);

// ── 5. 클론 깊은 독립 — advance 가 입력 state 를 안 건드린다(중첩 객체까지) ──
useDiscipleStore.getState().reset(); setMoney(3000); addDisc('deep');
useItemStore.setState({ items: [{ id: 'h', name: '약', category: 'material', count: 5 } as never] });
const snap = cloneGameState(captureGameState());
const snapBefore = J(snap);
loadRequest(snap); // 로드 후 스토어 변경
useItemStore.getState().adjustCount('h', -3);
addDisc('extra');
setMoney(1);
ck('클론 입력 snap 은 이후 스토어 변경에 불변(깊은 독립)', J(snap) === snapBefore);

// ── 6. 라운드트립 항등 — capture→commit→capture 가 1000회 반복해도 동일(드리프트 0) ──
useDiscipleStore.getState().reset(); setMoney(4242); addDisc('rt1'); addDisc('rt2', 'iryu');
let rt = cloneGameState(captureGameState());
const rt0 = J(rt);
let stable = true;
for (let i = 0; i < 1000; i += 1) {
  commitGameState(rt);
  rt = cloneGameState(captureGameState());
  if (J(rt) !== rt0) { stable = false; break; }
}
ck('capture→commit 라운드트립 1000회 항등(드리프트 0)', stable);

console.log(`\n[정보] PRISTINE 제자 ${pristineOrder.length}명 · 커서(5000회후) ${c5000}`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
