// 제자 개별 오버라이드 — docs/06_훈련_일정.md
// 사문 디폴트 패턴 위에 제자 단위로 임시 명령 (폐관·의뢰·치료).
// 만료까지 디폴트 무시 + 자동 해제.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type {
  DiscipleOverride,
  DiscipleOverrideCommand,
  DiscipleStatus,
} from '@/types';

// 명령별 라벨·기본 기간.
export const OVERRIDE_LABEL: Record<DiscipleOverrideCommand, string> = {
  default: '디폴트',
  seclusion: '폐관',
  quest: '의뢰',
  healing: '치료',
};

export const OVERRIDE_DURATION_OPTIONS = [7, 14, 28] as const;
export const OVERRIDE_DURATION_DEFAULT = 14;

// 명령별 무공 진척 배수 — 사문 패턴 대신 이 값이 우선.
// 폐관 = 집중 (×1.5), 의뢰 = 진척 X (실전), 치료 = 진척 X (회복)
export const OVERRIDE_TRAINING_MULTIPLIER: Record<
  Exclude<DiscipleOverrideCommand, 'default'>,
  number
> = {
  seclusion: 1.5,
  quest: 0,
  healing: 0,
};

// 명령 → 제자 status 매핑.
export const OVERRIDE_STATUS: Record<
  Exclude<DiscipleOverrideCommand, 'default'>,
  DiscipleStatus
> = {
  seclusion: 'meditating',
  quest: 'questing',
  healing: 'injured',
};

// 명령 발행.
export function issueOverride(
  discipleId: string,
  command: Exclude<DiscipleOverrideCommand, 'default'>,
  durationDays: number = OVERRIDE_DURATION_DEFAULT,
): void {
  // 진행 중·떠난 제자에 명령 금지 — 파견(questing)·연단(crafting)·졸업/하산 상태에 override 를 걸면
  // 그 활동 기록이 고아가 되고 status 가 덮인다. 가용(training/resting/meditating)만 허용. docs/37 C2.
  const d = useDiscipleStore.getState().disciples[discipleId];
  if (!d || (d.status !== 'training' && d.status !== 'resting' && d.status !== 'meditating')) return;
  const day = useTimeStore.getState().totalDay;
  const ov: DiscipleOverride = {
    discipleId,
    command,
    startedAtDay: day,
    durationDays,
  };
  useScheduleStore.getState().setOverride(ov);
  useDiscipleStore.getState().update(discipleId, { status: OVERRIDE_STATUS[command] });
}

// 명령 강제 해제 (만료 외 즉시 취소).
export function cancelOverride(discipleId: string): void {
  useScheduleStore.getState().clearOverride(discipleId);
  useDiscipleStore.getState().update(discipleId, { status: 'training' });
}

// 매일 호출 — 만료된 명령 자동 해제.
export function tickOverrideExpiry(): void {
  const day = useTimeStore.getState().totalDay;
  const overrides = useScheduleStore.getState().overrides;
  for (const id of Object.keys(overrides)) {
    const ov = overrides[id];
    if (day >= ov.startedAtDay + ov.durationDays) {
      useScheduleStore.getState().clearOverride(id);
      // R3(2026-06-14): 상처(wound)가 아직 남았으면 training 으로 강제 복귀시키지 않는다 —
      // woundSystem 이 마무리하도록 injured 유지(두 회복 경로 경합으로 wound 박제되던 버그 방지).
      const d = useDiscipleStore.getState().disciples[id];
      const stillWounded = (d?.wounds?.length ?? 0) > 0;
      useDiscipleStore.getState().update(id, { status: stillWounded ? 'injured' : 'training' });
    }
  }
}

// 제자의 현재 오버라이드 (만료 전인 것만).
export function activeOverrideOf(discipleId: string): DiscipleOverride | null {
  const ov = useScheduleStore.getState().overrides[discipleId];
  if (!ov) return null;
  const day = useTimeStore.getState().totalDay;
  if (day >= ov.startedAtDay + ov.durationDays) return null;
  return ov;
}

// 남은 일수.
export function remainingDays(ov: DiscipleOverride): number {
  const day = useTimeStore.getState().totalDay;
  return Math.max(0, ov.startedAtDay + ov.durationDays - day);
}
