// 화면 단위 테스트 — 종이 카드 래퍼. asset require(paper-card.png) + expo-image mock + children 렌더.
// docs/40 §2. RNTL v14는 render 가 async(Promise) — await 필수. 실행: npx jest src/components/common
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { PaperCard } from './PaperCard';

describe('PaperCard (화면 단위)', () => {
  it('children 을 렌더한다(asset require·expo-image 정상)', async () => {
    const { getByText } = await render(
      <PaperCard>
        <Text>비급 보관함</Text>
      </PaperCard>,
    );
    expect(getByText('비급 보관함')).toBeTruthy();
  });

  it('insetContent=false 여도 children 은 그대로 렌더된다', async () => {
    const { getByText } = await render(
      <PaperCard insetContent={false}>
        <Text>가장자리까지</Text>
      </PaperCard>,
    );
    expect(getByText('가장자리까지')).toBeTruthy();
  });
});
