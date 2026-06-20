// 화면 단위 — 장비 슬롯 상세 화면(app/equipment/[slot]) 의 **상호작용·이벤트**(docs/40 §2-1).
// ⚠️ 장비는 현재 전면 placeholder다 — 장착 핸들러(handleEquip)는 no-op(void id), 기계적 효과(스탯 변경·
// 스토어 반영)가 아직 없다. 따라서 "장착 버튼 → equip 시스템 함수 인자" 단언은 불가 → 그 사실을 단언한다
// (장착 눌러도 스토어/시스템·router 부수효과 없음). 해제·닫기·뒤로는 router.back 으로만 연결돼 있어 그것을 검증.
// 라우트 파라미터(slot)별 장착품/후보 렌더, 빈 슬롯(미장착) 분기를 검증.
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

jest.mock('@/components/common/SafetyZone', () => ({ SafetyZone: ({ children }: any) => children }));
jest.mock('@/components/common/PaperCard', () => ({ PaperCard: ({ children }: any) => children }));

let mockParams: { slot?: string } = {};
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: () => mockBack() },
  useLocalSearchParams: () => mockParams,
}));

import EquipmentScreen from './[slot]';

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('장비 슬롯 — 라우트 파라미터(슬롯) 반영', () => {
  it('weapon 슬롯 → 무구 타이틀 + 장착품(청룡검) + 후보 목록 렌더', async () => {
    mockParams = { slot: 'weapon' };
    const { getByText, getAllByText } = await render(<EquipmentScreen />);
    expect(getByText('무구')).toBeTruthy(); // 헤더 슬롯 라벨
    expect(getAllByText('청룡검').length).toBeGreaterThan(0); // 장착품 + 후보 행
    expect(getByText('철검')).toBeTruthy(); // 후보
    expect(getByText('목검')).toBeTruthy();
  });

  it('파라미터 없음/이상값 → 기본 슬롯(무구)으로 시작', async () => {
    mockParams = { slot: 'not-a-slot' };
    const { getByText } = await render(<EquipmentScreen />);
    expect(getByText('무구')).toBeTruthy();
  });

  it('후보 placeholder 없는 슬롯(상의) → 미장착 + 후보 0(빈 목록 분기)', async () => {
    mockParams = { slot: 'top' };
    const { getByText, queryByText } = await render(<EquipmentScreen />);
    expect(getByText('상의')).toBeTruthy(); // 슬롯 라벨
    expect(getByText('미장착')).toBeTruthy(); // 빈 장착 fallback
    expect(queryByText('장착')).toBeNull(); // 후보 행 없음 → 장착 버튼 없음
  });
});

describe('장비 슬롯 — 장착 버튼(placeholder: 기계 효과 없음)', () => {
  it('장착 버튼이 후보마다 렌더된다', async () => {
    mockParams = { slot: 'weapon' };
    const { getAllByText } = await render(<EquipmentScreen />);
    // 후보 5종 → 장착 버튼 5개
    expect(getAllByText('장착').length).toBe(5);
  });

  it('장착 버튼을 눌러도 스토어/시스템·router 부수효과 없음(handleEquip=no-op)', async () => {
    // 장비는 아직 placeholder — 장착이 실제 상태를 바꾸지 않는다. equip 시스템 함수 자체가 없음.
    mockParams = { slot: 'weapon' };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<EquipmentScreen />);
    await user.press(getByLabelText('철검 장착'));
    expect(mockBack).not.toHaveBeenCalled(); // 라우팅·기타 부수효과 없음
  });
});

describe('장비 슬롯 — 해제·닫기·뒤로(router.back)', () => {
  it('해제 버튼 → router.back 호출(현재 해제=뒤로만 연결)', async () => {
    mockParams = { slot: 'weapon' };
    const user = userEvent.setup();
    const { getByText } = await render(<EquipmentScreen />);
    await user.press(getByText('해제'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼 → router.back 호출', async () => {
    mockParams = { slot: 'weapon' };
    const user = userEvent.setup();
    const { getByText } = await render(<EquipmentScreen />);
    await user.press(getByText('닫기'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('뒤로 버튼 → router.back 호출', async () => {
    mockParams = { slot: 'weapon' };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<EquipmentScreen />);
    await user.press(getByLabelText('뒤로'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
