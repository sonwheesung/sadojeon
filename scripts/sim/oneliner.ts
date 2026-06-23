// 한 마디 풀·선택 프로브 — 후보 매칭(candidateOneLiners) + 룰 선택(pickContextualOneLiner) 검증.
// LLM 경로는 모델 off 환경(tsx)에선 안 타므로 룰 폴백만 검증. docs/12·17.
import {
  candidateOneLiners,
  pickContextualOneLiner,
  matchesCondition,
  ONE_LINERS,
  type OneLinerCtx,
} from '../../src/data/scenarios/oneLiners';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, extra = ''): void {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}${extra ? '  = ' + extra : ''}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${extra ? '  = ' + extra : ''}`);
  }
}

function ctx(over: Partial<OneLinerCtx>): OneLinerCtx {
  return {
    discipleId: 'none',
    stress: 30,
    staminaPct: 80,
    trust: 60,
    darknessRisk: 'low',
    hasEnemy: false,
    age: 16,
    mainSeong: 4,
    rivalName: null,
    isWeakest: false,
    ...over,
  };
}

console.log('═══ 한 마디 풀·선택 프로브 ═══\n');

// 1) 흑화 위험 high → darkening(dk*) 후보가 등장
{
  const c = ctx({ darknessRisk: 'high', hasEnemy: true });
  const cand = candidateOneLiners(c);
  const dk = cand.filter((t) => t.mood === 'darkening');
  check('흑화 high → darkening 후보 등장', dk.length > 0, `dk ${dk.length}종`);
}

// 2) 신뢰 낮음 → distrust(ds*) 후보 등장
{
  const c = ctx({ trust: 20 });
  const cand = candidateOneLiners(c);
  const ds = cand.filter((t) => t.mood === 'distrust');
  check('신뢰 20 → distrust 후보 등장', ds.length > 0, `ds ${ds.length}종`);
}

// 3) 캐릭터 전용 — 진소화면 sig-sohwa-* 가 후보 앞쪽(전용 우선)
{
  const c = ctx({ discipleId: 'jin-sohwa', age: 16 });
  const cand = candidateOneLiners(c);
  const sohwaSig = cand.filter((t) => t.onlyFor === 'jin-sohwa');
  const otherSig = cand.filter((t) => t.onlyFor && t.onlyFor !== 'jin-sohwa');
  check('진소화 → 전용 시그니처 후보 포함', sohwaSig.length > 0, `${sohwaSig.length}종`);
  check('진소화 → 타 캐릭터 전용 제외', otherSig.length === 0);
  check('진소화 → 전용이 후보 맨 앞(우선 정렬)', cand[0]?.onlyFor === 'jin-sohwa');
}

// 4) 전용 없는 제자 → 공용만 (onlyFor 없는 것만)
{
  const c = ctx({ discipleId: 'unknown-pool-id' });
  const cand = candidateOneLiners(c);
  check('무명 제자 → 공용 후보만', cand.every((t) => !t.onlyFor), `${cand.length}종`);
}

// 5) pickContextualOneLiner 는 항상 후보 안에서 고른다(여러 회)
{
  const c = ctx({ discipleId: 'jin-sohwa', darknessRisk: 'medium', age: 16 });
  const cand = new Set(candidateOneLiners(c).map((t) => t.id));
  let inPool = true;
  let nullCount = 0;
  for (let i = 0; i < 200; i++) {
    const t = pickContextualOneLiner(c);
    if (!t) {
      nullCount++;
      continue;
    }
    if (!cand.has(t.id)) inPool = false;
  }
  check('룰 선택은 항상 후보 안', inPool);
  check('맞는 후보 있을 때 null 아님', nullCount === 0);
}

// 6) onlyFor 가 가리키는 poolId 는 실제 제자 풀에 존재(오타 방지)
{
  const DISCIPLE_POOL = new Set([
    'jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso', 'gang-muyeol',
    'i-cheongha', 'dokgo-yeon', 'baek-yeon', 'jin-baekho', 'sa-cheonhwa',
  ]);
  const bad = ONE_LINERS.filter((t) => t.onlyFor && !DISCIPLE_POOL.has(t.onlyFor));
  check('전용 onlyFor 모두 유효 제자', bad.length === 0, bad.map((t) => `${t.id}:${t.onlyFor}`).join(','));
}

// 7) 조건 매처 정합 — 빈 조건은 항상 통과
check('빈 조건 통과', matchesCondition(undefined, ctx({})));

const total = ONE_LINERS.length;
const sigCount = ONE_LINERS.filter((t) => t.onlyFor).length;
const moodCount = ONE_LINERS.filter((t) => t.mood).length;
console.log(`\n[정보] 한 마디 ${total}종 (전용 ${sigCount} · mood 태그 ${moodCount})`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
if (fail > 0) process.exit(1);
