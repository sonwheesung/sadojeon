// 화면 단위 테스트 — 제자 풍경 텍스트 패널. 렌더 + 표시 규칙(숨은변수 비노출).
// 통찰 차등으로 숨겨진 축을 텍스트로만 노출(docs/03). 숫자·확률·내부 라벨 직접 노출 금지
// (feedback_hidden_game_state). docs/40 §2. RNTL v14 render 는 async.
import { render } from '@testing-library/react-native';

import { MoodPanel } from './MoodPanel';

describe('MoodPanel (화면 단위)', () => {
  it('전달된 풍경 텍스트 줄들을 각각 렌더한다', async () => {
    const lines = ['고집이 세 보인다', '동문과 거리를 둔다', '검에 손이 빠르다'] as const;
    const { getByText } = await render(<MoodPanel lines={lines} />);
    // 컴포넌트가 앞에 "· " 를 붙이므로 부분 일치로 검증.
    expect(getByText(/고집이 세 보인다/)).toBeTruthy();
    expect(getByText(/동문과 거리를 둔다/)).toBeTruthy();
    expect(getByText(/검에 손이 빠르다/)).toBeTruthy();
  });

  it('빈 배열이면 아무 줄도 렌더하지 않는다(조건부 렌더)', async () => {
    const { queryByText } = await render(<MoodPanel lines={[]} />);
    expect(queryByText(/·/)).toBeNull();
  });

  it('숨은변수 비노출 — 풍경은 문장으로만, 숫자/확률(%)을 렌더하지 않는다', async () => {
    // 흑화·심마·효율 등 내부 게이지는 풍경 문구로만 표현되어야 한다.
    const lines = ['마음에 그늘이 비친다', '벽 앞에 선 듯하다'] as const;
    const { queryByText } = await render(<MoodPanel lines={lines} />);
    expect(queryByText(/\d+\s*%/)).toBeNull();
  });
});
