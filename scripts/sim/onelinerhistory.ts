// 한 마디 발화 이력 분석 — 실제 게임 루프(seedNewRun + autoPlayRun)를 전 양육기 동안 돌리며
// 발화된 모든 한 마디를 적재 지점(useInboxStore.add)에서 가로채 기록한다. 그 뒤:
//   ① 커버리지(한 번도 안 뜬 죽은 대사) ② 결(mood) 분포 ③ 제자별 특이/일상 비율·시그니처 소진
//   ④ 특이 대사 중복(0이어야) ⑤ 모순(톤 급변) 연속쌍 ⑥ 일상 대사 반복 단조 ⑦ 제자별 시간순 대본
// 출력을 _oneliner_report.md 로도 쓴다(직접 읽고 추가/수정 판단). docs/12.
import { seedNewRun } from '../../src/systems/newRun';
import { setAutoSaveEnabled } from '../../src/systems/runSync';
import { autoPlayRun, RandomPolicy, type AutoPlayEvent } from '../../src/systems/dev/autoPlay';
import { seedAmbient } from '../../src/systems/rng';
import { useGameStore } from '../../src/stores/gameStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { currentAge } from '../../src/systems/discipleCtx';
import { ONE_LINERS, type OneLinerMood } from '../../src/data/scenarios/oneLiners';
import * as fs from 'fs';

interface Rec {
  seed: number;
  day: number;
  discipleId: string;
  name: string;
  templateId: string;
  body: string;
  mood: OneLinerMood;
  onlyFor: string | null;
  age: number;
  darknessRisk: string;
  trust: number;
  stress: number;
}

const ALL = [
  'jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso', 'gang-muyeol',
  'i-cheongha', 'dokgo-yeon', 'baek-yeon', 'jin-baekho', 'sa-cheonhwa',
];

const TPL = new Map(ONE_LINERS.map((t) => [t.id, t]));
const records: Rec[] = [];
let curSeed = 0;

// 적재 지점 계측 — domain==='oneLiner' 인 add 를 가로채 templateId+제자상태 기록.
function instrument(): void {
  const orig = useInboxStore.getState().add;
  useInboxStore.setState({
    add: (item) => {
      const p = (item as { payload?: Record<string, unknown> }).payload;
      if (p && p.domain === 'oneLiner') {
        const id = String(p.discipleId ?? '');
        const tid = String(p.templateId ?? '');
        const d = useDiscipleStore.getState().disciples[id];
        const tpl = TPL.get(tid);
        if (d) {
          records.push({
            seed: curSeed,
            day: useTimeStore.getState().totalDay,
            discipleId: id,
            name: d.name,
            templateId: tid,
            body: String((item as { body?: string }).body ?? ''),
            mood: tpl?.mood ?? 'normal',
            onlyFor: tpl?.onlyFor ?? null,
            age: currentAge(d),
            darknessRisk: d.darknessRisk,
            trust: Math.round(d.trustToMaster ?? 0),
            stress: Math.round(d.stress ?? 0),
          });
        }
      }
      return orig(item);
    },
  });
}

// 톤 급변(모순) 쌍 — 평온 vs 부정 결, 자만 vs 불신. 연속 발화에서 나오면 어색.
const CONFLICT = new Set<string>(
  [
    ['calm', 'darkening'], ['calm', 'distrust'], ['calm', 'enmity'], ['calm', 'weary'],
    ['pride', 'distrust'], ['pride', 'weary'],
  ].map(([a, b]) => [a, b].sort().join('|')),
);

async function main(): Promise<void> {
  setAutoSaveEnabled(false);
  const years = Number(process.argv[3] ?? 15);
  const seeds = (process.argv[4] ?? '1,2,3,4').split(',').map((s) => Number(s.trim())).filter(Number.isFinite);
  const days = years * 336;

  instrument();

  for (const seed of seeds) {
    curSeed = seed;
    seedAmbient(seed);
    useGameStore.getState().setSaveSlot(9);
    seedNewRun(ALL);
    useGameStore.getState().setPhase('playing');
    try {
      await autoPlayRun(days, (_e: AutoPlayEvent) => {}, () => {}, undefined, RandomPolicy);
    } catch (e) {
      console.log(`[시드 ${seed}] 크래시: ${(e as Error)?.message}`);
    }
  }

  // ───────── 분석 ─────────
  const L: string[] = [];
  const out = (s = '') => { L.push(s); };

  out(`# 한 마디 발화 이력 분석`);
  out(`시드 ${seeds.join(',')} × ${years}년 · 제자 ${ALL.length}명 · 총 발화 ${records.length}건\n`);

  // ① 커버리지 — 죽은 대사(한 번도 안 뜸). 단, IAP/출시후 비활성 캐릭터 전용은 정상(아직 양육 불가).
  const ACTIVE = new Set(['jang-cheol', 'jin-sohwa', 'han-baram', 'yun-soso', 'i-cheongha', 'baek-yeon']);
  const fired = new Set(records.map((r) => r.templateId));
  const deadAll = ONE_LINERS.filter((t) => !fired.has(t.id));
  const isActive = (t: (typeof ONE_LINERS)[number]): boolean => !t.onlyFor || ACTIVE.has(t.onlyFor);
  // 이벤트 게이트 대사(사망 mourning·동문 경사/이변 siblingEvent) — RandomPolicy autoplay 가 그 이벤트(사망·돌파-반응)를
  // 드물게 밟아 미발화 = IAP 비활성 전용과 동류로 "정상". 발화 로직은 oneliner 프로브·siblingReactionSystem 단위가 보장. docs/12.
  const isEventGated = (t: (typeof ONE_LINERS)[number]): boolean =>
    t.when?.mourning != null || t.when?.siblingEvent != null || t.when?.questEcho != null;
  const deadInactive = deadAll.filter((t) => t.onlyFor && !ACTIVE.has(t.onlyFor)); // IAP·출시후 — 정상
  const deadEventGated = deadAll.filter((t) => isActive(t) && isEventGated(t)); // 이벤트 의존 미발화 — 정상
  const dead = deadAll.filter((t) => isActive(t) && !isEventGated(t)); // 활성·비이벤트 진짜 죽은 대사(cap 대상)
  out(`## ① 커버리지 — 발화 ${fired.size}/${ONE_LINERS.length}종 · 활성 죽은 대사 ${dead.length}종 (비활성 전용 ${deadInactive.length}·이벤트게이트 ${deadEventGated.length}종은 정상)`);
  for (const t of dead) out(`- DEAD \`${t.id}\` [${t.mood ?? 'normal'}]${t.onlyFor ? ` (전용:${t.onlyFor})` : ''} when=${JSON.stringify(t.when ?? {})} "${t.body}"`);
  out(`- (정상·비활성: ${deadInactive.map((t) => t.id).join(', ') || '없음'})`);
  out(`- (정상·이벤트게이트: ${deadEventGated.map((t) => t.id).join(', ') || '없음'})`);
  out('');

  // ② 결 분포
  const byMood: Record<string, number> = {};
  for (const r of records) byMood[r.mood] = (byMood[r.mood] ?? 0) + 1;
  out(`## ② 결(mood) 분포`);
  for (const [m, n] of Object.entries(byMood).sort((a, b) => b[1] - a[1])) out(`- ${m}: ${n} (${((n / records.length) * 100).toFixed(1)}%)`);
  out('');

  // ③ 제자별 특이/일상 비율 + 시그니처 소진
  out(`## ③ 제자별 — 발화수 · 특이(시그니처+무거운결) 비율 · 시그니처 소진`);
  for (const id of ALL) {
    const rs = records.filter((r) => r.discipleId === id);
    if (rs.length === 0) { out(`- ${id}: 발화 0 (양육 안 됨?)`); continue; }
    const nm = rs[0].name;
    const sig = new Set(rs.filter((r) => r.onlyFor === id).map((r) => r.templateId));
    const sigAvail = ONE_LINERS.filter((t) => t.onlyFor === id).length;
    const distinctive = rs.filter((r) => r.onlyFor || (r.mood !== 'normal')).length;
    out(`- ${nm}(${id}): 발화 ${rs.length} · 특이 ${((distinctive / rs.length) * 100).toFixed(0)}% · 시그니처 ${sig.size}/${sigAvail} 소진`);
  }
  out('');

  // ④ 특이 대사 중복(0이어야)
  const dupHits: string[] = [];
  for (const seed of seeds) for (const id of ALL) {
    const seen = new Set<string>();
    for (const r of records.filter((x) => x.seed === seed && x.discipleId === id).sort((a, b) => a.day - b.day)) {
      const distinctive = ['darkening', 'distrust', 'enmity', 'identity'].includes(r.mood); // 무거운 감정만 once-only
      if (distinctive) { if (seen.has(r.templateId)) dupHits.push(`시드${seed} ${r.name} ${r.templateId} 재발`); seen.add(r.templateId); }
    }
  }
  out(`## ④ 무거운 감정 대사 중복(0 기대): ${dupHits.length}건`);
  for (const h of dupHits.slice(0, 20)) out(`- ${h}`);
  out('');

  // ⑤ 모순(톤 급변) 연속쌍 — 같은 제자 연속 발화에서 충돌 결 전환
  const conflicts: string[] = [];
  for (const seed of seeds) for (const id of ALL) {
    const rs = records.filter((x) => x.seed === seed && x.discipleId === id).sort((a, b) => a.day - b.day);
    for (let i = 1; i < rs.length; i++) {
      const key = [rs[i - 1].mood, rs[i].mood].sort().join('|');
      if (CONFLICT.has(key) && rs[i].day - rs[i - 1].day <= 28) {
        conflicts.push(`시드${seed} ${rs[i].name} ${rs[i - 1].day}→${rs[i].day}일: [${rs[i - 1].mood}]"${rs[i - 1].body}" → [${rs[i].mood}]"${rs[i].body}"`);
      }
    }
  }
  out(`## ⑤ 모순 의심(28일 내 톤 급변): ${conflicts.length}건`);
  for (const c of conflicts.slice(0, 25)) out(`- ${c}`);
  out('');

  // ⑥ 일상 대사 반복 단조 — 제자별 최다 반복 템플릿(특이 제외)
  out(`## ⑥ 반복 단조 — 제자별 최다 반복 템플릿(전체, 단일 시드 기준 환산)`);
  for (const id of ALL) {
    const rs = records.filter((r) => r.discipleId === id);
    if (rs.length === 0) continue;
    const nSeeds = new Set(rs.map((r) => r.seed)).size || 1;
    const cnt: Record<string, number> = {};
    for (const r of rs) cnt[r.templateId] = (cnt[r.templateId] ?? 0) + 1;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5);
    // 시드당 평균으로 환산(한 회차에서 그 줄을 몇 번 보는지)
    out(`- ${rs[0].name}: ${top.map(([t, n]) => `${t}×${(n / nSeeds).toFixed(1)}`).join(', ')} (회차당)`);
  }
  out('');

  // ⑦ 제자별 시간순 대본(첫 시드만, 최대 18줄) — 톤 흐름 읽기용
  out(`## ⑦ 시간순 대본 (시드 ${seeds[0]}, 제자별 최대 18줄)`);
  for (const id of ALL) {
    const rs = records.filter((r) => r.seed === seeds[0] && r.discipleId === id).sort((a, b) => a.day - b.day);
    if (rs.length === 0) continue;
    out(`\n### ${rs[0].name} (${id}) — ${rs.length}발화`);
    const step = Math.max(1, Math.floor(rs.length / 18));
    for (let i = 0; i < rs.length; i += step) {
      const r = rs[i];
      out(`- ${r.age}세 [${r.mood}${r.onlyFor ? '·전용' : ''}] 신뢰${r.trust} 흑${r.darknessRisk[0]} "${r.body}"`);
    }
  }

  const report = L.join('\n');
  fs.writeFileSync('_oneliner_report.md', report, 'utf8');

  // 콘솔엔 요약만
  console.log(`═══ 한 마디 이력 분석 ═══`);
  console.log(`총 발화 ${records.length} · 발화종 ${fired.size}/${ONE_LINERS.length} · 죽은대사 ${dead.length}`);
  console.log(`결 분포: ${Object.entries(byMood).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(' · ')}`);
  console.log(`특이 중복 ${dupHits.length} · 모순의심 ${conflicts.length}`);
  console.log(`죽은 대사: ${dead.map((t) => t.id).join(', ') || '없음'}`);
  console.log(`→ 상세: _oneliner_report.md`);

  // ───────── 회귀 가드 (밴드 단언) ───────── docs/37 Part D 사각⑧ 닫음 / B11.
  // "진짜 모순"만 가드 — 평온↔(흑화·불신·적의). calm↔weary·pride↔weary 같은 자연 기복은 제외(⑤ 의심엔 잡히되 가드 X).
  const HARD = new Set(['calm|darkening', 'calm|distrust', 'calm|enmity']);
  let hardConflict = 0;
  for (const seed of seeds) for (const id of ALL) {
    const rs = records.filter((x) => x.seed === seed && x.discipleId === id).sort((a, b) => a.day - b.day);
    for (let i = 1; i < rs.length; i++) {
      const key = [rs[i - 1].mood, rs[i].mood].sort().join('|');
      if (HARD.has(key) && rs[i].day - rs[i - 1].day <= 28) hardConflict++;
    }
  }
  // 회차당 최다 반복 = 제자별 최다 템플릿 횟수 / 시드수, 그 최대값.
  let maxRepPerRun = 0;
  for (const id of ALL) {
    const rs = records.filter((r) => r.discipleId === id);
    if (rs.length === 0) continue;
    const nSeeds = new Set(rs.map((r) => r.seed)).size || 1;
    const cnt: Record<string, number> = {};
    for (const r of rs) cnt[r.templateId] = (cnt[r.templateId] ?? 0) + 1;
    const top = Math.max(...Object.values(cnt)) / nSeeds;
    if (top > maxRepPerRun) maxRepPerRun = top;
  }

  const REP_CAP = 28; // 현재 ~13~16. 폭증(once-only 회귀로 공용 풀 떨어짐) 감지 — 250+ 였던 과거 회귀 가드.
  const DEAD_CAP = 28; // 현재 ~23(seong 게이트 t6·pr* + RNG 미발화). 이벤트게이트(grief·sibling)는 별도 정상 분류 제외. 카테고리 통째 사망(200+) 감지.
  console.log('\n--- 회귀 밴드 ---');
  let pass = 0;
  let fail = 0;
  function check(name: string, ok: boolean, got: string | number): void {
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name} (측정 ${got})`);
    if (ok) pass++;
    else fail++;
  }
  check('무거운 감정 대사 중복=0(특이 1회)', dupHits.length === 0, dupHits.length);
  check('모순=0(평온↔흑화/불신/적의)', hardConflict === 0, hardConflict);
  check(`회차당 최다 반복 ≤${REP_CAP}`, maxRepPerRun <= REP_CAP, maxRepPerRun.toFixed(1));
  check(`활성 죽은 대사 ≤${DEAD_CAP}`, dead.length <= DEAD_CAP, dead.length);
  console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
  if (fail > 0) process.exit(1);
}

void main();
