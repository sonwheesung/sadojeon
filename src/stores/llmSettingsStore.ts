import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { metaStorage } from './persistStorage';

// LLM 설정 — docs/17_AI_아키텍처.md.
// - enabled: 사용자 토글. 기본 OFF (Phase 1 정책, 모바일 발열 통제).
// - perRunCallCount: 회차당 호출 카운터. cap 초과 시 자동 RuleResolver 폴백.
// - perRunCap: 회차당 호출 cap (기본 50).
//
// meta 영속 — 사용자 설정은 슬롯·회차 무관.
// 단 perRunCallCount 는 회차 진행 동안만 의미. seedNewRun 에서 resetCounter().

// 회차당 LLM 호출 cap.
// 매일 한 마디(60%) + 도덕(1.8%) + 추후 희망/면담 등 4선택 모달이 모두 LLM 가능 (docs/07).
// 1회차(약 336일) 동안 한 마디만 ~200회. 발열·배터리 통제와의 균형으로 200 으로 둠.
const DEFAULT_PER_RUN_CAP = 200;

export type LlmLoadStatus = 'idle' | 'downloading' | 'ready' | 'error';

interface LlmSettingsStore {
  enabled: boolean;
  perRunCallCount: number;
  perRunCap: number;

  // 모델 로드 상태 — UI 토글/다운로드 진행 표시용. 영속 X (휘발).
  loadStatus: LlmLoadStatus;
  downloadProgress: number; // 0~1
  lastError?: string;

  setEnabled: (v: boolean) => void;
  setCap: (n: number) => void;
  incrementCallCount: () => void;
  resetCounter: () => void;
  canCall: () => boolean;

  setLoadStatus: (s: LlmLoadStatus, error?: string) => void;
  setDownloadProgress: (p: number) => void;
}

export const useLlmSettingsStore = create<LlmSettingsStore>()(
  persist(
    (set, get) => ({
      // docs/17 정책: 모든 4선택 모달이 LLM 보정 사용 → enabled 기본 true (필수 다운로드).
      enabled: true,
      perRunCallCount: 0,
      perRunCap: DEFAULT_PER_RUN_CAP,
      loadStatus: 'idle',
      downloadProgress: 0,

      setEnabled: (v) => set({ enabled: v }),
      setCap: (n) => set({ perRunCap: Math.max(1, Math.floor(n)) }),
      incrementCallCount: () =>
        set((s) => ({ perRunCallCount: s.perRunCallCount + 1 })),
      resetCounter: () => set({ perRunCallCount: 0 }),
      canCall: () => {
        const s = get();
        return s.enabled && s.loadStatus === 'ready' && s.perRunCallCount < s.perRunCap;
      },

      setLoadStatus: (s, error) => set({ loadStatus: s, lastError: error }),
      setDownloadProgress: (p) =>
        set({ downloadProgress: Math.max(0, Math.min(1, p)) }),
    }),
    {
      name: 'llmSettings',
      storage: createJSONStorage(() => metaStorage),
      version: 2,
      // 카운터는 영속 X — 회차 격리 (seedNewRun 에서 reset).
      // perRunCap 도 persist 제외 — 코드 DEFAULT 값이 항상 우선 (정책 변경 시 즉시 반영).
      partialize: (s) => ({ enabled: s.enabled }),
      // v1 → v2: perRunCap 을 persist 에서 제거 — 옛 저장값 무시하고 enabled 만 보존.
      // 기본 true (필수 다운로드 정책).
      migrate: (persisted: unknown) => {
        const safe = (persisted ?? {}) as { enabled?: boolean };
        return {
          enabled: typeof safe.enabled === 'boolean' ? safe.enabled : true,
        };
      },
    },
  ),
);
