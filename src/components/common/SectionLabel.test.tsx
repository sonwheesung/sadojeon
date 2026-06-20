// 화면 단위 테스트 — 섹션 라벨. 이미지 asset require + expo-image mock + children 렌더 검증
// (QuestRiskMarks 와 다른 import 체인 — jest-expo 의 asset/expo-image 처리 확인). docs/40 §2.
import { render } from '@testing-library/react-native';

import { SectionLabel } from './SectionLabel';

describe('SectionLabel (화면 단위)', () => {
  it('children 텍스트를 렌더한다(asset require·expo-image 정상)', async () => {
    const { getByText } = await render(<SectionLabel>연단 비급</SectionLabel>);
    expect(getByText('연단 비급')).toBeTruthy();
  });
});
