// 업적 시스템 스모크 — docs/32. 실행: npx tsx scripts/sim/achievements.ts
// 상태 스캔 → 신규 달성 기록 + 무공서 해금(codex) + 계정 영속(회차 리셋 X) + 멱등 검증.
import './_storageShim';
import { useAchievementStore } from '../../src/stores/achievementStore';
import { useCodexStore } from '../../src/stores/codexStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useItemStore } from '../../src/stores/itemStore';
import { useTallyStore } from '../../src/stores/tallyStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { TALLY, STREAK, GRADE_TALLY, DOMAIN_TALLY } from '../../src/data/tallyKeys';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { checkAchievements, seedUnlockedArts } from '../../src/systems/achievementSystem';
import { finalizePendingGraduations } from '../../src/systems/graduationChoice';
import { recordQuestResult } from '../../src/systems/questTally';
import type { Disciple } from '../../src/types/disciple';
import type { Quest } from '../../src/types/quest';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

function reset(): void {
  useAchievementStore.setState({ unlocked: [], unlockedArts: [] });
  useTallyStore.getState().reset();
  useDiscipleStore.getState().reset();
  useGraduateStore.getState().reset();
  useItemStore.setState({ items: [] });
  useCodexStore.setState({ scrolls: [] });
  useInboxStore.getState().reset();
  useTimeStore.getState().reset();
}
// 의뢰 결산 한 건 — 등급·도메인·결과를 받아 집계 적립(recordQuestResult 경유).
function quest(over: Partial<Quest> = {}): Quest {
  return { id: 'q1', domain: 'guard', grade: 'normal', title: '의뢰', client: '아무개', preview: '', weeks: 2, reward: { money: 100, fame: 5 }, recommended: 1, minStat: 0, ...over } as Quest;
}
function settle(outcome: string, q: Partial<Quest> = {}, extra: Record<string, unknown> = {}): void {
  recordQuestResult({ outcome: outcome as never, quest: quest(q), partySize: 1, death: false, fatalSurvived: false, scrollFound: false, divineElixir: false, noble: false, ...extra } as never);
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

// C2b (R17) 회차 마지막 제자가 직업 미확정 채 졸업 → endRun 직전 확정+스캔으로 천마신공 해금 보장.
// 종전 C2 는 graduatedJob 을 직접 주입해 finalize·run-end 경로를 건너뛰어 이 누락을 못 잡았다(Part D ①②):
//   실제론 마지막 제자가 졸업하면 phase='ended'→run-end 직행이라 직업 선택 서신이 방치돼 graduatedJob 이
//   영영 안 박히고, checkAchievements 는 정산 훅에서만 돌아 업적·전설 무공서가 영구 소실됐다.
reset();
addDisc({
  id: 'd1',
  status: 'graduated',
  darknessLevel: 4,
  martialArts: [{ artId: 'hyeolma-gong', seong: 9 }],
  personality: { integrity: 10, freedom: 50, warmth: 50, prudence: 50, mercy: 10, ambition: 90 },
} as Partial<Disciple>);
check('마지막 제자 — 직업 미확정 상태(graduatedJob 없음)', !useDiscipleStore.getState().disciples['d1']?.graduatedJob);
finalizePendingGraduations(); // endRun 이 reset 전에 호출하는 안전망
checkAchievements();
check('미확정 졸업 → 직업 자동 확정(graduatedJob=demon-god)', useDiscipleStore.getState().disciples['d1']?.graduatedJob === 'demon-god');
check('미확정 졸업도 천마 달성 — 누락 없음(R17)', ach().has('ach-demon-god'));
check('미확정 졸업도 천마신공 해금 — 누락 없음(R17)', hasArt('cheonma-singong'));

// C2c 천마 마공 필수 — 검(sword) 9성+흑화 빌드는 천마(demon-god)가 못 된다(암흑술 9성 필수, 사용자 2026-06-20).
reset();
addDisc({
  id: 'd1',
  status: 'graduated',
  darknessLevel: 4,
  martialArts: [{ artId: 'dokgo-gugeom', seong: 9 }],
  personality: { integrity: 10, freedom: 50, warmth: 50, prudence: 50, mercy: 10, ambition: 90 },
} as Partial<Disciple>);
finalizePendingGraduations();
checkAchievements();
check('검 9성+흑화 → 천마(demon-god) 아님(마공 필수)', useDiscipleStore.getState().disciples['d1']?.graduatedJob !== 'demon-god');
check('검 9성+흑화 → 천마신공 미해금', !hasArt('cheonma-singong'));

// C2d (R25) 마교 호법(demonic level 3)도 정점 업적 자격(천마 level 4 한정 아님).
reset();
useGraduateStore.getState().add({ id: 'g1', name: '호법', route: 'demonic', level: 3, title: '마교 호법', power: 80, fame: 70, status: 'active', graduatedYear: 10 } as never);
checkAchievements();
check('마교 호법(demonic level3) → 정점 업적 달성(R25)', ach().has('ach-graduate-peak'));
reset();
useGraduateStore.getState().add({ id: 'g2', name: '마두', route: 'demonic', level: 2, title: '마두', power: 70, fame: 50, status: 'active', graduatedYear: 10 } as never);
checkAchievements();
check('마두(demonic level2) → 정점 업적 미달성(경계)', !ach().has('ach-graduate-peak'));

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

// C7 의뢰 첫 완수 → 강호초행 + 누적 카운트.
reset();
settle('full', { domain: 'guard' });
checkAchievements();
check('의뢰 첫 완수 → 강호초행', ach().has('ach-quest-first'));
check('첫 호행 도메인 달성', ach().has('ach-quest-guard'));
check('완벽 완수 → 흠 없이', ach().has('ach-quest-flawless'));
check('완수 카운터 1', useTallyStore.getState().n(TALLY.questDone) === 1);

// C8 연속 무사고 5 → 무결의 행보(스트릭은 full 만 잇고, 비-full 에 끊김).
reset();
for (let i = 0; i < 5; i += 1) settle('full');
checkAchievements();
check('연속 5 완벽 → 무결의 행보', ach().has('ach-quest-flawless-streak5'), `streak=${useTallyStore.getState().streak(STREAK.flawless)}`);
settle('partial'); // 끊김
settle('full');
check('비-full 후 스트릭 리셋', useTallyStore.getState().streak(STREAK.flawless) === 5, '최고는 유지');

// C9 실패는 완수로 안 잡힘 + questFail 누적.
reset();
settle('fail');
settle('disaster', {}, { death: true });
checkAchievements();
check('실패·재난은 완수 0', useTallyStore.getState().n(TALLY.questDone) === 0);
check('동문 사망 → 잃어버린 동문(숨은)', ach().has('ach-quest-death'));

// C10 극험·청부·신품영약·생환·육예 통달.
reset();
settle('full', { grade: 'extreme', domain: 'duel' });
checkAchievements();
check('극험 완수 → 사지를 넘다', ach().has('ach-quest-extreme'));
reset();
settle('crisis', { grade: 'extreme' }, { divineElixir: true, fatalSurvived: true });
checkAchievements();
check('신품 영약 → 천운(숨은)', ach().has('ach-quest-divine-elixir'));
check('치명상 생환 → 사지에서 돌아오다(숨은)', ach().has('ach-quest-fatal-survived'));
reset();
(['guard', 'scout', 'duel', 'medicine', 'assassin', 'grand'] as const).forEach((domain) => settle('full', { domain }));
checkAchievements();
check('6도메인 완수 → 육예 통달', ach().has('ach-quest-all-domains'));

// ── 극단 보강(2026-06-19) — 임계 오프바이원·음수/거대 카운터·키 일관성·재시드 멱등 ──
// E1 임계 오프바이원 — 9건엔 10건업적 미해금, 정확히 10건에 해금.
reset();
for (let i = 0; i < 9; i += 1) settle('full');
checkAchievements();
check('의뢰 9건 — 10건 업적 미해금(오프바이원)', !ach().has('ach-quest-10'));
settle('full');
checkAchievements();
check('의뢰 정확히 10건 — ach-quest-10 해금', ach().has('ach-quest-10'));
check('10건 시점 — 25/50/100 미해금', !ach().has('ach-quest-25') && !ach().has('ach-quest-50') && !ach().has('ach-quest-100'));

// E2 연속 4 vs 5 경계.
reset();
for (let i = 0; i < 4; i += 1) settle('full');
checkAchievements();
check('4연속 — streak5 미해금', !ach().has('ach-quest-flawless-streak5'));
settle('full');
checkAchievements();
check('5연속 — streak5 해금', ach().has('ach-quest-flawless-streak5'));

// E3 음수/거대 카운터 — 정산 크래시 없음.
reset();
useTallyStore.getState().bump(TALLY.questDone, -5);
let threw = false;
try { checkAchievements(); } catch (e) { threw = true; }
check('음수 카운터 — 정산 크래시 없음·미해금', !threw && !ach().has('ach-quest-10'));
useTallyStore.getState().bump(TALLY.questDone, 1e9);
checkAchievements();
check('거대 카운터 — 누적 업적 해금(크래시 없음)', ach().has('ach-quest-100'));

// E4 tally ↔ 업적 키 일관성 — 업적이 읽는 모든 의뢰 TALLY 키가 적립 경로에 실제 존재.
reset();
settle('full', { grade: 'extreme', domain: 'guard' });
settle('full', { grade: 'dangerous', domain: 'scout' });
settle('full', { domain: 'duel' });
settle('full', { domain: 'medicine' });
settle('full', { domain: 'assassin', gray: true });
settle('full', { grade: 'extreme', domain: 'grand' });
settle('full', { id: 'world-evt-x', faction: 'mujimaeng' });
settle('full', {}, { partySize: 3 });
settle('full', {}, { partySize: 1, noble: true, scrollFound: true });
settle('disaster', {}, { death: true, divineElixir: true });
settle('fail', {}, { fatalSurvived: true });
const counts = useTallyStore.getState().counts;
const bumped = new Set(Object.keys(counts).filter((k) => counts[k] > 0));
const QUEST_KEYS = [TALLY.questDone, TALLY.questFull, GRADE_TALLY.dangerous, GRADE_TALLY.extreme,
  DOMAIN_TALLY.guard, DOMAIN_TALLY.scout, DOMAIN_TALLY.duel, DOMAIN_TALLY.medicine, DOMAIN_TALLY.assassin,
  DOMAIN_TALLY.grand, TALLY.gray, TALLY.sponsored, TALLY.worldEvent, TALLY.solo, TALLY.party, TALLY.noble,
  TALLY.scrollFound, TALLY.divineElixir, TALLY.disasterSurvived, TALLY.death];
const missing = QUEST_KEYS.filter((k) => !bumped.has(k));
check('업적이 읽는 의뢰 TALLY 키 전부 적립 경로 존재', missing.length === 0, missing.length ? `누락=${missing.join(',')}` : '전부 적립');

// E5 seedUnlockedArts 재호출 멱등 — codex 중복 없음.
reset();
addDisc({ id: 'd1', realm: 'hwagyeong' });
checkAchievements();
useCodexStore.setState({ scrolls: [] });
seedUnlockedArts();
const c1 = useCodexStore.getState().scrolls.length;
seedUnlockedArts(); seedUnlockedArts();
check('seedUnlockedArts 다회 호출 — codex 중복 없음', useCodexStore.getState().scrolls.length === c1, `scrolls=${c1}`);

// E6 업적 id 전역 유일(런타임 — 중복이면 정산 시 한 업적이 두 번 켜질 위험).
const ids = ACHIEVEMENTS.map((a) => a.id);
check('업적 id 전역 유일', new Set(ids).size === ids.length, `n=${ids.length}`);

console.log(`\n[정보] 업적 ${ACHIEVEMENTS.length}종 · 측정일 2026-06-19`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
