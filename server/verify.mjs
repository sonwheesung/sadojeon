// 번들 검증 — server/dist/engine.mjs(Vercel 에 올라갈 바로 그 번들)를 순수 Node 에서 import 해
// newRun/advance 가 RN 없이 돌고 결정적인지 확인. 실행: node server/build-engine.mjs && node server/verify.mjs
import { newRun, advance } from './dist/engine.mjs';

const J = (x) => JSON.stringify(x);
let pass = 0, fail = 0;
const ck = (label, cond) => {
  if (cond) { pass += 1; console.log(`  PASS  ${label}`); }
  else { fail += 1; console.log(`  FAIL  ${label}`); }
};
const PARTY = ['yun-soso', 'i-cheongha', 'jin-sohwa', 'jang-cheol'];
const chain = (seed, days) => {
  let cur = newRun(PARTY, seed);
  for (let i = 0; i < days; i += 1) cur = advance(cur.state, cur.rngState);
  return cur;
};

console.log('═══ Vercel 엔진 번들 검증 (순수 Node import) ═══\n');
const r0 = newRun(PARTY, 12345);
ck('번들 import + newRun 구동(RN 없이)', r0 && r0.state && typeof r0.rngState === 'number');
ck('events 반환', ['pending', 'field', 'cutscene', 'moral'].every((k) => k in r0.events));
const a = chain(2024, 90), b = chain(2024, 90);
ck('advance 체인 결정성(같은 시드 동일)', J(a.state) === J(b.state) && a.rngState === b.rngState);
ck('다른 시드 → 다른 결과', J(a.state) !== J(chain(7777, 90).state));
const mid = chain(333, 45);
ck('상태 로드→advance 재시도 동일(세이브 스커밍 봉쇄)',
  J(advance(mid.state, mid.rngState).state) === J(advance(mid.state, mid.rngState).state));

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
