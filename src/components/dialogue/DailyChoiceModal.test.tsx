// 화면 단위 — 오늘의 수련(DailyChoiceModal) 상호작용·요청 (docs/40 §2-1).
// 카테고리별 세부 종목 선택지 버튼 → 진행 시 setDailyChoice(제자×카테고리×종목) 호출,
// 취소 → 미저장, 휴식·임시명령·졸업/하산 제자 제외, 무공일 대련 상대 종목 노출.
// 스토어/시스템은 mock(화면 단위 격리). data/training·types/training 은 순수 데이터라 실모듈 사용.
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { DailyChoiceModal } from './DailyChoiceModal';
import { categoryFor, useScheduleStore } from '@/stores/scheduleStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { activeOverrideOf } from '@/systems/overrideSystem';
import type { Disciple } from '@/types';

// SafeArea insets — 네이티브 모듈 없이 0 반환.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// 스토어/시스템 — 깊은 import(AsyncStorage·전투엔진) 차단 위해 팩토리로 명시.
const setDailyChoice = jest.fn();
const scheduleState = {
  schedule: { weeklyPattern: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'], monthlyQuests: 0 },
  individualPatterns: {} as Record<string, string[]>,
  dailyChoice: {} as Record<string, Record<string, string>>,
  setDailyChoice,
};
jest.mock('@/stores/scheduleStore', () => {
  // categoryFor 는 실로직 재현(개인 패턴 우선, 없으면 사문). day:1~7.
  const categoryFor = (
    store: { schedule: { weeklyPattern: string[] }; individualPatterns: Record<string, string[]> },
    discipleId: string,
    day: number,
  ) => {
    const idx = Math.max(0, Math.min(6, day - 1));
    const pattern = store.individualPatterns[discipleId] ?? store.schedule.weeklyPattern;
    return pattern[idx] ?? 'rest';
  };
  const useScheduleStore = Object.assign(
    (sel: (s: typeof mockScheduleState) => unknown) => sel(mockScheduleState),
    { getState: () => mockScheduleState },
  );
  return { categoryFor, useScheduleStore };
});

const discipleState = { order: [] as string[], disciples: {} as Record<string, Disciple> };
jest.mock('@/stores/discipleStore', () => ({
  useDiscipleStore: (sel: (s: typeof mockDiscipleState) => unknown) => sel(mockDiscipleState),
}));

jest.mock('@/stores/timeStore', () => ({
  useTimeStore: (sel: (s: { current: { day: number } }) => unknown) => sel(mockTimeState),
}));

jest.mock('@/systems/overrideSystem', () => ({
  activeOverrideOf: jest.fn(() => null),
}));
jest.mock('@/systems/daeryeonSystem', () => ({
  daeryeonChoiceValue: (id: string) => `daeryeon:${id}`,
}));

// mock 팩토리는 mock* 접두사 변수만 참조 가능 → 상태 객체를 그 이름으로 노출.
const mockScheduleState = scheduleState;
const mockDiscipleState = discipleState;
const mockTimeState = { current: { day: 1 } };

const onConfirm = jest.fn();
const onCancel = jest.fn();

function disciple(id: string, name: string, extra: Partial<Disciple> = {}): Disciple {
  return { id, name, status: 'training', ...extra } as Disciple;
}

// upcomingDay(day)=(day%7)+1. day=1 → target 2 → individualPattern[idx1].
function setup(opts: {
  order: string[];
  disciples: Record<string, Disciple>;
  patterns?: Record<string, string[]>;
  dailyChoice?: Record<string, Record<string, string>>;
}) {
  discipleState.order = opts.order;
  discipleState.disciples = opts.disciples;
  scheduleState.individualPatterns = opts.patterns ?? {};
  scheduleState.dailyChoice = opts.dailyChoice ?? {};
}

beforeEach(() => {
  setDailyChoice.mockReset();
  onConfirm.mockReset();
  onCancel.mockReset();
  (activeOverrideOf as jest.Mock).mockReset().mockReturnValue(null);
  mockTimeState.current.day = 1; // target day = 2 → 패턴 idx 1
});

// idx1 칸을 원하는 카테고리로 두는 개인 패턴.
const patternWith = (cat: string): string[] => ['rest', cat, 'rest', 'rest', 'rest', 'rest', 'rest'];

describe('DailyChoiceModal — 종목 선택 → 진행 저장', () => {
  it('체력일 제자 → 종목 버튼 누르면 진행 시 setDailyChoice(id, physical, 종목)', async () => {
    setup({
      order: ['d1'],
      disciples: { d1: disciple('d1', '장철') },
      patterns: { d1: patternWith('physical') },
    });
    const user = userEvent.setup();
    const { getByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    // 체력 종목 풀의 한 항목을 골라 누른다(기본값 phys_run 과 다른 것).
    await user.press(getByText('암벽등반'));
    await user.press(getByText('진행 ▶'));
    expect(setDailyChoice).toHaveBeenCalledWith('d1', 'physical', 'phys_climb');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('아무것도 안 누르면 기본값(카테고리 첫 종목)으로 저장', async () => {
    setup({
      order: ['d1'],
      disciples: { d1: disciple('d1', '장철') },
      patterns: { d1: patternWith('physical') },
    });
    const user = userEvent.setup();
    const { getByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    await user.press(getByText('진행 ▶'));
    // physical 풀 첫 종목 = phys_run (defaultOptionFor).
    expect(setDailyChoice).toHaveBeenCalledWith('d1', 'physical', 'phys_run');
  });

  it('취소 → setDailyChoice 미호출 + onCancel', async () => {
    setup({
      order: ['d1'],
      disciples: { d1: disciple('d1', '장철') },
      patterns: { d1: patternWith('physical') },
    });
    const user = userEvent.setup();
    const { getByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    await user.press(getByText('취소'));
    expect(setDailyChoice).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('DailyChoiceModal — 제외 규칙', () => {
  it('휴식일 제자만 있으면 "선택할 수련 없다" + 진행 시 setDailyChoice 미호출', async () => {
    setup({
      order: ['d1'],
      disciples: { d1: disciple('d1', '장철') },
      patterns: { d1: patternWith('rest') },
    });
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(getByText('오늘 선택할 수련이 없다. (휴식·명령 중)')).toBeTruthy();
    expect(queryByText('장철')).toBeNull();
    await user.press(getByText('진행 ▶'));
    expect(setDailyChoice).not.toHaveBeenCalled();
  });

  it('임시명령(폐관 등) 제자 제외 — 행으로 안 나온다', async () => {
    (activeOverrideOf as jest.Mock).mockReturnValue({ command: 'seclusion' });
    setup({
      order: ['d1'],
      disciples: { d1: disciple('d1', '장철') },
      patterns: { d1: patternWith('physical') },
    });
    const { getByText, queryByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(getByText('오늘 선택할 수련이 없다. (휴식·명령 중)')).toBeTruthy();
    expect(queryByText('장철')).toBeNull();
  });

  it('졸업·하산 제자 제외', async () => {
    setup({
      order: ['d1', 'd2'],
      disciples: {
        d1: disciple('d1', '장철', { status: 'graduated' }),
        d2: disciple('d2', '진소화'),
      },
      patterns: { d1: patternWith('physical'), d2: patternWith('physical') },
    });
    const { getByText, queryByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(getByText('진소화')).toBeTruthy();
    expect(queryByText('장철')).toBeNull();
  });

  // R47: 파견(채집·출행=questing)·연단(crafting)·부상(injured)은 override 없이 status 만 직접 세팅된다.
  // tickDailyTraining 이 이들을 수련에서 제외하므로 모달도 행으로 보이면 안 된다(고른 종목이 조용히 무시됨 = 사각 ⑪).
  it.each(['questing', 'crafting', 'injured'] as const)(
    'override 없이 status=%s 인 제자 제외 — 행으로 안 나온다(고를 게 없음)',
    async (status) => {
      setup({
        order: ['d1', 'd2'],
        disciples: {
          d1: disciple('d1', '장철', { status }),
          d2: disciple('d2', '진소화'),
        },
        patterns: { d1: patternWith('physical'), d2: patternWith('physical') },
      });
      const { getByText, queryByText } = await render(
        <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
      );
      expect(getByText('진소화')).toBeTruthy();
      expect(queryByText('장철')).toBeNull();
    },
  );
});

describe('DailyChoiceModal — 무공일 대련 상대 선택지', () => {
  it('무공일 두 제자 → 서로 "대련 — 상대" 선택지 노출, 고르면 daeryeon 값 저장', async () => {
    setup({
      order: ['d1', 'd2'],
      disciples: { d1: disciple('d1', '장철'), d2: disciple('d2', '진소화') },
      patterns: { d1: patternWith('martial'), d2: patternWith('martial') },
    });
    const user = userEvent.setup();
    const { getByText } = await render(
      <DailyChoiceModal visible onCancel={onCancel} onConfirm={onConfirm} />,
    );
    // d1 행에는 d2 와의 대련 선택지가 있어야 한다.
    await user.press(getByText('대련 — 진소화'));
    await user.press(getByText('진행 ▶'));
    expect(setDailyChoice).toHaveBeenCalledWith('d1', 'martial', 'daeryeon:d2');
    // d2 의 무공 기본값은 초식(chosik).
    expect(setDailyChoice).toHaveBeenCalledWith('d2', 'martial', 'chosik');
  });
});
