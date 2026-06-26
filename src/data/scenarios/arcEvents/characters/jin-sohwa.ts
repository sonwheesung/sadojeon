import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 진소화(jin-sohwa). docs/47·48.
// 아크 결: 칼 못 쥐는 손이 "지키는 길은 무공만이 아니다"를 증명. 약방 출신·의술/연단 적성.
// 흑화 창 없음(말없는 이별 캐릭터) — darkness 미사용. 외면 누적은 trust 큰 폭 마이너스로 표현.
// 경지 중립·동문 부재 안전("가까운 동문"으로 일반화)·숨은변수 비노출.
export const JIN_SOHWA_ARC: ArcEvent[] = [
  // ─── 입문기 (돌봄 본능·향수) ───
  {
    discipleId: 'jin-sohwa',
    year: 1,
    title: '첫 환부(初患)',
    body: '마당에서 넘어져 무릎이 까진 동문 곁에, 진소화가 망설임 없이 쪼그려 앉는다. 품에서 마른 약초를 꺼내 잎을 짓이겨 상처에 얹는다. "약방에서 어머니가 하시던 거예요. 이렇게 하면 덧나지 않아요." 작은 손이 익숙하게 움직인다.',
    choices: [
      { key: 'trust', label: '네게 맡겨두마. 손이 야무지구나', effects: { trust: 8, persona: { warmth: 10, mercy: 8 } } },
      { key: 'teach', label: '약을 쓰는 이치를 곁에서 짚어준다', effects: { trust: 6, persona: { mercy: 6, prudence: 6 } } },
      { key: 'train', label: '그보다 수련이 먼저다', effects: { trust: -4, persona: { integrity: 5, warmth: -5 } } },
      { key: 'stop', label: '어른이 올 때까지 손대지 마라', effects: { trust: -3, persona: { prudence: 6, mercy: -4 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 2,
    title: '고향 김치(故鄕)',
    body: '첫겨울, 함께 자란 가까운 동문이 고향 이야기를 꺼내자 진소화가 입을 다문다. 한참을 말없이 손만 비비다 작게 말한다. "겨울이면… 어머니가 담그시던 김치 냄새가 났어요. 그게 자꾸 생각나서, 말이 잘 안 나와요."',
    choices: [
      { key: 'listen', label: '곁에서 그 이야기를 끝까지 들어준다', effects: { trust: 8, persona: { warmth: 10, mercy: 6 } } },
      { key: 'letter', label: '고향에 편지를 쓰게 한다', effects: { trust: 6, persona: { warmth: 6, freedom: 5 } } },
      { key: 'focus', label: '수련에 마음을 붙이라 이른다', effects: { trust: -3, persona: { integrity: 5, warmth: -4 } } },
      { key: 'fade', label: '그리움은 시간이 약해지게 한다 한다', effects: { trust: 1, persona: { prudence: 5, warmth: -3 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 3,
    title: '밤의 시탕(侍湯)',
    body: '늦은 밤, 진소화가 김이 오르는 찻잔을 들고 조심스레 들어온다. "사부님, 며칠 안색이 안 좋으셔서요. 잠이 잘 오는 청심차예요. 제가… 알아챈 게 주제넘었으면 죄송해요."',
    choices: [
      { key: 'accept', label: '고맙게 받아 마신다', effects: { trust: 8, persona: { warmth: 8, mercy: 6 } } },
      { key: 'yourself', label: '네 몸부터 챙겨라 한다', effects: { trust: 5, persona: { warmth: 6, prudence: 5 } } },
      { key: 'praise', label: '솜씨를 칭찬하며 더 배우게 한다', effects: { trust: 6, persona: { ambition: 6, mercy: 4 } } },
      { key: 'excess', label: '분에 넘치는 일이라 물린다', effects: { trust: -4, persona: { integrity: 5, warmth: -5 } } },
    ],
  },

  // ─── 기초기 (무공이냐 의술이냐) ───
  {
    discipleId: 'jin-sohwa',
    year: 4,
    title: '무공 정하기(定功)',
    body: '검을 쥔 진소화의 손이 자꾸 미끄러진다. 베는 동작에선 더더욱 굳는다. 한참을 끙끙대다 사부를 올려다본다. "사부님… 저는 사람을 베는 무공보다, 사람을 살리는 무공이 좋아요. 그런 길은… 없을까요."',
    choices: [
      { key: 'healer', label: '살리는 손에 맞는 무공을 익히게 한다', effects: { trust: 8, persona: { freedom: 8, mercy: 10 } } },
      { key: 'mix', label: '몸을 지킬 호신의 권법을 곁들이게 한다', effects: { trust: 5, persona: { prudence: 6, mercy: 5 } } },
      { key: 'sword', label: '무인이라면 검을 쥐어야 한다', effects: { trust: -6, persona: { integrity: 8, freedom: -6 } } },
      { key: 'self', label: '네가 정해 오너라 한다', effects: { trust: 4, persona: { freedom: 6, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 5,
    title: '약초밭(藥圃)',
    body: '진소화가 처음으로 제 쪽에서 무언가를 청한다. 손에 작은 씨앗 주머니를 꼭 쥐고 있다. "사부님, 뒷마당 빈터에… 약초밭을 만들어봐도 될까요? 사다 쓰는 것보다, 제 손으로 길러 두면 급할 때 바로 쓸 수 있어요."',
    choices: [
      { key: 'plot', label: '뒷마당 한 켠을 밭으로 내준다', effects: { trust: 8, persona: { ambition: 10, prudence: 6 } } },
      { key: 'small', label: '우선 작은 텃밭부터 해보게 한다', effects: { trust: 5, persona: { prudence: 8, ambition: 4 } } },
      { key: 'buy', label: '필요하면 사 오면 된다 한다', effects: { trust: -3, persona: { ambition: -5, prudence: 4 } } },
      { key: 'early', label: '아직 이르다 다음을 기약한다', effects: { trust: -2, persona: { prudence: 6, ambition: -4 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 6,
    title: '못 익히는 손(戒殺)',
    body: '살수 초식을 익히는 시간, 진소화의 손이 허공에서 멈춰 떨린다. 끝내 동작을 잇지 못하고 검을 내려놓는다. "사부님… 죄송해요. 사람을 찌르는 동작은, 손이 굳어서 못 하겠어요. 흉내라도… 잘 안 돼요."',
    choices: [
      { key: 'exempt', label: '그 초식은 네게서 빼주마', effects: { trust: 8, persona: { mercy: 10, warmth: 6 } } },
      { key: 'form', label: '형식만이라도 익혀 두게 한다', effects: { trust: 2, persona: { integrity: 6, prudence: 4 } } },
      { key: 'must', label: '무인이라면 익혀야 한다 다그친다', effects: { trust: -6, persona: { integrity: 8, mercy: -5 } } },
      { key: 'ask', label: '왜 그러는지 까닭을 물어본다', effects: { trust: 6, persona: { mercy: 6, warmth: 5 } } },
    ],
  },

  // ─── 무공기 (더딘 경지·첫 성취·어두운 동문) ───
  {
    discipleId: 'jin-sohwa',
    year: 7,
    title: '늦된 걸음(晚成)',
    body: '동문들의 무공이 부쩍 자라는 동안, 진소화의 걸음은 더디다. 수련장 구석에서 무릎을 안고 앉아 있다. "사부님… 저는 아무래도, 이 사문에 안 어울리는 사람인가 봐요. 다들 저만치 앞서가는데, 저만 늘 제자리예요."',
    choices: [
      { key: 'path', label: '너의 길은 의술이다, 흔들리지 마라', effects: { trust: 8, persona: { freedom: 10, mercy: 6 } } },
      { key: 'both', label: '검도 약도 다 사람을 지키는 길이다', effects: { trust: 6, persona: { mercy: 8, integrity: 5 } } },
      { key: 'harder', label: '남들만큼 더 닦으면 된다 한다', effects: { trust: -5, persona: { integrity: 6, freedom: -5 } } },
      { key: 'nocompare', label: '남과 견주지 마라, 네 속도가 있다', effects: { trust: 6, persona: { freedom: 6, prudence: 5 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 8,
    title: '첫 단약(初丹)',
    body: '진소화가 두 손에 작은 단약 다섯 알을 받쳐 들고 온다. 얼굴이 발갛게 상기되어 있다. "사부님, 제가 처음으로 활혈단을 빚었어요! 다섯 알이나 됐어요. 멍이 들거나 피가 막혔을 때 먹으면, 한결 나아질 거예요."',
    choices: [
      { key: 'stock', label: '사문의 상비약으로 갖춰 두자', effects: { trust: 8, persona: { prudence: 8, mercy: 6 } } },
      { key: 'harder', label: '더 어려운 단약에 도전해 보게 한다', effects: { trust: 6, persona: { ambition: 10, prudence: 4 } } },
      { key: 'sell', label: '내다 팔아 보태게 한다', effects: { trust: 4, persona: { ambition: 8, freedom: 4 } } },
      { key: 'praise', label: '동문들 앞에서 크게 칭찬해 준다', effects: { trust: 7, persona: { warmth: 6, ambition: 5 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 9,
    title: '어두운 동문(憫友)',
    body: '진소화가 근심 어린 얼굴로 사부를 찾아온다. "사부님… 가까운 동문 하나가, 요즈음 마음이 너무 어두워 보여요. 밤에 잘 못 자고, 말수도 줄었어요. 제가 어떻게 도울 수 있을까요. 그냥 두고 보기가 힘들어요."',
    choices: [
      { key: 'beside', label: '말없이 곁을 지켜주게 한다', effects: { trust: 8, persona: { mercy: 10, warmth: 8 } } },
      { key: 'together', label: '함께 그 동문을 살피자 한다', effects: { trust: 6, persona: { warmth: 8, mercy: 5 } } },
      { key: 'mind', label: '네 수련이나 챙기라 한다', effects: { trust: -5, persona: { mercy: -6, integrity: 4 } } },
      { key: 'medicine', label: '마음을 진정시킬 단약을 건네게 한다', effects: { trust: 6, persona: { prudence: 6, mercy: 6 } } },
    ],
  },

  // ─── 실전기 (강호의 피·약왕의 자각) ───
  {
    discipleId: 'jin-sohwa',
    year: 10,
    title: '의뢰 동행(從行)',
    body: '동문들이 첫 실전 의뢰를 나서는 날, 진소화가 약상자를 메고 따라나선다. "저도 데려가 주세요. 싸우진 못해도, 뒤에서 다친 사람을 치료할게요. 다친 채로 돌아오는 걸… 그냥 기다리고만 있을 수가 없어요."',
    choices: [
      { key: 'allow', label: '위험을 일러주고 동행을 허락한다', effects: { trust: 8, persona: { integrity: 8, freedom: 6 } } },
      { key: 'stay', label: '이번엔 사문에 남으라 한다', effects: { trust: -4, persona: { prudence: 8, freedom: -5 } } },
      { key: 'guarded', label: '보호 아래 후방에만 두고 데려간다', effects: { trust: 5, persona: { prudence: 6, mercy: 5 } } },
      { key: 'escort', label: '호위를 붙여 함께 보낸다', effects: { trust: 6, persona: { warmth: 6, prudence: 5 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 11,
    title: '눈앞의 죽음(目睹)',
    body: '의뢰 현장, 진소화의 손이 닿기도 전에 동문 하나가 눈앞에서 숨을 거둔다. 피 묻은 손을 떨며 멍하니 앉아 있다가, 사문에 돌아와서도 며칠을 먹지 못한다. "제 손이… 너무 느렸어요. 조금만 더 빨랐으면. 살릴 수 있었을지도 몰라요."',
    choices: [
      { key: 'grieve', label: '그 슬픔을 곁에서 끝까지 들어준다', effects: { trust: 8, persona: { mercy: 10, warmth: 8 } } },
      { key: 'fate', label: '아무리 해도 못 살리는 목숨도 있다 한다', effects: { trust: 5, persona: { mercy: 6, prudence: 6 } } },
      { key: 'forward', label: '그러니 더 정진하라 다잡는다', effects: { trust: 2, persona: { integrity: 6, ambition: 5 } } },
      { key: 'turnaway', label: '지난 일이니 일상으로 돌아가라 한다', effects: { trust: -8, persona: { warmth: -8, mercy: -5 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 12,
    title: '약왕의 자각(藥王)',
    body: '강호의 피를 본 뒤로 진소화는 부쩍 차분해졌다. 어느 저녁, 약상자를 정리하던 손을 멈추고 조용히 말한다. "사부님… 저는 아무래도, 무인이라기보다 의원인 것 같아요. 검보다 약절구가 손에 맞아요. 이게… 도망치는 걸까요."',
    choices: [
      { key: 'sectpath', label: '그 길이 곧 사문의 길이다', effects: { trust: 8, persona: { freedom: 8, mercy: 8 } } },
      { key: 'both', label: '검도 약도 함께 키워 가자', effects: { trust: 6, persona: { mercy: 6, integrity: 5 } } },
      { key: 'fame', label: '이름은 무공에서 나는 법이다 한다', effects: { trust: -5, persona: { ambition: 6, freedom: -5 } } },
      { key: 'self', label: '네가 정한 길을 따르마', effects: { trust: 6, persona: { freedom: 8, prudence: 4 } } },
    ],
  },

  // ─── 정착기 (약방의 꿈·고향·하산) ───
  {
    discipleId: 'jin-sohwa',
    year: 13,
    title: '약방의 꿈(開肆)',
    body: '이제 다 자란 진소화가 오래 품어온 꿈을 꺼낸다. 눈빛이 단단하다. "사부님, 저는 약방을 다시 열고 싶어요. 어머니가 하시던 그 약방을요. 사람들이 아플 때 찾아올 수 있는, 그런 곳을 제 손으로 만들고 싶어요."',
    choices: [
      { key: 'hometown', label: '고향에 그 약방을 다시 열어라', effects: { trust: 8, persona: { warmth: 8, freedom: 6 } } },
      { key: 'bigsect', label: '큰 사문의 의약을 맡아 보는 건 어떠냐', effects: { trust: 5, persona: { ambition: 10, prudence: 5 } } },
      { key: 'wander', label: '떠돌이 의원으로 더 많은 곳을 보아라', effects: { trust: 5, persona: { freedom: 10, mercy: 5 } } },
      { key: 'slow', label: '천천히 채비를 갖춰 가라 한다', effects: { trust: 4, persona: { prudence: 8, ambition: 4 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 14,
    title: '동문의 약속(同歸)',
    body: '함께 자란 한 동문이 진소화에게 나란히 길을 묻는다. 진소화가 상기된 얼굴로 사부에게 전한다. "사부님… 함께 자란 동문이, 졸업하면 같이 마을로 가자고 했어요. 저는 약방을 열고, 그 애는 사람들을 지키는 일을 하고요. 그래도… 될까요?"',
    choices: [
      { key: 'bless', label: '두 사람의 길을 축복해 준다', effects: { trust: 8, persona: { warmth: 10, mercy: 6 } } },
      { key: 'separate', label: '각자 제 길을 먼저 살피라 한다', effects: { trust: 3, persona: { freedom: 6, prudence: 5 } } },
      { key: 'herfirst', label: '소화 네 뜻이 먼저다 한다', effects: { trust: 6, persona: { freedom: 8, integrity: 4 } } },
      { key: 'wider', label: '더 넓은 강호를 보고 정하라 한다', effects: { trust: 4, persona: { ambition: 6, freedom: 5 } } },
    ],
  },
  {
    discipleId: 'jin-sohwa',
    year: 15,
    title: '하산(下山)',
    body: '15년이 흘렀다. 다 자란 진소화가 약상자와 마른 약초 다발을 갈무리하고 사부 앞에 선다. 칼을 끝내 쥐지 못한 손이지만, 그 손으로 헤아릴 수 없이 많은 목숨을 어루만졌다. "사부님, 이제 산을 내려가요. 어디에 있든, 아픈 사람 곁에 있을게요. 지키는 길이 무공만은 아니라는 걸… 제가 증명할게요."',
    choices: [
      { key: 'village', label: '고향에서 마을 의원으로 살아가라', effects: { trust: 8, persona: { warmth: 10, mercy: 8 } } },
      { key: 'companion', label: '함께 자란 동문과 더불어 귀향하라', effects: { trust: 7, persona: { warmth: 8, freedom: 5 } } },
      { key: 'wanderer', label: '떠돌이 의원으로 강호를 누벼라', effects: { trust: 6, persona: { freedom: 10, mercy: 6 } } },
      { key: 'authority', label: '정파 의약을 책임지는 자리에 서라', effects: { trust: 6, persona: { ambition: 10, integrity: 6 } } },
    ],
  },
];
