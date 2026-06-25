// 엔진/시스템 단위 — 빠른 진행(자동 넘김) 정지 조건·불변식(docs/40 §1, docs/46).
// gameApi 를 스텁으로 주입(__setGameApi)해 정규 진행 부작용 없이 루프만 검증한다.
//
// 핵심 불변식: 결정 대기 서신·현장 급보·회차 종결을 **절대 건너뛰지 않고 그 날 멈춘다**
//   (건너뛰면 제자 동결·게이트 무력화 — docs/46 가장 위험한 사각).
//
// supabase 클라이언트는 jest 에 env 가 없어 import 만으로 createClient 가 throw → 스텁
//   (체인: gameApi→timeSystem→pendingStore→repositories→supabase).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import { fastForward } from './fastForward';
import { __setGameApi, type GameApi } from '@/engine/gameApi';
import { useGameStore } from '@/stores/gameStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import type { InboxItem, Milestone } from '@/types';

// 한 날의 advance 때 스토어를 조작할 스크립트(day 1-기준). settle 직전 상태를 만든다.
type DayScript = (day: number) => void;

interface StubOpts {
  // 정산을 set하지 않을 날(월 시작 early-return 모사) — 그 날은 settle 이 호출되면 안 된다.
  noSettlementOn?: number[];
}

// 스텁 GameApi — advance 가 정산을 set(루프가 settle 경로를 타게) + day 스크립트 실행.
function makeStubApi(
  script?: DayScript,
  opts: StubOpts = {},
): { api: GameApi; advanceCalls: () => number; settleCalls: () => number } {
  let day = 0;
  let settleCalls = 0;
  const noSettlement = new Set(opts.noSettlementOn ?? []);
  const api: GameApi = {
    authoritative: false,
    async newRun() {
      return {} as never;
    },
    async advance() {
      day += 1;
      if (!noSettlement.has(day)) {
        // 일반 날처럼 정산 데이터 set(루프가 clearSettlement+settle 경로를 타도록).
        usePendingStore.setState({
          settlement: { dateLabel: `d${day}`, log: { entries: [] }, badges: {}, llmDebugs: [] },
        } as never);
      }
      script?.(day);
      return {} as never;
    },
    async settle() {
      settleCalls += 1;
      return {} as never;
    },
  };
  return { api, advanceCalls: () => day, settleCalls: () => settleCalls };
}

function addDecisionLetter(id: string): void {
  const item: InboxItem = {
    id,
    kind: 'event', // DECISION_KINDS — 진행 게이트가 막는 종류
    eventId: 'test-event',
    priority: 'normal',
    createdAtDay: 0,
    read: false,
    resolved: false,
    title: '결정',
    preview: '결정 필요',
  };
  useInboxStore.getState().add(item);
}

beforeEach(() => {
  useGameStore.setState({ phase: 'menu' });
  useScheduleStore.setState({ pendingReport: false, pendingSetup: false });
  usePendingStore.setState({ settlement: null, milestones: [] } as never);
  useInboxStore.setState({ items: [] });
  useFieldEventStore.setState({ queue: [] });
});

afterEach(() => {
  __setGameApi(null); // 다음 테스트가 실제 어댑터를 쓰게 복원
});

describe('빠른 진행 — 정지 조건', () => {
  it('정지 사유가 없으면 maxDays 까지 진행한다', async () => {
    const { api, advanceCalls } = makeStubApi();
    __setGameApi(api);
    const r = await fastForward(5);
    expect(r.reason).toBe('maxDays');
    expect(r.days).toBe(5);
    expect(advanceCalls()).toBe(5);
  });

  it('결정 필요한 서신이 생기면 그 날 멈춘다(건너뛰지 않음)', async () => {
    const { api, advanceCalls } = makeStubApi((day) => {
      if (day === 3) addDecisionLetter('dec-3');
    });
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('decision');
    expect(r.days).toBe(3);
    expect(advanceCalls()).toBe(3); // 4일째로 넘어가지 않음
    expect(useInboxStore.getState().decisionPendingCount()).toBe(1);
  });

  it('현장 급보가 쌓이면 그 날 멈춘다', async () => {
    const { api } = makeStubApi((day) => {
      if (day === 2) useFieldEventStore.setState({ queue: [{ id: 'fe' } as never] });
    });
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('fieldEvent');
    expect(r.days).toBe(2);
  });

  it('회차가 종결되면(사부 수명/전원 하산) 그 날 멈춘다', async () => {
    const { api } = makeStubApi((day) => {
      if (day === 2) useGameStore.setState({ phase: 'ended' });
    });
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('ended');
    expect(r.days).toBe(2);
  });

  it('시작 전 이미 결정 대기면 한 틱도 진행하지 않는다(정규 게이트 존중)', async () => {
    addDecisionLetter('pre');
    const { api, advanceCalls } = makeStubApi();
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('decision');
    expect(r.days).toBe(0);
    expect(advanceCalls()).toBe(0); // advance 자체가 안 불림
  });
});

describe('빠른 진행 — 엣지(docs/43 5렌즈)', () => {
  it('maxDays=1 → 딱 하루만 진행(상한 경계)', async () => {
    const { api, advanceCalls } = makeStubApi();
    __setGameApi(api);
    const r = await fastForward(1);
    expect(r.reason).toBe('maxDays');
    expect(r.days).toBe(1);
    expect(advanceCalls()).toBe(1);
  });

  it('월 시작 날(정산 없음) → 그 날도 진행 카운트, settle 미호출, 다음 날 계속(자원경합)', async () => {
    // 2일째는 월 시작처럼 정산이 없고 월간 모달이 떠 있다 — 모달 닫고 settle 없이 넘어가야 한다.
    const { api, settleCalls } = makeStubApi(
      (day) => {
        if (day === 2) useScheduleStore.setState({ pendingSetup: true, pendingReport: true });
      },
      { noSettlementOn: [2] },
    );
    __setGameApi(api);
    const r = await fastForward(3);
    expect(r.reason).toBe('maxDays');
    expect(r.days).toBe(3); // 정산 없는 날도 하루로 센다
    expect(settleCalls()).toBe(2); // 1·3일만 settle, 2일(월시작)은 settle 안 함
    // 월간 모달은 자동으로 닫혀야 한다(현행 일정 유지).
    expect(useScheduleStore.getState().pendingSetup).toBe(false);
    expect(useScheduleStore.getState().pendingReport).toBe(false);
  });

  it('한 틱에 결정 여러 건 동시 발생 → 그 틱에 멈추고 전부 집계(건너뛰지 않음)', async () => {
    const { api } = makeStubApi((day) => {
      if (day === 2) {
        addDecisionLetter('multi-a');
        addDecisionLetter('multi-b');
      }
    });
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('decision');
    expect(r.days).toBe(2);
    expect(useInboxStore.getState().decisionPendingCount()).toBe(2);
  });

  it('onTick 콜백이 진행 일수로 호출된다(UI 진행 표시)', async () => {
    const ticks: number[] = [];
    const { api } = makeStubApi((day) => {
      if (day === 4) addDecisionLetter('stop-4');
    });
    __setGameApi(api);
    const r = await fastForward(100, (d) => ticks.push(d));
    expect(r.reason).toBe('decision');
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[ticks.length - 1]).toBe(4); // 멈춘 시점 일수로 마지막 콜백
  });
});

describe('빠른 진행 — 승급 수집', () => {
  it('진행 중 발생한 승급 마일스톤을 모아 반환한다(요약 표시용)', async () => {
    const promo: Milestone = {
      id: 'm1',
      kind: 'promotion',
      discipleId: 'd1',
      discipleName: '아무개',
      title: '승급',
      body: '절정에 올랐다.',
    };
    const { api } = makeStubApi((day) => {
      if (day === 1) usePendingStore.setState({ milestones: [promo] } as never);
      if (day === 2) addDecisionLetter('after-promo');
    });
    __setGameApi(api);
    const r = await fastForward(100);
    expect(r.reason).toBe('decision');
    expect(r.promotions.map((m) => m.kind)).toContain('promotion');
  });
});
