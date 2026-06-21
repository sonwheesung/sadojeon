// 업적 집계 키 — docs/32. 상태 스캔으로 못 잡는 **누적 사실**(완수 수·첫 극험·연속 무사고 등)을
// 계정 단위로 적립하기 위한 카운터 키. questTally(적립) ↔ achievements(판정)가 공유한다.
// 데이터 모듈에 두어 systems(적립)·data(판정) 양쪽이 의존 방향 충돌 없이 참조.

import type { QuestDomain, QuestGrade } from '@/types';

// 단조 증가 카운터.
export const TALLY = {
  // 총량
  questAttempt: 'quest.attempt', //  결산된 의뢰 총수(실패·재난 포함)
  questDone: 'quest.done', //        성공(완수·성공·위기끝성공)
  questFull: 'quest.full', //        흠 없는 완수(full)
  questFail: 'quest.fail', //        실패+재난
  // 등급별 성공
  gradeMenial: 'quest.grade.menial',
  gradeMinor: 'quest.grade.minor',
  gradeNormal: 'quest.grade.normal',
  gradeDangerous: 'quest.grade.dangerous',
  gradeExtreme: 'quest.grade.extreme',
  // 도메인별 성공
  domGuard: 'quest.dom.guard',
  domScout: 'quest.dom.scout',
  domDuel: 'quest.dom.duel',
  domMedicine: 'quest.dom.medicine',
  domAssassin: 'quest.dom.assassin',
  domGrand: 'quest.dom.grand',
  // 특수 결
  gray: 'quest.gray', //             회색(청부) 성공
  sponsored: 'quest.sponsored', //   우호 문파 후원 의뢰 성공
  worldEvent: 'quest.world', //      강호 사건 의뢰 성공
  solo: 'quest.solo', //             1인 단신 성공
  party: 'quest.party', //           3인+ 합공 성공
  noble: 'quest.noble', //           귀인(noble) 구출
  // 위험·생사
  disasterSurvived: 'quest.disasterSurvived', // 치명상 생환(사지에서 돌아옴)
  death: 'quest.death', //           의뢰 중 동문 사망
  // 노획
  scrollFound: 'quest.scroll', //    의뢰로 비급 입수
  divineElixir: 'quest.divineElixir', // 극험에서 신품 영약 천운
} as const;

// 마음(관계) 집계 — docs/19·33. 상태 스캔으로 못 잡는 **사건성 사실**(동문 야망 충돌 결정)을 적립.
// 의뢰 tally 와 같은 계정 영속(metaStorage) — 회차 넘어 합산(첫 충돌·첫 동맹 등 업적 판정).
export const MIND_TALLY = {
  ambitionConflict: 'mind.ambitionConflict', // 동문 야망 충돌 결정을 마주한 횟수(분기 무관)
  ambitionDefer: 'mind.ambitionDefer', //       A 양보 권유
  ambitionAlly: 'mind.ambitionAlly', //         B 동맹 권유
  ambitionDuel: 'mind.ambitionDuel', //         C 둘 다 격려(강호 결투 씨앗)
  ambitionTragedy: 'mind.ambitionTragedy', //   D 무관심(비극 분기)
} as const;

// 연속 기록(현재값 + 최고값). 끊기면 현재값 0.
export const STREAK = {
  flawless: 'quest.streak.flawless', // 연속 완벽 완수
} as const;

export const GRADE_TALLY: Record<QuestGrade, string> = {
  menial: TALLY.gradeMenial,
  minor: TALLY.gradeMinor,
  normal: TALLY.gradeNormal,
  dangerous: TALLY.gradeDangerous,
  extreme: TALLY.gradeExtreme,
};

export const DOMAIN_TALLY: Record<QuestDomain, string> = {
  guard: TALLY.domGuard,
  scout: TALLY.domScout,
  duel: TALLY.domDuel,
  medicine: TALLY.domMedicine,
  assassin: TALLY.domAssassin,
  grand: TALLY.domGrand,
};
