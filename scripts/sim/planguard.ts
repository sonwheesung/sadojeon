// 무공 계획 로직 회귀 가드 — 봇(configureOptimal)이 비급 사슬을 끝까지 타는가.
// 2026-06-19 추적 결론: 계획 로직(goalArtFor/planArtToward)은 건전. 화경 0% 회귀의 원인은
//   "의뢰 드랍으로 grandmaster 사슬이 완성 안 됨"(경지 페이싱 감속 c4a780d 의 부수효과,
//   카리가 extreme 의뢰 역량 고경지에 못 닿아 grandmaster 비급 드랍 0.75 를 못 받음).
// 이 가드는 사슬(complete 비급)만 쥐여주면 봇이 화경 천장(grandmaster)까지 올라감을 못박는다 —
//   계획 로직이 다시 깨지면(예: 경공·저급 고착) 여기서 FAIL.
// 실행: node scripts/sim/_run.cjs scripts/sim/plandiag.ts
import { setResearchInstant } from '@/systems/researchSystem';
import { seedNewRun } from '@/systems/newRun';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useCodexStore } from '@/stores/codexStore';
import { useTimeStore } from '@/stores/timeStore';
import { configureOptimal, goalArtFor } from '@/systems/dev/policyHelpers';
import { findMartialArt, MARTIAL_ARTS } from '@/data/martialArts';
import { effectiveRealmCeiling, realmIndex } from '@/data/realm';
import type { Realm } from '@/types/realm';

setResearchInstant(true);

let pass = 0;
let fail = 0;
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

console.log('═══ 무공 계획 로직 가드 — 검 빌드 카리(yun-soso) ═══\n');

// 1회차 — quest 비급 전권 complete(사슬 다 모였다 가정). resetForNewRun 인공물 회피: seedNewRun 1회.
seedNewRun(['yun-soso']);
const dsId = 'yun-soso';
for (const a of MARTIAL_ARTS) if (a.acquisition === 'quest') grant(a.id);
const sc = useCodexStore.getState().scrolls.find((x) => x.artId === 'hwasan-gicho-sword');
check('quest 비급 전권이 complete 로 들어감', sc?.status === 'complete', `hwasan-gicho-sword=${sc?.status}`);

// 계획 로직이 검 grandmaster(이십사수매화검)를 최종 목표로 잡나(경공·저급이 아니라).
useDiscipleStore.getState().update(dsId, { realm: 'ilryu' as Realm });
const goal0 = goalArtFor(useDiscipleStore.getState().disciples[dsId]!);
check('비급 전권 보유 시 goal=검 grandmaster', goal0?.grade === 'grandmaster' && goal0.school === 'sword', `goal=${goal0?.id}(${goal0?.grade}·${goal0?.school})`);

// training 고정 + 주력 성 점진 → 검 사슬 끝까지 타는가.
useDiscipleStore.getState().update(dsId, { realm: 'iryu' as Realm });
let prevMain = '';
const visited: string[] = [];
for (let step = 0; step < 300; step += 1) {
  useTimeStore.setState((s: { totalDay: number }) => ({ ...s, totalDay: step } as never));
  configureOptimal();
  const m = useDiscipleStore.getState().disciples[dsId]?.mainMartialArtId ?? '';
  if (m !== prevMain) { visited.push(m); prevMain = m; }
  if (step % 3 === 2 && m) {
    useDiscipleStore.setState((s) => {
      const dd = s.disciples[dsId]; if (!dd) return s;
      const arts = dd.martialArts.map((a) => a.artId === m ? { ...a, seong: Math.min(10, a.seong + 1) } : a);
      return { disciples: { ...s.disciples, [dsId]: { ...dd, martialArts: arts } } };
    });
  }
  if (step === 60) useDiscipleStore.getState().update(dsId, { realm: 'ilryu' as Realm });
  if (step === 150) useDiscipleStore.getState().update(dsId, { realm: 'jeoljeong' as Realm });
}
const d = useDiscipleStore.getState().disciples[dsId];
const finalArt = d?.mainMartialArtId ? findMartialArt(d.mainMartialArtId) : undefined;
console.log(`  [궤적] ${visited.join(' → ')}`);
check('검 사슬을 끝까지 타 화경 천장(grandmaster) 주력 도달',
  !!finalArt && realmIndex(effectiveRealmCeiling(finalArt.grade)) >= realmIndex('hwagyeong'),
  `최종 ${d?.mainMartialArtId}(${finalArt?.grade}·천장${finalArt ? effectiveRealmCeiling(finalArt.grade) : '-'})`);
check('경공(chosangbi)에 고착되지 않음', d?.mainMartialArtId !== 'chosangbi', `최종 주력 ${d?.mainMartialArtId}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
