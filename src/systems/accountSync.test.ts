// 계정 동기화 라운드트립 — 업적·해금 무공서·집계·다이아가 저장→(재설치 시뮬)비움→복원되는지.
// account repo 를 인메모리 mock 으로 격리(실제 Supabase 안 탐). docs/31·32.
jest.mock('@/data/repositories', () => {
  const box = { stored: null as Record<string, unknown> | null };
  return {
    account: {
      saveAccount: jest.fn(async (d: Record<string, unknown>) => {
        box.stored = JSON.parse(JSON.stringify(d));
      }),
      getAccount: jest.fn(async () => box.stored),
      _reset: () => {
        box.stored = null;
      },
    },
  };
});

import { loadAccount, saveAccount } from './accountSync';
import { account } from '@/data/repositories';
import { useAchievementStore } from '@/stores/achievementStore';
import { useTallyStore } from '@/stores/tallyStore';
import { useGameStore } from '@/stores/gameStore';

const acctMock = account as unknown as {
  saveAccount: jest.Mock;
  getAccount: jest.Mock;
  _reset: () => void;
};

function clearLocal() {
  useAchievementStore.setState({ unlocked: [], unlockedArts: [] } as never);
  useTallyStore.setState({ counts: {}, streaks: {}, maxStreaks: {} } as never);
  useGameStore.setState({ diamonds: 0 } as never);
}

beforeEach(() => {
  acctMock._reset();
  acctMock.saveAccount.mockClear();
  clearLocal();
});

describe('accountSync — 계정 영구 진행 DB 라운드트립', () => {
  it('저장 → (재설치 시뮬)비움 → 복원: 업적·해금무공·집계·다이아', async () => {
    useAchievementStore.setState({ unlocked: ['ach-demon-god'], unlockedArts: ['cheonma-singong'] } as never);
    useTallyStore.setState({ counts: { questDone: 10 }, streaks: {}, maxStreaks: { flawless: 5 } } as never);
    useGameStore.setState({ diamonds: 120 } as never);
    await saveAccount();

    clearLocal(); // 재설치/새 기기 — 로컬 비어 있음
    expect(useAchievementStore.getState().unlockedArts).toHaveLength(0);

    await loadAccount();
    expect(useAchievementStore.getState().unlockedArts).toContain('cheonma-singong');
    expect(useAchievementStore.getState().unlocked).toContain('ach-demon-god');
    expect(useTallyStore.getState().counts.questDone).toBe(10);
    expect(useTallyStore.getState().maxStreaks.flawless).toBe(5);
    expect(useGameStore.getState().diamonds).toBe(120);
  });

  it('DB 비었을 때 load → 로컬 진행 보존 + DB 시드(save 호출)', async () => {
    useAchievementStore.setState({ unlocked: ['ach-offline'], unlockedArts: ['yeokgeun-gyeong'] } as never);
    await loadAccount();
    // 로컬을 지우지 않음(오프라인 진행 보존)
    expect(useAchievementStore.getState().unlocked).toContain('ach-offline');
    expect(useAchievementStore.getState().unlockedArts).toContain('yeokgeun-gyeong');
    // DB 시드 호출됨
    expect(acctMock.saveAccount).toHaveBeenCalled();
  });

  it('DB가 정본 — load 시 DB 값으로 반영(빈 로컬 위에)', async () => {
    useAchievementStore.setState({ unlocked: ['ach-a'], unlockedArts: [] } as never);
    await saveAccount(); // DB = {ach-a}
    useAchievementStore.setState({ unlocked: [], unlockedArts: [] } as never);
    await loadAccount();
    expect(useAchievementStore.getState().unlocked).toContain('ach-a');
  });
});
