// 화면 단위 — 의뢰 화면(게시판·BoardCard·DispatchModal)의 **상호작용·이벤트** 본보기(docs/40 §2-1).
// "버튼 하나하나·선택 하나하나·요청 하나하나" 테스트: 의뢰 카드 선택→모달 열기/닫기, 파티 선택/해제,
// 파견 게이트(추천 인원 무관 1명↑·극험 역량 하드 게이트·questing/injured 제외), 파견 확정(dispatch 인자·횟수),
// 위험 마크·비고 표시, 게시판 갱신, 숨은변수(정확 확률·역량 수치) 비노출.
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
// 격리: @/stores·@/systems/questSystem·공용 UI 래퍼는 mock. QuestRiskMarks 는 실제(leaf) — 실제 위험 데이터로 검증.
import { render, userEvent, waitFor } from '@testing-library/react-native';

import QuestScreen from './quest';
import { canDispatch, dispatchQuest, fitPhrase, generateBoard } from '@/systems/questSystem';
import { useDiscipleStore, useQuestStore, useTimeStore } from '@/stores';
import type { ActiveQuest, Disciple, Quest } from '@/types';

// ── 공용 UI 래퍼는 passthrough mock (expo-image·expo-router·깊은 store 체인 차단) ──
jest.mock('@/components/common/SafetyZone', () => {
  const { View } = require('react-native');
  return { SafetyZone: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});
jest.mock('@/components/common/PaperCard', () => {
  const { View } = require('react-native');
  return { PaperCard: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});
jest.mock('@/components/common/AppHeader', () => {
  const { View } = require('react-native');
  return { AppHeader: () => <View testID="app-header" /> };
});
jest.mock('@/components/common/SectionLabel', () => {
  const { Text } = require('react-native');
  return { SectionLabel: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text> };
});

// ── 시스템·스토어 mock ──
// @/stores 는 factory mock — 실제 barrel 을 평가하면 gameStore→AsyncStorage(네이티브) 가 깨진다.
// 화면이 쓰는 3개 훅만 jest.fn() 으로 노출하고, beforeEach 에서 셀렉터 구현 주입.
jest.mock('@/systems/questSystem', () => ({
  canDispatch: jest.fn(),
  dispatchQuest: jest.fn(),
  fitPhrase: jest.fn(),
  generateBoard: jest.fn(),
}));
jest.mock('@/stores', () => ({
  useQuestStore: jest.fn(),
  useDiscipleStore: jest.fn(),
  useTimeStore: jest.fn(),
}));

// ── 픽스처 ──
const baseQuest = (over: Partial<Quest> = {}): Quest => ({
  id: 'q-test',
  domain: 'guard',
  grade: 'normal',
  title: '표국 호위',
  client: '황보 표국',
  preview: '보름간 표물을 강북까지 지킨다.',
  weeks: 2,
  reward: { money: 42, fame: 4 },
  recommended: 1,
  minStat: 20,
  ...over,
});

const baseDisciple = (over: Partial<Disciple> = {}): Disciple =>
  ({
    id: 'd1',
    name: '유운',
    status: 'training',
    stats: {},
    martialArts: [],
    relationships: {},
    realm: 'samryu',
    ...over,
  }) as unknown as Disciple;

const dispatchQuestMock = dispatchQuest as jest.Mock;
const canDispatchMock = canDispatch as jest.Mock;
const fitPhraseMock = fitPhrase as jest.Mock;
const generateBoardMock = generateBoard as jest.Mock;

let questState: { board: Quest[]; active: ActiveQuest[] };
let discipleState: { order: string[]; disciples: Record<string, Disciple> };
let timeState: { totalDay: number };

function applyStores() {
  (useQuestStore as unknown as jest.Mock).mockImplementation((sel: (s: typeof questState) => unknown) =>
    sel(questState),
  );
  (useDiscipleStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof discipleState) => unknown) => sel(discipleState),
  );
  (useTimeStore as unknown as jest.Mock).mockImplementation((sel: (s: typeof timeState) => unknown) =>
    sel(timeState),
  );
}

beforeEach(() => {
  dispatchQuestMock.mockReset();
  canDispatchMock.mockReset();
  fitPhraseMock.mockReset();
  generateBoardMock.mockReset();
  // 기본: 파견 성공·전원 적격·적합 풍경 고정.
  dispatchQuestMock.mockReturnValue(true);
  canDispatchMock.mockReturnValue(true);
  fitPhraseMock.mockReturnValue('해볼 만하다');

  questState = { board: [], active: [] };
  discipleState = { order: [], disciples: {} };
  timeState = { totalDay: 0 };
  applyStores();
});

describe('의뢰 화면 — 게시판 렌더·갱신', () => {
  it('빈 게시판/파견중 → 안내 문구 + 갱신 버튼은 generateBoard 호출', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<QuestScreen />);
    expect(getByText('파견 중인 의뢰가 없습니다.')).toBeTruthy();
    expect(getByText('받을 수 있는 의뢰가 없습니다. 마을을 방문해 보세요.')).toBeTruthy();
    await user.press(getByText('마을 방문 — 게시판 갱신'));
    expect(generateBoardMock).toHaveBeenCalledTimes(1);
  });

  it('게시판 의뢰 → 카드(제목·의뢰인·보상·추천 인원) 표시', async () => {
    questState.board = [baseQuest()];
    const { getByText } = await render(<QuestScreen />);
    expect(getByText(/표국 호위/)).toBeTruthy();
    expect(getByText(/황보 표국/)).toBeTruthy();
    expect(getByText(/추천 1명/)).toBeTruthy();
  });

  it('회색(gray) 의뢰 → "회색" 표지 표시', async () => {
    questState.board = [baseQuest({ id: 'q-gray', gray: true, domain: 'assassin', title: '작은 청부' })];
    const { getByText } = await render(<QuestScreen />);
    expect(getByText(/회색/)).toBeTruthy();
  });

  it('파견 중 의뢰 → ActiveCard(제자 이름·경과 주차·진행 중 배지)', async () => {
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    timeState.totalDay = 14;
    questState.active = [{ quest: baseQuest(), discipleIds: ['d1'], startedDay: 0, dueDay: 14 } as ActiveQuest];
    const { getByText } = await render(<QuestScreen />);
    expect(getByText('진행 중')).toBeTruthy();
    expect(getByText(/유운/)).toBeTruthy();
    expect(getByText(/2\/2주/)).toBeTruthy();
  });
});

describe('의뢰 화면 — 위험 마크·비고 (숨은변수 비노출)', () => {
  it('보통(normal) → 부상 마크, 사망/비고 없음', async () => {
    questState.board = [baseQuest({ grade: 'normal' })];
    const { getByText, queryByText } = await render(<QuestScreen />);
    expect(getByText('● 부상')).toBeTruthy();
    expect(queryByText('● 사망')).toBeNull();
    expect(queryByText(/비고/)).toBeNull();
  });

  it('극험(extreme) → 부상·치명상·사망 3마크 + 비고 경고문', async () => {
    questState.board = [baseQuest({ id: 'q-ex', grade: 'extreme', domain: 'grand', minStat: 65, recommended: 3 })];
    const { getByText } = await render(<QuestScreen />);
    expect(getByText('● 부상')).toBeTruthy();
    expect(getByText('● 치명상')).toBeTruthy();
    expect(getByText('● 사망')).toBeTruthy();
    expect(getByText(/비고 —/)).toBeTruthy();
  });

  it('잡일(menial) → 안전 마크', async () => {
    questState.board = [baseQuest({ id: 'q-m', grade: 'menial', minStat: 0 })];
    const { getByText } = await render(<QuestScreen />);
    expect(getByText('● 안전')).toBeTruthy();
  });

  it('숨은변수 비노출 — 정확 확률(숫자 %)·역량 수치를 카드에 렌더하지 않는다', async () => {
    questState.board = [baseQuest({ grade: 'extreme', minStat: 65 })];
    const { queryByText } = await render(<QuestScreen />);
    expect(queryByText(/\d+\s*%/)).toBeNull();
    // minStat(65) 같은 내부 역량 임계값이 화면에 노출되지 않는다.
    expect(queryByText(/65/)).toBeNull();
  });
});

describe('의뢰 화면 — 파견 모달 열기/닫기', () => {
  it('의뢰 카드 선택 → 파견 모달 열림(의뢰인·후보 라벨)', async () => {
    questState.board = [baseQuest()];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple() };
    const user = userEvent.setup();
    const { getByText, getByLabelText } = await render(<QuestScreen />);
    await user.press(getByLabelText('보통 의뢰 표국 호위'));
    expect(getByText('의뢰인: 황보 표국')).toBeTruthy();
    expect(getByText(/누구를 보낼까/)).toBeTruthy();
  });

  it('"물린다" → 모달 닫힘', async () => {
    questState.board = [baseQuest()];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple() };
    const user = userEvent.setup();
    const { getByText, getByLabelText, queryByText } = await render(<QuestScreen />);
    await user.press(getByLabelText('보통 의뢰 표국 호위'));
    expect(getByText('의뢰인: 황보 표국')).toBeTruthy();
    await user.press(getByText('물린다'));
    await waitFor(() => expect(queryByText('의뢰인: 황보 표국')).toBeNull());
  });
});

describe('의뢰 모달 — 파견 게이트(canDispatch)·dispatch 미호출', () => {
  async function openModal(user: ReturnType<typeof userEvent.setup>) {
    const utils = await render(<QuestScreen />);
    await user.press(utils.getByLabelText(/의뢰 표국 호위/));
    return utils;
  }

  it('아무도 선택 안 함 → 파견 버튼 비활성·dispatchQuest 미호출', async () => {
    questState.board = [baseQuest()];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple() };
    const user = userEvent.setup();
    const { getByText } = await openModal(user);
    await user.press(getByText('파견한다'));
    expect(dispatchQuestMock).not.toHaveBeenCalled();
  });

  it('극험 역량 미달(canDispatch=false) → 후보 "자격 미달" + 선택 불가 → dispatch 미호출', async () => {
    questState.board = [baseQuest({ id: 'q-ex', grade: 'extreme', title: '거물 암살', minStat: 65 })];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ name: '약졸' }) };
    canDispatchMock.mockReturnValue(false); // 역량 하드 게이트 실패
    const user = userEvent.setup();
    const { getByText } = await render(<QuestScreen />);
    await user.press(getByText(/거물 암살/));
    expect(getByText('자격 미달')).toBeTruthy();
    await user.press(getByText('약졸')); // 비활성 행 — toggle 안 됨
    await user.press(getByText('파견한다'));
    expect(dispatchQuestMock).not.toHaveBeenCalled();
  });

  it('파견 중(questing) 제자 → "파견 중" 라벨·선택 불가 → dispatch 미호출', async () => {
    questState.board = [baseQuest()];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ status: 'questing' as Disciple['status'] }) };
    const user = userEvent.setup();
    const { getByText, getAllByText, getByLabelText } = await render(<QuestScreen />);
    await user.press(getByLabelText('보통 의뢰 표국 호위'));
    // "파견 중"은 섹션 헤더 + 후보 행 사유 두 곳에 — 후보 행 사유가 떴는지(2개↑) 확인.
    expect(getAllByText('파견 중').length).toBeGreaterThanOrEqual(2);
    await user.press(getByText('유운'));
    await user.press(getByText('파견한다'));
    expect(dispatchQuestMock).not.toHaveBeenCalled();
  });

  it('부상 중(injured) 제자 → "부상 중" 라벨·선택 불가 → dispatch 미호출', async () => {
    questState.board = [baseQuest()];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ status: 'injured' as Disciple['status'] }) };
    const user = userEvent.setup();
    const { getByText, getByLabelText } = await render(<QuestScreen />);
    await user.press(getByLabelText('보통 의뢰 표국 호위'));
    expect(getByText('부상 중')).toBeTruthy();
    await user.press(getByText('유운'));
    await user.press(getByText('파견한다'));
    expect(dispatchQuestMock).not.toHaveBeenCalled();
  });
});

describe('의뢰 모달 — 적격 제자 선택·파견 확정(dispatch 인자)', () => {
  it('적격 제자 1명 선택 → 파견 → dispatchQuest(questId, [id]) 1회 호출 + 모달 닫힘', async () => {
    questState.board = [baseQuest({ id: 'q-test' })];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    const user = userEvent.setup();
    const { getByText, getByLabelText, queryByText } = await render(<QuestScreen />);
    await user.press(getByLabelText('보통 의뢰 표국 호위'));
    await user.press(getByText('유운'));
    await user.press(getByText(/파견한다/));
    expect(dispatchQuestMock).toHaveBeenCalledTimes(1);
    expect(dispatchQuestMock).toHaveBeenCalledWith('q-test', ['d1']);
    await waitFor(() => expect(queryByText('의뢰인: 황보 표국')).toBeNull());
  });

  it('두 명 선택 → 선택 인원 표시 + dispatchQuest 가 두 id 배열로 호출', async () => {
    questState.board = [baseQuest({ id: 'q-test', recommended: 2 })];
    discipleState.order = ['d1', 'd2'];
    discipleState.disciples = {
      d1: baseDisciple({ id: 'd1', name: '유운' }),
      d2: baseDisciple({ id: 'd2', name: '서진' }),
    };
    const user = userEvent.setup();
    const { getByText } = await render(<QuestScreen />);
    await user.press(getByText(/표국 호위/));
    await user.press(getByText('유운'));
    await user.press(getByText('서진'));
    expect(getByText('파견한다 (2)')).toBeTruthy();
    await user.press(getByText('파견한다 (2)'));
    expect(dispatchQuestMock).toHaveBeenCalledWith('q-test', ['d1', 'd2']);
  });

  it('선택 후 해제(toggle) → 다시 0명 → 파견 버튼 비활성·dispatch 미호출', async () => {
    questState.board = [baseQuest({ id: 'q-test' })];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    const user = userEvent.setup();
    const { getByText } = await render(<QuestScreen />);
    await user.press(getByText(/표국 호위/));
    await user.press(getByText('유운')); // 선택
    await user.press(getByText('유운')); // 해제
    await user.press(getByText('파견한다'));
    expect(dispatchQuestMock).not.toHaveBeenCalled();
  });

  it('dispatchQuest 가 false 반환(파견 실패) → 모달 유지', async () => {
    questState.board = [baseQuest({ id: 'q-test' })];
    discipleState.order = ['d1'];
    discipleState.disciples = { d1: baseDisciple({ id: 'd1', name: '유운' }) };
    dispatchQuestMock.mockReturnValue(false);
    const user = userEvent.setup();
    const { getByText } = await render(<QuestScreen />);
    await user.press(getByText(/표국 호위/));
    await user.press(getByText('유운'));
    await user.press(getByText(/파견한다/));
    expect(dispatchQuestMock).toHaveBeenCalledTimes(1);
    expect(getByText('의뢰인: 황보 표국')).toBeTruthy(); // 닫히지 않음
  });
});
