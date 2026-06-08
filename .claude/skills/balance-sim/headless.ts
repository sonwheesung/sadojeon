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
import { configureOptimal, configurePartyDay, setElixirBudget, optimalDispatch, healWithSalve } from '@/systems/dev/policyHelpers';
import { setGeumchangBudget } from '@/systems/questSystem';
import { setByeokgokdanBudget } from '@/systems/trainingSystem';
import { isRespondable, resolveInboxItem } from '@/systems/inboxResolve';
import { useInboxStore } from '@/stores/inboxStore';
import { currentAge } from '@/systems/discipleCtx';
import { findMartialArt } from '@/data/martialArts';
import { effectiveRealmCeiling, realmIndex } from '@/data/realm';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDiscipleStore } from '@/stores/discipleStore';
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
  seedNewRun(['jang-cheol', 'jin-sohwa', 'yun-soso', 'baek-yeon']);
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
  const combatScore = (id: string) => Math.max(eff(id, 'sword'), eff(id, 'fist'), eff(id, 'darkArts'), eff(id, 'staff'));
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
  if (mode === 'party') configurePartyDay(roleMap);
  else configureOptimal();
  optimalDispatch(0.12, 13); // 청소년기 캐리 의뢰(서포트는 전투역량 낮아 자연 제외).
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

async function main() {
  if (process.argv[2] === 'sweep') {
    await runSweep(); // 인증·저장 없음(순수 인메모리).
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
