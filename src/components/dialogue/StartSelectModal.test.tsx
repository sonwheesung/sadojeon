// 화면 단위 — 사문 시작 선택 모달(StartSelectModal)의 상호작용·게이트·요청 (docs/40 §2-1).
// 명부 카드 탭 → 상세 → 거두기/취소 토글, 최소 2·최대 4 게이트, "거두고 시작" → seedNewRun(선택) 1회,
// 미달 시 시작 차단. seedNewRun(스토어 깊은 시스템)·onComplete 는 mock(화면 단위 격리).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { StartSelectModal } from './StartSelectModal';
import { seedNewRun } from '@/systems/newRun';

// seedNewRun 은 다수 스토어를 끌어옴 → 팩토리로 차단하고 호출 인자만 단언.
jest.mock('@/systems/newRun', () => ({ seedNewRun: jest.fn() }));

const onComplete = jest.fn();
const seed = seedNewRun as jest.Mock;

beforeEach(() => {
  seed.mockReset();
  onComplete.mockReset();
});

// 명부 카드 → 상세 진입 → 거두기. (RECRUIT_POOL 순서: 장철·진소화·한바람·윤소소·이청하·백연)
async function recruit(user: ReturnType<typeof userEvent.setup>, screen: any, name: string) {
  await user.press(screen.getByLabelText(`${name} 상세 보기`));
  await user.press(screen.getByText('이 아이를 거두기'));
  await user.press(screen.getByText('‹ 명부로'));
}

describe('StartSelectModal — 시작 게이트(최소 2명)', () => {
  it('미선택(0명) → 시작 버튼이 "2명 이상 선택" + seedNewRun 미호출', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    expect(screen.getByText('2명 이상 선택')).toBeTruthy();
    await user.press(screen.getByText('2명 이상 선택'));
    expect(seed).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('1명만 선택 → 여전히 차단(seedNewRun 미호출)', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    await recruit(user, screen, '장철');
    expect(screen.getByText('2명 이상 선택')).toBeTruthy();
    await user.press(screen.getByText('2명 이상 선택'));
    expect(seed).not.toHaveBeenCalled();
  });

  it('2명 선택 → "거두고 시작" → seedNewRun(선택 poolId 2개) 1회 + onComplete', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    await recruit(user, screen, '장철');
    await recruit(user, screen, '진소화');
    await user.press(screen.getByText('거두고 시작 ▶'));
    expect(seed).toHaveBeenCalledTimes(1);
    expect(seed).toHaveBeenCalledWith(['jang-cheol', 'jin-sohwa']);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('StartSelectModal — 선택 토글·정원(최대 4명)', () => {
  it('상세에서 카운터(선택 수)가 증가한다', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    expect(screen.getByText('0 / 4 선택 · 인물을 눌러 살펴보기')).toBeTruthy();
    await recruit(user, screen, '장철');
    expect(screen.getByText('1 / 4 선택 · 인물을 눌러 살펴보기')).toBeTruthy();
  });

  it('거둠 → 거둠 취소 토글 → 선택에서 제외(다시 0명 → 시작 차단)', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    await user.press(screen.getByLabelText('장철 상세 보기'));
    await user.press(screen.getByText('이 아이를 거두기'));
    // 같은 상세에서 거둠 취소.
    await user.press(screen.getByText('거둠 취소'));
    await user.press(screen.getByText('‹ 명부로'));
    expect(screen.getByText('0 / 4 선택 · 인물을 눌러 살펴보기')).toBeTruthy();
  });

  it('정원(4명) 초과 선택 시 5번째 상세는 "정원이 찼습니다"로 거두기 차단', async () => {
    const user = userEvent.setup();
    const screen = await render(<StartSelectModal visible onComplete={onComplete} />);
    await recruit(user, screen, '장철');
    await recruit(user, screen, '진소화');
    await recruit(user, screen, '한바람');
    await recruit(user, screen, '윤소소');
    expect(screen.getByText('4 / 4 선택 · 인물을 눌러 살펴보기')).toBeTruthy();
    // 5번째 후보 상세 → 정원 가득 → 거두기 비활성.
    await user.press(screen.getByLabelText('이청하 상세 보기'));
    expect(screen.getByText('정원이 찼습니다')).toBeTruthy();
    await user.press(screen.getByText('정원이 찼습니다'));
    await user.press(screen.getByText('‹ 명부로'));
    // 여전히 4명 — 시작 가능하지만 5번째는 안 들어감.
    await user.press(screen.getByText('거두고 시작 ▶'));
    expect(seed).toHaveBeenCalledWith(['jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso']);
  });
});
