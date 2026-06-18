// 중재 면담(2인)·상담(1:1) — 사부가 동문 관계에 개입하는 능동 레버. docs/33 §3.
// 사문에 응어리(원수·소원) 쌍이 있으면 낮은 확률로 기회가 서신함에 뜬다:
//   중재(2인): 화해 유도 / 거리 두기 / 한쪽 편들기 / 지켜본다
//   상담(1:1): 마음을 풀어준다 / 다독인다 / 말을 아낀다
// 화해는 단계적(원수→소원→무관, 무관 위로는 중재로 안 올라감 — 우정은 저들 몫).
// 성공률 = 사부 통찰 + 신뢰 + 사연 인지(통찰 ★4↑ × 시드 적대) + 훈계 누적(도덕 이벤트 history).
// 잘못 들쑤시면 악화(신뢰·스트레스) — 개입은 공짜가 아니다.

import { random } from '@/systems/rng';
import { STARTING_RIVALRIES } from '@/data/disciples/startingPool';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useEventHistoryStore } from '@/stores/eventHistoryStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useMasterStore } from '@/stores/masterStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, RelationLevel } from '@/types';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// 발화 확률 🔧 — 응어리 쌍이 있을 때만 굴림. 미해소 항목이 이미 있으면 스킵(중복 방지).
const MEDIATION_DAILY_CHANCE = 0.05;
const COUNSEL_DAILY_CHANCE = 0.04;

// 화해 방향 한 단계 — 무관(neutral)까지만. 그 위(친밀·의형제)는 중재로 만들 수 없다.
const TOWARD_NEUTRAL: Partial<Record<RelationLevel, RelationLevel>> = {
  enemy: 'distant',
  distant: 'neutral',
};
const REL_DOWN: Record<RelationLevel, RelationLevel> = {
  sworn: 'friend',
  friend: 'neutral',
  neutral: 'distant',
  distant: 'enemy',
  enemy: 'enemy',
};

function isActive(d: Disciple | undefined): d is Disciple {
  return (
    !!d && (d.status === 'training' || d.status === 'resting' || d.status === 'meditating')
  );
}

// 응어리 쌍 — 어느 한쪽이라도 원수·소원이면 중재 대상.
function grudgePairs(): Array<[Disciple, Disciple]> {
  const ds = useDiscipleStore.getState();
  const list = ds.order.map((id) => ds.disciples[id]).filter(isActive);
  const pairs: Array<[Disciple, Disciple]> = [];
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i];
      const b = list[j];
      const ab = a.relationships[b.id] ?? 'neutral';
      const ba = b.relationships[a.id] ?? 'neutral';
      if (ab === 'enemy' || ba === 'enemy' || ab === 'distant' || ba === 'distant') {
        pairs.push([a, b]);
      }
    }
  }
  return pairs;
}

function hasUnresolved(domain: string): boolean {
  return useInboxStore
    .getState()
    .items.some((i) => !i.resolved && (i.payload as { domain?: string } | undefined)?.domain === domain);
}

// 사부 통찰 ★(1~5) — 0~100 스케일에서 환산.
function masterInsightTier(): number {
  const insight = useMasterStore.getState().master?.stats.insight ?? 0;
  return Math.max(1, Math.min(5, Math.floor(insight / 20) + 1));
}

// 시드 적대(사연 있는 쌍) 여부 — 통찰 ★4↑ 사부는 사연을 알고 중재한다(효과↑). docs/33 §3.
function isSeededRivalry(aId: string, bId: string): boolean {
  return STARTING_RIVALRIES.some(
    (r) => (r.aware === aId && r.unaware === bId) || (r.aware === bId && r.unaware === aId),
  );
}

// 훈계 누적 — 적대발 도덕 이벤트에서 훈계(admonish)를 거듭했으면 화해 노선 보너스. docs/15.
function admonishBonus(aId: string, bId: string): number {
  const records = useEventHistoryStore.getState().records;
  const n = records.filter(
    (r) =>
      r.tone === 'admonish' &&
      ((r.discipleId === aId && r.siblingId === bId) ||
        (r.discipleId === bId && r.siblingId === aId)),
  ).length;
  return Math.min(0.15, n * 0.05);
}

function pushReport(title: string, body: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `mediation-report-${day}-${Math.floor(random() * 1e6)}`,
    kind: 'report',
    title,
    preview: body.split('\n')[0],
    body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// ─── 일일 트리거 — triggerPostSettlement 에서 호출 ──────────────────────────

export function triggerDailyMediation(): void {
  const pairs = grudgePairs();
  if (pairs.length === 0) return;
  const day = useTimeStore.getState().totalDay;

  // 중재(2인) 기회.
  if (!hasUnresolved('mediation') && random() < MEDIATION_DAILY_CHANCE) {
    const [a, b] = pairs[Math.floor(random() * pairs.length)];
    useInboxStore.getState().add({
      id: `mediation-${a.id}-${b.id}-${day}`,
      kind: 'event',
      eventId: 'mediation',
      title: `${a.name}·${b.name} — 사이가 심상치 않다`,
      preview: `${a.name}과(와) ${b.name}이(가) 마주쳐도 서로 눈을 피한다. 수련 중에도 함께 서지 않으려 한다. 사부로서 어찌할 것인가.`,
      priority: 'high',
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: { domain: 'mediation', aId: a.id, bId: b.id, aName: a.name, bName: b.name },
    });
    return; // 하루 한 건만
  }

  // 상담(1:1) 기회 — 응어리 쌍의 한쪽을 따로 부른다.
  if (!hasUnresolved('counsel') && random() < COUNSEL_DAILY_CHANCE) {
    const [a, b] = pairs[Math.floor(random() * pairs.length)];
    const subject = random() < 0.5 ? a : b;
    const other = subject.id === a.id ? b : a;
    useInboxStore.getState().add({
      id: `counsel-${subject.id}-${day}`,
      kind: 'event',
      eventId: 'counsel',
      title: `${subject.name} — 마음에 응어리가 보인다`,
      preview: `${subject.name}이(가) ${other.name} 얘기만 나오면 낯빛이 굳는다. 조용히 불러 마음을 물어볼 것인가.`,
      priority: 'normal',
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: {
        domain: 'counsel',
        subjectId: subject.id,
        otherId: other.id,
        subjectName: subject.name,
        otherName: other.name,
      },
    });
  }
}

// ─── 선택지 — inboxResolve 에서 사용 ─────────────────────────────────────────

export function mediationChoices(aName: string, bName: string) {
  return [
    { key: 'reconcile', label: '둘을 같이 불러 응어리를 풀어본다' },
    { key: 'separate', label: '당분간 서로 떨어뜨려 놓는다' },
    { key: `side-a`, label: `${aName}의 편을 들어준다` },
    { key: `side-b`, label: `${bName}의 편을 들어준다` },
    { key: 'observe', label: '지켜본다' },
  ];
}

export function counselChoices() {
  return [
    { key: 'untangle', label: '응어리의 연유를 듣고 오해를 풀어준다' },
    { key: 'soothe', label: '다독여 마음을 가라앉힌다' },
    { key: 'hold', label: '말을 아낀다' },
  ];
}

// ─── 해소 — 효과 적용 ────────────────────────────────────────────────────────

export function resolveMediation(aId: string, bId: string, key: string): void {
  const ds = useDiscipleStore.getState();
  const a = ds.disciples[aId];
  const b = ds.disciples[bId];
  if (!a || !b) return;

  if (key === 'reconcile') {
    // 성공률 = 기본 + 통찰 + 평균 신뢰 + 사연 인지(통찰★4↑ × 시드 적대) + 훈계 누적. 🔧
    const tier = masterInsightTier();
    const avgTrust = ((a.trustToMaster ?? 0) + (b.trustToMaster ?? 0)) / 2;
    const backstoryKnown = tier >= 4 && isSeededRivalry(aId, bId);
    const p = Math.min(
      0.9,
      0.3 + tier * 0.07 + avgTrust / 500 + (backstoryKnown ? 0.15 : 0) + admonishBonus(aId, bId),
    );
    if (random() < p) {
      const ab = a.relationships[bId] ?? 'neutral';
      const ba = b.relationships[aId] ?? 'neutral';
      const nextAb = TOWARD_NEUTRAL[ab];
      const nextBa = TOWARD_NEUTRAL[ba];
      if (nextAb) ds.setRelation(aId, bId, nextAb);
      if (nextBa) ds.setRelation(bId, aId, nextBa);
      pushReport(
        `${a.name}·${b.name} — 응어리가 한 꺼풀 벗겨졌다`,
        `사부가 둘을 같이 앉혔다. 한참의 침묵 끝에, ${a.name}과(와) ${b.name}이(가) 서로에게 처음으로 고개를 끄덕였다. 응어리가 다 풀린 건 아니나 — 한 꺼풀은 분명 벗겨졌다.`,
      );
    } else if (random() < 0.5) {
      // 서먹하게 끝남 — 변화 없음.
      pushReport(
        `${a.name}·${b.name} — 자리가 무겁게 끝났다`,
        `사부가 둘을 같이 앉혔으나, 둘 다 입을 열지 않았다. 자리는 무겁게 끝났다. 아직 때가 아닌지도 모른다.`,
      );
    } else {
      // 괜히 들쑤심 — 악화.
      ds.adjustTrust(aId, -3);
      ds.adjustTrust(bId, -3);
      ds.update(aId, { stress: clamp((a.stress ?? 0) + 4) });
      ds.update(bId, { stress: clamp((b.stress ?? 0) + 4) });
      pushReport(
        `${a.name}·${b.name} — 괜히 들쑤셨다`,
        `사부가 둘을 같이 앉혔으나, 묵은 말이 그만 날카롭게 오갔다. 둘 다 굳은 얼굴로 일어섰다. 들쑤신 자리가 더 쓰리다.`,
      );
    }
    return;
  }

  if (key === 'separate') {
    // 거리 두기 — 관계는 그대로, 마음은 쉰다.
    ds.update(aId, { stress: clamp((a.stress ?? 0) - 4) });
    ds.update(bId, { stress: clamp((b.stress ?? 0) - 4) });
    return;
  }

  if (key === 'side-a' || key === 'side-b') {
    const sided = key === 'side-a' ? a : b;
    const other = key === 'side-a' ? b : a;
    ds.adjustTrust(sided.id, 6);
    ds.adjustTrust(other.id, -6);
    ds.update(other.id, { stress: clamp((other.stress ?? 0) + 5) });
    const rel = other.relationships[sided.id] ?? 'neutral';
    ds.setRelation(other.id, sided.id, REL_DOWN[rel]);
    pushReport(
      `사부가 ${sided.name}의 편에 섰다`,
      `사부가 ${sided.name}의 손을 들어주었다. ${sided.name}은(는) 어깨를 폈으나, ${other.name}의 눈빛이 한층 어두워졌다.`,
    );
    return;
  }
  // observe — 지켜본다. 변화 없음.
}

export function resolveCounsel(subjectId: string, otherId: string, key: string): void {
  const ds = useDiscipleStore.getState();
  const subject = ds.disciples[subjectId];
  const other = ds.disciples[otherId];
  if (!subject || !other) return;

  if (key === 'untangle') {
    // 그 제자의 인식만 — 한 방향, 중재(2인)보다 약함. 🔧
    const tier = masterInsightTier();
    const p = Math.min(0.7, 0.25 + tier * 0.06 + (subject.trustToMaster ?? 0) / 600);
    if (random() < p) {
      const rel = subject.relationships[otherId] ?? 'neutral';
      const next = TOWARD_NEUTRAL[rel];
      if (next) ds.setRelation(subjectId, otherId, next);
      pushReport(
        `${subject.name} — 마음이 조금 풀렸다`,
        `사부 앞에서 ${subject.name}이(가) 오래 담아둔 말을 꺼냈다. 다 풀린 건 아니나, ${other.name}을(를) 보는 눈이 조금은 누그러졌다.`,
      );
    }
    return;
  }
  if (key === 'soothe') {
    ds.adjustTrust(subjectId, 4);
    ds.update(subjectId, { stress: clamp((subject.stress ?? 0) - 4) });
    return;
  }
  // hold — 말을 아낀다. 변화 없음.
}

// ─── 적대 이벤트 → 관계 배선 — eventEngine.resolveMoral 에서 호출. docs/33 §4 ───
// 적대 페어 개인 이벤트(시드: 윤소소·독고연 풀)의 사부 4응답이 실제 관계를 움직인다:
//   훈계 = 화해 노선(가해자가 반성 → 상대를 보는 눈이 풀릴 확률) · 엄벌 = 피해자의 응어리가 풀릴 확률
//   폐관 = 약한 반성 · 묵인 = 적대 심화(피해자 → 가해자 악화 확률, 사생결단 노선 가속)
export function applyRivalryTone(
  perpId: string,
  siblingId: string,
  tone: 'punish' | 'seclusion' | 'admonish' | 'overlook',
): void {
  const ds = useDiscipleStore.getState();
  const perp = ds.disciples[perpId];
  const sibling = ds.disciples[siblingId];
  if (!perp || !sibling) return;

  if (tone === 'admonish' && random() < 0.25) {
    const rel = perp.relationships[siblingId] ?? 'neutral';
    const next = TOWARD_NEUTRAL[rel];
    if (next) ds.setRelation(perpId, siblingId, next);
  } else if (tone === 'punish' && random() < 0.2) {
    const rel = sibling.relationships[perpId] ?? 'neutral';
    const next = TOWARD_NEUTRAL[rel];
    if (next) ds.setRelation(siblingId, perpId, next);
  } else if (tone === 'seclusion' && random() < 0.1) {
    const rel = perp.relationships[siblingId] ?? 'neutral';
    const next = TOWARD_NEUTRAL[rel];
    if (next) ds.setRelation(perpId, siblingId, next);
  } else if (tone === 'overlook' && random() < 0.25) {
    const rel = sibling.relationships[perpId] ?? 'neutral';
    ds.setRelation(siblingId, perpId, REL_DOWN[rel]);
  }
}
