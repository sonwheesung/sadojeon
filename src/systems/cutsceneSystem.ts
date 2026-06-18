// 컷씬 발화 — docs/20. 트리거 측(용봉지회·의뢰 결산 등)은 이 함수 하나만 호출.
// 사건 추가 = data/cutscenes 한 항목 + 트리거 한 줄. 제자 전용 연출 추가 = byDisciple 한 칸(SOLID).

import { random } from '@/systems/rng';
import { fillName } from '@/utils/korean';
import { findCutscene } from '@/data/cutscenes';
import { useCutsceneStore } from '@/stores/cutsceneStore';
import { useTimeStore } from '@/stores/timeStore';

export function playCutscene(
  eventId: string,
  disciple: { id: string; name: string },
  opts?: {
    mediaVariant?: 'default' | 'alt';
    // [DEV] 시뮬랩 기기 비율 시뮬레이터 — 다른 폰·태블릿의 논리 크기(dp)로 그려 잘림 확인
    frame?: { width: number; height: number; label: string };
  },
): void {
  const def = findCutscene(eventId);
  if (!def) return; // 미등록 사건 — 조용히 무시(트리거가 데이터보다 먼저 깔려도 안전)
  const variant = def.byDisciple?.[disciple.id];
  const day = useTimeStore.getState().totalDay;
  useCutsceneStore.getState().push({
    id: `cs-${day}-${eventId}-${disciple.id}-${Math.floor(random() * 1e6)}`,
    eventId,
    discipleId: disciple.id,
    discipleName: disciple.name,
    hanzi: def.hanzi,
    title: def.title,
    tone: def.tone,
    line: fillName(variant?.line ?? def.defaultLine, { name: disciple.name }),
    quote: variant?.quote,
    mediaVariant: opts?.mediaVariant,
    frameWidth: opts?.frame?.width,
    frameHeight: opts?.frame?.height,
    frameLabel: opts?.frame?.label,
  });
}
