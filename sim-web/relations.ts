// 관계 패널 — 동문 야망 충돌(출도전기 4선택)을 직접 굴려 분기 결과(관계·인격·풍문)를 본다. docs/19·33.
import { ambitionChoices, resolveAmbitionConflict } from '@/systems/ambitionConflictSystem';
import { useInboxStore } from '@/stores';
import type { RelationLevel } from '@/types/disciple';
import { ensureRun, ds } from './runenv';
import { el, $, field, select, num } from './ui';

const REL_LABEL: Record<RelationLevel, string> = { enemy: '원수', distant: '소원', neutral: '중립', friend: '동무', sworn: '의형제' };
const RELS = Object.keys(REL_LABEL) as RelationLevel[];

let aAmb = 70, bAmb = 65;
let rel: RelationLevel = 'friend';

function relOf(aId: string, bId: string): RelationLevel {
  return (ds().disciples[aId]?.relationships?.[bId] ?? 'neutral') as RelationLevel;
}

function runChoice(key: string, out: HTMLElement): void {
  ensureRun();
  const [aId, bId] = ds().order;
  const a0 = ds().disciples[aId]!, b0 = ds().disciples[bId]!;
  // 셋업 — 야망·상호 관계.
  ds().update(aId, { personality: { ...a0.personality, ambition: aAmb } as never, relationships: { ...a0.relationships, [bId]: rel } as never });
  ds().update(bId, { personality: { ...b0.personality, ambition: bAmb } as never, relationships: { ...b0.relationships, [aId]: rel } as never });
  const before = { aAmb, bAmb, rel };
  const inboxBefore = new Set(useInboxStore.getState().items.map((i) => i.id));
  resolveAmbitionConflict(aId, bId, key);
  const aA = ds().disciples[aId]!, bA = ds().disciples[bId]!;
  const report = useInboxStore.getState().items.find((i) => !inboxBefore.has(i.id));

  out.replaceChildren();
  const aName = aA.name, bName = bA.name;
  out.append(el('div', { className: 'verdict' }, [el('b', { textContent: `선택: ${ambitionChoices(aName, bName).find((c) => c.key === key)?.label ?? key}` })]));
  const line = (label: string, b: string, a: string) => el('tr', {}, [el('td', { textContent: label }), el('td', { textContent: b }), el('td', { textContent: a })]);
  out.append(el('table', { className: 'tbl' }, [
    el('thead', {}, [el('tr', {}, ['항목', '이전', '이후'].map((h) => el('th', { textContent: h })))]),
    el('tbody', {}, [
      line(`${aName} 야망`, String(before.aAmb), String(Math.round(aA.personality?.ambition ?? 0))),
      line(`${bName} 야망`, String(before.bAmb), String(Math.round(bA.personality?.ambition ?? 0))),
      line('상호 관계', REL_LABEL[before.rel], REL_LABEL[relOf(aId, bId)]),
    ]),
  ]));
  if (report) out.append(el('div', { className: 'narr', textContent: (report as { body?: string }).body ?? '' }));
}

export function mountRelationsPanel(host: HTMLElement): void {
  host.replaceChildren();
  ensureRun();
  const [aId, bId] = ds().order;
  const aName = ds().disciples[aId]?.name ?? 'A', bName = ds().disciples[bId]?.name ?? 'B';
  const out = el('div', { id: 'r-out' });

  const choiceRow = el('div', { className: 'ev-choices' });
  for (const c of ambitionChoices(aName, bName)) {
    const b = el('button', { className: 'ev-choice', textContent: c.label });
    b.onclick = () => runChoice(c.key, out);
    choiceRow.append(b);
  }

  host.append(
    el('div', { className: 'qhint', textContent: `동문 야망 충돌 — ${aName} · ${bName} 두 동문이 같은 정점을 욕망할 때 사부의 4선택. 분기별 관계·인격·풍문 변화를 본다.` }),
    el('div', { className: 'fgrid' }, [
      field(`${aName} 야망`, num(aAmb, (n) => { aAmb = n; }, { min: 0, max: 100 })),
      field(`${bName} 야망`, num(bAmb, (n) => { bAmb = n; }, { min: 0, max: 100 })),
      field('상호 관계', select(RELS, (r) => REL_LABEL[r], rel, (v) => { rel = v; })),
    ]),
    el('div', { className: 'flabel', textContent: '— 사부의 선택(누르면 즉시 분기) —' }),
    choiceRow,
    out,
  );
}
