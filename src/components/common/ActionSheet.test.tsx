// 화면 단위 테스트 — 하단 액션시트(옵션 선택). 옵션 렌더·선택 표시·콜백 동작.
// docs/40 §2. RNTL v14는 render 가 async — await 필수. 실행: npx jest src/components/common
// ActionSheet 는 useSafeAreaInsets() 를 쓰므로 SafeAreaProvider(initialMetrics) 로 감싼다.
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { ActionSheet } from './ActionSheet';

const OPTIONS = ['검법', '도법', '권법'] as const;

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderInSafeArea(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={METRICS}>{ui}</SafeAreaProvider>);
}

describe('ActionSheet (화면 단위)', () => {
  it('visible=false 면 옵션이 안 보인다', async () => {
    const { queryByText } = await renderInSafeArea(
      <ActionSheet visible={false} options={OPTIONS} onSelect={() => {}} onClose={() => {}} />,
    );
    expect(queryByText('검법')).toBeNull();
  });

  it('visible=true 면 제목과 모든 옵션을 렌더한다', async () => {
    const { getByText } = await renderInSafeArea(
      <ActionSheet
        visible
        title="무공 분류"
        options={OPTIONS}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(getByText('무공 분류')).toBeTruthy();
    expect(getByText('검법')).toBeTruthy();
    expect(getByText('도법')).toBeTruthy();
    expect(getByText('권법')).toBeTruthy();
  });

  it('선택된 옵션에만 체크(✓)가 붙는다', async () => {
    const { getAllByText } = await renderInSafeArea(
      <ActionSheet
        visible
        options={OPTIONS}
        selected="도법"
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(getAllByText('✓')).toHaveLength(1);
  });

  it('옵션 탭 → onSelect 가 해당 옵션으로 호출', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderInSafeArea(
      <ActionSheet visible options={OPTIONS} onSelect={onSelect} onClose={() => {}} />,
    );
    fireEvent.press(getByText('권법'));
    expect(onSelect).toHaveBeenCalledWith('권법');
  });

  it('취소 탭 → onClose 호출', async () => {
    const onClose = jest.fn();
    const { getByText } = await renderInSafeArea(
      <ActionSheet visible options={OPTIONS} onSelect={() => {}} onClose={onClose} />,
    );
    fireEvent.press(getByText('취소'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
