// 화면 단위 테스트 — 인벤토리 카테고리 헤더. 보유/도감 카운트 표기. docs/40 §2.
import { render } from '@testing-library/react-native';

import { InventoryHeader } from './InventoryHeader';

describe('InventoryHeader (화면 단위)', () => {
  it('한자·한글 카테고리와 보유/도감 카운트를 렌더', async () => {
    const { getByText } = await render(
      <InventoryHeader hanjaCategory="靈藥" koreanCategory="영약" ownedCount={3} codexTotal={12} />,
    );
    expect(getByText('靈藥')).toBeTruthy();
    expect(getByText('영약')).toBeTruthy();
    expect(getByText('보유 3 / 도감 12')).toBeTruthy();
  });

  it('보유 0 도 그대로 표기(빈 보유 분기)', async () => {
    const { getByText } = await render(
      <InventoryHeader hanjaCategory="祕笈" koreanCategory="비급" ownedCount={0} codexTotal={40} />,
    );
    expect(getByText('보유 0 / 도감 40')).toBeTruthy();
  });
});
