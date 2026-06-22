// 범용 블롭 슬라이스 DB 라운드트립 — 스토어 → run_state(mock) → 비움 → 복원이 원형을 살리는지.
// repo(@/data/repositories)를 인메모리 mock 으로 격리(실제 Supabase 안 탐). docs/31·40.
jest.mock('@/data/repositories', () => {
  const mem: Record<string, unknown> = {};
  return {
    runs: {
      saveRunState: jest.fn(async (runId: string, domain: string, data: unknown) => {
        mem[`${runId}:${domain}`] = JSON.parse(JSON.stringify(data));
      }),
      getRunState: jest.fn(async (runId: string, domain: string) => mem[`${runId}:${domain}`] ?? null),
    },
  };
});

import {
  codexSlice,
  questSlice,
  graduateSlice,
  activitySlice,
  reputationSlice,
  sectAtmosphereSlice,
  eventHistorySlice,
  outreachSlice,
} from './blobSlices';
import { useCodexStore } from '@/stores/codexStore';
import { useQuestStore } from '@/stores/questStore';
import { useGraduateStore } from '@/stores/graduateStore';
import { useActivityStore } from '@/stores/activityStore';
import { useReputationStore } from '@/stores/reputationStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useEventHistoryStore } from '@/stores/eventHistoryStore';
import { useOutreachStore } from '@/stores/outreachStore';

describe('블롭 슬라이스 DB 라운드트립 (저장→비움→복원)', () => {
  // 비급 소유는 계정(accountState)로 분리됨(2026-06-22) — run blob 은 **연구 진행도(회차별)·영약만** 왕복한다.
  it('codex — 회차 연구 진행도 복원(소유는 계정, 연구만 run blob)', async () => {
    const scroll = { artId: 'cheonma-singong', acquiredAtRun: 1, acquiredAtDay: 0, status: 'complete', researchProgress: 100, isTrap: false, isIncomplete: false };
    useCodexStore.setState({ scrolls: [scroll], elixirs: [] } as never);
    await codexSlice.save('r1');
    // 회차 재로드 시뮬: 소유는 loadAccount 가 깔아둔 상태(미연구 기본), 연구만 run blob 이 덮는다.
    useCodexStore.setState({ scrolls: [{ ...scroll, status: 'identified', researchProgress: 0 }], elixirs: [] } as never);
    await codexSlice.load('r1');
    expect(useCodexStore.getState().scrolls).toHaveLength(1);
    expect(useCodexStore.getState().scrolls[0].researchProgress).toBe(100);
    expect(useCodexStore.getState().scrolls[0].status).toBe('complete');
  });

  it('codex — 구버전 blob({scrolls}) 마이그레이션: 소유 병합 + 연구 적용(기존 플레이어 비급 보존)', async () => {
    // 구버전(소유가 run_state 에 있던 시절) blob 을 직접 주입.
    const legacy = { scrolls: [{ artId: 'yeokgeun-gyeong', acquiredAtRun: 2, acquiredAtDay: 3, status: 'complete', researchProgress: 100, isTrap: false, isIncomplete: false }], elixirs: [] };
    // mem 에 직접 심기 위해 save 경로 재사용: 신포맷 save 대신 repo mock 에 구포맷을 넣는다.
    const { runs } = jest.requireMock('@/data/repositories') as { runs: { saveRunState: (r: string, d: string, x: unknown) => Promise<void> } };
    await runs.saveRunState('rLegacy', 'codex', legacy);
    useCodexStore.setState({ scrolls: [], elixirs: [] } as never);
    await codexSlice.load('rLegacy');
    expect(useCodexStore.getState().scrolls).toHaveLength(1);
    expect(useCodexStore.getState().scrolls[0].artId).toBe('yeokgeun-gyeong');
    expect(useCodexStore.getState().scrolls[0].researchProgress).toBe(100);
  });

  it('quest(의뢰) — 진행 중 파견 복원', async () => {
    useQuestStore.setState({ board: [], active: [{ quest: { id: 'q1' }, discipleIds: ['d1'] }] } as never);
    await questSlice.save('r1');
    useQuestStore.setState({ board: [], active: [] } as never);
    await questSlice.load('r1');
    expect(useQuestStore.getState().active).toHaveLength(1);
    expect(useQuestStore.getState().active[0].quest.id).toBe('q1');
  });

  it('graduate(졸업 궤적) — 레코드 복원', async () => {
    useGraduateStore.setState({ records: [{ id: 'g1', name: '호법', route: 'demonic', level: 3, title: '마교 호법', power: 80, fame: 70, status: 'active', graduatedYear: 10 }] } as never);
    await graduateSlice.save('r1');
    useGraduateStore.setState({ records: [] } as never);
    await graduateSlice.load('r1');
    expect(useGraduateStore.getState().records).toHaveLength(1);
    expect(useGraduateStore.getState().records[0].id).toBe('g1');
  });

  it('activity(활동 파견) — 진행 파견 복원', async () => {
    useActivityStore.setState({ active: [{ id: 'act-1', kind: 'gather', discipleIds: ['d1'], startedDay: 1, dueDay: 5 }] } as never);
    await activitySlice.save('r1');
    useActivityStore.setState({ active: [] } as never);
    await activitySlice.load('r1');
    expect(useActivityStore.getState().active).toHaveLength(1);
    expect(useActivityStore.getState().active[0].id).toBe('act-1');
  });

  it('reputation(평판) — sect·disciple 맵 복원', async () => {
    useReputationStore.setState({ sect: { mujimaeng: 7 }, disciple: { d1: 3 } } as never);
    await reputationSlice.save('r1');
    useReputationStore.setState({ sect: {}, disciple: {} } as never);
    await reputationSlice.load('r1');
    expect(useReputationStore.getState().sect.mujimaeng).toBe(7);
    expect(useReputationStore.getState().disciple.d1).toBe(3);
  });

  it('sectAtmosphere(사문 분위기) — 값 복원', async () => {
    useSectAtmosphereStore.setState({ atmosphere: 5 } as never);
    await sectAtmosphereSlice.save('r1');
    useSectAtmosphereStore.setState({ atmosphere: 0 } as never);
    await sectAtmosphereSlice.load('r1');
    expect(useSectAtmosphereStore.getState().atmosphere).toBe(5);
  });

  it('eventHistory(강호 사건 이력) — 레코드 복원', async () => {
    useEventHistoryStore.setState({ records: [{ id: 'e1' }] } as never);
    await eventHistorySlice.save('r1');
    useEventHistoryStore.setState({ records: [] } as never);
    await eventHistorySlice.load('r1');
    expect(useEventHistoryStore.getState().records).toHaveLength(1);
  });

  it('outreach(사부 출행) — pending 복원', async () => {
    useOutreachStore.setState({ pending: [{ id: 'o1' }] } as never);
    await outreachSlice.save('r1');
    useOutreachStore.setState({ pending: [] } as never);
    await outreachSlice.load('r1');
    expect(useOutreachStore.getState().pending).toHaveLength(1);
  });

  it('빈 DB(미저장) load — 크래시 없음', async () => {
    await expect(codexSlice.load('no-such-run')).resolves.toBeUndefined();
  });

  it('reset 은 no-op — 스토어 불변(newRun 이 초기화 소유)', () => {
    useQuestStore.setState({ board: [], active: [{ quest: { id: 'keep' } }] } as never);
    questSlice.reset();
    expect(useQuestStore.getState().active).toHaveLength(1);
  });
});
