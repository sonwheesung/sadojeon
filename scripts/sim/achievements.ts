// 업적 시스템 스모크 — docs/32. 실행: npx tsx scripts/sim/achievements.ts
// 상태 스캔 → 신규 달성 기록 + 무공서 해금(codex) + 계정 영속(회차 리셋 X) + 멱등 검증.
import './_storageShim';
import { useAchievementStore } from '../../src/stores/achievementStore';
import { useCodexStore } from '../../src/stores/codexStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useItemStore } from '../../src/stores/itemStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { checkAchievements, seedUnlockedArts } from '../../src/systems/achievementSystem';
import type { Disciple } from '../../src/types/disciple';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

function reset(): void {
  useAchievementStore.setState({ unlocked: [], unlockedArts: [] });
  useDiscipleStore.getState().reset();
  useGraduateStore.getState().reset();
  useItemStore.setState({ items: [] });
  useCodexStore.setState({ scrolls: [] });
  useInboxStore.getState().reset();
  useTimeStore.getState().reset();
}
function addDisc(patch: Partial<Disciple>): void {
  useDiscipleStore.getState().add({ id: patch.id ?? 'd1', name: '제자', status: 'training', relationships: {}, martialArts: [], realm: 'samryu', darknessLevel: 0, ...patch } as unknown as Disciple);
}
const ach = () => useAchievementStore.getState();
const hasArt = (id: string) => useCodexStore.getState().hasScroll(id);

console.log('═══ 업적 시스템 스모크 ═══\n');

// C1 화경 → 환골탈태 달성 + 역근경 해금.
reset();
addDisc({ id: 'd1', realm: 'hwagyeong' });
checkAchievements();
check('화경 제자 → 환골탈태 달성', ach().has('ach-hwagyeong'));
check('환골탈태 → 역근경 해금(codex)', hasArt('yeokgeun-gyeong'));
check('역근경 unlockedArts 기록', ach().hasArt('yeokgeun-gyeong'));

// C2 천마 졸업 → 천마신공 해금.
reset();
addDisc({ id: 'd1', status: 'graduated', graduatedJob: 'demon-god', darknessLevel: 4 } as Partial<Disciple>);
checkAchievements();
check('천마 졸업 → 천마(天魔) 달성', ach().has('ach-demon-god'));
check('천마 → 천마신공 해금(codex)', hasArt('cheonma-singong'));

// C3 검성 졸업 → 독고구검 해금.
reset();
addDisc({ id: 'd1', status: 'graduated', graduatedJob: 'sword-saint' } as Partial<Disciple>);
checkAchievements();
check('검성 졸업 → 독고구검 해금', hasArt('dokgo-gugeom'));

// C4 신품초 보유 → 신품을 캐다.
reset();
useItemStore.getState().add({ id: 'herb-divine', name: '신품 영초', category: 'material', count: 1 } as never);
checkAchievements();
check('신품초 보유 → 신품을 캐다', ach().has('ach-divine-herb'));

// C5 멱등 — 재스캔해도 중복 기록·중복 알림 없음.
reset();
addDisc({ id: 'd1', realm: 'hwagyeong' });
checkAchievements();
const n1 = useInboxStore.getState().items.length;
const u1 = ach().unlocked.length; // 화경 제자 = 절정+초절정+화경 동시 달성(정상)
checkAchievements();
const n2 = useInboxStore.getState().items.length;
check('재스캔 멱등(달성·알림 불변)', n1 === n2 && u1 === ach().unlocked.length && u1 >= 3, `알림 ${n1}→${n2}·달성 ${u1}`);

// C6 계정 영속 — 회차 리셋(disciple/codex 비움) 후에도 업적 유지 + seedUnlockedArts 가 해금 무공 재시드.
const keptUnlocked = [...ach().unlocked];
const keptArts = [...ach().unlockedArts];
useDiscipleStore.getState().reset();
useCodexStore.setState({ scrolls: [] }); // 새 회차 codex 비움
// achievementStore 는 건드리지 않음(계정 단위)
seedUnlockedArts();
check('회차 리셋해도 업적 누적 유지', ach().unlocked.length === keptUnlocked.length && keptUnlocked.length > 0);
check('해금 무공 새 회차 codex 재시드', keptArts.length > 0 && keptArts.every((a) => hasArt(a)), keptArts.join(','));

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
