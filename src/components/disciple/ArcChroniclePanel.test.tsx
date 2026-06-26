// 화면 단위 — 필수 이벤트 아크 회고 두루마리. docs/47 §4·§10 E6·E9 · docs/40 §2.
// 검증: 선택 기록을 연차순 렌더 + 사부 선택 문구 + 빈 해 정직 표기 + 졸업 마무리 + 기록 없으면 미렌더.
// RNTL v14 render 는 async.
import { render } from '@testing-library/react-native';

import { ArcChroniclePanel } from './ArcChroniclePanel';
import type { ArcChoiceRecord, Disciple } from '@/types';

function mk(arcChoices: ArcChoiceRecord[] | undefined, status: Disciple['status'] = 'training'): Disciple {
  return { id: 'han-baram', name: '한바람', status, arcChoices } as unknown as Disciple;
}

const rec = (year: number, title: string, choiceLabel: string): ArcChoiceRecord => ({
  year,
  eventId: `arc-han-baram-y${year}`,
  title,
  choiceKey: 'k',
  choiceLabel,
  day: 0,
});

describe('ArcChroniclePanel (화면 단위)', () => {
  it('선택 기록을 연차·제목·사부 선택으로 렌더한다', async () => {
    const d = mk([rec(1, '야반도주(夜半逃走)', '가고 싶으면 가라 놓아준다')]);
    const { getByText } = await render(<ArcChroniclePanel disciple={d} />);
    expect(getByText('1년차')).toBeTruthy();
    expect(getByText('야반도주(夜半逃走)')).toBeTruthy();
    expect(getByText(/가고 싶으면 가라 놓아준다/)).toBeTruthy();
  });

  it('기록 없으면 아무것도 렌더하지 않는다(null)', async () => {
    const { toJSON } = await render(<ArcChroniclePanel disciple={mk([])} />);
    expect(toJSON()).toBeNull();
    const { toJSON: t2 } = await render(<ArcChroniclePanel disciple={mk(undefined)} />);
    expect(t2()).toBeNull();
  });

  it('빈 해(기록 사이 공백)는 "조용히 지나갔다"로 정직 표기 — E6', async () => {
    // 1년차·3년차만 기록 → 2년차는 빈 해.
    const d = mk([rec(1, '첫 밤', 'A'), rec(3, '차가운 눈', 'B')]);
    const { getByText } = await render(<ArcChroniclePanel disciple={d} />);
    expect(getByText('2년차')).toBeTruthy();
    expect(getByText(/조용히 지나갔다/)).toBeTruthy();
  });

  it('졸업한 제자는 마무리 문구가 붙는다 — E9', async () => {
    const d = mk([rec(1, '첫 밤', 'A')], 'graduated');
    const { getByText } = await render(<ArcChroniclePanel disciple={d} />);
    expect(getByText(/이 길을 걸어 산을 내려갔다/)).toBeTruthy();
  });
});
