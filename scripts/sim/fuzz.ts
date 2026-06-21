// fuzz — 원숭이 퍼징: 실코드 게임 루프(autoPlayRun + RandomPolicy)를 여러 시드로 장기 구동하며
// **매일 전역 불변식**을 검사한다. 기존 극단 시뮬(mindstate·relations·alchemy·numextremes)은
// 단일 시점·적대 입력만 보지만, 이건 **교차 시점·장기 누적**(회차 경계·이벤트·면담·의뢰·졸업이 뒤섞인
// 실제 진행)에서 수치/상태가 깨지는지 본다. docs/43 사냥 5렌즈(②자원경합·③생애경계·④의미정합) 표적.
// 실행: node scripts/sim/_run.cjs scripts/sim/fuzz.ts [years=5] [seeds=1,2,3]
//
// 오라클은 A/B 자가검증(일부러 깬 입력에 반드시 실패)한 것만 신뢰 — 아래 selfTest.
import { seedNewRun } from '../../src/systems/newRun';
import { setAutoSaveEnabled } from '../../src/systems/runSync';
import { autoPlayRun, RandomPolicy, type AutoPlayEvent } from '../../src/systems/dev/autoPlay';
import { seedAmbient } from '../../src/systems/rng';
import { useGameStore } from '../../src/stores/gameStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useSectStore } from '../../src/stores/sectStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { currentAge } from '../../src/systems/discipleCtx';
import { armBuggify, buggify, buggifyRange } from './buggify';

const VALID_REALM = new Set(['none', 'samryu', 'iryu', 'ilryu', 'jeoljeong', 'chojeoljeong', 'hwagyeong']);
const VALID_REL = new Set(['enemy', 'distant', 'neutral', 'friend', 'sworn']);
const INBOX_CAP = 400; // 무한 누적(R11/R13류) 감시 — 정상은 게이트·prune 로 ~150 이하.

interface DLike {
  id: string; name?: string; status?: string; realm?: string;
  darknessLevel?: number; stress?: number; simma?: number;
  realmProgress?: { internal?: number; simma?: number };
  stats?: Record<string, { level?: number } | undefined>;
  martialArts?: { artId?: string; seong?: number }[];
  relationships?: Record<string, string>;
}

const fin = (n: unknown): boolean => typeof n === 'number' && Number.isFinite(n);
const finNonNeg = (n: unknown): boolean => fin(n) && (n as number) >= 0;

// 순수 오라클 — 라이브 상태 슬라이스를 받아 위반 문자열 배열 반환. A/B 로 검증한다.
function check(ds: DLike[], resources: number, diamonds: number, inbox: number, ids: string[]): string[] {
  const v: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) { if (seen.has(id)) v.push(`중복 id ${id}`); seen.add(id); }
  for (const d of ds) {
    if (!d) continue;
    const nm = d.name ?? d.id;
    if (d.realm != null && !VALID_REALM.has(d.realm)) v.push(`${nm} realm=${d.realm}`);
    const ip = d.realmProgress?.internal;
    if (ip != null && !finNonNeg(ip)) v.push(`${nm} 내공=${ip}`);
    if (d.darknessLevel != null && (!Number.isInteger(d.darknessLevel) || d.darknessLevel < 0 || d.darknessLevel > 4)) v.push(`${nm} 흑화=${d.darknessLevel}`);
    const simma = d.simma ?? d.realmProgress?.simma;
    if (simma != null && (!fin(simma) || (simma as number) < 0 || (simma as number) > 100)) v.push(`${nm} 심마=${simma}`);
    if (d.stress != null && !fin(d.stress)) v.push(`${nm} 스트레스=${d.stress}`);
    for (const a of d.martialArts ?? []) {
      if (!Number.isInteger(a.seong) || (a.seong as number) < 0 || (a.seong as number) > 10) v.push(`${nm} 성=${a.seong}(${a.artId})`);
    }
    for (const [k, st] of Object.entries(d.stats ?? {})) {
      if (st?.level != null && !finNonNeg(st.level)) v.push(`${nm} ${k}Lv=${st.level}`);
    }
    for (const [oid, lv] of Object.entries(d.relationships ?? {})) {
      if (!VALID_REL.has(lv)) v.push(`${nm}->${oid}=${lv}`);
      if (oid === d.id) v.push(`${nm} 자기관계`);
    }
  }
  if (!finNonNeg(resources)) v.push(`자금=${resources}`);
  if (!finNonNeg(diamonds)) v.push(`다이아=${diamonds}`);
  if (!(inbox <= INBOX_CAP)) v.push(`서신함=${inbox}>${INBOX_CAP}`);
  return v;
}

// A/B 자가검증 — 깨끗한 입력은 0위반, 깬 입력은 다수 검출. 둘 다 참이어야 오라클 신뢰.
function selfTest(): boolean {
  const good: DLike = {
    id: 'g', name: 'g', realm: 'iryu', darknessLevel: 1, stress: 3,
    realmProgress: { internal: 100 }, stats: { strength: { level: 20 } },
    martialArts: [{ artId: 'x', seong: 5 }], relationships: { other: 'friend' },
  };
  const clean = check([good], 100, 0, 10, ['g']);
  const broken = check(
    [{ ...good, martialArts: [{ artId: 'x', seong: 99 }], realmProgress: { internal: NaN }, darknessLevel: 9, relationships: { g: 'enemy', q: 'bogus' } }],
    -5, -1, 9999, ['g', 'g'],
  );
  console.log(`  A/B 오라클: clean ${clean.length}위반(0 기대) · broken ${broken.length}위반(≥7 기대) — ${broken.slice(0, 8).join(', ')}`);
  return clean.length === 0 && broken.length >= 7;
}

// BUGGIFY 스트레서 — 자금을 유효 극단(0~30냥)으로 떨군다. 엔진은 유지비 미납→연단 정지·자금 floor 0 으로
// 견뎌야 한다(docs/37 B7). 견디지 못해 자금 음수·NaN·크래시가 나면 그게 버그.
function injectFundScarcity(): void {
  const sect = useSectStore.getState();
  if (sect.sect) sect.setSect({ ...sect.sect, resources: Math.floor(buggifyRange(0, 30)) });
}

async function main(): Promise<void> {
  setAutoSaveEnabled(false); // 순수 인메모리(DB 미접촉 — _run.cjs 가 supabase 스텁).
  const years = Number(process.argv[3] ?? 5);
  const seeds = (process.argv[4] ?? '1,2,3').split(',').map((s) => Number(s.trim())).filter(Number.isFinite);
  const days = years * 336;
  const cohort = ['yun-soso', 'i-cheongha', 'jin-sohwa', 'jang-cheol']; // 적대 시드쌍 포함(관계 콘텐츠 발화).
  const BUGGIFY = process.argv.includes('buggify'); // C1 결함주입 모드 — 자금 결핍 등 유효 극단을 시드 결정론으로 주입.

  console.log('═══ fuzz — 원숭이 퍼징(실 게임루프 × 매일 불변식) ═══');
  console.log(`시드 ${seeds.join(',')} × ${years}년(${days}일) · 코호트 ${cohort.join(',')}${BUGGIFY ? ' · BUGGIFY 결함주입 ON' : ''}\n`);

  if (!selfTest()) {
    console.log('\n  FAIL  A/B 오라클 자가검증 실패 — 오라클을 신뢰할 수 없음(허위 오라클).');
    process.exit(1);
  }
  console.log('');

  let totalViol = 0;
  let crashes = 0;
  const domainTally: Record<string, number> = {};
  let maxInbox = 0;
  let dayChecks = 0;    // 일 단위 불변식 검사 횟수(자금·다이아·서신·id유일성)
  let discChecks = 0;   // 제자 단위 불변식 검사 횟수(경지·내공·성·흑화·심마·관계 등 ~10항/제자)
  let injections = 0;   // BUGGIFY 결함주입 횟수

  if (BUGGIFY) armBuggify(0.03);

  for (const seed of seeds) {
    seedAmbient(seed);
    useGameStore.getState().setSaveSlot(9); // 시뮬 슬롯(실유저 슬롯 회피).
    seedNewRun(cohort);
    useGameStore.getState().setPhase('playing');

    const events: AutoPlayEvent[] = [];
    const firstViol = new Map<string, number>(); // 위반문자열 → 최초 발생일
    let dayMax = 0;

    const inspect = (done: number): void => {
      const ds = useDiscipleStore.getState();
      const list = ds.order.map((id) => ds.disciples[id]).filter(Boolean) as unknown as DLike[];
      const resources = useSectStore.getState().sect?.resources ?? 0;
      const diamonds = useGameStore.getState().diamonds ?? 0;
      const inbox = useInboxStore.getState().items.length;
      if (inbox > maxInbox) maxInbox = inbox;
      dayChecks += 1; discChecks += list.length;
      // 나이 음수/비유한도 본다(생애 경계 ③).
      for (const d of list) { const a = currentAge(d as never); if (!fin(a) || a < 0) firstViol.set(`${d.name ?? d.id} 나이=${a}`, firstViol.get(`age`) ?? done); }
      for (const msg of check(list, resources, diamonds, inbox, ds.order)) {
        if (!firstViol.has(msg)) firstViol.set(msg, done);
      }
    };

    let crashed = '';
    try {
      await autoPlayRun(
        days,
        (e) => { events.push(e); domainTally[e.domain] = (domainTally[e.domain] ?? 0) + 1; },
        (done) => { dayMax = done; if (BUGGIFY && buggify()) { injectFundScarcity(); injections += 1; } inspect(done); },
        undefined,
        RandomPolicy,
      );
    } catch (e) {
      crashed = (e as Error)?.stack ?? String(e);
      crashes += 1;
    }

    const viols = [...firstViol.entries()];
    totalViol += viols.length;
    console.log(`[시드 ${seed}] ${dayMax}/${days}일 구동 · 발동 ${events.length}건 · 위반 ${viols.length}건${crashed ? ' · 크래시!' : ''}`);
    if (crashed) console.log(`  CRASH  ${crashed.split('\n').slice(0, 4).join('\n         ')}`);
    for (const [msg, day] of viols.slice(0, 12)) console.log(`  VIOL  ${day}일차: ${msg}`);
    if (viols.length > 12) console.log(`  … 외 ${viols.length - 12}건`);
  }

  const domains = Object.entries(domainTally).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' / ');
  console.log(`\n[커버리지] 발동 도메인: ${domains || '없음'}`);
  console.log(`[감시] 최대 서신함 ${maxInbox}건(cap ${INBOX_CAP})`);
  if (BUGGIFY) console.log(`[BUGGIFY] 자금 결핍 결함주입 ${injections}회 — 엔진이 자금 floor·연단 정지로 견뎠나(위반 0이면 견딤)`);
  const evals = dayChecks * 4 + discChecks * 10; // 일검사 4항 + 제자검사 ~10항
  console.log(`[표본] 불변식 평가 ≈ ${evals.toLocaleString()}회 (일검사 ${dayChecks.toLocaleString()} × 4 + 제자검사 ${discChecks.toLocaleString()} × ~10)`);
  console.log(`\n═══ 결과: 시드 ${seeds.length}개 · 위반 ${totalViol}건 · 크래시 ${crashes}건 ═══`);
  process.exit(totalViol > 0 || crashes > 0 ? 1 : 0);
}

void main();
