import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GameTime, Phase, Season } from '@/types';
import { GAME } from '@/data/constants';
import { slotAwareStorage } from './persistStorage';

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const PHASE_ORDER: Phase[] = ['morning', 'afternoon', 'evening'];

interface TimeStore {
  current: GameTime;
  totalDay: number;
  advance: () => void;
  advanceDay: () => void;
  reset: () => void;
  setTime: (time: GameTime) => void;
}

const INITIAL_TIME: GameTime = {
  year: 1,
  season: 'spring',
  week: 1,
  day: 1,
  phase: 'morning',
};

function nextPhase(time: GameTime): GameTime {
  const idx = PHASE_ORDER.indexOf(time.phase);
  if (idx < PHASE_ORDER.length - 1) {
    return { ...time, phase: PHASE_ORDER[idx + 1] };
  }
  return advanceDayPure({ ...time, phase: 'morning' });
}

function advanceDayPure(time: GameTime): GameTime {
  let { year, season, week, day } = time;
  day += 1;
  if (day > GAME.DAYS_PER_WEEK) {
    day = 1;
    week += 1;
    if (week > GAME.WEEKS_PER_SEASON) {
      week = 1;
      const sIdx = SEASON_ORDER.indexOf(season);
      if (sIdx < SEASON_ORDER.length - 1) {
        season = SEASON_ORDER[sIdx + 1];
      } else {
        season = 'spring';
        year += 1;
      }
    }
  }
  return { year, season, week, day, phase: 'morning' };
}

function computeTotalDay(t: GameTime): number {
  const seasonIdx = SEASON_ORDER.indexOf(t.season);
  const daysPerSeason = GAME.WEEKS_PER_SEASON * GAME.DAYS_PER_WEEK;
  return (
    (t.year - 1) * GAME.SEASONS_PER_YEAR * daysPerSeason +
    seasonIdx * daysPerSeason +
    (t.week - 1) * GAME.DAYS_PER_WEEK +
    (t.day - 1)
  );
}

export const useTimeStore = create<TimeStore>()(
  persist(
    (set) => ({
      current: INITIAL_TIME,
      totalDay: 0,
      advance: () =>
        set((s) => {
          const next = nextPhase(s.current);
          return { current: next, totalDay: computeTotalDay(next) };
        }),
      advanceDay: () =>
        set((s) => {
          const next = advanceDayPure(s.current);
          return { current: next, totalDay: computeTotalDay(next) };
        }),
      reset: () => set({ current: INITIAL_TIME, totalDay: 0 }),
      setTime: (time) => set({ current: time, totalDay: computeTotalDay(time) }),
    }),
    {
      name: 'time',
      storage: createJSONStorage(() => slotAwareStorage),
    },
  ),
);
