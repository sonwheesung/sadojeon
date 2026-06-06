// 월말 결산 시스템 — docs/06_훈련_일정.md
// 매월 시작 시 직전 달 스냅샷과 현재값을 비교해 결산 데이터를 만든다.
// 그 후 새 스냅샷을 저장 (다음 달 결산의 기준점).

import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import type { MartialArtInstance, MartialStage, MonthlySnapshot } from '@/types';
import { MARTIAL_STAGE_LABEL, MARTIAL_STAGE_ORDER } from '@/types/martialArt';
import { seongToStage } from '@/data/martialArts';
import { totalMonth } from './calendar';

// 단조 증가 숙련 점수 — 성 승급 시 exp 가 리셋돼도 성*1000 이 지배해 항상 ↑. docs/26.
function masteryScore(a: MartialArtInstance): number {
  return a.seong * 1000 + a.exp;
}

// 현재 시점 스냅샷 캡처.
export function captureSnapshot(): MonthlySnapshot {
  const time = useTimeStore.getState().current;
  const ds = useDiscipleStore.getState();
  const sect = useSectStore.getState().sect;

  const disciples: MonthlySnapshot['disciples'] = {};
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d) continue;
    const masterySum = d.martialArts.reduce((s, a) => s + masteryScore(a), 0);
    const seongs: Record<string, number> = {};
    for (const a of d.martialArts) {
      seongs[a.artId] = a.seong;
    }
    disciples[id] = {
      masterySum,
      seongs,
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

    const curMastery = d.martialArts.reduce((s, a) => s + masteryScore(a), 0);
    // 명칭 밴드(입문→소성 등)를 넘은 무공만 승급으로 기록. 같은 밴드 안 성 증가는 진척에만 반영.
    const promotions: DiscipleReportRow['promotions'] = [];
    for (const a of d.martialArts) {
      const prevSeong = prev.seongs[a.artId];
      if (prevSeong == null) continue;
      const fromStage = seongToStage(prevSeong);
      const toStage = seongToStage(a.seong);
      if (MARTIAL_STAGE_ORDER.indexOf(toStage) > MARTIAL_STAGE_ORDER.indexOf(fromStage)) {
        promotions.push({ artId: a.artId, from: fromStage, to: toStage });
      }
    }
    // masteryScore 가 단조 증가라 보정 불필요 (성*1000 + exp).
    const progressDelta = curMastery - prev.masterySum;
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
