// 의뢰 보상 계산식 골든값 회귀 — docs/29 §5. "산수가 설계대로 정확한 값을 내는가"(경계 아님).
// 설계(docs/29 §5 표 + 코드 OUTCOME_SCALE):
//   outcome별 [money, fame, growth] 배수:
//     full    1 / 1   / 1
//     partial 0.6/ 0.5 / 0.6
//     crisis  1 / 1   / 1
//     fail    0.1/ 0   / 0.2
//     disaster0 / 0   / 0
//   자금   = round(reward.money × scale.money × mult × questRewardMult)
//   사문명성= round(reward.fame  × scale.fame  × mult × 0.6)
//   제자명성= round(reward.fame  × scale.fame  × mult)        (사문과 달리 ×0.6 없음)
//   mult = (rewardMult ?? 1) × (noble ? 1.5 : 1)
//   후원 의뢰: money·fame ×1.4 (게시 시점). 명성 게이트: 80극험/50위험/25보통/10소무/else잡일.
// 실행: node scripts/sim/_run.cjs scripts/sim/quest_formula.ts
import './_storageShim';
import { useQuestStore } from '../../src/stores/questStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { usePendingStore } from '../../src/stores/pendingStore';
import {
  dispatchQuest, tickQuests, setQuestRewardMult, setGeumchangBudget,
} from '../../src/systems/questSystem';
import { maxGradeForReputation } from '../../src/data/quests';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, Quest, QuestOutcome } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

// 설계 골든 스케일 표 (docs/29 §5) — 코드와 별개로 손계산용 정의.
const SCALE: Record<QuestOutcome, { money: number; fame: number; growth: number }> = {
  full: { money: 1, fame: 1, growth: 1 },
  partial: { money: 0.6, fame: 0.5, growth: 0.6 },
  crisis: { money: 1, fame: 1, growth: 1 },
  fail: { money: 0.1, fame: 0, growth: 0.2 },
  disaster: { money: 0, fame: 0, growth: 0 },
};
const LABEL_OUTCOME: Record<string, QuestOutcome> = {
  완수: 'full', 성공: 'partial', '위기 끝에 성공': 'crisis', 실패: 'fail', 재난: 'disaster',
};

function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 0, pity: 0, petitioned: false }, fame: 0, insight: 1,
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    stats: {
      guarding: { level: 90, exp: 0 }, scouting: { level: 90, exp: 0 },
      medicine: { level: 90, exp: 0 }, strength: { level: 40, exp: 0 },
      endurance: { level: 40, exp: 0 }, formation: { level: 0, exp: 0 },
    },
    ...over,
  } as unknown as Disciple;
}
function setSect(resources: number, reputation: number) {
  useSectStore.getState().setSect({ name: 'x', hanjaName: 'x', reputation, resources, facilities: [] } as never);
}
function q(over: Partial<Quest>): Quest {
  return {
    id: 'qt', domain: 'guard', grade: 'normal', title: 'T', client: 'c', preview: '',
    weeks: 2, reward: { money: 100, fame: 10 }, recommended: 1, minStat: 20, ...over,
  } as Quest;
}

// 의뢰를 파견→결산하고 [outcome, 자금증가, 명성증가, 리더 fame증가] 반환.
// 돌발 이벤트(pendingEventId)로 결산이 보류되면 null — 그 회차는 검증 제외(보상 산수만 본다).
function runQuest(quest: Quest, ids: string[]): { outcome: QuestOutcome; dMoney: number; dRep: number; dFame: number } | null {
  useQuestStore.getState().setBoard([quest]);
  const m0 = useSectStore.getState().sect?.resources ?? 0;
  const r0 = useSectStore.getState().sect?.reputation ?? 0;
  const f0 = useDiscipleStore.getState().disciples[ids[0]]?.fame ?? 0;
  const before = usePendingStore.getState().milestones.filter((x) => x.kind === 'quest').length;
  if (!dispatchQuest(quest.id, ids)) return null;
  const act = useQuestStore.getState().active.find((a) => a.quest.id === quest.id);
  if (!act) return null;
  let guard = 0;
  while (useTimeStore.getState().totalDay < act.dueDay && guard < 100) { useTimeStore.getState().advanceDay(); guard += 1; }
  tickQuests();
  // 여전히 active(돌발 이벤트 보류) 또는 새 마일스톤 없음 → 검증 제외.
  if (useQuestStore.getState().active.some((a) => a.quest.id === quest.id)) return null;
  const ms = usePendingStore.getState().milestones.filter((x) => x.kind === 'quest');
  if (ms.length <= before) return null;
  const last = ms[ms.length - 1];
  const label = (last?.title ?? '').replace('의뢰 ', '');
  return {
    outcome: LABEL_OUTCOME[label] ?? 'fail',
    dMoney: (useSectStore.getState().sect?.resources ?? 0) - m0,
    dRep: (useSectStore.getState().sect?.reputation ?? 0) - r0,
    dFame: (useDiscipleStore.getState().disciples[ids[0]]?.fame ?? 0) - f0,
  };
}

function reset() {
  useQuestStore.getState().reset();
  useTimeStore.getState().reset();
  usePendingStore.getState().milestones = [] as never;
  usePendingStore.setState({ milestones: [] } as never);
  setSect(100000, 50);
  setQuestRewardMult(1);
  setGeumchangBudget(0);
}

seedAmbient(987654);
console.log('═══ 의뢰 보상 계산식 골든값 ═══\n');

// ── 1. 보상 산수 = reward × scale[outcome] (도메인 guard·정탐·의술 = 비전투, RNG outcome 매칭) ──
// 의뢰 reward.money=400, fame=40. 결과가 무엇이든 자금/명성/제자명성이 설계 공식과 일치하는지.
reset();
useDiscipleStore.getState().reset();
useDiscipleStore.getState().setAll([disc('hero')]);
let allMoneyOk = true, allRepOk = true, allFameOk = true;
const seen = new Set<QuestOutcome>();
for (let i = 0; i < 600; i += 1) {
  // minStat 을 바꿔가며 다양한 outcome 유도 (역량 90 고정, minStat 0~88)
  const minStat = (i % 5) * 22; // 0,22,44,66,88
  setSect(100000, 30); // 명성 30 으로 고정 — 클램프(0~100) 전에 +24/+12 가 온전히 관측되게
  const quest = q({ id: `qf-${i}`, grade: 'dangerous', domain: 'guard', minStat, reward: { money: 400, fame: 40 } });
  const res = runQuest(quest, ['hero']);
  if (!res) { useQuestStore.getState().reset(); useDiscipleStore.getState().setAll([disc('hero')]); continue; }
  seen.add(res.outcome);
  const sc = SCALE[res.outcome];
  // disaster 면 제자가 다치거나 떠날 수 있어 fame 비교만(money/rep 는 0이라 안전)
  const goldMoney = Math.round(400 * sc.money * 1 * 1);
  const goldRep = Math.round(40 * sc.fame * 1 * 0.6);
  const goldFame = Math.round(40 * sc.fame * 1);
  if (res.dMoney !== goldMoney) { allMoneyOk = false; console.log(`    money mismatch ${res.outcome}: got ${res.dMoney} want ${goldMoney}`); }
  if (res.dRep !== goldRep) { allRepOk = false; console.log(`    rep mismatch ${res.outcome}: got ${res.dRep} want ${goldRep}`); }
  if (res.dFame !== goldFame) { allFameOk = false; console.log(`    fame mismatch ${res.outcome}: got ${res.dFame} want ${goldFame}`); }
  // 제자 부상/이탈 시 새 제자로 리셋
  const h = useDiscipleStore.getState().disciples['hero'];
  if (!h || h.status !== 'training') useDiscipleStore.getState().setAll([disc('hero')]);
}
ck(`자금 = round(reward.money × scale) 정확 (${[...seen].join(',')})`, allMoneyOk);
ck('사문명성 = round(reward.fame × scale × 0.6) 정확', allRepOk);
ck('제자명성 = round(reward.fame × scale) 정확 (×0.6 없음)', allFameOk);
ck('outcome 다양성 확보(full·partial·fail 중 ≥2종 관측)', seen.size >= 2, `${seen.size}종`);

// ── 2. 단일 outcome 골든값 — full 보장(역량 ≫ minStat, s≥0.6) ──
// q-clinic 형 의술 normal: reward 100/10. full 시 자금 +100, 사문명성 round(10×0.6)=6, 제자명성 10.
// (역량 90 vs minStat 0 → s=1.5 클램프 → s>=0.6 → full(85%)/partial(15%))
reset();
useDiscipleStore.getState().reset();
useDiscipleStore.getState().setAll([disc('mega')]);
let fullSeen = false, fullMoneyOk = true;
for (let i = 0; i < 200 && !fullSeen; i += 1) {
  const quest = q({ id: `qfull-${i}`, grade: 'normal', domain: 'medicine', minStat: 0, reward: { money: 100, fame: 10 } });
  const res = runQuest(quest, ['mega']);
  if (!res) { useQuestStore.getState().reset(); useDiscipleStore.getState().setAll([disc('mega')]); continue; }
  if (res.outcome === 'full') {
    fullSeen = true;
    if (!(res.dMoney === 100 && res.dRep === 6 && res.dFame === 10)) {
      fullMoneyOk = false;
      console.log(`    full 골든 불일치: money ${res.dMoney}(want100) rep ${res.dRep}(want6) fame ${res.dFame}(want10)`);
    }
  }
}
ck('full 골든값: 자금100·사문명성6·제자명성10 (reward 100/10)', fullSeen && fullMoneyOk);

// ── 3. questRewardMult 레버 — 자금만 곱한다(명성엔 안 곱함) ──
// 설계: 자금 = round(money × scale × mult × questRewardMult). 명성은 questRewardMult 미적용.
reset();
useDiscipleStore.getState().reset();
useDiscipleStore.getState().setAll([disc('lever')]);
setQuestRewardMult(2);
let leverOk = true, leverSeen = false;
for (let i = 0; i < 100 && !leverSeen; i += 1) {
  const quest = q({ id: `qlev-${i}`, grade: 'normal', domain: 'guard', minStat: 0, reward: { money: 100, fame: 10 } });
  const res = runQuest(quest, ['lever']);
  if (!res) { useQuestStore.getState().reset(); useDiscipleStore.getState().setAll([disc('lever')]); continue; }
  if (res.outcome === 'full') {
    leverSeen = true;
    // 자금 = 100×2 = 200, 사문명성 = round(10×0.6)=6 (questRewardMult 무관)
    if (!(res.dMoney === 200 && res.dRep === 6)) { leverOk = false; console.log(`    lever: money ${res.dMoney}(want200) rep ${res.dRep}(want6)`); }
  }
}
ck('questRewardMult=2 → 자금만 2배(200), 명성 불변(6)', leverSeen && leverOk);
setQuestRewardMult(1);

// ── 4. 명성 게이트 임계 골든값 (docs/29 §3) ──
ck('명성 게이트 79 → dangerous(<80)', maxGradeForReputation(79) === 'dangerous');
ck('명성 게이트 80 → extreme(≥80 경계)', maxGradeForReputation(80) === 'extreme');
ck('명성 게이트 49 → normal(<50)', maxGradeForReputation(49) === 'normal');
ck('명성 게이트 50 → dangerous(≥50)', maxGradeForReputation(50) === 'dangerous');
ck('명성 게이트 24 → minor(<25)', maxGradeForReputation(24) === 'minor');
ck('명성 게이트 25 → normal(≥25)', maxGradeForReputation(25) === 'normal');
ck('명성 게이트 9 → menial(<10)', maxGradeForReputation(9) === 'menial');
ck('명성 게이트 10 → minor(≥10)', maxGradeForReputation(10) === 'minor');

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
