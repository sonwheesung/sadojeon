// 화면 단위 — 현장 급보 오버레이(FieldEventOverlay)의 컷씬→선택 전환·선택지·멱등·게이트 (docs/40 §2-1).
// 컷씬 탭 → 선택 모달, 선택지(available)→resolveFieldEvent(ev,key) 1회+pop, 비활성(available=false)→
// 미적용+note 표시, 이중 탭 멱등(같은 사건 재처리 차단), 정산(settlement) 동안 숨김, 컷씬 텍스트 렌더·숨은변수 비노출.
// 스토어/시스템(fieldEventStore·pendingStore·fieldEventSystem)은 mock(화면 단위 격리).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent } from '@testing-library/react-native';

import { FieldEventOverlay } from './FieldEventOverlay';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import { resolveFieldEvent } from '@/systems/fieldEventSystem';
import type { FieldEvent } from '@/stores/fieldEventStore';

// 스토어/시스템 — 깊은 import(AsyncStorage·전투엔진) 차단 위해 팩토리로 명시.
jest.mock('@/stores/fieldEventStore', () => ({ useFieldEventStore: jest.fn() }));
jest.mock('@/stores/pendingStore', () => ({ usePendingStore: jest.fn() }));
jest.mock('@/systems/fieldEventSystem', () => ({ resolveFieldEvent: jest.fn() }));

const pop = jest.fn();
let queue: FieldEvent[] = [];
let settlement: unknown = null;

// 큐 셀렉터 — 컴포넌트가 s.queue[0]·s.pop 만 읽음.
function fieldState() {
  return { queue, pop };
}
function pendingState() {
  return { settlement };
}

// 의뢰 결투 사건 — gold 톤, 선택지 3개(하나는 자금 부족으로 비활성+note).
function event(overrides: Partial<FieldEvent> = {}): FieldEvent {
  return {
    id: 'ev1',
    source: 'quest',
    refId: 'q1',
    title: '갈림길의 결투',
    hanzi: '岐路',
    tone: 'gold',
    sceneLine: '산길에서 낯선 검객이 길을 막는다.',
    prompt: '검객이 통행세를 요구한다. 어찌하겠는가?',
    who: '장철·진소화',
    choices: [
      { key: 'fight', label: '맞선다', available: true },
      { key: 'pay', label: '통행세를 낸다', available: false, note: '자금 부족' },
      { key: 'avoid', label: '돌아간다', available: true },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  pop.mockReset();
  (resolveFieldEvent as jest.Mock).mockReset();
  queue = [event()];
  settlement = null;
  (useFieldEventStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: ReturnType<typeof fieldState>) => unknown) => sel(fieldState()),
  );
  (usePendingStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: ReturnType<typeof pendingState>) => unknown) => sel(pendingState()),
  );
});

describe('FieldEventOverlay — 컷씬(scene) 단계', () => {
  it('컷씬에 사건명·서사·동행자 문구가 렌더된다', async () => {
    const { getByText } = await render(<FieldEventOverlay />);
    expect(getByText('갈림길의 결투')).toBeTruthy();
    expect(getByText('산길에서 낯선 검객이 길을 막는다.')).toBeTruthy();
    expect(getByText('장철·진소화')).toBeTruthy();
    expect(getByText('탭하여 계속 ▶')).toBeTruthy();
  });

  it('컷씬 단계에서는 선택지가 아직 안 보인다(탭 전이다)', async () => {
    const { queryByText } = await render(<FieldEventOverlay />);
    expect(queryByText('맞선다')).toBeNull();
    expect(queryByText('검객이 통행세를 요구한다. 어찌하겠는가?')).toBeNull();
  });

  it('컷씬 탭(계속) → 선택 모달(prompt·선택지) 등장', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = await render(<FieldEventOverlay />);
    await user.press(getByLabelText('계속'));
    expect(getByText('검객이 통행세를 요구한다. 어찌하겠는가?')).toBeTruthy();
    expect(getByText('맞선다')).toBeTruthy();
    expect(getByText('돌아간다')).toBeTruthy();
  });

  it('내부 key(fight/pay/avoid)·source 같은 숨은변수는 노출하지 않는다', async () => {
    const user = userEvent.setup();
    const { getByLabelText, queryByText } = await render(<FieldEventOverlay />);
    await user.press(getByLabelText('계속'));
    expect(queryByText('fight')).toBeNull();
    expect(queryByText('pay')).toBeNull();
    expect(queryByText('quest')).toBeNull();
  });
});

describe('FieldEventOverlay — 선택지(choice) 적용', () => {
  async function toChoice(user: ReturnType<typeof userEvent.setup>, screen: any) {
    await user.press(screen.getByLabelText('계속'));
  }

  it('가용 선택지 → resolveFieldEvent(ev, key) 1회 + pop 1회', async () => {
    const user = userEvent.setup();
    const screen = await render(<FieldEventOverlay />);
    await toChoice(user, screen);
    await user.press(screen.getByText('맞선다'));
    expect(resolveFieldEvent).toHaveBeenCalledTimes(1);
    expect(resolveFieldEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ev1' }),
      'fight',
    );
    expect(pop).toHaveBeenCalledTimes(1);
  });

  it('다른 선택지 → 그 key 로 적용', async () => {
    const user = userEvent.setup();
    const screen = await render(<FieldEventOverlay />);
    await toChoice(user, screen);
    await user.press(screen.getByText('돌아간다'));
    expect(resolveFieldEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ev1' }),
      'avoid',
    );
  });

  it('비활성 선택지(available=false, 자금부족) → 라벨+note 표시, 누르면 미적용', async () => {
    const user = userEvent.setup();
    const screen = await render(<FieldEventOverlay />);
    await toChoice(user, screen);
    // 비활성 선택지는 라벨에 note 가 붙어 표시된다.
    expect(screen.getByText('통행세를 낸다  — 자금 부족')).toBeTruthy();
    await user.press(screen.getByText('통행세를 낸다  — 자금 부족'));
    expect(resolveFieldEvent).not.toHaveBeenCalled();
    expect(pop).not.toHaveBeenCalled();
  });

  it('멱등 가드: 적용 후 같은 사건이 큐에 남아 다시 선택해도 재처리 안 함', async () => {
    // 선택 직후 컴포넌트는 컷씬으로 되돌아가고, pop 은 mock 이라 큐(같은 id)가 그대로 남는다.
    // resolvedRef 가드가 같은 사건 id 재처리를 막아야 한다(이중 적용·다음 사건 유실 방지).
    const user = userEvent.setup();
    const screen = await render(<FieldEventOverlay />);
    await toChoice(user, screen);
    await user.press(screen.getByText('맞선다'));
    expect(resolveFieldEvent).toHaveBeenCalledTimes(1);
    expect(pop).toHaveBeenCalledTimes(1);
    // 같은 사건(id 동일)에 다시 진입해 또 선택 — 가드가 막아 추가 호출 없음.
    await user.press(screen.getByLabelText('계속'));
    await user.press(screen.getByText('맞선다'));
    expect(resolveFieldEvent).toHaveBeenCalledTimes(1);
    expect(pop).toHaveBeenCalledTimes(1);
  });

  it('비용 선택지 가용(available=true)일 때는 정상 적용된다', async () => {
    queue = [
      event({
        choices: [
          { key: 'pay', label: '통행세를 낸다', available: true },
          { key: 'fight', label: '맞선다', available: true },
        ],
      }),
    ];
    const user = userEvent.setup();
    const screen = await render(<FieldEventOverlay />);
    await user.press(screen.getByLabelText('계속'));
    await user.press(screen.getByText('통행세를 낸다'));
    expect(resolveFieldEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ev1' }),
      'pay',
    );
  });
});

describe('FieldEventOverlay — 게이트/빈 큐', () => {
  it('큐가 비면 아무 사건도 렌더하지 않는다(숨김 모달)', async () => {
    queue = [];
    const { queryByText } = await render(<FieldEventOverlay />);
    expect(queryByText('갈림길의 결투')).toBeNull();
    expect(queryByText('탭하여 계속 ▶')).toBeNull();
  });

  it('정산(settlement) 진행 중에는 사건이 떠 있어도 숨긴다', async () => {
    settlement = { dateLabel: '봄 첫째 날' };
    const { queryByText } = await render(<FieldEventOverlay />);
    expect(queryByText('갈림길의 결투')).toBeNull();
  });

  it('tone(blood)·hanzi 등 사건 메타가 렌더된다', async () => {
    queue = [event({ tone: 'blood', hanzi: '血路', title: '복수의 길' })];
    const { getByText } = await render(<FieldEventOverlay />);
    expect(getByText('복수의 길')).toBeTruthy();
    expect(getByText('血路')).toBeTruthy();
  });
});
