// 엔진/시스템 단위 — 도입 튜토리얼 회차 메타 플래그(isTutorialRun) 생애주기 (docs/40 §1, docs/46).
// startTutorialRun: 장철 1명 고정 시드 + 플래그 set / 일반 seedNewRun: 플래그 false /
// endRun: 회차 메타 초기화 / gameState 캡처·커밋 라운드트립에 플래그 보존(서버·세이브 왕복).
//
// supabase·계정 저장은 import 체인 차단용 스텁(체인: …→repositories→supabase).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/data/repositories', () => ({
  runs: { saveRunState: jest.fn(async () => {}), getRunState: jest.fn(async () => null) },
}));
jest.mock('@/systems/accountSync', () => ({ saveAccountSilently: jest.fn() }));
jest.mock('@/systems/runSync', () => ({
  saveCurrentRunSilently: jest.fn(),
  saveCurrentRun: jest.fn(async () => {}),
}));

import { seedNewRun, startTutorialRun } from './newRun';
import { endRun } from './runLifecycle';
import { captureGameState, commitGameState } from '@/engine/gameState';
import { useRunMetaStore } from '@/stores/runMetaStore';
import { useDiscipleStore } from '@/stores/discipleStore';

beforeEach(() => {
  useRunMetaStore.setState({ isTutorialRun: false });
});

describe('도입 튜토리얼 회차 — 메타 플래그', () => {
  it('startTutorialRun → isTutorialRun true + 장철 1명만 시드', () => {
    startTutorialRun();
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
    const ds = useDiscipleStore.getState();
    expect(ds.order).toEqual(['jang-cheol']);
    expect(ds.disciples['jang-cheol']).toBeTruthy();
  });

  it('일반 seedNewRun → isTutorialRun false(도입 회차 아님)', () => {
    startTutorialRun(); // 먼저 true 로 만든 뒤
    seedNewRun(['jang-cheol', 'jin-sohwa']); // 일반 시작이면 도로 false
    expect(useRunMetaStore.getState().isTutorialRun).toBe(false);
    expect(useDiscipleStore.getState().order.length).toBe(2);
  });

  it('endRun → 회차 메타 초기화(다음 회차로 새지 않음)', () => {
    startTutorialRun();
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
    endRun();
    expect(useRunMetaStore.getState().isTutorialRun).toBe(false);
  });
});

describe('도입 튜토리얼 회차 — GameState 라운드트립', () => {
  it('캡처·커밋에 isTutorialRun 이 보존된다(서버·세이브 왕복)', () => {
    useRunMetaStore.setState({ isTutorialRun: true });
    const snap = captureGameState();
    // 다른 코드가 플래그를 덮어써도
    useRunMetaStore.setState({ isTutorialRun: false });
    // 캡처분을 커밋하면 복원된다.
    commitGameState(snap);
    expect(useRunMetaStore.getState().isTutorialRun).toBe(true);
  });

  it('GameState 에 runMeta 슬롯이 포함된다', () => {
    const snap = captureGameState() as Record<string, unknown>;
    expect(snap.runMeta).toBeDefined();
    expect((snap.runMeta as { isTutorialRun?: boolean }).isTutorialRun).toBeDefined();
  });
});
