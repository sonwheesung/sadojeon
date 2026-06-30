// 문파 평판 시스템 — docs/30_문파_평판.md.
// 사문/제자 ↔ 문파 관계를 올리고 내린다. 오케스트레이터 본문 안 건드리고 기존 훅에서 호출(SOLID).
// 현재 구동원: 의뢰 결산(성향). 추후 도덕 이벤트·졸업 노선·흑화·세가 자제 영입 등 추가.

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import { FACTIONS, repTier, type RepTier } from '@/data/factions';
import { GANGHOS_TALLY } from '@/data/tallyKeys';
import { useInboxStore } from '@/stores/inboxStore';
import { useTallyStore } from '@/stores/tallyStore';
import { useReputationStore } from '@/stores/reputationStore';
import { useSectStore } from '@/stores/sectStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';

export { repTier };

// 강호 풍문 서신(읽기 전용) — careerSystem 과 같은 채널(jianghu_news).
function pushFactionNews(title: string, body: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `faction-${day}-${Math.floor(random() * 1e6)}`,
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

// 사상색(righteousness, +정파/-사파) → 성향별 문파 평판 일괄 이동. 의뢰·도덕 이벤트 공용.
// 정의로운 행위: 정파 문파↑·사파↓. 회색/사파 행위: 반대. scale(0~1)로 크기 조절.
// 관여 제자(ids)는 같은 방향으로 개인 인연도 소폭 적립 — "제자 둘 다" 주체.
export function applyAlignmentReputation(
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

// 회색(은밀) 의뢰 평판 — **평판은 "알려진 것"에만 반응한다**(사용자 결정 2026-06-11).
// 무흔 완수는 강호(정파)가 모른다: 정파 하락은 발각 정도(exposure 0~1)에만 비례.
// 사파 신용(credit 0~1)은 일처리에 비례 — 의뢰인의 세계는 누가 했는지 안다(깔끔할수록 신용↑).
export function applyCovertReputation(
  magnitude: number,
  exposure: number,
  credit: number,
  presentDiscipleIds: string[] = [],
): void {
  const store = useReputationStore.getState();
  for (const f of FACTIONS) {
    let delta = 0;
    if (f.alignment === 'right') delta = -Math.round(magnitude * exposure);
    else if (f.alignment === 'sapa' || f.alignment === 'magyo') delta = Math.round(magnitude * credit);
    else continue; // 중도는 흔들리지 않음
    if (delta === 0) continue;
    store.adjustSect(f.id, delta);
    const half = delta > 0 ? Math.ceil(delta / 2) : Math.floor(delta / 2);
    if (half !== 0) {
      for (const id of presentDiscipleIds) store.adjustDisciple(id, f.id, half);
    }
  }
}

// 적대 문파 도전 — 결정형 강호 사건(사부 개입). docs/30 §강호 사건.
// 사부 3선택: 정면 대응 / 화친 / 무시. 효과는 사문 단위(제자 인격 아님).
export function factionThreatChoices(): { key: string; label: string }[] {
  return [
    { key: 'confront', label: '정면으로 맞선다' },
    { key: 'appease', label: '예를 갖춰 화친을 청한다' },
    { key: 'ignore', label: '무시하고 본분을 지킨다' },
  ];
}

// 결정형 강호 사건 적재 — kind 'event'(DECISION_KINDS — 진행 게이트 차단). id 결정적(문파+일자) → 멱등.
export function spawnFactionThreat(factionId: string): void {
  const f = FACTIONS.find((x) => x.id === factionId);
  if (!f) return;
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `factionthreat-${factionId}-${day}`,
    kind: 'event',
    title: `${f.name} — 도전`,
    preview: `${josa(f.name, '이', '가')} 사문에 도전장을 보냈다. 깊이 척진 그들이 본산 가까이 무인을 보내 위세를 떨친다 한다. 사부, 어찌 답하시겠습니까.`,
    eventId: `factionthreat-${factionId}`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'faction_threat', factionId, factionName: f.name },
  });
}

// 강호 사건 해소 — 사부 선택의 사문 단위 효과 적용 + 결과 풍문. 확정 seam만(평판·자금·분위기).
export function resolveFactionThreat(factionId: string, choice: string): void {
  const f = FACTIONS.find((x) => x.id === factionId);
  const name = f?.name ?? '적대 문파';
  const sect = useSectStore.getState();
  const atmo = useSectAtmosphereStore.getState();
  const tally = useTallyStore.getState();
  const cur = sect.sect?.resources ?? 0;
  tally.bump(GANGHOS_TALLY.factionThreat); // 도전을 마주한 사실(분기 무관)
  if (choice === 'confront') {
    tally.bump(GANGHOS_TALLY.factionConfront); // 업적: 강호의 적과 맞서다
    sect.adjustResources(-Math.min(cur, 150));
    atmo.adjust({ unity: 2 });
    adjustSectRep(factionId, -4); // 응수 — 골이 더 깊어짐
    pushFactionNews(
      `${name} — 대치`,
      `사문이 ${josa(name, '과', '와')} 정면으로 맞섰다. 본산의 결속은 단단해졌으나, 두 문파의 골은 더 깊어졌다.`,
    );
  } else if (choice === 'appease') {
    tally.bump(GANGHOS_TALLY.factionAppease); // 업적: 원한을 풀다
    sect.adjustResources(-Math.min(cur, 120));
    adjustSectRep(factionId, 25); // 화친 — 적대 완화
    atmo.adjust({ unity: -1 });
    pushFactionNews(
      `${name} — 화친`,
      `사문이 예물을 갖춰 ${josa(name, '과', '와')} 척을 풀었다. 체면은 굽혔으나 칼끝은 거두었다.`,
    );
  } else {
    // ignore — 방치, 자객 피해
    const loss = Math.min(cur, 200 + Math.floor(random() * 200));
    sect.adjustResources(-loss);
    adjustSectRep(factionId, -3);
    atmo.adjust({ unity: -2 });
    pushFactionNews(
      `${name} — 방치`,
      `사문이 ${name}의 시비를 흘려보냈다. 자객의 횡포에 금자 ${loss}냥을 잃고 본산이 술렁인다.`,
    );
  }
}

// 매년 1회(연 경계) — 평판이 결과로 돌아온다. 맹우 문파는 후의(자금 선물), 적대 문파는 자객·시비(피해).
// 가장 깊게 척진 적대 문파 1곳은 결정형 강호 사건(사부 개입)으로 — 나머지는 자금 피해 풍문. docs/30.
// 대부분 문파는 평범(0)이라 초반엔 거의 발동 X — 관계를 쌓아야 영향이 생김.
export function tickReputationInfluence(): void {
  const rep = useReputationStore.getState().sect;
  // 적대 중 최악 1곳만 결정형 사건(연간 최대 1건, 도배 방지).
  const hostiles = FACTIONS.filter((f) => repTier(rep[f.id] ?? 0) === 'hostile');
  const worst = hostiles.reduce<(typeof FACTIONS)[number] | null>(
    (acc, f) => (acc == null || (rep[f.id] ?? 0) < (rep[acc.id] ?? 0) ? f : acc),
    null,
  );
  for (const f of FACTIONS) {
    const tier = repTier(rep[f.id] ?? 0);
    if (tier === 'ally' && random() < 0.5) {
      const gift = 200 + Math.floor(random() * 300);
      useSectStore.getState().adjustResources(gift);
      pushFactionNews(
        `${f.name} — 후의`,
        `${josa(f.name, '이', '가')} 사문에 사례를 보내왔다. 두터운 관계의 보답으로 금자 ${gift}냥이 금고에 들었다.`,
      );
    } else if (tier === 'hostile') {
      if (worst && f.id === worst.id && random() < 0.6) {
        spawnFactionThreat(f.id); // 사부가 응답할 결정형 강호 사건
      } else if (random() < 0.5) {
        const cur = useSectStore.getState().sect?.resources ?? 0;
        const loss = Math.min(cur, 150 + Math.floor(random() * 250));
        useSectStore.getState().adjustResources(-loss);
        pushFactionNews(
          `${f.name} — 시비`,
          `${josa(f.name, '이', '가')} 사문에 자객을 보냈다는 흉흉한 소문. 대응에 금자 ${loss}냥을 썼다.`,
        );
      }
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
