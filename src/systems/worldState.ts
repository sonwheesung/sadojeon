// 강호 정세 상태 조작 헬퍼 — 순수 함수(WorldState 변형). 엔진·사건 레지스트리 공용(순환 import 방지).
// 세력치/긴장 가감은 전부 여기로 — 정통 보호(floor)·클램프를 한 곳에서 보장.

import {
  BLOC_DEF,
  RIVALRIES,
  STANCE_RANK,
  blocPairKey,
  tensionToStance,
} from '@/data/worldPowers';
import type { Stance, WorldBloc, WorldState } from '@/types/world';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 세력치 가감 — volatility 배율로 진폭 차등(사파·마교가 더 출렁), 하한 floor(정통은 높아 멸문 불가)·상한 100.
export function addPower(s: WorldState, bloc: WorldBloc, delta: number): void {
  const def = BLOC_DEF[bloc];
  s.powers[bloc].power = clamp(s.powers[bloc].power + delta * def.volatility, def.floor, 100);
}

// 라이벌 쌍 긴장 가감 0~100.
export function addTension(s: WorldState, a: WorldBloc, b: WorldBloc, delta: number): void {
  const key = blocPairKey(a, b);
  s.tensions[key] = clamp((s.tensions[key] ?? 0) + delta, 0, 100);
}

export function getTension(s: WorldState, a: WorldBloc, b: WorldBloc): number {
  return s.tensions[blocPairKey(a, b)] ?? 0;
}

// 각 세력 기조 재계산 — 자기가 낀 라이벌 쌍 중 최고 긴장의 기조.
export function recomputeStances(s: WorldState): void {
  for (const bloc of Object.keys(s.powers) as WorldBloc[]) {
    let best: Stance = 'calm';
    for (const r of RIVALRIES) {
      const other = r.a === bloc ? r.b : r.b === bloc ? r.a : null;
      if (!other) continue;
      const st = tensionToStance(getTension(s, bloc, other));
      if (STANCE_RANK[st] > STANCE_RANK[best]) best = st;
    }
    s.powers[bloc].stance = best;
  }
}

// 한 세력이 다른 세력보다 얼마나 강한가 0~1 (사건 승패 가중).
export function powerEdge(s: WorldState, strong: WorldBloc, weak: WorldBloc): number {
  const p = s.powers[strong].power;
  const q = s.powers[weak].power;
  return clamp((p - q) / 100 + 0.5, 0, 1);
}
