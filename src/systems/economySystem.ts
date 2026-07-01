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
// 계수 37 = 경계선 시뮬(docs/09, 2026-06~07 n=20)에서 확정한 "인플레↔빈곤" 균형값(구 25의 ×1.5).
// 연단실(-100/월) 운영 사문의 명성50에서 곳간이 거의 평평(엣지 검증 2026-07-01). patronageMult는 시뮬 레버.
export function monthlyPatronage(reputation: number): number {
  return Math.floor(reputation / 10) * 37 * patronageMult; // rep10→37, rep50→185, rep90→333
}

// 파산 단계 — 곳간 절대값으로 판정. resources 는 0에서 멈추므로(Math.max(0,…)) 단계는 잔고로만. docs/09.
export type BankruptcyTier = 'ok' | 'low' | 'poor' | 'broke';
export function bankruptcyTier(resources: number): BankruptcyTier {
  if (resources <= 0) return 'broke'; // 파산 — 식비 미납월
  if (resources < 200) return 'poor'; // 빈곤
  if (resources < 800) return 'low'; // 부족 — 경고만, 페널티 없음
  return 'ok'; // 여유
}

// 파산 페널티 — "굶주림은 힘이 아니라 마음을 친다"(docs/09). 수련 효율은 안 깎는다
// (의뢰 수입이 제자 실력에 연동 → 수련 malus 면 죽음의 나선). 스트레스·사부신뢰(trustToMaster)에만.
// 제자를 사문에서 빼지 않는다(중도 자발 하산 미구현 — docs/03). 신뢰 하락은 흑화 압력·양육 등급·
// (후속) 가출 시스템의 입력이 될 뿐. 회차 종결은 정상 하산·전원 사망으로만.
function applyBankruptcyPenalties(resources: number): void {
  const sect = useSectStore.getState();
  const s = sect.sect;
  if (!s) return;
  const tier = bankruptcyTier(resources);
  const prevStreak = s.bankruptStreak ?? 0;
  const streak = tier === 'broke' ? prevStreak + 1 : 0;
  if (streak !== prevStreak) sect.update({ bankruptStreak: streak });
  if (tier === 'ok' || tier === 'low') return; // 여유·부족 = 페널티 없음(부족은 경고 서신 — 후속)

  const ds = useDiscipleStore.getState();
  const activeIds = ds.order.filter((id) => {
    const d = ds.disciples[id];
    return d != null && d.status !== 'graduated' && d.status !== 'departed';
  });
  if (tier === 'poor') {
    for (const id of activeIds) ds.adjustStress(id, 2); // 빈곤 — 영양 부실 불안
  } else if (tier === 'broke') {
    for (const id of activeIds) {
      ds.adjustStress(id, 4);
      ds.adjustTrust(id, -2); // 제 한 몸 못 먹이는 사부 — 믿음 균열
    }
    if (streak >= 3) {
      for (const id of activeIds) ds.adjustTrust(id, -2); // 장기파산 — 신뢰 추가 붕괴
      sect.adjustReputation(-5); // 강호가 "그 사문은 끝났다" 수군
    }
  }
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

  // 4) 파산 단계 페널티 — 월말 잔고로 판정(스트레스·신뢰만, 제자 이탈 없음). docs/09.
  applyBankruptcyPenalties(useSectStore.getState().sect?.resources ?? 0);
}
