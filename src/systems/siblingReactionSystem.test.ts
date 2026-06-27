// 동문 경사·이변 반응 — reactToSiblingMilestone 단위. docs/12.
// 경지 상승(질투/축하)·중상(걱정)이 관계·경지 차등으로 동문에 전이형 마커를 남기는지 검증.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));

import { reactToSiblingMilestone } from './siblingReactionSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, RelationLevel, Realm } from '@/types';

const DAY = 1000;

function mk(
  id: string,
  rel: RelationLevel | undefined,
  over: Partial<Disciple> = {},
): Disciple {
  return {
    id,
    name: id,
    hanjaName: id,
    entryYear: 1,
    age: 15,
    efficiency: {},
    insight: 3,
    fame: 0,
    martialArts: [],
    realm: 'iryu', // 관측자 기본 경지(당사자보다 낮게 두면 behind)
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 50,
    stamina: 50,
    maxStamina: 50,
    stress: 0,
    stats: {},
    relationships: rel ? { rising: rel } : {}, // 당사자 id='rising'
    status: 'training',
    darknessLevel: 0,
    darknessRisk: 'low',
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    notes: [],
    ...over,
  };
}

function seed(...list: Disciple[]): void {
  useDiscipleStore.setState({
    disciples: Object.fromEntries(list.map((d) => [d.id, d])),
    order: list.map((d) => d.id),
  });
}

beforeEach(() => {
  useTimeStore.setState((s: { totalDay: number }) => ({ ...s, totalDay: DAY } as never));
});

describe('reactToSiblingMilestone — 경지 상승 반응(질투/축하)', () => {
  it('가까운 동문(벗/의형제)은 축하(admire)', () => {
    seed(
      mk('rising', undefined, { realm: 'jeoljeong' as Realm }), // 당사자(올림)
      mk('friend1', 'friend'),
      mk('sworn1', 'sworn'),
    );
    reactToSiblingMilestone('rising', 'realm_up');
    const d = useDiscipleStore.getState().disciples;
    expect(d['friend1'].siblingEventMood).toBe('admire');
    expect(d['friend1'].siblingEventUntilDay).toBe(DAY + 14);
    expect(d['sworn1'].siblingEventMood).toBe('admire');
  });

  it('뒤처진 라이벌(소원/원수 또는 야망高)은 질투(envy)', () => {
    seed(
      mk('rising', undefined, { realm: 'jeoljeong' as Realm }),
      mk('distant1', 'distant', { realm: 'iryu' as Realm }), // 뒤처짐 + 소원 → 질투
      mk('ambit1', 'neutral', { realm: 'iryu' as Realm, personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 70 } }), // 뒤처짐 + 야망70 → 질투
    );
    reactToSiblingMilestone('rising', 'realm_up');
    const d = useDiscipleStore.getState().disciples;
    expect(d['distant1'].siblingEventMood).toBe('envy');
    expect(d['ambit1'].siblingEventMood).toBe('envy');
  });

  it('무관·차분한 동문(뒤처져도 야망 낮고 무관)은 반응 없음', () => {
    seed(
      mk('rising', undefined, { realm: 'jeoljeong' as Realm }),
      mk('calm1', 'neutral', { realm: 'iryu' as Realm }), // 뒤처짐이나 무관+야망50 → 반응 없음
    );
    reactToSiblingMilestone('rising', 'realm_up');
    expect(useDiscipleStore.getState().disciples['calm1'].siblingEventMood).toBeUndefined();
  });

  it('이미 앞선 동문은 질투 안 함(behind=false)', () => {
    seed(
      mk('rising', undefined, { realm: 'iryu' as Realm }),
      mk('ahead1', 'distant', { realm: 'jeoljeong' as Realm }), // 더 높은 경지 → 질투 X
    );
    reactToSiblingMilestone('rising', 'realm_up');
    expect(useDiscipleStore.getState().disciples['ahead1'].siblingEventMood).toBeUndefined();
  });
});

describe('reactToSiblingMilestone — 중상 반응(걱정)', () => {
  it('원수 외 전원 걱정(worry), 원수는 반응 없음', () => {
    seed(
      mk('rising', undefined),
      mk('friend1', 'friend'),
      mk('neutral1', undefined),
      mk('enemy1', 'enemy'),
    );
    reactToSiblingMilestone('rising', 'injured');
    const d = useDiscipleStore.getState().disciples;
    expect(d['friend1'].siblingEventMood).toBe('worry');
    expect(d['friend1'].siblingEventUntilDay).toBe(DAY + 21);
    expect(d['neutral1'].siblingEventMood).toBe('worry');
    expect(d['enemy1'].siblingEventMood).toBeUndefined(); // 원수의 부상엔 걱정 X
  });
});

describe('reactToSiblingMilestone — 공통(제외·당사자·창)', () => {
  it('당사자 자신·졸업·하산자는 제외', () => {
    seed(
      mk('rising', undefined, { realm: 'jeoljeong' as Realm }),
      mk('grad', 'friend', { status: 'graduated' }),
      mk('gone', 'friend', { status: 'departed' }),
    );
    reactToSiblingMilestone('rising', 'realm_up');
    const d = useDiscipleStore.getState().disciples;
    expect(d['rising'].siblingEventMood).toBeUndefined();
    expect(d['grad'].siblingEventMood).toBeUndefined();
    expect(d['gone'].siblingEventMood).toBeUndefined();
  });
});
