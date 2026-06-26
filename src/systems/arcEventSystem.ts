// 캐릭터 필수 이벤트 아크 — 연 1회/제자 무조건 발화. docs/47·48.
//
// 발화 모델(docs/47 §10):
//   - 계절 슬롯: 회차 시작 시 제자별 발화 계절 고정 배정(한 계절 최대 1명, E3).
//   - defer-until-active: 그 계절이 와도 의뢰·연단·폐관·부상 중이면 미루고, training·resting 으로
//     돌아온 첫 날 지급(E1·E2). 못 받고 해를 넘기면 이월(빚으로 남아 다음 활성 시 가장 이른 연차부터, E6).
//   - 슬롯 키 = (discipleId, yearInSect): 한 해 1번(E15). 서신함 add 는 멱등이라 매 tick 재시도 안전.
//
// 본 모듈은 "예약→지급(서신함 적재)"만. 4선택 효과·기록(arcChoices)은 inboxResolve('arc') 가 처리.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, Season } from '@/types';
import { getArcEvent } from '@/data/scenarios/arcEvents';
import { arcToInbox } from './eventInbox';

const SEASON_ORDER: readonly Season[] = ['spring', 'summer', 'autumn', 'winter'];

// 로스터 크기별 발화 계절 — 한 계절 1명, 최대 분산(사용자 결정 2026-06-26, docs/47 §10 E3).
//  4명: 봄·여름·가을·겨울 / 3명: 봄·여름·가을 / 2명: 봄·가을(마주봄) / 1명: 봄.
const ARC_SEASONS_BY_COUNT: Record<number, Season[]> = {
  1: ['spring'],
  2: ['spring', 'autumn'],
  3: ['spring', 'summer', 'autumn'],
  4: ['spring', 'summer', 'autumn', 'winter'],
};

// 회차 시작 시 각 제자에 발화 계절 고정 배정(로스터 인덱스). seedNewRun 에서 setAll 전 호출.
export function assignArcSeasons(list: Disciple[]): void {
  const seasons = ARC_SEASONS_BY_COUNT[list.length] ?? SEASON_ORDER.slice(0, Math.max(1, list.length));
  list.forEach((d, i) => {
    d.arcSeason = seasons[i % seasons.length];
  });
}

// 입문 후 경과 연차(1년차부터). triggers.yearsInSect 와 동일 계약.
function yearInSect(d: Disciple, currentYear: number): number {
  return Math.max(1, currentYear - d.entryYear + 1);
}

// arc 발화 가능 상태 — 폐관·의뢰·연단·부상 중엔 미룬다(§10 E1·E2). training·resting 만.
function arcActive(d: Disciple): boolean {
  return d.status === 'training' || d.status === 'resting';
}

// 그 제자가 빚진(아직 기록 안 된, 콘텐츠 있는) 가장 이른 연차. 없으면 null.
// reached = 올해 발화 계절이 이미 도래했는가 → 도래면 올 연차까지, 아니면 작년 연차까지 빚.
export function earliestOwedYear(d: Disciple, year: number, season: Season): number | null {
  if (!d.arcSeason) return null;
  const y = yearInSect(d, year);
  const reachedThisYear = SEASON_ORDER.indexOf(season) >= SEASON_ORDER.indexOf(d.arcSeason);
  const oweUpTo = reachedThisYear ? y : y - 1;
  if (oweUpTo < 1) return null;
  const recorded = new Set((d.arcChoices ?? []).map((c) => c.year));
  for (let yr = 1; yr <= oweUpTo; yr++) {
    if (recorded.has(yr)) continue;
    if (!getArcEvent(d.id, yr)) continue; // 콘텐츠 없는 연차는 빚으로 안 침(graybox: 일부만 존재)
    return yr;
  }
  return null;
}

// 매 정산 후(triggerPostSettlement) 호출 — 활성 제자의 빚진 가장 이른 연차 이벤트를 서신함에 지급.
// 미해소 동안 진행 게이트가 막으므로 한 번에 한 결정만 노출된다.
export function triggerArcEvents(): void {
  const ds = useDiscipleStore.getState();
  const time = useTimeStore.getState().current;
  const day = useTimeStore.getState().totalDay;
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || !arcActive(d)) continue;
    const yr = earliestOwedYear(d, time.year, time.season);
    if (yr == null) continue;
    const ev = getArcEvent(d.id, yr);
    if (!ev) continue;
    arcToInbox(d, ev, day); // 멱등(중복 id 무시) — 매 tick 재시도해도 1개만 쌓인다
  }
}
