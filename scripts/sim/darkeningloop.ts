// darkeningloop — 흑화 양육 통합 테스트(실 게임루프). docs/40 §3-D · docs/13 · docs/37 B8.
//
// darkening.ts(seam 단위)와 달리 autoPlayRun(실 루프)에 양육 정책을 끼워 **아크·도덕이벤트·tickDarkness
// 실배선**을 통과시킨다. 다양한 양육 스타일이 흑화/비흑화/갱생을 설계대로 내는지 검증.
//   Evil  : 아크/면담 最暗 + 도덕 묵인(overlook) → 흑화(저저항 깊이·고저항 덜=난이도 차등)
//   Saint : 아크/면담 最善 + 도덕 훈계/처분(admonish) → 비흑화(~0 유지)
//   Mixed : 한 결정마다 번갈아 → 깨끗(선행이 점수 낮춰 회복 우세)
//   갱생  : 단계2 제자 + Saint → 회복(최종<2) / 단계3 + Saint → 불가역(3 유지)
// 실행: node scripts/sim/_run.cjs scripts/sim/darkeningloop.ts [seeds=25]

import { seedNewRun } from '../../src/systems/newRun';
import { setAutoSaveEnabled } from '../../src/systems/runSync';
import { autoPlayRun, type PlayPolicy } from '../../src/systems/dev/autoPlay';
import { configureRandom } from '../../src/systems/dev/policyHelpers';
import { seedAmbient, random } from '../../src/systems/rng';
import { useGameStore } from '../../src/stores/gameStore';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import type { MeetingEffect } from '../../src/data/scenarios/meetings';
import type { InboxItem } from '../../src/types';

const NAME: Record<string, string> = { 'i-cheongha': '이청하', 'yun-soso': '윤소소', 'jang-cheol': '장철', 'jin-sohwa': '진소화' };

function darknessWeight(eff: MeetingEffect): number {
  let w = (eff.darkness ?? 0) * 1000;
  const p = eff.persona ?? {};
  w += Math.max(0, -(p.mercy ?? 0)) + Math.max(0, -(p.integrity ?? 0)) + Math.max(0, p.ambition ?? 0) + Math.max(0, -(eff.righteousness ?? 0)) * 2;
  return w;
}
const rand = () => random();

// mode: 'evil'|'saint'. 아크/면담은 효과 가중 最暗/最善, 도덕은 묵인/훈계 tone.
function pickBy(item: InboxItem, options: { key: string; label: string }[], mode: 'evil' | 'saint'): string {
  const p = (item.payload ?? {}) as Record<string, unknown>;
  const domain = String(p.domain ?? '');
  const list = domain === 'arc' ? p.choices : domain === 'meeting' ? p.options : undefined;
  if (Array.isArray(list)) {
    const avail = new Set(options.map((o) => o.key));
    let best: string | null = null;
    let bestW = mode === 'evil' ? -Infinity : Infinity;
    for (const c of list as { key: string; effects: MeetingEffect }[]) {
      if (!avail.has(c.key)) continue;
      const w = darknessWeight(c.effects ?? {});
      if (mode === 'evil' ? w > bestW : w < bestW) { bestW = w; best = c.key; }
    }
    if (best != null) return best;
  }
  if (domain === 'moral') {
    const keys = options.map((o) => o.key); // tone
    const pref = mode === 'evil' ? ['overlook'] : ['admonish', 'punish', 'seclusion'];
    for (const t of pref) if (keys.includes(t)) return t;
    return keys[0];
  }
  return options[Math.floor(rand() * options.length)].key;
}

const EvilPolicy: PlayPolicy = { label: 'evil', configureBeforeDay: configureRandom, pickInboxKey: (i, o) => pickBy(i, o, 'evil'), dispatch: () => {} };
const SaintPolicy: PlayPolicy = { label: 'saint', configureBeforeDay: configureRandom, pickInboxKey: (i, o) => pickBy(i, o, 'saint'), dispatch: () => {} };
let mixedN = 0;
const MixedPolicy: PlayPolicy = { label: 'mixed', configureBeforeDay: configureRandom, pickInboxKey: (i, o) => pickBy(i, o, (mixedN++ % 2 === 0 ? 'evil' : 'saint')), dispatch: () => {} };

interface Stat { mean: number; rate2: number; }
async function runCaseAsync(id: string, policy: PlayPolicy, seeds: number, seedLevel = 0): Promise<Stat> {
  let sum = 0, dark = 0;
  for (let s = 1; s <= seeds; s++) {
    seedAmbient(s); useGameStore.getState().setSaveSlot(9); seedNewRun([id]);
    useGameStore.getState().setPhase('playing');
    mixedN = 0;
    if (seedLevel > 0) useDiscipleStore.getState().update(id, { darknessLevel: seedLevel as never });
    await autoPlayRun(15 * 336, () => {}, undefined, undefined, policy);
    const lv = useDiscipleStore.getState().disciples[id]?.darknessLevel ?? 0;
    sum += lv; if (lv >= 2) dark += 1;
  }
  return { mean: sum / seeds, rate2: dark / seeds };
}

async function main(): Promise<void> {
  setAutoSaveEnabled(false);
  const seeds = Number(process.argv[3] ?? 25);
  console.log('═══ darkeningloop — 흑화 양육 통합(실 게임루프) ═══');
  console.log(`시드 ${seeds} × 15년 단독 회차 · 정책 Evil/Saint/Mixed + 갱생\n`);

  const fails: string[] = [];
  const check = (label: string, cond: boolean): void => { console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`); if (!cond) fails.push(label); };
  const pc = (x: number) => `${(x * 100).toFixed(0)}%`;

  // ① 악양육 → 흑화 + 난이도 차등(저저항>고저항)
  console.log('── ① 악양육(Evil) → 흑화 ──');
  const eIcha = await runCaseAsync('i-cheongha', EvilPolicy, seeds);
  const eYun = await runCaseAsync('yun-soso', EvilPolicy, seeds);
  const eJang = await runCaseAsync('jang-cheol', EvilPolicy, seeds);
  console.log(`  이청하(0.0) 평균Lv ${eIcha.mean.toFixed(2)}·흑화율 ${pc(eIcha.rate2)} / 윤소소(0.2) ${eYun.mean.toFixed(2)}·${pc(eYun.rate2)} / 장철(0.9) ${eJang.mean.toFixed(2)}·${pc(eJang.rate2)}`);
  check('악양육: 이청하(저항0) 흑화(평균Lv≥2)', eIcha.mean >= 2);
  check('악양육 난이도 차등: 이청하 ≥ 윤소소 ≥ 장철(저저항이 더 깊이)', eIcha.mean >= eYun.mean - 0.3 && eYun.mean >= eJang.mean - 0.3);

  // ② 선양육 → 비흑화
  console.log('── ② 선양육(Saint) → 비흑화 ──');
  const sIcha = await runCaseAsync('i-cheongha', SaintPolicy, seeds);
  const sJang = await runCaseAsync('jang-cheol', SaintPolicy, seeds);
  console.log(`  이청하 평균Lv ${sIcha.mean.toFixed(2)}·흑화율 ${pc(sIcha.rate2)} / 장철 ${sJang.mean.toFixed(2)}·${pc(sJang.rate2)}`);
  check('선양육: 이청하 비흑화(평균Lv<0.5)', sIcha.mean < 0.5);
  check('선양육: 장철 비흑화(평균Lv<0.5)', sJang.mean < 0.5);

  // ③ 번갈아 → 효과가 저항 의존: 고저항은 깨끗, 저저항 살수는 여전히 흑화(순수 선양육 필요)
  console.log('── ③ 번갈아(Mixed) → 효과는 저항 의존 ──');
  const mJang = await runCaseAsync('jang-cheol', MixedPolicy, seeds);
  const mIcha = await runCaseAsync('i-cheongha', MixedPolicy, seeds);
  console.log(`  장철(0.9) Mixed 평균Lv ${mJang.mean.toFixed(2)}·흑화율 ${pc(mJang.rate2)} / 이청하(0.0) Mixed ${mIcha.mean.toFixed(2)}·${pc(mIcha.rate2)}`);
  check('번갈아: 고저항 장철은 깨끗(본성+회복이 가끔의 악선택 상쇄, 평균Lv<0.5)', mJang.mean < 0.5);
  check('번갈아: 저저항 이청하 살수는 여전히 흑화(직접창 즉발+깊은 흑화 불가역 — 순수 선양육 필요)', mIcha.mean >= 2);

  // ④ 갱생 — 단계2 제자 + Saint → 회복 / 단계3 → 불가역
  console.log('── ④ 갱생: 단계2+Saint 회복 · 단계3 불가역 ──');
  const r2 = await runCaseAsync('jang-cheol', SaintPolicy, seeds, 2);
  const r3 = await runCaseAsync('jang-cheol', SaintPolicy, seeds, 3);
  console.log(`  장철 단계2→Saint 최종 평균Lv ${r2.mean.toFixed(2)}(회복) / 단계3→Saint 최종 ${r3.mean.toFixed(2)}(불가역)`);
  check('갱생: 단계2 장철 + Saint → 회복(최종<2)', r2.mean < 2);
  check('불가역: 단계3 장철 + Saint → 회복 안 됨(최종=3)', Math.abs(r3.mean - 3) < 0.01);

  console.log(`\n═══ 결과: ${fails.length === 0 ? 'PASS' : `${fails.length} FAIL`} · 시드 ${seeds} ═══`);
  process.exit(fails.length > 0 ? 1 : 0);
}

void main();
