import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ElixirInventoryItem,
  ResearchStatus,
  ScrollInventoryItem,
} from '@/types';
import { MARTIAL_ARTS } from '@/data/martialArts';
import { metaStorage } from './persistStorage';

// 사문 자산 도감.
// - 비급 소유(scrolls 의 artId·acquiredAt·isTrap·isIncomplete): **계정 단위 영속**(2026-06-22) —
//   모든 사문 공통(해금 무공서·다이아처럼). accountState 로 DB 동기화 + 로컬 metaStorage. 사문(슬롯)을
//   삭제·완결해도 비급은 계정에 남는다. docs/16·45.
// - 비급 연구(status·researchProgress·타이머): **회차(슬롯)별** — 회차마다 리셋, run blob(codexSlice)에 저장.
//   새 사부가 다시 풀어야 가르침 가능. docs/05.
// - 영약(elixirs): 회차마다 초기화(run blob). 말년 비축 방지. docs/05.
// 인메모리는 ScrollInventoryItem 한 배열로 합쳐 둔다(소비처 무변) — 영속 시 소유/연구로 쪼갠다.

// 소유 정보(계정) — 연구 필드를 뺀 비급 신원.
export type OwnedScroll = Pick<
  ScrollInventoryItem,
  'artId' | 'acquiredAtRun' | 'acquiredAtDay' | 'isTrap' | 'isIncomplete'
>;
// 연구 상태(회차) — artId → 진행. run blob 으로 저장·복원.
export type ScrollResearch = Pick<
  ScrollInventoryItem,
  'status' | 'researchProgress' | 'researchStartAt' | 'researchEndAt'
>;

interface CodexStore {
  scrolls: ScrollInventoryItem[];
  elixirs: ElixirInventoryItem[];

  // ── 영속 분리(소유=계정 / 연구=회차) ────────────────────────────────────
  dumpOwnership: () => OwnedScroll[]; // 계정 저장용(accountState)
  commitOwnership: (owned: OwnedScroll[]) => void; // 계정 로드 — 소유 반영(연구는 보존/기본값)
  dumpResearch: () => Record<string, ScrollResearch>; // 회차 저장용(run blob)
  applyResearch: (research: Record<string, ScrollResearch>) => void; // 회차 로드 — 연구 덮어쓰기

  // ── 비급 인벤토리 ────────────────────────────────────────────────────
  addScroll: (item: ScrollInventoryItem) => void;
  updateResearchProgress: (artId: string, delta: number) => void;
  setScrollStatus: (artId: string, status: ResearchStatus) => void;
  // 부분 갱신 — 연구 타이머(researchStartAt/EndAt·status) 등. researchSystem 전용.
  patchScroll: (artId: string, patch: Partial<ScrollInventoryItem>) => void;
  removeScroll: (artId: string) => void;
  hasScroll: (artId: string) => boolean;

  // ── 영약 인벤토리 ────────────────────────────────────────────────────
  addElixir: (elixirId: string, quantity: number, atDay: number) => void;
  consumeElixir: (elixirId: string, quantity: number) => void;

  // ── 회차 경계 ────────────────────────────────────────────────────────
  // 새 회차 시작 시: 비급 원본은 유지, 연구 진행도/status 리셋, 영약 비움
  resetForNewRun: () => void;
  // 슬롯 전체 초기화 (테스트·신규 슬롯)
  resetAll: () => void;
}

export const useCodexStore = create<CodexStore>()(
  persist(
    (set, get) => ({
      scrolls: [],
      elixirs: [],

      // ── 영속 분리 ─────────────────────────────────────────────────────
      dumpOwnership: () =>
        get().scrolls.map((s) => ({
          artId: s.artId,
          acquiredAtRun: s.acquiredAtRun,
          acquiredAtDay: s.acquiredAtDay,
          isTrap: s.isTrap,
          isIncomplete: s.isIncomplete,
        })),

      // 계정 소유 반영 — 이미 들고 있던 비급의 연구 상태는 보존, 새 소유는 미연구(identified·0) 기본.
      // (loadAccount 가 loadRun 보다 먼저 → 기본값으로 깔고, 이어서 run blob 이 연구를 덮는다.)
      commitOwnership: (owned) =>
        set((s) => {
          const prev = new Map(s.scrolls.map((x) => [x.artId, x]));
          return {
            scrolls: owned.map((o) => {
              const ex = prev.get(o.artId);
              return ex
                ? { ...ex, ...o }
                : {
                    ...o,
                    status: 'identified' as ResearchStatus,
                    researchProgress: 0,
                  };
            }),
          };
        }),

      dumpResearch: () => {
        const out: Record<string, ScrollResearch> = {};
        for (const s of get().scrolls) {
          out[s.artId] = {
            status: s.status,
            researchProgress: s.researchProgress,
            researchStartAt: s.researchStartAt,
            researchEndAt: s.researchEndAt,
          };
        }
        return out;
      },

      applyResearch: (research) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) => {
            const r = research[x.artId];
            return r ? { ...x, ...r } : x;
          }),
        })),

      addScroll: (item) =>
        set((s) => {
          if (s.scrolls.some((x) => x.artId === item.artId)) return s;
          return { scrolls: [...s.scrolls, item] };
        }),

      updateResearchProgress: (artId, delta) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) => {
            if (x.artId !== artId) return x;
            const next = Math.max(0, Math.min(100, x.researchProgress + delta));
            const status: ResearchStatus =
              next >= 100 ? 'complete' : next > 0 ? 'researching' : x.status;
            return { ...x, researchProgress: next, status };
          }),
        })),

      setScrollStatus: (artId, status) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) =>
            x.artId === artId ? { ...x, status } : x,
          ),
        })),

      patchScroll: (artId, patch) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) =>
            x.artId === artId ? { ...x, ...patch } : x,
          ),
        })),

      removeScroll: (artId) =>
        set((s) => ({ scrolls: s.scrolls.filter((x) => x.artId !== artId) })),

      hasScroll: (artId) => get().scrolls.some((x) => x.artId === artId),

      addElixir: (elixirId, quantity, atDay) =>
        set((s) => {
          const existing = s.elixirs.find((e) => e.elixirId === elixirId);
          if (existing) {
            return {
              elixirs: s.elixirs.map((e) =>
                e.elixirId === elixirId
                  ? { ...e, quantity: e.quantity + quantity }
                  : e,
              ),
            };
          }
          return {
            elixirs: [
              ...s.elixirs,
              { elixirId, quantity, acquiredAtDay: atDay },
            ],
          };
        }),

      consumeElixir: (elixirId, quantity) =>
        set((s) => ({
          elixirs: s.elixirs
            .map((e) =>
              e.elixirId === elixirId
                ? { ...e, quantity: Math.max(0, e.quantity - quantity) }
                : e,
            )
            .filter((e) => e.quantity > 0),
        })),

      // 새 회차: 비급 원본은 유지, 연구 진행도/status 0, 영약 전부 소실.
      // 단 시작 소장 5권(acquisition 'start' — 본문 비급)은 이미 풀이된 것 — 연구 완료 유지.
      resetForNewRun: () =>
        set((s) => {
          const startIds = new Set(
            MARTIAL_ARTS.filter((a) => a.acquisition === 'start').map((a) => a.id),
          );
          return {
            scrolls: s.scrolls.map((x) =>
              startIds.has(x.artId)
                ? { ...x, researchProgress: 100, status: 'complete' as ResearchStatus, researchStartAt: undefined, researchEndAt: undefined }
                : { ...x, researchProgress: 0, status: 'identified' as ResearchStatus, researchStartAt: undefined, researchEndAt: undefined },
            ),
            elixirs: [],
          };
        }),

      resetAll: () => set({ scrolls: [], elixirs: [] }),
    }),
    {
      // 비급 소유가 계정 단위라 로컬 캐시도 계정 키(metaStorage) — 슬롯 무관 공유. 권위는 DB(account_state +
      // run_state). 연구·영약은 회차 로드(run blob)·seedNewRun 이 덮으므로 캐시 staleness 는 무해.
      name: 'codex',
      storage: createJSONStorage(() => metaStorage),
      partialize: (s) => ({ scrolls: s.scrolls, elixirs: s.elixirs }),
    },
  ),
);
