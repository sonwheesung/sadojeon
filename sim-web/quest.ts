// 의뢰 엔진 패널 — questmatrix(headless) 셋업을 그대로 옮김: 제자 프리셋 세팅 → dispatchQuest →
// advanceTurn 루프로 결산 → 마일스톤 outcome·사상 집계. 의뢰는 순수 함수가 아니라 스토어 환경이 필요해
// seedNewRun 으로 사문·제자를 깔고 매 반복마다 프리셋을 다시 적용한다. docs/29·35·36.

import { seedNewRun } from '@/systems/newRun';
import { setAutoSaveEnabled } from '@/systems/runSync';
import { advanceTurn } from '@/systems/timeSystem';
import { dispatchQuest, setGeumchangBudget } from '@/systems/questSystem';
import { setFoodCost, setPatronageMult } from '@/systems/economySystem';
import { isRespondable, resolveInboxItem, responseOptionsFor } from '@/systems/inboxResolve';
import { resolveFieldEvent } from '@/systems/fieldEventSystem';
import { QUEST_POOL, QUEST_DOMAIN_LABEL, QUEST_GRADE_LABEL, QUEST_DOMAIN_STAT } from '@/data/quests';
import {
  useDiscipleStore, useGameStore, useTimeStore, useMasterStore,
  useReputationStore, useQuestStore, usePendingStore, useScheduleStore, useInboxStore, useSectStore,
  useFieldEventStore,
} from '@/stores';
import type { Quest, MartialArtInstance } from '@/types';
import type { FieldEvent } from '@/stores/fieldEventStore';
import { el, $, opt, field } from './ui';
import { ensureRun, ds } from './runenv';

const inst = (artId: string, seong: number): MartialArtInstance => ({ artId, seong, exp: 0, unlockedAt: 0 });
const PRESETS = {
  samryu3: { label: '삼류 3성', realm: 'samryu', internal: 60, str: 12, agi: 12, end: 18, stat: 15, arts: [inst('samjae-sword', 3), inst('chosangbi', 2)] },
  iryu4: { label: '이류 4성', realm: 'iryu', internal: 200, str: 25, agi: 25, end: 30, stat: 28, arts: [inst('samjae-sword', 4), inst('chosangbi', 3), inst('tonap-beop', 3)] },
  ilryu6: { label: '일류 6성', realm: 'ilryu', internal: 400, str: 40, agi: 38, end: 40, stat: 42, arts: [inst('maehwa-sword', 6), inst('chosangbi', 4), inst('tonap-beop', 4), inst('geumjong-jo', 3)] },
  jeol7: { label: '절정 7성', realm: 'jeoljeong', internal: 650, str: 50, agi: 45, end: 48, stat: 55, arts: [inst('maehwa-sword', 7), inst('chosangbi', 5), inst('tonap-beop', 5), inst('geumjong-jo', 4)] },
  cho8: { label: '초절정 8성', realm: 'chojeoljeong', internal: 900, str: 56, agi: 50, end: 54, stat: 70, arts: [inst('isipsa-maehwa-sword', 8), inst('chosangbi', 6), inst('tonap-beop', 6), inst('geumjong-jo', 5)] },
  hwa10: { label: '화경 10성', realm: 'hwagyeong', internal: 1300, str: 70, agi: 60, end: 60, stat: 85, arts: [inst('isipsa-maehwa-sword', 10), inst('chosangbi', 7), inst('tonap-beop', 7), inst('geumjong-jo', 6)] },
} as const;
type PresetKey = keyof typeof PRESETS;
const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];

const OUTCOME_BY_TITLE: [string, string][] = [
  ['의뢰 위기 끝에 성공', 'crisis'], ['의뢰 완수', 'full'], ['의뢰 성공', 'partial'],
  ['의뢰 실패', 'fail'], ['의뢰 재난', 'disaster'],
];


// 제자에 프리셋 적용 — 전투 빌드(경지·무공·근골) + 의뢰 도메인 역량 스탯. questmatrix applyPreset 확장.
function setupMember(id: string, p: (typeof PRESETS)[PresetKey], q: Quest): void {
  const stats: Record<string, { level: number; exp: number }> = {
    strength: { level: p.str, exp: 0 }, agility: { level: p.agi, exp: 0 }, endurance: { level: p.end, exp: 0 },
  };
  const stat = QUEST_DOMAIN_STAT[q.domain]; // 비전투 도메인(호위·정탐·의술·살수)은 능력치, 결투·큰의뢰는 null(전투력)
  if (stat) stats[stat] = { level: p.stat, exp: 0 };
  ds().update(id, {
    realm: p.realm as never,
    realmProgress: { internal: p.internal, pity: 0, petitioned: false },
    martialArts: p.arts.map((a) => ({ ...a })),
    mainMartialArtId: p.arts[0]?.artId,
    stats: stats as never,
    status: 'training', wounds: undefined, stress: 0, simma: 0,
  });
}

// 파견 직전까지 셋업(배치·단판 공용) — 제자 프리셋·나이·사부·평판·게시판. 반환=파견조·캐리·자금 기준.
function prepare(q: Quest, presets: PresetKey[]): { party: string[]; carry: string; money0: number } {
  const roster = ds().order.slice(0, 4);
  const party = roster.slice(0, presets.length);
  roster.forEach((id, m) => {
    if (m < party.length) setupMember(id, PRESETS[presets[m]], q);
    else ds().update(id, { status: 'resting' });
  });
  const year = useTimeStore.getState().current.year;
  for (const id of roster) ds().update(id, { age: 16, entryYear: year });
  useMasterStore.getState().update({ yearsAsMaster: 0, age: 40 });
  useReputationStore.getState().reset();
  useGameStore.getState().setPhase('playing');
  useQuestStore.setState({ board: [q], active: [] } as never);
  setGeumchangBudget(geumchang); // 회당 구급영약 — ensureRun 무한을 매 회차 실제 설정값으로 덮음(무과금 사망 검증)
  return { party, carry: party[0], money0: useSectStore.getState().sect?.resources ?? 0 };
}

// 매 틱 공용 정리 — 월간 보고/셋업·정산·서신함 자동 응답. (현장 급보는 모드별로 별도 처리.)
async function settleTick(): Promise<void> {
  const s = useScheduleStore.getState();
  if (s.pendingReport) s.resolveMonthlyReport();
  if (s.pendingSetup) s.resolveMonthlySetup();
  if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
  for (const item of [...useInboxStore.getState().items]) {
    const dom = (item.payload as { domain?: string } | undefined)?.domain;
    if (isRespondable(item) && dom !== 'seclusion_petition') {
      const key = responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
      if (key) await resolveInboxItem(item, key);
    }
  }
}

interface Once { outcome: string; dead: number; fatal: number; money: number; }
async function once(q: Quest, presets: PresetKey[]): Promise<Once> {
  const { party, carry, money0 } = prepare(q, presets);
  if (!dispatchQuest(q.id, party)) return { outcome: 'gate', dead: 0, fatal: 0, money: 0 };
  let days = 0, outcome = '';
  while (ds().disciples[carry]?.status === 'questing' && days < q.weeks * 7 + 14) {
    advanceTurn(); days += 1;
    for (const mi of usePendingStore.getState().milestones) {
      if (mi.kind !== 'quest') continue;
      for (const [t, o] of OUTCOME_BY_TITLE) if (mi.title === t) outcome = o;
    }
    await settleTick();
    // 현장 급보(돌발 사건) — 미해소 드롭 방지로 자동 해소. autoFavorable=true 면 성공도(successDelta)가
    // 가장 높은 선택(유리), false 면 가장 낮은 선택(보수)으로 — 선택이 결산에 주는 영향을 양 극단으로 본다.
    const ev = useFieldEventStore.getState().queue[0];
    if (ev && ev.source === 'quest' && ev.refId === q.id) {
      const avail = ev.choices.filter((c) => c.available);
      const sd = (c: typeof avail[number]) => (c.effect as { successDelta?: number } | undefined)?.successDelta ?? 0;
      const sorted = [...avail].sort((a, z) => sd(z) - sd(a)); // 성공도 내림차순
      const k = (autoFavorable ? sorted[0] : sorted[sorted.length - 1])?.key ?? ev.choices[0]?.key;
      if (k) resolveFieldEvent(ev, k);
      useFieldEventStore.getState().pop();
    }
  }
  let dead = 0, fatal = 0;
  for (const id of party) {
    const d = ds().disciples[id];
    if (d?.status === 'departed') dead += 1;
    else if (d?.wounds?.some((w) => w.severity === 1)) fatal += 1;
  }
  const money = (useSectStore.getState().sect?.resources ?? 0) - money0;
  return { outcome, dead, fatal, money };
}

// ─── 단판 선택형 — 현장 급보 4지선다를 사람이 고르고 결과 연결을 본다 ──────────────
const OUTCOME_KO: Record<string, string> = { full: '완수', partial: '성공', crisis: '위기 끝에 성공', fail: '실패', disaster: '재난(사상)' };

// 현장 급보 카드 렌더 + 사용자 선택 대기(Promise).
function askChoice(ev: FieldEvent, host: HTMLElement): Promise<{ key: string; label: string }> {
  return new Promise((resolve) => {
    const btns = el('div', { className: 'ev-choices' });
    const card = el('div', { className: 'event-card' }, [
      el('div', { className: 'ev-title', textContent: `⚑ ${ev.title}` }),
      el('div', { className: 'ev-scene', textContent: ev.sceneLine }),
      el('div', { className: 'ev-prompt', textContent: ev.prompt }),
      btns,
    ]);
    ev.choices.forEach((c) => {
      const label = c.label + (c.note ? `  (${c.note})` : '');
      const b = el('button', { className: 'ev-choice' + (c.available ? '' : ' off'), textContent: label });
      (b as HTMLButtonElement).disabled = !c.available;
      b.onclick = () => {
        Array.from(btns.querySelectorAll('button')).forEach((x) => ((x as HTMLButtonElement).disabled = true));
        b.classList.add('chosen');
        resolve({ key: c.key, label: c.label });
      };
      btns.append(b);
    });
    host.append(card);
  });
}

async function runInteractive(q: Quest, presets: PresetKey[], out: HTMLElement): Promise<void> {
  ensureRun();
  const { party, carry, money0 } = prepare(q, presets);
  out.replaceChildren();
  if (!dispatchQuest(q.id, party)) { out.textContent = '파견 게이트 미달 — 극험은 역량 하드 게이트라 못 보냄. 프리셋을 올려줘.'; return; }
  out.append(el('div', { className: 'verdict' }, [
    el('b', { textContent: `${QUEST_DOMAIN_LABEL[q.domain]}·${QUEST_GRADE_LABEL[q.grade]} · ${q.title}` }),
    `   파견조 ${presets.map((p) => PRESETS[p].label).join(', ')}`,
  ]));
  const chain = el('div', { className: 'chain' });
  out.append(chain);

  let days = 0, outcome = '';
  while (ds().disciples[carry]?.status === 'questing' && days < q.weeks * 7 + 14) {
    advanceTurn(); days += 1;
    for (const mi of usePendingStore.getState().milestones) {
      if (mi.kind !== 'quest') continue;
      for (const [t, o] of OUTCOME_BY_TITLE) if (mi.title === t) outcome = o;
    }
    await settleTick();
    const ev = useFieldEventStore.getState().queue[0];
    if (ev && ev.source === 'quest' && ev.refId === q.id) {
      const chosen = await askChoice(ev, chain); // 사람이 4지선다 선택할 때까지 대기
      const before = new Set(useInboxStore.getState().items.map((i) => i.id));
      resolveFieldEvent(ev, chosen.key);
      useFieldEventStore.getState().pop();
      const result = useInboxStore.getState().items.find((i) => !before.has(i.id));
      chain.append(el('div', { className: 'ev-result' }, [
        el('div', { className: 'ev-pick', textContent: `▶ 내 선택: ${chosen.label}` }),
        el('div', { className: 'ev-rtext', textContent: (result as { body?: string } | undefined)?.body ?? '선택이 의뢰 성공도·위험도에 반영됐다.' }),
      ]));
    }
  }

  let dead = 0, fatal = 0;
  for (const id of party) {
    const d = ds().disciples[id];
    if (d?.status === 'departed') dead += 1;
    else if (d?.wounds?.some((w) => w.severity === 1)) fatal += 1;
  }
  const money = (useSectStore.getState().sect?.resources ?? 0) - money0;
  chain.append(el('div', { className: 'final-card' }, [
    el('div', { className: 'fc-out', textContent: `결산: ${OUTCOME_KO[outcome] ?? '(미해소)'}` }),
    el('div', { className: 'fc-meta', textContent: `사망 ${dead} · 치명상 ${fatal} · 획득 자금 ${money}동` }),
    el('div', { className: 'hint', textContent: '↑ 사건의 선택이 성공도·위험도를 밀어 위 결산으로 이어졌어.' }),
  ]));
}

// ─── 패널 UI ──────────────────────────────────────────────────────────────────
const slots: (PresetKey | '')[] = ['jeol7', 'jeol7', '', ''];
let curQuestId = QUEST_POOL.find((q) => q.grade === 'dangerous')?.id ?? QUEST_POOL[0].id;
let geumchang = 0; // 회당 구급영약 개수(0=무과금 — docs extremerisk 기준). 치명상 1회 소생.
let autoFavorable = true; // 배치: 돌발 사건을 첫 가용(대개 유리) 선택지로 자동. 끄면 무판정 기본 선택만.

export function mountQuestPanel(host: HTMLElement): void {
  host.replaceChildren();

  // 의뢰 선택
  const qSel = el('select', { className: 'sel' });
  for (const q of QUEST_POOL) {
    qSel.append(opt(q.id, `[${QUEST_DOMAIN_LABEL[q.domain]}·${QUEST_GRADE_LABEL[q.grade]}] ${q.title} — 자금 ${q.reward.money} (추천 ${q.recommended}·역량 ${q.minStat})`, q.id === curQuestId));
  }
  qSel.onchange = () => { curQuestId = qSel.value; };

  // 파견조 4슬롯 (프리셋 or 없음)
  const partyHost = el('div', { className: 'fgrid' });
  const renderSlots = () => {
    partyHost.replaceChildren();
    slots.forEach((sk, i) => {
      const sel = el('select', { className: 'sel' }, [
        opt('', i === 0 ? '— (캐리 필수)' : '— (없음)', sk === ''),
        ...PRESET_KEYS.map((k) => opt(k, PRESETS[k].label, sk === k)),
      ]);
      sel.onchange = () => { slots[i] = sel.value as PresetKey | ''; };
      partyHost.append(field(`파견 ${i + 1}${i === 0 ? ' (캐리)' : ''}`, sel));
    });
  };
  renderSlots();

  let mode: 'batch' | 'single' = 'batch';
  const repsInput = el('input', { className: 'count', type: 'number', value: '50', min: '1' });
  const repsWrap = field('반복 횟수', repsInput);
  const modeSel = el('select', { className: 'sel' }, [
    opt('batch', '통계(반복) — 승률·사상률', true),
    opt('single', '단판(선택형) — 사건 4지선다 직접', false),
  ]);
  modeSel.onchange = () => { mode = modeSel.value as 'batch' | 'single'; repsWrap.style.display = mode === 'batch' ? '' : 'none'; };
  const runBtn = el('button', { id: 'q-run', textContent: '의뢰 실행 ▶' });
  const out = el('div', { id: 'q-out' });

  runBtn.onclick = async () => {
    const q = QUEST_POOL.find((x) => x.id === curQuestId)!;
    const presets = slots.filter((s): s is PresetKey => s !== '');
    if (presets.length === 0) { out.textContent = '캐리(파견 1)에 프리셋을 골라줘.'; return; }
    runBtn.textContent = '돌리는 중…'; (runBtn as HTMLButtonElement).disabled = true;
    out.textContent = '';
    await new Promise((r) => setTimeout(r, 20));
    try {
      if (mode === 'single') {
        await runInteractive(q, presets, out);
      } else {
        ensureRun();
        const reps = Math.max(1, Number(repsInput.value) | 0);
        const c = { full: 0, partial: 0, crisis: 0, fail: 0, disaster: 0, gate: 0 } as Record<string, number>;
        let dead = 0, fatal = 0, money = 0, counted = 0;
        for (let i = 0; i < reps; i++) {
          const r = await once(q, presets);
          if (r.outcome && r.outcome !== 'gate') { c[r.outcome] = (c[r.outcome] ?? 0) + 1; counted++; }
          else if (r.outcome === 'gate') c.gate++;
          dead += r.dead; fatal += r.fatal; money += r.money;
        }
        renderResult(out, q, presets, reps, counted, c, dead, fatal, money);
      }
    } catch (e) {
      out.textContent = '오류: ' + ((e as Error).message || e);
    } finally {
      runBtn.textContent = '의뢰 실행 ▶'; (runBtn as HTMLButtonElement).disabled = false;
    }
  };

  // 구급영약 개수(0=무과금) — 치명상 소생, 무과금 사망률 검증용.
  const geumInput = el('input', { className: 'count', type: 'number', value: String(geumchang), min: '0' });
  geumInput.oninput = () => { geumchang = Math.max(0, Number(geumInput.value) | 0); };
  // 사건 자동선택 정책.
  const autoChk = el('input', { type: 'checkbox' }) as HTMLInputElement;
  autoChk.checked = autoFavorable;
  autoChk.onchange = () => { autoFavorable = autoChk.checked; };

  host.append(
    field('의뢰 선택', qSel),
    el('div', { className: 'qhint', textContent: '파견조 — 캐리(파견 1) 필수. 비전투 의뢰는 프리셋 도메인 역량, 결투·큰의뢰는 전투력으로 결산.' }),
    partyHost,
    el('div', { className: 'cfg' }, [
      field('모드', modeSel),
      repsWrap,
      field('구급영약(회당·0=무과금)', geumInput),
      el('label', { className: 'cf chk' }, [autoChk, ' 사건 유리선택(끄면 보수)']),
      runBtn,
    ]),
    el('div', { className: 'hint', textContent: '구급영약 0 = 무과금(치명상 소생 없음 → docs extremerisk 기준). 사건 유리선택 끄면 돌발 사건을 보수적으로 골라 성공률 부풀림 제거. 단판은 사건을 직접 선택.' }),
    out,
  );
}

function renderResult(out: HTMLElement, q: Quest, presets: PresetKey[], reps: number, counted: number, c: Record<string, number>, dead: number, fatal: number, money: number): void {
  out.replaceChildren();
  const base = counted || 1;
  const pc = (n: number) => `${((n / base) * 100).toFixed(1)}%`;
  const pr = (n: number) => `${((n / reps) * 100).toFixed(1)}%`;
  out.append(el('div', { className: 'verdict' }, [
    el('b', { textContent: `${QUEST_DOMAIN_LABEL[q.domain]}·${QUEST_GRADE_LABEL[q.grade]} · ${q.title}` }),
    `   파견조 ${presets.map((p) => PRESETS[p].label).join(', ')}`,
  ]));
  const succ = c.full + c.partial + c.crisis;
  const lines = [
    `집계 회차      ${counted}/${reps}${c.gate ? ` (게이트 차단 ${c.gate})` : ''}${reps - counted - c.gate > 0 ? ` · 현장급보 미해소 제외 ${reps - counted - c.gate}` : ''}`,
    ``,
    `성공률(완수+성공+위기)   ${pc(succ)}`,
    `  · 완수(full)         ${pc(c.full)}`,
    `  · 성공(partial)      ${pc(c.partial)}`,
    `  · 위기끝성공(crisis) ${pc(c.crisis)}`,
    `  · 실패(fail)         ${pc(c.fail)}`,
    `  · 재난(disaster)     ${pc(c.disaster)}`,
    ``,
    `사망률(파견원)   ${pr(dead)}   (누적 ${dead})`,
    `치명상률         ${pr(fatal)}   (누적 ${fatal})`,
    `평균 획득 자금   ${(money / reps).toFixed(0)}동`,
  ];
  const pre = el('pre', { className: 'stats' });
  pre.textContent = lines.join('\n');
  out.append(pre);
}
