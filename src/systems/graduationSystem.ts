// 졸업 평가 — docs/03 "양육 등급 시스템" 6단계.
// 그레이박스 단순화: 무공 단계 + 신뢰 두 축 기반.
// 추후 명성·노선 안정성 도입 시 종합 평가로 확장.

import { findMartialArt, reachableApexGrade, seongToStage } from '@/data/martialArts';
import { JOB_TIER_LABEL } from '@/data/jobs';
import { effectiveRealmCeiling, realmIndex } from '@/data/realm';
import { evaluateJobs, type JobChance } from './jobSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGameStore } from '@/stores/gameStore';
import { useInboxStore } from '@/stores/inboxStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, DiscipleStatus, Milestone } from '@/types';
import { MARTIAL_STAGE_LABEL } from '@/types/martialArt';

// 적합도 확률 → 관찰 풍경(숨겨진 변수 직접 노출 X, feedback_hidden_game_state).
function jobFitPhrase(prob: number): string {
  if (prob >= 0.4) return '천직처럼 보인다';
  if (prob >= 0.25) return '잘 어울린다';
  if (prob >= 0.12) return '무난하다';
  return '쉽지 않은 길';
}

// 하산 시 강호 행로 선택을 서신함 강제 결정으로 띄운다. docs/28 §3 — 사부가 권하고 제자가 따른다.
// 최소조건 충족 직업 풀(jobSystem)을 적합도 순으로, 상위 4개를 선택지로.
function enqueueGraduationChoice(d: Disciple, day: number): void {
  const jobs: JobChance[] = evaluateJobs(d).slice(0, 4);
  if (jobs.length === 0) return; // 한량 등 무조건 후보가 있어 보통 비지 않음.
  const choices = jobs.map((j) => ({
    key: j.job.id,
    label: `${j.job.name} — ${JOB_TIER_LABEL[j.job.tier]} · ${jobFitPhrase(j.prob)}`,
  }));
  useInboxStore.getState().add({
    id: `graduation-${day}-${d.id}`,
    kind: 'event',
    eventId: `graduation-${d.id}`,
    title: `${d.name} — 하산, 어느 길로`,
    preview: `${mainArtSummary(d)}을 이룬 ${d.name}이 강호로 나섭니다.\n사부로서 어느 길을 권하시겠습니까.`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'graduation', discipleId: d.id, choices },
  });
}

export type GraduationGrade =
  | 'failure' //    ☆ 실패
  | 'common' //     ★ 평범
  | 'good' //       ★★ 양호
  | 'excellent' //  ★★★ 우수
  | 'renowned' //   ★★★★ 명사
  | 'legendary'; // ★★★★★ 전설

export const GRADE_STARS: Record<GraduationGrade, number> = {
  failure: 0,
  common: 1,
  good: 2,
  excellent: 3,
  renowned: 4,
  legendary: 5,
};

export const GRADE_LABEL: Record<GraduationGrade, string> = {
  failure: '실패',
  common: '평범',
  good: '양호',
  excellent: '우수',
  renowned: '명사',
  legendary: '전설',
};

// 메인 무공 성(1~10) + 신뢰 (≥60 = 높음) 매트릭스. docs/26.
export function evaluateGraduation(disciple: Disciple): GraduationGrade {
  const main = disciple.mainMartialArtId
    ? disciple.martialArts.find((a) => a.artId === disciple.mainMartialArtId)
    : disciple.martialArts[0];
  if (!main) return 'failure';

  const trustHigh = disciple.trustToMaster >= 60;
  const seong = main.seong;

  if (seong >= 10) return 'legendary'; // 극성
  if (seong >= 8) return 'renowned'; //   대성 상
  if (seong >= 7) return trustHigh ? 'excellent' : 'good'; // 대성 입
  if (seong >= 4) return trustHigh ? 'good' : 'common'; //    소성
  if (seong >= 2) return 'common'; //                        입문 다짐
  return 'failure'; //                                        1성
}

// 메인 무공 한 줄 요약 — run-end 화면용. "청풍검법 대성 8성" 식.
export function mainArtSummary(disciple: Disciple): string {
  const main = disciple.mainMartialArtId
    ? disciple.martialArts.find((a) => a.artId === disciple.mainMartialArtId)
    : disciple.martialArts[0];
  if (!main) return '무공 미입문';
  const art = findMartialArt(main.artId);
  const name = art?.name ?? main.artId;
  const stage = MARTIAL_STAGE_LABEL[seongToStage(main.seong)];
  return `${name} ${stage} ${main.seong}성`;
}

// 졸업(하산) 조건 — docs/06 "정상 하산 조건".
// 그레이박스 단순화: 메인 무공 대성 이상 + 신뢰 ≥ 60.
// 후속: 의뢰 횟수·노선 확정·사부 인정 이벤트.
export function isGraduationEligible(d: Disciple): boolean {
  if (d.status !== 'training') return false;
  if (d.martialArts.length === 0) return false;
  // "더 가르칠 게 없다" = **계보에서 도달 가능한 정점 무공서 등급** 천장에 닿고 신뢰 ≥ 60.
  // 현 주력이 아니라 정점 기준 — 중간 무공 천장에서 하산해 정점(혈마공·이십사수매화검 등)에
  // 못 닿는 일을 막는다. docs/23 · docs/26 §5-4.
  const ceiling = effectiveRealmCeiling(reachableApexGrade(d));
  return realmIndex(d.realm) >= realmIndex(ceiling) && d.trustToMaster >= 60;
}

// 매일 진행 후 호출. 졸업 가능한 활성 제자를 graduated 처리 + milestone 큐에 추가.
// 활성 제자가 0이면 phase='ended' → 메인이 run-end 라우트로 진입.
export function checkGraduations(): void {
  const ds = useDiscipleStore.getState();
  const day = useTimeStore.getState().totalDay;
  const newMilestones: Milestone[] = [];

  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d || !isGraduationEligible(d)) continue;
    ds.update(id, { status: 'graduated' });
    const grade = evaluateGraduation(d);
    newMilestones.push({
      id: `${day}-${id}-graduation`,
      kind: 'graduation',
      discipleId: id,
      discipleName: d.name,
      title: '하산',
      body: `${d.name}이 사부에게 마지막 절을 올렸다.\n${mainArtSummary(d)} — ${GRADE_LABEL[grade]}.\n강호로 나간다.`,
    });
    // 강호 행로(직업)는 서신함 강제 결정으로. docs/28 §3.
    enqueueGraduationChoice(d, day);
  }

  if (newMilestones.length > 0) {
    usePendingStore.getState().pushMilestones(newMilestones);
  }

  // 회차 종결 = 모든 제자가 **영구히** 사문을 떠났을 때(졸업/하산).
  // questing·injured·resting·meditating 은 회복 가능한 상태라 종결 사유가 아니다.
  // (하루 전원이 의뢰·요양 중이라고 회차가 끝나면 안 됨.)
  const TERMINAL_STATUSES: DiscipleStatus[] = ['graduated', 'departed'];
  const allGone =
    ds.order.length > 0 &&
    ds.order
      .map((id) => ds.disciples[id])
      .every((d) => d != null && TERMINAL_STATUSES.includes(d.status));
  if (allGone) {
    useGameStore.getState().setPhase('ended');
  }
}
