// 심마(心魔)·주화입마(走火入魔) — 무리한 수련의 대가. docs/04 §4-1·13·26 §5-3.
// 심마 = 숨은 정신압 게이지(0~100, UI 비노출 — 흑화·스트레스처럼 관찰 가능한 신호로만 드러난다).
//   누적원: 지속 고스트레스 · 흑화 깊이 · 마도/사도 무공 깊이 · 상극 속성 내공 흡수(이질적 진기 강제) ·
//           무리한 돌파(폐관) 실패. 안정 시(저스트레스·휴식) 서서히 가라앉는다.
// 주화입마 = 심마가 임계를 넘으면 터지는 발작 — 내상(wound 'inner')·내공 흩어짐(진척 손실)·스트레스/흑화 급증.
//   **즉사 없음**(생존 체인과 일관) — 깊은 내상으로 몸져눕되 죽지는 않는다. 안신단(mind 영약)으로 진정.

import { findMartialArt } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types/disciple';
import { consumeElixirItem, elixirItemCount } from './alchemySystem';
import { inflictWound } from './woundSystem';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 발작 임계 — 이 이상에서 매일 낮은 확률로 주화입마를 굴린다.
export const SIMMA_ERUPT_THRESHOLD = 60;
const ANSIN_ID = 'ansin';

export function getSimma(d: Disciple): number {
  return d.simma ?? 0;
}

// 심마 가감 — 0~100 클램프. 누적원 훅들이 호출.
export function addSimma(discipleId: string, amount: number): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  const next = clamp(Math.round((d.simma ?? 0) + amount), 0, 100);
  if (next !== (d.simma ?? 0)) ds.update(discipleId, { simma: next });
}

// 하루치 심마 드리프트(누적 − 진정) + 발작 굴림. 흑화 진행과 같은 결(triggerPostSettlement)에서 호출.
export function tickSimma(): void {
  const ds = useDiscipleStore.getState();
  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || d.status === 'graduated' || d.status === 'departed') continue;

    let drift = 0;
    // 지속 고스트레스 — 50 초과분이 마음을 갉는다.
    if ((d.stress ?? 0) > 50) drift += ((d.stress ?? 0) - 50) * 0.08;
    // 흑화 깊이 — 어두울수록 마가 낀다(상호 강화).
    drift += d.darknessLevel * 0.5;
    // 마도/사도 무공 — 익히고 깊을수록 심법이 마음을 잠식.
    for (const a of d.martialArts) {
      const path = findMartialArt(a.artId)?.path;
      if (path === 'ma') drift += 0.6 + a.seong * 0.12;
      else if (path === 'sa') drift += 0.3 + a.seong * 0.05;
    }
    // 상극 속성 내공 흡수 중 — 이질적 진기를 억지로 받아들이는 동안 마가 쌓인다.
    if (d.elixirAbsorb?.attribute && d.qiAttribute && d.elixirAbsorb.attribute !== d.qiAttribute) {
      drift += 1.2;
    }
    // 안정 — 스트레스 낮고 평온히 지내면 서서히 가라앉는다.
    if ((d.stress ?? 0) < 30 && !d.elixirAbsorb) drift -= 1.5;

    const cur = d.simma ?? 0;
    const next = clamp(Math.round(cur + drift), 0, 100);
    if (next !== cur) ds.update(id, { simma: next });

    // 발작 굴림 — 임계 초과분에 비례한 낮은 일일 확률.
    if (next >= SIMMA_ERUPT_THRESHOLD) {
      const chance = clamp((next - SIMMA_ERUPT_THRESHOLD) / 40, 0, 1) * 0.05;
      if (Math.random() < chance) triggerQiDeviation(id);
    }
  }
}

// 무리한 폐관 돌파 실패 — 강행이 진기를 흩뜨린다. 심마 급증 + 즉석 발작 굴림(임계보다 낮은 문턱).
export function onForcedBreakthroughFail(discipleId: string): void {
  addSimma(discipleId, 14);
  const d = useDiscipleStore.getState().disciples[discipleId];
  if (!d) return;
  const simma = d.simma ?? 0;
  const chance = clamp((simma - 40) / 40, 0, 1) * 0.18;
  if (Math.random() < chance) triggerQiDeviation(discipleId);
}

const SIMMA_SEVERITY = (simma: number): number => (simma >= 88 ? 2 : simma >= 72 ? 3 : 4);
const SEVERITY_DAYS: Record<number, number> = { 2: 24, 3: 16, 4: 10 };
const SCATTER_PCT: Record<number, number> = { 2: 0.22, 3: 0.14, 4: 0.07 };

// 주화입마 발작 — 내상 + 내공 흩어짐 + 스트레스 급증. 발작 후 심마는 일부 방출(가라앉음). 서신함 통지.
export function triggerQiDeviation(discipleId: string, severityOverride?: number): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;
  const simma = d.simma ?? 0;
  const severity = severityOverride ?? SIMMA_SEVERITY(simma);
  const days = SEVERITY_DAYS[severity] ?? 10;

  // 내공 흩어짐 — 쌓은 진기 일부가 역류해 흩어진다(진척 손실).
  const base = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
  const lost = Math.round(base.internal * (SCATTER_PCT[severity] ?? 0.07));
  ds.update(discipleId, {
    realmProgress: { ...base, internal: Math.max(0, base.internal - lost) },
    stress: clamp((d.stress ?? 0) + 18, 0, 100),
    simma: Math.max(0, simma - 40), // 발작으로 일부 방출
  });
  // 내상(inner) — status='injured'+wound. inflictWound 가 더 깊은 쪽 유지.
  inflictWound(discipleId, 'inner', severity, days);

  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `simma-${d.name}-${day}`,
    kind: 'report',
    title: `${d.name} — 주화입마`,
    preview: `${d.name}이(가) 수련 중 진기가 역류해 쓰러졌다.`,
    body: `${d.name}이(가) 운기 중 진기가 거꾸로 흘러 주화입마에 들었다. 내상을 입고 쌓은 내공의 일부가 흩어졌다. 안신단으로 심신을 다스리거나, 시일을 두고 자연히 가라앉기를 기다려야 한다.`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
  return true;
}

// 안신단(mind 영약) 복용 — 심마를 크게 가라앉히고, 내상(주화입마 후유)을 진정시켜 회복.
// 보유 1과 소모. 성공 시 true.
export function consumeAnsinElixir(discipleId: string): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;
  if (elixirItemCount(ANSIN_ID) < 1) return false;
  if (!consumeElixirItem(ANSIN_ID, 1)) return false;
  const patch: Partial<Disciple> = { simma: Math.max(0, (d.simma ?? 0) - 45) };
  // 내상 회복 — 안신단은 심신을 다스려 주화입마 내상을 가라앉힌다(외상엔 안 듣는다).
  if (d.wound?.type === 'inner') {
    patch.status = 'training';
    patch.wound = undefined;
    patch.injuryDaysRemaining = 0;
  }
  ds.update(discipleId, patch);
  return true;
}

export function hasAnsinElixir(): boolean {
  return elixirItemCount(ANSIN_ID) > 0;
}
