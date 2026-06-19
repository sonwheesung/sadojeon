// 영속/세이브 재검증(적대) — docs/31. 이미 통과한 라운드트립·전방호환을 새 각도로 다시 친다.
// 새 공격: ① NaN/Infinity 주입 — JSON 클론이 null 화하는 데이터 손상, commit 이 크래시 없이 흡수하는지
//          ② 유니코드/초장문 이름·한자 라운드트립 보존  ③ order ↔ disciples 불일치(고아 id·중복) commit 내성
//          ④ undefined 필드 드롭(elixirAbsorb 등) 후에도 안전  ⑤ 깊은 중첩(realmProgress·relationships) 클론 독립
//          ⑥ 큰 수(MAX_SAFE) 정확 보존  ⑦ 빈 배열·빈 객체 정상 경로 주입
// 실행: npx tsx scripts/sim/gamestate_recheck.ts
import './_storageShim';
import { captureGameState, commitGameState, cloneGameState, type GameState } from '../../src/engine/gameState';
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
function addDisc(id: string, over: Partial<Disciple> = {}): void {
  useDiscipleStore.getState().add({ id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu', darknessLevel: 0, realmProgress: { internal: 0, pity: 0, petitioned: false } } as unknown as Disciple);
  if (Object.keys(over).length) useDiscipleStore.getState().update(id, over);
}
function setMoney(v: number) { useSectStore.getState().setSect({ name: '문', hanjaName: '門', reputation: 10, resources: v, facilities: [] } as never); }

console.log('═══ 영속/세이브 재검증(적대) ═══\n');

useTimeStore.getState().reset();
useDiscipleStore.getState().reset();
setMoney(5000);

// ── 1. NaN/Infinity 주입 — JSON 클론이 null 화(데이터 손상). commit 이 크래시 없이 흡수하는지 ──
addDisc('nanboy', { realmProgress: { internal: NaN, pity: Infinity, petitioned: false } } as never);
const snap = captureGameState();
// in-memory 캡처엔 NaN/Infinity 가 그대로.
const rawInternal = (snap.disciple.disciples as Record<string, Disciple>)['nanboy'].realmProgress?.internal;
ck('캡처 시점엔 NaN 보존(메모리)', Number.isNaN(rawInternal as number));
// 클론(JSON 라운드트립) — NaN/Infinity → null.
const cloned = cloneGameState(snap);
const clonedInternal = (cloned.disciple.disciples as Record<string, Disciple>)['nanboy'].realmProgress?.internal;
ck('JSON 클론은 NaN/Infinity → null(서버 DB 계약: JSON-safe)', clonedInternal === null);
// commit(클론) 크래시 없음 — 손상된 값이라도 로드가 터지지 않아야.
let crashed = false;
try { commitGameState(cloned); } catch { crashed = true; }
ck('손상(null) 값 세이브 commit 크래시 없음', !crashed);

// ── 2. 유니코드·초장문·한자 이름 라운드트립 보존 ──
useDiscipleStore.getState().reset();
const longName = '검'.repeat(500); // 초장문
const emojiName = '독고🗡️구검‍́검성'; // 결합문자·ZWJ
addDisc('uni1'); useDiscipleStore.getState().update('uni1', { name: longName } as never);
addDisc('uni2'); useDiscipleStore.getState().update('uni2', { name: emojiName, hanjaName: '獨孤求劍劍聖' } as never);
const uniSnap = cloneGameState(captureGameState());
commitGameState(uniSnap);
const back = captureGameState();
const d1 = (back.disciple.disciples as Record<string, Disciple>)['uni1'];
const d2 = (back.disciple.disciples as Record<string, Disciple>)['uni2'];
ck('초장문 이름(500자) 라운드트립 보존', d1.name === longName && d1.name.length === 500);
ck('이모지·결합문자·ZWJ 이름 보존', d2.name === emojiName);
ck('한자 hanjaName 보존', (d2 as { hanjaName?: string }).hanjaName === '獨孤求劍劍聖');

// ── 3. order ↔ disciples 불일치 — 고아 id·중복 id 세이브 commit 내성 ──
useDiscipleStore.getState().reset();
addDisc('real1'); addDisc('real2');
const corrupt = cloneGameState(captureGameState()) as Record<string, Record<string, unknown>>;
// order 에 disciples 에 없는 고아 id 추가 + 중복 id.
corrupt.disciple.order = ['real1', 'ghost-id', 'real2', 'real1'];
let crashed2 = false;
try { commitGameState(corrupt as unknown as GameState); } catch { crashed2 = true; }
ck('고아/중복 id order 세이브 commit 크래시 없음', !crashed2);
// 재캡처 — order 그대로 들어감(스토어는 검열 안 함). 최소한 disciples 맵은 정상 2명.
const afterCorrupt = captureGameState();
ck('disciples 맵은 정상 2명 유지(고아 주입에도)', Object.keys(afterCorrupt.disciple.disciples as object).length === 2);

// ── 4. undefined 필드 드롭 — elixirAbsorb undefined 가 JSON 후 사라져도 안전 ──
useDiscipleStore.getState().reset();
addDisc('ud'); useDiscipleStore.getState().update('ud', { elixirAbsorb: undefined } as never);
const udClone = cloneGameState(captureGameState());
const udBack = (udClone.disciple.disciples as Record<string, Disciple>)['ud'];
ck('undefined 필드는 클론서 사라짐(키 부재, 크래시 X)', !('elixirAbsorb' in udBack) || udBack.elixirAbsorb === undefined);

// ── 5. 깊은 중첩 클론 독립 — realmProgress·relationships 변경이 클론에 안 샘 ──
useDiscipleStore.getState().reset();
addDisc('deep', { realmProgress: { internal: 100, pity: 3, petitioned: false }, relationships: { other: 'friend' } } as never);
const deepClone = cloneGameState(captureGameState());
const beforeJ = J(deepClone);
// 원본 스토어의 중첩 객체 변경.
useDiscipleStore.getState().update('deep', { realmProgress: { internal: 999, pity: 9, petitioned: true }, relationships: { other: 'enemy' } } as never);
ck('클론은 원본 중첩 변경에 불변(깊은 독립)', J(deepClone) === beforeJ);

// ── 6. 큰 수(MAX_SAFE) 정확 보존 — 자금·내공 거대치 라운드트립 ──
useDiscipleStore.getState().reset();
setMoney(Number.MAX_SAFE_INTEGER);
addDisc('big', { realmProgress: { internal: Number.MAX_SAFE_INTEGER, pity: 0, petitioned: false } } as never);
const bigClone = cloneGameState(captureGameState());
commitGameState(bigClone);
ck('MAX_SAFE 자금 정확 보존', useSectStore.getState().sect?.resources === Number.MAX_SAFE_INTEGER);
ck('MAX_SAFE 내공 정확 보존', useDiscipleStore.getState().disciples['big'].realmProgress?.internal === Number.MAX_SAFE_INTEGER);

// ── 7. 빈 배열·빈 객체 정상 경로 — 빈 제자·빈 아이템 세이브 라운드트립 ──
useDiscipleStore.getState().reset();
useItemStore.setState({ items: [] });
const emptySnap = cloneGameState(captureGameState());
let crashed3 = false;
try { commitGameState(emptySnap); } catch { crashed3 = true; }
ck('빈 제자·빈 아이템 세이브 commit 크래시 없음', !crashed3);
ck('빈 상태 라운드트립 항등', J(cloneGameState(captureGameState())) === J(emptySnap));

// ── 8. 라운드트립 항등(드리프트 0) — 복합 상태 capture→clone→commit→capture ──
useDiscipleStore.getState().reset();
setMoney(4242); addDisc('a'); addDisc('b', { realm: 'iryu' } as never);
useItemStore.setState({ items: [{ id: 'x', name: '약', category: 'material', count: 7 } as never] });
const composite = cloneGameState(captureGameState());
commitGameState(composite);
ck('복합 상태 라운드트립 항등', J(cloneGameState(captureGameState())) === J(composite));

console.log(`\n[정보] NaN→null 확인 · 유니코드/한자 보존 · MAX_SAFE 보존`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
