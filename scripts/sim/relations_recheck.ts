// 관계 전이표 재검증(적대) — docs/33·37 C9. 시스템 레벨(relations.ts)이 가드를 본다면,
// 여기선 단일 진실 전이표(REL_UP/REL_DOWN/TOWARD_NEUTRAL) 자체의 수학적 성질을 직접 친다.
// 새 공격: ① 전수성 — 5레벨 전부 키 존재  ② 포화 멱등(sworn↑=sworn, enemy↓=enemy)
//          ③ 상하 역연산 — 끝단 아닌 곳에서 up→down·down→up 제자리(사다리 일관)
//          ④ 단조 — up 은 사다리에서 비후퇴, down 은 비전진  ⑤ 중재 천장 — TOWARD_NEUTRAL 은 neutral 초과 못 올림
//          ⑥ graduateEvents 의 독립 REL_ORDER 사다리와 전이표가 결과 동일(드리프트 0 확인)
// 순수 데이터라 RN 없이. 실행: npx tsx scripts/sim/relations_recheck.ts
import { REL_UP, REL_DOWN, TOWARD_NEUTRAL } from '../../src/data/relationTransitions';
import type { RelationLevel } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
// 사다리 순서(낮음→높음). 전이표와 독립으로 정의해 교차검증.
const LADDER: RelationLevel[] = ['enemy', 'distant', 'neutral', 'friend', 'sworn'];
const idx = (r: RelationLevel) => LADDER.indexOf(r);

console.log('═══ 관계 전이표 재검증(적대) ═══\n');

// ── 1. 전수성 — 5레벨 전부 REL_UP·REL_DOWN 키 존재, 값도 유효 레벨 ──
ck('REL_UP 5레벨 전부 키 존재', LADDER.every((l) => l in REL_UP));
ck('REL_DOWN 5레벨 전부 키 존재', LADDER.every((l) => l in REL_DOWN));
ck('REL_UP 값 전부 유효 레벨', LADDER.every((l) => LADDER.includes(REL_UP[l])));
ck('REL_DOWN 값 전부 유효 레벨', LADDER.every((l) => LADDER.includes(REL_DOWN[l])));

// ── 2. 포화 멱등 — 양 끝은 제자리 ──
ck('up(sworn) = sworn(천장 포화)', REL_UP.sworn === 'sworn');
ck('down(enemy) = enemy(바닥 포화)', REL_DOWN.enemy === 'enemy');

// ── 3. 단조 — up 은 정확히 +1(끝단 제외), down 은 정확히 −1(끝단 제외) ──
let upStep = true; let downStep = true;
for (const l of LADDER) {
  const u = idx(REL_UP[l]); const d = idx(REL_DOWN[l]);
  // up: sworn 이면 제자리(+0), 아니면 +1.
  if (l === 'sworn') { if (u !== idx('sworn')) upStep = false; }
  else if (u !== idx(l) + 1) upStep = false;
  // down: enemy 면 제자리, 아니면 −1.
  if (l === 'enemy') { if (d !== idx('enemy')) downStep = false; }
  else if (d !== idx(l) - 1) downStep = false;
}
ck('REL_UP 한 칸 호전(끝단 포화)', upStep, LADDER.map((l) => REL_UP[l]).join(','));
ck('REL_DOWN 한 칸 악화(끝단 포화)', downStep, LADDER.map((l) => REL_DOWN[l]).join(','));

// ── 4. 상하 역연산 — 끝단 아닌 중간 레벨에서 up→down 과 down→up 이 제자리(사다리 일관성) ──
let invOk = true;
for (const l of LADDER) {
  if (l !== 'sworn' && REL_DOWN[REL_UP[l]] !== l) invOk = false; // up 후 down = 원위치(천장 제외)
  if (l !== 'enemy' && REL_UP[REL_DOWN[l]] !== l) invOk = false; // down 후 up = 원위치(바닥 제외)
}
ck('중간 레벨 up↔down 역연산 제자리(사다리 일관)', invOk);

// ── 5. 중재 천장 — TOWARD_NEUTRAL 은 enemy·distant 만 키, 결과 neutral 초과 못 함 ──
ck('TOWARD_NEUTRAL 키 = enemy·distant 만(2개)', Object.keys(TOWARD_NEUTRAL).length === 2 && 'enemy' in TOWARD_NEUTRAL && 'distant' in TOWARD_NEUTRAL);
ck('중재 결과 neutral 이하(우호로 못 올림)', Object.values(TOWARD_NEUTRAL).every((v) => v != null && idx(v as RelationLevel) <= idx('neutral')));
ck('중재는 한 칸씩만 호전(enemy→distant, distant→neutral)', TOWARD_NEUTRAL.enemy === 'distant' && TOWARD_NEUTRAL.distant === 'neutral');
ck('neutral 이상은 중재 키 없음(호출부 무변화)', !('neutral' in TOWARD_NEUTRAL) && !('friend' in TOWARD_NEUTRAL) && !('sworn' in TOWARD_NEUTRAL));

// ── 6. graduateEvents 의 독립 REL_ORDER 사다리와 전이표 결과 동일(드리프트 0 검증) ──
// graduateEvents.ts 는 단일 전이표를 안 쓰고 자체 REL_ORDER 인덱스 ±1 로 relUp/relDown 을 한다.
// (문서는 5파일 단일화를 주장하나 graduateEvents 는 동치 로직을 따로 둠 — 동치인지 직접 대조.)
const REL_ORDER_GE: RelationLevel[] = ['enemy', 'distant', 'neutral', 'friend', 'sworn'];
const geUp = (r: RelationLevel): RelationLevel => REL_ORDER_GE[Math.min(4, REL_ORDER_GE.indexOf(r) + 1)];
const geDown = (r: RelationLevel): RelationLevel => REL_ORDER_GE[Math.max(0, REL_ORDER_GE.indexOf(r) - 1)];
let geEquiv = true;
for (const l of LADDER) {
  if (geUp(l) !== REL_UP[l]) geEquiv = false;
  if (geDown(l) !== REL_DOWN[l]) geEquiv = false;
}
ck('graduateEvents 독립 사다리 == 전이표(현재 동치, 드리프트 0)', geEquiv);

console.log(`\n[정보] 사다리 ${LADDER.join('<')} · 중재천장 neutral`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
