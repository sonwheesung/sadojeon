// 제자 희망 풀 — docs/12 단계 1.5 (한 마디와 면담 사이의 결).
// 매일 확률로 1명의 제자가 사부에게 "오늘 X 하고 싶다" 발화.
// 사부 응답: 허락(accept) / 거절(reject).
//
// 허락: 그날 그 제자만 디폴트 일정 무시 + 희망 활동 효과 적용
// 거절: 신뢰 ↓ (제자 성격에 따라 차등). 다만 사문 디폴트 활동은 그대로 수행.

// 희망 활동 결 — 'rest' 만 1일 healing override 로 처리, 나머지는 표식용.
// (옛 ScheduleActivity 의존 제거 — 훈련 v2 카테고리 모델과 별개)
import { random } from '@/systems/rng';
import { WISHES_EXTRA } from './wishesExtra';

export type WishActivity = 'rest' | 'meditation' | 'training' | 'autonomy';

export type WishKind =
  | 'study' // 공부 (의학서·병법서)
  | 'meditation' // 명상 (정체기 돌파)
  | 'rest' // 휴식 (몸이 안 좋음)
  | 'pair_training' // 합공 (동문과)
  | 'town_visit' // 마을 외출 (소문 듣기)
  | 'extra_training'; // 자율 추가 수련

export interface WishTemplate {
  id: string;
  kind: WishKind;
  body: string; // 발화 본문
  // 허락 시 그날 활동 결. null = 사문 디폴트 그대로지만 별도 효과.
  acceptActivity: WishActivity | null;
  // 허락 시 신뢰 변동.
  acceptTrustDelta: number;
  // 거절 시 신뢰 변동 (대개 음수).
  rejectTrustDelta: number;
}

export const WISHES: WishTemplate[] = [
  {
    id: 'study-medical',
    kind: 'study',
    body: '오늘은 무공 대신 의학서를 한 번 보고 싶습니다.',
    acceptActivity: 'meditation', // 명상 = 진척 0 + 지식 가산 (추후)
    acceptTrustDelta: 3,
    rejectTrustDelta: -2,
  },
  {
    id: 'study-strategy',
    kind: 'study',
    body: '병법서가 손에 잡힙니다. 잠시 그쪽을 들여다봐도 되겠습니까.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 3,
    rejectTrustDelta: -2,
  },
  {
    id: 'meditation-stuck',
    kind: 'meditation',
    body: '결이 막힌 듯합니다. 오늘은 명상을 하고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },
  {
    id: 'rest-tired',
    kind: 'rest',
    body: '몸이 무겁습니다. 오늘은 쉬어도 되겠습니까.',
    acceptActivity: 'rest',
    acceptTrustDelta: 2,
    rejectTrustDelta: -4,
  },
  {
    id: 'rest-injury',
    kind: 'rest',
    body: '어제 무리한 듯합니다. 하루 쉬게 해 주십시오.',
    acceptActivity: 'rest',
    acceptTrustDelta: 3,
    rejectTrustDelta: -5,
  },
  {
    id: 'pair-training',
    kind: 'pair_training',
    body: '동문과 손을 맞춰 보고 싶습니다.',
    acceptActivity: 'training',
    acceptTrustDelta: 2,
    rejectTrustDelta: -1,
  },
  {
    id: 'town-rumor',
    kind: 'town_visit',
    body: '마을의 소문이 궁금합니다. 잠시 다녀와도 되겠습니까.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'extra-training',
    kind: 'extra_training',
    body: '오늘은 자율적으로 한 가지 더 수련해 보고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 1,
    rejectTrustDelta: -1,
  },
  // 확장분 27개 (2026-06-28, docs/12) — 6종 kind × 나이대·상황 변주.
  ...WISHES_EXTRA,
];

export function pickRandomWish(): WishTemplate {
  return WISHES[Math.floor(random() * WISHES.length)];
}
