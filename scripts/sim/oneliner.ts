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
    mourning: false,
    siblingEvent: null,
    questEcho: null,
    jianghuTense: false,
    age: 16,
    mainSeong: 4,
    rivalName: null,
    isWeakest: false,
    saidIds: [],
    recentIds: [],
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

// 6) 중복 금지 — 이미 건넨 "무거운 감정" 특이 대사는 후보에서 빠진다(흑화·불신·적의·정체성만 once-only)
{
  const HEAVY = ['darkening', 'distrust', 'enmity', 'identity'];
  const base = ctx({ discipleId: 'jin-sohwa', darknessRisk: 'medium', age: 16, trust: 25 });
  const before = candidateOneLiners(base);
  const distinctive = before.find((t) => t.mood && HEAVY.includes(t.mood));
  check('무거운 감정 후보 존재(중복 테스트용)', distinctive != null, distinctive?.id);
  if (distinctive) {
    const after = candidateOneLiners({ ...base, saidIds: [distinctive.id] });
    check('이미 건넨 무거운 감정 대사 → 후보 제외', !after.some((t) => t.id === distinctive.id));
  }
  // 일상·전용 가벼운 대사는 saidIds 에 넣어도 계속 후보(반복 허용) — onlyFor 라도 normal/calm 등은 반복
  const filler = before.find((t) => !t.mood || !HEAVY.includes(t.mood));
  if (filler) {
    const after = candidateOneLiners({ ...base, saidIds: [filler.id] });
    check('가벼운 대사는 반복 허용(제외 안 됨)', after.some((t) => t.id === filler.id), filler.id);
  }
}

// 7) 모순 금지 — 흑화 기미(medium+) 중엔 '평온(calm)' 대사가 후보에 안 뜬다
{
  const dark = candidateOneLiners(ctx({ discipleId: 'baek-yeon', darknessRisk: 'medium', age: 16 }));
  check('흑화 중 → calm 대사 배제(모순 방지)', !dark.some((t) => t.mood === 'calm'));
  const lowRisk = candidateOneLiners(ctx({ discipleId: 'baek-yeon', darknessRisk: 'low', age: 16, stress: 20, trust: 60 }));
  check('평온 상태 → calm 대사 등장 가능', lowRisk.some((t) => t.mood === 'calm'));
}

// 7b) 적의 갭(OL4) — 미워하는 동문이 있으면(hasEnemy) calm 대사 배제. 적의→평온 이중인격 차단.
{
  const enemy = candidateOneLiners(ctx({ discipleId: 'none', hasEnemy: true, trust: 70, stress: 20, age: 16 }));
  check('적의 보유 → calm 대사 배제(OL4)', !enemy.some((t) => t.mood === 'calm'));
  const noEnemy = candidateOneLiners(ctx({ discipleId: 'none', hasEnemy: false, trust: 70, stress: 20, age: 16 }));
  check('적의 없음 → calm 대사 등장 가능(대조군)', noEnemy.some((t) => t.mood === 'calm'));
}

// 7c) 동문 상실 애도(mourning) — calm·pride 배제 + grief 후보 등장. 사망 다음 날 평온 대사 차단.
{
  const mourn = candidateOneLiners(ctx({ discipleId: 'none', mourning: true, trust: 70, stress: 20, mainSeong: 8, age: 16 }));
  check('애도 중 → calm 대사 배제', !mourn.some((t) => t.mood === 'calm'));
  check('애도 중 → pride 대사 배제', !mourn.some((t) => t.mood === 'pride'));
  check('애도 중 → grief 대사 등장', mourn.some((t) => t.mood === 'grief'), `${mourn.filter((t) => t.mood === 'grief').length}종`);
  const settled = candidateOneLiners(ctx({ discipleId: 'none', mourning: false, trust: 70, stress: 20, age: 16 }));
  check('애도 풀림 → grief 배제·calm 가능(대조군)', !settled.some((t) => t.mood === 'grief') && settled.some((t) => t.mood === 'calm'));
}

// 7d) 동문 경사·이변 반응 — siblingEvent 신호별로 해당 대사가 후보에 뜬다(질투/축하/걱정).
{
  const envy = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: 'envy', age: 16 }));
  check('동문 경지↑ 질투 → se-envy 대사 등장', envy.some((t) => t.id.startsWith('se-envy')), `${envy.filter((t) => t.id.startsWith('se-envy')).length}종`);
  const admire = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: 'admire', age: 16 }));
  check('동문 경지↑ 축하 → se-admire 대사 등장', admire.some((t) => t.id.startsWith('se-admire')));
  const worry = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: 'worry', age: 16 }));
  check('동문 중상 걱정 → se-worry 대사 등장', worry.some((t) => t.id.startsWith('se-worry')));
  const unease = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: 'unease', age: 16 }));
  check('동문 흑화 불안 → se-unease 대사 등장', unease.some((t) => t.id.startsWith('se-unease')));
  const grief = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: 'grief_far', age: 16 }));
  check('강호 동문 사망 → se-grieffar 대사 등장', grief.some((t) => t.id.startsWith('se-grieffar')));
  const none = candidateOneLiners(ctx({ discipleId: 'none', siblingEvent: null, age: 16 }));
  check('반응 없음 → se-* 대사 배제(대조군)', !none.some((t) => t.id.startsWith('se-')));
}

// 7e) 의뢰 다녀온 여운 — questEcho 별로 본인 자가 대사.
{
  const proud = candidateOneLiners(ctx({ discipleId: 'none', questEcho: 'proud', age: 16 }));
  check('의뢰 완수 → qe-proud 대사 등장', proud.some((t) => t.id.startsWith('qe-proud')));
  const humbled = candidateOneLiners(ctx({ discipleId: 'none', questEcho: 'humbled', stress: 50, age: 16 }));
  check('의뢰 실패 → qe-humbled 대사 등장', humbled.some((t) => t.id.startsWith('qe-humbled')));
  const none = candidateOneLiners(ctx({ discipleId: 'none', questEcho: null, age: 16 }));
  check('여운 없음 → qe-* 배제(대조군)', !none.some((t) => t.id.startsWith('qe-')));
}

// 7f) 강호 흉흉 — jianghuTense 시 jt 대사 등장(양육 중 제자도 정세에 술렁).
{
  const tense = candidateOneLiners(ctx({ discipleId: 'none', jianghuTense: true, age: 16 }));
  check('강호 흉흉 → jt 대사 등장', tense.some((t) => t.id.startsWith('jt')), `${tense.filter((t) => t.id.startsWith('jt')).length}종`);
  const calm = candidateOneLiners(ctx({ discipleId: 'none', jianghuTense: false, age: 16 }));
  check('강호 평온 → jt 배제(대조군)', !calm.some((t) => t.id.startsWith('jt')));
}

// 8) onlyFor 가 가리키는 poolId 는 실제 제자 풀에 존재(오타 방지)
{
  const DISCIPLE_POOL = new Set([
    'jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso', 'gang-muyeol',
    'i-cheongha', 'dokgo-yeon', 'baek-yeon', 'jin-baekho', 'sa-cheonhwa',
  ]);
  const bad = ONE_LINERS.filter((t) => t.onlyFor && !DISCIPLE_POOL.has(t.onlyFor));
  check('전용 onlyFor 모두 유효 제자', bad.length === 0, bad.map((t) => `${t.id}:${t.onlyFor}`).join(','));
}

// 9) recency 회피 — 최근 발화는 후보에서 임시로 빠진다(풀 충분할 때)
{
  const base = ctx({ discipleId: 'jang-cheol', age: 16, trust: 60, stress: 30 });
  const all = candidateOneLiners(base);
  check('jang 후보 풀 충분(recency 테스트)', all.length > 6, `${all.length}종`);
  if (all.length > 6) {
    const recent = all.slice(0, 4).map((t) => t.id);
    const after = candidateOneLiners({ ...base, recentIds: recent });
    const leaked = after.filter((t) => recent.includes(t.id));
    check('최근 발화는 후보에서 제외', leaked.length === 0, `누수 ${leaked.length}`);
  }
  // 풀이 작으면 recency 무시(고갈 방지) — 좁은 상태로 압박
  const narrow = ctx({ discipleId: 'none', darknessRisk: 'high', trust: 90, stress: 5, age: 16 });
  const np = candidateOneLiners(narrow);
  const np2 = candidateOneLiners({ ...narrow, recentIds: np.map((t) => t.id) });
  check('풀 고갈 시 recency 무시(후보 유지)', np2.length > 0, `${np2.length}종`);
}

// 10) 조건 매처 정합 — 빈 조건은 항상 통과
check('빈 조건 통과', matchesCondition(undefined, ctx({})));

const total = ONE_LINERS.length;
const sigCount = ONE_LINERS.filter((t) => t.onlyFor).length;
const moodCount = ONE_LINERS.filter((t) => t.mood).length;
console.log(`\n[정보] 한 마디 ${total}종 (전용 ${sigCount} · mood 태그 ${moodCount})`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
if (fail > 0) process.exit(1);
