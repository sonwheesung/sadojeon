// 동문 상실 애도 파급 — mournLostSibling 단위. docs/12 · docs/37 OL5.
// 의뢰 재난 사망 → 활성 생존 제자에 친밀 차등 스트레스+애도 마커. supabase/runSync 는 jest env 없어 스텁.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));

import { mournLostSibling } from './mournSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import type { Disciple, RelationLevel } from '@/types';

const DAY = 1000;

function mk(id: string, rel: RelationLevel | undefined, over: Partial<Disciple> = {}): Disciple {
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
    realm: 'samryu',
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 50,
    stamina: 50,
    maxStamina: 50,
    stress: 0,
    stats: {},
    relationships: rel ? { dead: rel } : {}, // 죽은 제자 id='dead'
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

describe('mournLostSibling — 친밀 차등 애도 파급', () => {
  it('의형제/벗/무관/원수별 스트레스·애도기간 차등', () => {
    seed(
      mk('dead', undefined, { status: 'departed' }),
      mk('sworn1', 'sworn'),
      mk('friend1', 'friend'),
      mk('neutral1', undefined), // 관계 없음 → neutral 폴백
      mk('enemy1', 'enemy'),
    );
    mournLostSibling('dead');
    const d = useDiscipleStore.getState().disciples;
    expect(d['sworn1'].stress).toBe(18);
    expect(d['sworn1'].mourningUntilDay).toBe(DAY + 56);
    expect(d['friend1'].stress).toBe(12);
    expect(d['friend1'].mourningUntilDay).toBe(DAY + 42);
    expect(d['neutral1'].stress).toBe(6);
    expect(d['neutral1'].mourningUntilDay).toBe(DAY + 28);
    expect(d['enemy1'].stress).toBe(2);
    expect(d['enemy1'].mourningUntilDay).toBe(DAY + 14);
  });

  it('죽은 제자 자신·졸업·하산자는 애도 파급 제외', () => {
    seed(
      mk('dead', undefined, { status: 'departed', stress: 0 }),
      mk('grad', 'friend', { status: 'graduated' }),
      mk('gone', 'friend', { status: 'departed' }),
      mk('alive', 'friend'),
    );
    mournLostSibling('dead');
    const d = useDiscipleStore.getState().disciples;
    expect(d['dead'].stress).toBe(0); // 자신 무변
    expect(d['dead'].mourningUntilDay).toBeUndefined();
    expect(d['grad'].mourningUntilDay).toBeUndefined(); // 졸업 제외
    expect(d['gone'].mourningUntilDay).toBeUndefined(); // 하산/사망 제외
    expect(d['alive'].stress).toBe(12); // 활성만 파급
    expect(d['alive'].mourningUntilDay).toBe(DAY + 42);
  });

  it('중복 상실 — mourningUntilDay 는 더 긴 쪽으로 연장(max)', () => {
    seed(
      mk('dead', undefined, { status: 'departed' }),
      mk('s', 'neutral', { mourningUntilDay: DAY + 100 }), // 기존 애도 100일 > neutral 28일
    );
    mournLostSibling('dead');
    expect(useDiscipleStore.getState().disciples['s'].mourningUntilDay).toBe(DAY + 100); // 기존 유지(max)
  });

  it('동문 상실은 사문 결속(unity)을 흔든다(소폭↓) — gap-hunt 2차', () => {
    useSectAtmosphereStore.getState().reset();
    seed(mk('dead', undefined, { status: 'departed' }), mk('s', 'friend'));
    const before = useSectAtmosphereStore.getState().atmosphere.unity;
    mournLostSibling('dead');
    expect(useSectAtmosphereStore.getState().atmosphere.unity).toBe(before - 2);
  });
});
