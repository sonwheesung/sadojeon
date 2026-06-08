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
import { autoPlayRun, RandomPolicy, type AutoPlayEvent, type PlayPolicy } from '@/systems/dev/autoPlay';
import { GrowthPolicy } from '@/systems/dev/growthPolicy';
import { currentAge } from '@/systems/discipleCtx';
import { findMartialArt } from '@/data/martialArts';
import { effectiveRealmCeiling } from '@/data/realm';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { REALM_LABEL } from '@/types/realm';
import { runs as runsRepo } from '@/data/repositories';

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

  await queueSave(); // 최종 저장(큐 비우고 await).
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

async function main() {
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
