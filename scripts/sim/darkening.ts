// darkening — 캐릭터별 "필수 이벤트(아크) 자력 흑화" 통제 시뮬. docs/13·48·15.
//
// 배경: 흑화원은 3곳 — ① darknessSystem.tickDarkness(score≥78 점수경로) ② meetingSystem.applyMeetingChoice
// (아크/면담 darkness 효과) ③ eventEngine.applyEffects(도덕 이벤트 darknessLevelBump). 풀 게임루프(원숭이)는
// 랜덤 도덕 이벤트가 직접 흑화 레벨을 올리고 랜덤 훈련이 인격·스트레스를 극단 드리프트시켜 **누구든 흑화**시킨다
// → 캐릭터 아크 설계의 차이를 못 가린다(실측 확인). 그래서 여기서는 **다른 무작위를 전부 배제**하고, 각 캐릭터
// 필수이벤트의 *가장 어두운 선택*만 매년 적용 + 주간 tickDarkness만 돌려, "자기 아크만으로 흑화하나"를 순수 측정.
//
// 스트레스 베이스라인 2종으로 외부 압력 의존도까지 본다:
//   - 평온(stress 0): 순수 아크. 직접 흑화창(darkness>0) 있는 캐릭터만 흑화, score경로뿐인 캐릭터는 ~0.
//   - 고된(stress 60): 외부 압력 가중. score경로 캐릭터가 그제서야 흑화하는지(=얼마나 어려운지).
// 실행: node scripts/sim/_run.cjs scripts/sim/darkening.ts [seeds=200]
// 측정: 회차 끝 darknessLevel(0~4). 흑화=≥2.

import { seedNewRun } from '../../src/systems/newRun';
import { setAutoSaveEnabled } from '../../src/systems/runSync';
import { applyMeetingChoice } from '../../src/systems/meetingSystem';
import { tickDarkness } from '../../src/systems/darknessSystem';
import { seedAmbient } from '../../src/systems/rng';
import { useGameStore } from '../../src/stores/gameStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { getArcEvent } from '../../src/data/scenarios/arcEvents';
import type { MeetingEffect } from '../../src/data/scenarios/meetings';

// 시뮬 가능 6인 = 출시 풀(RECRUIT_POOL 인격 보유). seedNewRun 은 RECRUIT_POOL 만 시드.
// gang-muyeol·dokgo-yeon(POST_LAUNCH_RECRUITS)·결제 2인(인격 부재)은 시드 불가 → 플랜만.
const SIM_IDS = ['jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso', 'i-cheongha', 'baek-yeon'];
const PLAN_ONLY_IDS = ['gang-muyeol', 'dokgo-yeon', 'jin-baekho', 'sa-cheonhwa'];
const NAME: Record<string, string> = {
  'jang-cheol': '장철', 'jin-sohwa': '진소화', 'han-baram': '한바람', 'yun-soso': '윤소소',
  'i-cheongha': '이청하', 'baek-yeon': '백연', 'gang-muyeol': '강무열', 'dokgo-yeon': '독고연',
  'jin-baekho': '진백호', 'sa-cheonhwa': '사천화',
};

function darknessWeight(eff: MeetingEffect): number {
  let w = 0;
  w += (eff.darkness ?? 0) * 1000;
  const p = eff.persona ?? {};
  w += Math.max(0, -(p.mercy ?? 0));
  w += Math.max(0, -(p.integrity ?? 0));
  w += Math.max(0, p.ambition ?? 0);
  w += Math.max(0, -(p.warmth ?? 0)) * 0.5;
  w += Math.max(0, -(eff.righteousness ?? 0)) * 2;
  return w;
}

// 그 해 가장 어두운 아크 선택의 효과(없으면 null).
function darkestArcEffect(id: string, year: number): { dk: number; eff: MeetingEffect } | null {
  const ev = getArcEvent(id, year);
  if (!ev) return null;
  let best = ev.choices[0];
  let bestW = darknessWeight(best?.effects ?? {});
  for (const c of ev.choices) {
    const w = darknessWeight(c.effects ?? {});
    if (w > bestW) { bestW = w; best = c; }
  }
  return best ? { dk: best.effects?.darkness ?? 0, eff: best.effects ?? {} } : null;
}

function printDarkPlan(ids: string[], label: string): void {
  console.log(`\n── 흑화 선택지 플랜 (${label}) — 연차별 直 흑화창(darkness>0)·最暗 가중 ──`);
  for (const id of ids) {
    const rows: string[] = [];
    let directDark = 0;
    for (let y = 1; y <= 15; y++) {
      const d = darkestArcEffect(id, y);
      if (!d) continue;
      if (d.dk > 0) directDark += 1;
      rows.push(d.dk > 0 ? `y${y}:흑화+${d.dk}` : `y${y}:w${Math.round(darknessWeight(d.eff))}`);
    }
    console.log(`  ${NAME[id]}(${id}) — 직접 흑화창 ${directDark}곳`);
    console.log(`      ${rows.join(' ')}`);
  }
}

// 한 캐릭터 단독 회차 — 매년 最暗 아크 적용 + 1년치(336일) 주간 tickDarkness. stressBase 를 매 틱 고정.
function replay(id: string, seed: number, stressBase: number): number {
  seedAmbient(seed);
  useGameStore.getState().setSaveSlot(9);
  seedNewRun([id]);
  useGameStore.getState().setPhase('playing');
  const ds = useDiscipleStore.getState();
  const time = useTimeStore.getState();
  for (let year = 1; year <= 15; year++) {
    const d = darkestArcEffect(id, year);
    if (d) applyMeetingChoice(id, d.eff); // 直 흑화창 darkness:1 + 인격/노선 shift
    for (let day = 0; day < 336; day++) {
      if (stressBase > 0) ds.update(id, { stress: stressBase }); // 외부 압력 베이스라인 고정
      time.advanceDay();
      tickDarkness(); // 주1회(day%7) score≥78 시 레벨 roll
    }
  }
  const fin = useDiscipleStore.getState().disciples[id];
  return fin ? fin.darknessLevel : 0;
}

interface Res { levels: Record<string, number[]>; sum: Record<string, number>; }
function runScenario(stressBase: number, seeds: number): Res {
  const levels: Record<string, number[]> = {};
  const sum: Record<string, number> = {};
  for (const id of SIM_IDS) { levels[id] = [0, 0, 0, 0, 0]; sum[id] = 0; }
  for (const id of SIM_IDS) {
    for (let s = 1; s <= seeds; s++) {
      const lv = replay(id, s, stressBase);
      levels[id][lv] += 1;
      sum[id] += lv;
    }
  }
  return { levels, sum };
}

function printTable(title: string, r: Res, seeds: number): void {
  console.log(`\n═══ ${title} (n=${seeds}) ═══`);
  console.log(`  ${'캐릭터'.padEnd(8)} ${'흑화≥2'.padStart(7)} ${'심층=4'.padStart(7)} ${'평균Lv'.padStart(7)}  분포[0/1/2/3/4]`);
  const ranked = [...SIM_IDS].sort((a, b) => {
    const fa = r.levels[a][2] + r.levels[a][3] + r.levels[a][4];
    const fb = r.levels[b][2] + r.levels[b][3] + r.levels[b][4];
    return fb - fa;
  });
  const pct = (n: number) => `${((n / seeds) * 100).toFixed(1)}%`;
  for (const id of ranked) {
    const L = r.levels[id];
    const ge2 = L[2] + L[3] + L[4];
    const mean = (r.sum[id] / seeds).toFixed(2);
    console.log(`  ${NAME[id].padEnd(8)} ${pct(ge2).padStart(7)} ${pct(L[4]).padStart(7)} ${mean.padStart(7)}  [${L.join('/')}]`);
  }
}

async function main(): Promise<void> {
  setAutoSaveEnabled(false);
  const seeds = Number(process.argv[3] ?? 40); // 결과 사실상 결정론적(직접창→Lv4·무창→0) — 루틴은 40로 빠르게. 기록용 100.

  console.log('═══ darkening — 캐릭터별 필수이벤트 자력 흑화(통제 아크 리플레이) ═══');
  console.log(`시드 ${seeds} × 15년 · 매년 最暗 아크 + 주간 tickDarkness만(도덕·랜덤훈련 배제) · 흑화 ≥2\n`);

  printDarkPlan(SIM_IDS, '시뮬 6인');
  printDarkPlan(PLAN_ONLY_IDS, '미시드 4인(POST_LAUNCH·결제) — 플랜만');

  console.log(`\n── [평온] 스트레스 0 — 순수 아크 자력 흑화 구동…`);
  const calm = runScenario(0, seeds);
  console.log(`── [고된] 스트레스 60 — 외부 압력 가중 구동…`);
  const hard = runScenario(60, seeds);

  printTable('[평온·stress0] 순수 아크 자력 흑화율', calm, seeds);
  printTable('[고된·stress60] 외부 압력 가중 흑화율', hard, seeds);

  const margin = 1.96 * Math.sqrt(0.25 / seeds) * 100;
  console.log(`\n[오차] 95% 근사 최대 ±${margin.toFixed(1)}%p(p=0.5).`);

  // ── 불변식 가드(docs/13 흑화 도달 경로) ──
  // 직접 흑화창 0인 장철·진소화·백연 = 자력 흑화(평온) 0% / 직접창 보유 한바람·윤소소·이청하 = 100%.
  // 누가 장철 등 아크에 darkness 효과를 (재)추가하면 자력 흑화율>0 으로 FAIL.
  const ge2rate = (id: string, r: Res) => (r.levels[id][2] + r.levels[id][3] + r.levels[id][4]) / seeds;
  const fails: string[] = [];
  const check = (label: string, cond: boolean): void => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`);
    if (!cond) fails.push(label);
  };
  // 직접 흑화창 0인 장철·진소화·백연 = 자력 흑화(평온) 0% / 직접창 보유 한바람·윤소소·이청하 = 100%.
  console.log('');
  for (const id of ['jang-cheol', 'jin-sohwa', 'baek-yeon']) {
    check(`${NAME[id]} 자력 흑화 0%(직접 흑화창 없음) — 실측 ${(ge2rate(id, calm) * 100).toFixed(0)}%`, ge2rate(id, calm) === 0);
  }
  for (const id of ['han-baram', 'yun-soso', 'i-cheongha']) {
    check(`${NAME[id]} 자력 흑화 100%(직접 흑화창 보유) — 실측 ${(ge2rate(id, calm) * 100).toFixed(0)}%`, ge2rate(id, calm) === 1);
  }
  console.log(`\n═══ 결과: ${SIM_IDS.length * 0 + (6 - fails.length)} PASS · ${fails.length} FAIL · 시드 ${seeds} ═══`);
  process.exit(fails.length > 0 ? 1 : 0);
}

void main();
