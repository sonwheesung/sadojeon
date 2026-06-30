// 조사 표기 가드(R42, docs/37) — 플레이어 노출 문자열에서 보간 뒤 **날것 조사 템플릿**을 금지한다.
// 버그 패턴: `${어떤단어}(으)로` 처럼 동적 단어 뒤에 조사를 리터럴 `(으)로`/`(이)`/`(을)` 등으로 붙임.
// 올바른 처리: josa(word,'으로','로') 또는 fillName(템플릿) 경유(받침 분기). 한 곳이라도 날것이면 FAIL.
// 실행: npx tsx scripts/sim/koreanjosa.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
// 날것 조사 표기 2종(둘 다 동적 단어 뒤 조사를 받침 분기 없이 리터럴로 붙인 것 — josa()/fillName 으로 고칠 것):
//  ① `(으)로` 식 — 보간 `}` 직후 괄호 조사 템플릿: `}(으)로`·`}(이)가`. (R42 최초 발견분)
//  ② `을(를)` 식 — 보간 `}` 직후 바른 조사 한쪽 + 괄호 대안: `}을(를)`·`}이(가)`. (R47 사이클서 추가 발견 — ①만 보던 가드 사각)
// 조사 화이트리스트로 코드의 우연 `}(`·`}식별자(` 매칭을 배제.
const RAW_PARTICLE = /\}\((으로|로|으|이|가|은|는|을|를|과|와|아|야|이며|이다|이라|으로서|로서|으로써|로써)\)/;
const RAW_PARTICLE_BARE = /\}(을|를|이|가|은|는|과|와|아|야|으로|로)\((을|를|이|가|은|는|과|와|아|야|으로|로)\)/;

function walk(dir: string, out: string[]): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.|\.spec\./.test(e.name)) out.push(p);
  }
}

console.log('═══ 조사 표기 가드 (날것 조사 템플릿 금지) ═══\n');
// src + app 둘 다 스캔 — 플레이어 노출 문자열은 화면(app/)에도 있다(사각: 종전 src 만 스캔, 상점 confirm 누락 발견 2026-06-28).
const files: string[] = [];
walk(join(root, 'src'), files);
walk(join(root, 'app'), files);

const violations: string[] = [];
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    const m = ln.match(RAW_PARTICLE) ?? ln.match(RAW_PARTICLE_BARE);
    if (m) {
      violations.push(`${f.replace(root, '.')}:${i + 1}  ${m[0]}  — ${ln.trim().slice(0, 80)}`);
    }
  });
}

let fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `   ${detail}` : ''}`);
  if (!cond) fail += 1;
}

ck(`날것 조사 템플릿 0 (src+app ${files.length}파일 스캔)`, violations.length === 0, violations.length ? `위반 ${violations.length}건` : '');
if (violations.length) {
  console.log('\n위반 목록(josa(word,"으로","로") 또는 fillName 으로 고칠 것):');
  for (const v of violations) console.log('  ✗ ' + v);
}

console.log(`\n═══ 결과: ${fail === 0 ? '전 계약 PASS ✓' : `${fail} FAIL ✗`} ═══`);
process.exit(fail > 0 ? 1 : 0);
