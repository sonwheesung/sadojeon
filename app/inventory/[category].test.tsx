// 화면 단위 — 인벤토리 카테고리 화면(app/inventory/[category]) 의 **상호작용·이벤트**(docs/40 §2-1).
// 탭 전환 → 활성 카테고리 물품만 필터 렌더 + 헤더 보유수/도감총량, 항목 액션(사용) 버튼, 빈 카테고리 분기,
// 라우트 파라미터 초기 카테고리. 물품은 itemStore(DB 동기화)에서 읽으므로 useItemStore 셀렉터 mock.
// 항목 액션(handleAction)은 현재 placeholder no-op — 시스템 호출이 없다(그 사실을 단언).
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

jest.mock('@/components/common/SafetyZone', () => ({ SafetyZone: ({ children }: any) => children }));
jest.mock('@/components/common/PaperCard', () => ({ PaperCard: ({ children }: any) => children }));

let mockParams: { category?: string } = {};
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: () => mockBack() },
  useLocalSearchParams: () => mockParams,
}));

// 물품 스토어는 factory mock(실제 모듈 로드 차단 — persist→AsyncStorage 네이티브 의존 회피).
jest.mock('@/stores/itemStore', () => ({ useItemStore: jest.fn() }));
import { useItemStore } from '@/stores/itemStore';
import InventoryScreen from './[category]';

interface StoredItem {
  id: string;
  category: string;
  name: string;
  grade: number;
  count: number;
  effects: string;
}

let items: StoredItem[] = [];

function setItems(list: StoredItem[]) {
  items = list;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  items = [];
  (useItemStore as unknown as jest.Mock).mockImplementation((sel: any) => sel({ items }));
});

describe('인벤토리 — 라우트 파라미터 초기 카테고리', () => {
  it('유효한 category(scroll) → 비급 헤더로 시작', async () => {
    mockParams = { category: 'scroll' };
    const { getByText } = await render(<InventoryScreen />);
    // '비급' 한글은 헤더+탭 양쪽 → 한자(헤더 전용)로 카테고리 확인.
    expect(getByText('祕笈')).toBeTruthy(); // 헤더 한자
  });

  it('파라미터 없음/이상값 → 기본 카테고리(영약)으로 시작', async () => {
    mockParams = { category: 'nope' };
    const { getByText } = await render(<InventoryScreen />);
    expect(getByText('靈藥')).toBeTruthy(); // 헤더 한자(영약) — 기본 카테고리
  });
});

describe('인벤토리 — 카테고리 필터 + 보유수', () => {
  it('활성 카테고리(영약) 물품만 렌더하고 보유수 합산을 헤더에 표시', async () => {
    setItems([
      { id: 'e1', category: 'elixir', name: '대환단', grade: 5, count: 2, effects: '내공 대폭' },
      { id: 'e2', category: 'elixir', name: '소환단', grade: 3, count: 1, effects: '내공 소폭' },
      { id: 's1', category: 'scroll', name: '무명비급', grade: 2, count: 5, effects: '—' },
    ]);
    mockParams = { category: 'elixir' };
    const { getByText, queryByText } = await render(<InventoryScreen />);
    expect(getByText('대환단')).toBeTruthy();
    expect(getByText('소환단')).toBeTruthy();
    expect(queryByText('무명비급')).toBeNull(); // 다른 카테고리는 안 보임
    // 보유수 = 2 + 1 = 3, 도감총량(elixir)=50
    expect(getByText('보유 3 / 도감 50')).toBeTruthy();
  });

  it('탭 전환(영약→비급) → 비급 물품으로 목록·헤더 갱신', async () => {
    setItems([
      { id: 'e1', category: 'elixir', name: '대환단', grade: 5, count: 2, effects: '내공' },
      { id: 's1', category: 'scroll', name: '무명비급', grade: 2, count: 5, effects: '—' },
    ]);
    mockParams = { category: 'elixir' };
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(<InventoryScreen />);
    await user.press(getByText('비급')); // 탭
    expect(getByText('무명비급')).toBeTruthy();
    expect(queryByText('대환단')).toBeNull();
    // 비급 보유수 5, 도감총량(scroll)=80
    expect(getByText('보유 5 / 도감 80')).toBeTruthy();
  });

  it('해당 카테고리 물품 없음 → 행 0개·보유 0(빈 목록 분기)', async () => {
    setItems([{ id: 's1', category: 'scroll', name: '무명비급', grade: 2, count: 5, effects: '—' }]);
    mockParams = { category: 'elixir' };
    const { getByText, queryByText } = await render(<InventoryScreen />);
    expect(queryByText('무명비급')).toBeNull();
    expect(queryByText('사용')).toBeNull(); // 액션 버튼(=항목) 없음
    expect(getByText('보유 0 / 도감 50')).toBeTruthy();
  });
});

describe('인벤토리 — 항목 액션 버튼(placeholder no-op)', () => {
  it('각 항목에 "사용" 버튼 렌더', async () => {
    setItems([
      { id: 'e1', category: 'elixir', name: '대환단', grade: 5, count: 2, effects: '내공' },
      { id: 'e2', category: 'elixir', name: '소환단', grade: 3, count: 1, effects: '내공' },
    ]);
    mockParams = { category: 'elixir' };
    const { getAllByText } = await render(<InventoryScreen />);
    expect(getAllByText('사용').length).toBe(2);
  });

  it('사용 버튼을 눌러도 스토어 변경·router 부수효과 없음(handleAction=no-op)', async () => {
    // 사용·소비 로직은 아직 미구현(void id). 변경이라 추후 useConfirm 경유 예정.
    setItems([{ id: 'e1', category: 'elixir', name: '대환단', grade: 5, count: 2, effects: '내공' }]);
    mockParams = { category: 'elixir' };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<InventoryScreen />);
    await user.press(getByLabelText('대환단 사용'));
    expect(mockBack).not.toHaveBeenCalled();
  });
});

describe('인벤토리 — 하단 액션(닫기·뒤로)', () => {
  it('닫기 버튼 → router.back', async () => {
    mockParams = { category: 'elixir' };
    const user = userEvent.setup();
    const { getByText } = await render(<InventoryScreen />);
    await user.press(getByText('닫기'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('뒤로 버튼 → router.back', async () => {
    mockParams = { category: 'elixir' };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<InventoryScreen />);
    await user.press(getByLabelText('뒤로'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
