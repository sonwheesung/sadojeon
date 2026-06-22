// 직업(졸업) 평가 패널 — jobselect(headless) 처럼 졸업생 빌드(경지·무공·스탯·인격·명성·흑화)를 세팅하고
// evaluateJobs 로 직업 후보(노선별 대표 1 + 확률)·제자 의지를 본다. 빌드가 직업과 합당한지 검증. docs/28·08.

import { evaluateJobs, discipleWill } from '@/systems/jobSystem';
import type { MartialArtSchool } from '@/types/martialArt';
import { el, $, opt, field, select, num } from './ui';
import { ensureRun, ds } from './runenv';

const REALM_LABEL = { samryu: '삼류', iryu: '이류', ilryu: '일류', jeoljeong: '절정', chojeoljeong: '초절정', hwagyeong: '화경' } as const;
const REALMS = Object.keys(REALM_LABEL) as (keyof typeof REALM_LABEL)[];
const SCHOOL_LABEL: Record<MartialArtSchool, string> = { sword: '검법', saber: '도법', fist: '권법', lightness: '보법', hidden: '암기', external: '외공', qigong: '내공', medical: '의가', darkArts: '마공' };
const SCHOOLS = Object.keys(SCHOOL_LABEL) as MartialArtSchool[];
// 갈래 → 대표 무공서 id(jobselect 와 동일).
const SCHOOL_ART: Record<MartialArtSchool, string> = {
  sword: 'ami-manbul-jojong-sword', saber: 'common-pungroe-dobeop', fist: 'ami-hangma-singwon',
  lightness: 'ami-neungun-yeonhwa-bo', hidden: 'common-yeonju-pyo', external: 'ami-yeonhwa-geumgang-che',
  qigong: 'geumjeong-singong', medical: 'dangga-haedok-bigyeol', darkArts: 'heupseong-daebeop',
};
const PERSONA: [string, string][] = [['integrity', '강직'], ['freedom', '자유'], ['warmth', '다정'], ['prudence', '신중'], ['mercy', '자비'], ['ambition', '야망']];
const STATS: [string, string][] = [['medicine', '의술'], ['alchemy', '약초'], ['scouting', '정탐'], ['knowledge', '지력'], ['guarding', '호위'], ['formation', '진법'], ['etiquette', '예절']];

interface Build {
  realm: keyof typeof REALM_LABEL; school: MartialArtSchool; seong: number; str: number; fame: number; dark: number;
  persona: Record<string, number>; stats: Record<string, number>;
}
function blankPersona() { const p: Record<string, number> = {}; for (const [k] of PERSONA) p[k] = 50; return p; }
const b: Build = { realm: 'jeoljeong', school: 'sword', seong: 7, str: 50, fame: 40, dark: 0, persona: blankPersona(), stats: {} };

// 빠른 원형(jobselect A[]) — 누르면 폼을 채운다.
const ARCHS: { label: string; set: () => void }[] = [
  { label: '검성급(화경·검10)', set: () => Object.assign(b, { realm: 'hwagyeong', school: 'sword', seong: 10, str: 72, fame: 95, dark: 0, persona: { integrity: 60, freedom: 62, warmth: 50, prudence: 50, mercy: 58, ambition: 58 }, stats: { knowledge: 72, guarding: 62 } }) },
  { label: '신의(절정·의술85)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'medical', seong: 6, str: 20, fame: 60, dark: 0, persona: { integrity: 55, freedom: 50, warmth: 75, prudence: 55, mercy: 70, ambition: 40 }, stats: { medicine: 85, knowledge: 72, alchemy: 55 } }) },
  { label: '약왕(절정·약재82)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'qigong', seong: 5, str: 20, fame: 55, dark: 0, persona: blankPersona(), stats: { alchemy: 82, medicine: 58 } }) },
  { label: '그림자(절정·정탐85)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'lightness', seong: 7, str: 35, fame: 45, dark: 0, persona: blankPersona(), stats: { scouting: 85 } }) },
  { label: '호위(절정·호위75)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'saber', seong: 6, str: 55, fame: 50, dark: 0, persona: blankPersona(), stats: { guarding: 75, etiquette: 65, knowledge: 55 } }) },
  { label: '사파살수(절정·검8·냉혹)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'sword', seong: 8, str: 50, fame: 40, dark: 1, persona: { integrity: 25, freedom: 55, warmth: 35, prudence: 60, mercy: 18, ambition: 60 }, stats: { scouting: 70 } }) },
  { label: '마교호법급(화경·마공10·흑화)', set: () => Object.assign(b, { realm: 'hwagyeong', school: 'darkArts', seong: 10, str: 70, fame: 90, dark: 4, persona: { integrity: 12, freedom: 50, warmth: 30, prudence: 40, mercy: 8, ambition: 70 }, stats: { fist: 70 } as never }) },
  { label: '도가(초절·내공8·지력)', set: () => Object.assign(b, { realm: 'chojeoljeong', school: 'qigong', seong: 8, str: 40, fame: 55, dark: 0, persona: { integrity: 55, freedom: 70, warmth: 55, prudence: 75, mercy: 60, ambition: 45 }, stats: { knowledge: 72 } }) },
  { label: '범재(절정·검5·맨몸)', set: () => Object.assign(b, { realm: 'jeoljeong', school: 'sword', seong: 5, str: 45, fame: 10, dark: 0, persona: blankPersona(), stats: {} }) },
];

function evaluate(): { jobs: ReturnType<typeof evaluateJobs>; willName: string } {
  ensureRun();
  const id = ds().order[0];
  const stats: Record<string, { level: number; exp: number }> = { strength: { level: b.str, exp: 0 } };
  for (const [k] of STATS) if (b.stats[k]) stats[k] = { level: b.stats[k], exp: 0 };
  ds().update(id, {
    realm: b.realm as never,
    martialArts: [{ artId: SCHOOL_ART[b.school], seong: b.seong, exp: 0, unlockedAt: 0 }],
    mainMartialArtId: SCHOOL_ART[b.school],
    stats: stats as never,
    fame: b.fame,
    darknessLevel: b.dark as never,
    personality: { ...b.persona } as never,
  });
  const d = ds().disciples[id]!;
  const jobs = evaluateJobs(d);
  const will = discipleWill(d, jobs.map((x) => x.job));
  return { jobs, willName: will ? will.name : '뚜렷한 의지 없음 (스승이 정함)' };
}

export function mountCareerPanel(host: HTMLElement): void {
  host.replaceChildren();
  const out = el('div', { id: 'c-out' });
  const rerender = () => mountCareerPanel(host); // 프리셋 적용 후 폼 갱신

  // 빠른 원형
  const archRow = el('div', { className: 'arch-row' });
  for (const a of ARCHS) {
    const btn = el('button', { className: 'mini', textContent: a.label });
    btn.onclick = () => { a.set(); rerender(); };
    archRow.append(btn);
  }

  const grid = el('div', { className: 'fgrid' }, [
    field('경지', select(REALMS, (r) => REALM_LABEL[r], b.realm, (v) => { b.realm = v; })),
    field('주력 무공', select(SCHOOLS, (s) => SCHOOL_LABEL[s], b.school, (v) => { b.school = v; })),
    field('무공 성(1~10)', num(b.seong, (n) => { b.seong = n; }, { min: 1, max: 10 })),
    field('외공(근골)', num(b.str, (n) => { b.str = n; }, { min: 0, max: 100 })),
    field('명성', num(b.fame, (n) => { b.fame = n; }, { min: 0, max: 100 })),
    field('흑화 단계(0~4)', num(b.dark, (n) => { b.dark = n; }, { min: 0, max: 4 })),
  ]);

  const personaGrid = el('div', { className: 'fgrid' }, PERSONA.map(([k, label]) =>
    field(`${label}(인격)`, num(b.persona[k] ?? 50, (n) => { b.persona[k] = n; }, { min: 0, max: 100 }))));
  const statGrid = el('div', { className: 'fgrid' }, STATS.map(([k, label]) =>
    field(label, num(b.stats[k] ?? 0, (n) => { b.stats[k] = n; }, { min: 0, max: 100 }))));

  const runBtn = el('button', { id: 'c-run', textContent: '직업 평가 ▶' });
  runBtn.onclick = () => {
    try {
      const { jobs, willName } = evaluate();
      out.replaceChildren();
      out.append(el('div', { className: 'verdict' }, [el('b', { textContent: '직업 후보 (노선별 대표 · 확률순)' })]));
      const rows = jobs.map((j) => el('div', { className: 'jobrow' }, [
        el('div', { className: 'jobname', textContent: j.job.name }),
        el('div', { className: 'jobbar-wrap' }, [el('div', { className: 'jobbar', style: `width:${Math.round(j.prob * 100)}%` as never })]),
        el('div', { className: 'jobpct', textContent: `${(j.prob * 100).toFixed(1)}%` }),
      ]));
      out.append(...rows);
      out.append(el('div', { className: 'narr', textContent: `제자 의지(인격이 끌리는 길): ${willName}` }));
    } catch (e) {
      out.textContent = '오류: ' + ((e as Error).message || e);
    }
  };

  host.append(
    el('div', { className: 'qhint', textContent: '졸업생 빌드를 세팅해 직업 후보를 본다. 빠른 원형을 누르면 폼이 채워져. (노선마다 대표 직책 1개 — 같은 노선은 최고 직책으로 수렴)' }),
    archRow,
    el('div', { className: 'flabel', textContent: '— 빌드 —' }),
    grid,
    el('div', { className: 'flabel', textContent: '— 인격 6축 —' }),
    personaGrid,
    el('div', { className: 'flabel', textContent: '— 비전투 역량 —' }),
    statGrid,
    el('div', { className: 'cfg' }, [runBtn]),
    out,
  );
}
