// 4층 효과 → 사용자에게 보여줄 한 줄 풍경 텍스트.
// 의미 있는 변화 1~3줄만 추출. 절댓값 큰 효과 우선.
// 정확한 수치는 비공개 (메모리 룰 feedback_hidden_game_state).

import type { EventEffects } from '@/types';

interface WeightedLine {
  text: string;
  weight: number;
}

export function summarizeEffects(
  effects: EventEffects,
  perpName: string,
): string[] {
  const lines: WeightedLine[] = [];

  // 가해자 효과 ────────────────────────────────────────────────
  if (effects.perpetrator) {
    const p = effects.perpetrator;
    if (p.trustDelta && p.trustDelta !== 0) {
      lines.push({
        text:
          p.trustDelta > 0
            ? `${perpName}의 마음이 사부에게 한 걸음 닿았다.`
            : `${perpName}의 신뢰가 흔들렸다.`,
        weight: Math.abs(p.trustDelta),
      });
    }
    if (p.darknessLevelBump && p.darknessLevelBump > 0) {
      lines.push({
        text: `${perpName}이 어둠으로 한 걸음 더 들어섰다.`,
        weight: 100,
      });
    }
    if (p.darknessRiskBump && p.darknessRiskBump > 0) {
      lines.push({
        text: `${perpName}의 마음에 어두운 결이 짙어진다.`,
        weight: 40,
      });
    }
    if (p.staminaDelta && p.staminaDelta < 0) {
      lines.push({
        text: `${perpName}의 기색이 가라앉았다.`,
        weight: Math.abs(p.staminaDelta),
      });
    }
  }

  // 사문 분위기 ───────────────────────────────────────────────
  if (effects.atmosphere) {
    const a = effects.atmosphere;
    if (a.righteousnessDelta) {
      lines.push({
        text:
          a.righteousnessDelta > 0
            ? '사문에 도의의 결이 한결 짙어졌다.'
            : '사문에 무도의 그림자가 졌다.',
        weight: Math.abs(a.righteousnessDelta) * 10,
      });
    }
    if (a.unityDelta) {
      lines.push({
        text:
          a.unityDelta > 0
            ? '사문의 결속이 단단해졌다.'
            : '사문에 균열의 기색이 비쳤다.',
        weight: Math.abs(a.unityDelta) * 10,
      });
    }
  }

  // 사부 효과 ────────────────────────────────────────────────
  if (effects.master) {
    const m = effects.master;
    if (m.insightDelta && m.insightDelta > 0) {
      lines.push({
        text: '사부의 통찰이 한 걸음 깊어졌다.',
        weight: m.insightDelta * 5,
      });
    }
    if (m.authorityDelta) {
      lines.push({
        text:
          m.authorityDelta > 0
            ? '사부의 위엄이 무거워졌다.'
            : '사부의 위엄이 흔들렸다.',
        weight: Math.abs(m.authorityDelta) * 5,
      });
    }
    if (m.reputationDelta) {
      lines.push({
        text:
          m.reputationDelta > 0
            ? '강호에 사부 평판의 결이 짙어졌다.'
            : '강호에 사부 평판이 흐려졌다.',
        weight: Math.abs(m.reputationDelta) * 3,
      });
    }
  }

  // cascade 는 다양한 제자에 흩어져 적용되므로 한 줄 요약하기 어려움.
  // 변화 있을 때만 일반 한 줄.
  if (effects.cascade && effects.cascade.length > 0) {
    lines.push({
      text: '다른 제자들의 시선도 함께 흔들렸다.',
      weight: 8,
    });
  }

  if (lines.length === 0) {
    return ['사문은 조용히 그날을 보냈다.'];
  }

  lines.sort((a, b) => b.weight - a.weight);
  return lines.slice(0, 3).map((l) => l.text);
}
