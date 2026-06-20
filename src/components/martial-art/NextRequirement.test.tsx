// 화면 단위 테스트 — 다음 단계 조건 한 줄. 렌더 + 라벨 고정. docs/40 §2.
import { render } from '@testing-library/react-native';

import { NextRequirement } from './NextRequirement';

describe('NextRequirement (화면 단위)', () => {
  it('"다음 단계:" 라벨과 전달한 조건 텍스트를 렌더', async () => {
    const { getByText } = await render(
      <NextRequirement text="실전 경험 + 절품 영약 필요" />,
    );
    expect(getByText('다음 단계:')).toBeTruthy();
    expect(getByText('실전 경험 + 절품 영약 필요')).toBeTruthy();
  });
});
