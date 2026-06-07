// 제자 상황 컨텍스트 — 한마디·면담의 조건 발동/이름 치환 공용. docs/12.
// 나이는 정적 필드가 아니라 입문나이 + 경과연차로 계산(제자는 timeSystem 에서 나이 안 먹음).

import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';
import type { OneLinerCtx } from '@/data/scenarios/oneLiners';

// 현재 나이 = 입문 당시 나이 + (현재 연차 − 입문 연차).
export function currentAge(d: Disciple): number {
  const year = useTimeStore.getState().current.year;
  return (d.age ?? 10) + Math.max(0, year - (d.entryYear ?? year));
}

function mainSeongOf(d: Disciple): number {
  const mid = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  return mid ? (d.martialArts.find((a) => a.artId === mid)?.seong ?? 0) : 0;
}

// 한 제자의 발화 컨텍스트(라이벌·최약·나이 등). activeOthers = 자신 외 활동 제자.
export function buildDiscipleCtx(d: Disciple, activeOthers: Disciple[]): OneLinerCtx {
  const maxSt = d.maxStamina || 1;
  const mainSeong = mainSeongOf(d);
  let rivalName: string | null = null;
  let top = mainSeong;
  for (const o of activeOthers) {
    const s = mainSeongOf(o);
    if (s > top) {
      top = s;
      rivalName = o.name;
    }
  }
  const isWeakest = activeOthers.length > 0 && activeOthers.every((o) => mainSeongOf(o) >= mainSeong);
  return {
    stress: d.stress ?? 0,
    staminaPct: Math.round((d.stamina / maxSt) * 100),
    trust: d.trustToMaster ?? 0,
    darknessRisk: d.darknessRisk,
    hasEnemy: Object.values(d.relationships).some((v) => v === 'enemy'),
    age: currentAge(d),
    mainSeong,
    rivalName,
    isWeakest,
  };
}
