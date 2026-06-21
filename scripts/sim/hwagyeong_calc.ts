// 화경 도달 확률 — 해석적 계산기(노이즈 0·분석 도구, 회귀 가드 아님). docs/23 화경 밸런스 · docs/40 §1.
// "화경 갔나?"(됨/안됨)는 동전던지기라 n=6 sim 이면 ±40%p 로 튄다(측정 불가). 대신 화경을 만드는
// **재료(대오 확률·시도 횟수·영약 공급)**를 공식에 넣어 확률을 *계산*한다 — 즉시·노이즈 0. 손잡이가
// 화경을 얼마나 움직이는지 바로 보인다. 대오 확률은 엔진 함수(greatEnlightenmentChance)를 직접 import =
// 단일 소스(재구현 X). ⚠️ 근사: 시도 횟수·영약 공급은 sim 진단서 뽑은 *평균값* 가정(정밀은 large-N 검산).
// 실행: npx tsx scripts/sim/hwagyeong_calc.ts
import { greatEnlightenmentChance } from '../../src/data/realm';

// ── 파라미터 (그레이박스 — sim 진단/코드 상수서 추정. env 로 조정: INSIGHT·EXTREME·SECLUDE·DROP·BEAST·HERB) ──
const P = {
  insight: Number(process.env.INSIGHT ?? 4), // 카리 오성(대오 확률 ↑)
  extremeQuests: Number(process.env.EXTREME ?? 40), // 15년간 위험+극험 의뢰 수 = 실전 대오 굴림 횟수
  secludeDays: Number(process.env.SECLUDE ?? 300), // 화경 벽 도달 후 폐관 일수 = 폐관 대오 굴림 횟수
  dropRate: Number(process.env.DROP ?? 0.08), // 극험 의뢰 구전대환단 드랍률
  beastPerRun: Number(process.env.BEAST ?? 0.5), // 영물 정수 회차 획득(영물전 승률 ~50%·캡1)
  herbPerRun: Number(process.env.HERB ?? 1), // 신품 영초 회차 획득(채집·캡2 중 평균)
  recipeBeast: 1, // 구전대환단 영물정수 요구
  recipeHerb: 2, // 구전대환단 신품영초 요구
  boneRebirth: 0.95, // 환골탈태 성공(심마 낮으면 ≈0.95)
};

// 대오 per-roll (엔진 단일 소스).
const qQuest = greatEnlightenmentChance(P.insight, 'quest'); // 실전(위험·극험) 1회당
const qSeclude = greatEnlightenmentChance(P.insight, 'seclude'); // 폐관 1일당

// 화경 확률 계산 — 주어진 손잡이값으로.
function pHwagyeong(drop: number, extreme: number, seclude: number, beast: number, herb: number): {
  yeondan: number; supply: number; pElixir: number; pDaeoh: number; p: number;
} {
  // 연단 구전대환단/회차 = 더 부족한 재료가 결정(영물정수/요구, 식물/요구 중 min).
  const yeondan = Math.min(beast / P.recipeBeast, herb / P.recipeHerb);
  // 영약 총 공급(이 화경 창에서) = 연단 + 드랍.
  const supply = yeondan + drop * extreme;
  // 영약 보유 확률 — 공급 1+면 사실상 보유, 그 미만이면 비례(근사).
  const pElixir = Math.min(1, supply);
  // 대오 한 번이라도 성공 = 1 − (전부 실패). 실전·폐관 독립.
  const pDaeoh = 1 - Math.pow(1 - qQuest, extreme) * Math.pow(1 - qSeclude, seclude);
  // 화경 = 영약 보유 × 대오 성공 × 환골탈태.
  const p = pElixir * pDaeoh * P.boneRebirth;
  return { yeondan, supply, pElixir, pDaeoh, p };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log('═══ 화경 도달 확률 — 해석적 계산기 ═══\n');
console.log(`파라미터: 오성${P.insight} · 극험의뢰 ${P.extremeQuests}회 · 폐관 ${P.secludeDays}일 · 드랍 ${pct(P.dropRate)} · 영물정수 ${P.beastPerRun}/회차 · 신품영초 ${P.herbPerRun}/회차`);
console.log(`대오 확률(엔진): 실전 1회 ${pct(qQuest)} · 폐관 1일 ${pct(qSeclude)}\n`);

const base = pHwagyeong(P.dropRate, P.extremeQuests, P.secludeDays, P.beastPerRun, P.herbPerRun);
console.log('── 현재값 분해 ──');
console.log(`연단 구전대환단/회차: ${base.yeondan.toFixed(2)} · 영약 총공급: ${base.supply.toFixed(2)} → 보유확률 ${pct(base.pElixir)}`);
console.log(`대오(한 번이라도 깨달음): ${pct(base.pDaeoh)}`);
console.log(`▶ 화경 도달 확률 = ${pct(base.p)}\n`);

// ── 손잡이 sweep — ≤20% 지점 찾기 ──
console.log('── 손잡이별 화경 확률 (≤20% 목표) ──');
console.log('[A] 실전 대오 확률 배율(대오 자체를 조이면):');
for (const scale of [1, 0.7, 0.5, 0.35, 0.25]) {
  const qScaledExtreme = Math.round((1 - Math.pow(1 - qQuest * scale, P.extremeQuests)) * 1000) / 1000;
  const pDaeoh = 1 - Math.pow(1 - qQuest * scale, P.extremeQuests) * Math.pow(1 - qSeclude, P.secludeDays);
  const p = Math.min(1, base.supply) * pDaeoh * P.boneRebirth;
  console.log(`   대오×${scale} (실전 1회 ${pct(qQuest * scale)}) → 화경 ${pct(p)}${p <= 0.2 ? '  ✅≤20%' : ''}`);
}
console.log('[B] 극험 의뢰 횟수(실전 노출을 줄이면):');
for (const ex of [40, 25, 15, 10, 6]) {
  const r = pHwagyeong(P.dropRate, ex, P.secludeDays, P.beastPerRun, P.herbPerRun);
  console.log(`   극험 ${ex}회 → 화경 ${pct(r.p)}${r.p <= 0.2 ? '  ✅≤20%' : ''}`);
}
console.log('[C] 영물 정수 획득률(영약 공급 = 게이트):');
for (const b of [0.5, 0.3, 0.2, 0.1, 0.05]) {
  const r = pHwagyeong(P.dropRate, P.extremeQuests, P.secludeDays, b, P.herbPerRun);
  console.log(`   영물정수 ${b}/회차 (공급 ${r.supply.toFixed(2)}·보유 ${pct(r.pElixir)}) → 화경 ${pct(r.p)}${r.p <= 0.2 ? '  ✅≤20%' : ''}`);
}
console.log('[D] 드랍률(영약 공급 보조):');
for (const dr of [0.08, 0.04, 0.02, 0.01, 0]) {
  const r = pHwagyeong(dr, P.extremeQuests, P.secludeDays, P.beastPerRun, P.herbPerRun);
  console.log(`   드랍 ${pct(dr)} (공급 ${r.supply.toFixed(2)}) → 화경 ${pct(r.p)}${r.p <= 0.2 ? '  ✅≤20%' : ''}`);
}
