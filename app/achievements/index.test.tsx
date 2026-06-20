// 화면 단위 — 업적 목록 화면(app/achievements) 의 **표시 규칙·상호작용**(docs/40 §2-1).
// 카테고리 섹션 렌더, 달성(✓)·미달성(·) 구분, 달성률 카운트, 숨김 업적 마스킹(미달성 시 ??? + 조건 가림),
// 달성 시 숨김 해제, 뒤로 버튼, 그리고 **숨은변수 비노출**(마도/천마/흑화 등 숨김 업적은 미달성 시 정체 가림).
// 달성 목록은 achievementStore.unlocked 셀렉터 → mock 으로 주입. 데이터는 실제 ACHIEVEMENTS 사용.
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

jest.mock('@/components/common/SafetyZone', () => ({ SafetyZone: ({ children }: any) => children }));
jest.mock('@/components/common/PaperCard', () => ({ PaperCard: ({ children }: any) => children }));
// SectionLabel 은 asset require(expo-image) 끌어옴 → 텍스트 패스스루로 격리.
jest.mock('@/components/common/SectionLabel', () => {
  const { Text } = require('react-native');
  return { SectionLabel: ({ children }: any) => <Text>{children}</Text> };
});

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ router: { back: () => mockBack() } }));

jest.mock('@/stores/achievementStore', () => ({ useAchievementStore: jest.fn() }));
import { useAchievementStore } from '@/stores/achievementStore';
import { ACHIEVEMENTS } from '@/data/achievements';
import AchievementsScreen from './index';

let unlocked: string[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  unlocked = [];
  (useAchievementStore as unknown as jest.Mock).mockImplementation((sel: any) => sel({ unlocked }));
});

const TOTAL = ACHIEVEMENTS.length;

describe('업적 화면 — 카테고리·달성률', () => {
  it('카테고리 섹션 라벨(무도·마음·활동·직업·졸업·강호·의뢰)을 모두 렌더', async () => {
    const { getByText } = await render(<AchievementsScreen />);
    for (const label of ['무도', '마음', '활동', '직업·졸업', '강호', '의뢰']) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('미달성 0/전체 카운트 표시', async () => {
    unlocked = [];
    const { getByText } = await render(<AchievementsScreen />);
    expect(getByText(`0/${TOTAL}`)).toBeTruthy();
  });

  it('일부 달성 → 달성수/전체 카운트 갱신', async () => {
    unlocked = ['ach-jeoljeong', 'ach-graduate'];
    const { getByText } = await render(<AchievementsScreen />);
    expect(getByText(`2/${TOTAL}`)).toBeTruthy();
  });
});

describe('업적 화면 — 달성/미달성 표시', () => {
  it('달성 업적은 ✓ 접두 + 이름 노출', async () => {
    unlocked = ['ach-jeoljeong']; // 절정 고수(공개 업적)
    const { getByText } = await render(<AchievementsScreen />);
    expect(getByText(/✓ .*절정 고수/)).toBeTruthy();
  });

  it('미달성 공개 업적은 · 접두 + 이름·설명 노출', async () => {
    unlocked = [];
    const { getByText } = await render(<AchievementsScreen />);
    // 절정 고수는 hidden=false → 미달성이어도 이름·설명 공개
    expect(getByText(/· .*절정 고수/)).toBeTruthy();
    expect(getByText('제자가 절정에 오르다')).toBeTruthy();
  });

  it('공개 업적의 보상 문구를 노출', async () => {
    unlocked = [];
    const { getAllByText } = await render(<AchievementsScreen />);
    // 보상 문구는 공개 업적들에 표시된다(여러 업적이 같은 보상 라벨을 공유 → getAllByText).
    expect(getAllByText('다이아 소량 · 도감').length).toBeGreaterThan(0);
  });
});

describe('업적 화면 — 숨김 업적 마스킹', () => {
  it('미달성 숨김 업적은 "??? (숨은 업적)" + "조건은 달성 후 공개된다."', async () => {
    unlocked = [];
    const { getAllByText } = await render(<AchievementsScreen />);
    // 숨김 업적 다수(흑화·천마·마교 호법 등) → 마스킹 라벨이 여러 번
    expect(getAllByText(/\?\?\? \(숨은 업적\)/).length).toBeGreaterThan(0);
    expect(getAllByText('조건은 달성 후 공개된다.').length).toBeGreaterThan(0);
  });

  it('달성한 숨김 업적은 정체(이름·설명)가 공개된다', async () => {
    unlocked = ['ach-blackened']; // hidden=true, 달성 → 공개
    const { getByText } = await render(<AchievementsScreen />);
    expect(getByText(/✓ .*어둠에 삼켜지다/)).toBeTruthy();
    expect(getByText('제자 흑화 최대 단계')).toBeTruthy();
  });
});

describe('업적 화면 — 숨은변수 비노출(미달성 숨김 업적의 정체 가림)', () => {
  // feedback_hidden_game_state: 마공/마도 갈래·흑화 같은 내부 로직은 미달성 시 정체를 드러내지 않는다.
  const HIDDEN_SECRETS: { id: string; name: string; desc: string }[] = [
    { id: 'ach-demon-god', name: '천마(天魔)', desc: '제자를 마(魔)의 정점, 천마로 졸업시키다' },
    { id: 'ach-blackened', name: '어둠에 삼켜지다', desc: '제자 흑화 최대 단계' },
    { id: 'ach-demon-protector', name: '마교 호법(魔敎護法)', desc: '흑화한 제자를 마교 호법으로 졸업시키다' },
  ];

  it('미달성이면 천마·흑화·마교 등 숨김 업적 이름·설명을 노출하지 않는다', async () => {
    unlocked = []; // 아무것도 달성 안 함
    const { queryByText } = await render(<AchievementsScreen />);
    for (const s of HIDDEN_SECRETS) {
      // 데이터 정합성: 실제로 hidden 인 항목만 검사
      const ach = ACHIEVEMENTS.find((a) => a.id === s.id);
      expect(ach?.hidden).toBe(true);
      expect(queryByText(new RegExp(s.name.replace(/[()]/g, '\\$&')))).toBeNull();
      expect(queryByText(s.desc)).toBeNull();
    }
  });

  it('해금 무공서(천마신공 등) 같은 내부 보상도 미달성 숨김 업적에선 노출되지 않는다', async () => {
    unlocked = [];
    const { queryByText } = await render(<AchievementsScreen />);
    // 천마신공 해금 문구는 천마(숨김·미달성) 보상 → 마스킹되어 안 보여야
    expect(queryByText(/천마신공 해금/)).toBeNull();
  });
});

describe('업적 화면 — 뒤로', () => {
  it('뒤로(‹) 버튼 → router.back', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<AchievementsScreen />);
    await user.press(getByText('‹'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
