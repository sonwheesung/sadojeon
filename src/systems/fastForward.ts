// 빠른 진행(자동 넘김) — 사용자가 누르면 의미 있는 정지 지점까지 하루를 자동으로 넘긴다.
// docs/46_도입_튜토리얼_회차.md. 지루한 [진행] 연타 구간을 분 단위로 흘려보내는 상시 기능
// (도입 튜토리얼 회차의 토대이자, 게이머 평가의 "[진행] 연타 = 최적 위험" 약점 해소).
//
// QA 하네스 autoPlay.ts 와 골격(advance→월간모달 닫기→settle→ended 체크)은 같지만 정책이 정반대:
//   · autoPlay   : 랜덤 일정 + 서신 자동 랜덤 해소 + 현장급보 첫 선택 자동(QA 관찰용).
//   · fastForward: 사용자 현재 일정 유지(아무것도 안 바꿈) + 결정 서신/현장급보는 **멈춘다**(자동 해소 X).
//
// 정규 진행과 100% 같은 경로를 타려고 gameApi.advance()/settle() 를 그대로 호출한다
// (서버 권위 어댑터도 동일 인터페이스 — docs/31). 정산 모달의 음미 타이머(2초)·LLM 대기만 건너뛴다.
//
// ⚠ 불변식(가장 위험한 사각): 빠른 진행은 결정 대기 서신·현장급보·회차 종결을 **절대 건너뛰지 않는다**.
//   건너뛰면 제자가 영구 동결되거나 진행 게이트가 무력화된다(docs/46 테스트·docs/37). 매 틱 정지 조건 확인.

import { getGameApi } from '@/engine/gameApi';
import { useGameStore } from '@/stores/gameStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import type { Milestone } from '@/types';

export type FastForwardStopReason =
  | 'decision' // 결정 필요한 서신이 생김 — 사용자가 처리해야 진행 가능(진행 게이트, docs/12)
  | 'fieldEvent' // 의뢰·출행 중 현장 급보 — FieldEventOverlay 로 그 자리에서 처리(docs/20·38)
  | 'ended' // 회차 종결(사부 수명 / 전원 하산) — run-end 로 라우트
  | 'maxDays'; // 안전 상한 도달(무한 루프 방지)

export interface FastForwardResult {
  reason: FastForwardStopReason;
  days: number; // 실제 진행한 일수
  promotions: Milestone[]; // 진행 중 발생한 승급 마일스톤(정지 후 요약 표시용)
}

// 지금 자동 넘김을 멈춰야 하는 사유(없으면 null). 정규 게이트(SectProgressBar·DailySettlementModal)와 같은 판정.
function blockedReason(): FastForwardStopReason | null {
  if (useGameStore.getState().phase === 'ended') return 'ended';
  if (useFieldEventStore.getState().queue.length > 0) return 'fieldEvent';
  if (useInboxStore.getState().decisionPendingCount() > 0) return 'decision';
  return null;
}

// 하루를 정규 경로로 자동 진행 — advance(정산 set) → 월간 모달 현행 유지로 닫기 → settle(후속).
// 승급 마일스톤은 settle 이 서신함으로 옮기며 비우기 전에 수집한다.
async function autoAdvanceOneDay(collectPromotions: Milestone[]): Promise<void> {
  await getGameApi().advance();

  // 월 시작 날 — 월간 보고/설정 모달은 현재 일정을 유지하고 닫는다(아무것도 안 바꿈).
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();

  // 사부 수명 도달로 advance 중 종결됐으면 정산 없음 — 여기서 끝.
  if (useGameStore.getState().phase === 'ended') return;

  // 일반 날 — 정산 데이터가 있으면 닫고 후속(졸업 체크·일일 이벤트·저장) 실행.
  // (월 시작 날은 advanceTurn 이 early-return 해 정산이 없다 → settle 안 함, 정규 동작과 동일.)
  if (usePendingStore.getState().settlement) {
    // 승급 등 마일스톤은 settle(triggerPostSettlement)이 서신함으로 옮기며 비우므로, 그 전에 모은다.
    collectPromotions.push(
      ...usePendingStore.getState().milestones.filter((m) => m.kind === 'promotion'),
    );
    usePendingStore.getState().clearSettlement();
    await getGameApi().settle();
  }
}

// 빠른 진행 실행 — 정지 조건까지 자동으로 하루씩 넘긴다.
// maxDays: 안전 상한(기본 ~10년분). onTick: 진행 일수 콜백(UI 진행 표시·중단 반응 양보용).
export async function fastForward(
  maxDays = 3650,
  onTick?: (days: number) => void,
): Promise<FastForwardResult> {
  const promotions: Milestone[] = [];

  // 시작 전 이미 막혀 있으면(결정 대기 등) 한 틱도 진행하지 않고 즉시 반환 — 정규 게이트 존중.
  const pre = blockedReason();
  if (pre) return { reason: pre, days: 0, promotions };

  let days = 0;
  for (; days < maxDays; days += 1) {
    await autoAdvanceOneDay(promotions);
    // 매 틱 정지 조건 확인 — 결정·현장급보·종결은 절대 건너뛰지 않는다(불변식).
    const stop = blockedReason();
    if (stop) {
      onTick?.(days + 1);
      return { reason: stop, days: days + 1, promotions };
    }
    if (onTick && days % 7 === 0) {
      onTick(days + 1);
      // UI 양보 — 진행률 갱신·중단 버튼 반응(autoPlayRun 과 같은 결).
      await new Promise((res) => setTimeout(res, 0));
    }
  }
  onTick?.(days);
  return { reason: 'maxDays', days, promotions };
}
