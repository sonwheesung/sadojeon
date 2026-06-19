// 사문 경제 — 월간 수지. docs/11 BM · docs/16.
// 지출: 제자 식비(1명당 월납) + 연단실 등 공방 유지비(미납 시 가동중지).
// 수입: 의뢰 보상(questSystem) + 후원금(사문 명성 비례). 영단 판매(alchemySystem.sellElixir)는 별도.
// 매월(월 시작) timeSystem 에서 tickMonthlyEconomy 호출.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useSectStore } from '@/stores/sectStore';
import { hasAlchemyLab, setLabOperational } from './alchemySystem';

// 밸런스 레버 — 런타임 조정 가능(시뮬 그리드). 기본값은 docs/11.
let foodCost = 20; // 제자 1명 월 식비(동) — 금전 압박 완화(기존 60에서 하향)
let labUpkeep = 100; // 연단실 월 유지비(동) — 기존 200에서 하향(자립 가능 구간)
let patronageMult = 1; // 후원금 배수
export function setFoodCost(n: number): void {
  foodCost = n;
}
export function setLabUpkeep(n: number): void {
  labUpkeep = n;
}
export function setPatronageMult(n: number): void {
  patronageMult = n;
}
export const FOOD_COST_PER_DISCIPLE = 20; // (기본 참고값)

// 식비는 인원에 비선형 — 큰 사문일수록 1인당 조달·관리 부담이 커진다(docs/11 경제압박).
// 정원 4명 기준 캘리브레이션: 1명 20 · 2명 43 · 3명 70 · 4명 99(만석 ≈ 1명의 5배 = "대식구 압박").
// k=0.08 → 인원이 한 명 늘 때마다 1인당 식비 +8%p. foodCost 레버가 전체를 그대로 비례 조정.
const FOOD_SCALE_PER_EXTRA = 0.08;
export function monthlyFoodCost(mouths: number): number {
  if (mouths <= 0) return 0;
  return Math.round(mouths * foodCost * (1 + FOOD_SCALE_PER_EXTRA * (mouths - 1)));
}

// 후원금 — 사문 명성(reputation 0~100)에 비례. 명망 높을수록 후원 세력이 늘어 더 받는다.
export function monthlyPatronage(reputation: number): number {
  return Math.floor(reputation / 10) * 25 * patronageMult; // rep10→25, rep50→125, rep90→225
}

// 매월 수지 처리. 식비·후원 반영 후, 연단실 유지비 납부(자금 부족이면 비가동).
export function tickMonthlyEconomy(): void {
  const sect = useSectStore.getState();
  if (!sect.sect) return;

  // 1) 식비 — 활동 제자(졸업·하산 제외) 머릿수.
  const ds = useDiscipleStore.getState();
  const mouths = ds.order
    .map((id) => ds.disciples[id])
    .filter((d) => d && d.status !== 'graduated' && d.status !== 'departed').length;
  if (mouths > 0) sect.adjustResources(-monthlyFoodCost(mouths));

  // 2) 후원금 — 명성 비례 수입.
  const rep = useSectStore.getState().sect?.reputation ?? 0;
  const patronage = monthlyPatronage(rep);
  if (patronage > 0) sect.adjustResources(patronage);

  // 3) 연단실 유지비 — 납부 가능하면 차감·가동, 부족하면 비가동(낼 때까지 제조 불가).
  if (hasAlchemyLab()) {
    const cur = useSectStore.getState().sect?.resources ?? 0;
    if (cur >= labUpkeep) {
      sect.adjustResources(-labUpkeep);
      setLabOperational(true);
    } else {
      setLabOperational(false);
    }
  }
}
