// 문파 평판 시스템 — docs/30_문파_평판.md.
// 사문/제자 ↔ 문파 관계를 올리고 내린다. 오케스트레이터 본문 안 건드리고 기존 훅에서 호출(SOLID).
// 현재 구동원: 의뢰 결산(성향). 추후 도덕 이벤트·졸업 노선·흑화·세가 자제 영입 등 추가.

import { FACTIONS, repTier, type RepTier } from '@/data/factions';
import { useReputationStore } from '@/stores/reputationStore';

export { repTier };

// 사문 평판 조정.
export function adjustSectRep(factionId: string, delta: number): void {
  if (delta === 0) return;
  useReputationStore.getState().adjustSect(factionId, delta);
}

// 제자 개인의 문파 인연 조정.
export function adjustDiscipleRep(discipleId: string, factionId: string, delta: number): void {
  if (delta === 0) return;
  useReputationStore.getState().adjustDisciple(discipleId, factionId, delta);
}

// 의뢰 사상색(righteousness, +정파/-사파) → 성향별 문파 평판 일괄 이동.
// 정의로운 완수: 정파 문파↑·사파↓. 회색/사파 의뢰: 반대. outcomeScale(0~1)로 크기 조절.
// 동행 제자(present)는 같은 방향으로 개인 인연도 소폭 적립 — "제자 둘 다" 주체.
export function applyQuestReputation(
  righteousness: number,
  outcomeScale: number,
  presentDiscipleIds: string[] = [],
): void {
  if (righteousness === 0 || outcomeScale <= 0) return;
  const store = useReputationStore.getState();
  // 정파 의뢰 1건 ≈ 정파 +2, 사파 -2 (완수 기준). 회색이면 부호 반전.
  const base = Math.sign(righteousness) * Math.max(1, Math.round(Math.abs(righteousness) * 0.6 * outcomeScale));

  for (const f of FACTIONS) {
    let delta = 0;
    if (f.alignment === 'right') delta = base;
    else if (f.alignment === 'sapa' || f.alignment === 'magyo') delta = -base;
    else continue; // 중도는 성향 의뢰에 흔들리지 않음
    store.adjustSect(f.id, delta);
    // 동행 제자 개인 인연 — 사문의 절반 정도.
    const half = delta > 0 ? Math.ceil(delta / 2) : Math.floor(delta / 2);
    if (half !== 0) {
      for (const id of presentDiscipleIds) store.adjustDisciple(id, f.id, half);
    }
  }
}

// 한 주체의 가장 두드러진 관계(맹우/적대) 요약 — UI 강조용. (선택)
export function strongestTie(rep: Record<string, number>): { factionId: string; tier: RepTier } | null {
  let best: { factionId: string; value: number } | null = null;
  for (const [factionId, value] of Object.entries(rep)) {
    if (!best || Math.abs(value) > Math.abs(best.value)) best = { factionId, value };
  }
  if (!best || best.value === 0) return null;
  return { factionId: best.factionId, tier: repTier(best.value) };
}
