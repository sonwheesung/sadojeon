// 엔진/시스템 단위·통합 — 도입 튜토리얼 회차 강제 진입 판정·시작·건너뛰기 (docs/40 §1, docs/46).
// introRunPending: 첫 계정(사부 없음 && 미경험)만 true / beginIntroRun: 마킹+장철 시드 /
// skipIntroRun: 마킹만 / 루프 방지: 진입(시작·건너뛰기) 즉시 마킹 → 다시 강제 안 함.
//
// supabase·계정·DB 저장은 import 체인 차단 스텁(체인: …→repositories→supabase).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/data/repositories', () => ({
  runs: { saveRunState: jest.fn(async () => {}), getRunState: jest.fn(async () => null) },
}));
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));
jest.mock('@/systems/runSync', () => ({
  saveCurrentRunSilently: jest.fn(),
  saveCurrentRun: jest.fn(async () => {}),
}));

import { INTRO_RUN_KEY, introRunPending, beginIntroRun, skipIntroRun } from './introRun';
import { saveAccountSilently } from '@/systems/accountSync';
import { useMasterStore } from '@/stores/masterStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useRunMetaStore } from '@/stores/runMetaStore';
import { useDiscipleStore } from '@/stores/discipleStore';

beforeEach(() => {
  useTutorialStore.setState({ seen: [] });
  useMasterStore.getState().reset(); // master = null (회차 없음)
  useRunMetaStore.setState({ isTutorialRun: false });
  (saveAccountSilently as jest.Mock).mockClear();
});

describe('도입 회차 — 진입 판정(introRunPending)', () => {
  it('첫 계정(사부 없음 + 미경험) → true', () => {
    expect(introRunPending()).toBe(true);
  });

  it('이미 경험(intro-run seen) → false(재강제 안 함)', () => {
    useTutorialStore.setState({ seen: [INTRO_RUN_KEY] });
    expect(introRunPending()).toBe(false);
  });

  it('회차 진행 중(사부 있음) → false(도입 회차는 빈 슬롯 첫 진입만)', () => {
    beginIntroRun(); // 사부가 채워짐
    expect(introRunPending()).toBe(false);
  });
});

describe('도입 회차 — 시작/건너뛰기', () => {
  it('beginIntroRun → 마킹 + 장철 1명 고정 시드 + isTutorialRun true + 계정 저장', () => {
    beginIntroRun();
    expect(useTutorialStore.getState().hasSeen(INTRO_RUN_KEY)).toBe(true);
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
    expect(useDiscipleStore.getState().order).toEqual(['jang-cheol']);
    expect(saveAccountSilently).toHaveBeenCalled();
  });

  it('skipIntroRun → 마킹만(시드 X, 사부 없음 유지) + 계정 저장', () => {
    skipIntroRun();
    expect(useTutorialStore.getState().hasSeen(INTRO_RUN_KEY)).toBe(true);
    expect(useMasterStore.getState().master).toBeNull(); // 시드 안 함 → 일반 시작 선택으로
    expect(useRunMetaStore.getState().isTutorialRun).toBe(false);
    expect(saveAccountSilently).toHaveBeenCalled();
  });
});

describe('도입 회차 — 루프 방지(진입 즉시 마킹)', () => {
  it('건너뛰면 다시 권하지 않는다', () => {
    skipIntroRun();
    expect(introRunPending()).toBe(false);
  });

  it('시작했다가 회차를 비워도(사부 없음) 다시 강제하지 않는다 — 중도 포기 안전', () => {
    beginIntroRun();
    // 도입 회차를 포기해 회차가 비워진 상황을 모사(사부 제거).
    useMasterStore.getState().reset();
    // 그래도 이미 경험으로 마킹돼 재강제 안 함.
    expect(introRunPending()).toBe(false);
  });
});
