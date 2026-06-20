// 화면 단위 테스트 — 무공 숙련 4밴드 노드 트리. 단계 라벨 렌더 + 도달 분기. docs/40 §2.
// 입문→소성→대성→극성 (성 1~10 파생, docs/26). 경지(화경/초절정)는 무공 단계가 아님 — 비노출.
import { render } from '@testing-library/react-native';

import { StageTree } from './StageTree';

describe('StageTree (화면 단위)', () => {
  it('4밴드 단계 라벨을 모두 렌더', async () => {
    const { getByText } = await render(<StageTree current="small_completion" />);
    for (const label of ['입문', '소성', '대성', '극성']) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('무공 단계 트리에 사람의 경지(화경·초절정)는 섞이지 않는다', async () => {
    // docs/26: 화경·초절정은 무공 단계가 아니라 사람의 경지(docs/23)로 분리.
    const { queryByText } = await render(<StageTree current="ultimate" />);
    expect(queryByText('화경')).toBeNull();
    expect(queryByText('초절정')).toBeNull();
  });

  it('극성(ultimate)도 정상 렌더(최상 단계 분기)', async () => {
    const { getByText } = await render(<StageTree current="ultimate" />);
    expect(getByText('극성')).toBeTruthy();
  });
});
