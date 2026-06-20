// 화면 단위 테스트 — 그레이박스 스텁 화면. title/hanja/subtitle 조건부 렌더.
// docs/40 §2. RNTL v14는 render 가 async — await 필수. 실행: npx jest src/components/common
import { render } from '@testing-library/react-native';

import { ScreenStub } from './ScreenStub';

describe('ScreenStub (화면 단위)', () => {
  it('title 만 주면 title 만 렌더, 한자·부제는 안 보인다', async () => {
    const { getByText, queryByText } = await render(<ScreenStub title="연단실" />);
    expect(getByText('연단실')).toBeTruthy();
    expect(queryByText('煉丹室')).toBeNull();
  });

  it('hanja·subtitle 을 주면 모두 렌더한다', async () => {
    const { getByText } = await render(
      <ScreenStub title="연단실" hanja="煉丹室" subtitle="영약을 빚는 곳" />,
    );
    expect(getByText('연단실')).toBeTruthy();
    expect(getByText('煉丹室')).toBeTruthy();
    expect(getByText('영약을 빚는 곳')).toBeTruthy();
  });
});
