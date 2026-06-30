// 흑화 저항·갱생 단위 테스트 — docs/13 흑화 저항 · docs/37 B8/C8.
// raiseDarkness/redeemDarkness(순수 seam) + tickDarkness(스토어 구동·상승/회복 부수효과 분리) + 5렌즈 엣지.
// random 은 모킹해 게이트를 결정론으로 검증(A/B). 스토어 의존(sect·inbox·time)은 시드/리셋.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));
jest.mock('./siblingReactionSystem', () => ({ reactToSiblingMilestone: jest.fn() }));
jest.mock('./reputationSystem', () => ({ applyAlignmentReputation: jest.fn() }));
jest.mock('@/systems/rng', () => ({ random: jest.fn(() => 0) }));

import { random } from '@/systems/rng';
import { raiseDarkness, redeemDarkness, tickDarkness } from './darknessSystem';
import { reactToSiblingMilestone } from './siblingReactionSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import { useInboxStore } from '@/stores/inboxStore';
import type { Disciple } from '@/types';

const rnd = random as jest.Mock;

// 흑화/저항만 의미있게, 나머지는 점수 통제용. score = stress*0.35 + (40-mercy)*0.6 + (45-integ)*0.4
//   + max(0,-righteousness)*1.2 + level*8 + (amb-70)*0.3 + 마공.
function mk(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, hanjaName: id, entryYear: 1, age: 15, efficiency: {}, insight: 3, fame: 0,
    martialArts: [], realm: 'iryu', realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 50, stamina: 50, maxStamina: 50, stress: 0, stats: {}, relationships: {},
    status: 'training', darknessLevel: 0, darknessRisk: 'low',
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    notes: [], ...over,
  };
}
function seed(...list: Disciple[]): void {
  useDiscipleStore.setState({ disciples: Object.fromEntries(list.map((d) => [d.id, d])), order: list.map((d) => d.id) });
}

beforeEach(() => {
  rnd.mockReturnValue(0);
  useInboxStore.getState().reset();
  useSectAtmosphereStore.getState().reset();
  useTimeStore.setState((s: object) => ({ ...s, totalDay: 7 } as never)); // day%7===0 → rollLevel
  (reactToSiblingMilestone as jest.Mock).mockClear();
});

// ── raiseDarkness (순수 seam) ──────────────────────────────────────────────
describe('raiseDarkness — 저항 게이트', () => {
  it('저항 0 → 항상 +delta (4 클램프)', () => {
    expect(raiseDarkness({ darknessLevel: 0, darknessResist: 0 }, 1)).toBe(1);
    expect(raiseDarkness({ darknessLevel: 2, darknessResist: 0 }, 5)).toBe(4); // 상한 4
  });
  it('저항 1 → 절대 안 오름(면역 아님은 시뮬에서 — 여기선 게이트 경계)', () => {
    rnd.mockReturnValue(0.99);
    expect(raiseDarkness({ darknessLevel: 0, darknessResist: 1 }, 3)).toBe(0);
  });
  it('부분 저항 — random ≥ 저항일 때만 +1 (경계)', () => {
    rnd.mockReturnValue(0.3);
    expect(raiseDarkness({ darknessLevel: 0, darknessResist: 0.5 }, 1)).toBe(0); // 0.3<0.5 차단
    rnd.mockReturnValue(0.7);
    expect(raiseDarkness({ darknessLevel: 0, darknessResist: 0.5 }, 1)).toBe(1); // 0.7≥0.5 통과
  });
  it('delta<0(능동 완화) → 단계1~2 즉시 −1(게이트 없이), 0 클램프', () => {
    rnd.mockReturnValue(0.99);
    expect(raiseDarkness({ darknessLevel: 2, darknessResist: 0.9 }, -1)).toBe(1);
    expect(raiseDarkness({ darknessLevel: 1, darknessResist: 0.9 }, -5)).toBe(0);
  });
  it('delta<0 이라도 단계 3~4는 불가역 — 못 내림(R38)', () => {
    expect(raiseDarkness({ darknessLevel: 3, darknessResist: 0 }, -1)).toBe(3);
    expect(raiseDarkness({ darknessLevel: 4, darknessResist: 0 }, -5)).toBe(4);
  });
  it('저항 미지정 → 0(즉시) 폴백', () => {
    expect(raiseDarkness({ darknessLevel: 0 } as never, 1)).toBe(1);
  });
});

// ── redeemDarkness (순수 seam) ─────────────────────────────────────────────
describe('redeemDarkness — 갱생/불가역', () => {
  it('단계 1~2만 회복(게이트 통과 시 −1)', () => {
    expect(redeemDarkness({ darknessLevel: 2, darknessResist: 0 })).toBe(1); // random 0 < 0.2 통과
    expect(redeemDarkness({ darknessLevel: 1, darknessResist: 0 })).toBe(0);
  });
  it('단계 0 → 0, 단계 3·4 → 불가역(그대로)', () => {
    expect(redeemDarkness({ darknessLevel: 0, darknessResist: 1 })).toBe(0);
    expect(redeemDarkness({ darknessLevel: 3, darknessResist: 1 })).toBe(3);
    expect(redeemDarkness({ darknessLevel: 4, darknessResist: 1 })).toBe(4);
  });
  it('게이트 — random < 0.2+0.8×저항 일 때만 회복', () => {
    rnd.mockReturnValue(0.5);
    expect(redeemDarkness({ darknessLevel: 2, darknessResist: 0 })).toBe(2); // 0.5<0.2 실패 → 유지
    expect(redeemDarkness({ darknessLevel: 2, darknessResist: 0.9 })).toBe(1); // 0.5<0.92 통과
  });
});

// ── tickDarkness (스토어 구동 + 상승/회복 부수효과 분리) ────────────────────
describe('tickDarkness — 상승/회복 분기와 부수효과 분리', () => {
  it('점수≥78 → 상승 +1, 흉조 서신·동문 darkening 반응·사문 도의−1 발생', () => {
    seed(mk('d', { stress: 100, personality: { integrity: 0, freedom: 50, warmth: 50, prudence: 50, mercy: 0, ambition: 100 } }));
    useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['d'].darknessLevel).toBe(1);
    expect(useInboxStore.getState().items.some((i) => i.id.startsWith('darkomen-'))).toBe(true);
    expect(reactToSiblingMilestone).toHaveBeenCalledWith('d', 'darkening');
    expect(useSectAtmosphereStore.getState().atmosphere.righteousness).toBe(-1); // 도의 −1
  });

  it('점수≤30 + 단계1~2 → 회복 −1, 부수효과 0(조용한 회복)', () => {
    seed(mk('d', { darknessLevel: 2, stress: 0, personality: { integrity: 100, freedom: 50, warmth: 50, prudence: 50, mercy: 100, ambition: 0 } }));
    useSectAtmosphereStore.getState().set({ righteousness: 10, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['d'].darknessLevel).toBe(1); // 회복
    expect(useInboxStore.getState().items.some((i) => i.id.startsWith('darkomen-'))).toBe(false); // 흉조 없음
    expect(reactToSiblingMilestone).not.toHaveBeenCalled();
    expect(useSectAtmosphereStore.getState().atmosphere.righteousness).toBe(10); // 평판/도의 무변
  });

  it('단계 3~4는 청정 상태여도 회복 안 됨(불가역)', () => {
    seed(mk('d', { darknessLevel: 3, stress: 0, personality: { integrity: 100, freedom: 50, warmth: 50, prudence: 50, mercy: 100, ambition: 0 } }));
    useSectAtmosphereStore.getState().set({ righteousness: 10, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['d'].darknessLevel).toBe(3);
  });

  it('중간 점수(30<score<78) → 상승·회복 모두 없음(상호배타)', () => {
    seed(mk('d', { darknessLevel: 1, stress: 100, personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 } }));
    // score = 35(stress) + 0 + 0 + 0 + 8(level1) + 0 = 43 ∈ (30,78)
    useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['d'].darknessLevel).toBe(1); // 무변
  });

  it('생애경계 — graduated/departed 제자는 스킵(상승 안 함)', () => {
    seed(
      mk('grad', { status: 'graduated', stress: 100, darknessLevel: 1, personality: { integrity: 0, freedom: 50, warmth: 50, prudence: 50, mercy: 0, ambition: 100 } }),
      mk('left', { status: 'departed', stress: 100, darknessLevel: 1, personality: { integrity: 0, freedom: 50, warmth: 50, prudence: 50, mercy: 0, ambition: 100 } }),
    );
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['grad'].darknessLevel).toBe(1);
    expect(useDiscipleStore.getState().disciples['left'].darknessLevel).toBe(1);
  });

  it('id 독립 — 한 제자 상승이 다른 제자 레벨을 오염시키지 않음', () => {
    seed(
      mk('dark', { stress: 100, personality: { integrity: 0, freedom: 50, warmth: 50, prudence: 50, mercy: 0, ambition: 100 } }),
      mk('clean', { stress: 0, personality: { integrity: 100, freedom: 50, warmth: 50, prudence: 50, mercy: 100, ambition: 0 } }),
    );
    useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['dark'].darknessLevel).toBe(1);
    expect(useDiscipleStore.getState().disciples['clean'].darknessLevel).toBe(0); // 무영향
  });
});

// ── 흉조 서신 조사(사각 ⑪ — 화면 표시 텍스트 미검증) ────────────────────────
// OMEN 레벨 2·4가 주격조사를 하드코딩 "이"로 박아, 받침 없는 이름(이청하·진소화)이면 "이청하이 홀로"로
// 깨졌다(올바른 건 "이청하가"). 기존 테스트는 영문 id('d')·레벨1("의" 불변)만 거쳐 못 잡았다. docs/37 R51.
function highScore(): Partial<Disciple> {
  return { stress: 100, personality: { integrity: 0, freedom: 50, warmth: 50, prudence: 50, mercy: 0, ambition: 100 } };
}
function omenBody(): string | undefined {
  return useInboxStore.getState().items.find((i) => i.id.startsWith('darkomen-'))?.body;
}
describe('tickDarkness — 흉조 서신 조사(받침 없는 이름)', () => {
  it('레벨2 흉조 — "이청하가 홀로"(정상), "이청하이"(깨짐) 아님', () => {
    seed(mk('이청하', { darknessLevel: 1, darknessResist: 0, ...highScore() }));
    useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['이청하'].darknessLevel).toBe(2);
    expect(omenBody()).toContain('이청하가 홀로');
    expect(omenBody()).not.toContain('이청하이');
  });
  it('레벨4 흉조 — "이청하가 무언가"(정상), "이청하이" 아님', () => {
    seed(mk('이청하', { darknessLevel: 3, darknessResist: 0, ...highScore() }));
    useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 });
    tickDarkness();
    expect(useDiscipleStore.getState().disciples['이청하'].darknessLevel).toBe(4);
    expect(omenBody()).toContain('이청하가 무언가');
    expect(omenBody()).not.toContain('이청하이');
  });
});
