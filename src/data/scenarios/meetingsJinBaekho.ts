// 진백호(jin-baekho) 전용 면담 풀 — docs/12 · docs/disciples/09. 결제 5성 천재 캐릭터.
// 아크(arcEvents/characters/jin-baekho)와 같은 결: 떠돌이 천재의 진도 답답함·천재의 외로움·
// 자유 갈증·"어떤 사람이 될까"·화경 벽 앞 흔들림. 어머니 비녀(부모 살해 기억)·한바람 인연·사천화 라이벌.
// 흑화 창 = 자유 폭발: 가두거나 방관·강제하는 선택에만 darkness:1. 자유를 인정하면 trust 큰 양수.
// 작성 원칙(feedback_disciple_dialogue_writing): 명확한 want·나이대 말투·숨은변수 직설 금지.
// MeetingTemplate 계약·band 나이대는 meetings.ts 참조. 전부 disciple:'jin-baekho'.

import type { MeetingTemplate } from './meetings';

export const JIN_BAEKHO_MEETINGS: MeetingTemplate[] = [
  // ── 동심기 (~10) ──
  {
    id: 'm-baekho-wander',
    band: 'child',
    disciple: 'jin-baekho',
    when: { ageMax: 10 },
    body: '사부님, 산속만 있으니까 좀 답답해요. 잠깐 마을 한 바퀴만 돌고 올게요. 저 원래 떠돌면서 컸잖아요. 안 돼요?',
    options: [
      { key: 'walk', label: '그래, 함께 나가 바람 좀 쐬고 오자.', effects: { persona: { freedom: 6, warmth: 2 }, trust: 6 } },
      { key: 'pair', label: '동문 하나 데리고 다녀오너라. 길동무가 있어야 한다.', effects: { persona: { freedom: 4, warmth: 3 }, trust: 4 } },
      { key: 'soon', label: '오늘은 수련이 먼저다. 다음에 꼭 데려가마.', effects: { persona: { prudence: 3, freedom: -2 }, trust: 1 } },
      { key: 'lock', label: '안 된다. 산문 밖은 어림없으니 방에 있거라.', effects: { persona: { freedom: -8 }, trust: -5, darkness: 1 } },
    ],
  },
  {
    id: 'm-baekho-quick',
    band: 'child',
    disciple: 'jin-baekho',
    when: { ageMax: 10 },
    body: '사부님, 이 검법 어제 다 익혔어요. 똑같은 거 또 하니까 너무 심심해요. 새 거 하나만 더 주시면 안 돼요?',
    options: [
      { key: 'open', label: '좋다. 다음 권을 미리 풀어주마. 막히는 데까지 가보거라.', effects: { persona: { ambition: 5, freedom: 4 }, trust: 4 } },
      { key: 'deep', label: '익힌 것 같아도 더 깊은 결이 숨어 있다. 한 번 더 파보거라.', effects: { persona: { prudence: 6 }, trust: 1 } },
      { key: 'why', label: '쉬운 게 지루하다… 그래서 무엇을 더 바라느냐?', effects: { persona: { prudence: 3, ambition: 3 }, trust: 3 } },
    ],
  },
  {
    id: 'm-baekho-hairpin',
    band: 'child',
    disciple: 'jin-baekho',
    when: { ageMax: 10 },
    body: '사부님… 이 은비녀, 어머니 거예요. 가끔 그날 밤이 토막토막 떠올라요. 더 떠올리려고 하면 머리가 아프고요. 저 이거 어떻게 해야 돼요?',
    options: [
      { key: 'keep', label: '잘 간직하거라. 그 비녀가 네 어머니를 곁에 두는 길이다.', effects: { persona: { warmth: 6, mercy: 4 }, trust: 6 } },
      { key: 'time', label: '굳이 다 떠올릴 것 없다. 기억은 때가 되면 알아서 온다.', effects: { persona: { prudence: 4, warmth: 2 }, trust: 3 } },
      { key: 'forge', label: '아픈 기억일수록 검에 실어라. 그것이 너를 단단케 한다.', effects: { persona: { integrity: 4, ambition: 2 }, trust: 1 } },
    ],
  },

  // ── 성장기 (10~12) ──
  {
    id: 'm-baekho-lonely',
    band: 'growth',
    disciple: 'jin-baekho',
    when: { ageMin: 10, ageMax: 12, needsRival: true },
    body: '사부님, {rival}한테 같이 수련하자고 했는데 제 속도를 못 따라와요. 저는 일부러 그런 것도 아닌데… 혼자 저만치 앞서 있으니까 좀 외로워요.',
    options: [
      { key: 'teach', label: '네가 본 길을 동문에게 나눠주거라. 가르치며 너도 깊어진다.', effects: { persona: { warmth: 6, mercy: 3 }, trust: 4, righteousness: 1 } },
      { key: 'wait', label: '걸음을 늦춰 곁을 맞춰주는 것도 강한 자의 몫이다.', effects: { persona: { warmth: 4, integrity: 3 }, trust: 3 } },
      { key: 'ahead', label: '앞선 자는 원래 외롭다. 그 외로움까지 네 몫이라 여기거라.', effects: { persona: { prudence: 4, ambition: 3 }, trust: 2 } },
    ],
  },
  {
    id: 'm-baekho-cage',
    band: 'growth',
    disciple: 'jin-baekho',
    when: { ageMin: 10, ageMax: 12 },
    body: '사부님, 솔직히 말할게요. 정해진 시간에 일어나고, 정해진 걸 익히고… 사문 규율이 자꾸 저를 옥죄는 것 같아요. 저한테 맞는 길은 제가 정하면 안 돼요?',
    options: [
      { key: 'trust', label: '좋다. 무엇을 어떻게 익힐지, 네가 정해 와라. 믿고 맡기마.', effects: { persona: { freedom: 8 }, trust: 7 } },
      { key: 'frame', label: '규율은 너를 가두는 울타리가 아니라 길을 내는 둑이다.', effects: { persona: { integrity: 5, prudence: 3 }, trust: 2 } },
      { key: 'mix', label: '큰 틀만 지키고, 그 안은 네 멋대로 채워보거라.', effects: { persona: { freedom: 5, prudence: 2 }, trust: 4 } },
      { key: 'force', label: '제멋대로는 안 된다. 사문에 들었으면 규율을 따라야지.', effects: { persona: { freedom: -8 }, trust: -5, darkness: 1 } },
    ],
  },

  // ── 격동기 (13~14) ──
  {
    id: 'm-baekho-whoami',
    band: 'turmoil',
    disciple: 'jin-baekho',
    when: { ageMin: 13, ageMax: 14 },
    body: '사부님, 저는 대체 어떤 사람이 될까요. 무공은 자꾸 강해지는데, 정작 제가 뭘 하고 싶은지는 답이 안 나와요. 강하기만 한 게 무슨 소용이죠?',
    options: [
      { key: 'self', label: '답은 네 안에 있다. 서두르지 말고 스스로 찾아가거라.', effects: { persona: { freedom: 7, prudence: 3 }, trust: 6 } },
      { key: 'sword', label: '얽매이지 않는 자유로운 검, 그 길의 거두가 되어보거라.', effects: { persona: { freedom: 6, ambition: 4 }, trust: 3 } },
      { key: 'lord', label: '그 힘으로 뭇 무인을 이끌어보아라. 강호의 정점도 네 것이 될 수 있다.', effects: { persona: { ambition: 8 }, righteousness: 1, trust: 1 } },
      { key: 'for', label: '강함은 누구를 위해 쓰느냐로 뜻이 정해진다. 지킬 사람을 먼저 찾거라.', effects: { persona: { mercy: 5, integrity: 3 }, righteousness: 2, trust: 3 } },
    ],
  },
  {
    id: 'm-baekho-rival',
    band: 'turmoil',
    disciple: 'jin-baekho',
    when: { ageMin: 13, ageMax: 14, needsRival: true },
    body: '사부님, {rival}도 강호의 정점을 노린다면서요? …재밌네요. 근데 둘 다는 못 되는 거잖아요. 저, 한 번 제대로 겨뤄봐도 돼요?',
    options: [
      { key: 'ally', label: '겨루기 전에 손부터 잡아보거라. 둘이 나란히 가는 길도 있다.', effects: { persona: { warmth: 6, ambition: 3 }, trust: 4, righteousness: 1 } },
      { key: 'own', label: '남의 정점 말고 네 정점을 그려라. 길이 다르면 다툴 일도 없다.', effects: { persona: { prudence: 5, freedom: 4 }, trust: 3 } },
      { key: 'spar', label: '좋다, 정정당당히 겨뤄보거라. 단 검끝에 미움은 싣지 마라.', effects: { persona: { ambition: 5, integrity: 3 }, trust: 2 } },
      { key: 'goad', label: '그래, 짓밟아서라도 네가 위라는 걸 보여줘라.', effects: { persona: { ambition: 7, warmth: -5 }, trust: -3, darkness: 1 } },
    ],
  },
  {
    id: 'm-baekho-breakout',
    band: 'turmoil',
    disciple: 'jin-baekho',
    when: { ageMin: 13, ageMax: 14, darknessRiskMin: 'medium' },
    body: '사부님, 가르침은 진심으로 감사해요. 근데 사문이 너무 좁아요. 이제 그만 강호로 나가고 싶어요. …더는 못 참겠어요.',
    options: [
      { key: 'bless', label: '나가고 싶거든 나가거라. 사문은 너를 가두지 않는다.', effects: { persona: { freedom: 8, warmth: 3 }, trust: 7 } },
      { key: 'guide', label: '함께 강호를 한 바퀴 돌고 오자. 네 눈으로 직접 봐야 한다.', effects: { persona: { freedom: 6, prudence: 3 }, trust: 5 } },
      { key: 'wait', label: '네 답답함은 안다. 단 채비 하나만 더 갖춘 뒤 보내주마.', effects: { persona: { prudence: 4, integrity: 2 }, trust: 2 } },
      { key: 'bind', label: '아직 이르다. 하산은 안 되니 사문에 머물러라.', effects: { persona: { freedom: -8 }, trust: -5, darkness: 1 } },
    ],
  },

  // ── 출도전기 (15+) ──
  {
    id: 'm-baekho-wall',
    band: 'departure',
    disciple: 'jin-baekho',
    when: { ageMin: 15 },
    body: '사부님, 저 처음으로 못 넘는 벽 앞에 섰어요. 직감으로 다 넘어왔는데 이건 아무리 해도 안 돼요. …이럴 거면 그냥 자유롭게 강호나 떠돌까 봐요. 진짜로요.',
    options: [
      { key: 'free', label: '막히거든 잠시 산을 떠나 떠돌며 답을 찾거라. 길 위에 답이 있을 게다.', effects: { persona: { freedom: 8, prudence: 2 }, trust: 6 } },
      { key: 'seclude', label: '도망치지 말고 폐관에 들어 정면으로 벽을 깨보거라.', effects: { persona: { prudence: 7, integrity: 3 }, trust: 2 } },
      { key: 'field', label: '벽은 방 안이 아니라 실전 속에서 깨진다. 진검 대련 상대를 붙여주마.', effects: { persona: { ambition: 5, freedom: 3 }, trust: 3 } },
      { key: 'wait', label: '천재도 한 번은 벽 앞에 선다. 흔들려도 괜찮으니 천천히 가거라.', effects: { persona: { mercy: 4, prudence: 3 }, trust: 5 } },
    ],
  },
  {
    id: 'm-baekho-leave',
    band: 'departure',
    disciple: 'jin-baekho',
    when: { ageMin: 15 },
    body: '사부님, 하산이 가까워지니까 자꾸 흔들려요. 떠나야 할지, 남아야 할지. …저 진짜 떠나도 돼요? 그래도 여기가 제 사문 맞죠?',
    options: [
      { key: 'always', label: '어디로 가든 여긴 네 사문이다. 마음 편히 떠나거라.', effects: { persona: { freedom: 8, warmth: 4 }, trust: 8 } },
      { key: 'bond', label: '떠나도 동문은 동문이다. 그 인연 하나만 품고 가거라.', effects: { persona: { warmth: 6, freedom: 4 }, trust: 6 } },
      { key: 'own', label: '거취는 전적으로 네 몫이다. 무엇을 고르든 사부는 따르마.', effects: { persona: { freedom: 6, prudence: 2 }, trust: 5 } },
      { key: 'hold', label: '안 된다. 길러준 값이 있으니 사문에 더 남아야 한다.', effects: { persona: { freedom: -8 }, trust: -6, darkness: 1 } },
    ],
  },
];
