// 졸업 후 평생 직책 궤적 — docs/28 §4 · docs/08. 미시(개인) 시뮬.
// graduateToCareer: 하산 직업 선택 → 졸업 제자 레코드 생성(노선 + 시작 직책).
// tickCareers: 매년(timeSystem 연 경계) 호출 → 능력 완만 성장 + 강호 굴림(승급·좌절·은거·사망) → 강호 풍문 서신.

import {
  ROUTE_DANGER,
  ROUTE_LABEL,
  ROUTE_LADDER,
  careerStartFromJob,
  type RouteId,
} from '@/data/careers';
import { useGraduateStore, type GraduateRecord, type GraduateStatus } from '@/stores/graduateStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

// 졸업 스냅샷 역량 0~100 — 주력 무공 성×10. (추후 비무공 역량 가중 가능)
function powerOf(d: Disciple): number {
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  return clamp((main?.seong ?? 0) * 10);
}

function pushNews(title: string, body: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `jianghu-${day}-${Math.floor(Math.random() * 1e6)}`,
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
    let status: GraduateStatus = g.status;

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
        pushNews(`${g.name} — 좌절`, `${g.name}이 자리에서 밀려 ${title}에 머문다는 소식.`);
      } else {
        // 말단에서 더 밀리면 무공을 놓고 은거.
        status = 'retired';
        pushNews(`${g.name} — 은거`, `${g.name}이 무공을 놓고 강호를 떠났다고 한다.`);
      }
    } else if (Math.random() < 0.1) {
      status = 'injured';
      pushNews(`${g.name} — 부상`, `${g.name}이 강호에서 크게 다쳐 한동안 몸을 추스른다 한다.`);
    }

    gs.update(g.id, { level, power, fame, status, title });
  }
}
