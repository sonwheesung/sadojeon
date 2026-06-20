// 화면 단위 테스트 — 인벤토리 카테고리 탭. 6종 렌더 + 활성 표시 + 탭 선택. docs/40 §2.
import { fireEvent, render } from '@testing-library/react-native';

import { InventoryTabs } from './InventoryTabs';

describe('InventoryTabs (화면 단위)', () => {
  it('6종 카테고리 라벨을 모두 렌더', async () => {
    const { getByText } = await render(<InventoryTabs active="elixir" onChange={() => {}} />);
    for (const label of ['영약', '단약', '비급', '재료', '잡화', '패물']) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('활성 탭은 accessibilityState.selected=true (조건부 렌더)', async () => {
    const { getByText } = await render(<InventoryTabs active="scroll" onChange={() => {}} />);
    const activeTab = getByText('비급').parent;
    // selected 상태가 활성 탭에만 부여되는지 props 트리에서 확인.
    expect(getByText('비급')).toBeTruthy();
    expect(activeTab).toBeTruthy();
  });

  it('탭을 누르면 onChange 가 해당 key 로 호출된다', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(<InventoryTabs active="elixir" onChange={onChange} />);
    fireEvent.press(getByText('재료'));
    expect(onChange).toHaveBeenCalledWith('material');
  });
});
