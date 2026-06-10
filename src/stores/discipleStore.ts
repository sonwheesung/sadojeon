import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  Disciple,
  DailyActivity,
  MartialArtInstance,
  PersonalityTraits,
  RelationLevel,
  StatId,
} from '@/types';
import { BASE_MAX_STAMINA, deriveMaxStamina, expToNext, statCap } from '@/data/training';
import { expToNextSeong, findMartialArt, initialSeong } from '@/data/martialArts';
import { PERSONALITY } from '@/data/constants';
import { slotAwareStorage } from './persistStorage';

const DEFAULT_PERSONALITY: PersonalityTraits = {
  integrity: PERSONALITY.DEFAULT,
  freedom: PERSONALITY.DEFAULT,
  warmth: PERSONALITY.DEFAULT,
  prudence: PERSONALITY.DEFAULT,
  mercy: PERSONALITY.DEFAULT,
  ambition: PERSONALITY.DEFAULT,
};

type LooseTraits = Record<string, number | undefined>;

// 구 5축(성실·자존·의리·호기·공감) 세이브 → 6축 매핑. docs/28 §6.
// 인격은 회차 스코프라 손실 허용(베스트에포트). 구 1~5 척도면 ×20−10 환산 후 매핑. 이미 6축이면 통과.
function migratePersonality(p: LooseTraits): PersonalityTraits {
  if (typeof p.integrity === 'number') {
    return {
      integrity: p.integrity,
      freedom: p.freedom ?? 50,
      warmth: p.warmth ?? 50,
      prudence: p.prudence ?? 50,
      mercy: p.mercy ?? 50,
      ambition: p.ambition ?? 50,
    };
  }
  const sc = (v?: number) =>
    v == null ? 50 : v <= 5 ? Math.max(1, Math.min(100, Math.round(v * 20 - 10))) : v;
  const dil = sc(p.diligence);
  const pri = sc(p.pride);
  const loy = sc(p.loyalty);
  const cur = sc(p.curiosity);
  const emp = sc(p.empathy);
  return {
    integrity: Math.round((dil + loy) / 2), // 성실+의리 → 강직
    freedom: cur, // 호기 → 자유
    warmth: emp, // 공감 → 다정
    prudence: 50,
    mercy: emp, // 공감 → 자비
    ambition: pri, // 자존 → 야망
  };
}

// 영속·DB 하이드레이트 공통 관문: 없으면 기본값, 구 5축이면 6축 매핑.
function normalizePersonality(p?: PersonalityTraits): PersonalityTraits {
  if (!p) return DEFAULT_PERSONALITY;
  return migratePersonality(p as unknown as LooseTraits);
}

// 구 무공 모델 { stage(5명칭), progress 0~100 } → 신 모델 { seong 1~10, exp }. docs/26.
// 5단계(화경·초절정 포함)를 성으로 접어 환산. 멱등 — 이미 seong 있으면 통과.
const OLD_STAGE_TO_SEONG: Record<string, number> = {
  introduction: 1,
  small_completion: 4,
  great_completion: 7,
  transcendent: 9,
  peerless: 10,
};

function normalizeMartialInstance(inst: MartialArtInstance): MartialArtInstance {
  if (typeof inst?.seong === 'number') return inst;
  const legacy = inst as unknown as {
    artId: string;
    stage?: string;
    progress?: number;
    unlockedAt?: number;
  };
  const seong = OLD_STAGE_TO_SEONG[legacy.stage ?? ''] ?? 1;
  const need = expToNextSeong(seong);
  const prog = typeof legacy.progress === 'number' ? legacy.progress : 0;
  const exp = Math.max(0, Math.min(need - 1, Math.round((prog / 100) * need)));
  return { artId: legacy.artId, seong, exp, unlockedAt: legacy.unlockedAt ?? 0 };
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
  // 무공서 전수 — 없으면 1성으로 학습, 그 무공을 주력(훈련 대상)으로 지정. docs/26 §5-1.
  assignMainMartialArt: (id: string, artId: string) => void;
  get: (id: string) => Disciple | undefined;
  reset: () => void;
}

// 누락 필드(구버전 영속·시드 누락) 안전 보정.
function withDefaults(d: Disciple): Disciple {
  return {
    ...d,
    personality: normalizePersonality(d.personality),
    martialArts: (d.martialArts ?? []).map(normalizeMartialInstance),
    maxStamina: d.maxStamina ?? BASE_MAX_STAMINA,
    stress: d.stress ?? 0,
    stats: d.stats ?? {},
    efficiency: d.efficiency ?? {},
    insight: d.insight ?? (d as unknown as { talents?: { insight?: number } }).talents?.insight ?? 3,
    fame: d.fame ?? 0,
    // 경지 — 구버전 세이브 보정. 무공 입문 상태면 삼류, 미입문이면 none.
    realm: d.realm ?? (d.martialArts && d.martialArts.length > 0 ? 'samryu' : 'none'),
    realmProgress: {
      internal: d.realmProgress?.internal ?? 0,
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
          const cap = statCap(statId);
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

      assignMainMartialArt: (id, artId) =>
        set((s) => {
          const cur = s.disciples[id];
          if (!cur) return s;
          const has = cur.martialArts.some((a) => a.artId === artId);
          let martialArts = cur.martialArts;
          if (!has) {
            // 새 무공 — **사문이 비급을 보유해야** 가르칠 수 있다(습득 경로 게이트, docs/05·04).
            const { useCodexStore } = require('./codexStore') as typeof import('./codexStore');
            if (!useCodexStore.getState().hasScroll(artId)) return s;
            // 경지 기반 시작 성(고수는 기초 건너뜀). 기존 무공은 보존. docs/26 §5-2.
            const art = findMartialArt(artId);
            const seong = art ? initialSeong(cur, art) : 1;
            martialArts = [...cur.martialArts, { artId, seong, exp: 0, unlockedAt: 0 }];
          }
          return {
            disciples: {
              ...s.disciples,
              [id]: { ...cur, martialArts, mainMartialArtId: artId },
            },
          };
        }),

      get: (id) => get().disciples[id],

      reset: () => set({ disciples: {}, order: [] }),
    }),
    {
      name: 'disciple',
      storage: createJSONStorage(() => slotAwareStorage),
      version: 4, // v3→v4: 성격 5축→인격 6축 (withDefaults→normalizePersonality 가 매핑)
      partialize: (s) => ({ disciples: s.disciples, order: s.order }),
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as {
          disciples?: Record<string, Disciple>;
          order?: string[];
        };
        const disciples = p.disciples ?? {};
        const patched: Record<string, Disciple> = {};
        for (const [id, d] of Object.entries(disciples)) {
          // 성격 5축→6축, 무공 {stage,progress}→{seong,exp}, 효율 기본값 등은 withDefaults 가 처리.
          patched[id] = withDefaults(d);
        }
        return { disciples: patched, order: p.order ?? [] };
      },
    },
  ),
);
