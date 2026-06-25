// 도입 튜토리얼 회차 보상 — 끝맺음(하산·결산) 시 중품 비급 1권 + 다이아 지급. docs/46.
// 비급은 계정 영속(codex)이라 회차가 리셋돼도 남아 "2회차에 이 비급으로 다른 제자를" 훅이 성립한다.
// leaf 모듈(stores + 무공 카탈로그 + 상수만 import) — runLifecycle.endRun 이 import 해도 사이클 없음.

import { MARTIAL_ARTS } from '@/data/martialArts';
import { TUTORIAL } from '@/data/constants';
import { useCodexStore } from '@/stores/codexStore';
import { useGameStore } from '@/stores/gameStore';
import { useTimeStore } from '@/stores/timeStore';

// 권·외공·도 결을 우선(장철 빌드와 맞물림). 없으면 다른 갈래라도 중품 1권.
const PREFERRED_SCHOOLS = ['fist', 'external', 'saber'] as const;

// 줄 중품(★★=apprentice) 비급 1권을 고른다 — non-start(시작 보유 아님)·미보유 중에서.
// 런타임 선택(특정 id 하드코딩 회피 — 카탈로그 변경에 견고). 결정적: MARTIAL_ARTS 순서 첫 매치.
export function pickIntroRunRewardArtId(): string | null {
  const owned = (id: string) => useCodexStore.getState().hasScroll(id);
  const pool = MARTIAL_ARTS.filter(
    (a) => a.grade === 'apprentice' && a.acquisition !== 'start' && !owned(a.id),
  );
  if (pool.length === 0) return null;
  const preferred = pool.find((a) => PREFERRED_SCHOOLS.includes(a.school as never));
  return (preferred ?? pool[0]).id;
}

export interface IntroRunRewardResult {
  artId: string | null;
  diamonds: number;
}

// 도입 회차 보상 지급 — 중품 비급 1권(계정 영속) + 다이아. endRun 이 회차 리셋 전에 호출.
export function grantIntroRunReward(): IntroRunRewardResult {
  const codex = useCodexStore.getState();
  const artId = pickIntroRunRewardArtId();
  if (artId && !codex.hasScroll(artId)) {
    codex.addScroll({
      artId,
      acquiredAtRun: 1,
      acquiredAtDay: useTimeStore.getState().totalDay,
      status: 'complete', // 도입 보상은 이미 풀이된 상태로 손에 쥐어 준다(2회차에 바로 가르침).
      researchProgress: 100,
      isTrap: false,
      isIncomplete: false,
    });
  }
  useGameStore.getState().addDiamonds(TUTORIAL.REWARD_DIAMONDS);
  return { artId, diamonds: TUTORIAL.REWARD_DIAMONDS };
}
