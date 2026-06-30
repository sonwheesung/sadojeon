// 화면 단위 — 제자 명단(DiscipleRoster)의 카드 렌더·상태 라벨·진입·일정 변경 (docs/40 §2-1).
// 핵심: 명단 빈/충원 분기, 제자 카드 선택 → 상세 라우팅(/disciple/:id), "일정 변경" → /schedule,
//       파견·치료·폐관(override) 상태 라벨, 숨은변수 비노출 — 체력 "기색" 문구만(숫자 X).
// 격리: 4개 스토어(discipleStore·timeStore·scheduleStore·pendingStore)·expo-router·SectionLabel 은 mock.
// staminaSceneLabel·OVERRIDE_LABEL·STATUS 라벨은 실제 로직(leaf) — 실제 표시 규칙을 검증.
// ⚠️ RNTL v14: render·userEvent 모두 async.
import { render, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { DiscipleRoster } from './DiscipleRoster';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import type { Disciple } from '@/types';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/common/SectionLabel', () => {
  const { Text } = require('react-native');
  return { SectionLabel: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text> };
});

// 스토어는 직접 경로 import(barrel 아님) — 각각 셀렉터 구현 주입.
jest.mock('@/stores/discipleStore', () => ({ useDiscipleStore: jest.fn() }));
jest.mock('@/stores/timeStore', () => ({ useTimeStore: jest.fn() }));
jest.mock('@/stores/scheduleStore', () => ({ useScheduleStore: jest.fn() }));
jest.mock('@/stores/pendingStore', () => ({ usePendingStore: jest.fn() }));

const push = router.push as jest.Mock;

// ── 픽스처 ──
const baseDisciple = (over: Partial<Disciple> = {}): Disciple =>
  ({
    id: 'd1',
    name: '유운',
    hanjaName: '柳雲',
    status: 'training',
    realm: 'ilryu',
    stamina: 100,
    maxStamina: 100,
    martialArts: [],
    mainMartialArtId: undefined,
    stats: {},
    relationships: {},
    ...over,
  }) as unknown as Disciple;

let discipleState: { order: string[]; disciples: Record<string, Disciple> };
let timeState: { totalDay: number };
let scheduleState: { overrides: Record<string, unknown> };
let pendingState: { dailyBadges: Record<string, unknown[]> };

function applyStores() {
  (useDiscipleStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof discipleState) => unknown) => sel(discipleState),
  );
  (useTimeStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof timeState) => unknown) => sel(timeState),
  );
  (useScheduleStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof scheduleState) => unknown) => sel(scheduleState),
  );
  (usePendingStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof pendingState) => unknown) => sel(pendingState),
  );
}

beforeEach(() => {
  push.mockReset();
  discipleState = { order: [], disciples: {} };
  timeState = { totalDay: 0 };
  scheduleState = { overrides: {} };
  pendingState = { dailyBadges: {} };
  applyStores();
});

describe('DiscipleRoster — 명단 빈/충원 분기', () => {
  it('빈 명단 → 카드 없음(이름 미표시), 섹션·일정 변경 버튼은 항상', async () => {
    discipleState.order = [];
    const { getByText, queryByText } = await render(<DiscipleRoster />);
    expect(getByText('제자 현황')).toBeTruthy();
    expect(getByText('일정 변경 ▶')).toBeTruthy();
    expect(queryByText('유운')).toBeNull();
  });

  it('충원 → 제자 카드(이름·경지·체력 기색) 렌더', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운', realm: 'ilryu' }) };
    const { getByText } = await render(<DiscipleRoster />);
    expect(getByText('유운')).toBeTruthy();
    expect(getByText('일류')).toBeTruthy(); // REALM_LABEL[ilryu]
    expect(getByText('수련중')).toBeTruthy(); // STATUS_LABEL[training]
  });

  it('order 에 있지만 disciples 에 없는 id → null(크래시 없이 건너뜀)', async () => {
    discipleState.order = ['ghost'];
    discipleState.disciples = {};
    const { queryByText } = await render(<DiscipleRoster />);
    expect(queryByText('유운')).toBeNull();
  });
});

describe('DiscipleRoster — 진입·요청(라우팅)', () => {
  it('제자 카드 선택 → 상세 라우팅 router.push("/disciple/:id")', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    const user = userEvent.setup();
    const { getByLabelText } = await render(<DiscipleRoster />);
    await user.press(getByLabelText('유운 상세'));
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/disciple/d1');
  });

  it('"일정 변경" 버튼 → router.push("/schedule")', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = await render(<DiscipleRoster />);
    await user.press(getByLabelText('일정 변경'));
    expect(push).toHaveBeenCalledWith('/schedule');
  });
});

describe('DiscipleRoster — 상태/파견 라벨', () => {
  it('파견중(questing) 제자 → "파견중" 라벨', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = {
      d1: baseDisciple({ id: 'd1', name: '서진', status: 'questing' as Disciple['status'] }),
    };
    const { getByText } = await render(<DiscipleRoster />);
    expect(getByText('파견중')).toBeTruthy();
  });

  // R47 형제: 채집·연단은 override 없이 status 만 세팅 → override 만 보던 비활성(흐림+오버레이) 처리가
  // 빠지던 누수. status 기반으로 onLeave 판정해 접근성 라벨에 "— <짧은라벨> 중" 이 붙어야 한다("파견중 중" 중복 없이).
  it.each([
    ['questing', '파견'],
    ['crafting', '연단'],
  ] as const)('override 없이 status=%s → 비활성 처리(접근성 "— %s 중")', async (status, short) => {
    discipleState.order = ['d1'];
    discipleState.disciples = {
      d1: baseDisciple({ id: 'd1', name: '서진', status: status as Disciple['status'] }),
    };
    const { getByLabelText } = await render(<DiscipleRoster />);
    expect(getByLabelText(`서진 상세 — ${short} 중`)).toBeTruthy();
  });

  it('override(폐관) 진행 중 → 명령 라벨 + 남은 일수, 카드 접근성 라벨에 "중" 표기', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    timeState.totalDay = 2;
    // 폐관(seclusion) 명령 5일 중 3일 남음 — override 기간 안.
    scheduleState.overrides = {
      d1: { command: 'seclusion', startedAtDay: 0, durationDays: 5 },
    };
    const { getByLabelText } = await render(<DiscipleRoster />);
    // onLeave → 접근성 라벨이 "유운 상세 — <명령> 중" 형태(명령 라벨은 OVERRIDE_LABEL 실제값).
    expect(getByLabelText(/유운 상세 — .+ 중/)).toBeTruthy();
  });
});

describe('DiscipleRoster — 숨은변수 비노출', () => {
  it('체력은 "기색" 문구만, 정확 숫자(100 등)는 카드에 미노출', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = {
      d1: baseDisciple({ id: 'd1', name: '유운', stamina: 100, maxStamina: 100 }),
    };
    const { getByText, queryByText } = await render(<DiscipleRoster />);
    expect(getByText('기력 왕성')).toBeTruthy(); // staminaSceneLabel 만점
    expect(queryByText(/100/)).toBeNull();
    expect(queryByText(/\d+\s*\/\s*\d+/)).toBeNull(); // "100/100" 류 미노출
  });

  it('지친 제자 → "지친 기색"(기색 문구), 비율 퍼센트 숫자 미노출', async () => {
    discipleState.order = ['d1'];
    discipleState.disciples = {
      d1: baseDisciple({ id: 'd1', name: '유운', stamina: 20, maxStamina: 100 }),
    };
    const { getByText, queryByText } = await render(<DiscipleRoster />);
    expect(getByText('지친 기색')).toBeTruthy();
    expect(queryByText(/%/)).toBeNull();
  });
});
