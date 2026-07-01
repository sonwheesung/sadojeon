// 몰래 하산(환멸 이탈) 단위 테스트 — docs/51.
// 계약: ① 게이트(저신뢰+고스트레스+선하고 자유로운 기질) ② 결정론 카운터(개입 시 리셋)
//   ③ 임계 도달 시 status='runaway'(+partingForm) — 사망(departed) 아님 ④ 경고 서신 예고
//   ⑤ 떠남·의뢰·연단 중 제자는 스킵 ⑥ 5렌즈(생애경계·id충돌).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import { isDisillusioned, tickSecretDeparture, SECRET_DEPARTURE } from './secretDepartureSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';

// 환멸 조건을 채운 제자(선하고 자유로운데 저신뢰·고스트레스로 방치). over 로 한 축씩 깬다.
function dis(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, hanjaName: id, entryYear: 1, age: 18, efficiency: {}, insight: 3, fame: 0,
    martialArts: [], realm: 'iryu', realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 10, stamina: 50, maxStamina: 50, stress: 80, stats: {}, relationships: {},
    status: 'training', darknessLevel: 0, darknessRisk: 'low',
    personality: { integrity: 70, freedom: 70, warmth: 50, prudence: 50, mercy: 70, ambition: 50 },
    notes: [], ...over,
  };
}
function seed(...list: Disciple[]): void {
  useDiscipleStore.setState({ disciples: Object.fromEntries(list.map((d) => [d.id, d])), order: list.map((d) => d.id) });
}
const d = (id: string) => useDiscipleStore.getState().disciples[id];

beforeEach(() => {
  useInboxStore.getState().reset();
  useTimeStore.setState((s: object) => ({ ...s, totalDay: 30 } as never));
});

// ── 게이트(순수 함수) ──────────────────────────────────────────────────────
describe('isDisillusioned — 게이트', () => {
  it('모든 축 충족 → true', () => {
    expect(isDisillusioned(dis('a'))).toBe(true);
  });
  it('신뢰가 임계보다 높으면 false', () => {
    expect(isDisillusioned(dis('a', { trustToMaster: SECRET_DEPARTURE.TRUST_MAX + 1 }))).toBe(false);
  });
  it('스트레스가 임계보다 낮으면 false', () => {
    expect(isDisillusioned(dis('a', { stress: SECRET_DEPARTURE.STRESS_MIN - 1 }))).toBe(false);
  });
  it('자비 낮으면(흑화 쪽 기질) false — 이 아이는 안 떠남', () => {
    expect(isDisillusioned(dis('a', { personality: { integrity: 70, freedom: 70, warmth: 50, prudence: 50, mercy: 30, ambition: 50 } }))).toBe(false);
  });
  it('freedom 낮으면(견디는 기질) false', () => {
    expect(isDisillusioned(dis('a', { personality: { integrity: 70, freedom: 20, warmth: 50, prudence: 50, mercy: 70, ambition: 50 } }))).toBe(false);
  });
});

// ── 카운터·발화 ────────────────────────────────────────────────────────────
describe('tickSecretDeparture — 카운터·발화', () => {
  it('환멸 지속 시 매월 +1', () => {
    seed(dis('a'));
    tickSecretDeparture();
    expect(d('a').disillusionMonths).toBe(1);
    tickSecretDeparture();
    expect(d('a').disillusionMonths).toBe(2);
  });

  it('WARN_MONTHS 도달 시 경고 서신 1회(정보성 report, 진행 안 막음)', () => {
    seed(dis('a'));
    for (let i = 0; i < SECRET_DEPARTURE.WARN_MONTHS; i += 1) tickSecretDeparture();
    const warn = useInboxStore.getState().items.find((it) => it.id.startsWith('runaway-warn-'));
    expect(warn).toBeTruthy();
    expect(warn?.kind).toBe('report'); // 결정형 아님 = 진행 게이트 안 막음
    expect(d('a').status).toBe('training'); // 아직 안 떠남
  });

  it('DEPART_MONTHS 도달 시 결정론 발화 = runaway(+partingForm secret), 카운터 0', () => {
    seed(dis('a'));
    for (let i = 0; i < SECRET_DEPARTURE.DEPART_MONTHS; i += 1) tickSecretDeparture();
    expect(d('a').status).toBe('runaway');
    expect(d('a').partingForm).toBe('secret');
    expect(d('a').disillusionMonths).toBe(0);
    expect(useInboxStore.getState().items.some((it) => it.id === `runaway-a-30`)).toBe(true);
  });

  it('떠난 뒤엔 더 이상 tick 영향 없음(present 아님)', () => {
    seed(dis('a'));
    for (let i = 0; i < SECRET_DEPARTURE.DEPART_MONTHS; i += 1) tickSecretDeparture();
    const before = d('a');
    tickSecretDeparture();
    expect(d('a').status).toBe('runaway');
    expect(d('a')).toEqual(before); // 변화 없음
  });

  // ── 개입 창 — 조건 깨지면 리셋(면담·휴식으로 신뢰↑·스트레스↓) ──
  it('개입(신뢰 회복)하면 카운터 0으로 리셋 → 안 떠남', () => {
    seed(dis('a'));
    tickSecretDeparture();
    tickSecretDeparture();
    expect(d('a').disillusionMonths).toBe(2);
    useDiscipleStore.getState().update('a', { trustToMaster: 60 }); // 면담으로 신뢰 회복
    tickSecretDeparture();
    expect(d('a').disillusionMonths).toBe(0);
    for (let i = 0; i < 6; i += 1) tickSecretDeparture();
    expect(d('a').status).toBe('training'); // 개입했으니 영영 안 떠남
  });

  // ── 5렌즈: 생애경계 — 떠남·졸업·의뢰 중 제자는 스킵 ──
  it('졸업·의뢰·연단 중 제자는 판정 스킵(카운터 안 오름)', () => {
    seed(
      dis('grad', { status: 'graduated' }),
      dis('quest', { status: 'questing' }),
      dis('craft', { status: 'crafting' }),
    );
    for (let i = 0; i < SECRET_DEPARTURE.DEPART_MONTHS + 2; i += 1) tickSecretDeparture();
    expect(d('grad').status).toBe('graduated');
    expect(d('quest').status).toBe('questing');
    expect(d('craft').status).toBe('crafting');
    expect(d('quest').disillusionMonths ?? 0).toBe(0);
  });

  it('injured(사문에 머무는 상태)는 판정 대상', () => {
    seed(dis('a', { status: 'injured' }));
    for (let i = 0; i < SECRET_DEPARTURE.DEPART_MONTHS; i += 1) tickSecretDeparture();
    expect(d('a').status).toBe('runaway');
  });
});
