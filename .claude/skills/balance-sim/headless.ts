// 헤드리스 실코드 자동플레이 — 실제 TS 시스템(timeSystem·이벤트·면담·영약…)을 Node에서 구동하고,
// **실제 Supabase에 영속**한다(진짜 end-to-end). 게임의 실제 runSync 경로로 저장 → DB에서 검증 가능.
//
// 정책 2종(둘 다 필요 — 사용자 요청):
//  - growth : 합리적으로 잘 키우는 봇(경지 성장 검증) → slot 1
//  - random : 전 선택 랜덤(이벤트·면담 발동 QA, 제자 정체) → slot 2
// 인증: 전용 시뮬 계정(simbot@shidao.app) — 실제 유저 슬롯과 격리.
// LLM(executorch)은 Node에서 require 실패 → 규칙 폴백. LLM 출력은 in-app 하네스에서만.
// 실행: node .claude/skills/balance-sim/run-headless.cjs [years] [growth|random|both]

import { supabase } from '@/lib/supabase';
import { seedNewRun } from '@/systems/newRun';
import { saveCurrentRun, setAutoSaveEnabled } from '@/systems/runSync';
import { advanceTurn } from '@/systems/timeSystem';
import { autoPlayRun, RandomPolicy, type AutoPlayEvent, type PlayPolicy } from '@/systems/dev/autoPlay';
import { GrowthPolicy } from '@/systems/dev/growthPolicy';
import { configureOptimal, configurePartyDay, partyDispatch, setElixirBudget, optimalDispatch, incomeDispatch, healWithSalve, goalArtFor as goalArtForDiag } from '@/systems/dev/policyHelpers';
import { setGeumchangBudget, canDispatch, dispatchQuest } from '@/systems/questSystem';
import { evaluateJobs } from '@/systems/jobSystem';
import { QUEST_GRADE_ORDER, QUEST_POOL } from '@/data/quests';
import type { Quest, MartialArtInstance } from '@/types';
import { useQuestStore } from '@/stores/questStore';
import { useCodexStore } from '@/stores/codexStore';
import { setByeokgokdanBudget } from '@/systems/trainingSystem';
import { buildAlchemyLab, learnRecipe, addMaterial, startCraft, consumeInternalElixir, isLabOperational } from '@/systems/alchemySystem';
import { tickWoundRecovery } from '@/systems/woundSystem';
import { setFoodCost, setLabUpkeep, setPatronageMult } from '@/systems/economySystem';
import { setQuestRewardMult } from '@/systems/questSystem';
import { ELIXIR_RECIPES } from '@/data/elixirs';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { isRespondable, resolveInboxItem, responseOptionsFor } from '@/systems/inboxResolve';
import { useInboxStore } from '@/stores/inboxStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { resolveFieldEvent } from '@/systems/fieldEventSystem';
import { currentAge } from '@/systems/discipleCtx';
import { findMartialArt, MARTIAL_ARTS, canLearnArt, constitutionTitles } from '@/data/martialArts';
import { daeryeonChoiceValue } from '@/systems/daeryeonSystem';
import { effectiveRealmCeiling, realmIndex, nextRealm as nextRealmOf, REALM_INTERNAL_REQ } from '@/data/realm';
import { expToNextSeong } from '@/data/martialArts';
import { setResearchInstant } from '@/systems/researchSystem';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useMasterStore } from '@/stores/masterStore';
import { useReputationStore } from '@/stores/reputationStore';
import { FACTIONS } from '@/data/factions';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { REALM_LABEL } from '@/types/realm';
import { useGraduateStore } from '@/stores/graduateStore';
import { useEventHistoryStore } from '@/stores/eventHistoryStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { DECISION_KINDS } from '@/types';
import { runs as runsRepo } from '@/data/repositories';
// 서버 권위 검증 — 정본 서버 엔진 API(serverEngine)를 Node에서 구동·결정성 실증. docs/31 Phase 1.
import { newRun as serverNewRun, advance as serverAdvance, type TurnResult } from '@/engine/serverEngine';
import { getGameApi } from '@/engine/gameApi';
import { captureGameState, commitGameState } from '@/engine/gameState';

const SEED_POOL = ['jang-cheol', 'jin-sohwa', 'yun-soso', 'baek-yeon'];

const SIM_ID = 'simbot';
const SIM_PW = 'simbot-260608-headless';
const SIM_EMAIL = `${SIM_ID}@shidao.app`;
const SLOT_BY_POLICY: Record<string, number> = { growth: 1, random: 2 };

// 로그인 → 실패 시 가입 후 재로그인. 세션 확보(이후 RLS 통과).
async function ensureAuth(): Promise<string> {
  const tryIn = await supabase.auth.signInWithPassword({ email: SIM_EMAIL, password: SIM_PW });
  if (!tryIn.error && tryIn.data.user) return tryIn.data.user.id;
  const up = await supabase.auth.signUp({ email: SIM_EMAIL, password: SIM_PW });
  if (up.error && !/already registered/i.test(up.error.message)) {
    throw new Error(`시뮬 계정 가입 실패: ${up.error.message}`);
  }
  const reIn = await supabase.auth.signInWithPassword({ email: SIM_EMAIL, password: SIM_PW });
  if (reIn.error || !reIn.data.user) {
    throw new Error(`시뮬 계정 로그인 실패: ${reIn.error?.message ?? '세션 없음'}`);
  }
  return reIn.data.user.id;
}

// 한 정책으로 N년 구동 + 영속 + 요약.
async function runPolicy(policy: PlayPolicy, slot: number, years: number): Promise<void> {
  process.stderr.write(`\n── [${policy.label}] slot ${slot} · ${years}년 시작 ──\n`);
  // 매일 게임 내부 autosave 는 끈다(고속 진행 쓰기 증폭 방지). 아래서 연 단위·최종만 저장.
  setAutoSaveEnabled(false);
  useGameStore.getState().setSaveSlot(slot);
  // 적대 시드 페어(윤소소↔이청하) 포함 — 중재·상담·적대 이벤트 등 관계 콘텐츠가 QA에서 발화되게.
  seedNewRun(['yun-soso', 'i-cheongha', 'jin-sohwa', 'jang-cheol']);
  // 직전 정책 회차가 종결(phase='ended')됐을 수 있으니 새 회차는 진행 상태로 리셋.
  useGameStore.getState().setPhase('playing');

  const events: AutoPlayEvent[] = [];
  let saveErr: string | null = null;
  let saveChain: Promise<void> = Promise.resolve();
  const queueSave = (): Promise<void> => {
    saveChain = saveChain.then(() =>
      saveCurrentRun().catch((err) => {
        saveErr = err?.message ?? String(err);
      }),
    );
    return saveChain;
  };

  await autoPlayRun(
    years * 336,
    (e) => events.push(e),
    (done, total) => {
      if (done % 336 === 0 || done === total) {
        process.stderr.write(`  [${policy.label}] 진행 ${done}/${total}일 — 저장 큐…\n`);
        void queueSave();
      }
    },
    undefined,
    policy,
  );

  // 최종 저장 — 장시간 구동 중 세션이 흔들렸을 수 있으니 재인증 후 저장(최대 3회 재시도).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    saveErr = null;
    await ensureAuth();
    saveChain = Promise.resolve();
    await queueSave();
    if (!saveErr) break;
    process.stderr.write(`  ⚠ 최종 저장 재시도 ${attempt + 1}/3: ${saveErr}\n`);
  }
  if (saveErr) process.stderr.write(`  ⚠ 저장 경고(마지막): ${saveErr}\n`);

  // DB 읽기 검증.
  const slotRuns = await runsRepo.listForUser();
  const mine = slotRuns.find((r) => r.slot === slot);
  const dbTime = (mine?.gameTime as { current?: { year?: number; season?: string } })?.current;

  // 요약.
  const byDomain: Record<string, number> = {};
  for (const e of events) byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
  const t = useTimeStore.getState().current;
  const ds = useDiscipleStore.getState();
  const disc = ds.order.map((id) => ds.disciples[id]).filter(Boolean);

  console.log(`\n=== [${policy.label}] ${years}년 — 발동 ${events.length}건 ===`);
  console.log('도메인별:', Object.entries(byDomain).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' / '));
  console.log(`메모리 종료: ${t.year}년차 ${t.season} ${t.week}주`);
  console.log(`DB 영속(slot ${slot}): runId=${mine?.id ?? '없음'} · status=${mine?.status ?? '?'} · DB시점=${dbTime ? `${dbTime.year}년차 ${dbTime.season}` : '없음'}`);
  for (const d of disc) {
    if (!d) continue;
    const inst = d.martialArts.find((a) => a.artId === d.mainMartialArtId) ?? d.martialArts[0];
    const art = inst ? findMartialArt(inst.artId) : undefined;
    const ceiling = art ? REALM_LABEL[effectiveRealmCeiling(art.grade)] : '-';
    console.log(
      `  ${d.name}: ${currentAge(d)}세 · ${REALM_LABEL[d.realm]} · 내공${d.realmProgress?.internal ?? 0} · ` +
        `주력 ${art?.name ?? '?'}(${inst?.seong ?? '-'}성·천장${ceiling}) · 근력Lv${d.stats?.strength?.level ?? '-'} · 상태 ${d.status}`,
    );
  }
}

// ── 과금 등급별 평균 경지 sweep — 이벤트·졸업·DB 없이 순수 성장 궤적만 빠르게 다회 반복 ──
const REALM_ORDER = ['none', 'samryu', 'iryu', 'ilryu', 'jeoljeong', 'chojeoljeong', 'hwagyeong'] as const;

const SPEND_TIERS = [
  { name: '무과금', budget: 0 },
  { name: '소과금', budget: 1 },
  { name: '중과금', budget: 2 },
  { name: '핵과금', budget: 4 },
];

async function fastDay(): Promise<void> {
  if (useGameStore.getState().phase === 'ended') return;
  configureOptimal(); // 최적 훈련·무공서·영약 세팅(advanceTurn 전).
  advanceTurn(); // 훈련·경지 진행(+폐관 시 깨달음 굴림·화경 영약 소모, 벽서 폐관 청원 적재).
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();
  if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();

  // 깨달음 벽 돌파엔 폐관(seclusion override)이 필요 → 폐관 청원만 '허락'으로 해소.
  // (나머지 이벤트·면담은 성장에 부차적이라 생략하고 인박스를 비워 빠르게 유지.)
  const inbox = useInboxStore.getState();
  for (const item of [...inbox.items]) {
    const domain = (item.payload as { domain?: string } | undefined)?.domain;
    if (domain === 'seclusion_petition' && isRespondable(item)) {
      await resolveInboxItem(item, 'allow');
    }
  }
  useInboxStore.getState().reset();
}

async function runSweep(): Promise<void> {
  setAutoSaveEnabled(false); // 순수 인메모리 — 내부 autosave(서신함 해소 등) 차단(인증 없음).
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 20);
  const days = years * 336;
  console.log(`=== 과금 등급별 평균 경지 — 최적 플레이 ${years}년 · ${iters}회 평균 (제자 4명/회) ===`);
  console.log('모델: 과금 = 회차당 신품 영약 확보 수(화경 벽 1개 소모). 무과금=0(영약제조 연단 경로 제외).');
  console.log('     이벤트·면담·졸업 생략한 순수 성장 궤적. 경지 idx: 삼류1·이류2·일류3·절정4·초절정5·화경6.\n');
  for (const tier of SPEND_TIERS) {
    const counts: Record<string, number> = {};
    let sumIdx = 0;
    let n = 0;
    let hwa = 0;
    let choUp = 0;
    for (let it = 0; it < iters; it += 1) {
      seedNewRun(SEED_POOL);
      useGameStore.getState().setPhase('playing');
      setElixirBudget(tier.budget);
      for (let d = 0; d < days; d += 1) await fastDay();
      const ds = useDiscipleStore.getState();
      for (const id of ds.order) {
        const disc = ds.disciples[id];
        if (!disc) continue;
        const idx = realmIndex(disc.realm);
        sumIdx += idx;
        n += 1;
        counts[disc.realm] = (counts[disc.realm] ?? 0) + 1;
        if (disc.realm === 'hwagyeong') hwa += 1;
        if (idx >= realmIndex('chojeoljeong')) choUp += 1;
      }
    }
    const meanIdx = sumIdx / n;
    const meanLabel = REALM_LABEL[REALM_ORDER[Math.round(meanIdx)]];
    const dist = REALM_ORDER.filter((r) => counts[r])
      .map((r) => `${REALM_LABEL[r]} ${Math.round((counts[r] / n) * 100)}%`)
      .join(' / ');
    console.log(`[${tier.name}] 영약 ${tier.budget}개 — 평균경지 ≈ ${meanLabel} (idx ${meanIdx.toFixed(2)}) · 화경 ${Math.round((hwa / n) * 100)}% · 초절정↑ ${Math.round((choUp / n) * 100)}%`);
    console.log(`           분포: ${dist}`);
  }
}

// ── 훈련+의뢰 모델 sweep — 화경 신품영약 미사용(budget 0), 금창약으로 치명상 회복 가정 ──
// 의뢰는 경험(주력 성·외공·명성)을 주지만 파견 중엔 경지 훈련이 멈춘다(트레이드오프) → 순효과 측정.
async function fastDayQuest(rate: number): Promise<{ saved: number }> {
  if (useGameStore.getState().phase === 'ended') return { saved: 0 };
  configureOptimal(); // budget 0 으로 호출됨 → 화경 영약 지급 안 함.
  if (rate > 0) optimalDispatch(rate); // 유휴 제자 일부를 의뢰 파견(빈도 rate).
  advanceTurn(); // 훈련(잔류)·tickQuests(의뢰 결산: 경험·부상·사망)·경지 진행.
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();
  if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
  const inbox = useInboxStore.getState();
  for (const item of [...inbox.items]) {
    const domain = (item.payload as { domain?: string } | undefined)?.domain;
    if (domain === 'seclusion_petition' && isRespondable(item)) {
      await resolveInboxItem(item, 'allow');
    }
  }
  drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 제자 'questing' 영구 동결.
  // 금창약 — 의뢰서 입은 치명상(중상·사망)을 회복(살린다). 화경 신품영약은 안 씀.
  const { saved } = healWithSalve(true);
  useInboxStore.getState().reset();
  return { saved };
}

async function runQuestSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 20);
  const days = years * 336;
  console.log(`=== 훈련 vs 훈련+의뢰 — 최적 플레이 ${years}년 · ${iters}회 평균 (제자 4명/회) ===`);
  console.log('모델: 화경 신품영약 미사용(budget 0) · 금창약으로 의뢰 치명상(중상·사망) 회복 가정.');
  console.log('     의뢰=경험(주력 성·외공·명성) 먹이되 파견 중 경지 훈련 멈춤. 경지 idx: 삼류1·이류2·일류3·절정4·초절정5·화경6.\n');
  for (const mode of [
    { name: '훈련만(의뢰0)', rate: 0 },
    { name: '의뢰 드물게(3%)', rate: 0.03 },
    { name: '의뢰 적당히(8%)', rate: 0.08 },
    { name: '의뢰 잦게(20%)', rate: 0.2 },
  ]) {
    const counts: Record<string, number> = {};
    let sumIdx = 0;
    let n = 0;
    let sumStr = 0;
    let sumFame = 0;
    let totalSaved = 0;
    for (let it = 0; it < iters; it += 1) {
      seedNewRun(SEED_POOL);
      useGameStore.getState().setPhase('playing');
      setElixirBudget(0);
      for (let d = 0; d < days; d += 1) totalSaved += (await fastDayQuest(mode.rate)).saved;
      const ds = useDiscipleStore.getState();
      for (const id of ds.order) {
        const disc = ds.disciples[id];
        if (!disc) continue;
        sumIdx += realmIndex(disc.realm);
        n += 1;
        counts[disc.realm] = (counts[disc.realm] ?? 0) + 1;
        sumStr += disc.stats?.strength?.level ?? 0;
        sumFame += disc.fame ?? 0;
      }
    }
    const meanIdx = sumIdx / n;
    const meanLabel = REALM_LABEL[REALM_ORDER[Math.round(meanIdx)]];
    const dist = REALM_ORDER.filter((r) => counts[r])
      .map((r) => `${REALM_LABEL[r]} ${Math.round((counts[r] / n) * 100)}%`)
      .join(' / ');
    console.log(`[${mode.name}] 평균경지 ≈ ${meanLabel} (idx ${meanIdx.toFixed(2)}) · 평균 근력Lv ${(sumStr / n).toFixed(0)} · 평균 명성 ${(sumFame / n).toFixed(0)} · 금창약 회복 ${(totalSaved / iters).toFixed(1)}건/회`);
    console.log(`           분포: ${dist}`);
  }
}

// ── 빌드 비교 sweep — 유년기 훈련 → 청소년기(13세) 의뢰, 3경로 × 과금 ──
// 메커니즘: 의뢰=실전 깨달음(폐관보다 높은 확률로 벽 돌파)+무공·외공·금전·명성, 내공은 훈련 전용.
// 폐관=벽곡단 2/일·28일(느림·확실). 의뢰 치명상=생존체인(구급영약/신의의원/자력) 실패 시만 사망.
// 부상 자연 회복 — 실게임과 동일하게 상처별 잔여일을 독립 차감(다중 상처 충실도). 종전엔 sim 자체
// 루프(injuryDaysRemaining 일괄 차감)였으나, 속성별 누적 상처는 상처마다 다른 속도로 나아야 정확하다.
function tickInjuryRecovery(): void {
  tickWoundRecovery();
}

async function fastDayBuild(rate: number, minAge: number): Promise<void> {
  if (useGameStore.getState().phase === 'ended') return;
  configureOptimal();
  if (rate > 0) optimalDispatch(rate, minAge);
  advanceTurn();
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();
  if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
  const inbox = useInboxStore.getState();
  for (const item of [...inbox.items]) {
    const domain = (item.payload as { domain?: string } | undefined)?.domain;
    if (domain === 'seclusion_petition' && isRespondable(item)) await resolveInboxItem(item, 'allow');
  }
  drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 제자 'questing' 영구 동결.
  tickInjuryRecovery(); // 부상 자연 회복(기간 차감). 사망은 의뢰 생존체인이 이미 결정.
  useInboxStore.getState().reset();
}

async function runBuildSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 16);
  const days = years * 336;
  // geum=구급영약(치명상 생존), byeok=벽곡단(폐관), elixir=화경 신품영약. 벽곡단은 게임머니로 산다 가정(∞).
  const BUILDS = [
    { name: '훈련만·무과금', rate: 0, minAge: 0, geum: 0, byeok: Infinity, elixir: 0 },
    { name: '훈련만·핵과금', rate: 0, minAge: 0, geum: 0, byeok: Infinity, elixir: 9 },
    { name: '훈련후의뢰·무과금', rate: 0.12, minAge: 13, geum: 0, byeok: Infinity, elixir: 0 },
    { name: '훈련후의뢰·핵과금', rate: 0.12, minAge: 13, geum: 99, byeok: Infinity, elixir: 9 },
    { name: '의뢰위주·핵과금', rate: 0.3, minAge: 13, geum: 99, byeok: Infinity, elixir: 9 },
  ];
  console.log(`=== 빌드 비교 — 유년기 훈련→청소년기(13세) 의뢰 · ${years}년 · ${iters}회 평균 (제자 4명/회) ===`);
  console.log('의뢰=실전 깨달음(폐관>↑확률 벽돌파)+무공·외공, 내공은 훈련전용. 폐관=벽곡단2/일·28일. 치명상=생존체인 실패시만 사망.');
  console.log('경지 idx: 삼류1·이류2·일류3·절정4·초절정5·화경6.\n');
  for (const b of BUILDS) {
    const counts: Record<string, number> = {};
    let sumIdx = 0;
    let n = 0;
    let deaths = 0;
    for (let it = 0; it < iters; it += 1) {
      seedNewRun(SEED_POOL);
      useGameStore.getState().setPhase('playing');
      setElixirBudget(b.elixir);
      setGeumchangBudget(b.geum);
      setByeokgokdanBudget(b.byeok);
      for (let d = 0; d < days; d += 1) await fastDayBuild(b.rate, b.minAge);
      const ds = useDiscipleStore.getState();
      for (const id of ds.order) {
        const disc = ds.disciples[id];
        if (!disc) continue;
        n += 1;
        if (disc.status === 'departed') {
          deaths += 1;
          counts['사망'] = (counts['사망'] ?? 0) + 1;
          continue;
        }
        sumIdx += realmIndex(disc.realm);
        counts[disc.realm] = (counts[disc.realm] ?? 0) + 1;
      }
    }
    const alive = n - deaths;
    const meanIdx = alive > 0 ? sumIdx / alive : 0;
    const meanLabel = REALM_LABEL[REALM_ORDER[Math.round(meanIdx)]];
    const hwa = counts['hwagyeong'] ?? 0;
    const dist = [...REALM_ORDER, 'hwagyeong']
      .filter((r, i, a) => a.indexOf(r) === i)
      .filter((r) => counts[r])
      .map((r) => `${REALM_LABEL[r] ?? r} ${Math.round((counts[r] / n) * 100)}%`)
      .join(' / ');
    console.log(`[${b.name}] 평균경지(생존) ≈ ${meanLabel} (idx ${meanIdx.toFixed(2)}) · 화경 ${Math.round((hwa / n) * 100)}% · 사망 ${Math.round((deaths / n) * 100)}%`);
    console.log(`           분포: ${dist}${counts['사망'] ? ` / 사망 ${Math.round((counts['사망'] / n) * 100)}%` : ''}`);
  }
}

// ── 1캐리+3서포트 파티 vs 독립캐리 비교 (적성 자동 배정, 전부 무과금) ──
const EFF_RANK: Record<string, number> = { 특화: 4, 상성: 3, 보통: 2, 미숙: 1, 상극: 0 };

function assignRoles(comp: string[]): Record<string, string> {
  const ds = useDiscipleStore.getState();
  const ids = [...ds.order];
  const eff = (id: string, k: string): number =>
    EFF_RANK[(ds.disciples[id]?.efficiency as Record<string, string> | undefined)?.[k] ?? '보통'] ?? 2;
  const combatScore = (id: string) => Math.max(eff(id, 'sword'), eff(id, 'saber'), eff(id, 'fist'), eff(id, 'darkArts'));
  ids.sort((a, b) => combatScore(b) - combatScore(a)); // 캐리 = 전투 적성 최고
  const carry = ids[0];
  const roleMap: Record<string, string> = { [carry]: 'carry' };
  const remaining = ids.slice(1);
  for (const role of comp) {
    const key = role === 'combat' ? 'fist' : role; // combat 서포트는 전투 적성 기준
    remaining.sort((a, b) => eff(b, key) - eff(a, key));
    const pickId = remaining.shift();
    if (pickId) roleMap[pickId] = role;
  }
  return roleMap;
}

async function fastDayParty(mode: string, roleMap: Record<string, string>): Promise<void> {
  if (useGameStore.getState().phase === 'ended') return;
  if (mode === 'party') {
    configurePartyDay(roleMap);
    const carryId = Object.keys(roleMap).find((id) => roleMap[id] === 'carry');
    if (carryId) partyDispatch(carryId, roleMap, 0.12, 13); // 캐리+서포트 동행 파견.
  } else {
    configureOptimal();
    optimalDispatch(0.12, 13); // 독립캐리 — 각자 의뢰.
  }
  advanceTurn();
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();
  if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
  const inbox = useInboxStore.getState();
  for (const item of [...inbox.items]) {
    const domain = (item.payload as { domain?: string } | undefined)?.domain;
    if (domain === 'seclusion_petition' && isRespondable(item)) await resolveInboxItem(item, 'allow');
  }
  drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 제자 'questing' 영구 동결.
  tickInjuryRecovery();
  useInboxStore.getState().reset();
}

async function runPartySweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 16);
  const days = years * 336;
  // 전부 무과금(과금 영약 0) — 영약제조 서포트의 연단이 캐리를 화경에 올리나 검증.
  const CONFIGS: { name: string; seed: number; mode: string; comp?: string[] }[] = [
    { name: '4명 독립캐리', seed: 4, mode: 'optimal' },
    { name: '파티: 영약제조+의술+전투', seed: 4, mode: 'party', comp: ['alchemy', 'medicine', 'combat'] },
    { name: '파티: 영약제조+의술+진법', seed: 4, mode: 'party', comp: ['alchemy', 'medicine', 'formation'] },
    { name: '파티: 의술2+영약제조', seed: 4, mode: 'party', comp: ['medicine', 'medicine', 'alchemy'] },
    { name: '2명 독립캐리', seed: 2, mode: 'optimal' },
  ];
  console.log(`=== 1캐리+3서포트 파티 vs 독립 — 무과금 · ${years}년 · ${iters}회 평균 ===`);
  console.log('적성 자동 배정. 영약제조 서포트=연단으로 신품영약 공급(무과금 캐리 화경 가능?). 의술=의뢰동행 생존(역량 제약).');
  console.log('경지 idx: 삼류1·이류2·일류3·절정4·초절정5·화경6. (캐리 = 최고경지 제자)\n');
  for (const cfg of CONFIGS) {
    const seedIds = SEED_POOL.slice(0, cfg.seed);
    let sumCarry = 0;
    let carryHwa = 0;
    let anyHwa = 0;
    let deaths = 0;
    for (let it = 0; it < iters; it += 1) {
      seedNewRun(seedIds);
      useGameStore.getState().setPhase('playing');
      setElixirBudget(0);
      setGeumchangBudget(0);
      setByeokgokdanBudget(Infinity);
      const roleMap = cfg.mode === 'party' && cfg.comp ? assignRoles(cfg.comp) : {};
      for (let d = 0; d < days; d += 1) await fastDayParty(cfg.mode, roleMap);
      const ds = useDiscipleStore.getState();
      let best = -1;
      for (const id of ds.order) {
        const disc = ds.disciples[id];
        if (!disc) continue;
        if (disc.status === 'departed') deaths += 1;
        const idx = realmIndex(disc.realm);
        if (idx > best) best = idx;
        if (disc.realm === 'hwagyeong') anyHwa += 1;
      }
      sumCarry += best;
      if (best >= realmIndex('hwagyeong')) carryHwa += 1;
    }
    const meanCarry = sumCarry / iters;
    const meanLabel = REALM_LABEL[REALM_ORDER[Math.round(meanCarry)]];
    console.log(`[${cfg.name}] 최고제자 평균경지 ≈ ${meanLabel} (idx ${meanCarry.toFixed(2)}) · 회차당 화경달성 ${Math.round((carryHwa / iters) * 100)}% · 총화경 ${(anyHwa / iters).toFixed(2)}명/회 · 사망 ${(deaths / iters).toFixed(2)}/회`);
  }
}

// ── 영약제조 적성(특화/상극/보통) × 15년 연단 생산량 ──
// 영단서 다 배운 가정 + 무한 재료 + 연단실. 매일 공부(alchemy)로 레벨↑, Lv 닿으면 해당 영단 연단(점유).
async function runAlchemySweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const days = years * 336;
  // 특화=진소화, 상극=장철, 보통=윤소소.
  seedNewRun(['jin-sohwa', 'jang-cheol', 'yun-soso']);
  useGameStore.getState().setPhase('playing');
  buildAlchemyLab();
  for (const r of ELIXIR_RECIPES) learnRecipe(r.id); // 영단서 다 있음
  for (const m of ['herb-common', 'herb-fire', 'herb-poison', 'herb-cold', 'herb-rare', 'herb-divine']) {
    addMaterial(m, 9_999_999); // 무한 재료 가정
  }
  // 전원 약초학(alchemy) 공부 패턴.
  const sched = useScheduleStore.getState();
  sched.setSchedule({ weeklyPattern: ['study', 'study', 'study', 'study', 'study', 'study', 'rest'], monthlyQuests: 0 });
  for (const id of useDiscipleStore.getState().order) sched.setDailyChoice(id, 'study', 'study_alchemy');

  // 제조 가능한 최고 등급 레시피(요구 alchemy Lv ≤ 현재). 무한 재료라 Lv만 본다.
  const byReqDesc = [...ELIXIR_RECIPES].sort((a, b) => b.alchemyReq - a.alchemyReq);
  const craftedBy: Record<string, Record<string, number>> = {};
  const reach58: Record<string, number> = {}; // 구전대환단 요구 Lv 도달 연차
  const firstDivine: Record<string, number> = {}; // 첫 구전대환단 제조 연차

  for (let d = 0; d < days; d += 1) {
    const ds = useDiscipleStore.getState();
    for (const id of ds.order) {
      const disc = ds.disciples[id];
      if (!disc || disc.status !== 'training') continue;
      const lv = disc.stats?.alchemy?.level ?? 0;
      const yr = Math.floor(d / 336) + 1;
      if (lv >= 58 && reach58[id] === undefined) reach58[id] = yr;
      // 만들 수 있는 최고 등급 영단 1개 연단(점유). 레벨이 낮으면 계속 공부.
      const best = byReqDesc.find((r) => r.alchemyReq <= lv);
      if (best && startCraft(id, best.id)) {
        craftedBy[id] = craftedBy[id] ?? {};
        craftedBy[id][best.id] = (craftedBy[id][best.id] ?? 0) + 1;
        if (best.id === 'guzeon-daehwandan' && firstDivine[id] === undefined) firstDivine[id] = yr;
      }
    }
    advanceTurn();
    const s = useScheduleStore.getState();
    if (s.pendingReport) s.resolveMonthlyReport();
    if (s.pendingSetup) s.resolveMonthlySetup();
    if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
    useInboxStore.getState().reset();
    for (const id of useDiscipleStore.getState().order) {
      useScheduleStore.getState().setDailyChoice(id, 'study', 'study_alchemy');
    }
  }

  console.log(`=== 영약제조 적성별 ${years}년 연단 (영단서 다 배움·무한 재료·연단실) ===`);
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const disc = ds.disciples[id];
    if (!disc) continue;
    const apt = (disc.efficiency as Record<string, string> | undefined)?.alchemy ?? '보통';
    const lv = disc.stats?.alchemy?.level ?? 0;
    const made = craftedBy[id] ?? {};
    const total = Object.values(made).reduce((a, b) => a + b, 0);
    const divine = made['guzeon-daehwandan'] ?? 0;
    const r58 = reach58[id] ? `${reach58[id]}년차(${10 + reach58[id] - 1}세)` : '미달';
    const fd = firstDivine[id] ? `${firstDivine[id]}년차(${10 + firstDivine[id] - 1}세)` : '없음';
    const breakdown = Object.entries(made)
      .map(([rid, n]) => `${ELIXIR_RECIPES.find((r) => r.id === rid)?.name ?? rid} ${n}`)
      .join(', ');
    console.log(`\n[${disc.name} · 적성 ${apt}] 최종 alchemy Lv ${lv} · Lv58(구전대환단 가능) 도달 ${r58} · 첫 구전대환단 ${fd}`);
    console.log(`  총 연단 ${total}과 (구전대환단 ${divine}과) — ${breakdown || '없음'}`);
  }
}

// ── 1 무공 카리 + 3 서폿 연단공장 통합 — 서폿이 영단 양산, 카리가 받아 화경 가나 ──
async function runFactorySweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 8);
  const days = years * 336;
  const RECIPE_IDS = ELIXIR_RECIPES.map((r) => r.id);
  const byReqDesc = [...ELIXIR_RECIPES].sort((a, b) => b.alchemyReq - a.alchemyReq);
  const f2pHdr = process.argv.includes('f2p');
  console.log(`=== 1무공+3서폿(연단공장) · ${years}년 · ${iters}회 평균 (${f2pHdr ? `무과금 현실: 신품영초 ${Number(process.env.HD_YEAR ?? 4)}/년` : '핵과금: 무한재료'}) ===`);
  console.log('카리=yun-soso(검·화경 빌드). 서폿 3명=연단공장(공부+제조). 카리는 내공단 흡수+화경 벽서 구전대환단 복용.\n');

  let carryHwa = 0;
  const realmTally: Record<string, number> = {};
  let sumDivine = 0;
  let sumInternalDan = 0;
  const fullCodex = process.argv.includes('all'); // 'all' = 비급 전권 complete 시작 — 사슬 완성 게이트 격리(후기 회차 가정).
  // 'f2p' = 무과금 현실: 신품 영초(herb-divine)만 무한→**현실 공급**으로 막는다(화경 실관문 = 구전대환단 재료).
  // 다른 영초는 채집 쉬워 유지. HD_YEAR = 연간 신품 영초 graybox(영산절지 극험 채집 시간경쟁 반영·튜닝 레버,
  // 환경변수로 조정 `HD_YEAR=N`). 시작 일괄 지급이라 *현실 트리클의 상한*(이것도 ≤20%면 트리클은 더 낮음). docs/40 §3-B②.
  const f2p = process.argv.includes('f2p');
  const HD_YEAR = Number(process.env.HD_YEAR ?? 4);
  for (let it = 0; it < iters; it += 1) {
    seedNewRun(['yun-soso', 'jin-sohwa', 'jang-cheol', 'baek-yeon']);
    useGameStore.getState().setPhase('playing');
    if (fullCodex) for (const a of MARTIAL_ARTS) grantScroll(a.id); // 전권 complete — 의뢰 드랍 사슬 미완성 변수 제거
    setElixirBudget(0); // 무과금 — 화경 영약은 오직 서폿 연단으로
    setByeokgokdanBudget(Infinity);
    // 경제 분리 — 이 sweep 은 화경 게이트(외공70·성7·영약) 검증 전용. 자금 부족으로 연단실이
    // 꺼지면 영약 0과로 게이트 검증 자체가 안 되므로 자금을 넉넉히(경제 생존은 economysweep 몫).
    {
      const sect = useSectStore.getState();
      if (sect.sect) sect.setSect({ ...sect.sect, resources: 100_000 });
    }
    buildAlchemyLab();
    for (const id of RECIPE_IDS) learnRecipe(id);
    for (const m of ['herb-common', 'herb-fire', 'herb-poison', 'herb-cold', 'herb-rare']) addMaterial(m, 9_999_999);
    // 신품 영초: 기본(핵과금) 무한 / f2p(무과금) 현실 공급(연간 HD_YEAR개, 영산절지 채집 기반).
    addMaterial('herb-divine', f2p ? Math.max(0, Math.floor(HD_YEAR * years)) : 9_999_999);
    const carryId = 'yun-soso';
    let questCount = 0; // 진단 — 카리 파견 횟수
    let wasQuesting = false;
    // 쌍벽 빌드(2026-06-10) — 대성(7성)은 실전·대련만 여는 새 규칙에 맞춘 최적 조합:
    // 전투 2인(카리+대련 상대가 서로 박빙 유지)+연단 서폿 2인. 장철=권 상성(흑야 트리 동행).
    const sparPartnerId = 'jang-cheol';
    const supportIds = useDiscipleStore
      .getState()
      .order.filter((id) => id !== carryId && id !== sparPartnerId);
    let divine = 0;
    let internalDan = 0;

    const roleMap: Record<string, string> = { [carryId]: 'carry', [sparPartnerId]: 'carry' };
    for (const sid of supportIds) roleMap[sid] = 'alchemy';

    for (let d = 0; d < days; d += 1) {
      // 카리=전투 화경 훈련, 서폿=alchemy 공부 패턴(연단공장).
      configurePartyDay(roleMap);
      // 쌍벽 대련 — 주 2회(무공일 1·5): 대성(7성) 실전 게이트는 대련·의뢰만 연다. docs/06·26.
      // (configurePartyDay 가 매일 축을 새로 정하므로, 대련 외 날은 정책 선택이 그대로 산다.)
      const upcoming = (useTimeStore.getState().current.day % 7) + 1;
      if (upcoming === 1 || upcoming === 5) {
        const sch = useScheduleStore.getState();
        sch.setDailyChoice(carryId, 'martial', daeryeonChoiceValue(sparPartnerId));
        sch.setDailyChoice(sparPartnerId, 'martial', daeryeonChoiceValue(carryId));
      }
      const dsNow = useDiscipleStore.getState();
      // 서폿 연단 — 가용(training)일 때 만들 수 있는 최고 등급 영단 제조(연단실 가동 시).
      for (const sid of supportIds) {
        const sd = dsNow.disciples[sid];
        if (sd && sd.status === 'training') {
          const lv = sd.stats?.alchemy?.level ?? 0;
          const best = byReqDesc.find((r) => r.alchemyReq <= lv);
          if (best && startCraft(sid, best.id)) {
            if (best.id === 'guzeon-daehwandan') divine += 1;
            if (best.category === 'internal') internalDan += 1;
          }
        }
      }
      // 카리 의뢰 — 자금·명성·경험(연단실 유지비를 벌어야 공장이 돈다).
      partyDispatch(carryId, roleMap, 0.12, 13);
      // 초반 램프업 — 보통급이 게시판에 뜨기 전(명성<25)엔 잡일·소무라도 뛰어 명성을 올린다.
      // (실플레이어의 자연스러운 행동 — partyDispatch 는 보통급 이상만 보므로 보완.)
      rampQuest(carryId, 0.12);
      {
        const nowQuesting = useDiscipleStore.getState().disciples[carryId]?.status === 'questing';
        if (nowQuesting && !wasQuesting) questCount += 1;
        wasQuesting = nowQuesting;
      }
      // 카리 내공단 흡수(있고 흡수 중 아니면).
      const carry = dsNow.disciples[carryId];
      if (carry && carry.status === 'training' && !carry.elixirAbsorb) {
        consumeInternalElixir(carryId, 'naegong-fire') || consumeInternalElixir(carryId, 'naegong-water');
      }

      advanceTurn();
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      const inbox = useInboxStore.getState();
      for (const item of [...inbox.items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (isRespondable(item)) {
          // 폐관 청원은 허락, 그 외(돌발 이벤트 등)는 첫 가용 선택 — 미응답 시 의뢰 결산이 영영 멈춘다.
          const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
          if (key) await resolveInboxItem(item, key);
        }
      }
      drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 카리 'questing' 영구 동결(화경 0% 회귀 원인).
      useInboxStore.getState().reset();
      // 부상 즉시 치료 — 연단공장(무한재료) 빌드의 실플레이 가정: 다치면 약부터 짓는다.
      // (엔진 결투·습격 도입으로 부상 빈도↑ — 치료 없는 봇은 다운타임이 성장을 왜곡. 경제는 economysweep 몫.)
      healWithSalve(false);
    }
    const carry = useDiscipleStore.getState().disciples[carryId];
    const realm = carry?.realm ?? 'samryu';
    realmTally[realm] = (realmTally[realm] ?? 0) + 1;
    if (realm === 'hwagyeong') carryHwa += 1;
    sumDivine += divine;
    sumInternalDan += internalDan;
    // 진단 — 카리 세 기둥 + 영약 재고 (화경 병목 추적)
    {
      const mainId = carry?.mainMartialArtId ?? carry?.martialArts[0]?.artId;
      const seong = mainId ? (carry?.martialArts.find((a) => a.artId === mainId)?.seong ?? 0) : 0;
      const stock = useItemStore.getState().items.find((i) => i.id === 'guzeon-daehwandan')?.count ?? 0;
      const scrollCount = useCodexStore.getState().scrolls.length;
      const rep = useSectStore.getState().sect?.reputation ?? 0;
      const learned = carry?.martialArts.length ?? 0;
      const learnedDeep = carry?.martialArts.filter((a) => a.seong >= 4).length ?? 0;
      const cx = useCodexStore.getState();
      // 화경 천장(grandmaster+) 사슬을 코덱스가 전부(전이적) 보유하나 — 봇이 화경 무공을 익힐 수 있는 조건.
      const chainComplete = (artId: string, depth = 0): boolean => {
        if (depth > 8) return false;
        const a = findMartialArt(artId);
        if (!a || !cx.scrolls.find((x) => x.artId === artId && x.status === 'complete')) return false;
        return (a.prerequisites ?? []).every((p) => chainComplete(p.artId, depth + 1));
      };
      const gmReady = MARTIAL_ARTS.filter((a) => a.minDarkness == null && (a.grade === 'grandmaster' || a.grade === 'legendary') && chainComplete(a.id));
      const carryGoal = carry ? goalArtForDiag(carry) : null;
      console.log(
        `  [진단 it${it}] ${REALM_LABEL[realm]} · 내공${Math.round(carry?.realmProgress?.internal ?? 0)} · 외공${carry?.stats?.strength?.level ?? 0} · 주력 ${mainId}(${seong}성) · 익힌 무공 ${learned}권(소성+ ${learnedDeep}) · 비급 ${scrollCount}권 · 화경사슬완성 ${gmReady.length}계보(${gmReady.slice(0, 3).map((a) => a.id).join(',')}) · goal ${carryGoal?.id}(${carryGoal?.grade}) · 명성 ${rep} · 의뢰 ${questCount}회 · 영약재고 ${stock} · pity ${carry?.realmProgress?.pity ?? 0} · status ${carry?.status}`,
      );
    }
  }
  const dist = REALM_ORDER.filter((r) => realmTally[r]).map((r) => `${REALM_LABEL[r]} ${Math.round((realmTally[r] / iters) * 100)}%`).join(' / ');
  console.log(`카리 화경 달성 ${Math.round((carryHwa / iters) * 100)}% · 카리 최종경지 분포: ${dist}`);
  console.log(`서폿 연단공장 산출/회: 구전대환단 ${(sumDivine / iters).toFixed(1)}과 · 내공단 ${(sumInternalDan / iters).toFixed(1)}과`);
}

// ── 적당 연단(무과금 현실 플레이) — 공장(혹사) 대비 화경 도달 검증 ──
// factorysweep 과의 차이: 연단 서폿 1인(진소화)만 · 제조 시도 주 1회 · 카리 내공단 흡수 X.
// 그 외(쌍벽 대련·의뢰 0.12·치료·재료 무한)는 동일 — 재료 수급·레시피 입수는 별도 축이라 고정.
async function runModerateSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 8);
  const withDan = process.argv.includes('dan'); // 'dan' = 카리가 내공단도 챙겨 먹는 변형
  const fullCodex = process.argv.includes('all'); // 'all' = 비급 전권 보유 시작(후기 회차 가정 — 비급 영구 누적)
  const days = years * 336;
  const RECIPE_IDS = ELIXIR_RECIPES.map((r) => r.id);
  const byReqDesc = [...ELIXIR_RECIPES].sort((a, b) => b.alchemyReq - a.alchemyReq);
  console.log(`=== 적당 연단(서폿 1·주 1회 제조${withDan ? '·내공단 복용' : '·내공단 X'}${fullCodex ? '·비급 전권' : ''}) · ${years}년 · ${iters}회 평균 ===`);
  console.log('카리=yun-soso(검) + 대련 상대 장철 + 연단 진소화(주1 제조) + 의술 백연. 공장(factorysweep) 대비.\n');

  let carryHwa = 0;
  const realmTally: Record<string, number> = {};
  let sumDivine = 0;
  for (let it = 0; it < iters; it += 1) {
    seedNewRun(['yun-soso', 'jin-sohwa', 'jang-cheol', 'baek-yeon']);
    useGameStore.getState().setPhase('playing');
    if (fullCodex) for (const a of MARTIAL_ARTS) grantScroll(a.id); // 후기 회차 — 전권 보유
    setElixirBudget(0);
    setByeokgokdanBudget(Infinity);
    {
      const sect = useSectStore.getState();
      if (sect.sect) sect.setSect({ ...sect.sect, resources: 100_000 });
    }
    buildAlchemyLab();
    for (const id of RECIPE_IDS) learnRecipe(id);
    for (const m of ['herb-common', 'herb-fire', 'herb-poison', 'herb-cold', 'herb-rare', 'herb-divine']) addMaterial(m, 9_999_999);
    const carryId = 'yun-soso';
    const sparPartnerId = 'jang-cheol';
    const alchemistId = 'jin-sohwa';
    let questCount = 0;
    let wasQuesting = false;
    let divine = 0;

    const roleMap: Record<string, string> = {
      [carryId]: 'carry',
      [sparPartnerId]: 'carry',
      [alchemistId]: 'alchemy',
      'baek-yeon': 'medicine',
    };

    for (let d = 0; d < days; d += 1) {
      configurePartyDay(roleMap);
      const upcoming = (useTimeStore.getState().current.day % 7) + 1;
      if (upcoming === 1 || upcoming === 5) {
        const sch = useScheduleStore.getState();
        sch.setDailyChoice(carryId, 'martial', daeryeonChoiceValue(sparPartnerId));
        sch.setDailyChoice(sparPartnerId, 'martial', daeryeonChoiceValue(carryId));
      }
      const dsNow = useDiscipleStore.getState();
      // 연단 — 진소화 혼자, 주 1회만(적당히). 기본은 최고 등급, dan 변형은 구전대환단
      // 3과 확보 후 내공단 위주(실플레이: 환골탈태분 챙기고 나면 내공 보급으로 돌림).
      if (d % 7 === 2) {
        const sd = dsNow.disciples[alchemistId];
        if (sd && sd.status === 'training') {
          const lv = sd.stats?.alchemy?.level ?? 0;
          const stock = useItemStore.getState().items.find((i) => i.id === 'guzeon-daehwandan')?.count ?? 0;
          const pick = withDan && stock >= 3
            ? byReqDesc.find((r) => r.category === 'internal' && r.alchemyReq <= lv) ?? byReqDesc.find((r) => r.alchemyReq <= lv)
            : byReqDesc.find((r) => r.alchemyReq <= lv);
          if (pick && startCraft(alchemistId, pick.id)) {
            if (pick.id === 'guzeon-daehwandan') divine += 1;
          }
        }
      }
      partyDispatch(carryId, roleMap, 0.12, 13);
      rampQuest(carryId, 0.12);
      {
        const nowQuesting = useDiscipleStore.getState().disciples[carryId]?.status === 'questing';
        if (nowQuesting && !wasQuesting) questCount += 1;
        wasQuesting = nowQuesting;
      }
      // 내공단 — 기본 변형은 없음(심법 수련만), dan 변형은 있으면 흡수.
      if (withDan) {
        const carry = dsNow.disciples[carryId];
        if (carry && carry.status === 'training' && !carry.elixirAbsorb) {
          consumeInternalElixir(carryId, 'naegong-fire') || consumeInternalElixir(carryId, 'naegong-water');
        }
      }

      advanceTurn();
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      const inbox = useInboxStore.getState();
      for (const item of [...inbox.items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (isRespondable(item)) {
          const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
          if (key) await resolveInboxItem(item, key);
        }
      }
      drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 카리 'questing' 영구 동결(화경 0% 회귀 원인).
      useInboxStore.getState().reset();
      healWithSalve(false);
    }
    const carry = useDiscipleStore.getState().disciples[carryId];
    const realm = carry?.realm ?? 'samryu';
    realmTally[realm] = (realmTally[realm] ?? 0) + 1;
    if (realm === 'hwagyeong') carryHwa += 1;
    sumDivine += divine;
    {
      const mainId = carry?.mainMartialArtId ?? carry?.martialArts[0]?.artId;
      const seong = mainId ? (carry?.martialArts.find((a) => a.artId === mainId)?.seong ?? 0) : 0;
      const stock = useItemStore.getState().items.find((i) => i.id === 'guzeon-daehwandan')?.count ?? 0;
      console.log(
        `  [진단 it${it}] ${REALM_LABEL[realm]} · 내공${Math.round(carry?.realmProgress?.internal ?? 0)} · 외공${carry?.stats?.strength?.level ?? 0} · 주력 ${mainId}(${seong}성) · 의뢰 ${questCount}회 · 구전대환단 제조 ${divine}과(재고 ${stock}) · status ${carry?.status}`,
      );
    }
  }
  const dist = REALM_ORDER.filter((r) => realmTally[r]).map((r) => `${REALM_LABEL[r]} ${Math.round((realmTally[r] / iters) * 100)}%`).join(' / ');
  console.log(`카리 화경 달성 ${Math.round((carryHwa / iters) * 100)}% · 분포: ${dist}`);
  console.log(`연단 산출/회: 구전대환단 ${(sumDivine / iters).toFixed(1)}과`);
}

// 현장 급보 큐 드레인 — 의뢰·출행 중 발동한 돌발 사건(fieldEventStore)을 첫 가용 선택으로 즉시 해소.
// 실게임은 FieldEventOverlay 가 강제로 띄워 사용자가 고른다(턴 진행이 막힘) — 헤드리스는 자동 선택.
// ⚠ 이걸 안 하면 pendingEventId 가 영영 안 풀려 의뢰가 결산되지 않고 제자가 'questing' 에 영구 동결된다
// (현장 급보가 서신함→fieldEventStore 로 이관된 2026-06-17 이후 회귀 — 인박스 드레인만으론 안 풀림).
function drainFieldEvents(): void {
  const fes = useFieldEventStore.getState();
  let guard = 0;
  while (fes.queue.length > 0 && guard < 50) {
    guard += 1;
    const ev = useFieldEventStore.getState().queue[0];
    if (!ev) break;
    const key = ev.choices.find((c) => c.available !== false)?.key ?? ev.choices[0]?.key;
    if (key) resolveFieldEvent(ev, key);
    useFieldEventStore.getState().pop();
  }
}

// 명성 램프업 파견 — 등급 무관 역량 되는 최고 의뢰에 솔로 파견(잡일·소무 포함).
function rampQuest(id: string, rate: number): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[id];
  if (!d || d.status !== 'training' || currentAge(d) < 13) return;
  if (Math.random() >= rate) return;
  const board = useQuestStore.getState().board;
  const fits = board.filter((q) => canDispatch(d, q));
  if (!fits.length) return;
  fits.sort((a, b) => QUEST_GRADE_ORDER.indexOf(b.grade) - QUEST_GRADE_ORDER.indexOf(a.grade));
  dispatchQuest(fits[0].id, [id]);
}

// 동(銅) → 금/은/동 표기. 1금=1000동, 1은=100동 (docs/09).
function coinStr(copper: number): string {
  const safe = Math.max(0, Math.round(copper));
  const g = Math.floor(safe / 1000);
  const r = safe - g * 1000;
  const s = Math.floor(r / 100);
  const c = r - s * 100;
  const parts: string[] = [];
  if (g) parts.push(`${g}금`);
  if (s) parts.push(`${s}은`);
  if (c || parts.length === 0) parts.push(`${c}동`);
  return parts.join(' ');
}

// ── 자금 소진율 — 의뢰·판매 없이 그냥 진행 시 며칠 만에 파산하나(식비+유지비 vs 후원) ──
async function runBurnSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 30);
  const days = years * 336;
  console.log(`=== 자금 추이 — 의뢰 빈도별 (제자 4명·연단실 ON·시작 ${coinStr(12345)}) ===`);
  console.log('지출: 식비 60동/제자·월 + 연단실 유지비 2은/월. 수입: 후원금(명성) + 의뢰 보상.\n');
  for (const cfg of [
    { name: '의뢰 없음', rate: 0 },
    { name: '의뢰 가끔(5%)', rate: 0.05 },
    { name: '의뢰 자주(15%)', rate: 0.15 },
  ]) {
    seedNewRun(SEED_POOL);
    useGameStore.getState().setPhase('playing');
    buildAlchemyLab();
    const yearly: number[] = [];
    for (let d = 0; d < days; d += 1) {
      configureOptimal(); // 제자 훈련·성장(역량↑ → 더 좋은 의뢰 가능)
      if (cfg.rate > 0) incomeDispatch(cfg.rate, 13); // 청소년기부터 가끔 의뢰(잡일 포함) → 수입
      advanceTurn();
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      const inbox = useInboxStore.getState();
      for (const item of [...inbox.items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (isRespondable(item)) {
          // 폐관 청원은 허락, 그 외(돌발 이벤트 등)는 첫 가용 선택 — 미응답 시 의뢰 결산이 영영 멈춘다.
          const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
          if (key) await resolveInboxItem(item, key);
        }
      }
      healWithSalve(false); // 부상 회복(의뢰 계속 가게)
      useInboxStore.getState().reset();
      if ((d + 1) % 336 === 0) yearly.push(useSectStore.getState().sect?.resources ?? 0);
    }
    const fin = yearly[yearly.length - 1] ?? 0;
    console.log(`[${cfg.name}] 연도별 잔액: ${yearly.slice(0, 8).map((v) => coinStr(v)).join(' / ')}`);
    console.log(`  ${years}년 최종 ${coinStr(fin)}\n`);
  }
}

// ── 경제 전 조합 그리드 — 식비·유지비·시작자금·의뢰보상 변주 × 가끔 의뢰(10%) ──
async function runEconomySweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const days = years * 336;
  // 2026-06-10 재조정: 시작자금 50은(5000동) 확정 + 의뢰 보수 ×2.3 상향 반영.
  // 유지비 70 vs 100 비교(유지비 부담 논의), 보수 배율은 실데이터 그대로(×1).
  const FOODS = [20];
  const UPKEEPS = [70, 100];
  const STARTS = [5000];
  const REWARDS = [1];
  const RATES = [0.1, 0.25, 0.5]; // 의뢰 가동률 — 가끔/보통/부지런
  const reps = Number(process.argv[4] ?? 5); // 통계 룰(docs/36 §통계 3룰) — 조합당 반복 평균
  console.log(`=== 경제 그리드 — 연단실 ON · 의뢰 가동률 변주 · ${years}년 (제자 4명) · 조합당 n=${reps} ===`);
  console.log('각 조합 평균 최종 자금 + 연단실 가동(n중 납부중 횟수) + 최저점(평균/최악). 단위 금/은/동.\n');
  console.log('식비 | 유지비 | 시작 | 가동률 → 평균최종 | 가동 | 최저(평균/최악)');
  for (const food of FOODS)
    for (const up of UPKEEPS)
      for (const start of STARTS)
        for (const rate of RATES) {
          const rw = REWARDS[0];
          let finSum = 0;
          let minSum = 0;
          let minWorst = Infinity;
          let labOn = 0;
          for (let rep = 0; rep < reps; rep += 1) {
            seedNewRun(SEED_POOL);
            useGameStore.getState().setPhase('playing');
            setFoodCost(food);
            setLabUpkeep(up);
            setQuestRewardMult(rw);
            setPatronageMult(1);
            const sect = useSectStore.getState();
            if (sect.sect) sect.setSect({ ...sect.sect, resources: start });
            buildAlchemyLab();
            let minRes = start;
            for (let d = 0; d < days; d += 1) {
              configureOptimal();
              incomeDispatch(rate, 13);
              advanceTurn();
              const s = useScheduleStore.getState();
              if (s.pendingReport) s.resolveMonthlyReport();
              if (s.pendingSetup) s.resolveMonthlySetup();
              if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
              const inbox = useInboxStore.getState();
              for (const item of [...inbox.items]) {
                const dom = (item.payload as { domain?: string } | undefined)?.domain;
                if (isRespondable(item)) {
                  // 폐관 청원은 허락, 그 외(돌발 이벤트 등)는 첫 가용 선택 — 미응답 시 의뢰 결산이 영영 멈춘다.
                  const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
                  if (key) await resolveInboxItem(item, key);
                }
              }
              healWithSalve(false);
              useInboxStore.getState().reset();
              const r = useSectStore.getState().sect?.resources ?? 0;
              if (r < minRes) minRes = r;
            }
            finSum += useSectStore.getState().sect?.resources ?? 0;
            minSum += minRes;
            if (minRes < minWorst) minWorst = minRes;
            if (isLabOperational()) labOn += 1;
          }
          void rw;
          console.log(
            `식비${food} | 유지${up} | ${coinStr(start)} | ${Math.round(rate * 100)}% → ${coinStr(finSum / reps)} | ${labOn}/${reps} | 최저 ${coinStr(minSum / reps)} / 최악 ${coinStr(minWorst)}`,
          );
        }
}

// ── 무공 선택→훈련 궤적 검증 — 성·낙수·등급 속도·경지 클램프가 정상 동작·수치인지 ──────
const HWASAN_TREE = [
  'hwasan-gicho-sword', 'yukhap-sword', 'maehwa-sword', 'jaha-sword', 'isipsa-maehwa-sword',
  'maehwa-gigong', 'jaha-singong', 'amhyang-pyo',
];

function grantScroll(artId: string): void {
  const cx = useCodexStore.getState();
  cx.addScroll({
    artId,
    acquiredAtRun: 1,
    acquiredAtDay: useTimeStore.getState().totalDay,
    status: 'complete', // 시뮬 — 연구 게이트는 즉시 완료(실시간 타이머는 시뮬과 양립 불가)
    researchProgress: 100,
    isTrap: false,
    isIncomplete: false,
  });
  // 이미 보유한 비급(addScroll 이 무시)도 complete 로 강제 — 다회차(seedNewRun resetForNewRun)가
  // quest 비급을 identified 로 깎으므로, all 플래그 측정에서 사슬이 학습 가능하게 보장.
  cx.setScrollStatus(artId, 'complete');
  cx.patchScroll(artId, { researchProgress: 100 });
}

interface ArtSnap { seong: number; exp: number }
function snapArts(id: string): Record<string, ArtSnap> {
  const d = useDiscipleStore.getState().disciples[id];
  const out: Record<string, ArtSnap> = {};
  for (const a of d?.martialArts ?? []) out[a.artId] = { seong: a.seong, exp: a.exp };
  return out;
}

// 수치 무결성 — NaN/음수/성 하락/캡 초과를 매일 감시.
function sanityCheck(id: string, prev: Record<string, ArtSnap>, issues: string[]): Record<string, ArtSnap> {
  const now = snapArts(id);
  for (const [artId, s] of Object.entries(now)) {
    if (!Number.isFinite(s.exp) || s.exp < 0) issues.push(`${artId}: exp 이상치 ${s.exp}`);
    if (s.seong < 1 || s.seong > 10) issues.push(`${artId}: 성 범위 밖 ${s.seong}`);
    const p = prev[artId];
    if (p && s.seong < p.seong) issues.push(`${artId}: 성 하락 ${p.seong}→${s.seong}`);
    if (s.exp >= expToNextSeong(s.seong) + 1) issues.push(`${artId}: exp 미소진 ${Math.round(s.exp)}/${expToNextSeong(s.seong)}`);
  }
  return now;
}

// ── 체질 달성 시점 — 시그니처 무공 7성(대성) 도달 시기 (최적 봇 15년) ──────────────
// 각 체질 트리만 보유시켜 봇이 그 무공을 주력 삼아 등반 → 7성(=체질 달성)을 언제 찍는지 측정.
function grantChain(artId: string): void {
  const seen = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const art = findMartialArt(id);
    if (!art) return;
    for (const p of art.prerequisites ?? []) walk(p.artId);
    grantScroll(id);
  };
  walk(artId);
}

function chainArtIds(artId: string): string[] {
  const seen = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const p of findMartialArt(id)?.prerequisites ?? []) walk(p.artId);
  };
  walk(artId);
  return [...seen];
}

async function runConstitutionSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const ds = () => useDiscipleStore.getState();
  const carry = 'yun-soso';
  const GR: Record<string, number> = { novice: 0, apprentice: 1, master: 2, grandmaster: 3, legendary: 4 };
  const TARGETS = [
    { title: '금강불괴(외상)', art: 'geumgang-bulgoe' },
    { title: '한서불침(동상)', art: 'sunyang-mugeuk-gong' },
    { title: '화염불침(화상)', art: 'jeomchang-yeolyang-singong' },
    { title: '만독불침(중독)', art: 'dangga-cheondok-singong' },
  ];
  console.log('=== 체질 달성 시점 — 시그니처 절기 보유(=체질) 시기 (해당 트리 전념 등반 15년) ===');
  console.log('체질 = 시그니처 절기 보유. 트리만 쥐여주고 매일 최고등급 학습가능 비급을 주력 삼아 등반.\n');
  for (const t of TARGETS) {
    seedNewRun(SEED_POOL);
    useGameStore.getState().setPhase('playing');
    setByeokgokdanBudget(Infinity);
    setElixirBudget(2);
    grantChain(t.art);
    const chain = chainArtIds(t.art).map((id) => findMartialArt(id)!).filter(Boolean);
    const name = findMartialArt(t.art)?.name ?? t.art;
    let learnDay = 0;
    const marks: string[] = [];
    const ownedIds = new Set<string>();
    for (let d = 0; d < 15 * 336; d += 1) {
      if (useGameStore.getState().phase === 'ended') break;
      configureOptimal(); // 폐관·영약·외공 등 무거운 처리. 주력·축은 아래서 덮어쓴다.
      const me0 = ds().disciples[carry];
      if (!me0) break;
      // 트리 등반 — 지금 익힐 수 있는 최고등급 체질-트리 비급을 주력으로(선행 성 채우며 위로).
      const target = chain
        .filter((a) => canLearnArt(me0, a))
        .sort((a, b) => GR[b.grade] - GR[a.grade])[0];
      if (target && me0.mainMartialArtId !== target.id) ds().assignMainMartialArt(carry, target.id);
      // 축 — 다음 경지 내공 모자라면 격일 심법, 아니면 초식(주력 비급 성 = 상위 선행 게이트).
      const next = nextRealmOf(me0.realm);
      const needInt = next ? (me0.realmProgress?.internal ?? 0) < (REALM_INTERNAL_REQ[next] ?? 0) : false;
      useScheduleStore.getState().setDailyChoice(carry, 'martial', needInt && d % 2 === 0 ? 'simbeop' : 'chosik');
      advanceTurn();
      const sc = useScheduleStore.getState();
      if (sc.pendingReport) sc.resolveMonthlyReport();
      if (sc.pendingSetup) sc.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      const inbox = useInboxStore.getState();
      for (const item of [...inbox.items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (dom === 'seclusion_petition' && isRespondable(item)) await resolveInboxItem(item, 'allow');
      }
      useInboxStore.getState().reset();
      // 신규 학습 비급 기록(트리 등정 이정표).
      const me = ds().disciples[carry];
      if (!me) break;
      for (const a of me.martialArts) {
        if (!ownedIds.has(a.artId) && chain.some((c) => c.id === a.artId)) {
          ownedIds.add(a.artId);
          marks.push(`${findMartialArt(a.artId)?.name} ${((d + 1) / 336).toFixed(1)}년(${REALM_LABEL[me.realm]})`);
          if (a.artId === t.art && !learnDay) learnDay = d + 1;
        }
      }
      if (learnDay) break; // 시그니처 보유 = 체질 달성 — 시점 확보 후 종료
    }
    const me = ds().disciples[carry];
    const head = learnDay
      ? `✅ 체질 달성 ${(learnDay / 336).toFixed(1)}년차(${REALM_LABEL[me?.realm ?? 'samryu']})`
      : `❌ 15년 내 미달(현 경지 ${REALM_LABEL[me?.realm ?? 'samryu']})`;
    console.log(`  ${t.title.padEnd(14)} ${name.padEnd(10)} | ${head}`);
    console.log(`      등정: ${marks.join(' → ')}`);
  }
}

async function runTrainSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const ds = () => useDiscipleStore.getState();
  const carry = 'yun-soso';
  const issues: string[] = [];

  // ── 시나리오 A: 하품 한 권 집중(수동 일과 — 봇 개입 없음) — 디딤돌 속도·경지 클램프 ──
  console.log('=== A. 하품 집중 — 화산기초검 한 권만, 수동 일과 3년 (윤소소·검 특화) ===');
  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  setByeokgokdanBudget(Infinity);
  grantScroll('hwasan-gicho-sword');
  ds().assignMainMartialArt(carry, 'hwasan-gicho-sword');
  useScheduleStore.getState().setSchedule({
    weeklyPattern: ['martial', 'martial', 'martial', 'physical', 'martial', 'martial', 'rest'],
    monthlyQuests: 0,
  });
  let prev = snapArts(carry);
  let lastSeong = 1;
  let lastRealm = ds().disciples[carry]?.realm ?? 'samryu';
  for (let d = 0; d < 3 * 336; d += 1) {
    const me = ds().disciples[carry];
    if (!me) break;
    // 봇 없이 사람처럼: 다음 경지 내공이 모자라면 심법/초식 격일, 아니면 초식만. 체력일은 기마자세.
    const next = nextRealmOf(me.realm);
    const needInternal = next ? (me.realmProgress?.internal ?? 0) < (REALM_INTERNAL_REQ[next] ?? 0) : false;
    const axis = needInternal && d % 2 === 0 ? 'simbeop' : 'chosik';
    const sch = useScheduleStore.getState();
    sch.setDailyChoice(carry, 'martial', axis);
    sch.setDailyChoice(carry, 'physical', 'phys_horse');
    advanceTurn();
    const s = useScheduleStore.getState();
    if (s.pendingReport) s.resolveMonthlyReport();
    if (s.pendingSetup) s.resolveMonthlySetup();
    if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
    useInboxStore.getState().reset();
    prev = sanityCheck(carry, prev, issues);

    const after = ds().disciples[carry];
    const inst = after?.martialArts.find((a) => a.artId === 'hwasan-gicho-sword');
    if (inst && inst.seong !== lastSeong) {
      console.log(`  D${d + 1}: 화산기초검 ${lastSeong}성 → ${inst.seong}성 (경지 ${REALM_LABEL[after!.realm]} · 내공 ${Math.round(after!.realmProgress?.internal ?? 0)})`);
      lastSeong = inst.seong;
    }
    if (after && after.realm !== lastRealm) {
      console.log(`  D${d + 1}: 경지 ${REALM_LABEL[lastRealm]} → ${REALM_LABEL[after.realm]} — 성 상한 해제 확인`);
      lastRealm = after.realm;
    }
  }
  {
    const me = ds().disciples[carry];
    const inst = me?.martialArts.find((a) => a.artId === 'hwasan-gicho-sword');
    console.log(`  → 3년 종착: 화산기초검 ${inst?.seong}성/${'6'}(하품 캡) · 경지 ${REALM_LABEL[me?.realm ?? 'samryu']} · 익힌 무공 ${me?.martialArts.length}권`);
  }

  // ── 시나리오 B: 화산 트리 등반(봇 최적 일과 15년) — 갈아타기·낙수·절품 등정 ──────────
  console.log('\n=== B. 화산 트리 등반 — 8권 비급 보유, 최적 일과 15년 (낙수·갈아타기 관찰) ===');
  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  setByeokgokdanBudget(Infinity);
  setElixirBudget(1); // 화경 벽 1회분 — 끝까지 오르는지
  for (const id of HWASAN_TREE) grantScroll(id);
  prev = snapArts(carry);
  let lastMain = '';
  const seongOfMain = () => {
    const me = ds().disciples[carry];
    const mid = me?.mainMartialArtId ?? '';
    return me?.martialArts.find((a) => a.artId === mid)?.seong ?? 0;
  };
  let lastMainSeong = 0;
  lastRealm = 'samryu';
  for (let d = 0; d < 15 * 336; d += 1) {
    await fastDay();
    prev = sanityCheck(carry, prev, issues);
    const me = ds().disciples[carry];
    if (!me) break;
    const main = me.mainMartialArtId ?? '';
    if (main !== lastMain) {
      console.log(`  D${d + 1}: 주력 교체 → ${findMartialArt(main)?.name ?? main}`);
      lastMain = main;
      lastMainSeong = seongOfMain();
    } else {
      const s2 = seongOfMain();
      if (s2 > lastMainSeong) {
        lastMainSeong = s2;
      }
    }
    if (me.realm !== lastRealm) {
      console.log(`  D${d + 1}: 경지 ${REALM_LABEL[lastRealm]} → ${REALM_LABEL[me.realm]}`);
      lastRealm = me.realm;
    }
    // 연 1회 — 트리 전체 스냅샷(낙수로 하위 책이 같이 자라는지).
    if ((d + 1) % 336 === 0) {
      const line = HWASAN_TREE.map((id2) => {
        const inst = me.martialArts.find((a) => a.artId === id2);
        return inst ? `${findMartialArt(id2)?.name} ${inst.seong}성` : null;
      }).filter(Boolean).join(' · ');
      console.log(`  [${(d + 1) / 336}년차] ${line || '(아직 학습 전)'}`);
    }
  }
  {
    const me = ds().disciples[carry];
    console.log(`  → 15년 종착: 경지 ${REALM_LABEL[me?.realm ?? 'samryu']} · 익힌 무공 ${me?.martialArts.length}권`);
  }

  console.log(issues.length === 0 ? '\n수치 무결성: 이상 없음 (NaN/음수/성 하락/exp 미소진 0건)' : `\n⚠ 수치 이상 ${issues.length}건:\n  ${[...new Set(issues)].slice(0, 10).join('\n  ')}`);
}

// ── 의뢰 정밀 매트릭스 — 전 의뢰 × 파티 적합도 → 결과 분포·사망·치명상·자금·드랍 ──────
// 결투(엔진)·판정식 도메인을 같은 틀에서 실측. 실행: run-headless.cjs questmatrix [reps]
const inst = (artId: string, seong: number): MartialArtInstance => ({ artId, seong, exp: 0, unlockedAt: 0 });
const PRESETS = {
  samryu3: { label: '삼류3성', realm: 'samryu', internal: 60, str: 12, agi: 12, end: 18, arts: [inst('samjae-sword', 3), inst('chosangbi', 2)] },
  iryu4: { label: '이류4성', realm: 'iryu', internal: 200, str: 25, agi: 25, end: 30, arts: [inst('samjae-sword', 4), inst('chosangbi', 3), inst('tonap-beop', 3)] },
  ilryu6: { label: '일류6성', realm: 'ilryu', internal: 400, str: 40, agi: 38, end: 40, arts: [inst('maehwa-sword', 6), inst('chosangbi', 4), inst('tonap-beop', 4), inst('geumjong-jo', 3)] },
  jeol7: { label: '절정7성', realm: 'jeoljeong', internal: 650, str: 50, agi: 45, end: 48, arts: [inst('maehwa-sword', 7), inst('chosangbi', 5), inst('tonap-beop', 5), inst('geumjong-jo', 4)] },
  cho8: { label: '초절8성', realm: 'chojeoljeong', internal: 900, str: 56, agi: 50, end: 54, arts: [inst('isipsa-maehwa-sword', 8), inst('chosangbi', 6), inst('tonap-beop', 6), inst('geumjong-jo', 5)] },
  hwa10: { label: '화경10성', realm: 'hwagyeong', internal: 1300, str: 70, agi: 60, end: 60, arts: [inst('isipsa-maehwa-sword', 10), inst('chosangbi', 7), inst('tonap-beop', 7), inst('geumjong-jo', 6)] },
} as const;
type PresetKey = keyof typeof PRESETS;

// 전투 도메인(결투·큰의뢰) — 등급별 미달/적정/우월 프리셋 사다리.
const COMBAT_TIERS: Record<string, [PresetKey, PresetKey, PresetKey]> = {
  minor: ['samryu3', 'samryu3', 'iryu4'],
  normal: ['samryu3', 'iryu4', 'ilryu6'],
  dangerous: ['iryu4', 'ilryu6', 'jeol7'],
  extreme: ['ilryu6', 'jeol7', 'cho8'],
};
const TIER_LABEL = ['미달', '적정', '우월'];

function applyPreset(id: string, p: (typeof PRESETS)[PresetKey], statOverride?: { stat: string; level: number }): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[id];
  if (!d) return;
  const stats: Record<string, { level: number; exp: number }> = {
    strength: { level: p.str, exp: 0 },
    agility: { level: p.agi, exp: 0 },
    endurance: { level: p.end, exp: 0 },
  };
  if (statOverride) stats[statOverride.stat] = { level: statOverride.level, exp: 0 };
  ds.update(id, {
    realm: p.realm as never,
    realmProgress: { internal: p.internal, pity: 0, petitioned: false },
    martialArts: p.arts.map((a) => ({ ...a })),
    mainMartialArtId: p.arts[0]?.artId,
    stats: stats as never,
    status: 'training',
    wounds: undefined,
    stamina: d.maxStamina,
    stress: 0,
    simma: 0,
  });
}

const OUTCOME_BY_TITLE: [string, string][] = [
  ['의뢰 위기 끝에 성공', 'crisis'],
  ['의뢰 완수', 'full'],
  ['의뢰 성공', 'partial'],
  ['의뢰 실패', 'fail'],
  ['의뢰 재난', 'disaster'],
];

// 직업 선택 시뮬 — 15년 키운 졸업생 원형(스탯·무공·성격·경지·명성·흑화)을 바꿔가며 evaluateJobs 후보(상위 4 = 플레이어 선택지)
// 확인. 봇이 못 만드는 다양한 빌드(의원·정탐·사파·마인 등)까지 직업 매칭이 합당한지 테스트. 실행: run-headless.cjs jobselect
async function runJobSelect(): Promise<void> {
  setAutoSaveEnabled(false);
  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  const ds = () => useDiscipleStore.getState();
  const id = ds().order[0];
  const SCHOOL_ART: Record<string, string> = {
    sword: 'ami-manbul-jojong-sword', saber: 'common-pungroe-dobeop', fist: 'ami-hangma-singwon',
    lightness: 'ami-neungun-yeonhwa-bo', hidden: 'common-yeonju-pyo', external: 'ami-yeonhwa-geumgang-che',
    qigong: 'geumjeong-singong', medical: 'dangga-haedok-bigyeol', darkArts: 'heupseong-daebeop',
  };
  type Arch = {
    label: string; realm: string; str: number; arts: [string, number][];
    stats?: Record<string, number>; persona?: Record<string, number>; fame?: number; dark?: number;
  };
  const A: Arch[] = [
    { label: '검수(절정·검7)', realm: 'jeoljeong', str: 50, arts: [['sword', 7], ['lightness', 4]], fame: 40 },
    { label: '검성급(화경·검10)', realm: 'hwagyeong', str: 72, arts: [['sword', 10], ['qigong', 7]], stats: { knowledge: 72, guarding: 62 }, persona: { freedom: 62, integrity: 60, mercy: 58, ambition: 58 }, fame: 95 },
    { label: '외공무사(초절·외공8)', realm: 'chojeoljeong', str: 70, arts: [['external', 8], ['fist', 6]], fame: 35 },
    { label: '호위(절정·호위75)', realm: 'jeoljeong', str: 55, arts: [['saber', 6]], stats: { guarding: 75, etiquette: 65, knowledge: 55 }, fame: 50 },
    { label: '신의(절정·의술85)', realm: 'jeoljeong', str: 20, arts: [['medical', 6]], stats: { medicine: 85, knowledge: 72, alchemy: 55 }, fame: 60, persona: { warmth: 75, mercy: 70 } },
    { label: '강호의원(일류·의술60)', realm: 'ilryu', str: 15, arts: [['medical', 4]], stats: { medicine: 60, alchemy: 40 }, fame: 25 },
    { label: '약왕(절정·약재82)', realm: 'jeoljeong', str: 20, arts: [['qigong', 5]], stats: { alchemy: 82, medicine: 58 }, fame: 55 },
    { label: '그림자(절정·정탐85)', realm: 'jeoljeong', str: 35, arts: [['lightness', 7], ['hidden', 6]], stats: { scouting: 85 }, fame: 45 },
    { label: '밀정(일류·정탐62)', realm: 'ilryu', str: 30, arts: [['lightness', 5]], stats: { scouting: 62 }, fame: 20 },
    { label: '사파살수(절정·검8·냉혹)', realm: 'jeoljeong', str: 50, arts: [['sword', 8], ['hidden', 6]], stats: { scouting: 70 }, persona: { mercy: 18, integrity: 25 }, fame: 40 },
    { label: '마인(초절·마공8·흑화)', realm: 'chojeoljeong', str: 55, arts: [['darkArts', 8], ['qigong', 6]], persona: { mercy: 10, integrity: 15 }, dark: 3, fame: 50 },
    { label: '마교호법급(화경·마공10·흑화)', realm: 'hwagyeong', str: 70, arts: [['darkArts', 10], ['fist', 7]], persona: { mercy: 8, integrity: 12, ambition: 70 }, dark: 4, fame: 90 },
    { label: '책사(절정·지력78)', realm: 'jeoljeong', str: 30, arts: [['sword', 5]], stats: { knowledge: 78, formation: 62 }, fame: 45 },
    { label: '도가(초절·내공8·지력)', realm: 'chojeoljeong', str: 40, arts: [['qigong', 8], ['sword', 6]], stats: { knowledge: 72 }, persona: { prudence: 75, freedom: 70 }, fame: 55 },
    { label: '범재(절정·검5·맨몸)', realm: 'jeoljeong', str: 45, arts: [['sword', 5]], fame: 10 },
    { label: '삼류백수(삼류·검3)', realm: 'samryu', str: 12, arts: [['sword', 3]], fame: 0 },
  ];

  console.log('=== 직업 선택 시뮬 — 15년 졸업생 빌드별 직업 후보(상위 4 = 선택지) ===');
  console.log('스탯·무공·성격·경지·명성을 바꿔가며 evaluateJobs. 후보가 빌드와 합당한지 확인.\n');
  for (const a of A) {
    const persona = { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50, ...(a.persona ?? {}) };
    const stats: Record<string, { level: number; exp: number }> = {
      strength: { level: a.str, exp: 0 }, agility: { level: Math.round(a.str * 0.8), exp: 0 }, endurance: { level: Math.round(a.str * 0.9), exp: 0 },
    };
    for (const [k, v] of Object.entries(a.stats ?? {})) stats[k] = { level: v, exp: 0 };
    const arts = a.arts.map(([sch, s]) => ({ artId: SCHOOL_ART[sch], seong: s, exp: 0, unlockedAt: 0 }));
    ds().update(id, {
      realm: a.realm as never, realmProgress: { internal: 1300, pity: 0, petitioned: false },
      martialArts: arts as never, mainMartialArtId: arts[0]?.artId,
      stats: stats as never, personality: persona as never,
      fame: a.fame ?? 0, darknessLevel: (a.dark ?? 0) as never, status: 'training', wounds: undefined,
    });
    const jobs = evaluateJobs(ds().disciples[id]!);
    const top = jobs.slice(0, 4).map((j) => `${j.job.name} ${Math.round(j.prob * 100)}%`).join(' · ');
    console.log(`  ${a.label.padEnd(22)} → ${top || '(자격 직업 없음)'}`);
  }
}

// 졸업 종합 진단 엔진 — 15년 양육 끝 상태 전부(경지·직업·능력치·무공·체질·명성·흑화). 계속 돌려 양육 결과 테스트.
// 실행: run-headless.cjs gradsweep [reps] [optimal|party]
async function runGradSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const reps = Number(process.argv[3] ?? 20);
  const mode = process.argv[4] ?? 'optimal';
  const ds = () => useDiscipleStore.getState();
  const ROLES = ['carry', 'medicine', 'alchemy', 'formation'];
  // 제자별 집계
  type Acc = { realm: Record<string, number>; job: Record<string, number>; none: number;
    ext: number; internal: number; seong: number; arts: number; fame: number; dark: number;
    guarding: number; scouting: number; medicine: number; knowledge: number; alchemy: number;
    constitution: Record<string, number>; n: number };
  const acc: Record<string, Acc> = {};
  const newAcc = (): Acc => ({ realm: {}, job: {}, none: 0, ext: 0, internal: 0, seong: 0, arts: 0, fame: 0, dark: 0, guarding: 0, scouting: 0, medicine: 0, knowledge: 0, alchemy: 0, constitution: {}, n: 0 });

  console.log(`=== 졸업 종합 진단 — 15년 양육 × ${reps}회 (정책: ${mode}) ===`);
  console.log('15년 끝 상태: 경지·직업·외공/내공·주력 성·무공 권수·비전투 스탯·체질·명성·흑화.\n');

  for (let r = 0; r < reps; r += 1) {
    seedNewRun(SEED_POOL);
    useGameStore.getState().setPhase('playing');
    setByeokgokdanBudget(Infinity);
    setElixirBudget(1);
    const roster = ds().order.slice(0, 4);
    const roleMap: Record<string, string> = {};
    roster.forEach((id, i) => { roleMap[id] = ROLES[i] ?? 'combat'; });
    for (let d = 0; d < 15 * 336; d += 1) {
      if (useGameStore.getState().phase === 'ended') break;
      if (mode === 'party') configurePartyDay(roleMap); else configureOptimal();
      optimalDispatch(0.05, 13);
      advanceTurn();
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      for (const item of [...useInboxStore.getState().items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (dom === 'seclusion_petition' && isRespondable(item)) await resolveInboxItem(item, 'allow');
      }
      useInboxStore.getState().reset();
    }
    for (const id of roster) {
      const d = ds().disciples[id];
      if (!d) continue;
      const a = (acc[d.name] ??= newAcc());
      a.n += 1;
      a.realm[REALM_LABEL[d.realm]] = (a.realm[REALM_LABEL[d.realm]] ?? 0) + 1;
      const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
      a.seong += d.martialArts.find((x) => x.artId === mainId)?.seong ?? 0;
      a.arts += d.martialArts.length;
      a.ext += d.stats?.strength?.level ?? 0;
      a.internal += d.realmProgress?.internal ?? 0;
      a.fame += d.fame ?? 0;
      a.dark += d.darknessLevel ?? 0;
      a.guarding += d.stats?.guarding?.level ?? 0;
      a.scouting += d.stats?.scouting?.level ?? 0;
      a.medicine += d.stats?.medicine?.level ?? 0;
      a.knowledge += d.stats?.knowledge?.level ?? 0;
      a.alchemy += d.stats?.alchemy?.level ?? 0;
      for (const t of constitutionTitles(d.martialArts)) a.constitution[t] = (a.constitution[t] ?? 0) + 1;
      const jobs = evaluateJobs(d);
      if (jobs.length === 0) a.none += 1;
      else a.job[jobs[0].job.name] = (a.job[jobs[0].job.name] ?? 0) + 1;
    }
  }

  const pctMap = (m: Record<string, number>, denom: number) =>
    Object.entries(m).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${Math.round((v / denom) * 100)}%`).join('·');
  const aggRealm: Record<string, number> = {}; const aggJob: Record<string, number> = {}; let totalN = 0;
  for (const id of ds().order.slice(0, 4)) {
    const nm = ds().disciples[id]?.name ?? id;
    const a = acc[nm]; if (!a) continue;
    totalN += a.n;
    for (const [k, v] of Object.entries(a.realm)) aggRealm[k] = (aggRealm[k] ?? 0) + v;
    for (const [k, v] of Object.entries(a.job)) aggJob[k] = (aggJob[k] ?? 0) + v;
    const consti = Object.keys(a.constitution).length ? ` · 체질 ${pctMap(a.constitution, a.n)}` : '';
    console.log(`  [${nm}] 경지 ${pctMap(a.realm, a.n)} | 직업 ${pctMap(a.job, a.n)}${a.none ? `·미달${Math.round((a.none / a.n) * 100)}%` : ''}`);
    console.log(`        외공 ${(a.ext / a.n).toFixed(0)}·내공 ${(a.internal / a.n).toFixed(0)}·주력 ${(a.seong / a.n).toFixed(1)}성·무공 ${(a.arts / a.n).toFixed(1)}권·명성 ${(a.fame / a.n).toFixed(0)}·흑화 ${(a.dark / a.n).toFixed(1)} | 비전투 호위${(a.guarding / a.n).toFixed(0)}·정탐${(a.scouting / a.n).toFixed(0)}·의술${(a.medicine / a.n).toFixed(0)}·지력${(a.knowledge / a.n).toFixed(0)}·연단${(a.alchemy / a.n).toFixed(0)}${consti}`);
  }
  console.log(`\n[전체 경지] ${pctMap(aggRealm, totalN)}`);
  console.log(`[전체 직업] ${pctMap(aggJob, totalN)}`);
  const hwa = aggRealm['화경'] ?? 0;
  console.log(`[화경 도달] ${Math.round((hwa / totalN) * 100)}%`);
}

// 졸업 직업 분포 — 15년 양육 후 evaluateJobs로 제자별 최빈 직업·경지. 실행: run-headless.cjs jobsweep [reps]
//  · 두 정책: optimal(4명 전투 경지 push) / party(carry 전투 + 의원·연단·진법 서폿 → 비전투 직업도 나옴).
async function runJobSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const reps = Number(process.argv[3] ?? 15);
  const mode = process.argv[4] ?? 'optimal'; // optimal | party
  const ds = () => useDiscipleStore.getState();
  // disciple명 → 직업명 → 횟수, 그리고 경지 분포.
  const jobBy: Record<string, Record<string, number>> = {};
  const realmBy: Record<string, Record<string, number>> = {};
  const noneBy: Record<string, number> = {};
  const agg: Record<string, number> = {};
  const ROLES = ['carry', 'medicine', 'alchemy', 'formation']; // party 모드 역할

  console.log(`=== 졸업 직업 분포 — 15년 양육 × ${reps}회 (정책: ${mode}) ===`);
  console.log('각 회차 끝에 제자별 evaluateJobs 최빈 직업. optimal=전원 전투 경지 / party=carry+의원·연단·진법 서폿.\n');

  for (let r = 0; r < reps; r += 1) {
    seedNewRun(SEED_POOL);
    useGameStore.getState().setPhase('playing');
    setByeokgokdanBudget(Infinity);
    setElixirBudget(1);
    const roster = ds().order.slice(0, 4);
    const roleMap: Record<string, string> = {};
    roster.forEach((id, i) => { roleMap[id] = ROLES[i] ?? 'combat'; });
    for (let d = 0; d < 15 * 336; d += 1) {
      if (useGameStore.getState().phase === 'ended') break;
      if (mode === 'party') configurePartyDay(roleMap);
      else configureOptimal();
      optimalDispatch(0.05, 13); // 약간의 의뢰 — 명성·외공 보강(직업 적합도에 명성 15%)
      advanceTurn();
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      for (const item of [...useInboxStore.getState().items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (dom === 'seclusion_petition' && isRespondable(item)) await resolveInboxItem(item, 'allow');
      }
      useInboxStore.getState().reset();
    }
    for (const id of roster) {
      const disc = ds().disciples[id];
      if (!disc) continue;
      const nm = disc.name;
      if (r === 0) {
        const mainSchool = findMartialArt(disc.mainMartialArtId ?? '')?.school ?? '?';
        const artStr = disc.martialArts.map((a) => `${findMartialArt(a.artId)?.school ?? '?'}:${a.seong}`).join(',');
        console.log(`  [진단 ${nm}] ${REALM_LABEL[disc.realm]} · 주력갈래 ${mainSchool} · 무공[${artStr}] · 호위${disc.stats?.guarding?.level ?? 0}·정탐${disc.stats?.scouting?.level ?? 0}·의술${disc.stats?.medicine?.level ?? 0}·명성${disc.fame ?? 0}`);
      }
      (realmBy[nm] ??= {})[REALM_LABEL[disc.realm]] = ((realmBy[nm] ??= {})[REALM_LABEL[disc.realm]] ?? 0) + 1;
      const jobs = evaluateJobs(disc);
      if (jobs.length === 0) { noneBy[nm] = (noneBy[nm] ?? 0) + 1; continue; }
      const top = jobs[0].job.name;
      (jobBy[nm] ??= {})[top] = ((jobBy[nm] ??= {})[top] ?? 0) + 1;
      agg[top] = (agg[top] ?? 0) + 1;
    }
  }

  const fmt = (m: Record<string, number>, denom: number) =>
    Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round((v / denom) * 100)}%`).join(' · ');
  console.log('[제자별 — 종착 경지 | 최빈 직업]');
  for (const id of ds().order.slice(0, 4)) {
    const nm = ds().disciples[id]?.name ?? id;
    const realm = realmBy[nm] ? fmt(realmBy[nm], reps) : '-';
    const job = jobBy[nm] ? fmt(jobBy[nm], reps) : '-';
    const none = noneBy[nm] ? ` · 자격미달 ${Math.round((noneBy[nm] / reps) * 100)}%` : '';
    console.log(`  ${nm.padEnd(6)} | 경지: ${realm}\n           직업: ${job}${none}`);
  }
  console.log(`\n[전체 직업 분포] ${fmt(agg, reps * 4)}`);
  console.log('⚠️ optimal은 전투 경지 위주라 비전투 직업(의원·책사)은 적게 — 폭넓은 분포는 party 모드.');
}

// 의뢰 종합 시뮬 — ① 경지×난이도 ② 파티 1~4 ③ 상태이상 ④ 결과 분포. 실행: run-headless.cjs questsim [reps]
async function runQuestSim(): Promise<void> {
  setAutoSaveEnabled(false);
  const reps = Number(process.argv[3] ?? 80);
  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  setFoodCost(0);
  setPatronageMult(0);
  setGeumchangBudget(Infinity); // 구급영약 무한 — 생존 체인 1단 항상 열림(사망=영약으로도 못 막은 경우)
  const ds = () => useDiscipleStore.getState();
  const roster = ds().order.slice(0, 4);

  // 한 의뢰 1회 실행 — 파티 멤버별 프리셋 적용(applyEach), 결과·사상 반환. (questmatrix 런루프 재사용)
  async function once(
    q: Quest,
    party: string[],
    applyEach: (id: string, idx: number, inParty: boolean) => void,
  ): Promise<{ outcome: string; dead: number; fatal: number }> {
    for (let m = 0; m < roster.length; m += 1) {
      const id = roster[m];
      const inParty = m < party.length;
      applyEach(id, m, inParty);
      if (!inParty) ds().update(id, { status: 'resting' });
    }
    const year = useTimeStore.getState().current.year;
    for (const id of roster) ds().update(id, { age: 16, entryYear: year });
    useMasterStore.getState().update({ yearsAsMaster: 0, age: 40 });
    useReputationStore.getState().reset();
    useGameStore.getState().setPhase('playing');
    useQuestStore.setState({ board: [q], active: [] });
    const carry = party[0];
    if (!dispatchQuest(q.id, party)) return { outcome: 'gate', dead: 0, fatal: 0 };
    let days = 0;
    let outcome = '';
    while (ds().disciples[carry]?.status === 'questing' && days < q.weeks * 7 + 14) {
      advanceTurn();
      days += 1;
      for (const mi of usePendingStore.getState().milestones) {
        if (mi.kind !== 'quest') continue;
        for (const [t, o] of OUTCOME_BY_TITLE) if (mi.title === t) outcome = o;
      }
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      for (const item of [...useInboxStore.getState().items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        if (isRespondable(item) && dom !== 'seclusion_petition') {
          const key = responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
          if (key) await resolveInboxItem(item, key);
        }
      }
    }
    let dead = 0;
    let fatal = 0;
    for (const id of party) {
      const d = ds().disciples[id];
      if (d?.status === 'departed') dead += 1;
      else if (d?.wounds?.some((w) => w.severity === 1)) fatal += 1;
    }
    return { outcome, dead, fatal };
  }

  async function tally(
    q: Quest,
    party: string[],
    applyEach: (id: string, idx: number, inParty: boolean) => void,
  ): Promise<{ succ: number; full: number; partial: number; crisis: number; fail: number; disaster: number; dead: number; fatal: number }> {
    const c = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0, gate: 0 } as Record<string, number>;
    let dead = 0;
    let fatal = 0;
    for (let i = 0; i < reps; i += 1) {
      const r = await once(q, party, applyEach);
      if (r.outcome) c[r.outcome] = (c[r.outcome] ?? 0) + 1;
      dead += r.dead;
      fatal += r.fatal;
    }
    const pct = (n: number) => (n / reps) * 100;
    return {
      succ: pct(c.full + c.partial + c.crisis),
      full: pct(c.full), partial: pct(c.partial), crisis: pct(c.crisis), fail: pct(c.fail), disaster: pct(c.disaster),
      dead: pct(dead), fatal: pct(fatal),
    };
  }

  // 등급별 대표 결투(duel) 의뢰 — 경지×난이도는 전투 도메인으로(엔진 결산, 난이도 또렷).
  const GRADES: { g: string; label: string }[] = [
    { g: 'minor', label: '소무(쉬움)' }, { g: 'normal', label: '보통' },
    { g: 'dangerous', label: '위험' }, { g: 'extreme', label: '극험(어려움)' },
  ];
  const duelByGrade: Record<string, Quest> = {};
  for (const q of QUEST_POOL) if (q.domain === 'duel' && !duelByGrade[q.grade]) duelByGrade[q.grade] = q;
  const REALMS_P: PresetKey[] = ['samryu3', 'iryu4', 'ilryu6', 'jeol7', 'cho8', 'hwa10'];

  console.log(`=== 의뢰 종합 시뮬 (실코드 결산, 행당 ${reps}회) — 결투 도메인 ===\n`);

  // [1] 경지 × 난이도 — 솔로, 성공률%(완+성+위) / 괄호=재난% (사망 위험 신호)
  console.log('[1] 경지 × 난이도 — 솔로 성공률%(재난%)');
  console.log('         ' + GRADES.map((x) => x.label.padStart(12)).join(''));
  for (const pk of REALMS_P) {
    const cells: string[] = [];
    for (const { g } of GRADES) {
      const q = duelByGrade[g];
      if (!q) { cells.push('—'.padStart(12)); continue; }
      const r = await tally(q, [roster[0]], (id, _m, inP) => { if (inP) applyPreset(id, PRESETS[pk]); });
      cells.push(`${r.succ.toFixed(0)}%(${r.disaster.toFixed(0)})`.padStart(12));
    }
    console.log(`  ${PRESETS[pk].label.padEnd(7)}` + cells.join(''));
  }

  // [2] 파티 1~4명 — 역량 합산 도메인(호위)에서 규모 효과. 결투(duel)는 대표 1인 싸움이라 규모 무의미 →
  //     역량이 파티로 합산되는 호위 의뢰로 측정. (참고: 결투 의뢰는 1~4명 차이 거의 없음 — 대표만 싸움.)
  console.log('\n[2] 파티 1~4명 — 일류(호위40), 위험 호위 의뢰 (완/성/위/실/재 % · 사망% · 치명생환%)');
  {
    const guardQ = QUEST_POOL.find((x) => x.domain === 'guard' && x.grade === 'dangerous')
      ?? QUEST_POOL.find((x) => x.domain === 'scout' && x.grade === 'dangerous')
      ?? duelByGrade['dangerous'];
    for (const size of [1, 2, 3, 4]) {
      const party = roster.slice(0, size);
      const r = await tally(guardQ, party, (id, _m, inP) => { if (inP) applyPreset(id, PRESETS.ilryu6, { stat: 'guarding', level: 40 }); });
      console.log(`  ${size}명: 완${r.full.toFixed(0)} 성${r.partial.toFixed(0)} 위${r.crisis.toFixed(0)} 실${r.fail.toFixed(0)} 재${r.disaster.toFixed(0)} · 사망${r.dead.toFixed(0)}% · 치명생환${r.fatal.toFixed(0)}%`);
    }
  }

  // [3] 상태이상 — 일류 솔로, *극험* 결투(타이트한 매치업이라 부상 페널티가 드러남). 만전 vs 부상 출전.
  console.log('\n[3] 상태이상 안고 출전 — 일류6성 솔로, 극험 결투 (성공%·재난%·사망%)');
  {
    const q = duelByGrade['extreme'];
    const conds: { label: string; sev?: number; type?: string }[] = [
      { label: '만전' }, { label: '경상(sev4)', sev: 4, type: 'wound' },
      { label: '중상(sev2)', sev: 2, type: 'wound' }, { label: '중상·중독(sev2)', sev: 2, type: 'poison' },
    ];
    for (const c of conds) {
      const r = await tally(q, [roster[0]], (id, _m, inP) => {
        if (!inP) return;
        applyPreset(id, PRESETS.ilryu6);
        if (c.sev) ds().update(id, { wounds: [{ type: c.type as never, severity: c.sev, daysRemaining: 20 }] });
      });
      console.log(`  ${c.label.padEnd(16)} 성공 ${r.succ.toFixed(0)}% · 재난 ${r.disaster.toFixed(0)}% · 사망 ${r.dead.toFixed(0)}%`);
    }
  }

  console.log('\n끝. [1] 경지가 난이도를 어디까지 감당 · [2] 파티 규모 효과 · [3] 부상 출전 페널티.');
}

// ── 극험 게이트 진단 — 절품 없이(master 천장) 닿는 combatRating 천장 측정. 실행: run-headless.cjs extremegate
async function runExtremeGate(): Promise<void> {
  setAutoSaveEnabled(false);
  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  const ds = () => useDiscipleStore.getState();
  const id = ds().order[0];
  const { combatRating } = await import('@/systems/combatPower');
  console.log('=== 극험 게이트 진단 — capability(=combatRating) vs minStat ===');
  console.log('master(상품) 천장 = 초절정·8성. grandmaster(절품) = 화경·10성.\n');
  // 1) 프리셋 사다리 combatRating (questmatrix 와 동일 프리셋).
  for (const pk of ['ilryu6', 'jeol7', 'cho8', 'hwa10'] as const) {
    applyPreset(id, PRESETS[pk]);
    const mainArt = findMartialArt(PRESETS[pk].arts[0].artId);
    console.log(`  ${PRESETS[pk].label.padEnd(8)} (${mainArt?.grade}) → combatRating ${combatRating(ds().disciples[id]!)}`);
  }
  // 2) master 천장 — maehwa-sword(master) 를 경지·성 상한까지: 절정7성·초절정8성.
  console.log('\n  [절품 없이 도달 가능한 천장 — maehwa-sword(master)]');
  for (const [realm, seong, label] of [['jeoljeong', 7, '절정7성'], ['chojeoljeong', 8, '초절정8성']] as const) {
    ds().update(id, {
      realm: realm as never,
      realmProgress: { internal: 1050, pity: 0, petitioned: false },
      martialArts: [inst('maehwa-sword', seong), inst('chosangbi', 6), inst('tonap-beop', 6), inst('geumjong-jo', 5)],
      mainMartialArtId: 'maehwa-sword',
      stats: { strength: { level: 56, exp: 0 }, agility: { level: 50, exp: 0 }, endurance: { level: 54, exp: 0 } } as never,
      status: 'training',
    });
    console.log(`  master ${label.padEnd(10)} → combatRating ${combatRating(ds().disciples[id]!)}`);
  }
  console.log('\n  [현 게이트] GRADE_REWARD.extreme.minStat=72(세계사건) · 정적 극험 minStat=65~70(QUEST_POOL)');
}

async function runQuestMatrix(): Promise<void> {
  setAutoSaveEnabled(false);
  const reps = Number(process.argv[3] ?? 100);
  console.log(`=== 의뢰 정밀 매트릭스 — 전 의뢰 × 경지 사다리 × 조합, 행당 ${reps}회 실측 (실코드 결산) ===`);
  console.log('경지: 미달/적정/우월 — 전투(결투·큰의뢰)=프리셋 사다리, 스탯 도메인=minStat−15/+10/+30 + 등급 몸.');
  console.log('조합: 솔로 / 추천(추천 인원만큼 동급 동행) / 의원(추천 인원 + 의술 35 의원 1).');
  console.log('표기: 완/성/위/실/재 % · 사망 % · 치명생환 % · 평균 자금Δ(동) · 드랍 % · 일수\n');

  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  setFoodCost(0); // 자금 델타에서 일상 경제 소음 제거 — 의뢰 보상만 잰다.
  setPatronageMult(0);
  setGeumchangBudget(Infinity); // 구급영약 무한 — 생존 체인 1단이 항상 열림
  const ds = () => useDiscipleStore.getState();
  const roster = ds().order.slice(0, 4);

  // 스탯 도메인의 "몸" — 등급에 맞는 경지·근골(사망 굴림·재난 내성은 몸에 달렸으므로 등급 비례).
  const BODY_BY_GRADE: Record<string, PresetKey> = {
    minor: 'iryu4',
    normal: 'iryu4',
    dangerous: 'ilryu6',
    extreme: 'jeol7',
  };

  const quests = QUEST_POOL.filter((q) => q.grade !== 'menial');
  for (const q of quests) {
    const isCombat = q.domain === 'duel' || q.domain === 'grand';
    // 도메인 → 역량 스탯(QUEST_DOMAIN_STAT 와 동일): 의술→medicine, 정탐·살수→scouting, 호위→guarding.
    const stat = !isCombat
      ? q.domain === 'medicine'
        ? 'medicine'
        : q.domain === 'scout' || q.domain === 'assassin'
          ? 'scouting'
          : 'guarding'
      : null;
    // 조합 — 솔로 / 추천 인원 충족 / 의원 동행. 추천 1인 의뢰는 솔로=추천이라 [솔로, 의원 2인]만.
    const comps: { label: string; size: number; medic: boolean }[] =
      q.recommended <= 1
        ? [
            { label: '솔로', size: 1, medic: false },
            { label: '의원2인', size: 2, medic: true },
          ]
        : [
            { label: '솔로', size: 1, medic: false },
            { label: `추천${q.recommended}인`, size: q.recommended, medic: false },
            { label: `의원${q.recommended}인`, size: q.recommended, medic: true },
          ];

    for (const tier of [0, 1, 2]) {
      const presetKey = isCombat ? COMBAT_TIERS[q.grade][tier] : BODY_BY_GRADE[q.grade];
      const statLevel = stat ? Math.max(1, q.minStat + [-15, 10, 30][tier]) : 0;

      for (const comp of comps) {
        const party = roster.slice(0, Math.min(comp.size, roster.length));
        const carry = party[0];
        const out: Record<string, number> = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0, gate: 0 };
        let dead = 0;
        let fatalSurvived = 0;
        let moneySum = 0;
        let dropCount = 0;
        let daySum = 0;
        for (let i = 0; i < reps; i += 1) {
          // 파티 전원 동급 프리셋. 의원 조합이면 마지막 1인은 의술 35(완화 임계 30 충족).
          for (let m = 0; m < roster.length; m += 1) {
            const id = roster[m];
            const inParty = m < party.length;
            const isMedic = comp.medic && inParty && m === party.length - 1;
            applyPreset(
              id,
              PRESETS[presetKey],
              isMedic ? { stat: 'medicine', level: 35 } : stat && inParty ? { stat, level: statLevel } : undefined,
            );
            if (!inParty) ds().update(id, { status: 'resting' });
          }
          // 격리 — 나이·사부 수명·페이즈·파견 큐·평판. (누적 게임년이 졸업·사부 수명 종결을 부르면
          // advanceTurn 조기 반환으로 모든 의뢰가 동결되고, 평판이 행 사이에 누적되면 앞 행이 쌓은
          // 적대의 자객 비용이 뒤 행 자금 델타로 번진다 — questmatrix 디버깅에서 확인.)
          {
            const year = useTimeStore.getState().current.year;
            for (const id of roster) ds().update(id, { age: 16, entryYear: year });
            useMasterStore.getState().update({ yearsAsMaster: 0, age: 40 });
            useReputationStore.getState().reset();
          }
          useGameStore.getState().setPhase('playing');
          useQuestStore.setState({ board: [q], active: [] });
          const money0 = useSectStore.getState().sect?.resources ?? 0;
          const scrolls0 = useCodexStore.getState().scrolls.length;
          if (!dispatchQuest(q.id, party)) {
            out.gate += 1;
            continue;
          }
          let days = 0;
          let outcome = '';
          while (ds().disciples[carry]?.status === 'questing' && days < q.weeks * 7 + 14) {
            advanceTurn();
            days += 1;
            // 결과 판독 — 결산 마일스톤은 정산 큐(pendingStore.milestones)에 실린다.
            for (const m of usePendingStore.getState().milestones) {
              if (m.kind !== 'quest') continue;
              for (const [title, o] of OUTCOME_BY_TITLE) {
                if (m.title === title) {
                  outcome = o;
                  break;
                }
              }
            }
            const s = useScheduleStore.getState();
            if (s.pendingReport) s.resolveMonthlyReport();
            if (s.pendingSetup) s.resolveMonthlySetup();
            if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
            for (const item of [...useInboxStore.getState().items]) {
              const dom = (item.payload as { domain?: string } | undefined)?.domain;
              if (isRespondable(item) && dom !== 'seclusion_petition') {
                const key = responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
                if (key) await resolveInboxItem(item, key);
              }
            }
          }
          daySum += days;
          if (outcome) out[outcome] += 1;
          // 사상 집계 — 파티 전원 기준(재난 희생자는 무작위 1인이라 솔로/다인 비교에 중요).
          for (const id of party) {
            const d = ds().disciples[id];
            if (d?.status === 'departed') dead += 1;
            else if (d?.wounds?.some((w) => w.severity === 1)) fatalSurvived += 1;
          }
          moneySum += (useSectStore.getState().sect?.resources ?? 0) - money0;
          if (useCodexStore.getState().scrolls.length > scrolls0) dropCount += 1;
          useInboxStore.getState().reset();
          // 사망했어도 다음 rep을 위해 프리셋 재적용이 부활시킨다.
        }
        const pct = (n: number) => `${Math.round((n / reps) * 100)}`;
        const tierLabel = isCombat
          ? `${TIER_LABEL[tier]}(${PRESETS[presetKey].label})`
          : `${TIER_LABEL[tier]}(${stat} ${statLevel})`;
        console.log(
          `[${QUEST_GRADE_ORDER.indexOf(q.grade)}·${q.grade}] ${q.title.padEnd(14)} ${q.domain.padEnd(8)} ${tierLabel.padEnd(16)} ${comp.label.padEnd(7)} ` +
            `완${pct(out.full)} 성${pct(out.partial)} 위${pct(out.crisis)} 실${pct(out.fail)} 재${pct(out.disaster)}${out.gate ? ` 게이트${pct(out.gate)}` : ''} | ` +
            `사망${pct(dead)} 치명생환${pct(fatalSurvived)} | 자금Δ${Math.round(moneySum / reps)} | 드랍${pct(dropCount)} | ${Math.round(daySum / Math.max(1, reps))}일`,
        );
      }
    }
  }
}


// ── 전업 살수 사문 — 회색 의뢰만 N년 연속(누적이 본론: 평판 궤적·자객 비용·사파 후원 루프) ──
async function runCovertSweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const iters = Number(process.argv[4] ?? 4);
  console.log(`=== 전업 살수 사문 — 회색 의뢰만 ${years}년 × ${iters}회 (자리 잡은 사문 가정: 명성 30 시드) ===`);
  console.log('카리=살수형(일류6성 몸 + 정탐 55), 추천 2인↑이면 의원 동행. 무흔 완수=평판 무사 룰 검증.');
  console.log('추적: 자금 · 정파/사파 평판 · 자객 시비(비용) · 사파 후원 의뢰 · 결과 분포 · 카리 자비.\n');

  const ds = () => useDiscipleStore.getState();
  let sumMoney = 0;
  const totalOut: Record<string, number> = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0 };
  let sumAssassinCost = 0;
  let sumAssassinCount = 0;
  let sumSponsored = 0;
  let sumQuests = 0;

  for (let it = 0; it < iters; it += 1) {
    seedNewRun(SEED_POOL);
    useGameStore.getState().setPhase('playing');
    setFoodCost(20); // 기본 경제 복원(같은 프로세스의 다른 sweep 오버라이드 잔류 방지)
    setPatronageMult(1);
    setGeumchangBudget(Infinity);
    const sect = useSectStore.getState();
    if (sect.sect) sect.setSect({ ...sect.sect, reputation: 30 }); // 보통 게시판 해금 상태에서 전향
    const roster = ds().order.slice(0, 4);
    const carry = roster[0];
    const medic = roster[1];
    applyPreset(carry, PRESETS.ilryu6, { stat: 'scouting', level: 55 });
    applyPreset(medic, PRESETS.iryu4, { stat: 'medicine', level: 35 });
    for (const id of roster.slice(2)) ds().update(id, { status: 'resting' });

    const out: Record<string, number> = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0 };
    let assassinCost = 0;
    let assassinCount = 0;
    let sponsored = 0;
    let quests = 0;

    for (let d = 0; d < years * 336; d += 1) {
      // 핀 — 졸업·사부 수명 종결 방지(전업 루프 관찰이 목적).
      if (d % 336 === 0) {
        const year = useTimeStore.getState().current.year;
        for (const id of roster) ds().update(id, { age: 16, entryYear: year });
        useMasterStore.getState().update({ yearsAsMaster: 0, age: 40 });
      }
      // 의뢰가 없는 날은 최적 훈련(경지 성장 — 살수 전업도 수련은 한다).
      configureOptimal();
      // 파견 — 게시판의 회색 의뢰만, 가장 높은 등급부터. 추천 2인↑이면 의원을 붙인다.
      const me = ds().disciples[carry];
      if (me?.status === 'training') {
        const grays = useQuestStore
          .getState()
          .board.filter((q) => q.gray && canDispatch(me, q))
          .sort((a, b) => QUEST_GRADE_ORDER.indexOf(b.grade) - QUEST_GRADE_ORDER.indexOf(a.grade));
        const target = grays[0];
        if (target) {
          const party =
            target.recommended > 1 && ds().disciples[medic]?.status === 'training' ? [carry, medic] : [carry];
          if (dispatchQuest(target.id, party)) {
            quests += 1;
            if (target.id.startsWith('spon-')) sponsored += 1;
          }
        }
      }
      advanceTurn();
      for (const m of usePendingStore.getState().milestones) {
        if (m.kind !== 'quest') continue;
        for (const [title, o] of OUTCOME_BY_TITLE) if (m.title === title) out[o] += 1;
      }
      const s = useScheduleStore.getState();
      if (s.pendingReport) s.resolveMonthlyReport();
      if (s.pendingSetup) s.resolveMonthlySetup();
      if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
      for (const item of [...useInboxStore.getState().items]) {
        const dom = (item.payload as { domain?: string } | undefined)?.domain;
        // 자객 시비 — 적대 문파의 보복 비용 집계.
        if (item.title.endsWith('— 시비')) {
          assassinCount += 1;
          const mAmt = /금자 (\d+)냥/.exec(item.body ?? '');
          if (mAmt) assassinCost += Number(mAmt[1]);
        }
        if (isRespondable(item) && dom !== 'seclusion_petition') {
          const key = responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
          if (key) await resolveInboxItem(item, key);
        }
      }
      drainFieldEvents(); // 현장 급보 해소 — 안 풀면 의뢰가 결산 안 돼 카리 'questing' 영구 동결(화경 0% 회귀 원인).
      useInboxStore.getState().reset();
      healWithSalve(false);

      // 연 단위 타임라인 — 첫 회만 상세.
      if (it === 0 && (d + 1) % 336 === 0) {
        const yr = (d + 1) / 336;
        const rep = useReputationStore.getState().sect;
        let right = 0;
        let rightN = 0;
        let dark = 0;
        let darkN = 0;
        for (const f of FACTIONS) {
          const v = rep[f.id] ?? 0;
          if (f.alignment === 'right') {
            right += v;
            rightN += 1;
          } else if (f.alignment === 'sapa' || f.alignment === 'magyo') {
            dark += v;
            darkN += 1;
          }
        }
        const money = useSectStore.getState().sect?.resources ?? 0;
        const c = ds().disciples[carry];
        const mercy = c?.personality.mercy ?? 50;
        // 성장 추적 — 경지·주력 성·흑화·마공 비급(살수 의뢰 affinity 로 darkArts 드랍이 잘 옴).
        const mainId = c?.mainMartialArtId ?? c?.martialArts[0]?.artId;
        const mainSeong = c?.martialArts.find((a) => a.artId === mainId)?.seong ?? 0;
        const darkScrolls = useCodexStore
          .getState()
          .scrolls.filter((sc) => findMartialArt(sc.artId)?.school === 'darkArts').length;
        console.log(
          `  [${yr}년차] ${REALM_LABEL[c?.realm ?? 'samryu']}·${findMartialArt(mainId ?? '')?.name ?? '?'} ${mainSeong}성·흑화${c?.darknessLevel ?? 0}·자비${mercy} | 자금 ${coinStr(money)} · 정파 ${(right / Math.max(1, rightN)).toFixed(0)} · 사파 ${(dark / Math.max(1, darkN)).toFixed(0)} · 자객 ${assassinCount}회(${assassinCost}냥) · 후원 ${sponsored} · 의뢰 ${quests}회 · 마공비급 ${darkScrolls}권`,
        );
      }
    }
    sumMoney += useSectStore.getState().sect?.resources ?? 0;
    for (const k of Object.keys(out)) totalOut[k] += out[k];
    sumAssassinCost += assassinCost;
    sumAssassinCount += assassinCount;
    sumSponsored += sponsored;
    sumQuests += quests;
    // 카리 최종 성장 — 회차별 경지·흑화.
    {
      const c = ds().disciples[carry];
      const mainId = c?.mainMartialArtId ?? c?.martialArts[0]?.artId;
      const seong = c?.martialArts.find((a) => a.artId === mainId)?.seong ?? 0;
      console.log(
        `  [it${it} 종착] ${REALM_LABEL[c?.realm ?? 'samryu']} · 주력 ${findMartialArt(mainId ?? '')?.name ?? '?'} ${seong}성 · 흑화 ${c?.darknessLevel ?? 0} · 익힌 무공 ${c?.martialArts.length ?? 0}권`,
      );
    }
  }

  const n = Math.max(1, totalOut.full + totalOut.partial + totalOut.crisis + totalOut.fail + totalOut.disaster);
  console.log(
    `\n${iters}회 평균: 최종 자금 ${coinStr(Math.round(sumMoney / iters))} · 의뢰 ${Math.round(sumQuests / iters)}회 · ` +
      `완${Math.round((totalOut.full / n) * 100)}% 성${Math.round((totalOut.partial / n) * 100)}% 위${Math.round((totalOut.crisis / n) * 100)}% 실${Math.round((totalOut.fail / n) * 100)}% 재${Math.round((totalOut.disaster / n) * 100)}% · ` +
      `자객 ${(sumAssassinCount / iters).toFixed(1)}회(평균 ${Math.round(sumAssassinCost / iters)}냥) · 사파 후원 수행 ${(sumSponsored / iters).toFixed(1)}회`,
  );
}
// ─── 서버 권위 결정성 실증 (docs/31 Phase 1) ────────────────────────────────
// 정본 서버 엔진 API(serverEngine.newRun/advance)를 Vercel 함수처럼 Node에서 구동.
// "같은 상태 + 같은 시드상태 → 같은 결과"를 실증 — 서버가 시드를 쥐면 세이브 스커밍 봉쇄.
const SERVER_PARTY = ['yun-soso', 'i-cheongha', 'jin-sohwa', 'jang-cheol'];

// newRun 후 advance 를 days 회 체인(매 턴 전진된 rngState 를 다음 턴에 — 실제 서버 흐름).
function runChain(seed: number, days: number): TurnResult {
  let cur = serverNewRun(SERVER_PARTY, seed);
  for (let i = 0; i < days; i += 1) cur = serverAdvance(cur.state, cur.rngState);
  return cur;
}

async function serverTurnDemo(): Promise<void> {
  const J = (x: unknown) => JSON.stringify(x);
  let pass = 0, fail = 0;
  const ck = (label: string, cond: boolean, detail = '') => {
    if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
    else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
  };
  console.log('═══ 서버 권위 결정성 실증 (serverEngine API, Node 구동) ═══\n');

  // 1) newRun 결정성 + 이벤트·시드상태 반환.
  const r0a = serverNewRun(SERVER_PARTY, 12345);
  const r0b = serverNewRun(SERVER_PARTY, 12345);
  ck('newRun 같은 시드 → 동일 상태·시드상태', J(r0a.state) === J(r0b.state) && r0a.rngState === r0b.rngState);
  ck('TurnResult 이벤트 반환(pending/field/cutscene/moral)',
    ['pending', 'field', 'cutscene', 'moral'].every((k) => k in r0a.events));

  // 2) advance 체인 결정성 — 같은 시드에서 120턴 두 번 → 완전 동일.
  const DAYS = 120;
  const a = runChain(2024, DAYS);
  const b = runChain(2024, DAYS);
  ck('advance 체인 같은 시드 → 동일', J(a.state) === J(b.state) && a.rngState === b.rngState);
  ck('진행됨(newRun 직후와 다름)', J(a.state) !== J(serverNewRun(SERVER_PARTY, 2024).state));

  // 3) 시드 민감도 — 다른 시드 → 다른 회차.
  const c = runChain(7777, DAYS);
  ck('다른 시드 → 다른 결과', J(a.state) !== J(c.state));

  // 4) 서버 모델 — 임의 중간 상태 로드→advance 재시도 동일(세이브 스커밍 봉쇄 실증).
  const mid = runChain(333, 60);
  const s1 = serverAdvance(mid.state, mid.rngState);
  const s2 = serverAdvance(mid.state, mid.rngState); // 같은 상태+같은 시드상태 재시도
  ck('상태 로드→advance 재시도 → 동일', J(s1.state) === J(s2.state) && s1.rngState === s2.rngState);
  ck('한 턴 진행됨', J(s1.state) !== J(mid.state));
  const s3 = serverAdvance(mid.state, (mid.rngState ^ 0x1234) >>> 0); // 다른 시드상태
  ck('다른 시드상태 → 다른 결과', J(s1.state) !== J(s3.state));

  // 5) GameApi 인터페이스(로컬 어댑터) — 앱이 쓸 계약(advance→settle 2단계)이 Node에서 구동.
  const api = getGameApi();
  ck('getGameApi → 로컬 어댑터(비권위)', api.authoritative === false);
  const r1 = await api.newRun(SERVER_PARTY);
  ck('api.newRun 구동 + events', !!r1.state && ['pending', 'field', 'cutscene', 'moral'].every((k) => k in r1.events));
  const before = J(r1.state);
  let last = r1;
  for (let i = 0; i < 30; i += 1) {
    await api.advance(); // 하루 진행(정산 단계)
    last = await api.settle(); // 정산 후속(졸업·일일 이벤트)
  }
  ck('api.advance+settle 30회 → 상태 진행', J(last.state) !== before);

  // 6) 계정 격리 — 서버 warm 인스턴스 유저 누수 차단(docs/37 C10). account 전달 시 격리.
  const accA = { achievement: { unlocked: ['ach-jeoljeong'], unlockedArts: [] as string[] }, tally: { counts: {}, streaks: {}, maxStreaks: {} }, diamonds: 999 } as never;
  const accB = { achievement: { unlocked: [] as string[], unlockedArts: [] as string[] }, tally: { counts: {}, streaks: {}, maxStreaks: {} }, diamonds: 0 } as never;
  const baseA = serverNewRun(SERVER_PARTY, 1, accA);
  ck('계정 로드 — A 업적·다이아 적재', baseA.account.achievement.unlocked.includes('ach-jeoljeong') && baseA.account.diamonds === 999);
  const runB = serverAdvance(baseA.state, baseA.rngState, accB); // 유저 B(빈) 로드
  ck('계정 격리 — B 턴에 A 업적 안 샘', !runB.account.achievement.unlocked.includes('ach-jeoljeong'));
  ck('계정 격리 — B 턴에 A 다이아 안 샘', runB.account.diamonds === 0);
  serverNewRun(SERVER_PARTY, 1, accA); // A 다시 적재(싱글톤에 A 잔류 상태)
  const noIso = serverAdvance(baseA.state, baseA.rngState); // account 생략 → 직전 유저 잔류(격리 필요성)
  ck('account 미전달 시 직전(A) 잔류 → 격리 필요성 확인', noIso.account.achievement.unlocked.includes('ach-jeoljeong'));

  // 7) 세이브 라운드트립 — 실제로 플레이한 회차 상태를 DB처럼 JSON 직렬화→역직렬화→commit→capture.
  //    비-JSON 값(undefined/Date/Map/Set/함수/NaN)이 섞이면 라운드트립서 상태가 달라진다(영속 손상 검출).
  const real = runChain(2024, 120).state;
  const realJson = J(real);
  const roundTripped = JSON.parse(realJson); // DB 저장→로드 모사(undefined 키 소실 등 노출)
  ck('실 회차 상태 JSON 라운드트립 항등(직렬화 안전)', J(roundTripped) === realJson);
  commitGameState(roundTripped as never);
  ck('역직렬화 상태 commit→capture 항등', J(captureGameState()) === realJson);

  // 8) 인터리브 격리 — 두 유저 턴을 번갈아 진행해도 각자 단독 진행과 동일(엔진이 매 호출 전상태 재적재).
  const ua0 = serverNewRun(SERVER_PARTY, 30001);
  const ub0 = serverNewRun(SERVER_PARTY, 40002);
  let ua = ua0; for (let i = 0; i < 3; i += 1) ua = serverAdvance(ua.state, ua.rngState); const uaSolo = J(ua.state);
  let ub = ub0; for (let i = 0; i < 3; i += 1) ub = serverAdvance(ub.state, ub.rngState); const ubSolo = J(ub.state);
  let uai = ua0, ubi = ub0;
  for (let i = 0; i < 3; i += 1) { uai = serverAdvance(uai.state, uai.rngState); ubi = serverAdvance(ubi.state, ubi.rngState); }
  ck('인터리브 A == 단독 A(요청 간 무오염)', J(uai.state) === uaSolo);
  ck('인터리브 B == 단독 B(요청 간 무오염)', J(ubi.state) === ubSolo);

  // 9) 전방호환 × 격리 — 옛 세이브(스토어 키 누락)를 직전 유저 데이터가 남은 웜 인스턴스서 진행 시,
  //    누락 스토어가 **직전 유저 값으로 새면 안 된다**(기본값이어야). commit 의 누락-스킵이 서버선 잔류=누수.
  // 핵심 격리 속성: advance(Y) 결과는 **직전에 싱글톤에 뭐가 있었든 무관**해야 한다.
  // 서로 다른 직전 유저(P/Q) 뒤 같은 Y(분위기 키 누락)를 진행 → 분위기 결과가 같아야 누수 없음.
  const yFull = JSON.parse(J(serverNewRun(SERVER_PARTY, 60004).state)) as Record<string, unknown>;
  delete yFull.sectAtmosphere; // 옛 세이브: 나중 추가된 스토어 키 없음
  const atmosOf = (r: TurnResult) => J((r.state as { sectAtmosphere?: unknown }).sectAtmosphere);
  serverNewRun(SERVER_PARTY, 50003);
  useSectAtmosphereStore.getState().set({ righteousness: 90, unity: 90 }); // 직전 유저 P 분위기
  const afterP = serverAdvance(yFull as never, 0);
  serverNewRun(SERVER_PARTY, 50003);
  useSectAtmosphereStore.getState().set({ righteousness: -90, unity: -90 }); // 직전 유저 Q 분위기(다름)
  const afterQ = serverAdvance(yFull as never, 0);
  ck('전방호환×격리 — 누락 스토어가 직전 유저와 무관(P턴==Q턴)', atmosOf(afterP) === atmosOf(afterQ), `P=${atmosOf(afterP)} Q=${atmosOf(afterQ)}`);

  console.log(`\n  → 같은 (상태, 시드상태) 는 항상 같은 결과. 서버가 시드상태를 비공개로 쥐면`);
  console.log(`    클라가 결과를 재시도(세이브 스커밍)해도 동일 → 봉쇄. 엔진이 RN 없이 Node 구동됨도 확인.`);
  console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
  if (fail > 0) process.exit(1);
}

// ─── 장기 완주(lifetime) ───────────────────────────────────────────────────
// 한 회차를 종결(전원 졸업 → phase='ended', 혹은 사부 수명 99년 캡)까지 인메모리로 완주시키며
// 매 턴 불변식을 검사한다(누적·오버플로우·직렬화 안전이 장기에서 무너지지 않는지). DB 불필요.
async function lifetimeDemo(): Promise<void> {
  let pass = 0, fail = 0;
  const ck = (label: string, cond: boolean, detail = '') => {
    if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
    else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
  };
  console.log('═══ 장기 완주 무결성 (newRun → ended, 인메모리) ═══\n');

  const CAP = 99 * 12 * 4 * 7 + 30; // 사부 수명 99년치 일수 + 여유. 보통 전원 졸업으로 훨씬 일찍 종결.
  let cur = serverNewRun(SERVER_PARTY, 77777);
  let days = 0, ended = false;
  let maxInbox = 0, maxInfo = 0, maxAction = 0, maxHistory = 0;
  const issues: string[] = []; // 매 턴 무결성 위반 누적(NaN·음수·성 범위·나이·직렬화)

  const scan = () => {
    const disc = Object.values(useDiscipleStore.getState().disciples);
    for (const d of disc) {
      const age = currentAge(d);
      if (!Number.isFinite(age) || age < 0 || age > 200) issues.push(`나이 ${d.id}=${age}`);
      if (!Number.isFinite(d.stamina) || d.stamina < 0) issues.push(`체력 ${d.id}=${d.stamina}`);
      if (!Number.isFinite(d.stress) || d.stress < 0) issues.push(`스트레스 ${d.id}=${d.stress}`);
      if (!Number.isFinite(d.realmProgress?.internal ?? 0)) issues.push(`내공 ${d.id}`);
      for (const a of d.martialArts) {
        if (!Number.isFinite(a.seong) || a.seong < 1 || a.seong > 10) issues.push(`성범위 ${d.id}:${a.artId}=${a.seong}`);
        if (!Number.isFinite(a.exp) || a.exp < 0) issues.push(`exp ${d.id}:${a.artId}=${a.exp}`);
      }
    }
    const res = useSectStore.getState().sect?.resources ?? 0;
    if (!Number.isFinite(res)) issues.push(`자금 NaN`);
    const items = useInboxStore.getState().items;
    const actionN = items.filter((it) => !it.resolved && DECISION_KINDS.includes(it.kind)).length;
    const infoN = items.length - actionN;
    const histN = useEventHistoryStore.getState().records.length;
    maxInbox = Math.max(maxInbox, items.length);
    maxInfo = Math.max(maxInfo, infoN);
    maxAction = Math.max(maxAction, actionN);
    maxHistory = Math.max(maxHistory, histN);
  };

  while (days < CAP) {
    cur = serverAdvance(cur.state, cur.rngState);
    days += 1;
    scan();
    if (useGameStore.getState().phase === 'ended') { ended = true; break; }
    if (issues.length > 30) break; // 폭주 방지 — 위반 누적 시 조기 중단
    // 진행 게이트 모델 — 실플레이는 결정형 서신을 다 처리해야 하루를 넘긴다(무시 불가, docs/12).
    // 다음 턴 입력 상태에서 결정형을 처리됨으로 표시("매 턴 비우는 플레이어"). 결정형 누적이 차단되는지 검증.
    const inbox = (cur.state.inbox as { items?: { resolved: boolean; read: boolean; kind: string }[] } | undefined)?.items;
    if (inbox) for (const it of inbox) if (!it.resolved && DECISION_KINDS.includes(it.kind as never)) { it.resolved = true; it.read = true; }
  }

  const years = (days / (12 * 4 * 7)).toFixed(1);
  const master = useMasterStore.getState().master;
  const disc = Object.values(useDiscipleStore.getState().disciples);
  const graduated = disc.filter((d) => d.status === 'graduated');
  const departed = disc.filter((d) => d.status === 'departed');
  const careerRecords = useGraduateStore.getState().records ?? []; // 진로 선택 해소 후에만 적재
  const active = disc.filter((d) => d.status === 'training' || d.status === 'resting' || d.status === 'meditating');

  ck('종결(phase=ended) 도달', ended, `${days}일 ≈ ${years}년`);
  ck('완주 중 무결성 위반 0건(NaN·음수·성범위·나이)', issues.length === 0, issues.slice(0, 6).join(' · '));
  ck('종결 시 활성 제자 0(전원 졸업/이탈)', active.length === 0, `졸업 ${graduated.length}·이탈 ${departed.length}·활성 ${active.length}`);
  ck('전원 졸업으로 종결(대량 이탈 아님)', graduated.length === disc.length && departed.length === 0, `졸업 ${graduated.length}/${disc.length}`);
  ck('사부 수명 정상(yearsAsMaster ≤ 99)', !!master && master.yearsAsMaster <= 99 && master.yearsAsMaster >= 0, `${master?.yearsAsMaster}년차`);
  // 정보성(풍문·보고·서신·알림)은 prune 으로 한도. 결정형은 진행 게이트(무시 불가)가 매 턴 비우게 강제 →
  // 둘 다 상한 내여야 한다(서버 권위: 매 턴 GameState 직렬화 비대 차단).
  ck('서신함 정보성 적체 한도 내(≤150)', maxInfo <= 150, `정보성 최대 ${maxInfo}건`);
  ck('미해결 결정형 적체 한도 내(≤60, 게이트가 매 턴 비움)', maxAction <= 60, `결정형 최대 ${maxAction}건`);
  ck('이벤트 히스토리 상한 내(≤200)', maxHistory <= 200, `최대 ${maxHistory}건`);
  // 종결 상태도 직렬화 안전(DB 저장 가능) — 라운드트립 항등.
  const endState = JSON.stringify(cur.state);
  let serialOk = false;
  try { commitGameState(JSON.parse(endState)); serialOk = JSON.stringify(captureGameState()) === endState; } catch { serialOk = false; }
  ck('종결 상태 JSON 라운드트립 항등(직렬화 안전)', serialOk);

  console.log(`\n[정보] ${years}년 완주 · 졸업 ${graduated.length}명(진로해소 ${careerRecords.length}) · 최대 서신함 ${maxInbox}(정보성 ${maxInfo}·결정형 ${maxAction}) · 최대 히스토리 ${maxHistory}`);
  console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
  if (fail > 0) process.exit(1);
}

// ── 회차 이월 곡선 — 비급(무공서)만 영구 누적, 나머지(연구·영약·금고·사부·제자) 회차 초기화 ──
// project_run_loop_carryover / docs/16: 비급 원본만 다음 사부에게 인계. seedNewRun 의 resetForNewRun 이
// 정확히 이 경계를 구현(시작5권+이월 스크롤 유지·연구 progress 0으로 낮춤·영약/제자/금고/사부 리셋).
// 측정: 1회차→100회차로 비급을 진짜로 이월하며 카리(yun-soso) 검 빌드의 초절정/화경 도달율·도달시점을
// 체크포인트 회차에서 기록. 한 체인은 순차(run N+1 의 시작 코덱스 = run N 종료 시점 비급집합).
//
// 이월 충실성: seedNewRun 직후 이월 비급은 'identified'(연구 progress 0)로 깎인다. 실게임에선 새 사부가
// 다시 풀어야(연구) 가르칠 수 있으나, 시뮬은 setResearchInstant(true)라 연구가 즉시 끝난다 — 따라서
// 이월 비급을 회차 시작에 grantScroll(=complete)로 올리는 건 "새 사부가 첫날 즉시 연구 완료"와 동치(충실).
// factorysweep 의 'all'(전권 641 complete)과 다른 점: 오직 그동안 의뢰로 실제 모은 집합만 올린다.
const CARRY_CHECKPOINTS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// factory 1회차 본문(15년) — 이월 비급집합을 받아 시작 코덱스로 올리고, 카리 검 빌드로 굴린 뒤
// 카리 최종경지 + 절정/초절정/화경 첫 도달일(day, 없으면 -1) + 회차 종료 시점 codex 비급 artId 집합을 반환.
async function runFactoryOnce(carriedIds: ReadonlySet<string>, days: number): Promise<{
  realm: string; reach: Record<string, number>; scrollIds: Set<string>; seong: number; ext: number; internal: number;
  // 측정2: 이 회차 *새로* 코드덱스에 든 비급 artId(시작5권·이월분 제외) + 이 회차 중복 드랍 횟수.
  newScrollIds: string[]; dupDrops: number;
}> {
  const RECIPE_IDS = ELIXIR_RECIPES.map((r) => r.id);
  const byReqDesc = [...ELIXIR_RECIPES].sort((a, b) => b.alchemyReq - a.alchemyReq);
  seedNewRun(['yun-soso', 'jin-sohwa', 'jang-cheol', 'baek-yeon']);
  useGameStore.getState().setPhase('playing');
  // 이월 비급만 complete 로(=새 사부 첫날 즉시 연구). 시작5권은 seedNewRun 이 이미 complete.
  for (const id of carriedIds) grantScroll(id);
  // 측정2 기준선 — 회차 시작 코드덱스(시작5권 ∪ 이월 비급). 이 이후 의뢰로 새로 든 권만 "새권".
  const baselineScrollIds = new Set(useCodexStore.getState().scrolls.map((x) => x.artId));
  // 이 회차 중복 드랍 횟수 — maybeDropScroll 이 보유 권을 다시 뽑으면 'scroll-dup-…' 서신만 추가하고
  // 코드덱스 미추가(questSystem). 매일 reset 전에 그 서신을 세어 누적한다.
  let dupDrops = 0;
  const seenDupIds = new Set<string>();
  setElixirBudget(0);
  setByeokgokdanBudget(Infinity);
  {
    const sect = useSectStore.getState();
    if (sect.sect) sect.setSect({ ...sect.sect, resources: 100_000 });
  }
  buildAlchemyLab();
  for (const id of RECIPE_IDS) learnRecipe(id);
  for (const m of ['herb-common', 'herb-fire', 'herb-poison', 'herb-cold', 'herb-rare', 'herb-divine']) addMaterial(m, 9_999_999);
  const carryId = 'yun-soso';
  const sparPartnerId = 'jang-cheol';
  const supportIds = useDiscipleStore.getState().order.filter((id) => id !== carryId && id !== sparPartnerId);
  const roleMap: Record<string, string> = { [carryId]: 'carry', [sparPartnerId]: 'carry' };
  for (const sid of supportIds) roleMap[sid] = 'alchemy';

  const reach: Record<string, number> = { jeoljeong: -1, chojeoljeong: -1, hwagyeong: -1 };
  const markReach = (d: number) => {
    const r = useDiscipleStore.getState().disciples[carryId]?.realm ?? 'samryu';
    const idx = realmIndex(r);
    if (reach.jeoljeong < 0 && idx >= realmIndex('jeoljeong')) reach.jeoljeong = d;
    if (reach.chojeoljeong < 0 && idx >= realmIndex('chojeoljeong')) reach.chojeoljeong = d;
    if (reach.hwagyeong < 0 && idx >= realmIndex('hwagyeong')) reach.hwagyeong = d;
  };

  for (let d = 0; d < days; d += 1) {
    configurePartyDay(roleMap);
    const upcoming = (useTimeStore.getState().current.day % 7) + 1;
    if (upcoming === 1 || upcoming === 5) {
      const sch = useScheduleStore.getState();
      sch.setDailyChoice(carryId, 'martial', daeryeonChoiceValue(sparPartnerId));
      sch.setDailyChoice(sparPartnerId, 'martial', daeryeonChoiceValue(carryId));
    }
    const dsNow = useDiscipleStore.getState();
    for (const sid of supportIds) {
      const sd = dsNow.disciples[sid];
      if (sd && sd.status === 'training') {
        const lv = sd.stats?.alchemy?.level ?? 0;
        const best = byReqDesc.find((r) => r.alchemyReq <= lv);
        if (best) startCraft(sid, best.id);
      }
    }
    partyDispatch(carryId, roleMap, 0.12, 13);
    rampQuest(carryId, 0.12);
    const carry = dsNow.disciples[carryId];
    if (carry && carry.status === 'training' && !carry.elixirAbsorb) {
      consumeInternalElixir(carryId, 'naegong-fire') || consumeInternalElixir(carryId, 'naegong-water');
    }
    advanceTurn();
    const s = useScheduleStore.getState();
    if (s.pendingReport) s.resolveMonthlyReport();
    if (s.pendingSetup) s.resolveMonthlySetup();
    if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
    const inbox = useInboxStore.getState();
    for (const item of [...inbox.items]) {
      const dom = (item.payload as { domain?: string } | undefined)?.domain;
      if (isRespondable(item)) {
        const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
        if (key) await resolveInboxItem(item, key);
      }
    }
    drainFieldEvents();
    // 측정2 — reset 전에 이 날 발생한 중복 드랍 서신을 집계(id = scroll-dup-<artId>-<day>, day별 고유).
    for (const item of useInboxStore.getState().items) {
      if (item.id.startsWith('scroll-dup-') && !seenDupIds.has(item.id)) {
        seenDupIds.add(item.id);
        dupDrops += 1;
      }
    }
    useInboxStore.getState().reset();
    healWithSalve(false);
    markReach(d);
  }
  const carry = useDiscipleStore.getState().disciples[carryId];
  const realm = carry?.realm ?? 'samryu';
  const mainId = carry?.mainMartialArtId ?? carry?.martialArts[0]?.artId;
  const seong = mainId ? (carry?.martialArts.find((a) => a.artId === mainId)?.seong ?? 0) : 0;
  const ext = carry?.stats?.strength?.level ?? 0;
  const internal = Math.round(carry?.realmProgress?.internal ?? 0);
  // 종료 시점 codex 비급 전체 — 다음 회차로 이월할 영구 집합(시작5권 포함이나 무해).
  const scrollIds = new Set(useCodexStore.getState().scrolls.map((x) => x.artId));
  // 새권 = 종료 코드덱스 − 회차 시작 기준선(시작5권 ∪ 이월). 의뢰 드랍으로 실제로 새로 든 권만.
  const newScrollIds = [...scrollIds].filter((id) => !baselineScrollIds.has(id));
  return { realm, reach, scrollIds, seong, ext, internal, newScrollIds, dupDrops };
}

// 회차 이월 곡선 측정 — chains(R)개의 독립 체인을 각각 1→runs(기본100)회차 순차 이월하며
// 체크포인트 회차에서 카리 경지·도달시점·이월 비급수를 집계. 체크포인트 통계는 R 체인 평균/비율.
async function runCarrySweep(): Promise<void> {
  setAutoSaveEnabled(false);
  const runs = Number(process.argv[3] ?? 100);
  const chains = Number(process.argv[4] ?? 1);
  const years = Number(process.argv[5] ?? 15);
  const days = years * 336;
  const checkpoints = CARRY_CHECKPOINTS.filter((c) => c <= runs);
  console.log(`=== 회차 이월 곡선 — 비급만 영구누적 · 카리 검빌드(factory) · ${years}년/회차 · ${runs}회차 · 체인 R=${chains} ===`);
  console.log(`측정: 체크포인트 회차[${checkpoints.join(',')}]에서 초절정/화경 도달율·평균도달시점(경과년) + 비급 포화회차. n=${chains}체인.\n`);

  // 체크포인트별 누적기: 화경/초절정+ 도달수, 도달시점 합(도달한 체인만), 비급수 합.
  type Acc = { cho: number; hwa: number; jeol: number; choDaySum: number; choDayN: number; hwaDaySum: number; hwaDayN: number; jeolDaySum: number; jeolDayN: number; scrollSum: number; seongSum: number; extSum: number; intSum: number };
  const mk = (): Acc => ({ cho: 0, hwa: 0, jeol: 0, choDaySum: 0, choDayN: 0, hwaDaySum: 0, hwaDayN: 0, jeolDaySum: 0, jeolDayN: 0, scrollSum: 0, seongSum: 0, extSum: 0, intSum: 0 });
  const acc: Record<number, Acc> = {};
  for (const c of checkpoints) acc[c] = mk();
  // 체인별 비급수 궤적 — 포화회차 탐지용(전 체인 공통 추세 보고).
  const scrollTraj: number[][] = [];
  // 측정2 — 회차별 새권수·중복수 누적(전 회차, 전 체인 평균용). chain0 은 실제 비급 이름 목록도 기록.
  const newCountByRun = new Array(runs + 1).fill(0); // [run] += 그 회차 새권수
  const dupCountByRun = new Array(runs + 1).fill(0); // [run] += 그 회차 중복드랍수
  const chain0NewNames: Record<number, string[]> = {}; // chain0 회차별 새 비급 이름
  const artName = (id: string) => MARTIAL_ARTS.find((a) => a.id === id)?.name ?? id;

  for (let chain = 0; chain < chains; chain += 1) {
    let carried = new Set<string>();
    const traj: number[] = [];
    for (let run = 1; run <= runs; run += 1) {
      const res = await runFactoryOnce(carried, days);
      traj.push(carried.size); // 이 회차 *시작* 시점 이월 비급수
      newCountByRun[run] += res.newScrollIds.length;
      dupCountByRun[run] += res.dupDrops;
      if (chain === 0) chain0NewNames[run] = res.newScrollIds.map(artName);
      if (acc[run]) {
        const a = acc[run];
        const idx = realmIndex(res.realm);
        if (idx >= realmIndex('jeoljeong')) a.jeol += 1;
        if (idx >= realmIndex('chojeoljeong')) a.cho += 1;
        if (idx >= realmIndex('hwagyeong')) a.hwa += 1;
        if (res.reach.jeoljeong >= 0) { a.jeolDaySum += res.reach.jeoljeong; a.jeolDayN += 1; }
        if (res.reach.chojeoljeong >= 0) { a.choDaySum += res.reach.chojeoljeong; a.choDayN += 1; }
        if (res.reach.hwagyeong >= 0) { a.hwaDaySum += res.reach.hwagyeong; a.hwaDayN += 1; }
        a.scrollSum += carried.size;
        a.seongSum += res.seong; a.extSum += res.ext; a.intSum += res.internal;
      }
      // 이월 — 비급집합 합집합(영구 누적). 종료 codex 의 전 비급을 다음 회차로.
      carried = new Set([...carried, ...res.scrollIds]);
    }
    scrollTraj.push(traj);
    process.stderr.write(`  체인 ${chain + 1}/${chains} 완료 (최종 이월 비급 ${carried.size}권)\n`);
  }

  const fmtPct = (n: number) => `${Math.round((n / chains) * 100)}%`;
  const fmtYr = (sum: number, n: number) => (n === 0 ? '미도달' : `${(sum / n / 336).toFixed(1)}년차(${(10 + sum / n / 336).toFixed(1)}세)`);
  console.log('회차 | 초절정달성 | 화경달성 | 절정달성 | 초절정도달시점 | 화경도달시점 | 평균이월비급 | 카리 주력성/외공/내공');
  for (const c of checkpoints) {
    const a = acc[c];
    console.log(
      `${String(c).padStart(4)} | ${fmtPct(a.cho).padStart(6)} | ${fmtPct(a.hwa).padStart(6)} | ${fmtPct(a.jeol).padStart(6)} | ` +
      `${fmtYr(a.choDaySum, a.choDayN).padStart(14)} | ${fmtYr(a.hwaDaySum, a.hwaDayN).padStart(14)} | ` +
      `${(a.scrollSum / chains).toFixed(0).padStart(4)}권 | ${(a.seongSum / chains).toFixed(1)}성/${(a.extSum / chains).toFixed(0)}/${(a.intSum / chains).toFixed(0)}`,
    );
  }
  // 비급 포화 — 회차별 평균 이월 비급수가 더 안 늘기 시작하는 첫 회차(증가분 <1권/회차가 연속 5회).
  const avgTraj: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    let s = 0; for (const t of scrollTraj) s += t[i] ?? 0;
    avgTraj.push(s / chains);
  }
  let satRun = -1;
  for (let i = 5; i < runs; i += 1) {
    const flat = [0, 1, 2, 3, 4].every((k) => avgTraj[i - k] - avgTraj[i - k - 1] < 1);
    if (flat) { satRun = i + 1; break; }
  }
  console.log(`\n비급 누적 궤적(회차 시작시점 평균 이월권수): ${avgTraj.map((v, i) => (CARRY_CHECKPOINTS.includes(i + 1) ? `${i + 1}회:${v.toFixed(0)}` : null)).filter(Boolean).join(' / ')}`);
  console.log(`비급 포화 회차 ≈ ${satRun > 0 ? `${satRun}회차(이후 증가분 <1권/회차)` : '미포화(100회차까지 계속 증가)'}`);

  // ── 측정2: 회차별 무공서 획득 — 새권수·중복수 추세(전 회차) + chain0 실제 새 비급 이름(핵심 회차) ──
  console.log(`\n=== 측정2: 회차별 무공서 획득(새권 N권 + 중복 M회, 전 ${chains}체인 평균) ===`);
  console.log('회차 | 새권(평균) | 중복드랍(평균)');
  const m2Checkpoints = runs <= 30 ? Array.from({ length: runs }, (_, i) => i + 1) : checkpoints;
  for (const r of m2Checkpoints) {
    console.log(`${String(r).padStart(4)} | ${(newCountByRun[r] / chains).toFixed(1).padStart(6)}권 | ${(dupCountByRun[r] / chains).toFixed(1).padStart(6)}회`);
  }
  // chain0 실제 새 비급 이름 — 초반 회차일수록 풀 목록, 후반은 포화라 짧음.
  console.log(`\n[chain0 실제 새 획득 비급 목록 — 핵심 회차]`);
  const nameRuns = runs <= 20 ? Array.from({ length: runs }, (_, i) => i + 1) : [1, 2, 3, 4, 5, 10, 20, 30, 50, 100].filter((r) => r <= runs);
  for (const r of nameRuns) {
    const names = chain0NewNames[r] ?? [];
    console.log(`  ${r}회차 (새 ${names.length}권): ${names.length ? names.join(' · ') : '(새권 없음)'}`);
  }
}

async function main() {
  // 시뮬은 실시간 연구 타이머와 양립 불가 — 연구 즉시 완료 모드(드랍·시드 모두 complete).
  setResearchInstant(true);
  if (process.argv[2] === 'serverturn') {
    await serverTurnDemo();
    return;
  }
  if (process.argv[2] === 'lifetime') {
    await lifetimeDemo();
    return;
  }
  if (process.argv[2] === 'sweep') {
    await runSweep(); // 인증·저장 없음(순수 인메모리).
    return;
  }
  if (process.argv[2] === 'economysweep') {
    await runEconomySweep();
    return;
  }
  if (process.argv[2] === 'burnsweep') {
    await runBurnSweep();
    return;
  }
  if (process.argv[2] === 'factorysweep') {
    await runFactorySweep();
    return;
  }
  if (process.argv[2] === 'carrysweep') {
    await runCarrySweep();
    return;
  }
  if (process.argv[2] === 'moderatesweep') {
    await runModerateSweep();
    return;
  }
  if (process.argv[2] === 'alchemysweep') {
    await runAlchemySweep();
    return;
  }
  if (process.argv[2] === 'partysweep') {
    await runPartySweep();
    return;
  }
  if (process.argv[2] === 'questsweep') {
    await runQuestSweep();
    return;
  }
  if (process.argv[2] === 'buildsweep') {
    await runBuildSweep();
    return;
  }
  if (process.argv[2] === 'trainsweep') {
    await runTrainSweep();
    return;
  }
  if (process.argv[2] === 'constsweep') {
    await runConstitutionSweep();
    return;
  }
  if (process.argv[2] === 'covertsweep') {
    await runCovertSweep();
    return;
  }
  if (process.argv[2] === 'questmatrix') {
    await runQuestMatrix();
    return;
  }
  if (process.argv[2] === 'extremegate') {
    await runExtremeGate();
    return;
  }
  if (process.argv[2] === 'questsim') {
    await runQuestSim();
    return;
  }
  if (process.argv[2] === 'jobsweep') {
    await runJobSweep();
    return;
  }
  if (process.argv[2] === 'gradsweep') {
    await runGradSweep();
    return;
  }
  if (process.argv[2] === 'jobselect') {
    await runJobSelect();
    return;
  }
  const years = Number(process.argv[2] ?? 15);
  const which = (process.argv[3] ?? 'both').toLowerCase();
  const policies: PlayPolicy[] =
    which === 'growth' ? [GrowthPolicy] : which === 'random' ? [RandomPolicy] : [GrowthPolicy, RandomPolicy];

  process.stderr.write(`  인증: ${SIM_EMAIL} …\n`);
  const uid = await ensureAuth();
  process.stderr.write(`  인증 완료 uid=${uid}\n`);

  for (const policy of policies) {
    await runPolicy(policy, SLOT_BY_POLICY[policy.label] ?? 1, years);
  }

  await supabase.auth.signOut();
}

main().catch((e) => {
  console.error('헤드리스 실행 실패:', e);
  process.exit(1);
});


