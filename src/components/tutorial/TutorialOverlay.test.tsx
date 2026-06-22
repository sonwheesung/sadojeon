// 화면 단위 — 튜토리얼 카드 오버레이의 단계 진행·종료 콜백(docs/40 §2-1, docs/44).
// 첫 카드 노출 → [다음] 누적 진행 → 마지막 [알겠습니다]/[건너뛰기] 가 onDone 1회 호출.
// 카드는 실제 TUTORIALS 데이터(alchemy 3장) 사용 — 데이터-컴포넌트 정합 동시 검증.
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { TUTORIALS } from '@/data/tutorials';
import { TutorialOverlay } from './TutorialOverlay';

const CARDS = TUTORIALS.alchemy.cards;
const FIRST = CARDS[0];
const LAST = CARDS[CARDS.length - 1];

describe('튜토리얼 오버레이 — 단계 진행', () => {
  it('첫 카드 제목·본문을 노출', async () => {
    const { getByText } = await render(<TutorialOverlay cards={CARDS} onDone={jest.fn()} />);
    expect(getByText(FIRST.title)).toBeTruthy();
    expect(getByText(FIRST.body)).toBeTruthy();
  });

  it('[다음]을 끝까지 누르면 마지막 카드 → [알겠습니다] 노출', async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(<TutorialOverlay cards={CARDS} onDone={jest.fn()} />);
    for (let i = 0; i < CARDS.length - 1; i++) {
      await user.press(getByText('다음 ▶'));
    }
    expect(getByText(LAST.title)).toBeTruthy();
    expect(getByText('알겠습니다 ▶')).toBeTruthy();
    expect(queryByText('다음 ▶')).toBeNull();
  });

  it('마지막 [알겠습니다] → onDone 1회', async () => {
    const onDone = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(<TutorialOverlay cards={CARDS} onDone={onDone} />);
    for (let i = 0; i < CARDS.length - 1; i++) {
      await user.press(getByText('다음 ▶'));
    }
    await user.press(getByText('알겠습니다 ▶'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('튜토리얼 오버레이 — 건너뛰기', () => {
  it('첫 카드에서 [건너뛰기] → onDone 1회(즉시 종료)', async () => {
    const onDone = jest.fn();
    const user = userEvent.setup();
    const { getByText } = await render(<TutorialOverlay cards={CARDS} onDone={onDone} />);
    await user.press(getByText('건너뛰기'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
