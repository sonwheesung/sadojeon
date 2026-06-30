// 동문 야망 충돌 — 친밀한 두 동문이 "같은 자리(강호의 정점)"를 욕망할 때의 사부 결정. docs/19·33 §4.
// 중재(mediationSystem)와 짝을 이루는 능동 레버: 중재는 응어리(원수·소원)를 푸는 쪽, 이쪽은 정(친밀)이
// 같은 야망과 부딪힐 때의 결단. "사이가 좋으니 괜찮다"가 아니다 — 친밀할수록 같은 자리를 두고 더 아프다.
//
// 발화: 출도전기(졸업 1년 전, 양육 14년차)에 — 둘 다 활동 중·야망 60+·서로 친밀(friend/sworn)이면
//       서신함에 사부의 4선택 결정(차단형)을 한 번 띄운다. 회차당 제자 1회(ambitionRivalry 마커).
//       졸업 *순간*이 아니라 1년 전에 띄우는 이유: 동기 회차는 전원 같은 날 졸업→phase='ended' 즉시
//       전환되어 그 순간의 결정은 표류한다(graduationSystem R17). 출도전기면 둘 다 사문에 남아 있다.
// 4선택: 양보(defer)·동맹(ally)·격려(challenge)·무관심(ignore). 각기 관계·인격·신뢰를 움직이고
//        컷씬을 발화한다. 졸업 후 강호 행로는 이 변동(흑화 드라이버·관계)으로 기존 시스템이 자연히 가른다.

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import { GRADUATION } from '@/data/constants';
import { REL_DOWN, REL_UP } from '@/data/relationTransitions';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTallyStore } from '@/stores/tallyStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, RelationLevel } from '@/types';
import { MIND_TALLY } from '@/data/tallyKeys';
import { shiftPersona } from './personaShift';
import { playCutscene } from './cutsceneSystem';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// 야망 충돌 문턱 🔧 — 인격 야망(0~100). 60+ = "한자리를 노린다"(docs/19 야망 텍스트 60~80).
const AMBITION_MIN = 60;
// 출도전기 = 졸업(RAISING_YEARS년) 1년 전. 이때부터 충돌 결정을 띄운다.
const CONFLICT_RAISED_YEARS = GRADUATION.RAISING_YEARS - 1;

function isActive(d: Disciple | undefined): d is Disciple {
  return !!d && (d.status === 'training' || d.status === 'resting' || d.status === 'meditating');
}

// 친밀(서로 friend/sworn) — 한쪽만 친밀이면 충돌 시드 아님(docs/19: 친밀한 동문).
function isMutualClose(a: Disciple, b: Disciple): boolean {
  const ab = a.relationships[b.id] ?? 'neutral';
  const ba = b.relationships[a.id] ?? 'neutral';
  const close = (r: RelationLevel) => r === 'friend' || r === 'sworn';
  return close(ab) && close(ba);
}

// 충돌 후보 쌍 — 둘 다 활동·출도전기 도달·야망 60+·서로 친밀·아직 충돌 미발화.
function conflictPairs(): Array<[Disciple, Disciple]> {
  const ds = useDiscipleStore.getState();
  const year = useTimeStore.getState().current.year;
  const list = ds.order
    .map((id) => ds.disciples[id])
    .filter(isActive)
    .filter((d) => year - (d.entryYear ?? year) >= CONFLICT_RAISED_YEARS)
    .filter((d) => (d.personality?.ambition ?? 50) >= AMBITION_MIN)
    .filter((d) => !d.ambitionRivalry); // 회차당 제자 1회
  const pairs: Array<[Disciple, Disciple]> = [];
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      if (isMutualClose(list[i], list[j])) pairs.push([list[i], list[j]]);
    }
  }
  return pairs;
}

function hasUnresolved(domain: string): boolean {
  return useInboxStore
    .getState()
    .items.some((i) => !i.resolved && (i.payload as { domain?: string } | undefined)?.domain === domain);
}

// ─── 일일 트리거 — triggerPostSettlement 에서 호출(중재 다음). ────────────────
// 무작위 굴림이 아니라 조건 충족 즉시 한 번(출도전기의 분수령). 차단형이라 미해소 중엔 중복 안 띄움.
export function triggerAmbitionConflict(): void {
  if (hasUnresolved('ambition_conflict')) return;
  const pairs = conflictPairs();
  if (pairs.length === 0) return;
  const [a, b] = pairs[0];
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `ambition-${a.id}-${b.id}-${day}`,
    kind: 'event',
    eventId: 'ambition_conflict',
    title: `${a.name}·${b.name} — 같은 자리를 본다`,
    preview:
      `${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 더없이 가까운 동문이건만, 둘 다 강호의 같은 꼭대기를 마음에 품었다.\n` +
      `머잖아 하산할 두 사람이다. 사부로서, 이 엇갈린 큰 뜻을 어찌 다스릴 것인가.`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'ambition_conflict', aId: a.id, bId: b.id, aName: a.name, bName: b.name },
  });
}

// ─── 선택지 — inboxResolve 에서 사용. docs/19 사부의 4선택. ────────────────────
export function ambitionChoices(aName: string, bName: string) {
  return [
    { key: 'defer', label: `한 사람에게 다른 정점을 권한다 (양보)` },
    { key: 'ally', label: `둘이 한 자리를 함께 떠받치게 한다 (동맹)` },
    { key: 'challenge', label: `둘 다 제 길을 가도록 격려한다 (정정당당)` },
    { key: 'ignore', label: `둘의 일은 둘에게 맡긴다 (관여 않음)` },
  ];
}

// ─── 해소 — 효과 적용 + 컷씬 + 풍문 + 집계. ──────────────────────────────────

function pushReport(title: string, body: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `ambition-report-${day}-${Math.floor(random() * 1e6)}`,
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

// 인격 델타 적용(나이·관성 반영) + 저장. 항상 최신 제자를 다시 읽어 직전 변동과 누적되게.
function bumpPersona(id: string, deltas: Parameters<typeof shiftPersona>[1]): void {
  const d = useDiscipleStore.getState().disciples[id];
  if (!d) return;
  useDiscipleStore.getState().update(id, { personality: shiftPersona(d, deltas) });
}

// 관계 n단계 악화(REL_DOWN 반복).
function relDownBy(rel: RelationLevel, n: number): RelationLevel {
  let r = rel;
  for (let i = 0; i < n; i += 1) r = REL_DOWN[r];
  return r;
}

export function resolveAmbitionConflict(aId: string, bId: string, key: string): void {
  const ds = useDiscipleStore.getState();
  const a = ds.disciples[aId];
  const b = ds.disciples[bId];
  if (!a || !b) return;
  const outcome = (['defer', 'ally', 'challenge', 'ignore'].includes(key) ? key : 'ignore') as
    NonNullable<Disciple['ambitionRivalry']>['outcome'];

  // 집계 — 충돌을 마주한 사실 + 분기별(업적 판정·계정 영속).
  const tally = useTallyStore.getState();
  tally.bump(MIND_TALLY.ambitionConflict);

  if (key === 'defer') {
    // A 양보 — 야망이 낮은 쪽이 다른 정점으로 물러선다. 정은 유지(관계 불변), 신뢰↑.
    const deferrer = (a.personality?.ambition ?? 50) <= (b.personality?.ambition ?? 50) ? a : b;
    bumpPersona(deferrer.id, { ambition: -15 });
    ds.adjustTrust(aId, 5);
    ds.adjustTrust(bId, 5);
    tally.bump(MIND_TALLY.ambitionDefer);
    playCutscene('ambition_defer', { id: a.id, name: `${a.name}·${b.name}` });
    pushReport(
      `${a.name}·${b.name} — 한 사람이 한 발 물러서다`,
      `사부가 둘을 갈라 세웠다. ${josa(deferrer.name, '이', '가')} 다른 정점을 향해 길을 틀고, 다른 한 사람은 본래의 꼭대기를 노린다. 같은 자리를 두고 다툴 뻔한 정이 — 다치지 않고 남았다.`,
    );
  } else if (key === 'ally') {
    // B 동맹 — 한 자리를 함께. 관계 한 단계 호전(→의형제), 신뢰 크게↑. 둘 다 야망 극단이면 균열 위험.
    const ab = a.relationships[bId] ?? 'neutral';
    const ba = b.relationships[aId] ?? 'neutral';
    ds.setRelation(aId, bId, REL_UP[ab]);
    ds.setRelation(bId, aId, REL_UP[ba]);
    ds.adjustTrust(aId, 8);
    ds.adjustTrust(bId, 8);
    tally.bump(MIND_TALLY.ambitionAlly);
    playCutscene('ambition_alliance', { id: a.id, name: `${a.name}·${b.name}` });
    const bothExtreme = (a.personality?.ambition ?? 50) >= 85 && (b.personality?.ambition ?? 50) >= 85;
    pushReport(
      `${a.name}·${b.name} — 한 자리를 함께 떠받치다`,
      bothExtreme
        ? `사부가 둘을 한 자리에 묶었다. 양강과 음유가 정파의 정점을 함께 떠받친다. 허나 두 사람 모두 꼭대기를 향한 뜻이 너무 굳세어 — 언젠가 그 동맹이 갈라질 불씨도 함께 깃들었다.`
        : `사부가 둘을 한 자리에 묶었다. 한 사람이 맹주, 한 사람이 그 곁. 양강과 음유의 균형이 정파의 황금기를 연다.`,
    );
  } else if (key === 'challenge') {
    // C 격려 — 둘 다 같은 자리를 노린다. 경쟁심이 정을 가른다(관계 한 단계↓), 야망↑. 강호 결투의 씨앗.
    ds.setRelation(aId, bId, REL_DOWN[a.relationships[bId] ?? 'neutral']);
    ds.setRelation(bId, aId, REL_DOWN[b.relationships[aId] ?? 'neutral']);
    bumpPersona(aId, { ambition: 4 });
    bumpPersona(bId, { ambition: 4 });
    ds.update(aId, { stress: clamp((a.stress ?? 0) + 6) });
    ds.update(bId, { stress: clamp((b.stress ?? 0) + 6) });
    tally.bump(MIND_TALLY.ambitionDuel);
    playCutscene('ambition_duel', { id: a.id, name: `${a.name}·${b.name}` });
    pushReport(
      `${a.name}·${b.name} — 강호가 가른다`,
      `사부가 둘 다의 손을 들어주었다. "강호가 결정할 것이다." 두 사람은 정정당당히 제 길을 가나, 같은 꼭대기를 노리는 한 — 언젠가 검을 맞댈 날이 온다.`,
    );
  } else {
    // D 무관심 — 사부가 가르지 않는다. 정이 응어리로 곪는다(관계 두 단계↓), 신뢰↓·스트레스↑·야망/냉정↑(흑화 드라이버).
    ds.setRelation(aId, bId, relDownBy(a.relationships[bId] ?? 'neutral', 2));
    ds.setRelation(bId, aId, relDownBy(b.relationships[aId] ?? 'neutral', 2));
    ds.adjustTrust(aId, -10);
    ds.adjustTrust(bId, -10);
    ds.update(aId, { stress: clamp((a.stress ?? 0) + 12) });
    ds.update(bId, { stress: clamp((b.stress ?? 0) + 12) });
    // 인격 — 야망↑·자비↓·강직↓: 흑화/복수/천마 드라이버를 밀어, 기존 시스템이 비극을 자연히 전개.
    bumpPersona(aId, { ambition: 10, mercy: -8, integrity: -6 });
    bumpPersona(bId, { ambition: 10, mercy: -8, integrity: -6 });
    tally.bump(MIND_TALLY.ambitionTragedy);
    playCutscene('ambition_tragedy', { id: a.id, name: `${a.name}·${b.name}` });
    pushReport(
      `${a.name}·${b.name} — 갈라선 길`,
      `사부는 끝내 둘 사이를 가르지 않았다. 답을 듣지 못한 두 사람은 서로에게서 등을 돌렸다. 한때 의형제였던 자리에 — 긴 그림자가 드리운다.`,
    );
  }

  // 회차당 발화 마커 — 양쪽에 기록(중복 발화 차단).
  ds.update(aId, { ambitionRivalry: { withId: bId, outcome } });
  ds.update(bId, { ambitionRivalry: { withId: aId, outcome } });
}
