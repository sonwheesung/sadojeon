// 화면 단위 — 도입 튜토리얼 회차 진입 게이트(IntroRunGate) 표시·선택 (docs/40 §2-1, docs/46).
// visible 일 때만 렌더, [안내와 함께 시작]→onStart, [건너뛰기]→onSkip. 숨김 시 내용 없음.
// ⚠️ RNTL v14: render·userEvent 모두 async.
import { render, userEvent } from '@testing-library/react-native';

import { IntroRunGate } from './IntroRunGate';

describe('IntroRunGate — 표시', () => {
  it('visible=false → 안내 문구 미표시', async () => {
    const { queryByText } = await render(
      <IntroRunGate visible={false} onStart={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(queryByText('사문을 여시기 전에')).toBeNull();
  });

  it('visible=true → 제목·두 선택지 표시', async () => {
    const { getByText } = await render(
      <IntroRunGate visible onStart={jest.fn()} onSkip={jest.fn()} />,
    );
    expect(getByText('사문을 여시기 전에')).toBeTruthy();
    expect(getByText('안내와 함께 시작 ▶')).toBeTruthy();
    expect(getByText('건너뛰고 바로 사문 열기')).toBeTruthy();
  });
});

describe('IntroRunGate — 선택', () => {
  it('[안내와 함께 시작] → onStart 1회, onSkip 미호출', async () => {
    const onStart = jest.fn();
    const onSkip = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(
      <IntroRunGate visible onStart={onStart} onSkip={onSkip} />,
    );
    await user.press(getByText('안내와 함께 시작 ▶'));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('[건너뛰기] → onSkip 1회, onStart 미호출', async () => {
    const onStart = jest.fn();
    const onSkip = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(
      <IntroRunGate visible onStart={onStart} onSkip={onSkip} />,
    );
    await user.press(getByText('건너뛰고 바로 사문 열기'));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });
});
