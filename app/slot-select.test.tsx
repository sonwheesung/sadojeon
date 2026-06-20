// 화면 단위 — 사부 자리(slot-select) 상호작용·요청·확인창 게이트 (docs/40 §2-1).
// 빈 슬롯 → 새 회차(스토어 reset + (tabs) 이동), 사용 슬롯 → 이어 진행(loadRun + 이동),
// 사문 삭제 = 파괴적 → useConfirm 확정 시에만 runs.delete, 취소 시 미삭제.
// 라우팅·repository·confirm·devAccess·store reset 은 mock(화면 단위 격리, IO 미실행).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import SlotSelectScreen from './slot-select';
import { runs as runsRepo } from '@/data/repositories';
import { loadRun } from '@/systems/runSync';

// expo-router — Redirect/useFocusEffect/router. game=1 로 일반 게임 화면(슬롯) 진입.
const mockParams = { current: { game: '1' } as { game?: string } };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { replace: jest.fn(), back: jest.fn() },
    Redirect: () => null,
    useFocusEffect: (cb: () => void | (() => void)) => React.useEffect(() => cb(), []),
    useLocalSearchParams: () => mockParams.current,
  };
});

// 개발환경 게이트 — false 로 두면 Redirect 분기 안 타고 슬롯 화면 렌더.
jest.mock('@/systems/dev/devAccess', () => ({ useDevAccess: () => false }));
jest.mock('@/hooks/useBackConfirm', () => ({ useBackConfirm: () => {} }));

// useConfirm — 확정/취소를 테스트별로 제어.
const mockConfirm = jest.fn();
jest.mock('@/components/common/ConfirmDialog', () => ({
  useConfirm: () => mockConfirm,
}));

// repository — 회차 목록·삭제. IO 미실행, 호출만 단언. (mock* 접두사라야 팩토리 참조 허용)
const mockListForUser = jest.fn();
const mockDel = jest.fn();
jest.mock('@/data/repositories', () => ({
  runs: {
    listForUser: (...a: unknown[]) => mockListForUser(...a),
    delete: (...a: unknown[]) => mockDel(...a),
  },
}));

// 스토어 reset·setSaveSlot — 부수효과 격리.
const mockSetSaveSlot = jest.fn();
const mockReset = jest.fn();
jest.mock('@/stores', () => ({
  useGameStore: (sel: (s: { setSaveSlot: jest.Mock }) => unknown) => sel({ setSaveSlot: mockSetSaveSlot }),
  useDiscipleStore: { getState: () => ({ reset: mockReset }) },
  useMasterStore: { getState: () => ({ reset: mockReset }) },
  useScheduleStore: { getState: () => ({ reset: mockReset }) },
  useSectStore: { getState: () => ({ reset: mockReset }) },
  useTimeStore: { getState: () => ({ reset: mockReset }) },
}));

jest.mock('@/systems/runSync', () => ({
  loadRun: jest.fn(() => Promise.resolve()),
  clearTransientRun: jest.fn(),
}));
jest.mock('@/systems/runSlices', () => ({ RUN_CHILD_SLICES: [] }));

const replace = router.replace as jest.Mock;
const listForUser = mockListForUser;
const del = mockDel;
const setSaveSlot = mockSetSaveSlot;
const reset = mockReset;

const usedRun = {
  id: 'run-1',
  slot: 1,
  status: 'active',
  sect: { name: '청풍문', hanjaName: '淸風門' },
  master: { name: '무명' },
  gameTime: { current: { year: 2, season: 'spring', week: 1 } },
} as any;

beforeEach(() => {
  [listForUser, del, setSaveSlot, reset, replace, mockConfirm].forEach((m) => m.mockReset());
  (loadRun as jest.Mock).mockReset().mockResolvedValue(undefined);
  (router.back as jest.Mock).mockReset();
  mockParams.current = { game: '1' };
  listForUser.mockResolvedValue([]); // 기본: 빈 슬롯 2개
});

describe('slot-select — 슬롯 진입', () => {
  it('빈 슬롯 누름 → 새 회차: setSaveSlot + (tabs) 이동(삭제 없음)', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SlotSelectScreen />);
    await waitFor(() => expect(getByLabelText('슬롯 1 새로 시작')).toBeTruthy());
    await user.press(getByLabelText('슬롯 1 새로 시작'));
    expect(setSaveSlot).toHaveBeenCalledWith(1);
    expect(replace).toHaveBeenCalledWith('/(tabs)');
    expect(del).not.toHaveBeenCalled();
  });

  it('사용 슬롯 누름 → 이어 진행: loadRun(run.id) + (tabs) 이동', async () => {
    listForUser.mockResolvedValue([usedRun]);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SlotSelectScreen />);
    await waitFor(() => expect(getByLabelText('슬롯 1 이어 진행')).toBeTruthy());
    await user.press(getByLabelText('슬롯 1 이어 진행'));
    await waitFor(() => expect(loadRun).toHaveBeenCalledWith('run-1'));
    expect(replace).toHaveBeenCalledWith('/(tabs)');
  });
});

describe('slot-select — 사문 삭제(파괴적·확인창)', () => {
  it('삭제 → 확인창 확정(true) → runs.delete(run.id) 1회 + 목록 재조회', async () => {
    listForUser.mockResolvedValue([usedRun]);
    mockConfirm.mockResolvedValue(true);
    del.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SlotSelectScreen />);
    await waitFor(() => expect(getByLabelText('슬롯 1 사문 삭제')).toBeTruthy());
    await user.press(getByLabelText('슬롯 1 사문 삭제'));
    await waitFor(() => expect(del).toHaveBeenCalledWith('run-1'));
    expect(del).toHaveBeenCalledTimes(1);
    // 삭제는 danger 톤 확인창을 거친다.
    expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
  });

  it('삭제 → 확인창 취소(false) → runs.delete 미호출', async () => {
    listForUser.mockResolvedValue([usedRun]);
    mockConfirm.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SlotSelectScreen />);
    await waitFor(() => expect(getByLabelText('슬롯 1 사문 삭제')).toBeTruthy());
    await user.press(getByLabelText('슬롯 1 사문 삭제'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(del).not.toHaveBeenCalled();
  });
});
