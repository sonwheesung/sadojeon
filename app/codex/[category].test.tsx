// 화면 단위 — 무공 도감 화면(app/codex/[category]) 의 **상호작용·이벤트**(docs/40 §2-1).
// 탭 전환 → 해당 갈래 헤더·목록 렌더, 항목 선택(해금 카드) → 로컬 핸들러, 잠금 카드(?)·빈 목록 분기,
// 라우트 파라미터 초기 갈래 반영, 정렬/닫기 액션, 숨은 갈래(마공/마도) 비노출.
// 도감은 현재 placeholder 데이터 + 로컬 onPress(no-op) — 스토어/시스템 호출이 없다(그 사실을 단언).
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

// 무거운/네이티브 래퍼는 패스스루로 격리(화면 로직만 본다).
jest.mock('@/components/common/SafetyZone', () => ({ SafetyZone: ({ children }: any) => children }));
jest.mock('@/components/common/PaperCard', () => ({ PaperCard: ({ children }: any) => children }));

let mockParams: { category?: string } = {};
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: () => mockBack() },
  useLocalSearchParams: () => mockParams,
}));

import CodexScreen from './[category]';

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('무공 도감 — 라우트 파라미터 초기 갈래', () => {
  it('유효한 category 파라미터 → 해당 갈래로 시작(헤더 한글 라벨)', async () => {
    mockParams = { category: 'qigong' };
    const { getByText } = await render(<CodexScreen />);
    // '내공' 한글은 헤더+탭 양쪽에 나오므로 한자(헤더 전용)로 갈래 확인.
    expect(getByText('內功')).toBeTruthy(); // 헤더 한자
  });

  it('파라미터 없음/이상값 → 기본 갈래(검법)으로 시작', async () => {
    mockParams = { category: 'not-a-category' };
    const { getByText } = await render(<CodexScreen />);
    expect(getByText('劍法')).toBeTruthy(); // 헤더 한자(검법) — 기본 갈래
  });
});

describe('무공 도감 — 탭 전환', () => {
  it('다른 갈래 탭을 누르면 헤더가 그 갈래로 바뀐다', async () => {
    mockParams = { category: 'sword' };
    const user = userEvent.setup();
    const { getByText, getAllByText } = await render(<CodexScreen />);
    // 검법으로 시작 → 도법 탭 누름
    await user.press(getByText('도법'));
    // 헤더 한자가 도법(刀法)으로
    expect(getByText('刀法')).toBeTruthy();
    // 도법은 placeholder 항목이 없다 → 발견 0 / 22
    expect(getAllByText(/발견 0 \/ 22/).length).toBeGreaterThan(0);
  });

  it('검법(항목 있음) → 발견 5 / 25 진행도 표시', async () => {
    mockParams = { category: 'sword' };
    const { getByText } = await render(<CodexScreen />);
    expect(getByText('발견 5 / 25')).toBeTruthy();
  });
});

describe('무공 도감 — 목록 항목(해금/잠금)', () => {
  it('해금된 무공 카드는 이름·별 등급으로 렌더된다', async () => {
    mockParams = { category: 'sword' };
    const { getByText } = await render(<CodexScreen />);
    expect(getByText('청풍검법')).toBeTruthy();
    expect(getByText('백운검')).toBeTruthy();
  });

  it('잠금 카드는 이름 없이 ? 로만 표시(미해금 비공개)', async () => {
    mockParams = { category: 'sword' };
    const { getAllByText } = await render(<CodexScreen />);
    // s6~s9 잠금 4칸 → '?' 마크 다수
    expect(getAllByText('?').length).toBeGreaterThanOrEqual(4);
  });

  it('해금 카드를 눌러도 스토어/시스템 호출 없음(placeholder: 로컬 no-op만)', async () => {
    // 도감 항목 선택은 아직 상세 라우팅 미연결(void id). router.back 도 안 불린다.
    mockParams = { category: 'sword' };
    const user = userEvent.setup();
    const { getByText } = await render(<CodexScreen />);
    await user.press(getByText('청풍검법'));
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('placeholder 없는 갈래(권법) → 그리드 카드 0개(빈 목록 분기)', async () => {
    // 헤더 일러스트 placeholder 는 항상 1개(카테고리 헤더) — 그리드 카드 유무로 빈 분기 확인.
    mockParams = { category: 'fist' };
    const { queryByText, getByText } = await render(<CodexScreen />);
    expect(getByText('拳法')).toBeTruthy(); // 권법 갈래로 진입은 맞음
    expect(queryByText('?')).toBeNull(); // 잠금 카드(? 마크) 없음 → 그리드 비어 있음
    expect(getByText('발견 0 / 20')).toBeTruthy(); // 발견 0
  });
});

describe('무공 도감 — 하단 액션(정렬·닫기·뒤로)', () => {
  it('닫기 버튼 → router.back 호출', async () => {
    mockParams = { category: 'sword' };
    const user = userEvent.setup();
    const { getByText } = await render(<CodexScreen />);
    await user.press(getByText('닫기'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('뒤로 버튼 → router.back 호출', async () => {
    mockParams = { category: 'sword' };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<CodexScreen />);
    await user.press(getByLabelText('뒤로'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('정렬 버튼 → 아직 no-op(누르면 크래시 없이 back 도 안 불린다)', async () => {
    mockParams = { category: 'sword' };
    const user = userEvent.setup();
    const { getByText } = await render(<CodexScreen />);
    await user.press(getByText('정렬'));
    expect(mockBack).not.toHaveBeenCalled();
  });
});

describe('무공 도감 — 숨은변수 비노출', () => {
  it('숨은 갈래(마공/마도)는 도감 탭에 노출하지 않는다', async () => {
    // labels.ts: 마공(darkArts)은 숨은 별도라 도감 비노출. feedback_hidden_game_state.
    mockParams = { category: 'sword' };
    const { queryByText } = await render(<CodexScreen />);
    expect(queryByText('마공')).toBeNull();
    expect(queryByText('마도')).toBeNull();
  });
});
