// 화면 단위 테스트 — 무공 헤더. 이름/갈래 렌더 + 등급→별(★/☆) 표시 규칙. docs/40 §2.
import { render } from '@testing-library/react-native';

import { MartialArtHeader } from './MartialArtHeader';

describe('MartialArtHeader (화면 단위)', () => {
  it('한글·한자 이름과 갈래를 렌더', async () => {
    const { getByText } = await render(
      <MartialArtHeader name="태청검법" hanjaName="太淸劍法" school="검법" grade={3} />,
    );
    expect(getByText('太淸劍法')).toBeTruthy();
    expect(getByText('태청검법')).toBeTruthy();
    expect(getByText('— 검법 —')).toBeTruthy();
  });

  it('등급 3 → ★ 3개 + ☆ 2개(별 5칸)로 표기', async () => {
    const { getByText } = await render(
      <MartialArtHeader name="x" hanjaName="x" school="검법" grade={3} />,
    );
    expect(getByText('★★★☆☆')).toBeTruthy();
  });

  it('신품(등급 5) → ★ 5개로 가득 참', async () => {
    const { getByText } = await render(
      <MartialArtHeader name="x" hanjaName="x" school="검법" grade={5} />,
    );
    expect(getByText('★★★★★')).toBeTruthy();
  });
});
