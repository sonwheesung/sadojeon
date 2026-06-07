// 문파 평판 시스템 — docs/30_문파_평판.md.
// 사문/제자 ↔ 문파 관계를 올리고 내린다. 오케스트레이터 본문 안 건드리고 기존 훅에서 호출(SOLID).
// 현재 구동원: 의뢰 결산(성향). 추후 도덕 이벤트·졸업 노선·흑화·세가 자제 영입 등 추가.

import { FACTIONS, repTier, type RepTier } from '@/data/factions';
import { useInboxStore } from '@/stores/inboxStore';
import { useReputationStore } from '@/stores/reputationStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';

export { repTier };

// 강호 풍문 서신(읽기 전용) — careerSystem 과 같은 채널(jianghu_news).
function pushFactionNews(title: string, body: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `faction-${day}-${Math.floor(Math.random() * 1e6)}`,
    kind: 'rumor',
    title,
    preview: body,
    body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

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

// 매년 1회(연 경계) — 평판이 결과로 돌아온다. 맹우 문파는 후의(자금 선물), 적대 문파는 자객·시비(피해).
// docs/30. 대부분 문파는 평범(0)이라 초반엔 거의 발동 X — 관계를 쌓아야 영향이 생김.
export function tickReputationInfluence(): void {
  const rep = useReputationStore.getState().sect;
  for (const f of FACTIONS) {
    const tier = repTier(rep[f.id] ?? 0);
    if (tier === 'ally' && Math.random() < 0.5) {
      const gift = 200 + Math.floor(Math.random() * 300);
      useSectStore.getState().adjustResources(gift);
      pushFactionNews(
        `${f.name} — 후의`,
        `${f.name}이 사문에 사례를 보내왔다. 두터운 관계의 보답으로 금자 ${gift}냥이 금고에 들었다.`,
      );
    } else if (tier === 'hostile' && Math.random() < 0.5) {
      const cur = useSectStore.getState().sect?.resources ?? 0;
      const loss = Math.min(cur, 150 + Math.floor(Math.random() * 250));
      useSectStore.getState().adjustResources(-loss);
      pushFactionNews(
        `${f.name} — 시비`,
        `${f.name}이 사문에 자객을 보냈다는 흉흉한 소문. 대응에 금자 ${loss}냥을 썼다.`,
      );
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
