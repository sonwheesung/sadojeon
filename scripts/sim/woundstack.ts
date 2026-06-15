// 다중 상처(속성별 누적) 계약 테스트 — docs/37 §C 부상 중첩. 실행: npx tsx scripts/sim/woundstack.ts
// 통계가 아니라 결정적 계약(A 인풋 → B 결과) 검증. 상처는 속성별로 1개씩 동시 보유하고,
// 같은 속성은 더 깊은 쪽으로 합쳐지며, 영약은 그 속성 상처만 치료한다(외상약은 독을 못 고침).
import './_storageShim'; // 스토어 import 보다 먼저 — 노드 localStorage 폴리필.
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useItemStore } from '../../src/stores/itemStore';
import {
  clearWoundType,
  hasWound,
  healWound,
  inflictWound,
  tickWoundRecovery,
  woundsLabel,
  woundsOf,
  worstWound,
} from '../../src/systems/woundSystem';
import type { Disciple } from '../../src/types/disciple';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label}${detail ? `  — ${detail}` : ''}`);
  }
}

const ID = 'w1';
function fresh(): void {
  const ds = useDiscipleStore.getState();
  ds.reset();
  // martialArts: [] = 불침 체질 없음(모든 속성 상처 입음).
  ds.add({ id: ID, name: '시험제자', martialArts: [], realm: 'iryu', status: 'training' } as unknown as Disciple);
}
function d(): Disciple {
  return useDiscipleStore.getState().disciples[ID]!;
}
function grant(elixirId: string): void {
  useItemStore.getState().add({ id: elixirId, name: elixirId, category: 'elixir', count: 9 } as never);
}
function woundOf(type: string) {
  return woundsOf(d()).find((w) => w.type === type);
}

console.log('═══ 다중 상처(속성별 누적) 계약 — docs/37 §C ═══\n');

// ── T1: 다른 속성은 따로 쌓인다(검상 치명상 + 독) ──
console.log('[T1] 외상 치명상 + 독 → 둘 다 보유');
fresh();
inflictWound(ID, 'wound', 1, 30);
inflictWound(ID, 'poison', 3, 21);
check('상처 2개 보유', woundsOf(d()).length === 2, `len=${woundsOf(d()).length}`);
check('외상 치명상 존재', woundOf('wound')?.severity === 1);
check('중독 존재', woundOf('poison')?.severity === 3);
check('status injured', d().status === 'injured');
check('worstWound = 외상 치명상', worstWound(d())?.type === 'wound' && worstWound(d())?.severity === 1);
check('라벨에 둘 다', woundsLabel(woundsOf(d())).includes('외상') && woundsLabel(woundsOf(d())).includes('중독'));

// ── T2: 같은 속성은 더 깊은 쪽으로 합쳐진다(가벼운 게 덮어쓰지 않음) ──
console.log('\n[T2] 같은 속성 재타격 — 깊은 쪽 유지 + 잔여일 긴 쪽');
fresh();
inflictWound(ID, 'wound', 1, 30);
inflictWound(ID, 'wound', 3, 40); // 더 얕지만 잔여일 길다
check('여전히 1개(합쳐짐)', woundsOf(d()).length === 1, `len=${woundsOf(d()).length}`);
check('치명상 유지(얕은 게 못 덮음)', woundOf('wound')?.severity === 1);
check('잔여일 긴 쪽 40', woundOf('wound')?.daysRemaining === 40);

console.log('\n[T2b] 얕은 상처에 더 깊은 타격 → 깊은 쪽으로');
fresh();
inflictWound(ID, 'wound', 4, 10);
inflictWound(ID, 'wound', 2, 21);
check('더 깊은 sev2로 갱신', woundOf('wound')?.severity === 2);
check('잔여일 21', woundOf('wound')?.daysRemaining === 21);

// ── T3: 영약은 해당 속성만 치료(외상약은 독 못 고침) ──
console.log('\n[T3] 외상약으로 외상만 치료 — 독은 남는다');
fresh();
grant('saengsa-1'); // 외상 grade1
grant('geumchang-5'); // 외상 grade5
inflictWound(ID, 'wound', 1, 30);
inflictWound(ID, 'poison', 1, 30);
const healed = healWound(ID, 'saengsa-1');
check('외상약 치료 성공', healed === true);
check('외상 사라짐', woundOf('wound') === undefined);
check('독은 남음', woundOf('poison')?.severity === 1);
check('아직 injured(독 때문)', d().status === 'injured' && hasWound(d()));

console.log('\n[T3b] 외상약으로는 독 못 고침');
const tryPoison = healWound(ID, 'geumchang-5'); // 외상 grade5 — 남은 건 독뿐
check('외상약은 독에 안 먹힘(false)', tryPoison === false);
check('독 그대로', woundOf('poison')?.severity === 1);

console.log('\n[T3c] 해독약으로 독 치료 → 전부 나으면 복귀');
grant('mandok-bulchimdan'); // 독 grade1
const healPoison = healWound(ID, 'mandok-bulchimdan');
check('해독 성공', healPoison === true);
check('상처 0개', !hasWound(d()));
check('status training 복귀', d().status === 'training');

// ── T4: 자연 치유는 상처마다 독립으로 줄어든다 ──
console.log('\n[T4] 자연 치유 — 상처별 잔여일 독립 차감');
fresh();
inflictWound(ID, 'wound', 3, 2); // 2일 남음
inflictWound(ID, 'poison', 3, 5); // 5일 남음
tickWoundRecovery();
check('외상 1일', woundOf('wound')?.daysRemaining === 1);
check('독 4일', woundOf('poison')?.daysRemaining === 4);
tickWoundRecovery();
check('외상만 해소(0됨)', woundOf('wound') === undefined);
check('독 3일 남아 injured 유지', woundOf('poison')?.daysRemaining === 3 && d().status === 'injured');
tickWoundRecovery();
tickWoundRecovery();
tickWoundRecovery();
check('전부 회복 → training', !hasWound(d()) && d().status === 'training');

// ── T5: 안신단의 내상 진정은 내상만 제거 ──
console.log('\n[T5] clearWoundType(inner) — 내상만 제거, 외상은 그대로');
fresh();
inflictWound(ID, 'inner', 2, 20);
inflictWound(ID, 'wound', 3, 15);
const cleared = clearWoundType(ID, 'inner');
check('내상 제거됨(true)', cleared === true);
check('내상 사라짐', woundOf('inner') === undefined);
check('외상은 남음', woundOf('wound')?.severity === 3);
check('아직 injured', d().status === 'injured');
const clearedAgain = clearWoundType(ID, 'inner');
check('없는 속성 제거 시 false', clearedAgain === false);

// ── T6: 레거시 세이브(단일 wound) → wounds[] 마이그레이션(withDefaults, add 경로) ──
console.log('\n[T6] 구버전 단일 wound → wounds 배열 변환(소프트락 방지)');
useDiscipleStore.getState().reset();
useDiscipleStore.getState().add({
  id: 'legacy', name: '구버전제자', martialArts: [], realm: 'iryu', status: 'injured',
  wound: { type: 'poison', severity: 2, daysRemaining: 18 },
} as unknown as Disciple);
const lg = useDiscipleStore.getState().disciples['legacy']!;
check('wounds 배열로 이관', lg.wounds?.length === 1 && lg.wounds[0].type === 'poison');
check('잔재 wound 필드 제거', (lg as unknown as { wound?: unknown }).wound === undefined);
check('injured 유지(회복 가능 상태)', hasWound(lg) && lg.status === 'injured');

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
if (fail > 0) process.exit(1);
