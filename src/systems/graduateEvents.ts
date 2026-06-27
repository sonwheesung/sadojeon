// 졸업 동문 간 강호 사건 엔진 — docs/08. careerSystem.tickCareers(연 경계)가 호출.
// 사건 = {발동 조건·가중치·해소} 모듈(레지스트리) — 새 사건은 PAIR_EVENTS 한 칸 추가로 plug-in(SOLID).
// 자율·풍문 전용(사부 개입 X — 서신·호출은 후속). 관계는 졸업 시점 고정이 아니라 사건으로 변한다.
//
// 사건 종류: 충돌(은원)·노선 갈등(이념)·의기투합·합심 의거·해후·소원 + 복수(연쇄, 동문이 죽으면 그를 아끼던
// 동문이 가해자를 쫓는다). 관계 사다리(enemy↔distant↔neutral↔friend↔sworn)를 따라 깊어지거나 식는다.

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import { ROUTE_BLOC, ROUTE_LABEL, type RouteId } from '@/data/careers';
import { REL_DOWN, REL_UP } from '@/data/relationTransitions';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGraduateStore, type GraduateRecord } from '@/stores/graduateStore';
import { useSectStore } from '@/stores/sectStore';
import type { RelationLevel } from '@/types';
import { pushJianghuNews } from './jianghuNews';
import { reactToSiblingMilestone } from './siblingReactionSystem';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const randInt = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));

// ─── 관계 사다리·조회 ──────────────────────────────────────────────────────
// 사다리는 단일 진실(src/data/relationTransitions)을 쓴다 — 드리프트 방지(docs/37 C9).
const relUp = (r: RelationLevel): RelationLevel => REL_UP[r];
const relDown = (r: RelationLevel): RelationLevel => REL_DOWN[r];

// 졸업해도 discipleStore 에 status='graduated'로 남아 관계 보존. 양방 조회·설정.
function relOf(aId: string, bId: string): RelationLevel {
  const ds = useDiscipleStore.getState();
  return (ds.disciples[aId]?.relationships?.[bId] ??
    ds.disciples[bId]?.relationships?.[aId] ??
    'neutral') as RelationLevel;
}
function setRel(aId: string, bId: string, level: RelationLevel): void {
  const ds = useDiscipleStore.getState();
  ds.setRelation(aId, bId, level);
  ds.setRelation(bId, aId, level);
}

// ─── 노선 분류 ─────────────────────────────────────────────────────────────
const LIGHT_ROUTES = new Set<RouteId>(['righteous', 'vigilante', 'escort', 'healer', 'daoist']);
const LETHAL_ROUTES = new Set<RouteId>(['assassin', 'vigilante', 'demonic']);
const isOrthodox = (r: RouteId) => ROUTE_BLOC[r] === 'orthodox';
const isDark = (r: RouteId) => ROUTE_BLOC[r] === 'unorthodox' || ROUTE_BLOC[r] === 'demonic';

// ─── 결투 판정(공용) ───────────────────────────────────────────────────────
function duel(a: GraduateRecord, b: GraduateRecord): { winner: GraduateRecord; loser: GraduateRecord } {
  const sa = a.power + a.fame + randInt(0, 30);
  const sb = b.power + b.fame + randInt(0, 30);
  return sa >= sb ? { winner: a, loser: b } : { winner: b, loser: a };
}

// ─── 사건 레지스트리 ───────────────────────────────────────────────────────
interface GradEvent {
  kind: string;
  applies: (a: GraduateRecord, b: GraduateRecord, rel: RelationLevel) => boolean;
  weight: (a: GraduateRecord, b: GraduateRecord, rel: RelationLevel) => number;
  resolve: (a: GraduateRecord, b: GraduateRecord, rel: RelationLevel) => void;
}

const gs = () => useGraduateStore.getState();

// 충돌(은원) — 적대 쌍이 강호에서 칼을 겨눈다. 진 쪽 부상(위험 노선이면 사망 → slainBy 기록).
const clash: GradEvent = {
  kind: 'clash',
  applies: (_a, _b, rel) => rel === 'enemy',
  weight: () => 6,
  resolve: (a, b) => {
    const { winner, loser } = duel(a, b);
    const fatal = LETHAL_ROUTES.has(loser.route) ? random() < 0.45 : random() < 0.2;
    gs().update(winner.id, { fame: clamp(winner.fame + 6) });
    gs().update(loser.id, fatal ? { status: 'dead', slainBy: winner.id } : { status: 'injured', fame: clamp(loser.fame - 4) });
    if (fatal) reactToSiblingMilestone(loser.id, 'jianghu_death'); // 남은 제자 먼 애도. docs/12
    pushJianghuNews(
      `${winner.name} ↔ ${loser.name} — 은원`,
      fatal
        ? `${josa(winner.name, '과', '와')} ${josa(loser.name, '이', '가')} 강호에서 끝내 칼을 겨눴다. ${josa(loser.name, '은', '는')} 돌아오지 못했다.`
        : `${josa(winner.name, '과', '와')} ${josa(loser.name, '이', '가')} 칼을 겨눴다. ${josa(loser.name, '이', '가')} 상처를 입고 물러났다 한다.`,
    );
  },
};

// 노선 갈등(이념) — 정파 ↔ 사파·마도가 옛 적대 없이도 부딪친다. 관계가 적대로 기운다(은원의 씨앗).
const blocConflict: GradEvent = {
  kind: 'bloc-conflict',
  applies: (a, b, rel) =>
    rel !== 'enemy' && rel !== 'friend' && rel !== 'sworn' &&
    ((isOrthodox(a.route) && isDark(b.route)) || (isDark(a.route) && isOrthodox(b.route))),
  weight: () => 3,
  resolve: (a, b, rel) => {
    const { winner, loser } = duel(a, b);
    const fatal = LETHAL_ROUTES.has(loser.route) ? random() < 0.3 : random() < 0.12;
    gs().update(winner.id, { fame: clamp(winner.fame + 5) });
    gs().update(loser.id, fatal ? { status: 'dead', slainBy: winner.id } : { status: 'injured', fame: clamp(loser.fame - 3) });
    if (fatal) reactToSiblingMilestone(loser.id, 'jianghu_death'); // 남은 제자 먼 애도. docs/12
    setRel(a.id, b.id, fatal ? 'enemy' : relDown(rel)); // 부딪칠수록 척진다
    pushJianghuNews(
      `${a.name} ↔ ${b.name} — 정사(正邪)의 충돌`,
      fatal
        ? `${ROUTE_LABEL[a.route]} ${josa(a.name, '과', '와')} ${ROUTE_LABEL[b.route]} ${josa(b.name, '이', '가')} 길에서 부딪쳐 피를 봤다. ${josa(loser.name, '이', '가')} 쓰러졌다.`
        : `${ROUTE_LABEL[a.route]} ${josa(a.name, '과', '와')} ${ROUTE_LABEL[b.route]} ${josa(b.name, '이', '가')} 길에서 검을 맞댔다. 옛 정이 없던 둘 사이에 은원이 싹텄다.`,
    );
  },
};

// 합심 의거 — 친한 정도(正道) 동문이 함께 의를 행한다. 둘 명성↑ + 사문 명성↑.
const jointDeed: GradEvent = {
  kind: 'joint-deed',
  applies: (a, b, rel) =>
    (rel === 'friend' || rel === 'sworn') && LIGHT_ROUTES.has(a.route) && LIGHT_ROUTES.has(b.route),
  weight: () => 4,
  resolve: (a, b, rel) => {
    gs().update(a.id, { fame: clamp(a.fame + 7) });
    gs().update(b.id, { fame: clamp(b.fame + 7) });
    reactToSiblingMilestone(a.id, 'jianghu_glory'); // 남은 제자 동경(가까운 동문). docs/12
    reactToSiblingMilestone(b.id, 'jianghu_glory');
    useSectStore.getState().adjustReputation(3); // 제자들이 의를 떨치니 사문 이름도 오른다
    setRel(a.id, b.id, relUp(rel)); // 함께 의를 행하며 정이 깊어진다(friend→sworn)
    pushJianghuNews(
      `${a.name} · ${b.name} — 의거(義擧)`,
      `옛 동문 ${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 힘을 합쳐 강호의 의를 행했다는 소문. 둘의 이름과 함께 사문의 이름도 높이 오른다.`,
    );
  },
};

// 의기투합 — 친한 동문이 손을 잡는다(정도 한정 아님). 관계가 더 깊어진다.
const alliance: GradEvent = {
  kind: 'alliance',
  applies: (_a, _b, rel) => rel === 'friend' || rel === 'sworn',
  weight: () => 3,
  resolve: (a, b, rel) => {
    gs().update(a.id, { fame: clamp(a.fame + 5) });
    gs().update(b.id, { fame: clamp(b.fame + 5) });
    setRel(a.id, b.id, relUp(rel));
    pushJianghuNews(
      `${a.name} · ${b.name} — 의기투합`,
      `옛 동문 ${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 강호에서 손을 잡았다는 흐뭇한 소식. 둘의 이름이 함께 오른다.`,
    );
  },
};

// 소원(疏遠) — 친했던 동문이 다른 길(노선)을 걸으며 멀어진다. 관계가 식는다(의형제는 제외).
const estrangement: GradEvent = {
  kind: 'estrangement',
  applies: (a, b, rel) => rel === 'friend' && ROUTE_BLOC[a.route] !== ROUTE_BLOC[b.route],
  weight: () => 2,
  resolve: (a, b, rel) => {
    setRel(a.id, b.id, relDown(rel)); // friend → neutral
    pushJianghuNews(
      `${a.name} · ${b.name} — 소원`,
      `${ROUTE_LABEL[a.route]}의 길을 가는 ${josa(a.name, '과', '와')} ${ROUTE_LABEL[b.route]}의 ${b.name}. 걷는 길이 갈리니 옛 정도 차츰 식어간다 한다.`,
    );
  },
};

// 해후 — 같은 노선의 동문이 우연히 마주쳐 한 수 겨룬다. 가벼운 자극.
const encounter: GradEvent = {
  kind: 'encounter',
  applies: (a, b, rel) => rel !== 'enemy' && a.route === b.route,
  weight: () => 2,
  resolve: (a, b) => {
    gs().update(a.id, { fame: clamp(a.fame + 2) });
    gs().update(b.id, { fame: clamp(b.fame + 2) });
    pushJianghuNews(
      `${a.name} · ${b.name} — 해후`,
      `같은 ${ROUTE_LABEL[a.route]}의 길을 걷는 ${josa(a.name, '과', '와')} ${josa(b.name, '이', '가')} 강호에서 마주쳐 한 수 겨뤘다 한다.`,
    );
  },
};

const PAIR_EVENTS: readonly GradEvent[] = [clash, blocConflict, jointDeed, alliance, estrangement, encounter];

// ─── 복수(연쇄) — 동문이 죽으면, 그를 아끼던 동문이 가해자를 쫓는다 ──────────────
// 연 최대 1건(무겁게). 성공하면 가해자가 쓰러지고, 실패하면 복수자가 도리어 당한다(연쇄 가능).
function vendettaPass(): number {
  const records = gs().records;
  const live = records.filter((g) => g.status === 'active' || g.status === 'injured');
  for (const dead of records) {
    if (dead.status !== 'dead' || !dead.slainBy) continue;
    const killer = records.find((r) => r.id === dead.slainBy);
    if (!killer || (killer.status !== 'active' && killer.status !== 'injured')) {
      gs().update(dead.id, { slainBy: undefined }); // 가해자도 이미 강호를 떠남 — 씨앗 소멸
      continue;
    }
    const avengers = live.filter(
      (g) => g.id !== killer.id && g.id !== dead.id &&
        (relOf(g.id, dead.id) === 'friend' || relOf(g.id, dead.id) === 'sworn'),
    );
    if (avengers.length === 0) continue;
    const avenger = avengers[randInt(0, avengers.length - 1)];
    resolveVendetta(avenger, killer, dead);
    gs().update(dead.id, { slainBy: undefined }); // 복수 시도됨 — 씨앗 소비(반복 방지)
    return 1;
  }
  return 0;
}

function resolveVendetta(avenger: GraduateRecord, killer: GraduateRecord, dead: GraduateRecord): void {
  const { winner } = duel(avenger, killer);
  setRel(avenger.id, killer.id, 'enemy');
  if (winner.id === avenger.id) {
    const fatal = random() < 0.5;
    gs().update(avenger.id, { fame: clamp(avenger.fame + 8) });
    gs().update(killer.id, fatal ? { status: 'dead', slainBy: avenger.id } : { status: 'injured', fame: clamp(killer.fame - 6) });
    pushJianghuNews(
      `${avenger.name} — 복수`,
      fatal
        ? `${josa(avenger.name, '이', '가')} 옛 동문 ${dead.name}의 원수 ${josa(killer.name, '을', '를')} 끝내 베었다. 강호가 그 의리에 술렁인다.`
        : `${josa(avenger.name, '이', '가')} ${dead.name}의 원수 ${josa(killer.name, '을', '를')} 찾아 칼을 겨눴다. ${josa(killer.name, '이', '가')} 깊은 상처를 입고 달아났다 한다.`,
      'high',
    );
  } else {
    const fatal = LETHAL_ROUTES.has(killer.route) ? random() < 0.5 : random() < 0.25;
    gs().update(killer.id, { fame: clamp(killer.fame + 5) });
    gs().update(avenger.id, fatal ? { status: 'dead', slainBy: killer.id } : { status: 'injured' });
    pushJianghuNews(
      `${avenger.name} — 비운의 복수`,
      fatal
        ? `${josa(avenger.name, '이', '가')} 옛 동문 ${dead.name}의 복수를 노렸으나, 도리어 ${killer.name}의 칼에 스러졌다. 은원이 또 다른 피를 불렀다.`
        : `${josa(avenger.name, '이', '가')} ${dead.name}의 원수 ${killer.name}에게 덤볐으나 끝내 꺾이지 못하고 상처만 안고 물러났다.`,
      'high',
    );
  }
}

// ─── 연 1회: 살아있는 졸업 제자 사이 사건을 굴린다 ──────────────────────────
const pairKey = (a: GraduateRecord, b: GraduateRecord) => [a.id, b.id].sort().join('|');

export function tickGraduateEvents(): void {
  const firedVendetta = vendettaPass(); // 복수 먼저(레코드 변동) — 이후 살아있는 명단으로 쌍 사건.
  const live = gs().records.filter((g) => g.status === 'active' || g.status === 'injured');
  // 연 사건 예산 — 인원이 많을수록 강호가 시끄럽다(2~3건). 복수가 터졌으면 그만큼 차감.
  let budget = Math.min(3, Math.max(2, Math.floor(live.length / 2))) - firedVendetta;
  if (live.length < 2 || budget <= 0) return;

  interface Cand { ev: GradEvent; a: GraduateRecord; b: GraduateRecord; rel: RelationLevel; w: number }
  const cands: Cand[] = [];
  for (let i = 0; i < live.length; i += 1) {
    for (let j = i + 1; j < live.length; j += 1) {
      const a = live[i];
      const b = live[j];
      const rel = relOf(a.id, b.id);
      for (const ev of PAIR_EVENTS) {
        if (!ev.applies(a, b, rel)) continue;
        const w = ev.weight(a, b, rel);
        // applies=true 라도 weight<=0 후보는 배제 — 가중 추첨에서 영영 안 뽑히면서 후보풀에 죽은 채
        // 남아 budget 만 소진시키는 plug-in 계약 구멍 차단(docs/37 R19).
        if (w > 0) cands.push({ ev, a, b, rel, w });
      }
    }
  }

  const usedPairs = new Set<string>();
  while (budget > 0) {
    const pool = cands.filter((c) => !usedPairs.has(pairKey(c.a, c.b)));
    if (pool.length === 0) break;
    const total = pool.reduce((s, c) => s + c.w, 0);
    let r = random() * total;
    let pick = pool[0];
    for (const c of pool) {
      r -= c.w;
      if (r <= 0) {
        pick = c;
        break;
      }
    }
    pick.ev.resolve(pick.a, pick.b, pick.rel);
    usedPairs.add(pairKey(pick.a, pick.b)); // 한 쌍은 한 해 한 사건만
    budget -= 1;
  }
}
