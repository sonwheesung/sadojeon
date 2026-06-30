// 비급 감별(鑑別) 순수 로직 — 사부 통찰(★1~5)별 열리는 정보 + 함정·미완 자동 식별.
// docs/05 §감별 · docs/02 §1(통찰 차등 정본 표). 스토어·LLM 무의존 순수 함수.
// 슬라이스1: 흐름 미배선(드랍·화면·피해는 슬라이스2~4). 이 함수가 "통찰로 무엇이 보이나"의 단일 판정.
import type { ArtAuthenticity } from '@/types';

export interface AppraisalResult {
  schoolKnown: boolean; //                ★1+ 갈래
  gradeKnown: 'none' | 'estimate' | 'exact'; // ★2 추정 · ★3+ 정확
  dangerHint: boolean; //                 ★2+ 위험 신호(함정류면 true) — 함정 단정은 아님
  sideEffectsKnown: boolean; //           ★3+ 부작용·색깔
  synergyKnown: boolean; //               ★4+ 다른 무공과 궁합 예측
  trueNatureRevealed: boolean; //         ★5 함정·미완 자동 식별
  shown: ArtAuthenticity | 'unknown'; //  사부에게 확정 노출되는 진위(★5 아니면 unknown)
}

// ★2+ 위험 신호가 켜지는 진위. 가품·미완은 위험이 아니라 손해(연구 낭비·가르침 하향)일 뿐.
const DANGEROUS: ReadonlySet<ArtAuthenticity> = new Set<ArtAuthenticity>(['trap']);

// 통찰 ★(0~5)로 비급 한 권에서 열리는 감별 정보. docs/02 §1 표 그대로.
export function appraiseScroll(authenticity: ArtAuthenticity, insightStars: number): AppraisalResult {
  const s = Math.max(0, Math.min(5, Math.floor(insightStars)));
  const revealTrue = s >= 5; // ★5 — 함정·미완 자동 식별(진위 확정)
  return {
    schoolKnown: s >= 1,
    gradeKnown: s >= 3 ? 'exact' : s >= 2 ? 'estimate' : 'none',
    dangerHint: s >= 2 && DANGEROUS.has(authenticity),
    sideEffectsKnown: s >= 3,
    synergyKnown: s >= 4,
    trueNatureRevealed: revealTrue,
    shown: revealTrue ? authenticity : 'unknown',
  };
}
