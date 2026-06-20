// 화면 단위 테스트 — 제자 상세 초상 헤더. 이름 렌더(그레이박스 placeholder 동반). docs/40 §2.
import { render } from '@testing-library/react-native';

import { DiscipleHeader } from './DiscipleHeader';

describe('DiscipleHeader (화면 단위)', () => {
  it('한글·한자 이름을 렌더하고 초상 placeholder 를 표시', async () => {
    const { getByText } = await render(<DiscipleHeader name="모용청" hanjaName="慕容靑" />);
    expect(getByText('慕容靑')).toBeTruthy();
    expect(getByText('모용청')).toBeTruthy();
    // 그레이박스 단계: 초상은 dashed placeholder("초상") 로 노출.
    expect(getByText('초상')).toBeTruthy();
  });
});
