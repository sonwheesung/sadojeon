// 화면 단위 테스트 — 변경 행동 확인창(ConfirmProvider + useConfirm).
// 확인창 등장 + 확정/취소 버튼 동작(promise resolve) 검증. docs/40 §2, feedback_confirm_on_mutations.
// RNTL v14는 render 가 async — await 필수. 실행: npx jest src/components/common
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { ConfirmProvider, useConfirm, type ConfirmOptions } from './ConfirmDialog';

// useConfirm() 을 띄우고 resolve 결과를 화면에 찍는 테스트용 하니스.
function Harness({ options }: { options: ConfirmOptions }) {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>('');
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="열기"
        onPress={async () => {
          const ok = await confirm(options);
          setResult(ok ? '결과:true' : '결과:false');
        }}
      >
        <Text>열기</Text>
      </Pressable>
      {result ? <Text>{result}</Text> : null}
    </>
  );
}

function renderWithProvider(options: ConfirmOptions) {
  return render(
    <ConfirmProvider>
      <Harness options={options} />
    </ConfirmProvider>,
  );
}

describe('ConfirmDialog (화면 단위)', () => {
  it('처음엔 확인창이 안 보인다(title 미렌더)', async () => {
    await renderWithProvider({ title: '저장할까요?' });
    expect(screen.queryByText('저장할까요?')).toBeNull();
  });

  it('confirm() 호출 → 제목·메시지·기본 라벨(취소/확정) 노출', async () => {
    await renderWithProvider({ title: '저장할까요?', message: '되돌릴 수 없습니다.' });
    fireEvent.press(screen.getByText('열기'));
    await waitFor(() => expect(screen.getByText('저장할까요?')).toBeTruthy());
    expect(screen.getByText('되돌릴 수 없습니다.')).toBeTruthy();
    expect(screen.getByText('취소')).toBeTruthy();
    expect(screen.getByText('확정 ▶')).toBeTruthy();
  });

  it('확정 버튼 → promise 가 true 로 resolve', async () => {
    await renderWithProvider({ title: '삭제할까요?', tone: 'danger' });
    fireEvent.press(screen.getByText('열기'));
    await waitFor(() => expect(screen.getByText('삭제할까요?')).toBeTruthy());
    fireEvent.press(screen.getByText('확정 ▶'));
    await waitFor(() => expect(screen.getByText('결과:true')).toBeTruthy());
  });

  it('취소 버튼 → promise 가 false 로 resolve', async () => {
    await renderWithProvider({ title: '삭제할까요?' });
    fireEvent.press(screen.getByText('열기'));
    await waitFor(() => expect(screen.getByText('삭제할까요?')).toBeTruthy());
    fireEvent.press(screen.getByText('취소'));
    await waitFor(() => expect(screen.getByText('결과:false')).toBeTruthy());
  });

  it('커스텀 라벨을 반영한다', async () => {
    await renderWithProvider({
      title: '회차를 종료할까요?',
      confirmLabel: '종료',
      cancelLabel: '계속',
    });
    fireEvent.press(screen.getByText('열기'));
    await waitFor(() => expect(screen.getByText('종료 ▶')).toBeTruthy());
    expect(screen.getByText('계속')).toBeTruthy();
  });
});
