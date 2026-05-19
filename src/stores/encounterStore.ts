import { create } from 'zustand';

// Spec source: docs/03_제자_시스템.md — "제자 들이기" 섹션.
// Numeric constants below are the single source of truth referenced by
// app/village and app/dialogue. Tune these here, the screens reflect it.

export type TalentAxis = '체능' | '기력' | '민첩' | '오성' | '심성';
export type Tone = '다정' | '시험' | '엄격' | '침묵';

export interface Encounter {
  name: string;
  realName: string | null;
  ageEstimate: number;
  talents: Record<TalentAxis, number | null>;
  personality: string;
  origin: string;
  /** 사부에 대한 호감도. 0~100. */
  affinity: number;
}

interface EncounterStore {
  current: Encounter | null;
  setCurrent: (e: Encounter) => void;
  adjustAffinity: (delta: number) => void;
  reset: () => void;
}

export const AFFINITY_MIN = 0;
export const AFFINITY_MAX = 100;
export const TAKE_IN_THRESHOLD = 60;

export const TONE_AFFINITY_DELTA: Record<Tone, number> = {
  다정: 5,
  시험: -3,
  엄격: -5,
  침묵: -2,
};

export const useEncounterStore = create<EncounterStore>((set) => ({
  current: null,
  setCurrent: (e) => set({ current: e }),
  adjustAffinity: (delta) =>
    set((s) => {
      if (!s.current) return s;
      const affinity = Math.max(
        AFFINITY_MIN,
        Math.min(AFFINITY_MAX, s.current.affinity + delta),
      );
      return { current: { ...s.current, affinity } };
    }),
  reset: () => set({ current: null }),
}));
