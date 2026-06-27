// 동문 경사·이변 반응 — 한 제자의 경지 상승/중상이 동문 마음에 전이형 반응(질투/축하/걱정)을 남긴다. docs/12.
// 전수조사(2026-06-27): 사망·야망충돌·직접상호작용 외엔 동문 파급 0이던 사각("완전 고립")을 경지 상승·중상에 닫음.
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { realmIndex } from '@/data/realm';
import type { Disciple, RelationLevel } from '@/types';

type Milestone = 'realm_up' | 'injured' | 'darkening' | 'achievement' | 'jianghu_death' | 'jianghu_glory';
type ReactionMood = 'envy' | 'admire' | 'worry' | 'unease' | 'grief_far';

// 반응 지속 창(일) — 짧게(전이형). docs/12.
const WINDOW: Record<Milestone, number> = {
  realm_up: 14,
  injured: 21,
  darkening: 21, // 어두워진 동문에 대한 경계가 한동안
  achievement: 10, // 첫 성취 축하는 짧게
  jianghu_death: 30, // 먼저 떠난 동문의 부고는 오래 남는다
  jianghu_glory: 14,
};

// 관측 동문의 (당사자 사건, 관계)별 반응 — null 이면 반응 없음. docs/12 §2.
function valence(kind: Milestone, rel: RelationLevel, behind: boolean, ambition: number): ReactionMood | null {
  switch (kind) {
    case 'realm_up':
      if (rel === 'friend' || rel === 'sworn') return 'admire'; // 가까운 동문 → 축하
      if (behind && (rel === 'enemy' || rel === 'distant' || ambition >= 60)) return 'envy'; // 뒤처진 라이벌 → 질투
      return null; // 무관·이미 앞섬 → 반응 없음
    case 'achievement': // 첫 영약·업적 — 가까운 동문만 축하(경지보다 가벼움, 질투 없음)
    case 'jianghu_glory': // 졸업 동문이 강호에 이름 떨침 — 가까운 동문 동경
      return rel === 'friend' || rel === 'sworn' ? 'admire' : null;
    case 'darkening': // 동문이 어두워짐 — 원수 빼고 불안·경계(가까울수록 안타까움, 멀수록 거리)
      return rel === 'enemy' ? null : 'unease';
    case 'injured': // 중상 — 원수 빼고 걱정
      return rel === 'enemy' ? null : 'worry';
    case 'jianghu_death': // 먼저 떠난 동문이 강호에서 죽음 — 원수 빼고 먼 애도
      return rel === 'enemy' ? null : 'grief_far';
  }
}

// 동문 사건(경지 상승·중상) 발생 시 호출 — 활성 동문 각자에 관계 차등 반응 마커를 남긴다.
export function reactToSiblingMilestone(subjectId: string, kind: Milestone): void {
  const ds = useDiscipleStore.getState();
  const today = useTimeStore.getState().totalDay;
  const subject = ds.disciples[subjectId];
  if (!subject) return;
  const subjRealm = realmIndex(subject.realm);
  for (const id of ds.order) {
    if (id === subjectId) continue;
    const s: Disciple | undefined = ds.disciples[id];
    if (!s || s.status === 'graduated' || s.status === 'departed') continue;
    const rel: RelationLevel = s.relationships[subjectId] ?? 'neutral';
    const behind = realmIndex(s.realm) < subjRealm;
    const mood = valence(kind, rel, behind, s.personality?.ambition ?? 50);
    if (!mood) continue;
    ds.update(id, {
      siblingEventMood: mood,
      siblingEventUntilDay: Math.max(s.siblingEventUntilDay ?? 0, today + WINDOW[kind]),
    });
  }
}
