import { create } from 'zustand';

import { logs } from '@/data/repositories';
import type { OneLinerTone } from '@/data/scenarios/oneLiners';
import { logLlmCall } from '@/systems/llm/debugLog';
import { currentModelId } from '@/systems/llm/executorchClient';
import { LLM_TUNING_VERSION } from '@/systems/llm/version';
import type { DailyLog, DiscipleBadge, Milestone } from '@/types';

// 휘발성 store — 현재 사용자가 응답해야 할 짧은 결정.
// persist 없음. 진행 흐름 안에서만 살아 있고 응답 후 비워진다.

export interface PendingOneLiner {
  templateId: string;
  discipleId: string;
  body: string;
  createdAtDay: number;
  responses: Record<OneLinerTone, string>;
}

export interface PendingWish {
  templateId: string;
  discipleId: string;
  body: string;
  createdAtDay: number;
}

// LLM 호출 디버그 정보 — 정산 모달의 [DEV] 패널에 누적 표시.
export interface LlmDebugEntry {
  source: 'oneLiner' | 'wish' | 'moral';
  discipleName: string;
  llmCalled: boolean;
  prompt?: string;
  raw?: string;
}

// 하루 정산 데이터 — advanceTurn 끝에 set, 사용자 [다음] 시 clear.
// PM 결의 일일 정산 화면 데이터.
export interface SettlementData {
  dateLabel: string;
  log: DailyLog;
  badges: Record<string, DiscipleBadge[]>;
  llmDebugs: LlmDebugEntry[];
}

interface PendingStore {
  oneLiner: PendingOneLiner | null;
  wish: PendingWish | null;

  // 일일 일지 — 마지막 진행의 풍경. 다음 진행 전까지 메인 하단에 인라인 표시.
  dailyLog: DailyLog | null;
  // discipleId → 카드 배지 (마지막 진행 결과). 다음 진행 시 갱신.
  dailyBadges: Record<string, DiscipleBadge[]>;
  // 변곡점 모달 큐 — 승급·탈진. 사용자가 하나씩 확인해야 비워진다.
  milestones: Milestone[];

  // 하루 정산 — 진행 직후 자동 표시. null 일 때만 일상 모달 진행 가능.
  settlement: SettlementData | null;
  // 다음 정산에 누적될 LLM 호출 디버그. 진행 사이클 동안 누적.
  llmDebugBuffer: LlmDebugEntry[];
  // 직전 LLM 호출 — [DEV] 응답 직후 요청·응답을 즉시 띄우는 오버레이용. 사용자 [닫기] 시 clear.
  lastDebug: LlmDebugEntry | null;

  setOneLiner: (v: PendingOneLiner) => void;
  clearOneLiner: () => void;
  setWish: (v: PendingWish) => void;
  clearWish: () => void;

  setDailyTick: (
    log: DailyLog,
    badges: Record<string, DiscipleBadge[]>,
    milestones: Milestone[],
  ) => void;
  popMilestone: () => void;
  pushMilestones: (list: Milestone[]) => void;

  pushLlmDebug: (entry: LlmDebugEntry) => void;
  setSettlement: (v: SettlementData) => void;
  clearSettlement: () => void;
  clearLastDebug: () => void;
}

// [DEV] 직전 LLM 호출 오버레이를 띄울지. prompt/raw 가 있어야(=LLM 실제 시도) 띄움.
// 일상 모달들은 이 오버레이가 떠 있는 동안 가려진다 (겹침 방지).
export function isDebugOverlayActive(s: Pick<PendingStore, 'lastDebug'>): boolean {
  if (!__DEV__) return false;
  const d = s.lastDebug;
  return d != null && (!!d.prompt || !!d.raw);
}

export const usePendingStore = create<PendingStore>((set) => ({
  oneLiner: null,
  wish: null,
  dailyLog: null,
  dailyBadges: {},
  milestones: [],
  settlement: null,
  llmDebugBuffer: [],
  lastDebug: null,

  setOneLiner: (v) => set({ oneLiner: v }),
  clearOneLiner: () => set({ oneLiner: null }),
  setWish: (v) => set({ wish: v }),
  clearWish: () => set({ wish: null }),

  setDailyTick: (log, badges, milestones) =>
    set({ dailyLog: log, dailyBadges: badges, milestones }),
  popMilestone: () =>
    set((s) => ({ milestones: s.milestones.slice(1) })),
  pushMilestones: (list) =>
    set((s) => ({ milestones: [...s.milestones, ...list] })),

  pushLlmDebug: (entry) => {
    logLlmCall(entry); // [DEV] 터미널 + 파일 로그 — Claude 분석용
    // DB 로그(app_logs) — 운영 증거·추적용. 요청(prompt)·응답(raw) 저장. 실패 무시.
    const isError = typeof entry.raw === 'string' && entry.raw.startsWith('[error]');
    logs
      .write({
        level: isError ? 'error' : 'info',
        source: `llm:${entry.source}`,
        message: `${entry.discipleName} · ${entry.llmCalled ? 'LLM 응답' : '룰 폴백'}`,
        payload: {
          discipleName: entry.discipleName,
          llmCalled: entry.llmCalled,
          prompt: entry.prompt ?? null,
          raw: entry.raw ?? null,
          model: currentModelId(),
          tuningVersion: LLM_TUNING_VERSION,
        },
      })
      .catch(() => {});
    set((s) => ({ llmDebugBuffer: [...s.llmDebugBuffer, entry], lastDebug: entry }));
  },
  setSettlement: (v) => set({ settlement: v, llmDebugBuffer: [] }),
  clearSettlement: () => set({ settlement: null }),
  clearLastDebug: () => set({ lastDebug: null }),
}));
