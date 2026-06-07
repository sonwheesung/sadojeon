// 헤드리스 실코드 자동플레이 — 실제 TS 시스템(timeSystem·이벤트·면담·영약…)을 Node에서 구동하고,
// **실제 Supabase에 영속**한다(진짜 end-to-end). 게임의 실제 runSync 경로로 저장 → DB에서 검증 가능.
//
// 인증: 전용 시뮬 계정(simbot@shidao.app)으로 로그인(없으면 가입 후 로그인) — 실제 유저 슬롯과 격리.
// LLM(executorch)은 Node에서 require 실패 → 규칙 폴백(RuleResolver). LLM 출력은 in-app 하네스에서만.
// 실행: node .claude/skills/balance-sim/run-headless.cjs [years]  (env 로드 + 번들 + 구동)

import { supabase } from '@/lib/supabase';
import { seedNewRun } from '@/systems/newRun';
import { saveCurrentRun, setAutoSaveEnabled } from '@/systems/runSync';
import { autoPlayRun, type AutoPlayEvent } from '@/systems/dev/autoPlay';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { runs as runsRepo } from '@/data/repositories';

// 전용 시뮬 계정 — 실제 플레이어 데이터와 분리된 슬롯에만 쓴다.
const SIM_ID = 'simbot';
const SIM_PW = 'simbot-260608-headless';
const SIM_EMAIL = `${SIM_ID}@shidao.app`;
const SIM_SLOT = 1;

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

async function main() {
  const years = Number(process.argv[2] ?? 15);

  // 1) 인증 — 전용 시뮬 계정.
  process.stderr.write(`  인증: ${SIM_EMAIL} …\n`);
  const uid = await ensureAuth();
  process.stderr.write(`  인증 완료 uid=${uid}\n`);

  // 2) 회차 시드 + 슬롯 지정(시뮬 계정 슬롯).
  // 매일 발생하는 게임 내부 autosave 는 끈다 — 고속 진행에서 쓰기 증폭(수만 회) 방지.
  // 대신 아래서 연 단위 + 최종에만 명시 저장한다.
  setAutoSaveEnabled(false);
  useGameStore.getState().setSaveSlot(SIM_SLOT);
  seedNewRun(['jang-cheol', 'jin-sohwa', 'yun-soso', 'baek-yeon']);

  // 3) 자동 랜덤 플레이 — 1년마다 중간 저장(진행 영속) + 진행 로그.
  // saveSlot 은 SELECT→INSERT 라 원자적이지 않다 → 저장을 promise 체인으로 직렬화해
  // 동시 INSERT 충돌(unique user,slot)을 방지한다.
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
        process.stderr.write(`  진행 ${done}/${total}일 — 저장 큐…\n`);
        void queueSave(); // 직렬화 큐에 적재(겹치지 않음).
      }
    },
  );

  // 4) 최종 저장 — 큐 비운 뒤 마지막 저장까지 await(회차 행 + 제자 + 자식 슬라이스).
  process.stderr.write('  최종 저장…\n');
  await queueSave();
  if (saveErr) process.stderr.write(`  ⚠ 저장 경고(마지막): ${saveErr}\n`);

  // 5) DB 읽기 검증 — 실제로 영속됐는지 회차 행을 되읽는다.
  const slotRuns = await runsRepo.listForUser();
  const mine = slotRuns.find((r) => r.slot === SIM_SLOT);
  const dbTime = (mine?.gameTime as { current?: { year?: number; season?: string } })?.current;

  // ── 요약 ──
  const byDomain: Record<string, number> = {};
  let llm = 0;
  for (const e of events) {
    byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
    if (e.llmPrompt || e.llmRaw) llm += 1;
  }
  const t = useTimeStore.getState().current;
  const ds = useDiscipleStore.getState();
  const disc = ds.order.map((id) => ds.disciples[id]).filter(Boolean);

  console.log(`\n=== 헤드리스 자동플레이 ${years}년 — 발동 ${events.length}건 (LLM ${llm}건, 규칙폴백) ===`);
  console.log('도메인별:', Object.entries(byDomain).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' / '));
  console.log(`메모리 종료 시점: ${t.year}년차 ${t.season} ${t.week}주 ${t.day}일`);
  console.log(`DB 영속 검증(slot ${SIM_SLOT}): runId=${mine?.id ?? '없음'} · status=${mine?.status ?? '?'} · DB시점=${dbTime ? `${dbTime.year}년차 ${dbTime.season}` : '없음'}`);
  console.log(
    '제자 최종:',
    disc.map((d) => `${d!.name}(${d!.realm}·근력Lv${d!.stats?.strength?.level ?? '-'})`).join(' / '),
  );

  // 세션 정리.
  await supabase.auth.signOut();
}

main().catch((e) => {
  console.error('헤드리스 실행 실패:', e);
  process.exit(1);
});
