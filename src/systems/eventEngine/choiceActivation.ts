// 선택지 활성 조건 평가 (A2) — docs/07 "선택지 조건 시스템".
// 자원·통찰·관계 등이 충족 안되면 선택지 비활성화 (회색·readonly + 사유).

import type { ChoiceActiveCondition, EventChoice, MasterSnapshot } from '@/types';
import { useSectStore } from '@/stores/sectStore';

export interface ActivationContext {
  master: MasterSnapshot;
  sectResources: number;
}

export function isChoiceActive(
  choice: EventChoice<string>,
  ctx: ActivationContext,
): boolean {
  const w = choice.activeWhen;
  if (!w) return true;
  if (w.masterInsightMin != null && ctx.master.insight < w.masterInsightMin) return false;
  if (w.masterAuthorityMin != null && ctx.master.authority < w.masterAuthorityMin) return false;
  if (w.sectResourcesMin != null && ctx.sectResources < w.sectResourcesMin) return false;
  // customKey 는 Phase B 에서 라우터로 확장.
  return true;
}

export function buildActivationContext(): ActivationContext {
  const sect = useSectStore.getState().sect;
  return {
    master: { insight: 0, authority: 0, prestige: 0 }, // 호출자가 master snapshot 주입
    sectResources: sect?.resources ?? 0,
  };
}

// "비활성 사유" 표시용. UI 가 hint 라벨 보여줄 때 사용.
export function inactiveReason(
  choice: EventChoice<string>,
  ctx: ActivationContext,
): string | null {
  const w = choice.activeWhen;
  if (!w) return null;
  if (w.masterInsightMin != null && ctx.master.insight < w.masterInsightMin) {
    return '사부의 통찰이 부족하다';
  }
  if (w.masterAuthorityMin != null && ctx.master.authority < w.masterAuthorityMin) {
    return '사부의 위엄이 부족하다';
  }
  if (w.sectResourcesMin != null && ctx.sectResources < w.sectResourcesMin) {
    return '사문의 자원이 부족하다';
  }
  return null;
}
