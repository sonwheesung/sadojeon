// 엔진 테스트 콘솔 — 전투. 그룹(경지별 인원수)으로 대규모(100:200) 구성 + 무공 빌드 저장/적용.
// 백엔드 없음. docs/35 전투 엔진.

import { simulateCombat, makeNpcCombatant, narrateCombat, type NpcArchetype } from '@/systems/combat';
import { defaultArtTraits } from '@/data/martialArts';
import { mountQuestPanel } from './quest';
import { el, $, opt, field } from './ui';
import type { Realm } from '@/types/realm';
import type { CombatMode, CombatResult, Combatant, CombatArt } from '@/types/combat';
import type { MartialArtSchool, MartialArtGrade, MartialPath } from '@/types/martialArt';

// ─── 라벨 ────────────────────────────────────────────────────────────────────
const REALM_LABEL: Record<Realm, string> = { none:'무경지', samryu:'삼류', iryu:'이류', ilryu:'일류', jeoljeong:'절정', chojeoljeong:'초절정', hwagyeong:'화경' };
const REALMS = Object.keys(REALM_LABEL) as Realm[];
const ARCHETYPE_LABEL: Record<NpcArchetype, string> = { bandit:'산적(도)', soldier:'관병(도·외공)', orthodox:'정파(검)', rogue:'사파(검·암기)', assassin:'살수(암기)', cultist:'마교(마공)', beast:'요수(외공)' };
const ARCHETYPES = Object.keys(ARCHETYPE_LABEL) as NpcArchetype[];
const SCHOOL_LABEL: Record<MartialArtSchool, string> = { sword:'검법', saber:'도법', fist:'권법', lightness:'보법', hidden:'암기', external:'외공', qigong:'내공', medical:'의가', darkArts:'마공' };
const SCHOOLS = Object.keys(SCHOOL_LABEL) as MartialArtSchool[];
const GRADE_LABEL: Record<MartialArtGrade, string> = { novice:'하품', apprentice:'중품', master:'상품', grandmaster:'절품', legendary:'신품' };
const GRADES = Object.keys(GRADE_LABEL) as MartialArtGrade[];
const PATH_LABEL: Record<MartialPath, string> = { jeong:'정파', jung:'중도', sa:'사파', ma:'마도' };
const PATHS = Object.keys(PATH_LABEL) as MartialPath[];
const STATE_LABEL: Record<string,string> = { standing:'건재', yielded:'승복', downed:'쓰러짐', fled:'패주', dead:'절명' };
const TIER_LABEL: Record<string,string> = { close:'박빙', edge:'우세', crush:'압도' };
const WINNER_LABEL: Record<string,string> = { A:'아군(A) 승', B:'적(B) 승', draw:'무승부' };

// ─── 모델 ────────────────────────────────────────────────────────────────────
type Loadout = { kind: 'archetype'; archetype: NpcArchetype } | { kind: 'build'; buildId: string };
interface Group { realm: Realm; quality: number; count: number; loadout: Loadout; }
interface ArtInput { school: MartialArtSchool; grade: MartialArtGrade; path: MartialPath; seong: number; isMain: boolean; }
interface MartialBuild { id: string; name: string; arts: ArtInput[]; }

function defaultGroup(side: 'A'|'B'): Group {
  return side === 'A'
    ? { realm:'jeoljeong', quality:0.5, count:1, loadout:{kind:'archetype', archetype:'orthodox'} }
    : { realm:'ilryu', quality:0.5, count:3, loadout:{kind:'archetype', archetype:'bandit'} };
}
const teamA: Group[] = [defaultGroup('A')];
const teamB: Group[] = [defaultGroup('B')];

// ─── 무공 빌드 저장(localStorage) ────────────────────────────────────────────
const LS_KEY = 'simweb.builds.v1';
let builds: MartialBuild[] = loadBuilds();
function loadBuilds(): MartialBuild[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveBuilds(): void { localStorage.setItem(LS_KEY, JSON.stringify(builds)); }
function newId(): string { return 'b' + Date.now().toString(36) + Math.floor(Math.random()*1e6).toString(36); }
function findBuild(id: string): MartialBuild | undefined { return builds.find((b) => b.id === id); }

// DOM 공용 부품(el·$·opt·field)은 ui.ts 로 분리 — 모든 엔진 패널이 공유(공통화).

// ─── 팀(그룹) 편집 ────────────────────────────────────────────────────────────
function teamCount(team: Group[]): number { return team.reduce((s, g) => s + Math.max(0, g.count|0), 0); }

function loadoutSelect(g: Group): HTMLSelectElement {
  const sel = el('select', { className: 'sel' });
  ARCHETYPES.forEach((a) => sel.append(opt('arch:'+a, '결 · '+ARCHETYPE_LABEL[a], g.loadout.kind==='archetype' && g.loadout.archetype===a)));
  if (builds.length) {
    const og = el('optgroup'); og.label = '내 무공 빌드';
    builds.forEach((b) => og.append(opt('build:'+b.id, '★ '+b.name, g.loadout.kind==='build' && g.loadout.buildId===b.id)));
    sel.append(og);
  }
  sel.onchange = () => {
    const v = sel.value;
    if (v.startsWith('arch:')) g.loadout = { kind:'archetype', archetype: v.slice(5) as NpcArchetype };
    else g.loadout = { kind:'build', buildId: v.slice(6) };
  };
  return sel;
}

function renderTeam(side: 'A'|'B'): void {
  const team = side==='A' ? teamA : teamB;
  const host = $(`team-${side}`); host.replaceChildren();
  team.forEach((g, i) => {
    const realmSel = el('select', { className:'sel' }, REALMS.map((r) => opt(r, REALM_LABEL[r], r===g.realm)));
    realmSel.onchange = () => { g.realm = realmSel.value as Realm; };

    const countInput = el('input', { className:'count', type:'number', min:'1', value:String(g.count) });
    countInput.oninput = () => { g.count = Math.max(1, Number(countInput.value)|0); updateCounts(); };

    const qVal = el('span', { className:'qval', textContent:g.quality.toFixed(2) });
    const qSlider = el('input', { className:'q', type:'range', min:'0', max:'1', step:'0.05', value:String(g.quality) });
    qSlider.oninput = () => { g.quality = Number(qSlider.value); qVal.textContent = g.quality.toFixed(2); };

    const del = el('button', { className:'del', textContent:'✕', title:'그룹 제거' });
    del.onclick = () => { team.splice(i,1); if (!team.length) team.push(defaultGroup(side)); renderTeam(side); updateCounts(); };

    host.append(el('div', { className:'fighter' }, [
      el('div', { className:'frow-top' }, [
        el('span', { className:'fnum', textContent:`그룹 ${i+1}` }),
        field('인원수', countInput),
        del,
      ]),
      el('div', { className:'fgrid' }, [
        field('경지', realmSel),
        field('무공/결', loadoutSelect(g)),
        field('영근 정도', el('div', { className:'qrow' }, [qSlider, qVal])),
      ]),
    ]));
  });
  const add = el('button', { className:'add', textContent:'+ 그룹 추가 (경지별)' });
  add.onclick = () => { team.push(defaultGroup(side)); renderTeam(side); updateCounts(); };
  host.append(add);
  updateCounts();
}

function updateCounts(): void {
  $('cnt-A').textContent = `${teamCount(teamA)}명`;
  $('cnt-B').textContent = `${teamCount(teamB)}명`;
}

// ─── 무공 빌드 관리 UI ────────────────────────────────────────────────────────
const draft: ArtInput[] = [{ school:'sword', grade:'master', path:'jeong', seong:5, isMain:true }];

function renderBuildEditor(): void {
  const host = $('build-editor'); host.replaceChildren();
  draft.forEach((a, i) => {
    const sc = el('select', { className:'sel' }, SCHOOLS.map((s) => opt(s, SCHOOL_LABEL[s], s===a.school))); sc.onchange = () => a.school = sc.value as MartialArtSchool;
    const gr = el('select', { className:'sel' }, GRADES.map((g) => opt(g, GRADE_LABEL[g], g===a.grade))); gr.onchange = () => a.grade = gr.value as MartialArtGrade;
    const pa = el('select', { className:'sel' }, PATHS.map((p) => opt(p, PATH_LABEL[p], p===a.path))); pa.onchange = () => a.path = pa.value as MartialPath;
    const se = el('input', { className:'count', type:'number', min:'1', max:'10', value:String(a.seong) }); se.oninput = () => a.seong = Math.max(1, Math.min(10, Number(se.value)|0));
    const mainBtn = el('button', { className:'mainbtn'+(a.isMain?' on':''), textContent: a.isMain?'주력 ★':'주력', title:'주력 무공 지정' });
    mainBtn.onclick = () => { draft.forEach((x,j) => x.isMain = j===i); renderBuildEditor(); };
    const del = el('button', { className:'del', textContent:'✕' }); del.onclick = () => { draft.splice(i,1); if(!draft.length) draft.push({school:'sword',grade:'master',path:'jeong',seong:5,isMain:true}); if(!draft.some(x=>x.isMain)) draft[0].isMain=true; renderBuildEditor(); };
    host.append(el('div', { className:'artrow' }, [
      field('갈래', sc), field('등급', gr), field('노선', pa), field('성', se),
      el('div', { className:'field' }, [el('span',{className:'flabel',textContent:' '}), mainBtn]),
      el('div', { className:'field' }, [el('span',{className:'flabel',textContent:' '}), del]),
    ]));
  });
  const add = el('button', { className:'add', textContent:'+ 무공 추가' });
  add.onclick = () => { draft.push({ school:'qigong', grade:'master', path:'jeong', seong:5, isMain:false }); renderBuildEditor(); };
  host.append(add);
}

function renderBuildList(): void {
  const host = $('build-list'); host.replaceChildren();
  if (!builds.length) { host.append(el('div', { className:'hint', textContent:'저장된 빌드 없음 — 아래에서 무공을 짜고 저장하면 그룹의 무공/결에서 고를 수 있어.' })); return; }
  builds.forEach((b) => {
    const summary = b.arts.map((a) => `${SCHOOL_LABEL[a.school]} ${GRADE_LABEL[a.grade]}${a.seong}성${a.isMain?'★':''}`).join(' · ');
    const load = el('button', { className:'mini', textContent:'편집' }); load.onclick = () => { draft.length=0; b.arts.forEach((a)=>draft.push({...a})); ($('build-name') as HTMLInputElement).value = b.name; renderBuildEditor(); };
    const del = el('button', { className:'mini danger', textContent:'삭제' }); del.onclick = () => { builds = builds.filter((x)=>x.id!==b.id); saveBuilds(); refreshBuildsEverywhere(); };
    host.append(el('div', { className:'buildcard' }, [
      el('div', { className:'bc-main' }, [el('b',{textContent:'★ '+b.name}), el('div',{className:'bc-sum',textContent:summary})]),
      el('div', { className:'bc-act' }, [load, del]),
    ]));
  });
}

function refreshBuildsEverywhere(): void { renderBuildList(); renderTeam('A'); renderTeam('B'); }

// ─── 전투원 생성 ──────────────────────────────────────────────────────────────
function toCombatArt(a: ArtInput): CombatArt {
  return { school:a.school, grade:a.grade, path:a.path, seong:a.seong, isMain:a.isMain, traits: defaultArtTraits({ school:a.school, grade:a.grade, path:a.path }) };
}
function buildCombatants(team: Group[], side: 'A'|'B'): Combatant[] {
  const out: Combatant[] = []; let n = 0;
  for (const g of team) {
    const isBuild = g.loadout.kind === 'build';
    const arch: NpcArchetype = isBuild ? 'orthodox' : g.loadout.archetype;
    const build = isBuild ? findBuild(g.loadout.buildId) : undefined;
    for (let k = 0; k < Math.max(1, g.count|0); k++) {
      const id = `${side}${n}`; n++;
      const c = makeNpcCombatant({ id, name:id, realm:g.realm, archetype:arch, quality:g.quality, rng:Math.random });
      if (build && build.arts.length) c.arts = build.arts.map(toCombatArt);
      out.push(c);
    }
  }
  return out;
}

// ─── 실행 ────────────────────────────────────────────────────────────────────
function run(): void {
  const mode = ($('mode') as HTMLSelectElement).value as CombatMode;
  const lethal = ($('lethal') as HTMLInputElement).checked;
  const allowRetreat = ($('retreat') as HTMLInputElement).checked;
  const maxRounds = Number(($('maxRounds') as HTMLInputElement).value) || 30;
  const runs = Math.max(1, Number(($('runs') as HTMLInputElement).value) || 1);
  const cfg = { mode, lethal, allowRetreat, maxRounds, rng: Math.random } as const;
  const total = teamCount(teamA) + teamCount(teamB);
  if (total > 600) { $('out').textContent = '전투원 합이 너무 많아(>600). 인원을 줄여줘.'; return; }

  if (runs === 1) {
    const res = simulateCombat(buildCombatants(teamA,'A'), buildCombatants(teamB,'B'), cfg);
    renderSingle(res);
  } else {
    renderBatch(runs, cfg);
  }
}

function renderSingle(res: CombatResult): void {
  const out = $('out'); out.replaceChildren();
  out.append(el('div', { className:'verdict' }, [
    el('b', { textContent: WINNER_LABEL[res.winner] }),
    `  ·  ${TIER_LABEL[res.tier]}(margin ${res.margin.toFixed(2)})  ·  ${res.rounds}합  ·  ${res.mode==='spar'?'대련':'실전'}`,
  ]));
  if (res.accident) out.append(el('div', { className:'warn', textContent:`⚠ 대련 사고 — 가해 ${res.accident.strikerId} → 피해 ${res.accident.victimId}` }));

  if (res.combatants.length > 16) {
    out.append(stateSummaryTable(res));
  } else {
    const rows = res.combatants.map((c) => el('tr', {}, [
      el('td',{textContent:c.side}), el('td',{textContent:c.name}),
      el('td',{textContent:STATE_LABEL[c.state]??c.state}),
      el('td',{textContent:`${Math.round(c.hpFrac*100)}%`}), el('td',{textContent:`${Math.round(c.qiFrac*100)}%`}),
      el('td',{textContent:c.dealtFrac.toFixed(2)}),
      el('td',{textContent:c.wound?`심도${c.wound.severity}(${c.wound.days}일)`:'무사'}),
      el('td',{textContent:c.id===res.mvpId?'★':''}),
    ]));
    out.append(el('table',{className:'tbl'},[
      el('thead',{},[el('tr',{},['편','이름','상태','체력','내공','가한피해','상처','MVP'].map((h)=>el('th',{textContent:h})))]),
      el('tbody',{},rows),
    ]));
  }
  out.append(el('div', { className:'narr', textContent: narrateCombat(res) }));
  const log = el('details',{},[el('summary',{textContent:`합 로그 (${res.events.length})`})]);
  const pre = el('pre',{className:'log'}); pre.textContent = res.events.map((e)=>`${String(e.round).padStart(2)}합 ${e.kind}${e.actorId?` ${e.actorId}`:''}${e.targetId?`→${e.targetId}`:''}${e.dmgFrac?` (-${Math.round(e.dmgFrac*100)}%)`:''}`).join('\n');
  log.append(pre); out.append(log);
}

function stateSummaryTable(res: CombatResult): HTMLElement {
  const agg: Record<string, Record<string, number>> = { A:{}, B:{} };
  for (const c of res.combatants) { agg[c.side][c.state] = (agg[c.side][c.state]||0)+1; }
  const states = ['standing','downed','dead','fled','yielded'];
  const row = (side:'A'|'B') => el('tr',{},[el('td',{textContent:side}), ...states.map((s)=>el('td',{textContent:String(agg[side][s]||0)}))]);
  return el('table',{className:'tbl'},[
    el('thead',{},[el('tr',{},['편',...states.map((s)=>STATE_LABEL[s])].map((h)=>el('th',{textContent:h})))]),
    el('tbody',{},[row('A'),row('B')]),
  ]);
}

function renderBatch(n: number, cfg: Parameters<typeof simulateCombat>[2]): void {
  let aWin=0,bWin=0,draw=0,roundsSum=0; const tier={close:0,edge:0,crush:0} as Record<string,number>;
  let aDead=0,bDead=0,aDown=0,bDown=0, aTotal=0,bTotal=0;
  for (let i=0;i<n;i++) {
    const res = simulateCombat(buildCombatants(teamA,'A'), buildCombatants(teamB,'B'), cfg);
    if (res.winner==='A') aWin++; else if (res.winner==='B') bWin++; else draw++;
    roundsSum += res.rounds; tier[res.tier]++;
    for (const c of res.combatants) {
      if (c.side==='A'){aTotal++; if(c.state==='dead')aDead++; if(c.state==='downed')aDown++;}
      else {bTotal++; if(c.state==='dead')bDead++; if(c.state==='downed')bDown++;}
    }
  }
  const pct=(x:number,d=n)=>`${((x/d)*100).toFixed(1)}%`;
  const out=$('out'); out.replaceChildren();
  out.append(el('div',{className:'verdict'},[el('b',{textContent:`${n}회 반복 · A ${teamCount(teamA)}명 vs B ${teamCount(teamB)}명`})]));
  const lines = [
    `아군(A) 승률   ${pct(aWin)}   (${aWin}/${n})`,
    `적(B) 승률     ${pct(bWin)}   (${bWin}/${n})`,
    `무승부         ${pct(draw)}   (${draw}/${n})`,
    `평균 합수      ${(roundsSum/n).toFixed(1)}`,
    `결과 구간      박빙 ${pct(tier.close)} · 우세 ${pct(tier.edge)} · 압도 ${pct(tier.crush)}`,
    `아군 사상      절명 ${pct(aDead,aTotal)} · 쓰러짐 ${pct(aDown,aTotal)}  (전투원 기준)`,
    `적 사상        절명 ${pct(bDead,bTotal)} · 쓰러짐 ${pct(bDown,bTotal)}`,
  ];
  const pre=el('pre',{className:'stats'}); pre.textContent=lines.join('\n'); out.append(pre);
}

// ─── 부팅 ────────────────────────────────────────────────────────────────────
function boot(): void {
  renderTeam('A'); renderTeam('B');
  renderBuildList(); renderBuildEditor();
  ($('run') as HTMLButtonElement).onclick = run;

  // 탭 전환 — 패널 토글. 의뢰 패널은 첫 진입 때 1회 마운트(무거운 엔진 셋업 지연).
  let questMounted = false;
  const tabs = Array.from(document.querySelectorAll('.tab[data-tab]')) as HTMLElement[];
  const show = (name: string) => {
    for (const t of tabs) t.classList.toggle('inactive', t.dataset.tab !== name);
    $('panel-combat').classList.toggle('hidden', name !== 'combat');
    $('panel-quest').classList.toggle('hidden', name !== 'quest');
    if (name === 'quest' && !questMounted) { mountQuestPanel($('panel-quest')); questMounted = true; }
  };
  for (const t of tabs) t.onclick = () => show(t.dataset.tab!);
  show('combat');
  ($('build-save') as HTMLButtonElement).onclick = () => {
    const nameInput = $('build-name') as HTMLInputElement;
    const name = nameInput.value.trim() || `빌드 ${builds.length+1}`;
    builds.push({ id:newId(), name, arts: draft.map((a)=>({...a})) });
    saveBuilds(); nameInput.value=''; refreshBuildsEverywhere();
  };
}
boot();
