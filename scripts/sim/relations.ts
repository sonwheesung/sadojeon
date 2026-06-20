// 관계 그래프 극단 — docs/33·37. 떠난 동문·자기참조·없는 대상·전원 적대 같은 극단 관계망에서
// setRelation 가드·중재/상담/적대 전이가 크래시 없이, 전이 후 항상 유효 레벨, 떠난 제자엔 무효과인지.
// 실행: npx tsx scripts/sim/relations.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { resolveMediation, resolveCounsel, applyRivalryTone, triggerDailyMediation } from '../../src/systems/mediationSystem';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, RelationLevel } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const LEVELS: RelationLevel[] = ['enemy', 'distant', 'neutral', 'friend', 'sworn'];
const LEVEL_SET = new Set<string>(LEVELS);

function disc(id: string, status: Disciple['status'] = 'training'): Disciple {
  return {
    id, name: id, status, relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, trustToMaster: 30, stress: 0,
  } as unknown as Disciple;
}
// 전체 관계 그래프에 유효하지 않은 레벨(undefined·미정의)이 섞였는지.
function allRelationsValid(): { ok: boolean; bad: string } {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    for (const [oid, lv] of Object.entries(d?.relationships ?? {})) {
      if (!LEVEL_SET.has(lv as string)) return { ok: false, bad: `${id}->${oid}=${lv}` };
    }
  }
  return { ok: true, bad: '' };
}

seedAmbient(13579);
console.log('═══ 관계 그래프 극단 (중재·상담·적대 전이) ═══\n');

// ── 1. setRelation 가드 ──
useDiscipleStore.getState().setAll([disc('a'), disc('b'), disc('c'), disc('gone', 'graduated')]);
const ds = useDiscipleStore.getState();
ds.setRelation('a', 'a', 'enemy'); // 자기참조 — 무시
ck('자기참조 setRelation 무시', !useDiscipleStore.getState().disciples['a'].relationships['a']);
ds.setRelation('nobody', 'b', 'enemy'); // 없는 출발자 — 무시(크래시 X)
ck('없는 출발자 setRelation 무시', !useDiscipleStore.getState().disciples['nobody']);
ds.setRelation('a', 'ghost', 'enemy'); // 없는 대상 — 허용(댕글링, 크래시 X)
ck('없는 대상 setRelation 허용(댕글링·크래시 X)', useDiscipleStore.getState().disciples['a'].relationships['ghost'] === 'enemy');
ds.setRelation('a', 'b', 'sworn');
ck('정상 setRelation 반영', useDiscipleStore.getState().disciples['a'].relationships['b'] === 'sworn');

// ── 2. 전이 totality — 모든 시작 레벨에서 중재/상담/적대 전이 후 항상 유효 레벨(undefined 0) ──
// 각 레벨로 a↔b 를 세팅하고 모든 해소 키를 굴려도 관계 값이 깨지지 않아야.
let transitionsOk = true; let transBad = '';
for (const lv of LEVELS) {
  useDiscipleStore.getState().setAll([disc('a'), disc('b')]);
  const d2 = useDiscipleStore.getState();
  d2.setRelation('a', 'b', lv); d2.setRelation('b', 'a', lv);
  for (const key of ['reconcile', 'separate', 'side-a', 'side-b', 'observe']) resolveMediation('a', 'b', key);
  resolveCounsel('a', 'b', 'untangle'); resolveCounsel('a', 'b', 'soothe'); resolveCounsel('a', 'b', 'hold');
  for (const t of ['punish', 'seclusion', 'admonish', 'overlook'] as const) applyRivalryTone('a', 'b', t);
  const v = allRelationsValid();
  if (!v.ok) { transitionsOk = false; transBad = `${lv}: ${v.bad}`; }
}
ck('모든 시작 레벨×전 해소키 — 전이 후 항상 유효 레벨(undefined 0)', transitionsOk, transBad);

// ── 3. 떠난/없는 제자 대상 해소 — 크래시 없음 + 무효과 ──
useDiscipleStore.getState().setAll([disc('a'), disc('gone', 'graduated')]);
useDiscipleStore.getState().setRelation('a', 'gone', 'enemy');
let crash = false;
try {
  resolveMediation('a', 'gone', 'reconcile'); // 상대 졸업 — 가드 return
  resolveMediation('a', 'missing', 'side-a');  // 없는 id
  resolveMediation('missing', 'a', 'reconcile');
  resolveCounsel('a', 'gone', 'untangle');
  resolveCounsel('missing', 'gone', 'soothe');
  applyRivalryTone('a', 'gone', 'punish');
  applyRivalryTone('missing', 'a', 'overlook');
} catch (e) { crash = true; transBad = String(e); }
ck('떠난/없는 제자 대상 해소 — 크래시 0', !crash, crash ? transBad : '');
ck('해소 후에도 관계 그래프 유효', allRelationsValid().ok);

// ── 4. 전원 적대(완전 그래프) — 중재 후보 스캔·트리거 크래시 0 ──
const many = ['p1', 'p2', 'p3', 'p4'].map((id) => disc(id));
useDiscipleStore.getState().setAll(many);
const dm = useDiscipleStore.getState();
for (const x of many) for (const y of many) if (x.id !== y.id) dm.setRelation(x.id, y.id, 'enemy');
let crash2 = false;
try { for (let i = 0; i < 50; i += 1) triggerDailyMediation(); } catch (e) { crash2 = true; transBad = String(e); }
ck('전원 적대 — 중재 트리거 50회 크래시 0', !crash2, crash2 ? transBad : '');
ck('전원 적대 후 관계 그래프 유효', allRelationsValid().ok);

// ── 5. 자기참조가 전이로도 안 생김 ──
const selfRef = useDiscipleStore.getState().order.some((id) => useDiscipleStore.getState().disciples[id]?.relationships?.[id]);
ck('어떤 제자도 자기 자신과 관계 없음', !selfRef);

// ── 6. 떠난 동문 관계 변동 누수 차단 (R28 / Part D ④⑤) ──
// applyRivalryTone 은 상대가 졸업/하산이면 관계를 건드리지 않아야. 종전엔 sibling 이 존재만 하면
// (떠났어도) 확률적으로 관계를 바꿔, 도덕 이벤트를 방치하는 사이 졸업한 동문 관계가 샜다. §3 은
// 크래시·유효성만 봤지 "관계값이 안 바뀐다"를 검증 안 해 이 누수를 못 잡았다(사각 ④).
useDiscipleStore.getState().setAll([disc('act'), disc('left', 'graduated')]);
useDiscipleStore.getState().setRelation('act', 'left', 'enemy');
useDiscipleStore.getState().setRelation('left', 'act', 'enemy');
for (let i = 0; i < 200; i += 1) {
  for (const t of ['punish', 'seclusion', 'admonish', 'overlook'] as const) applyRivalryTone('act', 'left', t);
}
const leakA = useDiscipleStore.getState().disciples['act'].relationships['left'];
const leakB = useDiscipleStore.getState().disciples['left'].relationships['act'];
ck('떠난 동문 — applyRivalryTone 800회 관계 불변(act→left)', leakA === 'enemy', `act->left=${leakA}`);
ck('떠난 동문 — applyRivalryTone 관계 불변(left→act)', leakB === 'enemy', `left->act=${leakB}`);
// 대조군 — 둘 다 활성이면 가드가 막지 않고 적대 전이가 정상 적용돼야(과차단 아님 확인).
useDiscipleStore.getState().setAll([disc('x'), disc('y')]);
useDiscipleStore.getState().setRelation('x', 'y', 'enemy');
useDiscipleStore.getState().setRelation('y', 'x', 'enemy');
for (let i = 0; i < 400; i += 1) applyRivalryTone('x', 'y', 'admonish');
const ctrl = useDiscipleStore.getState().disciples['x'].relationships['y'];
ck('대조군 — 둘 다 활성이면 적대 전이 정상 적용(enemy 이탈)', ctrl !== 'enemy', `x->y=${ctrl}`);

console.log(`\n[정보] 관계 레벨 ${LEVELS.length}종 · 해소키 중재5·상담3·적대4`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
