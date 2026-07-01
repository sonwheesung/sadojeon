// 경제 월간 수지 단위 테스트 — docs/09 경제 시스템(후원 ×37 · 파산 4단계 페널티).
// 핵심 계약: ① 후원 계수 37 ② 파산 단계 = 곳간 절대값 ③ "마음만 친다"(스트레스·신뢰만, 수련 malus 없음)
//   ④ 제자 이탈 0(가출·하산 미배선 — 회차는 정상 졸업·사망으로만 종결).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import {
  bankruptcyTier,
  monthlyPatronage,
  monthlyFoodCost,
  tickMonthlyEconomy,
  setFoodCost,
  setLabUpkeep,
  setPatronageMult,
} from './economySystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useSectStore } from '@/stores/sectStore';
import type { Disciple, SectState } from '@/types';

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
function seedDisciples(...list: Disciple[]): void {
  useDiscipleStore.setState({ disciples: Object.fromEntries(list.map((d) => [d.id, d])), order: list.map((d) => d.id) });
}
function seedSect(over: Partial<SectState> = {}): void {
  useSectStore.getState().setSect({
    name: '무명산문', hanjaName: '無名山門', reputation: 0, resources: 5000, facilities: [], bankruptStreak: 0, ...over,
  });
}
const d = (id: string) => useDiscipleStore.getState().disciples[id];

beforeEach(() => {
  setFoodCost(20);
  setLabUpkeep(100);
  setPatronageMult(1);
  seedDisciples();
  seedSect();
});

// ── 후원 계수(경계선 확정값 37) ──────────────────────────────────────────
describe('monthlyPatronage — 계수 37(구 25의 ×1.5)', () => {
  it('명성 비례 · floor(rep/10)×37', () => {
    expect(monthlyPatronage(10)).toBe(37);
    expect(monthlyPatronage(50)).toBe(185);
    expect(monthlyPatronage(90)).toBe(333);
    expect(monthlyPatronage(9)).toBe(0); // floor(9/10)=0
  });
  it('patronageMult 레버 반영', () => {
    setPatronageMult(2);
    expect(monthlyPatronage(50)).toBe(370);
  });
});

// ── 식비 비선형(회귀 고정) ────────────────────────────────────────────────
describe('monthlyFoodCost — 비선형 k=0.08', () => {
  it('1명20·2명43·3명70·4명99', () => {
    expect(monthlyFoodCost(1)).toBe(20);
    expect(monthlyFoodCost(2)).toBe(43);
    expect(monthlyFoodCost(3)).toBe(70);
    expect(monthlyFoodCost(4)).toBe(99);
    expect(monthlyFoodCost(0)).toBe(0);
  });
});

// ── 파산 단계 판정 경계 ────────────────────────────────────────────────────
describe('bankruptcyTier — 곳간 절대값 경계', () => {
  it('800/200/0 경계', () => {
    expect(bankruptcyTier(800)).toBe('ok');
    expect(bankruptcyTier(799)).toBe('low');
    expect(bankruptcyTier(200)).toBe('low');
    expect(bankruptcyTier(199)).toBe('poor');
    expect(bankruptcyTier(1)).toBe('poor');
    expect(bankruptcyTier(0)).toBe('broke');
  });
});

// ── tickMonthlyEconomy — 수지 + 파산 페널티 ────────────────────────────────
describe('tickMonthlyEconomy — 수지', () => {
  it('여유 = 페널티 없음(스트레스·신뢰 불변)', () => {
    seedSect({ resources: 5000, reputation: 0 });
    seedDisciples(mk('a', { stress: 10, trustToMaster: 50 }));
    tickMonthlyEconomy();
    expect(useSectStore.getState().sect?.resources).toBe(4980); // 식비 20
    expect(d('a').stress).toBe(10);
    expect(d('a').trustToMaster).toBe(50);
  });

  it('후원금 수입 반영(명성50 → +185)', () => {
    seedSect({ resources: 100, reputation: 50 }); // 제자 0 → 식비 0
    tickMonthlyEconomy();
    expect(useSectStore.getState().sect?.resources).toBe(285);
  });

  it('빈곤(<200) = 전원 스트레스 +2, 신뢰 불변', () => {
    seedSect({ resources: 150, reputation: 0 });
    seedDisciples(mk('a', { stress: 0, trustToMaster: 40 }), mk('b', { stress: 5, trustToMaster: 60 }));
    // 식비 2명 43 → 107 (여전히 <200 = 빈곤)
    tickMonthlyEconomy();
    expect(useSectStore.getState().sect?.resources).toBe(107);
    expect(d('a').stress).toBe(2);
    expect(d('b').stress).toBe(7);
    expect(d('a').trustToMaster).toBe(40); // 빈곤은 신뢰 안 깎음
  });

  it('파산(0) = 스트레스 +4 · 신뢰 -2 · streak 1', () => {
    seedSect({ resources: 10, reputation: 0 });
    seedDisciples(mk('a', { stress: 0, trustToMaster: 50 }));
    tickMonthlyEconomy(); // 식비 20 → clamp 0 = 파산
    expect(useSectStore.getState().sect?.resources).toBe(0);
    expect(d('a').stress).toBe(4);
    expect(d('a').trustToMaster).toBe(48);
    expect(useSectStore.getState().sect?.bankruptStreak).toBe(1);
  });

  it('장기파산(0 연속 3개월) = 신뢰 추가 -2 · 명성 -5', () => {
    // 명성 8 = 후원 0(floor(8/10)=0)이라 곳간이 0에 머물러 파산 유지. 식비가 곳간을 0으로.
    seedSect({ resources: 0, reputation: 8, bankruptStreak: 2 });
    seedDisciples(mk('a', { stress: 0, trustToMaster: 50 }));
    tickMonthlyEconomy(); // streak 2→3
    expect(useSectStore.getState().sect?.bankruptStreak).toBe(3);
    expect(d('a').stress).toBe(4);
    expect(d('a').trustToMaster).toBe(46); // -2(파산) -2(장기)
    expect(useSectStore.getState().sect?.reputation).toBe(3); // 8 -5
  });

  it('파산 벗어나면 streak 0으로 리셋', () => {
    seedSect({ resources: 5000, reputation: 0, bankruptStreak: 4 });
    seedDisciples(mk('a'));
    tickMonthlyEconomy();
    expect(useSectStore.getState().sect?.bankruptStreak).toBe(0);
  });

  // ── 불변식: 파산이 제자를 사문에서 빼지 않는다(가출·하산 미배선). docs/03·09 ──
  it('제자 이탈 0 — 파산·장기파산에도 status 불변(가출 없음)', () => {
    seedSect({ resources: 0, reputation: 0, bankruptStreak: 5 });
    seedDisciples(mk('a', { status: 'training' }), mk('b', { status: 'training' }));
    for (let i = 0; i < 12; i += 1) tickMonthlyEconomy(); // 1년 방치
    expect(d('a').status).toBe('training');
    expect(d('b').status).toBe('training');
    expect(useDiscipleStore.getState().order).toHaveLength(2); // 아무도 안 사라짐
  });

  it('졸업·하산 제자는 페널티 대상 아님', () => {
    seedSect({ resources: 0, reputation: 0 });
    seedDisciples(mk('g', { status: 'graduated', stress: 0, trustToMaster: 50 }));
    tickMonthlyEconomy(); // 활동 제자 0 → 식비 0, but 파산 판정
    expect(d('g').stress).toBe(0); // 졸업자엔 미적용
    expect(d('g').trustToMaster).toBe(50);
  });
});
