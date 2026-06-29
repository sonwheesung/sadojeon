// 화면 단위 — 서신함 항목 해소 화면(app/inbox/[id].tsx)의 상호작용·요청·진행 게이트 (docs/40 §2-1).
// 응답 선택지 버튼·응답/확인 푸터·해소 요청(resolveInboxItem) 인자·결정 미해소 시 진행 차단(disabled)·
// busy·읽기전용(확인=remove)·실패 분기·뒤로가기. 스토어/시스템/router 는 mock(화면 단위 격리).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import InboxDetailScreen from './[id]';
import { useInboxStore } from '@/stores/inboxStore';
import {
  isRespondable,
  resolveInboxItem,
  responseOptionsFor,
} from '@/systems/inboxResolve';
import type { InboxItem } from '@/types';

// expo-router — 라우팅 부수효과 격리(back/params). mock 팩토리는 외부 변수 참조 불가 →
// router.back 은 jest.fn() 으로 두고, params 는 mockParams(접두사 mock 허용)로 주입.
const mockParams: { current: { id?: string } } = { current: { id: 'itm1' } };
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => mockParams.current,
}));

// 팩토리 명시 — auto-mock 은 실모듈을 평가해 AsyncStorage(native) 를 끌어옴 → 팩토리로 차단.
jest.mock('@/stores/inboxStore', () => ({ useInboxStore: jest.fn() }));
jest.mock('@/systems/inboxResolve', () => ({
  isRespondable: jest.fn(),
  resolveInboxItem: jest.fn(),
  responseOptionsFor: jest.fn(),
}));

const back = router.back as jest.Mock;
const remove = jest.fn();
const markResolved = jest.fn();
let items: InboxItem[] = [];

function setItem(item: InboxItem | null) {
  items = item ? [item] : [];
  mockParams.current = { id: item ? item.id : 'missing' };
}

// 한마디(oneLiner) — 응답 가능, 톤 라벨 직접 노출 X(문구만).
function oneLinerItem(): InboxItem {
  return {
    id: 'itm1',
    kind: 'one_liner',
    priority: 'normal',
    createdAtDay: 3,
    read: true,
    resolved: false,
    title: '문득 건넨 말',
    preview: '...',
    body: '사부님, 오늘 검이 무겁게 느껴졌습니다.',
    payload: {
      domain: 'oneLiner',
      templateId: 't1',
      discipleId: 'd1',
      responses: { encourage: '잘 견뎠다', nod: '그랬구나' },
    },
  } as InboxItem;
}

// 풍문(rumor) — 읽기 전용(응답 불가). 확인 = remove + back.
function rumorItem(): InboxItem {
  return {
    id: 'itm1',
    kind: 'rumor',
    priority: 'low',
    createdAtDay: 2,
    read: true,
    resolved: false,
    title: '강호 소문',
    preview: '소문...',
    body: '어느 문파가 분열했다는 소문이 돈다.',
    payload: { domain: 'rumor' },
  } as InboxItem;
}

beforeEach(() => {
  [back, remove, markResolved].forEach((m) => m.mockReset());
  (resolveInboxItem as jest.Mock).mockReset().mockResolvedValue(undefined);
  // 빌더는 실모듈(스토어 import 깊음)을 끌어오지 않게 화면이 쓰는 분기만 재현.
  (isRespondable as jest.Mock).mockImplementation(
    (it: InboxItem) => (it.payload as { domain?: string })?.domain === 'oneLiner',
  );
  (responseOptionsFor as jest.Mock).mockImplementation((it: InboxItem) => {
    const responses = ((it.payload as { responses?: Record<string, string> })?.responses) ?? {};
    return Object.entries(responses).map(([key, label]) => ({ key, label }));
  });
  (useInboxStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: { items: InboxItem[]; remove: jest.Mock; markResolved: jest.Mock }) => unknown) =>
      sel({ items, remove, markResolved }),
  );
  setItem(oneLinerItem());
});

describe('InboxDetailScreen — 응답형(한마디) 해소', () => {
  it('응답 선택지 문구가 렌더되고, 톤 키(encourage/nod)는 노출하지 않는다(숨은변수)', async () => {
    const { getByText, queryByText } = await render(<InboxDetailScreen />);
    expect(getByText('잘 견뎠다')).toBeTruthy();
    expect(getByText('그랬구나')).toBeTruthy();
    expect(queryByText('encourage')).toBeNull();
    expect(queryByText('nod')).toBeNull();
  });

  it('응답 미선택 → 푸터 "응답하기" 눌러도 resolveInboxItem 미호출(진행 차단)', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('응답하기 ▶'));
    expect(resolveInboxItem).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });

  it('선택 후 응답 → resolveInboxItem(item, key) 1회 + 성공 시 back', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('잘 견뎠다')); // encourage 선택
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() => expect(resolveInboxItem).toHaveBeenCalledTimes(1));
    expect(resolveInboxItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'itm1' }),
      'encourage',
    );
    await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
  });

  it('다른 선택지를 누르면 그 키로 해소된다(선택 갱신)', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('잘 견뎠다'));
    await user.press(getByText('그랬구나')); // 재선택 → nod
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() =>
      expect(resolveInboxItem).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'itm1' }),
        'nod',
      ),
    );
  });

  it('응답형은 읽기 전용 보관 경로를 타지 않는다(resolve 실패 시 markResolved 미호출)', async () => {
    (resolveInboxItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('잘 견뎠다'));
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() => expect(resolveInboxItem).toHaveBeenCalledTimes(1));
    // 보관(markResolved)은 성공한 resolveInboxItem 내부에서만 — 화면이 직접 호출하지 않음.
    expect(markResolved).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    // 실패 → 자동 back 안 함(미해소 back 방지).
    expect(back).not.toHaveBeenCalled();
  });

  it('해소 실패 후 busy 해제 → 재시도 가능(resolve 두 번째 호출)', async () => {
    (resolveInboxItem as jest.Mock)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('잘 견뎠다'));
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() => expect(resolveInboxItem).toHaveBeenCalledTimes(1));
    // busy 해제 확인: 푸터가 다시 "응답하기" 로 돌아옴.
    await waitFor(() => expect(getByText('응답하기 ▶')).toBeTruthy());
    await user.press(getByText('응답하기 ▶'));
    await waitFor(() => expect(resolveInboxItem).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
  });
});

describe('InboxDetailScreen — 읽기 전용(풍문) 확인', () => {
  beforeEach(() => setItem(rumorItem()));

  it('응답 선택지 없이 푸터가 "확인" 으로 표시된다', async () => {
    const { getByText, queryByText } = await render(<InboxDetailScreen />);
    expect(getByText('확인 ▶')).toBeTruthy();
    expect(queryByText('응답 선택')).toBeNull();
  });

  it('확인 → resolveInboxItem 없이 markResolved(id) 보관 + back (삭제 아님)', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('확인 ▶'));
    expect(markResolved).toHaveBeenCalledTimes(1);
    expect(markResolved).toHaveBeenCalledWith('itm1');
    expect(remove).not.toHaveBeenCalled(); // 처리=보관, 삭제 아님(docs/37 R45)
    expect(resolveInboxItem).not.toHaveBeenCalled();
    expect(back).toHaveBeenCalledTimes(1);
  });
});

// 보관건(resolved) 재진입 — 응답형이라도 읽기 전용이어야 한다(효과 중복 적용 차단, docs/37 R45).
describe('InboxDetailScreen — 보관건(resolved) 읽기 전용', () => {
  beforeEach(() => {
    const it = oneLinerItem();
    it.resolved = true; // 이미 처리·보관된 한 마디
    setItem(it);
  });

  it('보관건은 응답 선택지 없이 "확인"만 — 응답형이어도 재응답 불가', async () => {
    const { getByText, queryByText } = await render(<InboxDetailScreen />);
    expect(getByText('확인 ▶')).toBeTruthy();
    expect(queryByText('응답 선택')).toBeNull();
    expect(queryByText('잘 견뎠다')).toBeNull(); // 한 마디 선택지 미렌더
  });

  it('보관건 확인 → resolveInboxItem·markResolved 둘 다 미호출(중복 적용/재보관 없음) + back', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<InboxDetailScreen />);
    await user.press(getByText('확인 ▶'));
    expect(resolveInboxItem).not.toHaveBeenCalled();
    expect(markResolved).not.toHaveBeenCalled(); // 이미 resolved — 재보관 안 함
    expect(back).toHaveBeenCalledTimes(1);
  });
});

describe('InboxDetailScreen — 사라진 항목 / 뒤로가기', () => {
  it('항목 없음 → 안내 문구 + 응답/확인 버튼 없음', async () => {
    setItem(null);
    const { getByText, queryByText } = await render(<InboxDetailScreen />);
    expect(getByText('이미 처리되거나 삭제된 항목입니다.')).toBeTruthy();
    expect(queryByText('응답하기 ▶')).toBeNull();
    expect(queryByText('확인 ▶')).toBeNull();
  });

  it('헤더 뒤로 버튼 → router.back() 호출(해소 없이)', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = await render(<InboxDetailScreen />);
    await user.press(getByLabelText('뒤로'));
    expect(back).toHaveBeenCalledTimes(1);
    expect(resolveInboxItem).not.toHaveBeenCalled();
  });
});
