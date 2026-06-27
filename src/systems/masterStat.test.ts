// 사부 스탯 Option C — 스케일(MS1 봉합)·거울·통찰 성장. docs/02·37.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));

import { masterStatStar, deriveExperience, derivePrestige } from '@/types/master';
import { applyMeetingChoice } from './meetingSystem';
import { useMasterStore } from '@/stores/masterStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Master, Disciple } from '@/types';

describe('masterStatStar — 0~100 → ★1~5 단일 진실 (MS1)', () => {
  it('경계 매핑(0~100)', () => {
    expect(masterStatStar(0)).toBe(1);
    expect(masterStatStar(19)).toBe(1);
    expect(masterStatStar(20)).toBe(2);
    expect(masterStatStar(40)).toBe(3);
    expect(masterStatStar(60)).toBe(4);
    expect(masterStatStar(80)).toBe(5);
    expect(masterStatStar(100)).toBe(5);
  });
  it('옛 버그값 3은 ★1(최하) — 시작 DEFAULT 가 3이면 통찰 최하였음', () => {
    expect(masterStatStar(3)).toBe(1);
  });
});

describe('deriveExperience / derivePrestige — 거울(비게이트 표시)', () => {
  it('연륜 = yearsAsMaster 거울(0→0·15년→100=★5)', () => {
    expect(deriveExperience(0)).toBe(0);
    expect(deriveExperience(15)).toBe(100);
    expect(masterStatStar(deriveExperience(15))).toBe(5);
  });
  it('인망 = 평판 최고축 거울', () => {
    expect(derivePrestige({ righteous: 30, wulin: 70, imperial: 10, underground: 0 })).toBe(70);
  });
});

function mkMaster(insight: number): Master {
  return {
    id: 'm', name: '사부', hanjaName: '師父', age: 52, style: 'mystic',
    stats: { insight, experience: 0, authority: 20, prestige: 30 },
    specialties: [], signatureArtIds: [],
    reputation: { righteous: 30, wulin: 20, imperial: 10, underground: 0 },
    qi: 70, health: 80, yearsAsMaster: 0, disciplesGraduated: 0, disciplesLost: 0,
  };
}

function seedDisciple(): void {
  const d = { id: 'x', name: '제자', relationships: {}, personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 }, darknessLevel: 0, trustToMaster: 30 } as unknown as Disciple;
  useDiscipleStore.setState({ disciples: { x: d }, order: ['x'] });
}

describe('통찰 성장 — 면담 누적(소델타+감쇠 asymptotic)', () => {
  beforeEach(seedDisciple);

  it('면담 해소 1회 → 통찰 소폭↑', () => {
    useMasterStore.getState().setMaster(mkMaster(40));
    applyMeetingChoice('x', {});
    const ins = useMasterStore.getState().master!.stats.insight;
    expect(ins).toBeGreaterThan(40);
    expect(ins).toBeLessThan(41); // 소델타(0.5×0.6=0.3)
  });

  it('통찰 높을수록 성장 둔화(감쇠) — 90이 40보다 덜 오름', () => {
    useMasterStore.getState().setMaster(mkMaster(40));
    applyMeetingChoice('x', {});
    const gain40 = useMasterStore.getState().master!.stats.insight - 40;
    useMasterStore.getState().setMaster(mkMaster(90));
    applyMeetingChoice('x', {});
    const gain90 = useMasterStore.getState().master!.stats.insight - 90;
    expect(gain90).toBeLessThan(gain40);
    expect(gain90).toBeGreaterThan(0);
  });

  it('통찰은 100을 안 넘는다(상한)', () => {
    useMasterStore.getState().setMaster(mkMaster(100));
    applyMeetingChoice('x', {});
    expect(useMasterStore.getState().master!.stats.insight).toBeLessThanOrEqual(100);
  });
});
