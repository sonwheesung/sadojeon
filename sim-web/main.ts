// 엔진 테스트 콘솔 — PC 브라우저에서 게임 엔진을 직접 돌려 결과를 본다(폰 simlab 의 PC판).
// 백엔드 없음 · 순수 클라이언트. 패널 레지스트리로 엔진 추가 가능(지금은 전투).
// docs/35 전투 엔진 · docs/36 시뮬 검증.

import {
  simulateCombat,
  makeNpcCombatant,
  narrateCombat,
  type NpcArchetype,
} from '@/systems/combat';
import type { Realm } from '@/types/realm';
import type { CombatMode, CombatResult } from '@/types/combat';

// ─── 라벨 ────────────────────────────────────────────────────────────────────
const REALM_LABEL: Record<Realm, string> = {
  none: '무경지', samryu: '삼류', iryu: '이류', ilryu: '일류',
  jeoljeong: '절정', chojeoljeong: '초절정', hwagyeong: '화경',
};
const REALMS = Object.keys(REALM_LABEL) as Realm[];

const ARCHETYPE_LABEL: Record<NpcArchetype, string> = {
  bandit: '산적(도법)', soldier: '관병(도·외공)', orthodox: '정파(검법)',
  rogue: '사파(검·암기)', assassin: '살수(암기·보법)', cultist: '마교(마공)', beast: '요수(외공)',
};
const ARCHETYPES = Object.keys(ARCHETYPE_LABEL) as NpcArchetype[];

const STATE_LABEL: Record<string, string> = {
  standing: '건재', yielded: '승복', downed: '쓰러짐', fled: '패주', dead: '절명',
};
const TIER_LABEL: Record<string, string> = { close: '박빙', edge: '우세', crush: '압도' };
const WINNER_LABEL: Record<string, string> = { A: '아군(A) 승', B: '적(B) 승', draw: '무승부' };

// ─── 전투원 스펙(UI 상태) ────────────────────────────────────────────────────
interface FighterSpec {
  name: string;
  realm: Realm;
  archetype: NpcArchetype;
  quality: number; // 0~1
}
function defaultFighter(side: 'A' | 'B', i: number): FighterSpec {
  return {
    name: `${side}${i + 1}`,
    realm: side === 'A' ? 'jeoljeong' : 'ilryu',
    archetype: side === 'A' ? 'orthodox' : 'bandit',
    quality: 0.5,
  };
}

const teamA: FighterSpec[] = [defaultFighter('A', 0)];
const teamB: FighterSpec[] = [defaultFighter('B', 0)];

// ─── DOM 헬퍼 ────────────────────────────────────────────────────────────────
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, children: (Node | string)[] = []): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const c of children) e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}
function $(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (!e) throw new Error(`#${id} 없음`);
  return e;
}

// ─── 팀 편집 UI ──────────────────────────────────────────────────────────────
function renderTeam(side: 'A' | 'B'): void {
  const team = side === 'A' ? teamA : teamB;
  const host = $(`team-${side}`);
  host.replaceChildren();
  team.forEach((f, i) => {
    const realmSel = el('select', { className: 'sel' },
      REALMS.map((r) => el('option', { value: r, textContent: REALM_LABEL[r], selected: r === f.realm })));
    realmSel.onchange = () => { f.realm = realmSel.value as Realm; };

    const archSel = el('select', { className: 'sel' },
      ARCHETYPES.map((a) => el('option', { value: a, textContent: ARCHETYPE_LABEL[a], selected: a === f.archetype })));
    archSel.onchange = () => { f.archetype = archSel.value as NpcArchetype; };

    const nameInput = el('input', { className: 'name', value: f.name });
    nameInput.oninput = () => { f.name = nameInput.value; };

    const qVal = el('span', { className: 'qval', textContent: f.quality.toFixed(2) });
    const qSlider = el('input', { className: 'q', type: 'range', min: '0', max: '1', step: '0.05', value: String(f.quality) });
    qSlider.oninput = () => { f.quality = Number(qSlider.value); qVal.textContent = f.quality.toFixed(2); };

    const del = el('button', { className: 'del', textContent: '✕', title: '제거' });
    del.onclick = () => { team.splice(i, 1); if (team.length === 0) team.push(defaultFighter(side, 0)); renderTeam(side); };

    host.append(el('div', { className: 'fighter' }, [
      nameInput, realmSel, archSel,
      el('label', { className: 'qwrap' }, ['영근 ', qSlider, qVal]),
      del,
    ]));
  });
  const add = el('button', { className: 'add', textContent: '+ 전투원' });
  add.onclick = () => { team.push(defaultFighter(side, team.length)); renderTeam(side); };
  host.append(add);
}

// ─── 실행 ────────────────────────────────────────────────────────────────────
function buildTeam(specs: FighterSpec[], side: 'A' | 'B'): ReturnType<typeof makeNpcCombatant>[] {
  return specs.map((s, i) =>
    makeNpcCombatant({ id: `${side}${i}`, name: s.name, realm: s.realm, archetype: s.archetype, quality: s.quality, rng: Math.random }));
}

function run(): void {
  const mode = ($('mode') as HTMLSelectElement).value as CombatMode;
  const lethal = ($('lethal') as HTMLInputElement).checked;
  const allowRetreat = ($('retreat') as HTMLInputElement).checked;
  const maxRounds = Number(($('maxRounds') as HTMLInputElement).value) || 30;
  const runs = Math.max(1, Number(($('runs') as HTMLInputElement).value) || 1);
  const cfg = { mode, lethal, allowRetreat, maxRounds, rng: Math.random } as const;

  if (runs === 1) {
    const res = simulateCombat(buildTeam(teamA, 'A'), buildTeam(teamB, 'B'), cfg);
    renderSingle(res);
  } else {
    renderBatch(runs, cfg);
  }
}

function renderSingle(res: CombatResult): void {
  const out = $('out');
  out.replaceChildren();
  const head = el('div', { className: 'verdict' }, [
    el('b', { textContent: WINNER_LABEL[res.winner] }),
    `  ·  ${TIER_LABEL[res.tier]}(margin ${res.margin.toFixed(2)})  ·  ${res.rounds}합  ·  ${res.mode === 'spar' ? '대련' : '실전'}`,
  ]);
  out.append(head);
  if (res.accident) out.append(el('div', { className: 'warn', textContent: `⚠ 대련 사고 — 가해 ${res.accident.strikerId} → 피해 ${res.accident.victimId}` }));

  // 전투원 결과 표
  const rows = res.combatants.map((c) => el('tr', {}, [
    el('td', { textContent: c.side }),
    el('td', { textContent: c.name }),
    el('td', { textContent: STATE_LABEL[c.state] ?? c.state }),
    el('td', { textContent: `${Math.round(c.hpFrac * 100)}%` }),
    el('td', { textContent: `${Math.round(c.qiFrac * 100)}%` }),
    el('td', { textContent: c.dealtFrac.toFixed(2) }),
    el('td', { textContent: c.wound ? `상처 심도${c.wound.severity}(${c.wound.days}일)` : '무사' }),
    el('td', { textContent: c.id === res.mvpId ? '★MVP' : '' }),
  ]));
  const table = el('table', { className: 'tbl' }, [
    el('thead', {}, [el('tr', {}, ['편', '이름', '상태', '체력', '내공', '가한피해', '상처', ''].map((h) => el('th', { textContent: h })))]),
    el('tbody', {}, rows),
  ]);
  out.append(table);

  // 서사
  out.append(el('div', { className: 'narr', textContent: narrateCombat(res) }));

  // 합 로그
  const log = el('details', {}, [el('summary', { textContent: `합 로그 (${res.events.length})` })]);
  const pre = el('pre', { className: 'log' });
  pre.textContent = res.events.map((e) =>
    `${String(e.round).padStart(2)}합 ${e.kind}${e.actorId ? ` ${e.actorId}` : ''}${e.targetId ? `→${e.targetId}` : ''}${e.dmgFrac ? ` (-${Math.round(e.dmgFrac * 100)}%)` : ''}`).join('\n');
  log.append(pre);
  out.append(log);
}

function renderBatch(n: number, cfg: Parameters<typeof simulateCombat>[2]): void {
  let aWin = 0, bWin = 0, draw = 0, roundsSum = 0;
  const tier = { close: 0, edge: 0, crush: 0 } as Record<string, number>;
  let aDeaths = 0, bDeaths = 0, aDown = 0, bDown = 0;
  for (let i = 0; i < n; i++) {
    const res = simulateCombat(buildTeam(teamA, 'A'), buildTeam(teamB, 'B'), cfg);
    if (res.winner === 'A') aWin++; else if (res.winner === 'B') bWin++; else draw++;
    roundsSum += res.rounds;
    tier[res.tier]++;
    for (const c of res.combatants) {
      if (c.state === 'dead') (c.side === 'A' ? aDeaths++ : bDeaths++);
      if (c.state === 'downed') (c.side === 'A' ? aDown++ : bDown++);
    }
  }
  const pct = (x: number) => `${((x / n) * 100).toFixed(1)}%`;
  const out = $('out');
  out.replaceChildren();
  out.append(el('div', { className: 'verdict' }, [el('b', { textContent: `${n}회 반복 통계` })]));
  const lines = [
    `아군(A) 승률   ${pct(aWin)}   (${aWin})`,
    `적(B) 승률     ${pct(bWin)}   (${bWin})`,
    `무승부         ${pct(draw)}   (${draw})`,
    `평균 합수      ${(roundsSum / n).toFixed(1)}`,
    `결과 구간      박빙 ${pct(tier.close)} · 우세 ${pct(tier.edge)} · 압도 ${pct(tier.crush)}`,
    `아군 사상      절명 ${pct(aDeaths)} · 쓰러짐 ${pct(aDown)}`,
    `적 사상        절명 ${pct(bDeaths)} · 쓰러짐 ${pct(bDown)}`,
  ];
  const pre = el('pre', { className: 'stats' });
  pre.textContent = lines.join('\n');
  out.append(pre);
}

// ─── 부팅 ────────────────────────────────────────────────────────────────────
function boot(): void {
  renderTeam('A');
  renderTeam('B');
  ($('run') as HTMLButtonElement).onclick = run;
}
boot();
