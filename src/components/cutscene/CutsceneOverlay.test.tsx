// 화면 단위 — 컷씬 오버레이(CutsceneOverlay)의 렌더·탭 진행·미디어/그레이박스 분기 (docs/40 §2-1).
// 컷씬 텍스트(이름·서사·인용·사건명·한자) 렌더, 탭(계속)→pop 1회, 미디어 등록 시 이미지 / 미등록 시
// 그레이박스 자리, 큐 비면 숨김. 스토어(cutsceneStore)·미디어 조회(findCutsceneMedia)·네이티브(haptics·image)는 mock.
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { CutsceneOverlay } from './CutsceneOverlay';
import { useCutsceneStore } from '@/stores/cutsceneStore';
import { findCutsceneMedia } from '@/data/cutscenes/media';
import type { PlayingCutscene } from '@/stores/cutsceneStore';

// 스토어·미디어 조회 — 깊은 import 차단 위해 팩토리로 명시.
jest.mock('@/stores/cutsceneStore', () => ({ useCutsceneStore: jest.fn() }));
jest.mock('@/data/cutscenes/media', () => ({ findCutsceneMedia: jest.fn() }));

// 네이티브 모듈 — haptics 는 no-op, expo-image 는 testID 가진 더미 View.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Heavy: 'heavy' },
}));
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: Record<string, unknown>) => <View testID="cutscene-image" {...props} /> };
});

const pop = jest.fn();
let queue: PlayingCutscene[] = [];

function cutscene(overrides: Partial<PlayingCutscene> = {}): PlayingCutscene {
  return {
    id: 'cs1',
    eventId: 'breakthrough',
    discipleId: 'd1',
    discipleName: '장철',
    hanzi: '頓悟',
    title: '깨달음',
    tone: 'gold',
    line: '장철이 검을 멈추고 가만히 눈을 감는다.',
    quote: '이제야 보인다.',
    ...overrides,
  };
}

beforeEach(() => {
  pop.mockReset();
  (findCutsceneMedia as jest.Mock).mockReset().mockReturnValue(undefined); // 기본 미등록(그레이박스)
  queue = [cutscene()];
  (useCutsceneStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: { queue: PlayingCutscene[]; pop: jest.Mock }) => unknown) => sel({ queue, pop }),
  );
});

describe('CutsceneOverlay — 텍스트 렌더', () => {
  it('이름·서사·인용·사건명·한자가 렌더된다', async () => {
    const { getByText } = await render(<CutsceneOverlay />);
    expect(getByText('장철')).toBeTruthy();
    expect(getByText('장철이 검을 멈추고 가만히 눈을 감는다.')).toBeTruthy();
    expect(getByText('「이제야 보인다.」')).toBeTruthy();
    expect(getByText('깨달음')).toBeTruthy();
    expect(getByText('頓悟')).toBeTruthy();
    expect(getByText('탭하여 계속 ▶')).toBeTruthy();
  });

  it('quote 없으면 인용 블록은 렌더 안 된다', async () => {
    queue = [cutscene({ quote: undefined })];
    const { queryByText } = await render(<CutsceneOverlay />);
    expect(queryByText('「이제야 보인다.」')).toBeNull();
  });

  it('eventId/discipleId 같은 내부 키는 그레이박스 자리표시에만(본문 노출 X)', async () => {
    const { queryAllByText } = await render(<CutsceneOverlay />);
    // 자막 본문에는 사건/제자 식별자가 직접 나오지 않는다.
    expect(queryAllByText('breakthrough').length).toBeLessThanOrEqual(1);
  });
});

describe('CutsceneOverlay — 미디어 / 그레이박스 분기', () => {
  it('미디어 미등록 → 그레이박스 자리표시(이미지 없음)', async () => {
    const { queryByTestId, getByText } = await render(<CutsceneOverlay />);
    expect(queryByTestId('cutscene-image')).toBeNull();
    // 그레이박스 라벨에 eventId/discipleId 가 보인다.
    expect(getByText('(모션 컷 자리 — breakthrough/d1)')).toBeTruthy();
  });

  it('미디어 등록(letterbox) → 이미지 렌더', async () => {
    (findCutsceneMedia as jest.Mock).mockReturnValue({ source: 1, fit: 'contain' });
    const { getByTestId } = await render(<CutsceneOverlay />);
    expect(getByTestId('cutscene-image')).toBeTruthy();
  });

  it('미디어 등록(cover/쇼츠) → 풀스크린 이미지 + 자막', async () => {
    (findCutsceneMedia as jest.Mock).mockReturnValue({ source: 2, fit: 'cover' });
    const { getByTestId, getByText } = await render(<CutsceneOverlay />);
    expect(getByTestId('cutscene-image')).toBeTruthy();
    expect(getByText('장철이 검을 멈추고 가만히 눈을 감는다.')).toBeTruthy();
  });
});

describe('CutsceneOverlay — 탭 진행 / 빈 큐', () => {
  it('탭(컷씬 계속) → pop 1회', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = await render(<CutsceneOverlay />);
    await user.press(getByLabelText('컷씬 계속'));
    expect(pop).toHaveBeenCalledTimes(1);
  });

  it('큐가 비면 아무 컷씬도 렌더하지 않는다', async () => {
    queue = [];
    const { queryByText } = await render(<CutsceneOverlay />);
    expect(queryByText('탭하여 계속 ▶')).toBeNull();
    expect(queryByText('장철')).toBeNull();
  });
});
