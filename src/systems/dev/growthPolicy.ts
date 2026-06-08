// 최적 플레이 정책 — 헤드리스 시뮬에서 "합리적으로 잘 키우면 어디까지 가나(궁극 화경)"를 검증.
// 모든 결정 표면을 최적으로 운용(policyHelpers.configureOptimal):
//  - 무공서 변경: 같은 계열 최고 등급으로 갈아타 등급천장(화경) 확보.
//  - 무공축: 내공 미달→심법, 충족→초식(성 게이트).
//  - 체력: 외공요건 미달→기마자세(근력), 충족→암벽(체력Lv).
//  - 영약: 초절정 도달 시 신품 영약 확보(화경 벽 통과).
//  - 파견: 안 함(훈련 시간 최대화). 4지선다: 랜덤(이벤트 효과는 부차적·정량비교 불가).
// 랜덤(RandomPolicy) 정체와 대조 → 실코드 기준 절정/초절정/화경 도달성 검증(공식 sim.cjs 와 교차).

import { type PlayPolicy } from './autoPlay';
import { configureOptimal, pickOptimalInboxKey } from './policyHelpers';

export const GrowthPolicy: PlayPolicy = {
  label: 'growth',
  configureBeforeDay: configureOptimal,
  pickInboxKey: pickOptimalInboxKey, // 폐관 청원은 항상 허락(벽 돌파), 그 외 랜덤.
  dispatch: () => {}, // 파견 안 함 — 훈련 시간 최대화.
};
