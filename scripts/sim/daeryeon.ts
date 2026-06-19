// 대련 시스템 극단 — docs/06·26·33. 결과 4단계(박빙/우세/압도/사고) 보상 분배·배움 귀속·경지 상한.
// 실행: node scripts/sim/_run.cjs scripts/sim/daeryeon.ts  (combat→woundSystem RN — 러너 필요)
// 측정일 2026-06-19. seed 707070. 표본: 분배 N=1500.
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { resolveDaeryeon } from '../../src/systems/daeryeonSystem';
import { seongCap, expToNextSeong } from '../../src/data/martialArts';
import { REALM_SEONG_CAP } from '../../src/data/realm';
import { MARTIAL_ARTS } from '../../src/data/martialArts';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple, MartialArtInstance } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);

// 실제 카탈로그의 평범한 무공 하나(주력) — 경지·등급 상한 검증용.
const ART = MARTIAL_ARTS.find((a) => a.acquisition !== 'quest' || true)!; // 첫 무공
const ARTID = ART.id;

function disc(id: string, seong: number, over: Partial<Disciple> = {}): Disciple {
  const inst: MartialArtInstance = { artId: ARTID, seong, exp: 0 } as MartialArtInstance;
  return {
    id, name: id, status: 'training', relationships: {},
    mainMartialArtId: ARTID, martialArts: [inst],
    realm: 'jeoljeong', darknessLevel: 0, simma: 0, stress: 20, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 1000, pity: 0, petitioned: false },
    personality: { integrity: 50, mercy: 50, prudence: 50, warmth: 50, ambition: 50, freedom: 50 },
    stats: { strength: { level: 50, exp: 0 }, endurance: { level: 50, exp: 0 } },
    ...over,
  } as unknown as Disciple;
}
const seongOf = (id: string) => {
  const d = useDiscipleStore.getState().disciples[id];
  return d?.martialArts.find((a) => a.artId === ARTID)?.seong ?? 0;
};
const expOf = (id: string) => {
  const d = useDiscipleStore.getState().disciples[id];
  return d?.martialArts.find((a) => a.artId === ARTID)?.exp ?? 0;
};

seedAmbient(707070);
console.log('═══ 대련 시스템 극단 ═══\n');

// ──────────────────────────────────────────────────────────────────────────
// 1. 엣지 입력 — 없는 제자·자기 자신 대련·크래시 없음
// ──────────────────────────────────────────────────────────────────────────
useDiscipleStore.getState().setAll([disc('a', 5), disc('b', 5)]);
ck('없는 제자 대련 → null', resolveDaeryeon('a', 'nobody') === null);
ck('없는 제자 양쪽 → null', resolveDaeryeon('x', 'y') === null);
let threw = false;
try { resolveDaeryeon('a', 'a'); } catch (e) { threw = true; }
ck('자기 자신 대련 — 크래시 없음', !threw);

// ──────────────────────────────────────────────────────────────────────────
// 2. 보상 분배 분포 — 동급(박빙↑)/현격차(압도↑)에서 4단계가 모두 나오고 배율 규칙대로
// ──────────────────────────────────────────────────────────────────────────
const N = 1500;
let tiers = { close: 0, edge: 0, crush: 0 };
let injuries = 0;
let bothNonNeg = true;
// 동급 쌍 — 박빙 위주
for (let i = 0; i < N; i += 1) {
  useDiscipleStore.getState().setAll([disc('a', 5), disc('b', 5)]);
  const o = resolveDaeryeon('a', 'b');
  if (!o) { bothNonNeg = false; continue; }
  tiers[o.tier] += 1;
  if (o.injured) injuries += 1;
  for (const k of Object.keys(o.artDelta)) {
    if (!fin(o.artDelta[k].delta) || o.artDelta[k].delta < 0) bothNonNeg = false;
    if (o.artDelta[k].seong < o.artDelta[k].seongBefore) bothNonNeg = false; // 성 후퇴 없음
  }
}
ck('동급 대련 — 모든 artDelta 비음수·성 후퇴 없음', bothNonNeg);
ck('동급 대련 — 박빙(close) 비중 최다', tiers.close >= tiers.edge && tiers.close >= tiers.crush,
  `close=${tiers.close} edge=${tiers.edge} crush=${tiers.crush}`);
ck('동급 대련 — 사고(부상)도 일부 발생', injuries > 0, `사고 ${((injuries / N) * 100).toFixed(1)}%`);

// 현격차 쌍 — 압도(crush) 위주
let crushHi = 0, learnerIsLoser = 0, crushTotal = 0;
for (let i = 0; i < N; i += 1) {
  useDiscipleStore.getState().setAll([
    disc('strong', 9, { realm: 'chojeoljeong' }),
    disc('weak', 2, { realm: 'iryu' }),
  ]);
  const sb = seongOf('weak'); // 약자 시작 성
  const o = resolveDaeryeon('strong', 'weak');
  if (!o) continue;
  if (o.tier === 'crush') {
    crushHi += 1; crushTotal += 1;
    if (o.injured) continue;
    // 압도전 — 승자(strong)는 거의 못 배운다(winner mult 0). artDelta 에 strong 이 거의 없거나 0.
    const strongGain = o.artDelta['strong']?.delta ?? 0;
    const weakGain = o.artDelta['weak']?.delta ?? 0;
    // 배움은 패자(weak)에게 우선 — 압도에선 둘 다 미미하지만 강자 학습은 0(winner mult 0).
    if (strongGain === 0) learnerIsLoser += 1;
  }
}
ck('현격차 대련 — 압도(crush) 다발', crushHi > N * 0.4, `crush ${((crushHi / N) * 100).toFixed(0)}%`);
ck('압도전 — 강자(승자) 성 EXP 0 (배움은 강자에게 안 감)',
  crushTotal === 0 || learnerIsLoser / crushTotal > 0.9, `강자무학습 ${crushTotal ? ((learnerIsLoser / crushTotal) * 100).toFixed(0) : 0}%`);

// ──────────────────────────────────────────────────────────────────────────
// 3. 경지·등급 상한 — 대련 EXP 가 상한을 넘겨 성을 올리지 못한다
// ──────────────────────────────────────────────────────────────────────────
const grade = ART.grade;
const artCap = seongCap(grade);
// 상한에 이미 도달한 제자 — 대련 반복해도 성이 상한 초과 안 함
const ceilingByRealm = REALM_SEONG_CAP['hwagyeong'];
const cap = Math.min(artCap, ceilingByRealm);
let overflow = false;
for (let i = 0; i < 300; i += 1) {
  useDiscipleStore.getState().setAll([
    disc('cap1', cap, { realm: 'hwagyeong' }),
    disc('cap2', cap, { realm: 'hwagyeong' }),
  ]);
  resolveDaeryeon('cap1', 'cap2');
  if (seongOf('cap1') > cap || seongOf('cap2') > cap) overflow = true;
  if (!fin(expOf('cap1')) || !fin(expOf('cap2'))) overflow = true;
}
ck('상한 도달 제자 — 대련 300회로도 성 상한 초과 없음·EXP 유한', !overflow, `cap=${cap}`);

// 경지 상한이 등급보다 낮으면 경지 상한에 막힌다 (삼류 제자는 낮은 성에서 막힘)
const lowRealmCap = REALM_SEONG_CAP['samryu'];
let realmCapped = true;
for (let i = 0; i < 200; i += 1) {
  useDiscipleStore.getState().setAll([
    disc('s1', lowRealmCap, { realm: 'samryu', realmProgress: { internal: 0, pity: 0, petitioned: false } }),
    disc('s2', lowRealmCap, { realm: 'samryu', realmProgress: { internal: 0, pity: 0, petitioned: false } }),
  ]);
  resolveDaeryeon('s1', 's2');
  if (seongOf('s1') > lowRealmCap || seongOf('s2') > lowRealmCap) realmCapped = false;
}
ck('삼류 경지 상한 — 대련으로 경지 상한 초과 없음', realmCapped, `samryu cap=${lowRealmCap}`);

// ──────────────────────────────────────────────────────────────────────────
// 4. 입문(다음 성 ≤4) 비효율 — 입문 대련 EXP가 소성보다 확연히 낮다(NOVICE_SPAR_MULT)
// ──────────────────────────────────────────────────────────────────────────
// 같은 박빙 결과를 많이 모아 평균 적립 비교(입문 1성 vs 소성 5성).
function avgCloseGain(seong: number): number {
  let sum = 0, n = 0;
  for (let i = 0; i < 1200; i += 1) {
    useDiscipleStore.getState().setAll([disc('p', seong), disc('q', seong)]);
    const o = resolveDaeryeon('p', 'q');
    if (!o || o.tier !== 'close' || o.injured) continue;
    const g = (o.artDelta['p']?.delta ?? 0) + (o.artDelta['q']?.delta ?? 0);
    sum += g; n += 1;
  }
  return n ? sum / n : 0;
}
const noviceGain = avgCloseGain(1); // 다음 성 2 ≤ 4 → 입문 패널티
const adeptGain = avgCloseGain(5); // 다음 성 6 > 4 → 패널티 없음
ck('입문(1성) 박빙 평균 EXP < 소성(5성) — 입문 대련 비효율',
  noviceGain < adeptGain, `입문 ${noviceGain.toFixed(0)} < 소성 ${adeptGain.toFixed(0)}`);

// ──────────────────────────────────────────────────────────────────────────
// 5. 🔧 회귀 가드 — stamina 미지정 제자(레거시 세이브 모사)도 전투가 정상 분간된다.
//    withDefaults 가 stamina 를 디폴트 안 하면 staminaFrac=NaN → 강한 제자가 무승부로 묶임. 2026-06-19 수정.
// ──────────────────────────────────────────────────────────────────────────
let crushNoStamina = 0;
for (let i = 0; i < 200; i += 1) {
  // stamina/maxStamina 일부러 미지정(disc 헬퍼는 둘 다 안 넣음) — withDefaults 가 채워야 한다.
  useDiscipleStore.getState().setAll([disc('hi', 9, { realm: 'chojeoljeong' }), disc('lo', 2, { realm: 'iryu' })]);
  const o = resolveDaeryeon('hi', 'lo');
  if (o?.tier === 'crush') crushNoStamina += 1;
}
ck('stamina 미지정 제자 — 현격차가 압도로 정상 분간(NaN 무승부 회귀 방지)',
  crushNoStamina > 150, `crush ${crushNoStamina}/200`);

console.log(`\n[정보] 분배 N=${N}·상한 300회·입문 1200회 · 측정일 2026-06-19 · seed 707070`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
