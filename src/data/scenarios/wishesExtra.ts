// 제자 희망 풀 확장 — docs/12 단계 1.5 (한 마디와 면담 사이의 결).
// wishes.ts 의 기존 9개에 더해, 6종 kind 전반·나이대·상황 결을 넓힌 26개.
//
// 매핑 규약 (wishes.ts 와 동일):
//   휴식류=rest / 명상·공부=meditation / 합공=training / 외출·자율=autonomy
//   acceptTrustDelta 1~3, rejectTrustDelta -1~-5 (절실할수록 거절 시 더 큰 음수).
//   id = '<kind>-<짧은영문>' (기존과 충돌 없게).
//
// 말투: 정통 무협 한 문장(때로 두 문장). 숨은변수(흑화·노선·신뢰 수치) 직설 금지.

import type { WishTemplate } from './wishes';

export const WISHES_EXTRA: WishTemplate[] = [
  // ── study (공부: 의학서·병법서·잡학) ─────────────────────────
  {
    id: 'study-poison',
    kind: 'study',
    body: '독초를 다룬 책이 한 권 있다 들었습니다. 오늘은 그 글을 익혀 두고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 3,
    rejectTrustDelta: -2,
  },
  {
    id: 'study-letters',
    kind: 'study',
    body: '아직 글이 서툴러 사부님의 서신도 더듬더듬 읽습니다. 오늘은 글공부를 하고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'study-meridian',
    kind: 'study',
    body: '경맥이 어떻게 도는지 그림으로 보고 싶습니다. 몸을 알아야 내공도 알 듯합니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 3,
    rejectTrustDelta: -3,
  },
  {
    id: 'study-history',
    kind: 'study',
    body: '옛 고수들의 행적이 적힌 책을 들춰 보고 싶습니다. 그들도 한때 저 같았겠지요.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -1,
  },
  {
    id: 'study-manual',
    kind: 'study',
    body: '어제 본 초식의 구결이 머리에 남습니다. 오늘은 책상 앞에서 그 뜻을 곱씹고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 3,
    rejectTrustDelta: -3,
  },

  // ── meditation (명상: 정체기 돌파·심란·결의) ────────────────
  {
    id: 'meditation-doubt',
    kind: 'meditation',
    body: '며칠 마음이 어지럽습니다. 오늘은 가만히 앉아 숨만 고르고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },
  {
    id: 'meditation-quest-doubt',
    kind: 'meditation',
    body: '지난 의뢰가 자꾸 떠오릅니다. 손을 멈추고 그 일을 다시 헤아려 보고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },
  {
    id: 'meditation-breath',
    kind: 'meditation',
    body: '호흡이 자꾸 흐트러집니다. 오늘 하루는 토납에만 매달리고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -4,
  },
  {
    id: 'meditation-resolve',
    kind: 'meditation',
    body: '하산이 머지않았다 느낍니다. 떠나기 전, 마음 한 번 단단히 가다듬고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'meditation-night',
    kind: 'meditation',
    body: '간밤 꿈자리가 사나웠습니다. 오늘은 정좌하여 마음을 비우고 싶습니다.',
    acceptActivity: 'meditation',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },

  // ── rest (휴식: 몸살·향수·지침) ────────────────────────────
  {
    id: 'rest-fever',
    kind: 'rest',
    body: '아침부터 몸에 열이 오릅니다. 오늘 하루만 자리에 눕게 해 주십시오.',
    acceptActivity: 'rest',
    acceptTrustDelta: 3,
    rejectTrustDelta: -5,
  },
  {
    id: 'rest-homesick',
    kind: 'rest',
    body: '문득 고향 생각이 사무칩니다. 오늘은 손에 아무것도 잡고 싶지 않습니다.',
    acceptActivity: 'rest',
    acceptTrustDelta: 2,
    rejectTrustDelta: -4,
  },
  {
    id: 'rest-worn',
    kind: 'rest',
    body: '근래 며칠 쉬지 못해 손발이 무겁습니다. 하루 비우면 다시 일어서겠습니다.',
    acceptActivity: 'rest',
    acceptTrustDelta: 2,
    rejectTrustDelta: -4,
  },
  {
    id: 'rest-bruise',
    kind: 'rest',
    body: '어제 대련에서 든 멍이 아직 욱신거립니다. 오늘은 몸을 추스르고 싶습니다.',
    acceptActivity: 'rest',
    acceptTrustDelta: 3,
    rejectTrustDelta: -5,
  },
  {
    id: 'rest-sleep',
    kind: 'rest',
    body: '눈이 자꾸 감깁니다. 오늘만 늦잠을 허락해 주시면 안 되겠습니까.',
    acceptActivity: 'rest',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },

  // ── pair_training (합공: 동문·경쟁심) ──────────────────────
  {
    id: 'pair-spar',
    kind: 'pair_training',
    body: '동문이 부쩍 강해졌습니다. 오늘 그와 한 판 겨뤄 제 자리를 가늠하고 싶습니다.',
    acceptActivity: 'training',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'pair-combo',
    kind: 'pair_training',
    body: '둘이 손을 합치면 어떤 그림이 나올지 궁금합니다. 오늘은 합격술을 맞춰 보고 싶습니다.',
    acceptActivity: 'training',
    acceptTrustDelta: 2,
    rejectTrustDelta: -1,
  },
  {
    id: 'pair-teach',
    kind: 'pair_training',
    body: '제가 먼저 익힌 초식을 동문에게 보여 주고 싶습니다. 가르치며 저도 배울 듯합니다.',
    acceptActivity: 'training',
    acceptTrustDelta: 2,
    rejectTrustDelta: -1,
  },
  {
    id: 'pair-rivalry',
    kind: 'pair_training',
    body: '오늘만큼은 동문에게 지고 싶지 않습니다. 둘이 마주 서게 해 주십시오.',
    acceptActivity: 'training',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'pair-makeup',
    kind: 'pair_training',
    body: '어제 동문과 말다툼이 있었습니다. 손을 맞대고 풀어 보고 싶습니다.',
    acceptActivity: 'training',
    acceptTrustDelta: 3,
    rejectTrustDelta: -2,
  },

  // ── town_visit (마을 외출: 소문·놀이·향수) ─────────────────
  {
    id: 'town-market',
    kind: 'town_visit',
    body: '저잣거리가 열렸다 합니다. 잠시 구경만 하고 와도 되겠습니까.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'town-festival',
    kind: 'town_visit',
    body: '마을에 등불 축제가 선다 들었습니다. 오늘 하루만 다녀오고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },
  {
    id: 'town-jianghu',
    kind: 'town_visit',
    body: '요즘 강호가 뒤숭숭하다 합니다. 마을에 내려가 떠도는 이야기를 듣고 오고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 2,
    rejectTrustDelta: -2,
  },
  {
    id: 'town-friend',
    kind: 'town_visit',
    body: '마을에 사귄 또래가 있습니다. 오늘은 그 아이를 보러 잠깐 다녀오고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 2,
    rejectTrustDelta: -3,
  },

  // ── extra_training (자율 추가 수련: 결의·집착) ─────────────
  {
    id: 'extra-dawn',
    kind: 'extra_training',
    body: '남들 깨기 전 동틀 녘에 혼자 검을 더 휘둘러 보고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 1,
    rejectTrustDelta: -1,
  },
  {
    id: 'extra-form',
    kind: 'extra_training',
    body: '아직 한 초식이 손에 붙지 않습니다. 오늘은 그것만 백 번 더 그어 보겠습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 1,
    rejectTrustDelta: -2,
  },
  {
    id: 'extra-stamina',
    kind: 'extra_training',
    body: '숨이 금방 차오릅니다. 오늘은 따로 산을 오르내리며 몸을 다지고 싶습니다.',
    acceptActivity: 'autonomy',
    acceptTrustDelta: 1,
    rejectTrustDelta: -1,
  },
];
