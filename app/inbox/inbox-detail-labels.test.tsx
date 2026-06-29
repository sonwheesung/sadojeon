// 화면 단위(터치형) — 서신함 상세 화면이 **실제로 렌더하는 선택지 버튼 텍스트**를 검증한다(R40, docs/37 ⑪).
// 기존 inbox-detail.test 는 responseOptionsFor 를 mock 으로 우회 + oneLiner 만 써서 도덕·면담 라벨 렌더를
// 한 번도 안 봤다(R40 사각). 이 테스트는 **실 responseOptionsFor + 실 화면 + 실 moralToInbox** 를 거쳐
// 버튼에 날것 {placeholder} 가 없는지 + 탭하면 그 키로 해소되는지를 본다. = "화면을 실제로 터치하는 테스트".
// ⚠️ RNTL v14: render·userEvent async. resolveInboxItem 만 spy(깊은 해소 부작용 차단), 빌더는 실모듈.
import { render, userEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/systems/runSync', () => ({ saveCurrentRunSilently: jest.fn(), setAutoSaveEnabled: jest.fn() }));
const mockParams: { current: { id?: string } } = { current: {} };
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: () => mockParams.current }));
// 빌더(responseOptionsFor)·isRespondable 은 실모듈, 깊은 해소(resolveInboxItem)만 spy.
jest.mock('@/systems/inboxResolve', () => ({
  ...jest.requireActual('@/systems/inboxResolve'),
  resolveInboxItem: jest.fn().mockResolvedValue(undefined),
}));

import InboxDetailScreen from './[id]';
import { moralToInbox } from '@/systems/eventInbox';
import { resolveInboxItem } from '@/systems/inboxResolve';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import type { Disciple, PendingMoralEvent } from '@/types';

// {name}/{sibling} 라벨을 가진 도덕 사건을 실제 적재 경로(moralToInbox)로 서신함에 넣는다.
function seedMoral(): string {
  const pending: PendingMoralEvent = {
    templateId: 'screen-test', tier: 'archetype', category: 'neglect',
    discipleId: 'i-cheongha', discipleName: '이청하',
    siblingId: 'yun-soso', siblingName: '윤소소',
    body: '훈련장에서 윤소소가 다쳤는데 이청하가 그냥 지나쳤다.', hint: undefined,
    choices: [
      { tone: 'admonish', label: '"{sibling} 앞에서 사과하고 며칠 돌봐라."', perpetrator: {} },
      { tone: 'overlook', label: '(다친 사람만 챙긴다. {name}에게는 말하지 않는다.)', perpetrator: {} },
      { tone: 'punish', label: '모든 제자 앞에서 책망한다.', perpetrator: {} },
      { tone: 'seclusion', label: '보름 폐관에 들게 한다.', perpetrator: {} },
    ],
    createdAtDay: 5,
  };
  moralToInbox(pending);
  const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string })?.domain === 'moral');
  return item!.id;
}

beforeEach(() => {
  (resolveInboxItem as jest.Mock).mockClear();
  useInboxStore.setState({ items: [] });
  mockParams.current = { id: seedMoral() };
});

describe('서신함 상세 — 도덕 사건 선택지 라벨(실 렌더, R40)', () => {
  it('버튼에 날것 {} 0 + 이름이 실제로 치환돼 렌더된다', async () => {
    const { getByText, queryByText } = await render(<InboxDetailScreen />);
    // 실명 치환된 라벨이 화면에 보인다.
    expect(getByText('"윤소소 앞에서 사과하고 며칠 돌봐라."')).toBeTruthy();
    expect(getByText('(다친 사람만 챙긴다. 이청하에게는 말하지 않는다.)')).toBeTruthy();
    // 날것 placeholder 가 화면 어디에도 없다(R40 회귀 가드).
    expect(queryByText(/\{sibling\}|\{name\}/)).toBeNull();
  });

  it('선택지를 탭→응답 → 그 톤(key)으로 해소된다(라벨이 아니라 key 로)', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('"윤소소 앞에서 사과하고 며칠 돌봐라."')); // admonish 선택
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() => expect(resolveInboxItem).toHaveBeenCalledTimes(1));
    expect(resolveInboxItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockParams.current.id }),
      'admonish',
    );
  });
});

// 발신자 칸 사각(docs/37 ⑪ 화면표시텍스트, docs/12·49 C6): 제목엔 제자명이 있는데
// 발화/관련 제자 칸이 '—'로 비던 버그. getSenderName 이 discipleId(payload·필드)로
// 실명을 조회하지 않아 letter/visit/diplomacy 외 전부 '—'였다. 이 테스트가 사각을 닫는다.
describe('서신함 상세 — 발신자 칸 제자 실명 조회(C6)', () => {
  it('discipleId 를 가진 사건은 관련/발화 제자 칸에 실명이 렌더된다(— 아님)', async () => {
    // 사건의 payload.discipleId = 'i-cheongha' 에 해당하는 제자를 store 에 시드.
    useDiscipleStore.setState({
      disciples: { 'i-cheongha': { id: 'i-cheongha', name: '이청하' } as Disciple },
    });
    const { getAllByText } = await render(<InboxDetailScreen />);
    // SenderPanel MetaRow value + RelatedDisciplePanel relatedName 두 곳에 정확히 '이청하' 노드.
    // (제목 '이청하 — 사건'·본문은 부분문자열이라 exact getByText 에 안 걸림 → 칸 값만 집계)
    expect(getAllByText('이청하').length).toBeGreaterThanOrEqual(2);
  });
});
