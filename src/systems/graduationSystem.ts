// 졸업 평가 — docs/03 "양육 등급 시스템" 6단계.
// 그레이박스 단순화: 무공 단계 + 신뢰 두 축 기반.
// 추후 명성·노선 안정성 도입 시 종합 평가로 확장.

import { findMartialArt, seongToStage } from '@/data/martialArts';
import { effectiveRealmCeiling, realmCeiling, realmIndex } from '@/data/realm';
import { evaluateJobs } from './jobSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGameStore } from '@/stores/gameStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, Milestone } from '@/types';
import { MARTIAL_STAGE_LABEL } from '@/types/martialArt';

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
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  if (!main) return false;
  // "더 가르칠 게 없다" = 제 천장(무공서 등급)에 닿고 신뢰 ≥ 60. docs/23 · docs/26.
  const art = findMartialArt(main.artId);
  const ceiling = art ? effectiveRealmCeiling(art.grade) : realmCeiling();
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
    // 가능 직업 풀 + 적합도 확률 (docs/28 §3). 선택 UI는 후속 — 지금은 상위 3개 풍경으로.
    const jobLine = evaluateJobs(d)
      .slice(0, 3)
      .map((j) => `${j.job.name} ${Math.round(j.prob * 100)}%`)
      .join(' · ');
    newMilestones.push({
      id: `${day}-${id}-graduation`,
      kind: 'graduation',
      discipleId: id,
      discipleName: d.name,
      title: '하산',
      body: `${d.name}이 사부에게 마지막 절을 올렸다.\n${mainArtSummary(d)} — ${GRADE_LABEL[grade]}.\n${jobLine ? `가능 직업: ${jobLine}\n` : ''}강호로 나간다.`,
    });
  }

  if (newMilestones.length > 0) {
    usePendingStore.getState().pushMilestones(newMilestones);
  }

  // 모든 제자가 활동 종료(graduated/departed/...) 면 회차 종결.
  const stillActive = ds.order
    .map((id) => ds.disciples[id])
    .some((d) => d && d.status === 'training');
  if (!stillActive && ds.order.length > 0) {
    useGameStore.getState().setPhase('ended');
  }
}
