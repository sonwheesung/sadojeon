// 비급 연구 — 학자형 사부의 본업. docs/05 · docs/02 (사부=사용자 결정 2026-06-11).
// 규칙(사용자 확정):
//  · 보유 비급은 **연구를 마쳐야** 제자에게 가르칠 수 있다(assignMainMartialArt 가드).
//  · 비급은 사문 공유 — **비급당 1회만** 연구하면 전 제자 학습 가능.
//  · 연구는 **실제 시간**(등급별 5분~12시간, epoch ms) — 게임 시간과 무관하게 흐른다.
//  · 다이아로 즉시 완료 가능(시간 단축 — 편의 소비처, docs/11).
//  · 동시 연구 1권 — 사부의 시간 한계는 일정이 아니라 연구 큐 폭으로 표현(docs/02).
//  · 회차 리셋: 연구 상태는 새 회차에 초기화(시작 5권 제외) — 새 사부가 다시 푼다(docs/16).

import { findMartialArt } from '@/data/martialArts';
import { useCodexStore } from '@/stores/codexStore';
import { useGameStore } from '@/stores/gameStore';
import { useMasterStore } from '@/stores/masterStore';
import { INSIGHT_RESEARCH_MULTIPLIER, masterStatStar } from '@/types/master';
import type { MartialArtGrade } from '@/types/martialArt';

const MIN = 60_000;
const HOUR = 60 * MIN;

// 등급별 연구 소요(실제 시간). 하품 10분 ~ 신품 24시간. 🔧 그레이박스. (2026-06-18 전 등급 ×2)
export const RESEARCH_DURATION_MS: Record<MartialArtGrade, number> = {
  novice: 10 * MIN,
  apprentice: 60 * MIN,
  master: 4 * HOUR,
  grandmaster: 12 * HOUR,
  legendary: 24 * HOUR,
};

// 다이아 즉시 완료 비용 — 남은 시간 **1분당 1** (최소 1). 🔧 (2026-06-18)
export const DIAMOND_PER_MIN = 1;

// 헤드리스 시뮬·개발용 — 연구를 즉시 완료(실시간 타이머는 시뮬과 양립 불가).
let researchInstant = false;
export function setResearchInstant(v: boolean): void {
  researchInstant = v;
}
export function isResearchInstant(): boolean {
  return researchInstant;
}

export function isArtResearched(artId: string): boolean {
  return useCodexStore.getState().scrolls.some((s) => s.artId === artId && s.status === 'complete');
}

// 지금 연구 중인 비급(동시 1권) — 없으면 null.
export function researchingScroll() {
  return useCodexStore.getState().scrolls.find((s) => s.status === 'researching') ?? null;
}

// 통찰★ 연구 속도 배율 — **기능만 준비, 적용은 OFF**(사용자 결정 대기 2026-06-11).
// 켜면 소요 = 기본 시간 ÷ 배율(INSIGHT_RESEARCH_MULTIPLIER — ★1 ×0.5 느림 ~ ★5 ×2.5 빠름).
// 예: 신품 12시간 → 통찰★5면 4.8시간. 진행 중 연구의 endAt 은 시작 시점 배율로 고정(소급 없음).
export const RESEARCH_INSIGHT_ENABLED = false; // 🔧 적용 여부 미정 — true 한 줄로 켠다.

function insightSpeedMult(): number {
  if (!RESEARCH_INSIGHT_ENABLED) return 1;
  const raw = useMasterStore.getState().master?.stats.insight ?? 40;
  return INSIGHT_RESEARCH_MULTIPLIER[masterStatStar(raw)]; // 0~100→★ 단일 진실(MS1 봉합). docs/37

}

export function researchDurationFor(artId: string): number {
  const grade = findMartialArt(artId)?.grade ?? 'novice';
  return Math.round(RESEARCH_DURATION_MS[grade] / insightSpeedMult());
}

function complete(artId: string): void {
  const codex = useCodexStore.getState();
  codex.patchScroll(artId, {
    status: 'complete',
    researchProgress: 100,
    researchStartAt: undefined,
    researchEndAt: undefined,
  });
  // TODO(사부 스탯): 연구 완수 누적 → 통찰 성장 트리거 (docs/02 — 행동 누적 성장).
}

// 연구 시작 — 보유·미완료·다른 연구 없음일 때만. 성공 시 true.
export function startResearch(artId: string): boolean {
  const codex = useCodexStore.getState();
  const scroll = codex.scrolls.find((s) => s.artId === artId);
  if (!scroll || scroll.status === 'complete' || scroll.status === 'researching') return false;
  if (researchingScroll()) return false; // 동시 1권 — 사부는 한 번에 한 비급만 푼다.
  if (researchInstant) {
    complete(artId);
    return true;
  }
  const now = Date.now();
  codex.patchScroll(artId, {
    status: 'researching',
    researchStartAt: now,
    researchEndAt: now + researchDurationFor(artId),
  });
  return true;
}

// 기한이 지난 연구를 완료 처리 — 화면 진입·일일 진행 때 호출(실시간이라 폴링 결).
export function syncResearch(): void {
  const codex = useCodexStore.getState();
  const now = Date.now();
  for (const s of codex.scrolls) {
    if (s.status === 'researching' && s.researchEndAt != null && s.researchEndAt <= now) {
      complete(s.artId);
    }
  }
}

export function remainingMs(artId: string): number {
  const s = useCodexStore.getState().scrolls.find((x) => x.artId === artId);
  if (!s || s.status !== 'researching' || s.researchEndAt == null) return 0;
  return Math.max(0, s.researchEndAt - Date.now());
}

// 연구 진행률 0~100 (UI 표시용) — 경과/총 소요(실시간). researching 아니면 0.
export function researchProgressPct(artId: string): number {
  const s = useCodexStore.getState().scrolls.find((x) => x.artId === artId);
  if (!s || s.status !== 'researching' || s.researchStartAt == null || s.researchEndAt == null) return 0;
  const span = s.researchEndAt - s.researchStartAt;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((Date.now() - s.researchStartAt) / span) * 100)));
}

export function diamondCostFor(artId: string): number {
  const remain = remainingMs(artId);
  if (remain <= 0) return 0;
  return Math.max(1, Math.ceil(remain / MIN) * DIAMOND_PER_MIN); // 남은 시간 1분당 1

}

// 다이아 즉시 완료 — 잔액 부족이면 false. 호출측(UI)이 확인창(useConfirm)을 먼저 띄울 것.
export function skipResearchWithDiamonds(artId: string): boolean {
  const s = useCodexStore.getState().scrolls.find((x) => x.artId === artId);
  if (!s || s.status !== 'researching') return false;
  const cost = diamondCostFor(artId);
  if (!useGameStore.getState().spendDiamonds(cost)) return false;
  complete(artId);
  return true;
}

// 남은 시간 표시 — "11시간 40분" / "8분" / "잠시 후".
export function formatRemaining(ms: number): string {
  if (ms < MIN) return '잠시 후';
  const h = Math.floor(ms / HOUR);
  const m = Math.round((ms % HOUR) / MIN);
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  return `${m}분`;
}
