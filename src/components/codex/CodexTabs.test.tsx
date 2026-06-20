// 화면 단위 테스트 — 도감 갈래 탭 8종 + 탭 선택 + 마공(숨은 갈래) 비노출. docs/40 §2.
import { fireEvent, render } from '@testing-library/react-native';

import { CodexTabs } from './CodexTabs';

describe('CodexTabs (화면 단위)', () => {
  it('8대 갈래 라벨을 모두 렌더', async () => {
    const { getByText } = await render(<CodexTabs active="sword" onChange={() => {}} />);
    for (const label of ['검법', '도법', '권법', '보법', '암기', '외공', '내공', '의가무공']) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('숨은 갈래(마도/마공)는 도감 탭에 노출하지 않는다', async () => {
    // labels.ts: 마공(darkArts)은 숨은 별도라 도감 비노출. 숨은변수 비노출 규칙.
    const { queryByText } = await render(<CodexTabs active="sword" onChange={() => {}} />);
    expect(queryByText('마공')).toBeNull();
    expect(queryByText('마도')).toBeNull();
  });

  it('탭을 누르면 onChange 가 해당 갈래 key 로 호출된다', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(<CodexTabs active="sword" onChange={onChange} />);
    fireEvent.press(getByText('내공'));
    expect(onChange).toHaveBeenCalledWith('qigong');
  });
});
