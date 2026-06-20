// 화면 단위 — 일과 진행 버튼(SectProgressBar)의 진행 게이트·확인창·라우팅 (docs/40 §2-1).
// 핵심: 결정형 서신 미해소(배지>0) → 진행 차단(onProgress 미호출) + 확인창("서신함으로") → 서신함 이동.
//       배지 0 → 진행(onProgress 1회 호출). 숨은변수(역량 수치) 비노출 — 건수·기색 문구만.
// 격리: useInboxBadgeCount(스토어 chain)·useConfirm·expo-router·expo-haptics 는 mock(화면 단위, IO 미실행).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { SectProgressBar } from './SectProgressBar';
import { useInboxBadgeCount } from '@/hooks/useInboxBadgeCount';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('@/hooks/useInboxBadgeCount', () => ({ useInboxBadgeCount: jest.fn() }));

// useConfirm — 확정/취소를 테스트별로 제어(서신함 이동 분기).
const mockConfirm = jest.fn();
jest.mock('@/components/common/ConfirmDialog', () => ({
  useConfirm: () => mockConfirm,
}));

const push = router.push as jest.Mock;
const badgeCount = useInboxBadgeCount as unknown as jest.Mock;

beforeEach(() => {
  mockConfirm.mockReset();
  push.mockReset();
  badgeCount.mockReset();
  badgeCount.mockReturnValue(0);
});

describe('SectProgressBar — 진행 가능(결정 서신 없음)', () => {
  it('배지 0 → 진행 누르면 onProgress 1회 호출, 확인창·라우팅 없음', async () => {
    badgeCount.mockReturnValue(0);
    const onProgress = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(<SectProgressBar onProgress={onProgress} />);
    await user.press(getByText('진행'));
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('배지 0 → 차단 힌트("처리할 서신") 미표시', async () => {
    badgeCount.mockReturnValue(0);
    const { queryByText } = await render(<SectProgressBar onProgress={jest.fn()} />);
    expect(queryByText(/처리할 서신/)).toBeNull();
  });
});

describe('SectProgressBar — 진행 차단(결정 서신 있음)', () => {
  it('배지>0 → 진행 누르면 onProgress 미호출(차단) + 확인창 노출', async () => {
    badgeCount.mockReturnValue(2);
    mockConfirm.mockResolvedValue(false); // "닫기"
    const onProgress = jest.fn();
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SectProgressBar onProgress={onProgress} />);
    // 차단 시 라벨이 "진행 불가 — 처리할 서신 N건" 으로 바뀜.
    await user.press(getByLabelText('진행 불가 — 처리할 서신 2건'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('차단 + 확인창 "서신함으로" 확정 → router.push("/inbox"), 여전히 onProgress 미호출', async () => {
    badgeCount.mockReturnValue(1);
    mockConfirm.mockResolvedValue(true); // "서신함으로"
    const onProgress = jest.fn();
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SectProgressBar onProgress={onProgress} />);
    await user.press(getByLabelText('진행 불가 — 처리할 서신 1건'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/inbox'));
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('차단 + 확인창 "닫기"(취소) → 라우팅 없음, onProgress 미호출(탈출구 없음)', async () => {
    badgeCount.mockReturnValue(3);
    mockConfirm.mockResolvedValue(false);
    const onProgress = jest.fn();
    const user = userEvent.setup();
    const { getByLabelText } = await render(<SectProgressBar onProgress={onProgress} />);
    await user.press(getByLabelText('진행 불가 — 처리할 서신 3건'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(push).not.toHaveBeenCalled();
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('차단 시 처리할 서신 건수 힌트를 표시(숨은변수 아닌 사실)', async () => {
    badgeCount.mockReturnValue(2);
    const { getByText } = await render(<SectProgressBar onProgress={jest.fn()} />);
    expect(getByText('처리할 서신 2건')).toBeTruthy();
  });
});
