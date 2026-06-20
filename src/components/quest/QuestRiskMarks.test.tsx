// 화면 단위 테스트 — 의뢰 위험 마크 컴포넌트. 렌더 + 표시 규칙(숨은변수 비노출) 검증.
// docs/40 §2 화면 단위. RNTL v14는 render 가 async(Promise) — await 필수. 실행: npm test
import { render } from '@testing-library/react-native';

import { QuestRiskMarks } from './QuestRiskMarks';

describe('QuestRiskMarks (화면 단위)', () => {
  it('위험 없음(menial) → "안전"만 표시', async () => {
    const { getByText, queryByText } = await render(<QuestRiskMarks grade="menial" />);
    expect(getByText('● 안전')).toBeTruthy();
    expect(queryByText('● 사망')).toBeNull();
  });

  it('사망 가능(extreme) → 부상·치명상·사망 3마크', async () => {
    const { getByText, queryByText } = await render(<QuestRiskMarks grade="extreme" />);
    expect(getByText('● 부상')).toBeTruthy();
    expect(getByText('● 치명상')).toBeTruthy();
    expect(getByText('● 사망')).toBeTruthy();
    expect(queryByText('● 안전')).toBeNull();
  });

  it('부상 가능(normal) → 부상만, 사망 마크 없음', async () => {
    const { getByText, queryByText } = await render(<QuestRiskMarks grade="normal" />);
    expect(getByText('● 부상')).toBeTruthy();
    expect(queryByText('● 사망')).toBeNull();
  });

  it('숨은변수 비노출 — 정확 확률(숫자 %)을 렌더하지 않는다', async () => {
    const { queryByText } = await render(<QuestRiskMarks grade="extreme" />);
    // feedback_hidden_game_state: 색·라벨로만 위험 종류 표기, 정확 확률 숫자 노출 금지.
    expect(queryByText(/\d+\s*%/)).toBeNull();
  });
});
