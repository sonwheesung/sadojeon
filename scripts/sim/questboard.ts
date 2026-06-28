// 의뢰 게시판 ⇄ 강호 정세 연동 — docs/37 §B6 계약 검증. 실행: npx tsx scripts/sim/questboard.ts
// 위기도(threat 0~1)별 게시판 구성을 측정: 위기가 오르면 평화 잡일(menial·minor)이 줄고
// 무력·위기 의뢰(dangerous+)가 늘어야 한다(사파 습격 중 '마을 청소'가 뜨면 안 됨).
// 가중 공식은 questSystem.questThreatWeight 의 스펙을 복제(이 테스트가 곧 계약 명세).

import { QUEST_POOL } from '../../src/data/quests';
import type { QuestDomain, QuestGrade } from '../../src/types/quest';

// ── 계약 스펙(= questSystem.questThreatWeight 와 동일해야 함) ──────────────────
function questThreatWeight(grade: QuestGrade, domain: QuestDomain, threat: number): number {
  const gradeW: Record<QuestGrade, number> = {
    menial: 1 - 0.85 * threat,
    minor: 1 - 0.4 * threat,
    normal: 1,
    dangerous: 1 + 1.2 * threat,
    extreme: 1 + 1.5 * threat,
  };
  const domainW: Record<QuestDomain, number> = {
    duel: 1 + 0.6 * threat,
    grand: 1 + 0.6 * threat,
    scout: 1 + 0.4 * threat,
    guard: 1 + 0.3 * threat,
    medicine: 1 + 0.2 * threat,
    assassin: 1,
  };
  return Math.max(0.0001, gradeW[grade] * domainW[domain]);
}

// 결정적 PRNG(mulberry32·고정 시드) — 회귀 가드는 재현 가능해야 한다(비시드 Math.random 금지, R39).
let _rngState = 0x9e3779b9;
function rnd(): number {
  _rngState = (_rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(_rngState ^ (_rngState >>> 15), 1 | _rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function weightedSample<T>(items: readonly T[], weightFn: (x: T) => number, count: number): T[] {
  const pool = items.map((x) => ({ x, w: Math.max(0.0001, weightFn(x)) }));
  const picked: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rnd() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx += 1) {
      r -= pool[idx].w;
      if (r <= 0) break;
    }
    picked.push(pool[idx].x);
    pool.splice(idx, 1);
  }
  return picked;
}

const PEACEFUL = new Set<QuestGrade>(['menial', 'minor']); // 평화 잡일
const CRISIS = new Set<QuestGrade>(['dangerous', 'extreme']); // 무력·위기
const BOARD = 6; // 게시판 기본 건수
const N = 10000; // 표본(통계 3룰 ① 1만+)

interface Row {
  threat: number;
  peacefulPct: number;
  peacefulFrac: number; // 원분수(반올림 전) — 비율 단언은 정수%가 아닌 이걸 쓴다(R39 경계취약 제거)
  crisisPct: number;
  combatDomainPct: number; // duel/grand/scout/guard
}

function measure(threat: number): Row {
  let peaceful = 0;
  let crisis = 0;
  let combatDomain = 0;
  let total = 0;
  const combatDomains = new Set<QuestDomain>(['duel', 'grand', 'scout', 'guard']);
  for (let i = 0; i < N; i += 1) {
    const board = weightedSample(QUEST_POOL, (q) => questThreatWeight(q.grade, q.domain, threat), BOARD);
    for (const q of board) {
      total += 1;
      if (PEACEFUL.has(q.grade)) peaceful += 1;
      if (CRISIS.has(q.grade)) crisis += 1;
      if (combatDomains.has(q.domain)) combatDomain += 1;
    }
  }
  return {
    threat,
    peacefulPct: Math.round((peaceful / total) * 100),
    peacefulFrac: peaceful / total,
    crisisPct: Math.round((crisis / total) * 100),
    combatDomainPct: Math.round((combatDomain / total) * 100),
  };
}

const rows = [0, 0.25, 0.5, 0.75, 1].map(measure);

console.log('\n=== docs/37 §B6 의뢰 게시판 ⇄ 정세 연동 — 위기도별 구성 (n=' + N + '판) ===\n');
console.log('  위기도   평화잡일%  무력·위기%  무력도메인%');
for (const r of rows) {
  console.log(
    `  ${r.threat.toFixed(2)}     ${String(r.peacefulPct).padStart(6)}    ${String(r.crisisPct).padStart(7)}    ${String(r.combatDomainPct).padStart(8)}`,
  );
}

// 계약 단언.
const calm = rows[0];
const war = rows[rows.length - 1];
const peacefulMonotone = rows.every((r, i) => i === 0 || r.peacefulPct <= rows[i - 1].peacefulPct + 1);
const crisisMonotone = rows.every((r, i) => i === 0 || r.crisisPct >= rows[i - 1].crisisPct - 1);
// 주: QUEST_POOL 은 전투 위주(menial·minor 소수) → 평시에도 평화잡일은 소수가 정상.
// 계약의 핵심은 절대치가 아니라 "평시엔 존재, 전시엔 급감"의 상대 변화.
const checks = [
  { name: '평온(0) 평화잡일 존재', pass: calm.peacefulPct >= 12, got: `${calm.peacefulPct}%`, want: '≥12%' },
  { name: '평온 대비 전시 잡일 급감', pass: calm.peacefulFrac >= war.peacefulFrac * 3, got: `${calm.peacefulPct}%→${war.peacefulPct}%`, want: '평시 ≥ 3×전시' },
  { name: '고위기(1) 평화잡일 급감', pass: war.peacefulPct <= 8, got: `${war.peacefulPct}%`, want: '≤8%' },
  { name: '평화잡일 위기에 단조 감소', pass: peacefulMonotone, got: rows.map((r) => r.peacefulPct).join('→'), want: '단조↓' },
  { name: '무력·위기 의뢰 단조 증가', pass: crisisMonotone, got: rows.map((r) => r.crisisPct).join('→'), want: '단조↑' },
  { name: '고위기 무력·위기 우세', pass: war.crisisPct >= 55, got: `${war.crisisPct}%`, want: '≥55%' },
];

console.log('');
for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name.padEnd(22)} ${c.got}  (기대 ${c.want})`);
const fails = checks.filter((c) => !c.pass).length;
console.log(`\n결과: ${fails === 0 ? '전 계약 PASS ✓' : `FAIL ${fails}건 ✗`}\n`);
if (fails > 0) process.exit(1);
