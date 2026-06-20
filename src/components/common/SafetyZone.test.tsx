// 화면 단위 테스트 — SafeArea 래퍼. variant 별 children 렌더(엣지 처리는 네이티브라 렌더 성공만 검증).
// docs/40 §2. RNTL v14는 render 가 async — await 필수. 실행: npx jest src/components/common
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SafetyZone } from './SafetyZone';

describe('SafetyZone (화면 단위)', () => {
  it('기본(tab) — children 을 렌더한다', async () => {
    const { getByText } = await render(
      <SafetyZone>
        <Text>일과</Text>
      </SafetyZone>,
    );
    expect(getByText('일과')).toBeTruthy();
  });

  it('modal variant — children 을 렌더한다', async () => {
    const { getByText } = await render(
      <SafetyZone variant="modal">
        <Text>면담</Text>
      </SafetyZone>,
    );
    expect(getByText('면담')).toBeTruthy();
  });

  it('stack variant — children 을 렌더한다', async () => {
    const { getByText } = await render(
      <SafetyZone variant="stack">
        <Text>서신함</Text>
      </SafetyZone>,
    );
    expect(getByText('서신함')).toBeTruthy();
  });
});
