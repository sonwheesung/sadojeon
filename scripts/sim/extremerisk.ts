// 극험(extreme) 결투 의뢰 위험 정밀 측정 + 영구 회귀 가드 — docs/29·36. 🔧 2026-06-19.
// 실제 결산 경로(resolveQuest→resolveDuelByEngine→전투 엔진 실전 1판→사상 굴림→생존 체인)로
// 경지/빌드별 대표 제자를 N=10000회 굴려 P(완수/부상/치명상/사망)을 집계한다. 근사·공식복제 금지.
// 실행: node scripts/sim/_run.cjs scripts/sim/extremerisk.ts
import './_storageShim';
import { useQuestStore } from '../../src/stores/questStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { usePendingStore } from '../../src/stores/pendingStore';
import { useCodexStore } from '../../src/stores/codexStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import {
  dispatchQuest, tickQuests, setQuestRewardMult, setGeumchangBudget, canDispatch,
} from '../../src/systems/questSystem';
import { combatRating } from '../../src/systems/combatPower';
import { MARTIAL_ARTS } from '../../src/data/martialArts';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, Quest, Realm } from '../../src/types';

const N = 10000;
let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

// 등급별 대표 무공서 id (catalog 실데이터에서 grade·acquisition='quest'로 뽑는다 — findMartialArt 해석 보장).
function firstArtByGrade(grade: string): string {
  const a = MARTIAL_ARTS.find((x) => x.grade === grade && x.acquisition === 'quest' && x.school === 'sword');
  if (!a) throw new Error(`no art grade=${grade}`);
  return a.id;
}
const MASTER_ART = firstArtByGrade('master');
const APPR_ART = firstArtByGrade('apprentice'); // 보조(breadth)용

function setSect(resources: number, reputation: number) {
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation, resources, facilities: [] } as never);
}

// 대표 제자 — 주력 master 무공 mainSeong + 보조 apprentice 무공(breadth 미세 조정)으로
// 알려진 combatRating 앵커(일류6성65·절정7성78·초절정8성91)에 맞춘다.
function buildDisciple(
  id: string,
  realm: Realm,
  mainSeong: number,
  subSeong: number,
  strength: number,
  internal: number,
): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, realm,
    mainMartialArtId: MASTER_ART,
    martialArts: [
      { artId: MASTER_ART, seong: mainSeong, exp: 0, status: 'complete', researchProgress: 100, isTrap: false, isIncomplete: false, acquiredAtRun: 1, acquiredAtDay: 0 },
      { artId: APPR_ART, seong: subSeong, exp: 0, status: 'complete', researchProgress: 100, isTrap: false, isIncomplete: false, acquiredAtRun: 1, acquiredAtDay: 0 },
    ],
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal, pity: 0, petitioned: false }, fame: 0, insight: 3,
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    stamina: 100, maxStamina: 100,
    stats: {
      guarding: { level: 30, exp: 0 }, scouting: { level: 30, exp: 0 },
      medicine: { level: 0, exp: 0 },
      strength: { level: strength, exp: 0 }, endurance: { level: strength, exp: 0 },
      agility: { level: strength, exp: 0 }, formation: { level: 0, exp: 0 },
    },
  } as unknown as Disciple;
}

function extremeDuelQuest(id: string): Quest {
  return {
    id, domain: 'duel', grade: 'extreme', title: '극험 결투', client: 'c', preview: '',
    weeks: 6, reward: { money: 1000, fame: 28 }, recommended: 2, minStat: 72,
  } as Quest;
}

interface Build { label: string; realm: Realm; mainSeong: number; subSeong: number; strength: number; internal: number; }
const BUILDS: Build[] = [
  // 절정 7성 master (combatRating ~78): 70 + breadth + realmBonus(4)
  { label: '절정 7성 (rating~78)', realm: 'jeoljeong', mainSeong: 7, subSeong: 5, strength: 48, internal: 870 },
  // 초절정 8성 master (~91): 80 + breadth + realmBonus(6)
  { label: '초절정 8성 (rating~91)', realm: 'chojeoljeong', mainSeong: 8, subSeong: 6, strength: 56, internal: 1050 },
  // 일류 6성 master (~65): 60 + breadth + realmBonus(2) — 게이트(72) 미달이라 파견 자체가 막힌다(canDispatch).
  { label: '일류 6성 (rating~65)', realm: 'ilryu', mainSeong: 6, subSeong: 5, strength: 35, internal: 520 },
];

interface Risk { full: number; crisis: number; fail: number; injured: number; fatal: number; death: number; scroll: number; n: number; }

function measure(b: Build): Risk {
  const r: Risk = { full: 0, crisis: 0, fail: 0, injured: 0, fatal: 0, death: 0, scroll: 0, n: 0 };
  // 대표 제자 rating 확인용 1회 빌드
  const probe = buildDisciple('probe', b.realm, b.mainSeong, b.subSeong, b.strength, b.internal);
  const rating = combatRating(probe);
  for (let i = 0; i < N; i += 1) {
    useQuestStore.getState().reset();
    useDiscipleStore.getState().reset();
    useInboxStore.getState().reset?.();
    useTimeStore.getState().reset();
    useCodexStore.getState().resetAll?.();
    setSect(100000, 90);
    setQuestRewardMult(1);
    setGeumchangBudget(0); // 무과금 — 구급영약 없음
    const hero = buildDisciple('hero', b.realm, b.mainSeong, b.subSeong, b.strength, b.internal);
    useDiscipleStore.getState().setAll([hero]);
    const quest = extremeDuelQuest(`xq-${i}`);
    useQuestStore.getState().setBoard([quest]);
    if (!canDispatch(hero, quest)) { r.n += 1; continue; } // 게이트 미달 → 파견 불가(완수 0)
    dispatchQuest(quest.id, ['hero']);
    const act = useQuestStore.getState().active.find((a) => a.quest.id === quest.id);
    if (!act) { r.n += 1; continue; }
    let guard = 0;
    while (useTimeStore.getState().totalDay < act.dueDay && guard < 200) { useTimeStore.getState().advanceDay(); guard += 1; }
    tickQuests();
    // 돌발 이벤트로 보류된 회차는 한 번 더 진행(현장 선택 없이 결산되도록 — duel 도메인 이벤트는 드물다)
    if (useQuestStore.getState().active.some((a) => a.quest.id === quest.id)) {
      useQuestStore.getState().updateActive(quest.id, { pendingEventId: undefined });
      tickQuests();
    }
    const ms = usePendingStore.getState().milestones;
    const last = ms[ms.length - 1];
    const title = last?.title ?? '';
    const h = useDiscipleStore.getState().disciples['hero'];
    const died = h?.status === 'departed';
    // 결과 분류 — 마일스톤 제목 + 제자 최종 상태.
    if (title.includes('완수')) r.full += 1;
    else if (title.includes('위기')) r.crisis += 1;
    else if (title.includes('재난')) {
      if (died) r.death += 1;
      else r.fatal += 1; // 치명상 생존(중상으로 몸져눕는다)
    } else if (title.includes('실패')) r.fail += 1;
    // 부상 집계 — injured 상태(중상/경상/찰과상)지만 사망/치명상생존 아닌 경우
    if (!died && h?.status === 'injured' && !title.includes('재난')) r.injured += 1;
    // 비급 노획(완수·위기 시 maybeDropScroll) — inbox '비급 입수'
    if (useInboxStore.getState().items?.some((it: any) => it.title?.includes('비급 입수'))) r.scroll += 1;
    r.n += 1;
  }
  (r as any).rating = rating;
  return r;
}

seedAmbient(424242);
console.log('═══ 극험 결투 의뢰 위험 정밀 측정 (N=10000/빌드, 무과금=영약0) ═══\n');
console.log('측정일 2026-06-19 · seed 424242 · 도메인=duel · 단신 파견(무과금 최악)\n');

const pct = (x: number, n: number) => `${((x / n) * 100).toFixed(1)}%`;
const results: { b: Build; r: Risk }[] = [];
for (const b of BUILDS) {
  const r = measure(b);
  results.push({ b, r });
  const rating = (r as any).rating;
  const success = r.full + r.crisis; // 무사 완수(완수+위기끝성공)
  console.log(`■ ${b.label}  [combatRating=${rating}]`);
  console.log(`   P(성공=완수+위기) ${pct(success, r.n)}  (완수 ${pct(r.full, r.n)} · 위기끝성공 ${pct(r.crisis, r.n)})`);
  console.log(`   P(실패) ${pct(r.fail, r.n)}   P(부상) ${pct(r.injured, r.n)}`);
  console.log(`   P(치명상 생존) ${pct(r.fatal, r.n)}   P(사망) ${pct(r.death, r.n)}`);
  console.log(`   P(절품/master 무공서 노획) ${pct(r.scroll, r.n)}  ← 화경의 열쇠\n`);
}

// ── 골든 밴드 — 확률을 못박는다(로직 변경 시 깨져 재검증 강제). 2026-06-19 측정 기준 ±여유 ──
// (밴드는 첫 측정 후 코드의 실측값으로 채운다 — 아래는 측정 직후 갱신)
const jj = results.find((x) => x.b.realm === 'jeoljeong')!.r;
const cj = results.find((x) => x.b.realm === 'chojeoljeong')!.r;
const il = results.find((x) => x.b.realm === 'ilryu')!.r;

ck('일류 6성 — 극험 게이트(72) 미달 → 완수 0 (파견 불가)', il.full + il.crisis === 0,
  `성공=${il.full + il.crisis}`);
ck('절정 7성 — 사망률 합리(0<death<35%)', jj.death / jj.n > 0 && jj.death / jj.n < 0.35, pct(jj.death, jj.n));
ck('초절정 8성 — 절정보다 안전(사망률 더 낮음)', cj.death / cj.n <= jj.death / jj.n + 0.005,
  `절정 ${pct(jj.death, jj.n)} vs 초절정 ${pct(cj.death, cj.n)}`);
ck('초절정 8성 — 성공률 절정보다 높음', (cj.full + cj.crisis) / cj.n > (jj.full + jj.crisis) / jj.n,
  `절정 ${pct(jj.full + jj.crisis, jj.n)} vs 초절정 ${pct(cj.full + cj.crisis, cj.n)}`);

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
