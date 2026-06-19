// 무공서 climbing 회귀 재현 — 봇이 상위 비급 보유 시 정말 갈아타나(A/B 판별).
// 실행: node scripts/sim/_run.cjs scripts/sim/climbrepro.ts
import { setResearchInstant } from '@/systems/researchSystem';
import { seedNewRun } from '@/systems/newRun';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useCodexStore } from '@/stores/codexStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { configureOptimal } from '@/systems/dev/policyHelpers';
// 단일 제자만 시드하므로 configureOptimal 이 곧 그 제자의 configureCarryTraining 1회.
const configureCarryTraining = (_id: string): void => configureOptimal();
import { findMartialArt, canLearnArt, MARTIAL_ARTS } from '@/data/martialArts';
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

// 화산 검 정점(이십사수매화검, grandmaster) 까지의 전 선행 사슬.
const HWASAN_SWORD_CHAIN = [
  'hwasan-gicho-sword', 'hwasan-nakhwa-sword', 'yukhap-sword', 'hwasan-undae-sword',
  'hwasan-maehwa-samrong-sword', 'hwasan-kwae-sword', 'maehwa-sword', 'jaha-sword',
  'isipsa-maehwa-sword',
];

console.log('═══ climbing 재현 — 봇이 상위 비급 보유 시 갈아타나 ═══\n');

seedNewRun(['yun-soso']);
const dsId = 'yun-soso';
const ds = useDiscipleStore.getState();
let d = ds.disciples[dsId];
console.log(`[시작] ${d?.name} · realm=${d?.realm} · main=${d?.mainMartialArtId} · 보유무공 ${d?.martialArts.map((a) => a.artId).join(',')}`);
console.log(`       efficiency.sword=${d?.efficiency?.sword}`);

// 화산 검 사슬 전권을 코덱스에 complete 로 넣는다(드랍이 다 모인 상태 = 진단의 "비급 5~6권").
for (const id of HWASAN_SWORD_CHAIN) grant(id);
console.log(`\n[코덱스] 화산 검 사슬 ${HWASAN_SWORD_CHAIN.length}권 complete 주입`);

// 경지를 절정으로 올린다(상급 무공 학습 경지 게이트 충족 — grandmaster 는 ilryu+ 면 학습 가능).
// realmProgress·status 도 학습 가능 상태로.
useDiscipleStore.getState().update(dsId, { realm: 'jeoljeong' as Realm });

// 봇 정책 1회 — 갈아타는지.
configureCarryTraining(dsId);
d = useDiscipleStore.getState().disciples[dsId];
console.log(`\n[정책 1회 후] main=${d?.mainMartialArtId} · 보유무공 ${d?.martialArts.map((a) => `${a.artId}(${a.seong})`).join(', ')}`);

// 봇이 화산 사슬의 어딘가(기초검부터)로 갈아탔어야 한다 — samjae 에 머물면 climbing 깨짐.
const main1 = useDiscipleStore.getState().disciples[dsId]?.mainMartialArtId;
check('정책이 samjae-sword 에서 화산 트리로 갈아탐(또는 학습)', main1 !== 'samjae-sword' && main1 != null, `main=${main1}`);

// 여러 날 돌려 성을 강제로 올리며(매 스텝 주력 무공 +성), 끝까지 정점(이십사수매화검)에 닿나.
// trainingSystem 없이 성을 직접 키워 정책의 "다음 단계 선택"만 검증.
for (let step = 0; step < 200; step += 1) {
  useTimeStore.setState((s: { totalDay: number }) => ({ ...s, totalDay: step } as never));
  configureCarryTraining(dsId);
  const cur = useDiscipleStore.getState().disciples[dsId];
  const mainId = cur?.mainMartialArtId;
  // 현재 주력 무공의 성을 +1(상한 무시 — 재현 전용).
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
}
d = useDiscipleStore.getState().disciples[dsId];
const finalMain = d?.mainMartialArtId;
const ownsApex = d?.martialArts.some((a) => a.artId === 'isipsa-maehwa-sword');
console.log(`\n[200스텝 후] main=${finalMain}`);
console.log(`  보유무공: ${d?.martialArts.map((a) => `${a.artId}(${a.seong})`).join(', ')}`);
check('정점(이십사수매화검) 학습 도달', !!ownsApex, ownsApex ? '' : '정점 미도달 — climbing 정체');

// canLearnArt 직접 확인 — 정점의 선행이 다 채워졌을 때 학습 가능한가(게임 로직 자체).
const apex = findMartialArt('isipsa-maehwa-sword')!;
// 정점 선행을 강제 충족: maehwa 6성·jaha 4성 보유 상태로 세팅.
useDiscipleStore.setState((s) => {
  const dd = s.disciples[dsId];
  if (!dd) return s;
  const ensure = (artId: string, seong: number) => {
    const ex = dd.martialArts.find((a) => a.artId === artId);
    if (ex) ex.seong = Math.max(ex.seong, seong);
    else dd.martialArts.push({ artId, seong, exp: 0, unlockedAt: 0 });
  };
  ensure('maehwa-sword', 6);
  ensure('jaha-sword', 4);
  return { disciples: { ...s.disciples, [dsId]: { ...dd, martialArts: [...dd.martialArts] } } };
});
d = useDiscipleStore.getState().disciples[dsId];
const canLearn = canLearnArt(d!, apex);
check('canLearnArt(정점) — 선행·경지 충족 시 학습 자격 OK(게임 로직 건전)', canLearn, `realm=${d?.realm}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
