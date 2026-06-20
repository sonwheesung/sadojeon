// 화면 단위 테스트 — 키보드 가림 방지 폼 래퍼. children 렌더(키보드 동작은 네이티브라 렌더 검증).
// docs/40 §2, feedback_keyboard_aware_forms. RNTL v14는 render 가 async — await 필수.
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { KeyboardAwareScroll } from './KeyboardAwareScroll';

describe('KeyboardAwareScroll (화면 단위)', () => {
  it('children 을 렌더한다', async () => {
    const { getByText } = await render(
      <KeyboardAwareScroll>
        <Text>아이디</Text>
        <Text>비밀번호</Text>
      </KeyboardAwareScroll>,
    );
    expect(getByText('아이디')).toBeTruthy();
    expect(getByText('비밀번호')).toBeTruthy();
  });

  it('center=true 여도 children 은 그대로 렌더된다', async () => {
    const { getByText } = await render(
      <KeyboardAwareScroll center>
        <Text>로그인</Text>
      </KeyboardAwareScroll>,
    );
    expect(getByText('로그인')).toBeTruthy();
  });
});
