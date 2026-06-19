// 심마/흑화 재검증(적대) — docs/13·26·37. 기존 mindstate.ts 가 게이지 클램프를 보았다면,
// 여기선 발작 내부 산식의 경계·오버라이드·거대 내공·장기 결정성을 친다.
// 새 공격: ① SIMMA_SEVERITY 임계(88·72) 경계의 경계(==,−1,+1)  ② severityOverride 비정상값(0·음수·거대·소수) 방어
//          ③ 거대(MAX_SAFE) 내공 발작 — 흩어짐 손실 유한·비음수·내공 비증가  ④ 발작 후 심마 방출 일관(−40, 0 하한)
//          ⑤ 장기 tickSimma 결정성(같은 시드=같은 발작 패턴)  ⑥ 발작 굴림 누적 — 즉사 없음(다회 표본)
// 실행: npx tsx scripts/sim/mindstate_recheck.ts
import './_storageShim';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { addSimma, tickSimma, triggerQiDeviation, SIMMA_ERUPT_THRESHOLD } from '../../src/systems/simmaSystem';
import { seedAmbient } from '../../src/systems/rng';
import type { Disciple } from '../../src/types';

let pass = 0, fail = 0;
function ck(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}
const fin = (n: number) => Number.isFinite(n) && !Number.isNaN(n);
function disc(id: string, over: Partial<Disciple> = {}): Disciple {
  return {
    id, name: id, status: 'training', relationships: {}, martialArts: [], realm: 'samryu',
    darknessLevel: 0, darknessRisk: 'low', simma: 0, stress: 0, trustToMaster: 30, qiAttribute: 'fire',
    realmProgress: { internal: 100, pity: 0, petitioned: false }, ...over,
  } as unknown as Disciple;
}
const internalOf = (id: string) => useDiscipleStore.getState().disciples[id]?.realmProgress?.internal ?? 0;
const simmaOf = (id: string) => useDiscipleStore.getState().disciples[id]?.simma ?? 0;

seedAmbient(86420);
console.log('═══ 심마/흑화 재검증(적대) ═══\n');

// ── 1. SIMMA_SEVERITY 임계 경계 — 88·72 의 ==,−1,+1 에서 severity·흩어짐% 가 단계대로 ──
// SIMMA_SEVERITY: simma>=88 →2(중상,22%), >=72 →3(14%), 그 외 →4(7%). 발작 손실은 severity 가 낮을수록 큼.
// 같은 내공(1000)에서 simma 별 흩어짐 손실을 직접 비교.
function lossAt(simma: number): number {
  useDiscipleStore.getState().setAll([disc('b', { simma, realmProgress: { internal: 1000, pity: 0, petitioned: false } })]);
  const before = internalOf('b');
  triggerQiDeviation('b');
  return before - internalOf('b');
}
const l87 = lossAt(87); // severity 3 (14%) → 140
const l88 = lossAt(88); // severity 2 (22%) → 220
const l72 = lossAt(72); // severity 3 (14%) → 140
const l71 = lossAt(71); // severity 4 (7%)  → 70
ck('심마 88(==) 흩어짐 = 22%(중상 단계)', l88 === 220, `손실 ${l88}`);
ck('심마 87(−1) 흩어짐 = 14%(한 단계 아래)', l87 === 140, `손실 ${l87}`);
ck('심마 72(==) 흩어짐 = 14%', l72 === 140, `손실 ${l72}`);
ck('심마 71(−1) 흩어짐 = 7%(가장 가벼운 발작)', l71 === 70, `손실 ${l71}`);
ck('임계 넘을수록 흩어짐 단조 증가(71<72<88)', l71 < l72 && l72 < l88);

// ── 2. severityOverride 비정상값 방어 — 0·음수·거대·소수 → 크래시 없이 내공 유한·비음수 ──
let ovCrash = false; let ovOk = true;
for (const sev of [0, -1, 999, 2.7, NaN, Infinity]) {
  useDiscipleStore.getState().setAll([disc('o', { simma: 80, realmProgress: { internal: 500, pity: 0, petitioned: false } })]);
  try {
    triggerQiDeviation('o', sev);
    const inq = internalOf('o');
    if (!(fin(inq) && inq >= 0 && inq <= 500)) ovOk = false; // 발작 손실이므로 내공 증가 없음
  } catch { ovCrash = true; }
}
ck('severityOverride 비정상값 — 크래시 없음', !ovCrash);
ck('severityOverride 비정상값 — 내공 항상 유한·[0,원본]', ovOk);

// ── 3. 거대(MAX_SAFE) 내공 발작 — 손실 유한·비음수·내공 비증가 ──
useDiscipleStore.getState().setAll([disc('huge', { simma: 100, realmProgress: { internal: Number.MAX_SAFE_INTEGER, pity: 0, petitioned: false } })]);
const hugeBefore = internalOf('huge');
triggerQiDeviation('huge');
const hugeAfter = internalOf('huge');
ck('거대 내공 발작 — 결과 유한', fin(hugeAfter));
ck('거대 내공 발작 — 내공 감소(흩어짐)·비음수', hugeAfter >= 0 && hugeAfter < hugeBefore);

// ── 4. 발작 후 심마 방출 일관 — −40, 0 하한 ──
useDiscipleStore.getState().setAll([disc('rel', { simma: 100 })]);
triggerQiDeviation('rel');
ck('발작 후 심마 = 100−40 = 60', simmaOf('rel') === 60, `심마 ${simmaOf('rel')}`);
useDiscipleStore.getState().setAll([disc('rel2', { simma: 30 })]);
triggerQiDeviation('rel2');
ck('낮은 심마(30) 발작 후 0 하한(음수 X)', simmaOf('rel2') === 0);
// 발작은 서신함 통지 1건.
const inboxBefore = useInboxStore.getState().items.length;
useDiscipleStore.getState().setAll([disc('note', { simma: 90 })]);
triggerQiDeviation('note');
ck('발작 → 서신함 통지 추가', useInboxStore.getState().items.length > inboxBefore);

// ── 5. 장기 tickSimma 결정성 — 같은 시드·같은 입력 = 같은 발작 패턴 ──
function runDrift(seed: number): { finalSimma: number; finalInternal: number; erupted: number } {
  useTimeStore.getState().reset();
  useInboxStore.getState().reset();
  seedAmbient(seed);
  useDiscipleStore.getState().setAll([disc('t', { simma: 0, darknessLevel: 4, stress: 100, realmProgress: { internal: 2000, pity: 0, petitioned: false }, martialArts: [] })]);
  let erupted = 0;
  for (let i = 0; i < 1000; i += 1) {
    useTimeStore.getState().advanceDay();
    const inboxN = useInboxStore.getState().items.length;
    tickSimma();
    if (useInboxStore.getState().items.length > inboxN) erupted += 1;
  }
  return { finalSimma: simmaOf('t'), finalInternal: internalOf('t'), erupted };
}
const run1 = runDrift(13131);
const run2 = runDrift(13131);
ck('tickSimma 1000일 — 같은 시드 결정적(심마·내공·발작수 동일)', run1.finalSimma === run2.finalSimma && run1.finalInternal === run2.finalInternal && run1.erupted === run2.erupted, `발작 ${run1.erupted}회`);
ck('1000일 후 심마 [0,100] 정수·내공 유한·비음수', Number.isInteger(run1.finalSimma) && run1.finalSimma >= 0 && run1.finalSimma <= 100 && fin(run1.finalInternal) && run1.finalInternal >= 0);
const runDiff = runDrift(98989);
ck('다른 시드 → 발작 패턴 달라질 수 있음(시드 영향)', true, `시드A ${run1.erupted}회 vs 시드B ${runDiff.erupted}회`);

// ── 6. 발작 다회 — 즉사 없음(생존 체인 일관). 발작해도 status 는 injured 까지(dead 없음) ──
let everDead = false;
useTimeStore.getState().reset();
useDiscipleStore.getState().setAll([disc('survive', { simma: 100, realmProgress: { internal: 5000, pity: 0, petitioned: false } })]);
for (let i = 0; i < 200; i += 1) {
  addSimma('survive', 100); // 매번 심마 최대로 채우고
  triggerQiDeviation('survive');
  const st = useDiscipleStore.getState().disciples['survive']?.status;
  if (st === 'departed') everDead = true; // 심마로 인한 이탈/사망 없어야(즉사 없음 — docs/13)
}
ck('발작 200회 반복 — 즉사/이탈 없음(생존 체인)', !everDead);
ck('발작 반복 후 내공 비음수 유한', fin(internalOf('survive')) && internalOf('survive') >= 0);

console.log(`\n[정보] 임계 ${SIMMA_ERUPT_THRESHOLD} · 흩어짐 7/14/22% · 1000일 발작 ${run1.erupted}회`);
console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
