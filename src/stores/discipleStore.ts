import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Disciple, DailyActivity, PersonalityTraits, RelationLevel, StatId } from '@/types';
import { BASE_MAX_STAMINA, deriveMaxStamina, expToNext, statCap } from '@/data/training';
import { PERSONALITY } from '@/data/constants';
import { slotAwareStorage } from './persistStorage';

const DEFAULT_PERSONALITY: PersonalityTraits = {
  diligence: PERSONALITY.DEFAULT,
  pride: PERSONALITY.DEFAULT,
  loyalty: PERSONALITY.DEFAULT,
  curiosity: PERSONALITY.DEFAULT,
  empathy: PERSONALITY.DEFAULT,
};

// 구 1~5 척도 → 1~100 밴드 환산 (n×20−10): 1→10·2→30·3→50·4→70·5→90.
function rescalePersonality(p?: Partial<PersonalityTraits>): PersonalityTraits {
  const conv = (v: number | undefined) =>
    v == null ? PERSONALITY.DEFAULT : Math.max(1, Math.min(100, Math.round(v * 20 - 10)));
  return {
    diligence: conv(p?.diligence),
    pride: conv(p?.pride),
    loyalty: conv(p?.loyalty),
    curiosity: conv(p?.curiosity),
    empathy: conv(p?.empathy),
  };
}

// 영속·DB 하이드레이트 공통 관문: 없으면 기본값, 구 1~5 스케일이면 자동 환산.
// 5축 최댓값이 5 이하 = 옛 척도(신 척도는 기본 50·시드 30~90이라 전 축 ≤5 불가).
// 멱등(idempotent) — 이미 1~100 이면 그대로 통과.
function normalizePersonality(p?: PersonalityTraits): PersonalityTraits {
  if (!p) return DEFAULT_PERSONALITY;
  const max = Math.max(p.diligence, p.pride, p.loyalty, p.curiosity, p.empathy);
  return max <= 5 ? rescalePersonality(p) : p;
}

interface DiscipleStore {
  disciples: Record<string, Disciple>;
  order: string[];

  setAll: (list: Disciple[]) => void;
  add: (disciple: Disciple) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Disciple>) => void;
  setActivity: (id: string, activity: DailyActivity) => void;
  adjustTrust: (id: string, delta: number) => void;
  adjustStamina: (id: string, delta: number) => void;
  adjustStress: (id: string, delta: number) => void;
  setFatiguePenalty: (id: string, penalty: number) => void;
  // 단련 스탯 EXP 적립 + 레벨업 처리. endurance 면 최대 체력 재계산.
  // 반환: 레벨업 횟수 (0 = 변동 없음).
  addStatExp: (id: string, statId: StatId, expDelta: number) => number;
  setRelation: (id: string, otherId: string, level: RelationLevel) => void;
  get: (id: string) => Disciple | undefined;
  reset: () => void;
}

// 누락 필드(구버전 영속·시드 누락) 안전 보정.
function withDefaults(d: Disciple): Disciple {
  return {
    ...d,
    personality: normalizePersonality(d.personality),
    maxStamina: d.maxStamina ?? BASE_MAX_STAMINA,
    stress: d.stress ?? 0,
    stats: d.stats ?? {},
    // 경지 — 구버전 세이브 보정. 무공 입문 상태면 삼류, 미입문이면 none.
    starRank: d.starRank ?? 1,
    realm: d.realm ?? (d.martialArts && d.martialArts.length > 0 ? 'samryu' : 'none'),
    realmProgress: {
      internal: d.realmProgress?.internal ?? 0,
      martial: d.realmProgress?.martial ?? 0,
      pity: d.realmProgress?.pity ?? 0,
      petitioned: d.realmProgress?.petitioned ?? false,
    },
  };
}

export const useDiscipleStore = create<DiscipleStore>()(
  persist(
    (set, get) => ({
      disciples: {},
      order: [],

      setAll: (list) =>
        set({
          disciples: Object.fromEntries(list.map((d) => [d.id, withDefaults(d)])),
          order: list.map((d) => d.id),
        }),

      add: (disciple) =>
        set((s) => ({
          disciples: { ...s.disciples, [disciple.id]: withDefaults(disciple) },
          order: s.order.includes(disciple.id) ? s.order : [...s.order, disciple.id],
        })),

      remove: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.disciples;
          return { disciples: rest, order: s.order.filter((x) => x !== id) };
        }),

      update: (id, patch) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return { disciples: { ...s.disciples, [id]: { ...current, ...patch } } };
        }),

      setActivity: (id, activity) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return {
            disciples: {
              ...s.disciples,
              [id]: { ...current, currentActivity: activity },
            },
          };
        }),

      adjustTrust: (id, delta) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const next = Math.max(0, Math.min(100, current.trustToMaster + delta));
          return {
            disciples: { ...s.disciples, [id]: { ...current, trustToMaster: next } },
          };
        }),

      adjustStamina: (id, delta) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const max = current.maxStamina ?? BASE_MAX_STAMINA;
          const next = Math.max(0, Math.min(max, current.stamina + delta));
          return {
            disciples: { ...s.disciples, [id]: { ...current, stamina: next } },
          };
        }),

      adjustStress: (id, delta) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const next = Math.max(0, Math.min(100, (current.stress ?? 0) + delta));
          return {
            disciples: { ...s.disciples, [id]: { ...current, stress: next } },
          };
        }),

      setFatiguePenalty: (id, penalty) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return {
            disciples: {
              ...s.disciples,
              [id]: { ...current, fatiguePenalty: Math.max(0, Math.min(1, penalty)) },
            },
          };
        }),

      addStatExp: (id, statId, expDelta) => {
        if (expDelta <= 0) return 0;
        let levelUps = 0;
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const stats = { ...(current.stats ?? {}) };
          const track = stats[statId] ?? { level: 0, exp: 0 };
          const cap = statCap(current.starRank ?? 1, statId);
          let { level, exp } = track;
          exp += expDelta;
          // 상한 전까지만 레벨업. docs/25.
          while (level < cap && exp >= expToNext(level)) {
            exp -= expToNext(level);
            level += 1;
            levelUps += 1;
          }
          if (level >= cap) {
            level = cap;
            exp = 0; // 상한 도달 — EXP 멈춤 ("(최대)")
          }
          stats[statId] = { level, exp };

          const patch: Partial<Disciple> = { stats };
          // endurance 성장 → 최대 체력 재계산 (= Lv × 10). 현재 체력은 그대로, 상한만 ↑.
          if (statId === 'endurance' && levelUps > 0) {
            patch.maxStamina = deriveMaxStamina(level);
          }
          return { disciples: { ...s.disciples, [id]: { ...current, ...patch } } };
        });
        return levelUps;
      },

      setRelation: (id, otherId, level) =>
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          return {
            disciples: {
              ...s.disciples,
              [id]: {
                ...current,
                relationships: { ...current.relationships, [otherId]: level },
              },
            },
          };
        }),

      get: (id) => get().disciples[id],

      reset: () => set({ disciples: {}, order: [] }),
    }),
    {
      name: 'disciple',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 2, // v1→v2: 성격 5축 1~5 → 1~100 재환산
      partialize: (s) => ({ disciples: s.disciples, order: s.order }),
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as {
          disciples?: Record<string, Disciple>;
          order?: string[];
        };
        const disciples = p.disciples ?? {};
        const patched: Record<string, Disciple> = {};
        for (const [id, d] of Object.entries(disciples)) {
          // v2 미만 세이브는 성격이 구 1~5 척도 → 1~100 으로 환산.
          const dd =
            version < 2 && d.personality
              ? { ...d, personality: rescalePersonality(d.personality) }
              : d;
          patched[id] = withDefaults(dd);
        }
        return { disciples: patched, order: p.order ?? [] };
      },
    },
  ),
);
