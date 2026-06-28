// 자금(사문 자금·골드) 표기 — 내부 단위는 동(copper). 1금=1000동, 1은=100동.
// 화면 어디서나 같은 표기를 쓰도록 공용화([feedback_componentize_aggressively]).
export function coin(copper: number): string {
  const g = Math.floor(copper / 1000);
  const s = Math.floor((copper - g * 1000) / 100);
  const c = copper - g * 1000 - s * 100;
  return [g ? `${g}금` : '', s ? `${s}은` : '', c || (!g && !s) ? `${c}동` : ''].filter(Boolean).join(' ');
}
