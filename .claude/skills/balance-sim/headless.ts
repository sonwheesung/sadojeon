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
import { configureOptimal, configurePartyDay, partyDispatch, setElixirBudget, optimalDispatch, incomeDispatch, healWithSalve } from '@/systems/dev/policyHelpers';
import { setGeumchangBudget, canDispatch, dispatchQuest } from '@/systems/questSystem';
import { QUEST_GRADE_ORDER, QUEST_POOL } from '@/data/quests';
import type { Quest, MartialArtInstance } from '@/types';
import { useQuestStore } from '@/stores/questStore';
import { useCodexStore } from '@/stores/codexStore';
import { setByeokgokdanBudget } from '@/systems/trainingSystem';
import { buildAlchemyLab, learnRecipe, addMaterial, startCraft, consumeInternalElixir, isLabOperational } from '@/systems/alchemySystem';
import { setFoodCost, setLabUpkeep, setPatronageMult } from '@/systems/economySystem';
import { setQuestRewardMult } from '@/systems/questSystem';
import { ELIXIR_RECIPES } from '@/data/elixirs';
import { useItemStore } from '@/stores/itemStore';
import { useSectStore } from '@/stores/sectStore';
import { isRespondable, resolveInboxItem, responseOptionsFor } from '@/systems/inboxResolve';
import { useInboxStore } from '@/stores/inboxStore';
import { currentAge } from '@/systems/discipleCtx';
import { findMartialArt } from '@/data/martialArts';
import { daeryeonChoiceValue } from '@/systems/daeryeonSystem';
import { effectiveRealmCeiling, realmIndex, nextRealm as nextRealmOf, REALM_INTERNAL_REQ } from '@/data/realm';
import { expToNextSeong } from '@/data/martialArts';
import { setResearchInstant } from '@/systems/researchSystem';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useMasterStore } from '@/stores/masterStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { REALM_LABEL } from '@/types/realm';
import { runs as runsRepo } from '@/data/repositories';

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
// 부상은 자연 회복(injuryDaysRemaining 차감 — 그 기간 훈련·의뢰 못 함).
function tickInjuryRecovery(): void {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (d?.status !== 'injured') continue;
    const rem = (d.injuryDaysRemaining ?? 0) - 1;
    if (rem <= 0) ds.update(id, { status: 'training', injuryDaysRemaining: 0 });
    else ds.update(id, { injuryDaysRemaining: rem });
  }
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
  console.log(`=== 1무공+3서폿(연단공장) · ${years}년 · ${iters}회 평균 (무과금·무한재료) ===`);
  console.log('카리=yun-soso(검·화경 빌드). 서폿 3명=연단공장(공부+제조). 카리는 내공단 흡수+화경 벽서 구전대환단 복용.\n');

  let carryHwa = 0;
  const realmTally: Record<string, number> = {};
  let sumDivine = 0;
  let sumInternalDan = 0;
  for (let it = 0; it < iters; it += 1) {
    seedNewRun(['yun-soso', 'jin-sohwa', 'jang-cheol', 'baek-yeon']);
    useGameStore.getState().setPhase('playing');
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
    for (const m of ['herb-common', 'herb-fire', 'herb-poison', 'herb-cold', 'herb-rare', 'herb-divine']) addMaterial(m, 9_999_999);
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
      console.log(
        `  [진단 it${it}] ${REALM_LABEL[realm]} · 내공${Math.round(carry?.realmProgress?.internal ?? 0)} · 외공${carry?.stats?.strength?.level ?? 0} · 주력 ${mainId}(${seong}성) · 익힌 무공 ${learned}권(소성+ ${learnedDeep}) · 비급 ${scrollCount}권 · 명성 ${rep} · 의뢰 ${questCount}회 · 영약재고 ${stock} · pity ${carry?.realmProgress?.pity ?? 0} · status ${carry?.status}`,
      );
    }
  }
  const dist = REALM_ORDER.filter((r) => realmTally[r]).map((r) => `${REALM_LABEL[r]} ${Math.round((realmTally[r] / iters) * 100)}%`).join(' / ');
  console.log(`카리 화경 달성 ${Math.round((carryHwa / iters) * 100)}% · 카리 최종경지 분포: ${dist}`);
  console.log(`서폿 연단공장 산출/회: 구전대환단 ${(sumDivine / iters).toFixed(1)}과 · 내공단 ${(sumInternalDan / iters).toFixed(1)}과`);
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
  console.log(`=== 경제 그리드 — 연단실 ON · 의뢰 가동률 변주 · ${years}년 (제자 4명) ===`);
  console.log('각 조합 최종 자금 + 연단실 가동(O=유지비 납부중) + 최저점. 단위 금/은/동.\n');
  console.log('식비 | 유지비 | 시작 | 가동률 → 최종자금 | 가동 | 최저');
  for (const food of FOODS)
    for (const up of UPKEEPS)
      for (const start of STARTS)
        for (const rate of RATES) {
          const rw = REWARDS[0];
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
          const fin = useSectStore.getState().sect?.resources ?? 0;
          const op = isLabOperational() ? 'O' : 'X';
          void rw;
          console.log(`식비${food} | 유지${up} | ${coinStr(start)} | ${Math.round(rate * 100)}% → ${coinStr(fin)} | ${op} | 최저 ${coinStr(minRes)}`);
        }
}

// ── 무공 선택→훈련 궤적 검증 — 성·낙수·등급 속도·경지 클램프가 정상 동작·수치인지 ──────
const HWASAN_TREE = [
  'hwasan-gicho-sword', 'yukhap-sword', 'maehwa-sword', 'jaha-sword', 'isipsa-maehwa-sword',
  'maehwa-gigong', 'jaha-singong', 'amhyang-pyo',
];

function grantScroll(artId: string): void {
  useCodexStore.getState().addScroll({
    artId,
    acquiredAtRun: 1,
    acquiredAtDay: useTimeStore.getState().totalDay,
    status: 'complete', // 시뮬 — 연구 게이트는 즉시 완료(실시간 타이머는 시뮬과 양립 불가)
    researchProgress: 100,
    isTrap: false,
    isIncomplete: false,
  });
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
    wound: undefined,
    injuryDaysRemaining: 0,
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

async function runQuestMatrix(): Promise<void> {
  setAutoSaveEnabled(false);
  const reps = Number(process.argv[3] ?? 120);
  console.log(`=== 의뢰 정밀 매트릭스 — 전 의뢰 × 적합도, 의뢰당 ${reps}회 실측 (실코드 결산) ===`);
  console.log('결투·큰의뢰=전투 도메인 사다리(미달/적정/우월), 그 외=능력치 minStat−15/+10/+30.');
  console.log('표기: 완/성/위/실/재 % · 사망 % · 치명상(생환) % · 평균 자금Δ(동) · 드랍 % · 평균 소요일\n');

  seedNewRun(SEED_POOL);
  useGameStore.getState().setPhase('playing');
  setFoodCost(0); // 자금 델타에서 일상 경제 소음 제거 — 의뢰 보상만 잰다.
  setPatronageMult(0);
  setGeumchangBudget(Infinity); // 구급영약 무한 — 생존 체인 1단이 항상 열림(영약 보유 가정 행은 별도)
  const ds = () => useDiscipleStore.getState();
  const carry = ds().order[0];
  // 동료들은 쉬게 — 비무·습격·일과 소음 제거.
  for (const id of ds().order.slice(1)) ds().update(id, { status: 'resting' });

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
    const tiers = isCombat ? [0, 1, 2] : [1]; // 판정식 도메인은 적정만(곡선은 기존 검증 — 여긴 결투 정밀이 본론)
    for (const tier of tiers) {
      const presetKey = isCombat ? COMBAT_TIERS[q.grade][tier] : 'iryu4';
      const statLevel = stat ? Math.max(1, q.minStat + [-15, 10, 30][tier]) : 0;

      const out: Record<string, number> = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0, gate: 0 };
      let dead = 0;
      let fatalSurvived = 0;
      let moneySum = 0;
      let dropCount = 0;
      let daySum = 0;
      for (let i = 0; i < reps; i += 1) {
        applyPreset(carry, PRESETS[presetKey], stat ? { stat, level: statLevel } : undefined);
        // 격리 — 이전 rep 의 잔여 상태(미결산 파견·종결 페이즈)가 다음 rep 을 오염시키지 않게.
        // 나이도 고정: 매트릭스가 게임 시간을 수십 년 흘리므로, 늙은 제자 전원 졸업 → 회차 종결 →
        // advanceTurn 조기 반환으로 의뢰가 영구 동결되는 것을 막는다.
        {
          const year = useTimeStore.getState().current.year;
          for (const id of ds().order) {
            ds().update(id, {
              age: 16,
              entryYear: year,
              ...(id === carry ? {} : { status: 'resting' as const }),
            });
          }
          // 사부 수명도 고정 — 매트릭스 누적이 ~99 게임년을 넘으면 사부 수명 종결(phase ended)로
          // 모든 의뢰가 동결된다(advanceTurn 조기 반환).
          useMasterStore.getState().update({ yearsAsMaster: 0, age: 40 });
        }
        useGameStore.getState().setPhase('playing');
        useQuestStore.setState({ board: [q], active: [] });
        const money0 = useSectStore.getState().sect?.resources ?? 0;
        const scrolls0 = useCodexStore.getState().scrolls.length;
        if (!dispatchQuest(q.id, [carry])) {
          out.gate += 1;
          continue;
        }
        let days = 0;
        let outcome = '';
        while (ds().disciples[carry]?.status === 'questing' && days < q.weeks * 7 + 14) {
          advanceTurn();
          days += 1;
          // 결과 판독 — 결산 마일스톤은 정산 큐(pendingStore.milestones)에 실린다(서신 변환은 정산 확인 후라 시뮬에선 큐에서 직접).
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
        const d = ds().disciples[carry];
        if (d?.status === 'departed') dead += 1;
        else if (d?.wound?.severity === 1) fatalSurvived += 1;
        moneySum += (useSectStore.getState().sect?.resources ?? 0) - money0;
        if (useCodexStore.getState().scrolls.length > scrolls0) dropCount += 1;
        useInboxStore.getState().reset();
        // 사망했어도 다음 rep을 위해 부활(프리셋 재적용이 status까지 복원).
      }
      const pct = (n: number) => `${Math.round((n / reps) * 100)}`;
      const tierLabel = isCombat ? `${TIER_LABEL[tier]}(${PRESETS[presetKey].label})` : `적정(${stat} ${statLevel})`;
      console.log(
        `[${QUEST_GRADE_ORDER.indexOf(q.grade)}·${q.grade}] ${q.title.padEnd(14)} ${q.domain.padEnd(8)} ${tierLabel.padEnd(14)} ` +
          `완${pct(out.full)} 성${pct(out.partial)} 위${pct(out.crisis)} 실${pct(out.fail)} 재${pct(out.disaster)}${out.gate ? ` 게이트${pct(out.gate)}` : ''} | ` +
          `사망${pct(dead)} 치명생환${pct(fatalSurvived)} | 자금Δ${Math.round(moneySum / reps)} | 드랍${pct(dropCount)} | ${Math.round(daySum / Math.max(1, reps))}일`,
      );
    }
  }
}

async function main() {
  // 시뮬은 실시간 연구 타이머와 양립 불가 — 연구 즉시 완료 모드(드랍·시드 모두 complete).
  setResearchInstant(true);
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
  if (process.argv[2] === 'questmatrix') {
    await runQuestMatrix();
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
