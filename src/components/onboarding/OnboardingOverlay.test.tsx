// 화면 단위 — 첫 안내(온보딩) 오버레이의 단계 진행·종료 콜백(docs/40 §2-1, docs/44).
// 첫 단계 노출 → [다음] 누적 진행 → 마지막 [시작]/[건너뛰기] 가 onDone 1회 호출.
// 단계 문구는 실제 ONBOARDING_STEPS 데이터 사용(데이터-컴포넌트 정합 동시 검증).
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { ONBOARDING_STEPS } from '@/data/onboarding';
import { OnboardingOverlay } from './OnboardingOverlay';

const FIRST = ONBOARDING_STEPS[0];
const LAST = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];

describe('온보딩 오버레이 — 단계 진행', () => {
  it('열리면 첫 단계 제목·본문을 노출', async () => {
    const { getByText } = await render(<OnboardingOverlay visible onDone={jest.fn()} />);
    expect(getByText(FIRST.title)).toBeTruthy();
    expect(getByText(FIRST.body)).toBeTruthy();
  });

  it('[다음]을 끝까지 누르면 마지막 단계 → [시작] 노출', async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(<OnboardingOverlay visible onDone={jest.fn()} />);
    // 마지막 직전까지 [다음]은 (total-1)번
    for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
      await user.press(getByText(/▶/));
    }
    expect(getByText(LAST.title)).toBeTruthy();
    expect(getByText('시작 ▶')).toBeTruthy();
    expect(queryByText('다음 ▶')).toBeNull();
  });

  it('마지막 [시작] → onDone 1회', async () => {
    const onDone = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(<OnboardingOverlay visible onDone={onDone} />);
    for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
      await user.press(getByText(/▶/));
    }
    await user.press(getByText('시작 ▶'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('온보딩 오버레이 — 건너뛰기', () => {
  it('첫 단계에서 [건너뛰기] → onDone 1회(즉시 종료)', async () => {
    const onDone = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(<OnboardingOverlay visible onDone={onDone} />);
    await user.press(getByText('건너뛰기'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
