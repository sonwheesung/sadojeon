// 화면 표기 — 서신함 선택지 라벨 placeholder 치환(R40, docs/37). docs/40 §화면.
// 버그: 본문(시나리오)은 {name}/{sibling}/{rival} 치환되는데 **선택지 라벨만 raw 적재**돼
// 화면 버튼에 "{sibling} 앞에서…"·"{rival}가 아니라…"가 그대로 노출됐다.
// 이 테스트는 서신함 적재→옵션 빌더(responseOptionsFor) 경로로 라벨이 치환됨을 단언(A/B).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));
// 면담 트리거를 결정적으로 — random()<0.22 통과 + 면담 픽을 {rival} 라벨 가짜로 고정. fillMeetingBody 는 실제.
jest.mock('@/systems/rng', () => ({ ...jest.requireActual('@/systems/rng'), random: () => 0 }));
jest.mock('@/data/scenarios/meetings', () => {
  const actual = jest.requireActual('@/data/scenarios/meetings');
  return {
    ...actual,
    pickContextualMeeting: () => ({
      id: 'm-test-rival',
      band: 'growth',
      body: '{rival} 얘기를 좀 하고 싶습니다.',
      options: [
        { key: 'compare', label: '이겨야 할 상대는 {rival}가 아니라 네 마음이다.', effects: {} },
        { key: 'plain', label: '마음을 가다듬거라.', effects: {} },
      ],
    }),
  };
});

import { moralToInbox } from './eventInbox';
import { triggerDailyMeeting } from './meetingSystem';
import { responseOptionsFor } from './inboxResolve';
import { useInboxStore } from '@/stores/inboxStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { PendingMoralEvent, Disciple, PersonalityTraits } from '@/types';

const NEUTRAL: PersonalityTraits = { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 };
function mk(over: Partial<Disciple> = {}): Disciple {
  return {
    id: 'i-cheongha', name: '이청하', hanjaName: '李淸河', entryYear: 1, age: 11,
    efficiency: {}, insight: 3, fame: 0, martialArts: [], realm: 'samryu',
    realmProgress: { internal: 0, pity: 0, petitioned: false }, trustToMaster: 30,
    stamina: 50, maxStamina: 50, stress: 0, stats: {}, relationships: {},
    status: 'training', darknessLevel: 0, darknessRisk: 'low', personality: { ...NEUTRAL },
    notes: [], ...over,
  } as Disciple;
}

beforeEach(() => {
  useInboxStore.setState({ items: [] });
  useTimeStore.setState({ totalDay: 1 } as never);
});

describe('R40 서신함 선택지 라벨 placeholder 치환', () => {
  it('도덕 이벤트 — {name}/{sibling} 라벨이 실명으로 치환되고 날것 {} 0', () => {
    const pending: PendingMoralEvent = {
      templateId: 'test-moral', tier: 'archetype', category: 'neglect',
      discipleId: 'i-cheongha', discipleName: '이청하',
      siblingId: 'yun-soso', siblingName: '윤소소',
      body: '이미 치환된 본문', hint: undefined,
      choices: [
        { tone: 'admonish', label: '"{sibling} 앞에서 사과해라."', perpetrator: {} },
        { tone: 'overlook', label: '(다친 사람만 챙긴다. {name}에게는 말하지 않는다.)', perpetrator: {} },
        { tone: 'punish', label: '모든 제자 앞에서 책망한다.', perpetrator: {} },
        { tone: 'seclusion', label: '보름 폐관.', perpetrator: {} },
      ],
      createdAtDay: 1,
    };
    moralToInbox(pending);
    const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string })?.domain === 'moral');
    expect(item).toBeDefined();
    const opts = responseOptionsFor(item!);
    const byKey = (k: string) => opts.find((o) => o.key === k)!;
    expect(byKey('admonish').label).toBe('"윤소소 앞에서 사과해라."');
    expect(byKey('overlook').label).toBe('(다친 사람만 챙긴다. 이청하에게는 말하지 않는다.)');
    opts.forEach((o) => expect(o.label).not.toMatch(/\{(name|sibling)\}/));
  });

  it('R52 — 받침 없는 이름 라벨 조사 교정({sibling}은→"윤소소는", {name}을→"이청하를")', () => {
    // 옛 수동 .replace 는 조사를 안 고쳐 "윤소소은/윤소소이/이청하을"로 깨졌다(받침 없는 이름).
    // 기존 R40 케이스는 placeholder 뒤가 공백·"에게"(조사 아님)라 깨짐을 못 잡던 사각.
    const pending: PendingMoralEvent = {
      templateId: 'test-josa', tier: 'archetype', category: 'neglect',
      discipleId: 'i-cheongha', discipleName: '이청하',
      siblingId: 'yun-soso', siblingName: '윤소소',
      body: '본문', hint: undefined,
      choices: [
        { tone: 'admonish', label: '{sibling}은 끝내 말이 없다.', perpetrator: {} },
        { tone: 'overlook', label: '{sibling}이 어깨를 감싸 쥔다.', perpetrator: {} },
        { tone: 'punish', label: '동문들이 {name}을 멀리한다.', perpetrator: {} },
        { tone: 'seclusion', label: '폐관.', perpetrator: {} },
      ],
      createdAtDay: 1,
    };
    moralToInbox(pending);
    const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string })?.domain === 'moral');
    const opts = responseOptionsFor(item!);
    const byKey = (k: string) => opts.find((o) => o.key === k)!;
    expect(byKey('admonish').label).toBe('윤소소는 끝내 말이 없다.');
    expect(byKey('overlook').label).toBe('윤소소가 어깨를 감싸 쥔다.');
    expect(byKey('punish').label).toBe('동문들이 이청하를 멀리한다.');
    opts.forEach((o) => {
      expect(o.label).not.toContain('윤소소은');
      expect(o.label).not.toContain('윤소소이');
      expect(o.label).not.toContain('이청하을');
    });
  });

  it('도덕 이벤트 — 동문 없는(siblingName 미지정) 경우 {sibling}→"동문" 폴백', () => {
    const pending: PendingMoralEvent = {
      templateId: 'test-solo', tier: 'universal', category: 'lie',
      discipleId: 'jang-cheol', discipleName: '장철',
      siblingId: undefined, siblingName: undefined,
      body: '본문', hint: undefined,
      choices: [
        { tone: 'admonish', label: '{sibling}에게 사과시킨다.', perpetrator: {} },
        { tone: 'punish', label: '책망.', perpetrator: {} },
        { tone: 'seclusion', label: '폐관.', perpetrator: {} },
        { tone: 'overlook', label: '눈감는다.', perpetrator: {} },
      ],
      createdAtDay: 1,
    };
    moralToInbox(pending);
    const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string })?.domain === 'moral');
    const opts = responseOptionsFor(item!);
    expect(opts.find((o) => o.key === 'admonish')!.label).toBe('동문에게 사과시킨다.');
    opts.forEach((o) => expect(o.label).not.toContain('{'));
  });

  it('면담 — 옵션 라벨의 {rival} 이 치환되고 날것 {} 0', () => {
    useDiscipleStore.setState({ order: ['i-cheongha'], disciples: { 'i-cheongha': mk() } } as never);
    triggerDailyMeeting();
    const item = useInboxStore.getState().items.find((i) => (i.payload as { domain?: string })?.domain === 'meeting');
    expect(item).toBeDefined();
    const opts = responseOptionsFor(item!);
    expect(opts.length).toBe(2);
    opts.forEach((o) => expect(o.label).not.toContain('{'));
    // {rival} 가 실제로 무언가로 치환됨(라이벌 없으면 '동문' 폴백) — raw 토큰 미잔존
    expect(opts.find((o) => o.key === 'compare')!.label).not.toContain('rival');
  });
});
