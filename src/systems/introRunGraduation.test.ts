// 엔진/시스템 단위·통합 — 도입 튜토리얼 회차 스크립트 졸업 + 보상 (docs/40 §1, docs/46 step5).
// 일류 도달 시 조기 졸업(정규 15년 게이트 무관, isTutorialRun 한정) → 표국 무사 고정(결정 서신 없음) →
// endRun 시 중품 비급 1권(계정 영속) + 다이아 보상. 정규 회차엔 영향 0.
//
// import 체인 차단 스텁(실 게임 시스템이 끌어오는 IO).
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
import { checkGraduations } from './graduationSystem';
import { endRun } from './runLifecycle';
import { grantIntroRunReward, pickIntroRunRewardArtId } from './introRunReward';
import { TUTORIAL } from '@/data/constants';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGameStore } from '@/stores/gameStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useCodexStore } from '@/stores/codexStore';
import { useRunMetaStore } from '@/stores/runMetaStore';
import { findMartialArt } from '@/data/martialArts';

function setRealm(id: string, realm: string): void {
  useDiscipleStore.getState().update(id, { realm: realm as never });
}

beforeEach(() => {
  useGameStore.setState({ phase: 'playing' });
});

describe('도입 회차 — 일류 스크립트 조기 졸업', () => {
  it('isTutorialRun + 장철 일류 → 조기 졸업 + 표국 무사 고정 + 직업 선택 서신 없음 + 회차 종결', () => {
    startTutorialRun();
    setRealm('jang-cheol', TUTORIAL.GRADUATION_REALM); // 일류 도달
    useInboxStore.getState().reset();

    checkGraduations();

    const d = useDiscipleStore.getState().disciples['jang-cheol'];
    expect(d?.status).toBe('graduated');
    expect(d?.graduatedJob).toBe(TUTORIAL.JOB_ID); // escort-warrior(표국 무사)
    // 직업 선택 결정 서신을 띄우지 않는다(스크립트 확정).
    expect(useInboxStore.getState().decisionPendingCount()).toBe(0);
    // 회차 종결(전원 하산)은 다음 진행 패스에서 감지된다 — checkGraduations 가 함수 시작에 잡은
    // 상태 스냅샷이 졸업 update 이전이라(기존 동작), 실게임은 매일 호출돼 다음 날 종결. 두 번째 호출에서 확인.
    checkGraduations();
    expect(useGameStore.getState().phase).toBe('ended');
  });

  it('장철이 이류(목표 미달)면 조기 졸업 안 함', () => {
    startTutorialRun();
    setRealm('jang-cheol', 'iryu');
    checkGraduations();
    expect(useDiscipleStore.getState().disciples['jang-cheol']?.status).not.toBe('graduated');
  });

  it('의뢰 중(BUSY)이면 일류라도 조기 졸업 안 함(정규와 동일하게 존중)', () => {
    startTutorialRun();
    setRealm('jang-cheol', TUTORIAL.GRADUATION_REALM);
    useDiscipleStore.getState().update('jang-cheol', { status: 'questing' });
    checkGraduations();
    expect(useDiscipleStore.getState().disciples['jang-cheol']?.status).toBe('questing');
  });

  it('정규 회차(비튜토리얼)는 일류라도 조기 졸업 트리거가 없다(15년 게이트만)', () => {
    seedNewRun(['jang-cheol', 'jin-sohwa']); // isTutorialRun=false
    setRealm('jang-cheol', TUTORIAL.GRADUATION_REALM);
    checkGraduations();
    // 15년 안 지났으므로 졸업 안 함.
    expect(useDiscipleStore.getState().disciples['jang-cheol']?.status).not.toBe('graduated');
  });
});

describe('도입 회차 — 보상', () => {
  it('pickIntroRunRewardArtId → 중품(apprentice)·non-start 무공을 고른다', () => {
    seedNewRun(['jang-cheol']);
    const artId = pickIntroRunRewardArtId();
    expect(artId).toBeTruthy();
    const art = findMartialArt(artId as string);
    expect(art?.grade).toBe('apprentice');
    expect(art?.acquisition).not.toBe('start');
  });

  it('grantIntroRunReward → 중품 비급 1권 보유 + 다이아 증가', () => {
    seedNewRun(['jang-cheol']);
    const diamondsBefore = useGameStore.getState().diamonds;
    const r = grantIntroRunReward();
    expect(r.artId).toBeTruthy();
    expect(useCodexStore.getState().hasScroll(r.artId as string)).toBe(true);
    expect(useGameStore.getState().diamonds).toBe(diamondsBefore + TUTORIAL.REWARD_DIAMONDS);
  });

  it('도입 회차 endRun → 보상 비급이 회차 리셋 후에도 계정에 남는다(2회차 훅)', () => {
    startTutorialRun();
    const artId = pickIntroRunRewardArtId();
    expect(useCodexStore.getState().hasScroll(artId as string)).toBe(false); // 아직 없음
    endRun(); // 도입 회차 종료 → 보상 지급 + 리셋
    // 비급은 계정 영속(resetForNewRun 이 연구만 리셋) → 회차 리셋 후에도 보유.
    expect(useCodexStore.getState().hasScroll(artId as string)).toBe(true);
    // 회차 메타는 초기화됨.
    expect(useRunMetaStore.getState().isTutorialRun).toBe(false);
  });

  it('정규 회차 endRun → 도입 보상 비급 지급 안 함', () => {
    seedNewRun(['jang-cheol', 'jin-sohwa']);
    const artId = pickIntroRunRewardArtId();
    endRun();
    // 도입 보상은 튜토리얼 회차에만 — 정규 종료는 비급 안 줌.
    expect(useCodexStore.getState().hasScroll(artId as string)).toBe(false);
  });
});
