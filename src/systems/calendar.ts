// 캘린더 유틸 — GameTime 에서 월·월내 주차 등을 계산.
// docs/06: 일정은 한 달 단위. 1달 = 4주, 1계절 = 3달, 1년 = 12달.
//
// month: 1~12 (연도 내)
// weekOfMonth: 1~4
// isMonthStart: 월의 첫 날 (week % 4 === 1 && day === 1)
// isMonthEnd: 월의 마지막 날 (week % 4 === 0 && day === 7)

import { GAME } from '@/data/constants';
import type { GameTime, Season } from '@/types';

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// 연도 내 월 (1~12).
export function monthOfYear(t: GameTime): number {
  const seasonIdx = SEASON_ORDER.indexOf(t.season);
  const monthInSeason = Math.floor((t.week - 1) / GAME.WEEKS_PER_MONTH); // 0~2
  return seasonIdx * GAME.MONTHS_PER_SEASON + monthInSeason + 1;
}

// 월 내 주차 (1~4).
export function weekOfMonth(t: GameTime): number {
  return ((t.week - 1) % GAME.WEEKS_PER_MONTH) + 1;
}

// 월의 첫 날?
export function isMonthStart(t: GameTime): boolean {
  return weekOfMonth(t) === 1 && t.day === 1;
}

// 월의 마지막 날?
export function isMonthEnd(t: GameTime): boolean {
  return weekOfMonth(t) === GAME.WEEKS_PER_MONTH && t.day === GAME.DAYS_PER_WEEK;
}

// 누적 월 카운트 (1년차 1월 = 1, 2년차 1월 = 13 ...). 결산 누적용.
export function totalMonth(t: GameTime): number {
  return (t.year - 1) * GAME.MONTHS_PER_YEAR + monthOfYear(t);
}
