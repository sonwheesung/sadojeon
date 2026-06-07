// 졸업 후 평생 직책 궤적 — docs/28 §4 · docs/08. 미시(개인) 시뮬.
// graduateToCareer: 하산 직업 선택 → 졸업 제자 레코드 생성(노선 + 시작 직책).
// tickCareers: 매년(timeSystem 연 경계) 호출 → 능력 완만 성장 + 강호 굴림(승급·좌절·은거·사망) → 강호 풍문 서신.

import {
  ROUTE_DANGER,
  ROUTE_FACTION,
  ROUTE_LABEL,
  ROUTE_LADDER,
  careerStartFromJob,
  type RouteId,
} from '@/data/careers';
import { findFaction } from '@/data/factions';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useSectStore } from '@/stores/sectStore';
import { adjustDiscipleRep, adjustSectRep } from './reputationSystem';
import { combatRating } from './combatPower';
import { useGraduateStore, type GraduateRecord, type GraduateStatus } from '@/stores/graduateStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

// 졸업 스냅샷 역량 0~100 — 전투력 무위(combatRating: 주력 성×10 앵커 + 익힌 무공 깊이·경지). docs/27 §5.
function powerOf(d: Disciple): number {
  return clamp(combatRating(d));
}

function pushNews(title: string, body: string, priority: 'normal' | 'high' = 'normal'): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `jianghu-${day}-${Math.floor(Math.random() * 1e6)}`,
    kind: 'rumor',
    title,
    preview: body,
    body,
    priority,
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// 하산 직업 선택 확정 → 졸업 제자 레코드 + 첫 소식. inboxResolve(graduation)에서 호출.
export function graduateToCareer(d: Disciple, jobId: string): void {
  const { route, level, title } = careerStartFromJob(jobId);
  const year = useTimeStore.getState().current.year;
  useGraduateStore.getState().add({
    id: d.id,
    name: d.name,
    route,
    level,
    title,
    power: powerOf(d),
    fame: d.fame ?? 0,
    status: 'active',
    graduatedYear: year,
  });
  pushNews(`${d.name} — 강호로`, `${d.name}이 ${ROUTE_LABEL[route]} ${title}(으)로 강호에 첫발을 디뎠다.`);

  // 노선 → 연관 문파 평판↑. 제자가 그 길에 드니 사문·본인과 그 문파의 인연이 깊어진다. docs/30.
  const factionId = ROUTE_FACTION[route];
  if (factionId) {
    adjustSectRep(factionId, 12);
    adjustDiscipleRep(d.id, factionId, 25);
    const fname = findFaction(factionId)?.name ?? '';
    if (fname) pushNews(`${d.name} — ${fname}`, `${d.name}이 ${ROUTE_LABEL[route]}의 길에 드니, ${fname}과 사문의 인연이 깊어졌다.`);
  }
}

function deathLine(g: GraduateRecord, status: GraduateStatus): string {
  if (status === 'missing') return `${g.name}의 종적이 끊겼다. 강호 어디에서도 소식이 없다.`;
  return `${g.name}이 강호에서 변을 당했다는 비보가 전해졌다. ${ROUTE_LABEL[g.route]}의 길이었다.`;
}

// 매년 1회. 각 졸업 제자의 한 해를 굴린다.
export function tickCareers(): void {
  const gs = useGraduateStore.getState();
  for (const g of gs.records) {
    if (g.status === 'dead' || g.status === 'missing' || g.status === 'retired') continue;

    const ladder = ROUTE_LADDER[g.route];
    const top = ladder.length - 1;
    let level = g.level;
    let power = g.power;
    let fame = g.fame;
    let title = g.title;
    let route = g.route;
    let status: GraduateStatus = g.status;
    let setback = false;

    // 부상은 한 해 지나면 회복.
    if (status === 'injured') status = 'active';
    // 능력 완만 성장(양육기보다 느림).
    power = clamp(power + randInt(0, 3));
    fame = clamp(fame + randInt(-1, 3));

    // 1) 사망·실종 굴림 — 노선 위험도.
    if (Math.random() < ROUTE_DANGER[g.route]) {
      const lethal: RouteId[] = ['assassin', 'vigilante'];
      const dead = lethal.includes(g.route) ? Math.random() < 0.6 : Math.random() < 0.4;
      status = dead ? 'dead' : 'missing';
      gs.update(g.id, { power, fame, status });
      pushNews(`${g.name} — 비보`, deathLine({ ...g, power, fame }, status));
      continue;
    }

    // 2) 직책 굴림 — 능력·명성이 높을수록 오름, 낮을수록 밀림.
    const perf = (power / 100) * 0.5 + (fame / 100) * 0.5; // 0~1
    const up = 0.15 + perf * 0.45; // 0.15~0.6
    const down = 0.12 * (1 - perf); // 0~0.12
    const r = Math.random();

    if (r < up) {
      if (level < top) {
        level += 1;
        title = ladder[level];
        fame = clamp(fame + 6);
        pushNews(`${g.name} — 승급`, `${g.name}이 ${ROUTE_LABEL[g.route]} ${title}에 올랐다는 소식.`);
      } else {
        // 정점 — 자리를 지키며 이름을 더 떨친다.
        fame = clamp(fame + 4);
        if (Math.random() < 0.4) {
          pushNews(`${g.name} — 명성`, `${g.name}, ${title}으로서 그 이름이 강호에 더 높이 오른다.`);
        }
      }
    } else if (r > 1 - down) {
      if (level > 0) {
        level -= 1;
        title = ladder[level];
        fame = clamp(fame - 4);
        setback = true;
        pushNews(`${g.name} — 좌절`, `${g.name}이 자리에서 밀려 ${title}에 머문다는 소식.`);
      } else {
        // 말단에서 더 밀리면 무공을 놓고 은거.
        status = 'retired';
        pushNews(`${g.name} — 은거`, `${g.name}이 무공을 놓고 강호를 떠났다고 한다.`);
      }
    } else if (Math.random() < 0.1) {
      status = 'injured';
      setback = true;
      pushNews(`${g.name} — 부상`, `${g.name}이 강호에서 크게 다쳐 한동안 몸을 추스른다 한다.`);
    }

    // 3) 노선 전환 — 환멸(정→사)·개심(사→정). 활동 중일 때만. docs/28 §4.
    if (status === 'active' || status === 'injured') {
      const shift = maybeRouteShift(g, level, fame, setback);
      if (shift) {
        route = shift.route;
        level = shift.level;
        title = shift.title;
        pushNews(shift.news[0], shift.news[1], 'high');
      }
    }

    // 후원 차등 — 성공한 졸업 제자가 사문에 보답(자금). 직책 높을수록 자주·많이. docs/08.
    if (status === 'active' && level >= 2 && Math.random() < 0.1 + level * 0.06) {
      const gift = 100 + level * 120 + Math.round(fame * 1.5);
      useSectStore.getState().adjustResources(gift);
      pushNews(
        `${g.name} — 후원`,
        `${ROUTE_LABEL[route]} ${title} ${g.name}이 사문을 잊지 않고 사례를 보내왔다. 금자 ${gift}냥이 금고에 들었다.`,
      );
    }

    gs.update(g.id, { level, power, fame, status, title, route });
  }

  // 졸업 동문 간 강호 사건 — 옛 관계(친밀·적대)가 펼쳐진다. docs/08.
  tickGraduateInteractions();
}

// 두 졸업 제자 사이 관계(양방향). 졸업해도 discipleStore 에 status='graduated'로 남아 관계 보존.
function relBetween(aId: string, bId: string): string | undefined {
  const ds = useDiscipleStore.getState();
  return ds.disciples[aId]?.relationships?.[bId] ?? ds.disciples[bId]?.relationships?.[aId];
}

const LETHAL_ROUTES = new Set<RouteId>(['assassin', 'vigilante']);

// 노선 정렬 — 환멸(정→사)·개심(사→정) 전환의 양극. docs/28 §4 "배신·흑화·환멸 → 노선 전환".
const LIGHT_ROUTES = new Set<RouteId>(['righteous', 'escort', 'healer', 'daoist']);
const DARK_ROUTES = new Set<RouteId>(['assassin', 'shadow']);

// 좌절을 겪은 정파 계열은 강호의 정의에 환멸을 느껴 어둠으로 기운다(드물게). 어둠 계열은
// 이름을 떨치면 손을 씻기도 한다. 반환 시 새 노선·레벨·직책·소식, 없으면 null.
function maybeRouteShift(
  g: GraduateRecord,
  level: number,
  fame: number,
  setback: boolean,
): { route: RouteId; level: number; title: string; news: [string, string] } | null {
  // 환멸 — 정 계열 + 올해 좌절 + 낮은 확률.
  if (LIGHT_ROUTES.has(g.route) && setback && Math.random() < 0.08) {
    const route: RouteId = fame >= 40 ? 'vigilante' : 'assassin';
    const ladder = ROUTE_LADDER[route];
    const lv = Math.min(ladder.length - 1, Math.max(0, level));
    return {
      route,
      level: lv,
      title: ladder[lv],
      news: [
        `${g.name} — 환멸`,
        route === 'vigilante'
          ? `${g.name}이 강호의 정의에 환멸을 느껴 스스로 칼을 들었다 한다. ${ROUTE_LABEL[route]}의 길로 들어섰다.`
          : `${g.name}이 끝내 빛을 등졌다는 흉흉한 소문. ${ROUTE_LABEL[route]}의 그림자에 몸을 담갔다 한다.`,
      ],
    };
  }
  // 개심 — 어둠 계열 + 자리 잡힘 + 더 낮은 확률.
  if (DARK_ROUTES.has(g.route) && level >= 2 && fame >= 50 && Math.random() < 0.05) {
    const route: RouteId = 'righteous';
    const ladder = ROUTE_LADDER[route];
    const lv = Math.min(ladder.length - 1, Math.max(0, level - 1));
    return {
      route,
      level: lv,
      title: ladder[lv],
      news: [
        `${g.name} — 개심`,
        `${g.name}이 지난 길을 뉘우치고 손을 씻었다는 놀라운 소식. ${ROUTE_LABEL[route]}의 길에서 새로 시작한다 한다.`,
      ],
    };
  }
  return null;
}

// 매년: 살아있는 졸업 제자 쌍의 관계가 강호에서 충돌·합류로 터진다. 연 최대 2건.
function tickGraduateInteractions(): void {
  const gs = useGraduateStore.getState();
  const live = gs.records.filter((g) => g.status === 'active' || g.status === 'injured');
  if (live.length < 2) return;
  let fired = 0;
  for (let i = 0; i < live.length && fired < 2; i += 1) {
    for (let j = i + 1; j < live.length && fired < 2; j += 1) {
      const a = live[i];
      const b = live[j];
      const rel = relBetween(a.id, b.id);
      if (rel === 'enemy') {
        if (Math.random() < 0.5) { resolveClash(a, b); fired += 1; }
      } else if (rel === 'friend' || rel === 'sworn') {
        if (Math.random() < 0.4) { resolveAlliance(a, b); fired += 1; }
      } else if (a.route === b.route && Math.random() < 0.15) {
        resolveEncounter(a, b); fired += 1;
      }
    }
  }
}

// 적대 → 강호에서 칼을 겨눈다. 능력·명성 높은 쪽이 이기고, 진 쪽은 부상(위험 노선이면 사망).
function resolveClash(a: GraduateRecord, b: GraduateRecord): void {
  const gs = useGraduateStore.getState();
  const sa = a.power + a.fame + randInt(0, 30);
  const sb = b.power + b.fame + randInt(0, 30);
  const winner = sa >= sb ? a : b;
  const loser = sa >= sb ? b : a;
  const fatal = LETHAL_ROUTES.has(loser.route) ? Math.random() < 0.45 : Math.random() < 0.2;
  gs.update(winner.id, { fame: clamp(winner.fame + 6) });
  gs.update(loser.id, fatal ? { status: 'dead' } : { status: 'injured', fame: clamp(loser.fame - 4) });
  pushNews(
    `${winner.name} ↔ ${loser.name} — 은원`,
    fatal
      ? `${winner.name}과 ${loser.name}이 강호에서 끝내 칼을 겨눴다. ${loser.name}은(는) 돌아오지 못했다.`
      : `${winner.name}과 ${loser.name}이 칼을 겨눴다. ${loser.name}이 상처를 입고 물러났다 한다.`,
  );
}

// 친밀 → 손을 잡는다. 둘 다 이름을 더 떨친다.
function resolveAlliance(a: GraduateRecord, b: GraduateRecord): void {
  const gs = useGraduateStore.getState();
  gs.update(a.id, { fame: clamp(a.fame + 5) });
  gs.update(b.id, { fame: clamp(b.fame + 5) });
  pushNews(
    `${a.name} · ${b.name} — 의기투합`,
    `옛 동문 ${a.name}과 ${b.name}이 강호에서 손을 잡았다는 흐뭇한 소식. 둘의 이름이 함께 오른다.`,
  );
}

// 같은 노선 우연한 마주침 — 가벼운 자극.
function resolveEncounter(a: GraduateRecord, b: GraduateRecord): void {
  const gs = useGraduateStore.getState();
  gs.update(a.id, { fame: clamp(a.fame + 2) });
  gs.update(b.id, { fame: clamp(b.fame + 2) });
  pushNews(
    `${a.name} · ${b.name} — 해후`,
    `같은 ${ROUTE_LABEL[a.route]}의 길을 걷는 ${a.name}과 ${b.name}이 강호에서 마주쳐 한 수 겨뤘다 한다.`,
  );
}
