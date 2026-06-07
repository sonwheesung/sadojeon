// 흑화 자율 진행 — docs/13. 수동 범프(면담·도덕) 외에, 상태가 어두우면 스스로 깊어진다.
// 압력 점수 = 스트레스 + 낮은 자비/강직 + 무도(−)한 사문 분위기 + 현재 단계 + 과한 야망.
// 위험도(risk)는 매주 갱신(흑화 면담·이벤트 게이트 구동), 단계(level)는 압력 높을 때만 천천히.
// 노출은 라벨이 아니라 관찰 가능한 풍문으로(feedback_hidden_game_state).

import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';
import type { DarknessLevel, Disciple } from '@/types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 0~100 흑화 압력.
export function darknessScore(d: Disciple, righteousness: number): number {
  let s = 0;
  s += (d.stress ?? 0) * 0.35; // 스트레스 누적
  s += Math.max(0, 40 - d.personality.mercy) * 0.6; // 자비 낮을수록
  s += Math.max(0, 45 - d.personality.integrity) * 0.4; // 강직 낮을수록
  s += Math.max(0, -righteousness) * 1.2; // 사문이 무도(−)할수록
  s += d.darknessLevel * 8; // 이미 어두우면 가속
  s += Math.max(0, d.personality.ambition - 70) * 0.3; // 과한 야망
  return clamp(Math.round(s), 0, 100);
}

function riskOf(score: number): Disciple['darknessRisk'] {
  return score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
}

const OMEN: Record<number, (name: string) => string> = {
  1: (n) => `${n}의 눈빛이 요즘 부쩍 차갑다는 말이 동문들 사이에 돈다.`,
  2: (n) => `${n}이 홀로 있는 시간이 부쩍 늘었다. 좀처럼 곁을 주지 않는다 한다.`,
  3: (n) => `${n}의 검에 전에 없던 살기가 어린다는 수군거림이 있다.`,
  4: (n) => `${n}이 무언가 돌이키기 어려운 자리까지 가 있는 듯하다.`,
};

function pushOmen(name: string, level: number, day: number): void {
  const line = OMEN[level]?.(name);
  if (!line) return;
  useInboxStore.getState().add({
    id: `darkomen-${name}-${day}-${level}`,
    kind: 'rumor',
    title: `${name} — 사문의 기척`,
    preview: line,
    body: line,
    priority: level >= 3 ? 'high' : 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// 진행 후 호출. risk 는 매번, level 은 주 1회(day%7) 압력 높을 때만 굴린다.
export function tickDarkness(): void {
  const ds = useDiscipleStore.getState();
  const righteousness = useSectAtmosphereStore.getState().atmosphere.righteousness;
  const day = useTimeStore.getState().totalDay;
  const rollLevel = day % 7 === 0;
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status === 'graduated' || d.status === 'departed') continue;
    const score = darknessScore(d, righteousness);
    const patch: Partial<Disciple> = {};
    const risk = riskOf(score);
    if (risk !== d.darknessRisk) patch.darknessRisk = risk;
    if (rollLevel && score >= 78 && d.darknessLevel < 4 && Math.random() < 0.18) {
      patch.darknessLevel = (d.darknessLevel + 1) as DarknessLevel;
    }
    if (Object.keys(patch).length) {
      ds.update(id, patch);
      if (patch.darknessLevel != null) pushOmen(d.name, patch.darknessLevel, day);
    }
  }
}
