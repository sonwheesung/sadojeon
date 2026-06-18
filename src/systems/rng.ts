// 결정적 시드 PRNG — 서버 권위 아키텍처(docs/31 §3)의 토대.
// "Math.random 시드화" — 게임의 모든 무작위가 **시드 하나로 재현**된다. 서버가 시드를 소유하면
// 세이브 스커밍(같은 결과 재시도)이 봉쇄되고, 헤드리스 검증이 결정적 회귀가 된다.
//
// 두 가지 사용 형태:
//  ① **명시 주입**(순수) — `tickWorldState(state, rng)` 처럼 rng 를 인자로 받는다(worldSystem 선례, 권장).
//  ② **앰비언트**(과도기) — 전역 스토어를 쓰는 기존 시스템이 함수 시그니처를 안 바꾸고 `random()` 으로
//     `Math.random()` 을 대체. 앰비언트는 advanceTurn/Edge Function 경계에서 시드·저장된다(0b에서 점진적으로
//     ①로 이관). 명시 시드가 없으면 엔트로피로 자동 시드 → 앱·통계 시뮬은 종전처럼 무작위(동작 불변).

export type Rng = () => number; // [0, 1)

// mulberry32 — 빠르고 통계 품질 충분한 32비트 PRNG. 상태 = 32비트 정수 하나(a).
// worldSystem 시뮬(scripts/sim/world.ts)이 쓰던 것과 동일 알고리즘 — 정본화.
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── 명시 주입용 헬퍼 (rng 를 받아 정수·확률·추첨) ───────────────────────────
export function intBelow(rng: Rng, n: number): number {
  return Math.floor(rng() * n); //         0 .. n-1
}
export function inRange(rng: Rng, lo: number, hi: number): number {
  return lo + rng() * (hi - lo); //        [lo, hi)
}
export function rollChance(rng: Rng, p: number): boolean {
  return rng() < p;
}
export function pickOne<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
// 가중 추첨 — weightFn 비례. 합이 0이면 첫 원소.
export function weightedPick<T>(rng: Rng, items: readonly T[], weightFn: (x: T) => number): T {
  const total = items.reduce((s, x) => s + Math.max(0, weightFn(x)), 0);
  if (total <= 0) return items[0];
  let r = rng() * total;
  for (const x of items) {
    r -= Math.max(0, weightFn(x));
    if (r <= 0) return x;
  }
  return items[items.length - 1];
}

// ─── 앰비언트 인스턴스 (Math.random 대체) ────────────────────────────────────
// 전역 mulberry32 상태. 명시 시드 전엔 lazy 엔트로피 시드(앱·시뮬 무작위 유지).
let ambientState = 0;
let ambientSeeded = false;
let entropyCounter = 0;

// 엔트로피 시드 1점 — 비결정 시드가 필요한 유일한 곳(앰비언트 자동시드·로컬 어댑터 newRun).
// Math.random 미사용(시드화 목적과 충돌 방지). 시각 + 단조 카운터 혼합. 서버는 자체 crypto 시드.
export function freshSeed(): number {
  const t = Date.now();
  return (t ^ (t >>> 11) ^ (entropyCounter++ * 0x9e3779b1)) >>> 0;
}

function ensureSeeded(): void {
  if (ambientSeeded) return;
  ambientState = freshSeed();
  ambientSeeded = true;
}

// 앰비언트를 명시 시드로 재설정 — 서버(Edge Function 진입)·테스트·시뮬 회차별 재현용.
export function seedAmbient(seed: number): void {
  ambientState = seed >>> 0;
  ambientSeeded = true;
}

// 현재 앰비언트 상태(32비트) — 턴 경계에서 영속/전송용(시드 전진 저장 → 세이브 스커밍 봉쇄).
export function ambientCursor(): number {
  ensureSeeded();
  return ambientState >>> 0;
}

// 저장된 상태로 앰비언트 복원 — 로드/재진입 시.
export function restoreAmbient(state: number): void {
  seedAmbient(state);
}

// Math.random 드롭인 대체 — [0,1). 호출마다 앰비언트 상태 전진.
export function random(): number {
  ensureSeeded();
  ambientState = (ambientState + 0x6d2b79f5) | 0;
  let t = Math.imul(ambientState ^ (ambientState >>> 15), 1 | ambientState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// 앰비언트 편의 헬퍼 — 명시 헬퍼의 앰비언트판.
export function randomInt(n: number): number {
  return Math.floor(random() * n);
}
export function randomRange(lo: number, hi: number): number {
  return lo + random() * (hi - lo);
}
export function randomChance(p: number): boolean {
  return random() < p;
}
export function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)];
}
