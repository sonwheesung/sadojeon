// 통합 — 빠른 진행이 **스텁이 아닌 실제 게임 시스템**(LocalGameApi → advanceTurn/triggerPostSettlement,
// 실제 회차 시드) 위에서 도는지. 스텁 단위테스트(fastForward.test.ts)가 못 보는 실조합 검증.
// docs/40 §3(통합) · docs/46. 핵심: 실제 회차를 빠른 진행으로 흘릴 때
//   ① 진짜 시간이 흐르고 ② 결정·현장급보·종결에서만 멈추며(불변식) ③ 크래시 없이 회차가 진행된다.
//
// import 체인 차단 스텁(실 게임 시스템이 끌어오는 IO·LLM). LLM 은 off(트리거 시 미호출이지만 안전).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/data/repositories', () => ({
  runs: { saveRunState: jest.fn(async () => {}), getRunState: jest.fn(async () => null) },
}));
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));
jest.mock('@/systems/runSync', () => ({
  saveCurrentRunSilently: jest.fn(),
  saveCurrentRun: jest.fn(async () => {}),
}));
jest.mock('@/systems/llm/executorchClient', () => ({
  canGenerate: jest.fn(() => false),
  generate: jest.fn(),
  isReadySync: jest.fn(() => false),
  currentModelId: () => 'test-model',
}));

import { fastForward, type FastForwardResult } from './fastForward';
import { seedNewRun, startTutorialRun } from './newRun';
import { __setGameApi } from '@/engine/gameApi';
import { useTimeStore } from '@/stores/timeStore';
import { useGameStore } from '@/stores/gameStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { useRunMetaStore } from '@/stores/runMetaStore';
import { useDiscipleStore } from '@/stores/discipleStore';

beforeEach(() => {
  __setGameApi(null); // 실제 LocalGameApi 사용(서버 URL 미설정 → 로컬 어댑터)
  useGameStore.setState({ phase: 'playing' });
});

// 정지 시점의 불변식 — 멈춘 사유가 실제 상태와 일치해야 한다(거짓 정지·무단 통과 차단).
function assertStopInvariant(r: FastForwardResult): void {
  expect(['decision', 'fieldEvent', 'ended', 'maxDays']).toContain(r.reason);
  if (r.reason === 'decision') {
    expect(useInboxStore.getState().decisionPendingCount()).toBeGreaterThan(0);
  }
  if (r.reason === 'fieldEvent') {
    expect(useFieldEventStore.getState().queue.length).toBeGreaterThan(0);
  }
  if (r.reason === 'ended') {
    expect(useGameStore.getState().phase).toBe('ended');
  }
}

describe('빠른 진행 — 실제 회차 통합', () => {
  it('실제 회차를 빠른 진행하면 진짜 시간이 흐르고, 멈춘 사유가 실제 상태와 일치한다', async () => {
    seedNewRun(['jang-cheol', 'jin-sohwa']);
    const startDay = useTimeStore.getState().totalDay;

    const r = await fastForward(120);

    // 진짜로 하루씩 흘렀다(스텁 아님).
    expect(useTimeStore.getState().totalDay).toBe(startDay + r.days);
    expect(r.days).toBeGreaterThan(0);
    assertStopInvariant(r);
  });

  it('빠른 진행을 반복하면(결정 해소하며) 회차가 크래시 없이 누적 진행된다 — 불변식 매 정지 유지', async () => {
    seedNewRun(['jang-cheol', 'jin-sohwa']);
    const startDay = useTimeStore.getState().totalDay;

    // 결정 멈춤마다 해소(LLM 없이 직접 resolved 마킹)하고 계속 — 1년치(약 336일)는 안 막히고 흐르는지.
    const TARGET_DAYS = 336; // 1년분 누적이면 "실조합에서 안 막힌다" 충분 입증(전체 15년은 headless 담당)
    let guard = 0;
    let lastReason: FastForwardResult['reason'] = 'maxDays';
    let stalls = 0;
    while (guard < 400) {
      guard += 1;
      const before = useTimeStore.getState().totalDay;
      const r = await fastForward(400);
      assertStopInvariant(r); // 매 정지마다 사유=실제 상태(거짓 정지 차단)
      lastReason = r.reason;
      const advanced = useTimeStore.getState().totalDay - before;
      expect(advanced).toBe(r.days); // 보고한 일수만큼 진짜로 흘렀다

      if (r.reason === 'ended') break;
      // 결정·현장급보를 해소하지 못한 채 0일 진행이 반복되면 = 영구 동결(가장 위험한 사각).
      if (advanced === 0) {
        stalls += 1;
        expect(stalls).toBeLessThan(3); // 해소했는데도 못 넘어가면 동결 — 실패로 잡는다
      } else {
        stalls = 0;
      }
      if (r.reason === 'decision') {
        for (const it of [...useInboxStore.getState().items]) {
          if (!it.resolved) useInboxStore.getState().markResolved(it.id);
        }
      }
      if (r.reason === 'fieldEvent') useFieldEventStore.getState().clear();
      if (useTimeStore.getState().totalDay - startDay >= TARGET_DAYS) break;
    }

    // 1년치 이상 실제로 진행됐다(빠른 진행이 실조합에서 안 막히고 누적 흐름).
    expect(useTimeStore.getState().totalDay - startDay).toBeGreaterThanOrEqual(TARGET_DAYS);
    expect(['decision', 'fieldEvent', 'ended', 'maxDays']).toContain(lastReason);
  });

  it('도입 튜토리얼 회차(startTutorialRun)도 빠른 진행 — isTutorialRun 플래그가 유지된다(생애경계)', async () => {
    startTutorialRun();
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
    expect(useDiscipleStore.getState().order).toEqual(['jang-cheol']);

    const r = await fastForward(120);
    assertStopInvariant(r);
    // 빠른 진행이 회차 메타를 건드리지 않는다(도입 회차임이 흐름 내내 유지).
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
  });
});
