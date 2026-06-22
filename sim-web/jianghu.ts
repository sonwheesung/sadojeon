// 강호 사건 패널 — 졸업 동문을 강호에 풀어 자율 사건(충돌·노선갈등·의기투합·의거·소원·해후·복수)을 굴린다. docs/08.
// 졸업생을 직업(노선)으로 세팅 + 상호 관계 → tickGraduateEvents 를 N년 돌려 생성된 사건을 본다.
import { graduateToCareer } from '@/systems/careerSystem';
import { tickGraduateEvents } from '@/systems/graduateEvents';
import { useGraduateStore, useInboxStore, useTimeStore } from '@/stores';
import type { RelationLevel } from '@/types/disciple';
import { ensureRun, ds } from './runenv';
import { el, $, field, select, num } from './ui';

// 노선이 갈리는 대표 직업(충돌·노선갈등이 잘 나게).
const JOBS: [string, string][] = [
  ['murim-lord', '무림맹주(정파 정점)'], ['demon-god', '천마(마도 정점)'], ['divine-healer', '신의(의가)'],
  ['ganghos-shadow', '강호의 그림자(정탐)'], ['chivalrous-chief', '의적 거두'], ['demon-protector', '마교 호법'],
  ['assassin-leader', '살수계 수장'], ['daoist-master', '도가 명사'], ['orthodox-protector', '정파 호법'],
  ['medicine-king', '약왕'], ['sword-saint', '검성'], ['caravan-master', '상단 총관'],
];
const JOB_IDS = JOBS.map((j) => j[0]);
const REL_LABEL: Record<RelationLevel, string> = { enemy: '원수', distant: '소원', neutral: '중립', friend: '동무', sworn: '의형제' };
const RELS = Object.keys(REL_LABEL) as RelationLevel[];

// 4슬롯 졸업생 직업 + 0↔1, 2↔3 상호 관계.
const slotJobs = ['murim-lord', 'demon-god', 'divine-healer', 'chivalrous-chief'];
let rel01: RelationLevel = 'enemy';
let rel23: RelationLevel = 'friend';

function setup(): string[] {
  ensureRun();
  useGraduateStore.setState({ records: [] } as never);
  const ids = ds().order.slice(0, 4);
  // 상호 관계 시드(졸업 레코드가 제자 관계를 인계).
  const setRel = (a: string, b: string, r: RelationLevel) => {
    const da = ds().disciples[a]!, db = ds().disciples[b]!;
    ds().update(a, { relationships: { ...da.relationships, [b]: r } as never });
    ds().update(b, { relationships: { ...db.relationships, [a]: r } as never });
  };
  setRel(ids[0], ids[1], rel01);
  setRel(ids[2], ids[3], rel23);
  ids.forEach((id, i) => graduateToCareer(ds().disciples[id]!, slotJobs[i]));
  return ids;
}

function run(years: number, out: HTMLElement): void {
  setup();
  const events: string[] = [];
  for (let y = 0; y < years; y++) {
    // 사건 timestamp·복수 판정용 연도 진행(가벼운 증분).
    const t = useTimeStore.getState();
    t.setTime({ ...t.current, year: t.current.year + 1 } as never);
    const before = new Set(useInboxStore.getState().items.map((i) => i.id));
    tickGraduateEvents();
    for (const it of useInboxStore.getState().items) {
      if (!before.has(it.id)) events.push(`[${y + 1}년차] ${it.title} — ${it.preview ?? it.body?.split('\n')[0] ?? ''}`);
    }
  }

  out.replaceChildren();
  out.append(el('div', { className: 'verdict' }, [el('b', { textContent: `강호 ${years}년 — 사건 ${events.length}건` })]));
  // 졸업생 최종 상태
  const recs = useGraduateStore.getState().records;
  out.append(el('table', { className: 'tbl' }, [
    el('thead', {}, [el('tr', {}, ['졸업생', '노선', '직책 레벨', '상태'].map((h) => el('th', { textContent: h })))]),
    el('tbody', {}, recs.map((r) => el('tr', {}, [
      el('td', { textContent: r.name }), el('td', { textContent: r.route }),
      el('td', { textContent: String(r.level) }), el('td', { textContent: r.status }),
    ]))),
  ]));
  if (events.length === 0) out.append(el('div', { className: 'hint', textContent: '사건이 없었어 — 관계·노선이 충돌하게(원수+정/마 대립) 바꿔보거나 연수를 늘려봐.' }));
  else out.append(el('pre', { className: 'log' }, [events.join('\n')]));
}

export function mountJianghuPanel(host: HTMLElement): void {
  host.replaceChildren();
  let years = 10;
  const out = el('div', { id: 'j-out' });
  const runBtn = el('button', { id: 'j-run', textContent: '강호 진행 ▶' });
  runBtn.onclick = () => { try { run(years, out); } catch (e) { out.textContent = '오류: ' + ((e as Error).message || e); } };

  const slotGrid = el('div', { className: 'fgrid' }, slotJobs.map((j, i) =>
    field(`졸업생 ${i + 1}`, select(JOB_IDS, (id) => JOBS.find((x) => x[0] === id)![1], j, (v) => { slotJobs[i] = v; }))));

  host.append(
    el('div', { className: 'qhint', textContent: '졸업 동문 4인을 직업(노선)으로 강호에 풀고, N년간 자율 사건(충돌·노선갈등·의거·복수 등)을 굴려 본다.' }),
    slotGrid,
    el('div', { className: 'fgrid' }, [
      field('1↔2 관계', select(RELS, (r) => REL_LABEL[r], rel01, (v) => { rel01 = v; })),
      field('3↔4 관계', select(RELS, (r) => REL_LABEL[r], rel23, (v) => { rel23 = v; })),
      field('강호 연수', num(years, (n) => { years = Math.max(1, Math.min(40, n)); }, { min: 1, max: 40 })),
    ]),
    el('div', { className: 'cfg' }, [runBtn]),
    out,
  );
}
