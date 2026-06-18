// 한국어 조사 유틸 검증 — 실행: npx tsx scripts/sim/korean.ts
import { hasBatchim, josa, fillName } from '../../src/utils/korean';

let pass = 0, fail = 0;
const ck = (label: string, got: unknown, exp: unknown) => {
  if (got === exp) { pass += 1; console.log(`  PASS  ${label}  = ${got}`); }
  else { fail += 1; console.log(`  FAIL  ${label}  got ${got} · exp ${exp}`); }
};

console.log('═══ 한국어 조사 유틸 ═══\n');
// 받침 — 시작 제자 이름들.
ck('hasBatchim 장철(받침)', hasBatchim('장철'), true);
ck('hasBatchim 백연(받침)', hasBatchim('백연'), true);
ck('hasBatchim 한바람(받침)', hasBatchim('한바람'), true);
ck('hasBatchim 진소화(無)', hasBatchim('진소화'), false);
ck('hasBatchim 이청하(無)', hasBatchim('이청하'), false);
ck('hasBatchim 진백호(받침)', hasBatchim('진백호'), false); // 호 무받침
// josa
ck('josa 장철+이/가', josa('장철', '이', '가'), '장철이');
ck('josa 진소화+이/가', josa('진소화', '이', '가'), '진소화가');
// fillName — 받침/무받침 분기
ck('fill {name}이(받침)', fillName('{name}이 떠났다', { name: '장철' }), '장철이 떠났다');
ck('fill {name}이(무)', fillName('{name}이 떠났다', { name: '진소화' }), '진소화가 떠났다');
ck('fill {rival}를(받침)', fillName('{rival}를 이겼다', { rival: '장철' }), '장철을 이겼다');
ck('fill {rival}를(무)', fillName('{rival}를 이겼다', { rival: '진소화' }), '진소화를 이겼다');
ck('fill {name}는(무)', fillName('{name}는', { name: '진소화' }), '진소화는');
ck('fill {name}는(받침)', fillName('{name}는', { name: '백연' }), '백연은');
ck('fill {name}과(무)', fillName('{name}과 함께', { name: '진소화' }), '진소화와 함께');
ck('fill {name}으로(무)', fillName('{name}으로', { name: '도사' }), '도사로');
ck('fill {name}으로(받침)', fillName('{name}으로', { name: '정탐꾼' }), '정탐꾼으로');
ck('fill {name}의 불변', fillName('{name}의 검', { name: '진소화' }), '진소화의 검');
ck('fill 공백 뒤 조사 아님', fillName('{name} 떡이', { name: '장철' }), '장철 떡이');
ck('fill 동문 폴백', fillName('{rival}는 강했다', { rival: '동문' }), '동문은 강했다');
ck('fill 다중 키', fillName('{name}이 {sibling}을', { name: '진소화', sibling: '백연' }), '진소화가 백연을');

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
