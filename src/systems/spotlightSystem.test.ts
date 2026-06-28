// 스포트라이트 투어 — 시작/진행/종료 + 계정 1회 게이팅. docs/44.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));

import { startIntroSpotlight, advanceSpotlight, endSpotlight } from './spotlightSystem';
import { INTRO_SPOTLIGHT, INTRO_SPOTLIGHT_KEY } from '@/data/spotlightTours';
import { useSpotlightStore } from '@/stores/spotlightStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';

beforeEach(() => {
  useSpotlightStore.setState({ steps: [], index: 0, active: false });
  useTutorialStore.setState({ seen: [] } as never);
  useTutorialUiStore.setState({ active: null } as never);
});

describe('스포트라이트 투어', () => {
  test('첫 호출 시작 + 멱등(이미 진행 중이면 무시)', () => {
    expect(startIntroSpotlight()).toBe(true);
    expect(useSpotlightStore.getState().active).toBe(true);
    expect(useSpotlightStore.getState().steps.length).toBe(INTRO_SPOTLIGHT.length);
    expect(startIntroSpotlight()).toBe(false);
  });

  test('맥락형 카드 표시 중이면 스포트라이트 보류(겹침 방지)', () => {
    useTutorialUiStore.setState({ active: 'intro' } as never);
    expect(startIntroSpotlight()).toBe(false);
    expect(useSpotlightStore.getState().active).toBe(false);
  });

  test('advance → 단계 증가, 마지막 다음은 자동 종료', () => {
    startIntroSpotlight();
    const n = INTRO_SPOTLIGHT.length;
    for (let i = 0; i < n - 1; i++) advanceSpotlight();
    expect(useSpotlightStore.getState().index).toBe(n - 1);
    advanceSpotlight();
    expect(useSpotlightStore.getState().active).toBe(false);
  });

  test('endSpotlight: 종료 + 계정 1회 기록 → 재노출 안 됨', () => {
    startIntroSpotlight();
    endSpotlight();
    expect(useSpotlightStore.getState().active).toBe(false);
    expect(useTutorialStore.getState().hasSeen(INTRO_SPOTLIGHT_KEY)).toBe(true);
    expect(startIntroSpotlight()).toBe(false); // 본 것 → 다시 안 뜸
  });
});
