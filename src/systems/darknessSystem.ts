// 흑화 자율 진행 — docs/13. 수동 범프(면담·도덕) 외에, 상태가 어두우면 스스로 깊어진다.
// 압력 점수 = 스트레스 + 낮은 자비/강직 + 무도(−)한 사문 분위기 + 현재 단계 + 과한 야망.
// 위험도(risk)는 매주 갱신(흑화 면담·이벤트 게이트 구동), 단계(level)는 압력 높을 때만 천천히.
// 노출은 라벨이 아니라 관찰 가능한 풍문으로(feedback_hidden_game_state).

import { random } from '@/systems/rng';
import { findMartialArt } from '@/data/martialArts';
import { reactToSiblingMilestone } from './siblingReactionSystem';
import { applyAlignmentReputation } from './reputationSystem';
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
  // 마공의 대가 — 마도 무공을 익히고 깊을수록 마음이 물든다(주화입마·흑화). docs/26 §5-3.
  for (const a of d.martialArts) {
    if (findMartialArt(a.artId)?.path === 'ma') s += 10 + a.seong;
  }
  return clamp(Math.round(s), 0, 100);
}

function riskOf(score: number): Disciple['darknessRisk'] {
  return score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
}

// 흑화 단일 seam(SOLID) — 모든 흑화 증가(직접 흑화창·도덕 범프·점수경로)는 여기를 거친다. 한 단계 올릴
// 때마다 캐릭터 저항을 확률 게이트: `random() ≥ darknessResist` 일 때만 실제 +1. 저항<1 이라 충분히 거듭하면
// 누구든 흑화(면역 없음), 저항 높을수록 덜·늦게 박힘 = 난이도 차등. delta<0(완화)은 게이트 없이 직접. docs/13.
export function raiseDarkness(d: Pick<Disciple, 'darknessLevel' | 'darknessResist'>, delta: number): DarknessLevel {
  let lv = d.darknessLevel;
  if (delta < 0) return Math.max(0, Math.min(4, lv + delta)) as DarknessLevel;
  const resist = d.darknessResist ?? 0;
  for (let i = 0; i < delta && lv < 4; i += 1) {
    if (random() >= resist) lv += 1;
  }
  return Math.max(0, Math.min(4, lv)) as DarknessLevel;
}

// 갱생 seam — 청정한 양육이 흑화를 되돌린다(raiseDarkness 의 거울). 단계 1~2만 회복, 3~4는 불가역.
// 저항 높을수록 잘 회복: `random() < 0.20 + 0.80×저항`. 즉 darknessResist = "도덕 안정성"(잘 안 물들고 잘 돌아옴).
// 호출측(tickDarkness)이 "지금 양육이 청정한가"(score ≤ 30)를 게이트한다. docs/13 갱생.
export function redeemDarkness(d: Pick<Disciple, 'darknessLevel' | 'darknessResist'>): DarknessLevel {
  if (d.darknessLevel < 1 || d.darknessLevel > 2) return d.darknessLevel; // 0=청정 · 3~4=불가역
  const resist = d.darknessResist ?? 0;
  if (random() < 0.2 + 0.8 * resist) return (d.darknessLevel - 1) as DarknessLevel;
  return d.darknessLevel;
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
    if (rollLevel && score >= 78 && d.darknessLevel < 4 && random() < 0.18) {
      const nl = raiseDarkness(d, 1); // 저항 게이트 통과 시에만 실제 +1
      if (nl > d.darknessLevel) patch.darknessLevel = nl;
    } else if (rollLevel && score <= 30 && d.darknessLevel >= 1 && d.darknessLevel <= 2) {
      // 갱생 — 양육이 청정(점수 낮음)하고 아직 1~2단계면 회복. 3~4는 불가역. docs/13.
      const nl = redeemDarkness(d);
      if (nl < d.darknessLevel) patch.darknessLevel = nl;
    }
    if (Object.keys(patch).length) {
      const raised = patch.darknessLevel != null && patch.darknessLevel > d.darknessLevel;
      ds.update(id, patch);
      if (raised) {
        pushOmen(d.name, patch.darknessLevel as number, day);
        reactToSiblingMilestone(id, 'darkening'); // 동문 불안·경계(원수 제외). docs/12
        // 자율 흑화도 사문 평판·분위기에 파급(이벤트 흑화와 동근 — 정파↓·사문 도의↓). docs/12·gap-hunt 2차
        applyAlignmentReputation(-3, 1, [id]);
        useSectAtmosphereStore.getState().adjust({ righteousness: -1 });
      }
      // 회복(level 감소)은 조용히 — v1 부가 연출 없음(과한 회복 알림 회피). 통찰로 간접 감지.
    }
  }
}
