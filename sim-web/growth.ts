// 성장(양육 궤적) 패널 — 제자 1인을 N년 키우며 연차별 경지·내공·외공·역량 진행을 본다. 밸런스 페이싱 검증.
// 순수 양육(시작 무공·솔로 수련) 기준 — 화경 천장(무공서 전권·영약 갓모드)은 factorysweep 몫. docs/06·23·28·36.
import { advanceTurn } from '@/systems/timeSystem';
import { useScheduleStore, usePendingStore, useInboxStore } from '@/stores';
import type { TrainingCategory } from '@/types/training';
import type { Realm } from '@/types/realm';
import { ensureRun, ds } from './runenv';
import { el, $, field, select, num } from './ui';

const DPY = 336; // 1년 = 12달 × 28일
const REALM_LABEL: Record<Realm, string> = { none: '무경지', samryu: '삼류', iryu: '이류', ilryu: '일류', jeoljeong: '절정', chojeoljeong: '초절정', hwagyeong: '화경' };

type Axis = 'simbeop' | 'chosik' | 'gyeonggong' | 'alt';
interface Preset { label: string; pattern: TrainingCategory[]; axis?: Axis; physical?: string; study?: string; }
const PRESETS: Record<string, Preset> = {
  realm: { label: '경지 균형 (내공+무공+외공)', pattern: ['martial', 'martial', 'martial', 'martial', 'physical', 'martial', 'rest'], axis: 'alt', physical: 'phys_horse' },
  internal: { label: '내공 집중 (심법)', pattern: ['martial', 'martial', 'martial', 'martial', 'martial', 'martial', 'rest'], axis: 'simbeop' },
  seong: { label: '무공 성 집중 (초식)', pattern: ['martial', 'martial', 'martial', 'martial', 'martial', 'martial', 'rest'], axis: 'chosik' },
  external: { label: '외공 집중 (체력)', pattern: ['physical', 'physical', 'physical', 'physical', 'physical', 'physical', 'rest'], physical: 'phys_horse' },
  alchemy: { label: '약초학 집중', pattern: ['study', 'study', 'study', 'study', 'study', 'study', 'rest'], study: 'study_alchemy' },
  medicine: { label: '의술 집중', pattern: ['study', 'study', 'study', 'study', 'study', 'study', 'rest'], study: 'study_medicine' },
};
const PRESET_KEYS = Object.keys(PRESETS);

interface Snap { year: number; realm: Realm; internal: number; str: number; agi: number; end: number; seong: number; alchemy: number; medicine: number; }

function snapshot(year: number): Snap {
  const d = ds().disciples[ds().order[0]]!;
  const seong = Math.max(0, ...d.martialArts.map((a) => a.seong));
  const lv = (k: string) => (d.stats as Record<string, { level: number } | undefined>)?.[k]?.level ?? 0;
  return {
    year, realm: d.realm, internal: Math.round(d.realmProgress?.internal ?? 0),
    str: lv('strength'), agi: lv('agility'), end: lv('endurance'), seong,
    alchemy: lv('alchemy'), medicine: lv('medicine'),
  };
}

function run(presetKey: string, years: number, startAge: number): Snap[] {
  ensureRun();
  const id = ds().order[0];
  // 깨끗한 어린 제자로 초기화(외공 나이보정 위해 startAge). 시작 무공은 유지.
  ds().update(id, {
    age: startAge,
    realm: 'samryu' as never,
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    stats: { strength: { level: 5, exp: 0 }, agility: { level: 5, exp: 0 }, endurance: { level: 5, exp: 0 } } as never,
    status: 'training', wounds: undefined, stress: 0, simma: 0,
  });
  const p = PRESETS[presetKey];
  const sched = useScheduleStore.getState();
  sched.setSchedule({ weeklyPattern: [...p.pattern], monthlyQuests: 0 });
  if (p.physical) sched.setDailyChoice(id, 'physical', p.physical);
  if (p.study) sched.setDailyChoice(id, 'study', p.study);
  if (p.axis && p.axis !== 'alt') sched.setDailyChoice(id, 'martial', p.axis);

  const snaps: Snap[] = [];
  for (let day = 0; day < years * DPY; day++) {
    if (p.axis === 'alt') useScheduleStore.getState().setDailyChoice(id, 'martial', day % 2 ? 'simbeop' : 'chosik');
    advanceTurn();
    const s = useScheduleStore.getState();
    if (s.pendingReport) s.resolveMonthlyReport();
    if (s.pendingSetup) s.resolveMonthlySetup();
    if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
    useInboxStore.getState().reset();
    if ((day + 1) % DPY === 0) snaps.push(snapshot((day + 1) / DPY));
  }
  return snaps;
}

export function mountGrowthPanel(host: HTMLElement): void {
  host.replaceChildren();
  let presetKey = 'realm';
  let years = 15;
  let startAge = 8;
  const out = el('div', { id: 'g-out' });
  const runBtn = el('button', { id: 'g-run', textContent: '양육 시뮬 ▶' });

  runBtn.onclick = async () => {
    runBtn.textContent = '키우는 중…'; (runBtn as HTMLButtonElement).disabled = true;
    out.textContent = '';
    await new Promise((r) => setTimeout(r, 20));
    try {
      const snaps = run(presetKey, years, startAge);
      renderResult(out, presetKey, snaps);
    } catch (e) {
      out.textContent = '오류: ' + ((e as Error).message || e);
    } finally {
      runBtn.textContent = '양육 시뮬 ▶'; (runBtn as HTMLButtonElement).disabled = false;
    }
  };

  host.append(
    el('div', { className: 'qhint', textContent: '제자 1인을 N년 키우며 연차별 경지·내공·외공·역량 진행을 본다. 순수 양육(시작 무공·솔로 수련) — 화경 천장은 갓모드(factorysweep) 영역.' }),
    el('div', { className: 'fgrid' }, [
      field('양육 방향', select(PRESET_KEYS, (k) => PRESETS[k].label, presetKey, (v) => { presetKey = v; })),
      field('양육 기간(년)', num(years, (n) => { years = Math.max(1, Math.min(25, n)); }, { min: 1, max: 25 })),
      field('입문 나이', num(startAge, (n) => { startAge = Math.max(6, Math.min(16, n)); }, { min: 6, max: 16 })),
    ]),
    el('div', { className: 'cfg' }, [runBtn]),
    el('div', { className: 'hint', textContent: '입문 나이가 어릴수록 외공(근골) 성장 보정이 커(어릴 때 단련). 경지 균형은 심법/초식을 번갈아 닦아.' }),
    out,
  );
}

function renderResult(out: HTMLElement, presetKey: string, snaps: Snap[]): void {
  out.replaceChildren();
  const last = snaps[snaps.length - 1];
  out.append(el('div', { className: 'verdict' }, [
    el('b', { textContent: `${PRESETS[presetKey].label} · ${snaps.length}년` }),
    `   →  최종 ${REALM_LABEL[last.realm]} · 무공 ${last.seong}성 · 내공 ${last.internal} · 외공 ${last.str}`,
  ]));
  const head = ['연차', '경지', '무공성', '내공', '외공(근)', '민첩', '체력', '약초', '의술'];
  const rows = snaps.map((s) => el('tr', {}, [
    el('td', { textContent: String(s.year) }), el('td', { textContent: REALM_LABEL[s.realm] }),
    el('td', { textContent: String(s.seong) }), el('td', { textContent: String(s.internal) }),
    el('td', { textContent: String(s.str) }), el('td', { textContent: String(s.agi) }),
    el('td', { textContent: String(s.end) }), el('td', { textContent: String(s.alchemy) }),
    el('td', { textContent: String(s.medicine) }),
  ]));
  out.append(el('table', { className: 'tbl' }, [
    el('thead', {}, [el('tr', {}, head.map((h) => el('th', { textContent: h })))]),
    el('tbody', {}, rows),
  ]));
}
