// 강호 사건 종류 레지스트리 — docs/08. 끼워넣기(plug-in): 한 종류 = {발생조건·국면·효과·문구}.
// 엔진(worldSystem)은 이 배열만 돌린다 — 사건 추가는 여기 한 항목 추가로 끝(SOLID).
// 정통 보호: 정파/관 세력치는 worldState.addPower 의 floor 로 보장(멸문 불가). 큰 패배도 좌절일 뿐.

import { BLOC_LABEL } from '@/data/worldPowers';
import { addPower, addTension, getTension, powerEdge } from '@/systems/worldState';
import { josa } from '@/utils/korean';
import type { WorldBloc, WorldEvent, WorldState } from '@/types/world';

// rng: () => [0,1). 결정적 시뮬을 위해 주입.
type Rng = () => number;
const L = (b: WorldBloc) => BLOC_LABEL[b];

export interface WorldEventKind {
  id: string;
  label: string;
  phasesTotal: number;
  weight: number; //            발생 경쟁 시 가중(드문 사건은 낮게)
  narrateEachPhase?: boolean; // 다국면 중간 국면도 풍문으로 알릴지(전쟁)
  questSeed?: boolean; //       결말 시 관련 의뢰 시드 대상(큰 사건)
  // 발생 시도 — 상태 보고 발생 가능하면 연루 진영, 아니면 null.
  ignite(s: WorldState, rng: Rng): WorldBloc[] | null;
  // 현재 ev.phase(1~phasesTotal) 진입 효과 — 세력치·긴장 변형.
  effect(s: WorldState, ev: WorldEvent, rng: Rng): void;
  // 화면 문구(현 국면).
  text(ev: WorldEvent, phase: number): { headline: string; sub: string };
  // 결말 시 강호 주도권 변화 — 평판·의뢰 연동 힌트.
  repSwing?(ev: WorldEvent): { up?: WorldBloc; down?: WorldBloc };
}

// ── 공통 작은 유틸 ──────────────────────────────────────────────────────────
const noise = (rng: Rng, mag: number) => (rng() - 0.5) * 2 * mag;
// 진행 중(미결말) 특정 종류 사건이 있나.
const hasActive = (s: WorldState, kind: string) => s.events.some((e) => !e.done && e.kind === kind);
// 진행 중 전쟁이 두 진영 사이인가.
const hasActiveWar = (s: WorldState, a: WorldBloc, b: WorldBloc) =>
  s.events.some((e) => !e.done && e.kind === 'war' && e.blocs.includes(a) && e.blocs.includes(b));

// ── 사건 종류들 ─────────────────────────────────────────────────────────────

// 1. 사파 봉기 — 사파가 술렁이고 세력이 너무 크지 않을 때. 정사 긴장↑·사파 세력↑.
const uprising: WorldEventKind = {
  id: 'uprising',
  label: '사파 봉기',
  phasesTotal: 2,
  weight: 1.2,
  questSeed: true,
  ignite(s, rng) {
    const t = getTension(s, 'orthodox', 'unorthodox');
    if (t < 28 || s.powers.unorthodox.power > 66) return null; // 세 키웠으면 봉기 자제(자기억제)
    return rng() < 0.2 + t / 400 ? ['unorthodox', 'orthodox'] : null;
  },
  effect(s, ev) {
    if (ev.phase === 1) {
      addPower(s, 'unorthodox', 6);
      addTension(s, 'orthodox', 'unorthodox', 12);
    } else {
      addPower(s, 'unorthodox', 4);
      addTension(s, 'orthodox', 'unorthodox', 8);
    }
  },
  text(_ev, phase) {
    return phase === 1
      ? { headline: '강남 사파 연합 봉기', sub: '녹림·하오문이 기치를 들었다' }
      : { headline: '사파 봉기 확산', sub: '인근 흑도가 잇따라 합류한다' };
  },
  repSwing: () => ({ up: 'unorthodox', down: 'orthodox' }),
};

// 2. 정파 토벌 — 정사 긴장 높고 정파가 우세할 때. 사파 세력↓·긴장 해소.
const subjugation: WorldEventKind = {
  id: 'subjugation',
  label: '정파 토벌',
  phasesTotal: 2,
  weight: 1,
  questSeed: true,
  ignite(s, rng) {
    const t = getTension(s, 'orthodox', 'unorthodox');
    if (t < 50) return null;
    if (powerEdge(s, 'orthodox', 'unorthodox') < 0.55) return null;
    return rng() < 0.3 ? ['orthodox', 'unorthodox'] : null;
  },
  effect(s, ev) {
    if (ev.phase === 1) {
      addTension(s, 'orthodox', 'unorthodox', 6);
    } else {
      addPower(s, 'unorthodox', -9);
      addPower(s, 'orthodox', 2);
      addTension(s, 'orthodox', 'unorthodox', -28); // 토벌 후 한동안 잠잠
    }
  },
  text(_ev, phase) {
    return phase === 1
      ? { headline: '무림맹 토벌대 출정', sub: '사파 거점으로 정파 연합이 향한다' }
      : { headline: '사파 거점 토벌', sub: '흑도가 뿔뿔이 흩어졌다' };
  },
  repSwing: () => ({ up: 'orthodox', down: 'unorthodox' }),
};

// 3. 마교 준동 — 마교가 술렁이고 세력이 아직 크지 않을 때. 정마 긴장 급등·마교 세력↑.
const demonicStir: WorldEventKind = {
  id: 'demonic-stir',
  label: '마교 준동',
  phasesTotal: 2,
  weight: 0.9,
  ignite(s, rng) {
    if (s.powers.demonic.power > 58) return null; // 이미 세를 키웠으면 더 준동하지 않음(자기억제)
    // 마교가 사파와 패권 다툼/대전 중이면 정파를 건드리지 않는다(한 번에 한 적). → 그동안 정마 식어 정파 평온.
    if (hasActive(s, 'sapa-magyo-feud') || hasActiveWar(s, 'demonic', 'unorthodox')) return null;
    const t = getTension(s, 'orthodox', 'demonic');
    return rng() < 0.06 + t / 700 ? ['demonic', 'orthodox'] : null;
  },
  effect(s, ev) {
    // 기본 정마 긴장이 낮으니, 준동이 정마 갈등을 끌어올리는 주역 — 충분히 밀어 전쟁까지 갈 수 있게.
    if (ev.phase === 1) {
      addPower(s, 'demonic', 5);
      addTension(s, 'orthodox', 'demonic', 15);
      addTension(s, 'unorthodox', 'demonic', 5);
    } else {
      addPower(s, 'demonic', 3);
      addTension(s, 'orthodox', 'demonic', 11);
    }
  },
  text(_ev, phase) {
    return phase === 1
      ? { headline: '마교 준동 조짐', sub: '변방에서 마교 무리가 모습을 드러냈다' }
      : { headline: '마교 세력 확장', sub: '정파가 경계 태세에 들어갔다' };
  },
  repSwing: () => ({ up: 'demonic', down: 'orthodox' }),
};

// 4. 문파 충돌 — 어떤 라이벌 쌍이든 충돌 기조일 때 단발. 양측 약간 손실, 긴장 spike 후 소폭 해소.
const clash: WorldEventKind = {
  id: 'clash',
  label: '문파 충돌',
  phasesTotal: 1,
  weight: 1.4,
  ignite(s, rng) {
    // 긴장 가장 높은 라이벌 쌍 하나 — 충돌 문턱 이상이면 발생.
    let best: { a: WorldBloc; b: WorldBloc; t: number } | null = null;
    for (const key of Object.keys(s.tensions)) {
      const [a, b] = key.split('|') as [WorldBloc, WorldBloc];
      const t = s.tensions[key] ?? 0;
      if (!best || t > best.t) best = { a, b, t };
    }
    if (!best || best.t < 60) return null;
    return rng() < 0.35 ? [best.a, best.b] : null;
  },
  effect(s, ev, rng) {
    const [a, b] = ev.blocs;
    addPower(s, a, -2 + noise(rng, 1));
    addPower(s, b, -2 + noise(rng, 1));
    addTension(s, a, b, -6); // 한 번 부딪치면 약간 풀림
  },
  text(ev) {
    const [a, b] = ev.blocs;
    return { headline: `${L(a)}·${L(b)} 무력 충돌`, sub: '국경 일대에서 칼부림이 일었다' };
  },
};

// 5. 거두의 죽음 — 드물게 한 세력의 거두가 진다. 그 세력 세력치↓, 라이벌 긴장↑(권력 공백).
const elderDeath: WorldEventKind = {
  id: 'elder-death',
  label: '거두의 죽음',
  phasesTotal: 1,
  weight: 0.5,
  ignite(s, rng) {
    if (rng() > 0.08) return null;
    const blocs: WorldBloc[] = ['orthodox', 'unorthodox', 'demonic', 'neutral'];
    const pick = blocs[Math.floor(rng() * blocs.length)];
    return [pick];
  },
  effect(s, ev) {
    const a = ev.blocs[0];
    addPower(s, a, -6);
    // 공백을 노린 라이벌 긴장 상승.
    for (const key of Object.keys(s.tensions)) {
      const [x, y] = key.split('|') as [WorldBloc, WorldBloc];
      if (x === a || y === a) addTension(s, x, y, 8);
    }
  },
  text(ev) {
    return { headline: `${L(ev.blocs[0])} 거두 별세`, sub: '강호의 한 기둥이 무너졌다' };
  },
};

// 6. 회맹 — 라이벌 쌍 긴장이 매우 높을 때 화해 시도(release valve). 긴장 큰 폭 해소.
const truce: WorldEventKind = {
  id: 'truce',
  label: '회맹',
  phasesTotal: 1,
  weight: 0.7,
  ignite(s, rng) {
    let best: { a: WorldBloc; b: WorldBloc; t: number } | null = null;
    for (const key of Object.keys(s.tensions)) {
      const [a, b] = key.split('|') as [WorldBloc, WorldBloc];
      const t = s.tensions[key] ?? 0;
      if (!best || t > best.t) best = { a, b, t };
    }
    if (!best || best.t < 55 || best.t >= 86) return null; // 전쟁 직전엔 회맹 무산
    return rng() < 0.2 ? [best.a, best.b] : null;
  },
  effect(s, ev) {
    const [a, b] = ev.blocs;
    addTension(s, a, b, -30);
  },
  text(ev) {
    const [a, b] = ev.blocs;
    return { headline: `${L(a)}·${L(b)} 회맹`, sub: '강호 원로들의 중재로 칼을 거두었다' };
  },
};

// 7. 전쟁 — 라이벌 쌍이 전쟁 기조(긴장≥86)에 이르면 다국면 대전. 개전→격화→결전.
//    결전에서 세력 우위로 승자 판가름 — 패자 큰 좌절(정통은 floor 로 멸문 면함), 이후 탈진해 긴장 급락.
const war: WorldEventKind = {
  id: 'war',
  label: '대전',
  phasesTotal: 3,
  weight: 2,
  narrateEachPhase: true,
  questSeed: true,
  ignite(s, rng) {
    let pair: { a: WorldBloc; b: WorldBloc } | null = null;
    for (const key of Object.keys(s.tensions)) {
      if ((s.tensions[key] ?? 0) >= 86) {
        const [a, b] = key.split('|') as [WorldBloc, WorldBloc];
        pair = { a, b };
        break;
      }
    }
    if (!pair) return null;
    // 이미 같은 쌍 전쟁 진행 중이면 중복 발발 금지(엔진서도 막지만 안전).
    return rng() < 0.7 ? [pair.a, pair.b] : null;
  },
  effect(s, ev, rng) {
    const [a, b] = ev.blocs;
    // 정파가 끼지 않은 대전(사마대전 등)은 정파에 데탕트 — 어둠이 서로 소모하니 정파는 평온해진다.
    if (!ev.blocs.includes('orthodox')) {
      addTension(s, 'orthodox', 'demonic', -8);
      addTension(s, 'orthodox', 'unorthodox', -8);
    }
    if (ev.phase === 1) {
      addTension(s, a, b, 6);
    } else if (ev.phase === 2) {
      addPower(s, a, -4);
      addPower(s, b, -4); // 소모전
    } else {
      // 결전 — 세력 우위 + 약간의 운으로 승자.
      const edge = powerEdge(s, a, b); // a가 강할 확률
      const aWins = rng() < edge;
      const winner = aWins ? a : b;
      const loser = aWins ? b : a;
      addPower(s, winner, 5);
      addPower(s, loser, -16); // 패자 큰 좌절(정통이면 floor 가 멸문 막음)
      addTension(s, a, b, -60); // 탈진 — 한동안 잠잠
      ev.meta = { winner, loser };
    }
  },
  text(ev, phase) {
    const [a, b] = ev.blocs;
    if (phase === 1) return { headline: `${L(a)}·${L(b)} 대전 발발`, sub: '강호가 둘로 갈려 칼을 들었다' };
    if (phase === 2) return { headline: `${L(a)}·${L(b)} 대전 격화`, sub: '곳곳에서 혈전이 벌어진다' };
    const w = (ev.meta?.winner as WorldBloc) ?? a;
    const l = (ev.meta?.loser as WorldBloc) ?? b;
    return { headline: `${L(a)}·${L(b)} 대전 결착`, sub: `${josa(L(w), '이', '가')} ${josa(L(l), '을', '를')} 꺾고 패권을 쥐었다` };
  },
  repSwing: (ev) => ({ up: ev.meta?.winner as WorldBloc, down: ev.meta?.loser as WorldBloc }),
};

// 8. 신흥 세력 발호 — 중도(표국·개방 등) 세력이 일어선다. 정통 아님 → 자유로운 흥망.
const risingSect: WorldEventKind = {
  id: 'rising-sect',
  label: '신흥 세력 발호',
  phasesTotal: 1,
  weight: 0.6,
  ignite(s, rng) {
    if (s.powers.neutral.power > 62) return null;
    return rng() < 0.06 ? ['neutral'] : null;
  },
  effect(s) {
    addPower(s, 'neutral', 8);
  },
  text() {
    return { headline: '신흥 세력 발호', sub: '한 표국이 빠르게 세를 불린다' };
  },
  repSwing: () => ({ up: 'neutral' }),
};

// 9. 사마 패권 다툼 — 사파·마교가 둘 다 세를 갖추면 강호의 그늘을 두고 맞붙는다. 사마 긴장↑.
//    정파 없이 굴러가는 독립 축 → "정파는 평온한데 사파·마교가 대전중"이 가능해진다.
const sapaMagyoFeud: WorldEventKind = {
  id: 'sapa-magyo-feud',
  label: '사마 패권 다툼',
  phasesTotal: 2,
  weight: 0.8,
  ignite(s, rng) {
    if (s.powers.unorthodox.power < 45 || s.powers.demonic.power < 45) return null;
    // 마교가 정파와 대전 중이면 사파에 신경 못 씀(한 번에 한 적).
    if (hasActiveWar(s, 'demonic', 'orthodox')) return null;
    const t = getTension(s, 'unorthodox', 'demonic');
    if (t >= 86) return null;
    return rng() < 0.07 + t / 900 ? ['unorthodox', 'demonic'] : null;
  },
  effect(s, ev) {
    // 사파·마교가 서로 싸우면 정파는 한숨 돌린다(데탕트) — 정마·정사 긴장이 식는다.
    addTension(s, 'orthodox', 'demonic', -10);
    addTension(s, 'orthodox', 'unorthodox', -8);
    if (ev.phase === 1) {
      addTension(s, 'unorthodox', 'demonic', 10);
      addPower(s, 'unorthodox', 2);
      addPower(s, 'demonic', 2);
    } else {
      addTension(s, 'unorthodox', 'demonic', 7);
    }
  },
  text(_ev, phase) {
    return phase === 1
      ? { headline: '사마 패권 다툼', sub: '사파와 마교가 강호의 그늘을 두고 맞붙는다' }
      : { headline: '사마 갈등 격화', sub: '두 어둠이 서로의 목을 노린다' };
  },
};

// 10. 관의 사파 토벌 — 관·군이 비대해진 사파를 친다. 관사 긴장↑·사파 세력↓. 독립 축.
const imperialPurge: WorldEventKind = {
  id: 'imperial-purge',
  label: '관의 사파 토벌',
  phasesTotal: 2,
  weight: 0.7,
  ignite(s, rng) {
    if (s.powers.unorthodox.power < 52) return null;
    const t = getTension(s, 'imperial', 'unorthodox');
    return rng() < 0.06 + t / 900 ? ['imperial', 'unorthodox'] : null;
  },
  effect(s, ev) {
    if (ev.phase === 1) {
      addTension(s, 'imperial', 'unorthodox', 10);
    } else {
      addPower(s, 'unorthodox', -7);
      addTension(s, 'imperial', 'unorthodox', -8);
    }
  },
  text(_ev, phase) {
    return phase === 1
      ? { headline: '관의 사파 토벌령', sub: '관아가 사파 소탕에 나섰다' }
      : { headline: '사파 소탕', sub: '관군이 사파 거점을 쳤다' };
  },
};

export const WORLD_EVENT_KINDS: readonly WorldEventKind[] = [
  uprising,
  subjugation,
  demonicStir,
  clash,
  elderDeath,
  truce,
  war,
  risingSect,
  sapaMagyoFeud,
  imperialPurge,
] as const;

export function findEventKind(id: string): WorldEventKind | undefined {
  return WORLD_EVENT_KINDS.find((k) => k.id === id);
}
