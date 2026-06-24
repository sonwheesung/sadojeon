// 심마(心魔)·주화입마(走火入魔) — 무리한 수련의 대가. docs/04 §4-1·13·26 §5-3.
// 심마 = 숨은 정신압 게이지(0~100, UI 비노출 — 흑화·스트레스처럼 관찰 가능한 신호로만 드러난다).
//   누적원: 지속 고스트레스 · 흑화 깊이 · 마도/사도 무공 깊이 · 상극 속성 내공 흡수(이질적 진기 강제) ·
//           무리한 돌파(폐관) 실패. 안정 시(저스트레스·휴식) 서서히 가라앉는다.
// 주화입마 = 심마가 임계를 넘으면 터지는 발작 — 내상(wound 'inner')·내공 흩어짐(진척 손실)·스트레스/흑화 급증.
//   **즉사 없음**(생존 체인과 일관) — 깊은 내상으로 몸져눕되 죽지는 않는다. 안신단(mind 영약)으로 진정.

import { random } from '@/systems/rng';
import { findMartialArt } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types/disciple';
import { consumeElixirItem, elixirItemCount } from './alchemySystem';
import { clearWoundType, inflictWound } from './woundSystem';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 발작 임계 — 이 이상에서 매일 낮은 확률로 주화입마를 굴린다.
export const SIMMA_ERUPT_THRESHOLD = 60;
// 발작 일일 확률 — 임계(60) 초과분 비례, 상한 0.05. 단일 소스(시뮬·문서가 베끼지 않게 export). docs/13.
export function eruptionChance(simma: number): number {
  return clamp((simma - SIMMA_ERUPT_THRESHOLD) / 40, 0, 1) * 0.05;
}
// 불안정 신호 임계 — 이 이상이면 "불안정한 기색"이 관찰되고(discipleMoodSystem), 발작 전 예방용
// 안신단을 쓸 수 있다(docs/37 R20). 발작 임계(60)보다 살짝 낮아 경고 → 대처 창을 준다.
export const SIMMA_SIGNAL_THRESHOLD = 55;
// 흡공(흡성대법류) 결산 비율 — 실전서 빨아들인 적 내공(drainedQi) 1당 ① 영구 내공 전환분 ② 이종진기
// 충돌 심마 누적분. 흡성대법의 정체성(공력 약탈)을 살리되, 이종진기 대가(심마)로 무한 흡공을 막는다.
// 🔧 그레이박스 기본값 — `combatwiring.ts` 측정 후 조정(docs/37 R36). docs/35 §3-A·13.
export const DRAIN_INTERNAL_RATIO = 0.4;
export const DRAIN_SIMMA_RATIO = 0.3;
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

// 흡공(흡성대법류) 결산 — 실전(의뢰 결투·강호출행·습격)에서 전투 엔진이 보고한 `drainedQi`를 받아
// ① 빨아들인 내공을 영구 내공(realmProgress.internal)으로 전환(float 유지) ② 이종진기 충돌로 심마 누적.
// 대련·비무(동문 상대)에선 호출하지 않는다. 승패 무관(빨아들인 만큼). docs/37 R36 · docs/35 §3-A.
export function absorbDrainedQi(discipleId: string, drainedQi: number): void {
  if (!Number.isFinite(drainedQi) || drainedQi <= 0) return;
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  const base = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
  ds.update(discipleId, {
    realmProgress: { ...base, internal: base.internal + drainedQi * DRAIN_INTERNAL_RATIO },
  });
  addSimma(discipleId, drainedQi * DRAIN_SIMMA_RATIO);
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
      const chance = eruptionChance(next);
      if (random() < chance) triggerQiDeviation(id);
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
  if (random() < chance) triggerQiDeviation(discipleId);
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
  // 손실을 반올림하지 않는다 — internal 은 페이싱 정밀도 위해 float 로 누적(매일 round 시 +20% 누수,
  // trainingSystem 주석)인데 발작만 정수 lost 를 빼 미세 오차를 남기던 것 차단(docs/37 R27).
  const lost = base.internal * (SCATTER_PCT[severity] ?? 0.07);
  ds.update(discipleId, {
    realmProgress: { ...base, internal: Math.max(0, base.internal - lost) },
    stress: clamp((d.stress ?? 0) + 18, 0, 100),
    simma: Math.max(0, simma - 40), // 발작으로 일부 방출
  });
  // 내상(inner) — status='injured'+wound. inflictWound 가 더 깊은 쪽 유지.
  inflictWound(discipleId, 'inner', severity, days);

  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `simma-${discipleId}-${day}`, // 이름 아닌 id 로 — 동명 제자·동일 제자 동일 날 충돌·소실 방지(docs/37 형제 사냥)
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
  // 진정할 심마도 내상도 없으면 헛소모 방지 — 소모를 먼저 하고 효과가 없던 R21 차단(서버·헤드리스
  // 우회 호출 대비). UI 는 내상 있을 때만 버튼을 띄우지만 함수 자체도 방어한다. docs/37 R21.
  const simma = d.simma ?? 0;
  const hasInner = (d.wounds ?? []).some((w) => w.type === 'inner');
  if (simma <= 0 && !hasInner) return false;
  if (elixirItemCount(ANSIN_ID) < 1) return false;
  if (!consumeElixirItem(ANSIN_ID, 1)) return false;
  ds.update(discipleId, { simma: Math.max(0, simma - 45) });
  // 내상 회복 — 안신단은 심신을 다스려 주화입마 내상을 가라앉힌다(외상·중독 등 다른 상처엔 안 듣는다).
  // 내상 속성만 제거하고 나머지 상처는 그대로 둔다(clearWoundType 이 status·잔여일 정리).
  clearWoundType(discipleId, 'inner');
  return true;
}

// 불안정(심마 신호 이상)하지만 내상은 아직 없는 사문 내 제자 — 안신단 예방 진정 후보(docs/37 R20).
// 내상 보유자는 상처 치료 경로에서 이미 안신단을 쓸 수 있어 제외. 떠나거나 출행 중인 제자도 제외.
export function listUnstable(): Disciple[] {
  const ds = useDiscipleStore.getState();
  return ds.order
    .map((id) => ds.disciples[id])
    .filter(
      (d): d is Disciple =>
        !!d &&
        (d.simma ?? 0) >= SIMMA_SIGNAL_THRESHOLD &&
        !(d.wounds ?? []).some((w) => w.type === 'inner') &&
        d.status !== 'graduated' &&
        d.status !== 'departed' &&
        d.status !== 'questing',
    );
}

export function hasAnsinElixir(): boolean {
  return elixirItemCount(ANSIN_ID) > 0;
}
