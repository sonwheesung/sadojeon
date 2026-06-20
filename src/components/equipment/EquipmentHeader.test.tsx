// 화면 단위 테스트 — 장비 헤더. 이름/효과 렌더 + 등급→별 표시 규칙. docs/40 §2.
import { render } from '@testing-library/react-native';

import { EquipmentHeader } from './EquipmentHeader';

describe('EquipmentHeader (화면 단위)', () => {
  it('이름·효과 텍스트와 등급 별을 렌더', async () => {
    const { getByText } = await render(
      <EquipmentHeader name="청강검" hanjaName="靑剛劍" grade={2} effects="공격 +5" />,
    );
    expect(getByText('靑剛劍')).toBeTruthy();
    expect(getByText('청강검')).toBeTruthy();
    expect(getByText('공격 +5')).toBeTruthy();
    expect(getByText('★★☆☆☆')).toBeTruthy();
  });

  it('등급 1 → ★ 1개', async () => {
    const { getByText } = await render(
      <EquipmentHeader name="x" hanjaName="x" grade={1} effects="-" />,
    );
    expect(getByText('★☆☆☆☆')).toBeTruthy();
  });
});
