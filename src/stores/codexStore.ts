import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ElixirInventoryItem,
  ResearchStatus,
  ScrollInventoryItem,
} from '@/types';
import { MARTIAL_ARTS } from '@/data/martialArts';
import { slotAwareStorage } from './persistStorage';

// 사문 자산 도감.
// - 비급(scrolls): 회차 영속. 원본은 회차 종결 후에도 다음 사부에게 인계.
//   단 researchProgress 와 status 는 회차마다 리셋 — 새 사부가 다시 풀어야 함.
//   docs/16_회차_다회차.md "비급(무공서)만 영구 누적"
// - 영약(elixirs): 회차마다 초기화. 말년 비축 방지.
//   docs/05_연구_거래.md "영약 입수 경로 — 회차 누적 X"

interface CodexStore {
  scrolls: ScrollInventoryItem[];
  elixirs: ElixirInventoryItem[];

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
      name: 'codex',
      storage: createJSONStorage(() => slotAwareStorage),
      partialize: (s) => ({ scrolls: s.scrolls, elixirs: s.elixirs }),
    },
  ),
);
