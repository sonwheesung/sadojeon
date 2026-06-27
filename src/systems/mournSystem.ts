// 동문 상실 애도 — 의뢰 재난으로 동문이 죽었을 때, 활성 생존 제자에 정서 파급(친밀 차등). docs/12.
// 죽은 제자만 'departed' 처리하고 끝나던 사각(생존자 무애도 → 사망 다음 날 평온 대사 = 이중인격)을 닫는다.
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { attemptQuestEnlightenment } from './trainingSystem';
import type { RelationLevel } from '@/types';

// 죽은 동문과의 관계별 [스트레스, 애도 기간(일)]. 원수는 깊은 애도 아닌 옅은 동요(복합 감정),
// 의형제는 가장 깊은 애도. 스트레스는 숨은변수(라벨 X) — 관찰은 침울한 대사로만. docs/12 §2.
const GRIEF: Record<RelationLevel, { stress: number; days: number }> = {
  sworn: { stress: 18, days: 56 },
  friend: { stress: 12, days: 42 },
  neutral: { stress: 6, days: 28 },
  distant: { stress: 4, days: 21 },
  enemy: { stress: 2, days: 14 },
};

// '상실' 깨달음 보너스 — 가까운 이의 죽음이 벽을 뚫는 무협 정서. attemptQuestEnlightenment 가
// 세 기둥+벽 앞일 때만 발동(self-gate)이라 안전(보류 중 성장/돌파 내부 무수정). docs/12 §7.
const LOSS_ENLIGHTENMENT_BONUS = 0.15;

// 의뢰 재난으로 동문이 죽었을 때 호출(questSystem 사망 seam) — 활성 생존 제자 각자에 친밀 차등 애도 파급.
export function mournLostSibling(deceasedId: string): void {
  const ds = useDiscipleStore.getState();
  const today = useTimeStore.getState().totalDay;
  for (const id of ds.order) {
    if (id === deceasedId) continue;
    const d = ds.disciples[id];
    if (!d || d.status === 'graduated' || d.status === 'departed') continue;
    const rel: RelationLevel = d.relationships[deceasedId] ?? 'neutral';
    const g = GRIEF[rel];
    ds.adjustStress(id, g.stress);
    // 중복 상실 시 더 긴 쪽으로 연장(max). 회차 스코프.
    ds.update(id, { mourningUntilDay: Math.max(d.mourningUntilDay ?? 0, today + g.days) });
    // 가까운 이(벗·의형제)의 죽음 — 벽 앞이면 '상실' 깨달음 한 번 굴림(아니면 self-gate로 무효과).
    if (rel === 'friend' || rel === 'sworn') attemptQuestEnlightenment(id, LOSS_ENLIGHTENMENT_BONUS);
  }
}
