// 졸업 후 평생 직책 궤적 — docs/28 §4 · docs/08. 미시(개인) 시뮬.
// graduateToCareer: 하산 직업 선택 → 졸업 제자 레코드 생성(노선 + 시작 직책).
// tickCareers: 매년(timeSystem 연 경계) 호출 → 능력 완만 성장 + 강호 굴림(승급·좌절·은거·사망) → 강호 풍문 서신.

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import {
  ROUTE_BLOC,
  ROUTE_DANGER,
  ROUTE_FACTION,
  ROUTE_LABEL,
  ROUTE_LADDER,
  careerStartFromJob,
  type RouteId,
} from '@/data/careers';
import { useJianghuStore } from '@/stores/jianghuStore';
import { blocPressure } from './worldSystem';
import { BLOC_LABEL } from '@/data/worldPowers';
import { findFaction } from '@/data/factions';
import { useSectStore } from '@/stores/sectStore';
import { adjustDiscipleRep, adjustSectRep } from './reputationSystem';
import { combatRating } from './combatPower';
import { useGraduateStore, type GraduateRecord, type GraduateStatus } from '@/stores/graduateStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import { pushJianghuNews } from './jianghuNews';
import { tickGraduateEvents } from './graduateEvents';
import type { Disciple } from '@/types';
import type { StatId } from '@/types/training';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const randInt = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));
const statLv = (d: Disciple, id: StatId): number => d.stats?.[id]?.level ?? 0;

// 졸업 스냅샷 "역량" 0~100 — 그 노선에서 직책이 오르는 능력 축. docs/28 §4.
// 무공 계열 = 전투력(combatRating: 주력 성×10 앵커 + 무공 깊이·경지, docs/27 §5).
// 비전투 계열은 해당 적성으로 — 의원=의술·영약, 정탐=정탐술. "강해야 정점"이 아니라
// "그 직업을 잘해야 정점"이 되도록(직업 종류에 맞는 정점 기준).
function routeCompetence(route: RouteId, d: Disciple): number {
  switch (route) {
    case 'healer': // 의원 — 의술·영약이 신의(神醫)를 가른다. 전투력 아님.
      return clamp(statLv(d, 'medicine') + statLv(d, 'alchemy') * 0.5);
    case 'shadow': // 정탐 — 정탐술 위주 + 약간의 무위.
      return clamp(statLv(d, 'scouting') * 0.7 + combatRating(d) * 0.3);
    default: // 무공 계열(정파·의적·호위·떠돌이·살수·도가·야인) — 전투력.
      return clamp(combatRating(d));
  }
}

// 강호 풍문 서신 — 공용 헬퍼(jianghuNews) 재사용. graduateEvents 와 같은 경로.
const pushNews = pushJianghuNews;

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
    power: routeCompetence(route, d), // 노선 적합 역량(무공계열=전투력 / 의원=의술·약 / 정탐=정탐)
    fame: d.fame ?? 0,
    status: 'active',
    graduatedYear: year,
  });
  pushNews(`${d.name} — 강호로`, `${josa(d.name, '이', '가')} ${ROUTE_LABEL[route]} ${title}(으)로 강호에 첫발을 디뎠다.`);

  // 노선 → 연관 문파 평판↑. 제자가 그 길에 드니 사문·본인과 그 문파의 인연이 깊어진다. docs/30.
  const factionId = ROUTE_FACTION[route];
  if (factionId) {
    adjustSectRep(factionId, 12);
    adjustDiscipleRep(d.id, factionId, 25);
    const fname = findFaction(factionId)?.name ?? '';
    if (fname) pushNews(`${d.name} — ${fname}`, `${josa(d.name, '이', '가')} ${ROUTE_LABEL[route]}의 길에 드니, ${josa(fname, '과', '와')} 사문의 인연이 깊어졌다.`);
  }
}

// 직업 전환 — 졸업 의지 갈등에서 '존중'(제자 뜻) 선택 시. 이미 확정된 레코드를 새 직업으로 갱신.
// 보상(평판·첫 소식)은 재적용하지 않는다(graduateToCareer 가 확정 시 1회만 — 중복 방지).
export function switchGraduateCareer(d: Disciple, newJobId: string): void {
  const { route, level, title } = careerStartFromJob(newJobId);
  useDiscipleStore.getState().update(d.id, { graduatedJob: newJobId });
  useGraduateStore.getState().update(d.id, {
    route,
    level,
    title,
    power: routeCompetence(route, d),
  });
  pushNews(`${d.name} — 제 뜻대로`, `${josa(d.name, '이', '가')} 끝내 제 뜻을 좇아 ${ROUTE_LABEL[route]} ${title}의 길로 들어섰다.`);
}

function deathLine(g: GraduateRecord, status: GraduateStatus): string {
  if (status === 'missing') return `${g.name}의 종적이 끊겼다. 강호 어디에서도 소식이 없다.`;
  return `${josa(g.name, '이', '가')} 강호에서 변을 당했다는 비보가 전해졌다. ${ROUTE_LABEL[g.route]}의 길이었다.`;
}

// 매년 1회. 각 졸업 제자의 한 해를 굴린다.
export function tickCareers(): void {
  const gs = useGraduateStore.getState();
  const world = useJianghuStore.getState().world; // 강호 정세 — 제자 세력의 전쟁·융성이 운명을 가른다. docs/08.
  for (const g of gs.records) {
    if (g.status === 'dead' || g.status === 'missing' || g.status === 'retired') continue;

    // 정세 압력 — 제자 노선이 속한 세력의 기조·세력으로 위험·출세 보정.
    const bloc = ROUTE_BLOC[g.route];
    const pressure = blocPressure(world, bloc);
    const blocAtWar = pressure.danger >= 0.06;

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

    // 1) 사망·실종 굴림 — 노선 위험도 + 정세 압력(자기 세력이 전쟁·충돌이면 휘말려 죽을 위험↑). docs/08.
    if (random() < ROUTE_DANGER[g.route] + pressure.danger) {
      const lethal: RouteId[] = ['assassin', 'vigilante'];
      const baseDead = lethal.includes(g.route) ? 0.6 : 0.4;
      const dead = random() < baseDead + (blocAtWar ? 0.2 : 0); // 전란 중엔 더 치명적
      status = dead ? 'dead' : 'missing';
      gs.update(g.id, { power, fame, status });
      const line = blocAtWar
        ? `${josa(g.name, '이', '가')} ${BLOC_LABEL[bloc]}의 전란에 몸을 던졌다가 끝내 돌아오지 못했다. ${ROUTE_LABEL[g.route]}의 길이었다.`
        : deathLine({ ...g, power, fame }, status);
      pushNews(`${g.name} — 비보`, line);
      continue;
    }

    // 2) 직책 굴림 — 역량·명성이 높을수록 오름 + 정세 압력(세력 융성→출세↑·쇠퇴→좌절↑). docs/08.
    const perf = (power / 100) * 0.5 + (fame / 100) * 0.5; // 0~1
    const up = Math.max(0.05, Math.min(0.85, 0.15 + perf * 0.45 + pressure.fortune));
    const down = Math.max(0, 0.12 * (1 - perf) - pressure.fortune);
    const r = random();

    if (r < up) {
      if (level < top) {
        level += 1;
        title = ladder[level];
        fame = clamp(fame + 6);
        pushNews(`${g.name} — 승급`, `${josa(g.name, '이', '가')} ${ROUTE_LABEL[g.route]} ${title}에 올랐다는 소식.`);
      } else {
        // 정점 — 자리를 지키며 이름을 더 떨친다.
        fame = clamp(fame + 4);
        if (random() < 0.4) {
          pushNews(`${g.name} — 명성`, `${g.name}, ${josa(title, '으로서', '로서')} 그 이름이 강호에 더 높이 오른다.`);
        }
      }
    } else if (r > 1 - down) {
      if (level > 0) {
        level -= 1;
        title = ladder[level];
        fame = clamp(fame - 4);
        setback = true;
        pushNews(`${g.name} — 좌절`, `${josa(g.name, '이', '가')} 자리에서 밀려 ${title}에 머문다는 소식.`);
      } else {
        // 말단에서 더 밀리면 무공을 놓고 은거.
        status = 'retired';
        pushNews(`${g.name} — 은거`, `${josa(g.name, '이', '가')} 무공을 놓고 강호를 떠났다고 한다.`);
      }
    } else if (random() < 0.1) {
      status = 'injured';
      setback = true;
      pushNews(`${g.name} — 부상`, `${josa(g.name, '이', '가')} 강호에서 크게 다쳐 한동안 몸을 추스른다 한다.`);
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
    if (status === 'active' && level >= 2 && random() < 0.1 + level * 0.06) {
      const gift = 100 + level * 120 + Math.round(fame * 1.5);
      useSectStore.getState().adjustResources(gift);
      pushNews(
        `${g.name} — 후원`,
        `${ROUTE_LABEL[route]} ${title} ${josa(g.name, '이', '가')} 사문을 잊지 않고 사례를 보내왔다. 금자 ${gift}냥이 금고에 들었다.`,
      );
    }

    gs.update(g.id, { level, power, fame, status, title, route });
  }

  // 졸업 동문 간 강호 사건 — 옛 관계(친밀·적대)가 펼쳐진다. 레지스트리 plug-in. docs/08.
  tickGraduateEvents();
}

// 노선 정렬 — 환멸(정→사)·개심(사→정) 전환의 양극. docs/28 §4 "배신·흑화·환멸 → 노선 전환".
// (졸업 동문 간 강호 사건은 graduateEvents 레지스트리로 분리 — 충돌·노선갈등·의기투합·의거·소원·해후·복수.)
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
  if (LIGHT_ROUTES.has(g.route) && setback && random() < 0.08) {
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
          ? `${josa(g.name, '이', '가')} 강호의 정의에 환멸을 느껴 스스로 칼을 들었다 한다. ${ROUTE_LABEL[route]}의 길로 들어섰다.`
          : `${josa(g.name, '이', '가')} 끝내 빛을 등졌다는 흉흉한 소문. ${ROUTE_LABEL[route]}의 그림자에 몸을 담갔다 한다.`,
      ],
    };
  }
  // 개심 — 어둠 계열 + 자리 잡힘 + 더 낮은 확률.
  if (DARK_ROUTES.has(g.route) && level >= 2 && fame >= 50 && random() < 0.05) {
    const route: RouteId = 'righteous';
    const ladder = ROUTE_LADDER[route];
    const lv = Math.min(ladder.length - 1, Math.max(0, level - 1));
    return {
      route,
      level: lv,
      title: ladder[lv],
      news: [
        `${g.name} — 개심`,
        `${josa(g.name, '이', '가')} 지난 길을 뉘우치고 손을 씻었다는 놀라운 소식. ${ROUTE_LABEL[route]}의 길에서 새로 시작한다 한다.`,
      ],
    };
  }
  return null;
}
