// 월말 결산 시스템 — docs/06_훈련_일정.md
// 매월 시작 시 직전 달 스냅샷과 현재값을 비교해 결산 데이터를 만든다.
// 그 후 새 스냅샷을 저장 (다음 달 결산의 기준점).

import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type { MartialStage, MonthlySnapshot } from '@/types';
import { MARTIAL_STAGE_LABEL, MARTIAL_STAGE_ORDER } from '@/types/martialArt';
import { totalMonth } from './calendar';

// 현재 시점 스냅샷 캡처.
export function captureSnapshot(): MonthlySnapshot {
  const time = useTimeStore.getState().current;
  const ds = useDiscipleStore.getState();
  const sect = useSectStore.getState().sect;

  const disciples: MonthlySnapshot['disciples'] = {};
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d) continue;
    const progressSum = d.martialArts.reduce((s, a) => s + a.progress, 0);
    const stages: Record<string, string> = {};
    for (const a of d.martialArts) {
      stages[a.artId] = a.stage;
    }
    disciples[id] = {
      progressSum,
      stages,
      trust: d.trustToMaster,
    };
  }

  return {
    totalMonth: totalMonth(time),
    disciples,
    assets: sect?.resources ?? 0,
  };
}

// 직전 스냅샷 vs 현재 비교한 결산 데이터.
export interface DiscipleReportRow {
  id: string;
  name: string;
  progressDelta: number; // 진척 변동 합 (단계 승급 횟수 만큼 추가 보정)
  promotions: { artId: string; from: MartialStage; to: MartialStage }[];
  trustDelta: number;
}

export interface MonthlyReport {
  previousMonth: number;
  disciples: DiscipleReportRow[];
  assetsDelta: number;
}

export function computeMonthlyReport(): MonthlyReport | null {
  const snapshot = useScheduleStore.getState().lastSnapshot;
  if (!snapshot) return null;

  const ds = useDiscipleStore.getState();
  const sect = useSectStore.getState().sect;

  const rows: DiscipleReportRow[] = [];
  for (const id of ds.order) {
    const d = ds.disciples[id];
    const prev = snapshot.disciples[id];
    if (!d || !prev) continue;

    const curProgress = d.martialArts.reduce((s, a) => s + a.progress, 0);
    // 단계 승급 — 진척 100 도달이 한 달에 N번 일어났는지. 승급 시 progress=0 으로 리셋되므로
    // 단순 (현재 progressSum - 직전 progressSum) 이 음수일 수 있음. 승급 횟수를 함께 가산.
    const promotions: DiscipleReportRow['promotions'] = [];
    for (const a of d.martialArts) {
      const prevStage = prev.stages[a.artId];
      if (prevStage && prevStage !== a.stage) {
        const fromIdx = MARTIAL_STAGE_ORDER.indexOf(prevStage as MartialStage);
        const toIdx = MARTIAL_STAGE_ORDER.indexOf(a.stage);
        if (toIdx > fromIdx) {
          promotions.push({
            artId: a.artId,
            from: prevStage as MartialStage,
            to: a.stage,
          });
        }
      }
    }
    const progressDelta = curProgress - prev.progressSum + promotions.length * 100;
    const trustDelta = d.trustToMaster - prev.trust;

    rows.push({
      id,
      name: d.name,
      progressDelta,
      promotions,
      trustDelta,
    });
  }

  return {
    previousMonth: snapshot.totalMonth,
    disciples: rows,
    assetsDelta: (sect?.resources ?? 0) - snapshot.assets,
  };
}

export function stageLabel(stage: MartialStage): string {
  return MARTIAL_STAGE_LABEL[stage];
}
