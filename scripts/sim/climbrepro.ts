// 무공서 climbing 회귀 재현 — 봇이 비급 다수 보유 시 정말 상위 트리로 갈아타나(A/B 판별 + 정책 추적).
// 실행: node scripts/sim/_run.cjs scripts/sim/climbrepro.ts
import { setResearchInstant } from '@/systems/researchSystem';
import { seedNewRun } from '@/systems/newRun';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useCodexStore } from '@/stores/codexStore';
import { useTimeStore } from '@/stores/timeStore';
import { configureOptimal } from '@/systems/dev/policyHelpers';
import { findMartialArt, canLearnArt, MARTIAL_ARTS } from '@/data/martialArts';
import { effectiveRealmCeiling, realmIndex } from '@/data/realm';
import type { Realm } from '@/types/realm';

setResearchInstant(true);

let pass = 0, fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

function grant(artId: string): void {
  useCodexStore.getState().addScroll({
    artId, acquiredAtRun: 1, acquiredAtDay: 0,
    status: 'complete', researchProgress: 100, isTrap: false, isIncomplete: false,
  });
}

console.log('═══ climbing 재현 — 비급 전권 보유 봇이 상위 트리로 오르나 ═══\n');

seedNewRun(['yun-soso']);
const dsId = 'yun-soso';

// 비급 전권을 complete 로 — factorysweep 후기 상태(194권) 재현.
for (const a of MARTIAL_ARTS) if (a.acquisition === 'quest') grant(a.id);
console.log(`[코덱스] quest 비급 전권 complete 주입 (${useCodexStore.getState().scrolls.length}권)`);

// 일류로(grandmaster 학습 게이트 충족).
useDiscipleStore.getState().update(dsId, { realm: 'ilryu' as Realm });

// 200스텝 — 매 스텝 정책 호출 + 주력 무공 성 +1(상한 무시, 재현 전용).
for (let step = 0; step < 400; step += 1) {
  useTimeStore.setState((s: { totalDay: number }) => ({ ...s, totalDay: step } as never));
  configureOptimal();
  const cur = useDiscipleStore.getState().disciples[dsId];
  const mainId = cur?.mainMartialArtId;
  if (mainId) {
    useDiscipleStore.setState((s) => {
      const dd = s.disciples[dsId];
      if (!dd) return s;
      const arts = dd.martialArts.map((a) =>
        a.artId === mainId ? { ...a, seong: Math.min(10, a.seong + 1) } : a,
      );
      return { disciples: { ...s.disciples, [dsId]: { ...dd, martialArts: arts } } };
    });
  }
  if (step === 0 || step === 30 || step === 100) {
    const m = useDiscipleStore.getState().disciples[dsId]?.mainMartialArtId;
    const art = m ? findMartialArt(m) : undefined;
    console.log(`  step ${step}: main=${m}(${art?.grade}·천장${art ? effectiveRealmCeiling(art.grade) : '-'}) · 보유 ${useDiscipleStore.getState().disciples[dsId]?.martialArts.length}권`);
  }
}
const d = useDiscipleStore.getState().disciples[dsId];
const finalMain = d?.mainMartialArtId;
const finalArt = finalMain ? findMartialArt(finalMain) : undefined;
console.log(`\n[최종] main=${finalMain}(${finalArt?.grade}) · 보유무공 ${d?.martialArts.length}권`);
console.log(`  보유: ${d?.martialArts.map((a) => `${a.artId}(${a.seong})`).join(', ')}`);

// 비급 전권 보유 + 충분한 시간이면 봇은 grandmaster(화경 천장) 주력에 닿아야 한다.
const reachedGm = !!finalArt && realmIndex(effectiveRealmCeiling(finalArt.grade)) >= realmIndex('hwagyeong');
check('비급 전권 보유 봇이 화경 천장(grandmaster+) 주력에 도달', reachedGm,
  `최종 천장 ${finalArt ? effectiveRealmCeiling(finalArt.grade) : '-'}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
