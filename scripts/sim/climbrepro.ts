// 무공서 climbing 회귀 재현 — 봇이 비급 다수 보유 시 정말 상위 트리로 갈아타나(A/B 판별 + 정책 추적).
// 실행: node scripts/sim/_run.cjs scripts/sim/climbrepro.ts
//
// 2026-06-27 갱신: 종전엔 realm 을 ilryu 로 고정한 채 grandmaster 도달만 단언 → G1~G4 이전 봇이
//   **갈래 무시 다운그레이드**(검 빌드인데 학습 가능한 legendary 의술 legend-ilyang-ji 를 주력으로 집음, docs/37 G4)
//   로 "화경 천장"을 찍어 **거짓 PASS** 했다. G4 가 빌드 갈래를 지키도록 고친 뒤, ilryu 고정선 검 grandmaster
//   가 학습 게이트(상위 경지)에 막혀 절정에서 멈추는 게 **올바른 동작**. → 이 가드를 (a) realm 을 전진시켜
//   on-build 검 grandmaster 가 학습 가능하게 하고 (b) **최종 주력이 빌드 갈래(검) 인지까지 단언**하도록 갱신.
//   이제 갈래 무시 다운그레이드면 school!=sword 로 FAIL(사각 닫음).
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
  // realm 전진(planguard 와 동형) — on-build 검 상위 등급의 학습 게이트를 열어준다. ilryu 고정이 아님.
  if (step === 60) useDiscipleStore.getState().update(dsId, { realm: 'jeoljeong' as Realm });
  if (step === 150) useDiscipleStore.getState().update(dsId, { realm: 'chojeoljeong' as Realm });
  if (step === 250) useDiscipleStore.getState().update(dsId, { realm: 'hwagyeong' as Realm });
  if (step === 0 || step === 30 || step === 100 || step === 300) {
    const m = useDiscipleStore.getState().disciples[dsId]?.mainMartialArtId;
    const art = m ? findMartialArt(m) : undefined;
    console.log(`  step ${step}: main=${m}(${art?.grade}·${art?.school}·천장${art ? effectiveRealmCeiling(art.grade) : '-'}) · 보유 ${useDiscipleStore.getState().disciples[dsId]?.martialArts.length}권`);
  }
}
const d = useDiscipleStore.getState().disciples[dsId];
const finalMain = d?.mainMartialArtId;
const finalArt = finalMain ? findMartialArt(finalMain) : undefined;
console.log(`\n[최종] main=${finalMain}(${finalArt?.grade}) · 보유무공 ${d?.martialArts.length}권`);
console.log(`  보유: ${d?.martialArts.map((a) => `${a.artId}(${a.seong})`).join(', ')}`);

// 비급 전권 보유 + realm 전진이면 봇은 **빌드 갈래(검) 사슬로** grandmaster(화경 천장) 주력에 닿아야 한다.
// school 단언이 핵심: 갈래 무시 다운그레이드(legend-ilyang-ji 등 off-build legendary)면 school!=sword 로 FAIL(G4 사각 닫음).
const reachedGm = !!finalArt && realmIndex(effectiveRealmCeiling(finalArt.grade)) >= realmIndex('hwagyeong');
const onBuild = finalArt?.school === 'sword'; // yun-soso = 검 빌드
check('비급 전권 봇이 빌드 갈래(검) 사슬로 화경 천장(grandmaster) 도달', reachedGm && onBuild,
  `최종 ${finalMain}(${finalArt?.grade}·${finalArt?.school}·천장${finalArt ? effectiveRealmCeiling(finalArt.grade) : '-'})`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
