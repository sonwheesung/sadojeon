// 엔진/시스템 단위 — 맥락형 튜토리얼 트리거·종료 규칙(docs/40 §1, docs/44).
// triggerTutorial: 처음만 활성화 · 이미 본 주제·다른 안내 표시중·미등록 주제는 무시.
// dismissTutorial: 본 것으로 기록 + 화면에서 내림. 계정 저장은 mock(여기선 호출만 확인 불요).
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));

import { triggerTutorial, dismissTutorial } from './tutorialSystem';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';

beforeEach(() => {
  useTutorialStore.setState({ seen: [] });
  useTutorialUiStore.setState({ active: null });
});

describe('맥락형 튜토리얼 — 트리거', () => {
  it('처음 마주친 주제 → 그 자리에서 활성화', () => {
    triggerTutorial('alchemy');
    expect(useTutorialUiStore.getState().active).toBe('alchemy');
  });

  it('이미 본 주제 → 다시 뜨지 않음', () => {
    useTutorialStore.setState({ seen: ['alchemy'] });
    triggerTutorial('alchemy');
    expect(useTutorialUiStore.getState().active).toBeNull();
  });

  it('다른 안내가 떠 있으면 새 트리거 무시(겹침 방지)', () => {
    triggerTutorial('intro');
    triggerTutorial('alchemy');
    expect(useTutorialUiStore.getState().active).toBe('intro');
  });

  it('등록되지 않은 주제 → 무시(오타·미작성 안전)', () => {
    triggerTutorial('does-not-exist');
    expect(useTutorialUiStore.getState().active).toBeNull();
  });
});

describe('맥락형 튜토리얼 — 종료', () => {
  it('dismiss → 본 것으로 기록 + 화면에서 내림', () => {
    triggerTutorial('alchemy');
    dismissTutorial();
    expect(useTutorialStore.getState().hasSeen('alchemy')).toBe(true);
    expect(useTutorialUiStore.getState().active).toBeNull();
  });

  it('종료 후 같은 주제 재트리거 → 다시 뜨지 않음(계정 1회)', () => {
    triggerTutorial('alchemy');
    dismissTutorial();
    triggerTutorial('alchemy');
    expect(useTutorialUiStore.getState().active).toBeNull();
  });
});
