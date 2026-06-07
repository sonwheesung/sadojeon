// 헤드리스 실코드 자동플레이 — 실제 TS 시스템(timeSystem·이벤트·면담·영약…)을 Node에서 구동.
// LLM(executorch)은 Node에서 require 실패 → 규칙 폴백(RuleResolver). 즉 LLM 출력은 빠지고
// "이벤트·면담·사문이벤트가 맞는 상황에 발동하고 규칙 해소가 크래시 없이 도는지"를 실코드로 검증.
// 실행: npx tsx .claude/skills/balance-sim/headless.ts [years]

import { seedNewRun } from '@/systems/newRun';
import { autoPlayRun, type AutoPlayEvent } from '@/systems/dev/autoPlay';

async function main() {
  const years = Number(process.argv[2] ?? 15);
  // 자유 제자 4명 시드(poolId — recruitPool).
  seedNewRun(['jang-cheol', 'jin-sohwa', 'yun-soso', 'baek-yeon']);

  const events: AutoPlayEvent[] = [];
  await autoPlayRun(
    years * 336,
    (e) => events.push(e),
    (done, total) => {
      if (done % 336 === 0 || done === total) process.stderr.write(`  진행 ${done}/${total}일\n`);
    },
  );

  // 요약
  const byDomain: Record<string, number> = {};
  let llm = 0;
  for (const e of events) {
    byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
    if (e.llmPrompt || e.llmRaw) llm += 1;
  }
  console.log(`\n=== 헤드리스 자동플레이 ${years}년 — 발동 ${events.length}건 (LLM ${llm}건, 규칙폴백) ===`);
  console.log('도메인별:', Object.entries(byDomain).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' / '));

  // 트리거 상황 표본 — 도메인별 첫 3건(맞는 상황에 떴는지 육안 검증).
  const seen: Record<string, number> = {};
  console.log('\n--- 트리거 상황 표본(도메인별 최대 3건) ---');
  for (const e of events) {
    if ((seen[e.domain] ?? 0) >= 3) continue;
    seen[e.domain] = (seen[e.domain] ?? 0) + 1;
    const c = e.ctx ? `${e.ctx.name} ${e.ctx.age}세·${e.ctx.realm}·스트레스${e.ctx.stress}·신뢰${e.ctx.trust}·흑화${e.ctx.darkness}` : '-';
    const pick = e.choiceLabel ? ` → ${e.choiceLabel}` : '';
    console.log(`  [${e.date}] ${e.domain}: ${e.title} | ${c}${pick}`);
  }
}

main().catch((e) => {
  console.error('헤드리스 실행 실패:', e);
  process.exit(1);
});
