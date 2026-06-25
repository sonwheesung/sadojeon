// 엔진/시스템 단위 — 맥락형 튜토리얼 트리거·종료 규칙(docs/40 §1, docs/44).
// triggerTutorial: 처음만 활성화 · 이미 본 주제·다른 안내 표시중·미등록 주제는 무시.
// dismissTutorial: 본 것으로 기록 + 화면에서 내림. 계정 저장은 mock(여기선 호출만 확인 불요).
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));

import { triggerTutorial, dismissTutorial } from './tutorialSystem';
import { TUTORIALS } from '@/data/tutorials';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialUiStore } from '@/stores/tutorialUiStore';

beforeEach(() => {
  useTutorialStore.setState({ seen: [] });
  useTutorialUiStore.setState({ active: null });
});

describe('튜토리얼 데이터 정합', () => {
  it('모든 주제는 맵 key 와 topic.key 가 일치하고, 카드가 비어 있지 않다', () => {
    for (const [mapKey, topic] of Object.entries(TUTORIALS)) {
      expect(topic.key).toBe(mapKey);
      expect(topic.cards.length).toBeGreaterThan(0);
      for (const c of topic.cards) {
        expect(c.seal).toBeTruthy();
        expect(c.title).toBeTruthy();
        expect(c.body).toBeTruthy();
      }
    }
  });

  it('현재 배선된 주제(intro·schedule·quest·inbox·activity·alchemy·fastforward)가 모두 등록돼 있다', () => {
    for (const key of ['intro', 'schedule', 'quest', 'inbox', 'activity', 'alchemy', 'fastforward']) {
      expect(TUTORIALS[key]).toBeTruthy();
    }
  });
});

describe('triggerTutorial — 반환값(첫 안내 여부)', () => {
  it('처음 마주친 주제 → true(이번에 띄움) + 활성화', () => {
    expect(triggerTutorial('fastforward')).toBe(true);
    expect(useTutorialUiStore.getState().active).toBe('fastforward');
  });

  it('이미 본 주제 → false(안 띄움)', () => {
    useTutorialStore.setState({ seen: ['fastforward'] });
    expect(triggerTutorial('fastforward')).toBe(false);
    expect(useTutorialUiStore.getState().active).toBeNull();
  });

  it('다른 안내가 떠 있으면 → false(겹침 방지)', () => {
    triggerTutorial('intro');
    expect(triggerTutorial('fastforward')).toBe(false);
    expect(useTutorialUiStore.getState().active).toBe('intro');
  });

  it('미등록 주제 → false', () => {
    expect(triggerTutorial('does-not-exist')).toBe(false);
  });
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
