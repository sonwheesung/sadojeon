// 화면 단위 테스트 — 무공 진행도 막대. 렌더 + 라벨/우측 표기 규칙 + 클램프.
// docs/40 §2. RNTL v14 render 는 async — await 필수.
import { render } from '@testing-library/react-native';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar (화면 단위)', () => {
  it('기본 라벨("진행도")과 progress 의 반올림 % 를 우측에 표시', async () => {
    const { getByText } = await render(<ProgressBar progress={22} />);
    expect(getByText('진행도')).toBeTruthy();
    expect(getByText('22%')).toBeTruthy();
  });

  it('label·rightLabel prop 으로 좌/우 표기를 덮어쓴다', async () => {
    const { getByText, queryByText } = await render(
      <ProgressBar label="숙련" progress={50} rightLabel="절정" />,
    );
    expect(getByText('숙련')).toBeTruthy();
    expect(getByText('절정')).toBeTruthy();
    // rightLabel 이 있으면 % 숫자는 표시하지 않는다.
    expect(queryByText('50%')).toBeNull();
  });

  it('100 초과 입력은 100% 로 클램프', async () => {
    const { getByText } = await render(<ProgressBar progress={150} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('음수 입력은 0% 로 클램프', async () => {
    const { getByText } = await render(<ProgressBar progress={-30} />);
    expect(getByText('0%')).toBeTruthy();
  });
});
