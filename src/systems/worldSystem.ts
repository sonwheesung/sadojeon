// 강호 정세 엔진 코어 — 순수(스토어/서신/RN import 없음). 게임·인앱 시뮬·헤드리스 공용.
// seedWorldState: 회차 시작 정세. tickWorldState: 한 계절 진행(긴장 드리프트 → 사건 발생·진행·결말).
// 부수효과(서신·평판·의뢰)는 코어가 직접 하지 않고 '리포트'로 반환 → worldDriver 가 적용(SOLID).

import {
  BLOC_DEF,
  BLOC_LABEL,
  RIVALRIES,
  STANCE_LABEL,
  WORLD_BLOCS,
  blocPairKey,
} from '@/data/worldPowers';
import { WORLD_EVENT_KINDS, findEventKind } from '@/data/worldEvents';
import { recomputeStances } from '@/systems/worldState';
import type { Stance, WorldBloc, WorldEvent, WorldPower, WorldState } from '@/types/world';

type Rng = () => number;

const MAX_ACTIVE = 4; //      동시 진행 사건 상한
const NEW_PER_TICK = 2; //    한 계절 새 발발 상한
const TENSION_COOLDOWN = 2; // 계절마다 긴장 자연 냉각(드리프트와 길항)
const POWER_REVERT = 0.05; // 세력 항상성 — 매 계절 base 로 회귀(한 세력 무한 성장·쇠퇴 방지)

const noise = (rng: Rng, mag: number) => (rng() - 0.5) * 2 * mag;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ── 리포트(코어가 반환 → 드라이버가 부수효과로 적용) ──────────────────────────
export interface WorldRumor {
  title: string;
  body: string;
  priority: 'normal' | 'high';
}
export interface WorldTickReport {
  rumors: WorldRumor[];
  repSwings: { up?: WorldBloc; down?: WorldBloc }[]; // 강호 주도권 이동 → 사문 평판 미세 연동
  questSeeds: { kind: string; blocs: WorldBloc[]; headline: string }[]; // 큰 사건 → 의뢰 시드
  ignited: string[];
  resolved: string[];
}

// ── 표시 문구 ────────────────────────────────────────────────────────────────
function powerWord(p: number): string {
  if (p >= 75) return '세가 드높다';
  if (p >= 55) return '세 두텁다';
  if (p >= 35) return '세를 지킨다';
  if (p >= 18) return '쇠한 기색';
  return '뿌리만 남았다';
}

function outlookFor(power: WorldPower): string {
  return `${STANCE_LABEL[power.stance]} · ${powerWord(power.power)}`;
}

function refreshOutlooks(s: WorldState): void {
  for (const bloc of WORLD_BLOCS) {
    const p = s.powers[bloc];
    if (p) p.outlook = outlookFor(p);
  }
}

// ── 초기 정세 ────────────────────────────────────────────────────────────────
export function seedWorldState(rng: Rng = Math.random): WorldState {
  const powers = {} as Record<WorldBloc, WorldPower>;
  for (const bloc of WORLD_BLOCS) {
    const base = BLOC_DEF[bloc].base + Math.round(noise(rng, 4));
    powers[bloc] = {
      id: bloc,
      label: BLOC_LABEL[bloc],
      power: clamp(base, BLOC_DEF[bloc].floor, 100),
      stance: 'calm',
      outlook: '',
    };
  }
  const tensions: Record<string, number> = {};
  for (const r of RIVALRIES) {
    // 시작 긴장 — 라이벌 강도에 비례한 잔불.
    tensions[blocPairKey(r.a, r.b)] = clamp(r.drift * 4 + noise(rng, 6), 0, 60);
  }
  const s: WorldState = { season: 0, powers, tensions, events: [] };
  recomputeStances(s);
  refreshOutlooks(s);
  return s;
}

// ── 사건 수명 진행 ───────────────────────────────────────────────────────────
function advanceEvent(s: WorldState, ev: WorldEvent, rng: Rng): void {
  const kind = findEventKind(ev.kind);
  if (!kind) {
    ev.done = true;
    return;
  }
  ev.phase += 1;
  kind.effect(s, ev, rng);
  const t = kind.text(ev, ev.phase);
  ev.headline = t.headline;
  ev.sub = t.sub;
  if (ev.phase >= ev.phasesTotal) ev.done = true;
}

function sameBlocs(ev: WorldEvent, blocs: WorldBloc[]): boolean {
  const set = new Set(ev.blocs);
  return blocs.length === ev.blocs.length && blocs.every((b) => set.has(b));
}

// ── 한 계절 진행 (입력 상태를 변형하고 같은 객체 반환 — 호출자는 누적용 단일 상태를 넘긴다) ──
export function tickWorldState(s: WorldState, rng: Rng = Math.random): WorldTickReport {
  const report: WorldTickReport = { rumors: [], repSwings: [], questSeeds: [], ignited: [], resolved: [] };

  // 1) 지난 계절 결말난 사건 제거.
  s.events = s.events.filter((e) => !e.done);
  s.season += 1;

  // 2) 세력 항상성 — base 로 완만히 회귀(강호 세력은 무한 성장·쇠퇴하지 않는다).
  for (const bloc of WORLD_BLOCS) {
    const p = s.powers[bloc];
    const def = BLOC_DEF[bloc];
    p.power = clamp(p.power + (def.base - p.power) * POWER_REVERT, def.floor, 100);
  }

  // 3) 라이벌 긴장 드리프트 + 자연 냉각.
  for (const r of RIVALRIES) {
    const key = blocPairKey(r.a, r.b);
    const cur = s.tensions[key] ?? 0;
    s.tensions[key] = clamp(cur + r.drift * 0.6 + noise(rng, 1.5) - TENSION_COOLDOWN, 0, 100);
  }
  recomputeStances(s);

  // 3) 진행 중 사건 한 국면 전진.
  for (const ev of s.events) {
    if (ev.done) continue;
    const before = ev.phase;
    advanceEvent(s, ev, rng);
    const kind = findEventKind(ev.kind);
    if (!kind) continue;
    if (ev.done) {
      report.resolved.push(ev.kind);
      report.rumors.push({ title: ev.headline, body: ev.sub, priority: ev.phasesTotal > 1 ? 'high' : 'normal' });
      const swing = kind.repSwing?.(ev);
      if (swing) report.repSwings.push(swing);
      if (kind.questSeed) report.questSeeds.push({ kind: ev.kind, blocs: ev.blocs, headline: ev.headline });
    } else if (kind.narrateEachPhase && before > 0) {
      report.rumors.push({ title: ev.headline, body: ev.sub, priority: 'normal' });
    }
  }

  // 4) 새 사건 발발 — 빈 슬롯 한도 내, 가중 우선.
  let slots = MAX_ACTIVE - s.events.filter((e) => !e.done).length;
  const cands: { kind: (typeof WORLD_EVENT_KINDS)[number]; blocs: WorldBloc[] }[] = [];
  for (const kind of WORLD_EVENT_KINDS) {
    const blocs = kind.ignite(s, rng);
    if (!blocs) continue;
    if (kind.id === 'war' && s.events.some((e) => e.kind === 'war' && sameBlocs(e, blocs))) continue;
    cands.push({ kind, blocs });
  }
  cands.sort((a, b) => b.kind.weight * rng() - a.kind.weight * rng());
  let spawned = 0;
  for (const c of cands) {
    if (slots <= 0 || spawned >= NEW_PER_TICK) break;
    const ev: WorldEvent = {
      id: `${c.kind.id}-${s.season}-${Math.floor(rng() * 1e6)}`,
      kind: c.kind.id,
      blocs: c.blocs,
      phase: 0,
      phasesTotal: c.kind.phasesTotal,
      startedSeason: s.season,
      headline: '',
      sub: '',
      done: false,
    };
    s.events.push(ev);
    advanceEvent(s, ev, rng);
    report.ignited.push(c.kind.id);
    report.rumors.push({ title: ev.headline, body: ev.sub, priority: c.kind.id === 'war' ? 'high' : 'normal' });
    if (ev.done) {
      // 단발 사건이 이번 계절에 바로 결말.
      report.resolved.push(ev.kind);
      const swing = c.kind.repSwing?.(ev);
      if (swing) report.repSwings.push(swing);
      if (c.kind.questSeed) report.questSeeds.push({ kind: ev.kind, blocs: ev.blocs, headline: ev.headline });
    }
    slots -= 1;
    spawned += 1;
  }

  // 5) 기조·문구 재계산.
  recomputeStances(s);
  refreshOutlooks(s);
  return report;
}

// 표시용 — 한 세력의 기조 라벨.
export function stanceLabel(st: Stance): string {
  return STANCE_LABEL[st];
}

// 강호 위기도 0~1 — 의뢰 게시판 구성 등 "정세에 닿는" 시스템이 읽는다. docs/08·29.
// = 라이벌 쌍 최고 긴장(정규화) + 진행 중 공격적 사건(봉기·준동·충돌·토벌·전쟁) 가산.
// 평온(0)이면 평화 잡일도 자연스럽고, 높을수록(사파 습격·전쟁) 무력·위기 의뢰로 기운다.
const AGGRESSIVE_EVENTS = new Set(['uprising', 'demonic-stir', 'war', 'subjugation', 'clash']);
export function worldThreat(s: WorldState | null): number {
  if (!s) return 0;
  let maxT = 0;
  for (const k of Object.keys(s.tensions)) maxT = Math.max(maxT, s.tensions[k] ?? 0);
  let threat = maxT / 100;
  if (s.events.some((e) => !e.done && AGGRESSIVE_EVENTS.has(e.kind))) threat = Math.min(1, threat + 0.15);
  return clamp(threat, 0, 1);
}
