// 화면 단위(터치형) — 서신함 현재/지난 탭 분할(보관 모델, docs/12·37 R45)을 **실제 렌더로** 검증.
// 핵심 계약: 현재=!resolved, 지난=resolved. read(읽음)는 판정에 안 씀. 그리고 **'지난' 항목엔
// 응답가능/응답필요 배지가 절대 안 붙는다**(처리 완료니까) — 사용자가 잡은 모순(R45)의 회귀 가드.
// ⚠️ RNTL v14: render·userEvent async. 진입 부수효과(튜토리얼·supabase)만 차단, 분할 로직은 실모듈.
import { render, userEvent } from '@testing-library/react-native';

jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/hooks/useTutorialOnFocus', () => ({ useTutorialOnFocus: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

import InboxScreen from './index';
import { useInboxStore } from '@/stores/inboxStore';
import type { InboxItem } from '@/types';

// 미처리 한 마디 = 현재(!resolved). 처리·보관된 한 마디 = 지난(resolved). read 값은 판정 무관.
function oneLiner(id: string, resolved: boolean, title: string): InboxItem {
  return {
    id,
    kind: 'one_liner',
    priority: 'normal',
    createdAtDay: 1,
    read: true,
    resolved,
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

describe('서신함 — 현재/지난 탭 분할 · 보관 모델(R45)', () => {
  it('기본 현재 탭: 미처리(!resolved)만 보이고 "응답 가능" 배지가 붙는다', async () => {
    const { getByText, queryByText } = await render(<InboxScreen />);
    expect(getByText('현재 (1)')).toBeTruthy();
    expect(getByText('지난 (1)')).toBeTruthy();
    expect(getByText('현재-한마디')).toBeTruthy();
    expect(queryByText('지난-한마디')).toBeNull(); // 처리된 건 현재에 안 섞임
    expect(queryByText('응답 가능')).toBeTruthy(); // 미처리 한 마디엔 배지 노출
  });

  it('지난 탭: 처리완료(resolved)만 보이고 "응답 가능" 배지는 절대 안 붙는다(R45 모순 가드)', async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = await render(<InboxScreen />);
    await user.press(getByText('지난 (1)'));
    expect(getByText('지난-한마디')).toBeTruthy();
    expect(queryByText('현재-한마디')).toBeNull();
    // 핵심 불변식: 지난(처리완료)에는 응답가능/응답필요 행동 배지가 없어야 한다.
    expect(queryByText('응답 가능')).toBeNull();
  });
});
