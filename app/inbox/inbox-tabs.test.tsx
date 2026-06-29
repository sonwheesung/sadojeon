// 화면 단위(터치형) — 서신함 현재/지난 탭 분할(docs/12·49 C6)이 **실제로 목록을 갈라 렌더**하는지 검증.
// 적체 차단의 핵심: 처리한(지난) 서신이 현재 목록에 안 섞여야 한다. 탭 토글이 그걸 보장하는지를
// 실 store + 실 화면으로 본다(시뮬 PASS인데 화면서 안 갈림 = 거짓 확신, feedback_test_blindspot).
// ⚠️ RNTL v14: render·userEvent async. 진입 부수효과(튜토리얼·supabase)만 차단, 분할 로직은 실모듈.
import { render, userEvent } from '@testing-library/react-native';

jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/hooks/useTutorialOnFocus', () => ({ useTutorialOnFocus: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

import InboxScreen from './index';
import { useInboxStore } from '@/stores/inboxStore';
import type { InboxItem } from '@/types';

// 안 읽은 한 마디 = 현재(활성). 읽은 한 마디 = 지난(처리 완료·정보성).
function oneLiner(id: string, read: boolean, title: string): InboxItem {
  return {
    id,
    kind: 'one_liner',
    priority: 'normal',
    createdAtDay: 1,
    read,
    resolved: false,
    title,
    preview: '...',
    body: '...',
    payload: { domain: 'oneLiner', templateId: 't', discipleId: 'd', responses: {} },
  } as InboxItem;
}

beforeEach(() => {
  useInboxStore.setState({
    items: [oneLiner('a', false, '현재-한마디'), oneLiner('p', true, '지난-한마디')],
  });
});

describe('서신함 — 현재/지난 탭 분할(C6)', () => {
  it('기본 현재 탭: 활성만 보이고 지난 항목은 목록에 없다', async () => {
    const { getByText, queryByText } = await render(<InboxScreen />);
    expect(getByText('현재 (1)')).toBeTruthy();
    expect(getByText('지난 (1)')).toBeTruthy();
    expect(getByText('현재-한마디')).toBeTruthy();
    expect(queryByText('지난-한마디')).toBeNull(); // 지난 항목이 현재 목록에 섞이지 않음
  });

  it('지난 탭을 탭하면 지난 항목만 보이고 현재 항목은 사라진다', async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(<InboxScreen />);
    await user.press(getByText('지난 (1)'));
    expect(getByText('지난-한마디')).toBeTruthy();
    expect(queryByText('현재-한마디')).toBeNull();
  });
});
