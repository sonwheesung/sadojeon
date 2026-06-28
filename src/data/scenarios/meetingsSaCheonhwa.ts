// 사천화(sa-cheonhwa) 전용 면담 풀 — docs/12 · docs/disciples/10_사천화.md.
// 결: 사천 약·독 의가의 딸. 가전 비전을 노리는 그늘 아래서 "독을 다스리는 손"의 무게를 지고,
//     끝내 "어둠을 약으로 갚을지 독으로 갚을지"를 정한다. 진소화·백연과 의술 진영 우정, 약왕 야망.
// 흑화 창 = 복수의 약독사(어둠을 독으로 갚는 선택에만 darkness:1). 활인의 길 인정엔 trust·righteousness 양수.
// 작성 원칙(feedback_disciple_dialogue_writing): 명확한 want·나이대 말투·숨은변수 직설 금지·스무고개 금지.
// band 별 나이대: child(ageMax:10)·growth(10~12)·turmoil(13~14)·departure(15+).

import type { MeetingTemplate } from './meetings';

export const SA_CHEONHWA_MEETINGS: MeetingTemplate[] = [
  // ── 동심기 (7~10) — 가전의 손·가문 위협 불안 ──
  {
    id: 'm-cheonhwa-pouch',
    band: 'child',
    disciple: 'sa-cheonhwa',
    when: { ageMax: 10 },
    body: '사부님, 이 주머니 속 약은요, 잘못 만지면 사람이 상해요. 어머니가 주신 건데… 저 혼자 갖고 있기엔 너무 무서워요. 어떻게 다뤄야 해요?',
    options: [
      { key: 'together', label: '겁내지 마라. 오늘부터 그 주머니는 나와 함께 살피자꾸나.', effects: { persona: { warmth: 6, prudence: 2 }, trust: 6 } },
      { key: 'cure', label: '독보다 사람을 살리는 법을 먼저 손에 익히거라.', effects: { persona: { mercy: 6, integrity: 4 }, trust: 4, righteousness: 1 } },
      { key: 'keep', label: '무거운 줄 아는 손이라야 그 약을 가질 자격이 있다.', effects: { persona: { integrity: 5, prudence: 4 }, trust: 3 } },
    ],
  },
  {
    id: 'm-cheonhwa-shadow',
    band: 'child',
    disciple: 'sa-cheonhwa',
    when: { ageMax: 10 },
    body: '사부님… 어젯밤 꿈에 우리 집을 노리는 사람들이 나왔어요. 우리 가족, 정말 괜찮은 거죠? 자꾸 무서운 생각이 들어요.',
    options: [
      { key: 'protect', label: '내가 있는 한 그 그림자는 이 산문을 넘지 못한다. 안심하거라.', effects: { persona: { warmth: 8 }, trust: 6 } },
      { key: 'inform', label: '두려움은 모르는 데서 온다. 바깥 정세를 내가 알아봐 주마.', effects: { persona: { prudence: 6 }, trust: 4 } },
      { key: 'arm', label: '무서울수록 네 손에 힘을 길러라. 스스로를 지킬 줄 알아야 한다.', effects: { persona: { integrity: 6, ambition: 2 }, trust: 3 } },
    ],
  },

  // ── 성장기 (10~12) — 의술 진영 우정·독을 다스리는 손·약왕 야망 ──
  {
    id: 'm-cheonhwa-friends',
    band: 'growth',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 10, ageMax: 12 },
    body: '사부님, 진소화랑 백연이랑 같이 약초를 다루면 마음이 놓여요. 셋이서 의술을 더 깊이 파고들어도 될까요? 같이 가면 멀리 갈 수 있을 것 같아요.',
    options: [
      { key: 'circle', label: '좋다. 셋이 어깨를 맞대거라. 의가의 길은 함께일 때 멀리 간다.', effects: { persona: { warmth: 8, ambition: 4 }, trust: 5 } },
      { key: 'lead', label: '네가 아는 것을 둘에게 나눠 주거라. 가르치는 손이 가장 깊이 안다.', effects: { persona: { ambition: 6, warmth: 4 }, trust: 4 } },
      { key: 'solo', label: '벗도 좋다만, 가전의 길은 끝내 네 손이 외로이 파야 할 때가 있다.', effects: { persona: { prudence: 5, freedom: 4 }, trust: 2 } },
    ],
  },
  {
    id: 'm-cheonhwa-handweight',
    band: 'growth',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 10, ageMax: 12 },
    body: '사부님, 어머니가 독을 알아야 약을 안다 하셨어요. 단… 제 손이 사람을 해할 수도 있다는 게, 가끔 제 손이 무서워져요. 이 손, 어떻게 써야 해요?',
    options: [
      { key: 'cure', label: '그 손은 살리라고 있는 손이다. 끝까지 사람을 살리는 데 쓰거라.', effects: { persona: { mercy: 8, integrity: 3 }, trust: 4, righteousness: 1 } },
      { key: 'weight', label: '무서운 게 당연하다. 그 무게를 아는 손이라야 의가의 손이다.', effects: { persona: { integrity: 6, prudence: 4 }, trust: 4 } },
      { key: 'choose', label: '독이 될지 약이 될지는 손이 아니라 마음이 정한다. 네가 정하거라.', effects: { persona: { freedom: 6, prudence: 3 }, trust: 3 } },
    ],
  },
  {
    id: 'm-cheonhwa-yakwang-dream',
    band: 'growth',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 10, ageMax: 12 },
    body: '사부님, 저 약왕이 되고 싶어요. 어머니가 못다 펴신 우리 집 약을, 강호에 펴고 싶어요. 이런 게… 욕심인 걸까요?',
    options: [
      { key: 'ambition', label: '욕심이 아니라 뜻이다. 그 뜻, 크게 품어라. 정점은 그런 자의 것이다.', effects: { persona: { ambition: 8, freedom: 3 }, trust: 4 } },
      { key: 'foundation', label: '약왕은 먼 산이다. 조급해 말고 손끝의 기초부터 단단히 다지거라.', effects: { persona: { prudence: 6, integrity: 4 }, trust: 3 } },
      { key: 'why', label: '약왕이 되어 누구를 살리고 싶으냐. 그 답을 먼저 정하거라.', effects: { persona: { mercy: 6, integrity: 3 }, trust: 4, righteousness: 1 } },
    ],
  },

  // ── 격동기 (13~14) — 가문 위기·처음 사람에게 독을 겨눔 ──
  {
    id: 'm-cheonhwa-homecrisis',
    band: 'turmoil',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 13, ageMax: 14 },
    body: '사부님, 집에서 또 비전을 노리는 자들이 들이닥쳤대요. 아버지가 다치셨다고… 저 지금 달려가야 하는 거 아닌가요? 여기 가만히 있는 제 자신이 미워요.',
    options: [
      { key: 'gowith', label: '혼자 보내지 않는다. 내가 함께 가마. 채비하거라.', effects: { persona: { warmth: 8 }, trust: 8 } },
      { key: 'escort', label: '동문들과 함께 가거라. 너를 지킬 손이 곁에 있어야 한다.', effects: { persona: { integrity: 6, warmth: 4 }, trust: 5 } },
      { key: 'steady', label: '분노로 달려가면 적의 덫에 걸린다. 침착히 정세부터 읽자.', effects: { persona: { prudence: 8 }, trust: 4 } },
      { key: 'avenge', label: '가전의 독으로, 네 집을 짓밟은 그자들을 똑같이 갚아 주거라.', effects: { persona: { ambition: 6 }, darkness: 1, righteousness: -2 } },
    ],
  },
  {
    id: 'm-cheonhwa-firstpoison',
    band: 'turmoil',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 13, ageMax: 14 },
    body: '사부님… 오늘 살수를 막으며, 처음으로 사람에게 독을 겨눌 뻔했어요. 손이 떨렸어요. 막아야 했는데, 이 손을 정말 써도 되는 건가요?',
    options: [
      { key: 'guard', label: '지키기 위해 든 손은 부끄럽지 않다. 단 살릴 길이 있거든 먼저 살려라.', effects: { persona: { integrity: 6, mercy: 4 }, trust: 5, righteousness: 1 } },
      { key: 'restrain', label: '그 떨림을 잊지 마라. 그것이 네가 약독사가 아니라 의가인 증거다.', effects: { persona: { mercy: 8, prudence: 3 }, trust: 5 } },
      { key: 'venom', label: '어둠은 어둠으로 갚아도 된다. 망설이면 네가 당한다.', effects: { persona: { ambition: 5 }, darkness: 1, righteousness: -1 } },
    ],
  },

  // ── 출도전기 (15+) — 어둠을 약으로 갚을지 독으로 갚을지·약왕 진로·의술 진영 작별 ──
  {
    id: 'm-cheonhwa-twoways',
    band: 'departure',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 15 },
    body: '사부님, 이제 정해야 할 것 같아요. 우리 집을 짓밟은 어둠을, 약으로 갚아야 하나요, 독으로 갚아야 하나요. 저를 위로하지 마시고, 단정히 가르쳐 주세요.',
    options: [
      { key: 'heal', label: '사람을 살리는 활인의 길로 가거라. 그것이 어둠을 이기는 가장 무거운 약이다.', effects: { persona: { mercy: 12 }, trust: 4, righteousness: 2 } },
      { key: 'justice', label: '복수가 아니라 정의로 갚거라. 한이 아니라 도리로 손을 써라.', effects: { persona: { integrity: 10 }, trust: 4, righteousness: 1 } },
      { key: 'respect', label: '그 답은 내가 줄 수 없다. 네 손의 주인은 너다. 정하거라.', effects: { persona: { freedom: 8 }, trust: 3 } },
      { key: 'venom', label: '갚지 못한 한이 있거든, 그 독으로 갚는 길을 나는 막지 않으마.', effects: { persona: { ambition: 6 }, darkness: 1, righteousness: -2 } },
    ],
  },
  {
    id: 'm-cheonhwa-rebuild',
    band: 'departure',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 15 },
    body: '사부님, 졸업하면 가전을 잇되, 독을 아는 손으로 더 많은 사람을 살리는 의가를 세우고 싶어요. 약왕… 노려도 될까요?',
    options: [
      { key: 'rebuild', label: '무너진 가전을 네 손으로 다시 세우거라. 그 길, 내가 뒤를 받쳐 주마.', effects: { persona: { ambition: 8, integrity: 4 }, trust: 4, righteousness: 1 } },
      { key: 'master', label: '약왕의 길을 활짝 열어 두마. 네 재주라면 강호의 정점에 닿는다.', effects: { persona: { ambition: 10, freedom: 4 }, trust: 4 } },
      { key: 'orthodox', label: '정파의 명사들과 손을 잡거라. 바른 이름이 네 약을 멀리 퍼뜨린다.', effects: { persona: { integrity: 6 }, trust: 4, righteousness: 2 } },
      { key: 'own', label: '무엇이 되든 네 뜻에 맡기마. 나는 그저 네 길을 믿는다.', effects: { persona: { freedom: 8 }, trust: 4 } },
    ],
  },
  {
    id: 'm-cheonhwa-farewell',
    band: 'departure',
    disciple: 'sa-cheonhwa',
    when: { ageMin: 15 },
    body: '사부님, 진소화랑 백연이랑 약속했어요. 강호 어디서든 서로의 약이 되어 주자고요. 저, 그 약속 지키며 살아도 되죠?',
    options: [
      { key: 'bond', label: '그 우정이 곧 의가의 힘이다. 셋이 서로의 약이 되거라.', effects: { persona: { warmth: 8, mercy: 4 }, trust: 5, righteousness: 1 } },
      { key: 'together', label: '같은 뿌리에서 갈린 세 손이다. 멀리 떨어져도 한 진영으로 살아라.', effects: { persona: { mercy: 6, ambition: 4 }, trust: 4 } },
      { key: 'free', label: '벗과의 약속도, 네 길도 모두 네 것이다. 무엇이 되든 너답게 살거라.', effects: { persona: { freedom: 6, warmth: 3 }, trust: 4 } },
    ],
  },
];
