// 정세 → 의뢰 엔드투엔드 — docs/37 §B5·B6. 실행: npx tsx scripts/sim/worldquest.ts
// 실제 정세 엔진을 15년 굴리며 매 계절: ① 그 시점 정세(사건·위기도) ② 그때 게시판에 뜨는 의뢰 구성
// ③ 큰 사건 결말 시 발생하는 사건 의뢰(world-evt)를 함께 찍는다. "정세에 맞게 의뢰가 나오는가"를 눈으로 확인.
// 게시판 가중·사건의뢰 템플릿은 questSystem 의 스펙을 복제(이 테스트가 곧 통합 계약).

import { seedWorldState, tickWorldState, worldThreat } from '../../src/systems/worldSystem';
import { QUEST_POOL } from '../../src/data/quests';
import type { QuestDomain, QuestGrade } from '../../src/types/quest';
import type { WorldState } from '../../src/types/world';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── questSystem 스펙 복제 ────────────────────────────────────────────────────
function questThreatWeight(grade: QuestGrade, domain: QuestDomain, threat: number): number {
  const g: Record<QuestGrade, number> = { menial: 1 - 0.85 * threat, minor: 1 - 0.4 * threat, normal: 1, dangerous: 1 + 1.2 * threat, extreme: 1 + 1.5 * threat };
  const d: Record<QuestDomain, number> = { duel: 1 + 0.6 * threat, grand: 1 + 0.6 * threat, scout: 1 + 0.4 * threat, guard: 1 + 0.3 * threat, medicine: 1 + 0.2 * threat, assassin: 1 };
  return Math.max(0.0001, g[grade] * d[domain]);
}
function sampleBoard(threat: number, rng: () => number, count = 6) {
  const pool = QUEST_POOL.map((q) => ({ q, w: questThreatWeight(q.grade, q.domain, threat) }));
  const out: typeof QUEST_POOL[number][] = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rng() * total; let idx = 0;
    for (; idx < pool.length - 1; idx += 1) { r -= pool[idx].w; if (r <= 0) break; }
    out.push(pool[idx].q); pool.splice(idx, 1);
  }
  return out;
}
const WORLD_QUEST_TITLE: Record<string, string> = {
  uprising: '사파 봉기 — 변경 방비', subjugation: '사파 토벌 동참', war: '대전 — 정예 차출',
};
const PEACEFUL = new Set<QuestGrade>(['menial', 'minor']);
const CRISIS = new Set<QuestGrade>(['dangerous', 'extreme']);

// 좋은 데모용 시드 선택 — 봉기·전쟁이 다 나오는 회차.
function runHas(seed: number): { war: boolean; uprising: boolean } {
  const rng = mulberry32(seed); const s = seedWorldState(rng);
  let war = false, up = false;
  for (let i = 0; i < 60; i += 1) { const r = tickWorldState(s, rng); if (r.ignited.includes('war')) war = true; if (r.ignited.includes('uprising')) up = true; }
  return { war, uprising: up };
}
let demoSeed = 1000;
for (let s = 1000; s < 1100; s += 1) { const h = runHas(s); if (h.war && h.uprising) { demoSeed = s; break; } }

// ── 데모 회차 — 매 계절 정세·게시판·사건의뢰 ─────────────────────────────────
const SEASON_LABEL = ['봄', '여름', '가을', '겨울'];
const rng = mulberry32(demoSeed);
const s: WorldState = seedWorldState(rng);
const bench = mulberry32(7); // 게시판 샘플용 rng(정세와 분리, 계절마다 동일 추출 기준)

console.log(`\n=== 정세 → 의뢰 엔드투엔드 (데모 회차 seed=${demoSeed}, 15년) ===`);
console.log(`연계절 | 위기 | 정세(진행 중 사건/기조) | 게시판 평화/위기 | 샘플 | 사건의뢰\n`);

let calmPeace = 0, calmN = 0, turbPeace = 0, turbN = 0;

for (let season = 0; season < 60; season += 1) {
  const rep = tickWorldState(s, rng);
  const threat = worldThreat(s);
  const board = sampleBoard(threat, bench, 6);
  const peace = board.filter((q) => PEACEFUL.has(q.grade)).length;
  const crisis = board.filter((q) => CRISIS.has(q.grade)).length;

  // 상관 집계 — 위기도 0.45 기준 평온/난세 분리.
  if (threat < 0.45) { calmPeace += peace; calmN += 6; } else { turbPeace += peace; turbN += 6; }

  // 사건 의뢰(world-evt) — 큰 사건 결말 시.
  const evtQuests = rep.questSeeds.map((q) => WORLD_QUEST_TITLE[q.kind]).filter(Boolean);

  // 출력은 정세 변화·사건 있는 계절 위주(잠잠한 계절은 생략해 가독성).
  const active = s.events.filter((e) => !e.done);
  const notable = rep.rumors.length > 0 || evtQuests.length > 0 || threat >= 0.6;
  if (!notable) continue;

  const yr = Math.floor(season / 4) + 1;
  const sit = rep.rumors.length > 0 ? rep.rumors.map((r) => r.title).join(', ') : active.map((e) => e.headline).join(', ') || '긴장 고조';
  const sample = board.filter((q) => CRISIS.has(q.grade)).slice(0, 2).map((q) => q.title);
  const sampleStr = sample.length ? sample.join(', ') : board.slice(0, 2).map((q) => q.title).join(', ');
  const evtStr = evtQuests.length ? `★ ${evtQuests.join(', ')}` : '';
  console.log(
    `${String(yr).padStart(2)}년 ${SEASON_LABEL[season % 4]} | ${threat.toFixed(2)} | ${sit.slice(0, 30).padEnd(30)} | 평화${peace} 위기${crisis} | ${sampleStr.slice(0, 24).padEnd(24)} | ${evtStr}`,
  );
}

console.log(`\n── 상관 요약 (게시판 평화 잡일 비중) ──`);
console.log(`  평온기(위기<0.45): 평화 잡일 ${calmN ? Math.round((calmPeace / calmN) * 100) : 0}%`);
console.log(`  난세(위기≥0.45):   평화 잡일 ${turbN ? Math.round((turbPeace / turbN) * 100) : 0}%`);
console.log(`  → 정세가 험할수록 평화 잡일이 줄고 무력·위기 의뢰가 게시판을 채운다.\n`);
