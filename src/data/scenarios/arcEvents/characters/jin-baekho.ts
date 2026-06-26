import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 진백호(jin-baekho). docs/47·48.
// 자유의 떠돌이 천재를 가두지 않고 인정하며 빚는 15년. 입문 10세 → 24세.
// 흑화 창 = 자유 폭발: 가두거나 방관하는 선택에만 darkness:1. 노선(righteousness)은 약하게.
// 경지 중립(docs/47 §12)·동문 부재 안전(generic "동문")·숨은변수 비노출.
export const JIN_BAEKHO_ARC: ArcEvent[] = [
  // ─── 입문기 (의심 → 신뢰) ───
  {
    discipleId: 'jin-baekho',
    year: 1,
    title: '야반산문(夜半山門)',
    body: '입문 첫날 밤, 봇짐도 없이 산문을 넘으려던 진백호가 동문에게 들켜 끌려온다. 열 살 아이가 어깨를 으쓱하며 사부를 빤히 본다. "여기 묶여 사는 거 싫어요. 저는 그냥 떠돌던 게 편한걸요. 왜 굳이 절 붙잡으세요?"',
    choices: [
      { key: 'bring', label: '밤길을 따라가 직접 데려온다', effects: { trust: 8, persona: { freedom: -6 } } },
      { key: 'wait', label: '산문을 열어둔 채 돌아오기를 기다린다', effects: { trust: 4, persona: { freedom: 8 } } },
      { key: 'send', label: '동문을 보내 함께 돌아오게 한다', effects: { trust: 5, persona: { warmth: 5 } } },
      { key: 'lock', label: '방에 가두어 못 나가게 한다', effects: { trust: -6, darkness: 1, persona: { freedom: -12 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 2,
    title: '일견즉성(一見卽成)',
    body: '검법을 한 번 시연해 보였을 뿐인데, 진백호가 그 자리에서 이론까지 풀어 재현한다. "이거 쉬워요. 벌써 다 알겠는데… 다른 거 주시면 안 돼요? 똑같은 거 반복하는 거, 좀 지루해요."',
    choices: [
      { key: 'all', label: '익힐 진도를 통째로 내어준다', effects: { trust: 5, persona: { ambition: 10 } } },
      { key: 'many', label: '여러 무공을 한꺼번에 풀어준다', effects: { persona: { ambition: 8, freedom: 5 } } },
      { key: 'basic', label: '일부러 기본기만 거듭 다지게 한다', effects: { trust: -3, persona: { prudence: 10 } } },
      { key: 'bind', label: '동문들 속도에 맞춰 묶어둔다', effects: { trust: -5, darkness: 1, persona: { freedom: -10 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 3,
    title: '유잠(遺簪)',
    body: '연무 중 진백호의 품에서 낡은 은비녀가 떨어진다. 주워 든 아이의 눈이 잠시 텅 빈다. "…어머니 거예요. 그날 밤이 가끔 토막토막 떠올라요. 근데 더 떠올리려고 하면 머리가 아파요. 사부님, 저 이거… 어떻게 해요."',
    choices: [
      { key: 'clean', label: '곁에 앉아 함께 비녀를 닦아준다', effects: { trust: 6, persona: { warmth: 10, mercy: 5 } } },
      { key: 'ask', label: '조심스레 그날의 기억을 끌어내 본다', effects: { trust: -3, persona: { prudence: 6 } } },
      { key: 'fill', label: '동문을 불러 곁을 채워준다', effects: { trust: 4, persona: { warmth: 6 } } },
      { key: 'bury', label: '무인은 지난 일을 묻는 법이라 이른다', effects: { trust: -4, persona: { warmth: -6 } } },
    ],
  },

  // ─── 기초기 (산이 좁아진다) ───
  {
    discipleId: 'jin-baekho',
    year: 4,
    title: '출산청(出山請)',
    body: '진백호가 짐을 반쯤 챙겨 들고 찾아온다. "사부님, 사문 무공은 이제 거의 다 익혔어요. 산 아래 마을, 딱 한 번만 다녀올게요. 갇혀만 있으니까 답답해서 미칠 것 같아요."',
    choices: [
      { key: 'guide', label: '직접 데리고 나가 견문을 시켜준다', effects: { trust: 6, persona: { freedom: 10 } } },
      { key: 'newpath', label: '아직 멀었다, 새 수련의 길을 열어준다', effects: { persona: { ambition: 8, prudence: 4 } } },
      { key: 'pair', label: '동문과 둘이서 다녀오게 한다', effects: { trust: 5, persona: { freedom: 6, warmth: 4 } } },
      { key: 'forbid', label: '아직 이르다며 하산을 막는다', effects: { trust: -5, darkness: 1, persona: { freedom: -10 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 5,
    title: '군질(群嫉)',
    body: '진백호 혼자 저만치 앞서 나가자 동문들의 눈빛이 차갑게 식는다. 영문을 모르는 아이가 사부에게 묻는다. "제가 빠른 게 잘못이에요? 봐달라고 한 적도 없는데, 왜 다들 절 미워해요."',
    choices: [
      { key: 'humble', label: '앞설수록 겸손해야 함을 가르친다', effects: { trust: 3, persona: { integrity: 8 } } },
      { key: 'console', label: '뒤처진 동문을 먼저 다독이게 한다', effects: { trust: 4, persona: { warmth: 10, mercy: 5 }, righteousness: 1 } },
      { key: 'teach', label: '깨달음을 나눠 동문을 가르치게 한다', effects: { trust: 3, persona: { warmth: 8, ambition: 4 } } },
      { key: 'ignore', label: '재능 차이는 어쩔 수 없다며 둔다', effects: { trust: -4, darkness: 1, persona: { warmth: -6 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 6,
    title: '강호풍문(江湖風聞)',
    body: '산 아래에서 흘러든 흑사파 소문에 진백호의 눈이 반짝인다. "그런 자들이 진짜 있어요? 무공이 그렇게 사납대요? 사부님, 저 한 번만 멀리서 구경하고 오면 안 돼요?"',
    choices: [
      { key: 'escort', label: '곁에 두고 짧은 견학을 시켜준다', effects: { trust: 4, persona: { freedom: 8, prudence: 4 } } },
      { key: 'pair', label: '믿을 동문과 함께 다녀오게 한다', effects: { trust: 3, persona: { freedom: 5, warmth: 4 } } },
      { key: 'tell', label: '풍문의 위험만 소상히 들려준다', effects: { trust: 3, persona: { prudence: 8 } } },
      { key: 'curb', label: '근처에도 가지 못하게 단속한다', effects: { trust: -3, persona: { freedom: -8 }, righteousness: 1 } },
    ],
  },

  // ─── 무공기 (천재의 외로움) ───
  {
    discipleId: 'jin-baekho',
    year: 7,
    title: '권태(倦怠)',
    body: '무엇을 쥐여줘도 진백호는 금세 끝을 본다. 그런데 요즈음, 아이가 처음으로 멈칫한다. "다 잘 돼요. 너무 잘 돼서 문제예요. 뭘 깊게 파야 할지 모르겠어요. 사부님은 뭘 위해 검을 잡으셨어요?"',
    choices: [
      { key: 'onepath', label: '검 한 길을 끝까지 파라 이른다', effects: { trust: 3, persona: { ambition: 8, prudence: 6 }, righteousness: 1 } },
      { key: 'manypath', label: '여러 무공을 아우르는 천재의 길로 이끈다', effects: { persona: { ambition: 10, freedom: 5 } } },
      { key: 'broad', label: '폭넓게 두루 익혀 보라 한다', effects: { trust: 3, persona: { freedom: 6, prudence: 4 } } },
      { key: 'self', label: '무엇을 팔지 스스로 정하게 둔다', effects: { trust: 5, persona: { freedom: 8 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 8,
    title: '질화(嫉火)',
    body: '한 동문이 "넌 재능으로 거저 먹잖아"라고 쏘아붙이자, 늘 웃던 진백호가 처음으로 차갑게 받아친다. 둘 사이에 불꽃이 튄다. "제가 노력 안 했다는 거예요? …사부님, 제가 사과할 일이에요, 이게?"',
    choices: [
      { key: 'bow', label: '먼저 고개 숙여 화해하게 한다', effects: { trust: -2, persona: { integrity: 6, mercy: 5 } } },
      { key: 'embrace', label: '폭발한 동문을 도리어 끌어안게 한다', effects: { trust: 4, persona: { warmth: 10, mercy: 8 } } },
      { key: 'team', label: '둘을 한 조로 묶어 의뢰로 풀게 한다', effects: { trust: 4, persona: { warmth: 6 } } },
      { key: 'sidestep', label: '제 일 아니라며 비켜선다', effects: { trust: -4, darkness: 1, persona: { warmth: -6 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 9,
    title: '하인(何人)',
    body: '밤늦게 찾아온 진백호가 처음으로 약한 얼굴을 보인다. "저는 어떤 사람이 될까요. 무공은 자꾸 강해지는데, 정작 제가 뭘 하고 싶은지는 답이 안 나와요. 강하기만 한 게 무슨 소용이죠?"',
    choices: [
      { key: 'sword', label: '자유로운 검의 거두가 되라 한다', effects: { trust: 4, persona: { freedom: 8, ambition: 6 } } },
      { key: 'lord', label: '강호를 이끄는 맹주를 향하라 한다', effects: { persona: { ambition: 12 }, righteousness: 2 } },
      { key: 'sect', label: '네 문파를 세워보라 한다', effects: { persona: { ambition: 10, freedom: 5 } } },
      { key: 'within', label: '답은 네 안에 있다, 스스로 찾으라 한다', effects: { trust: 6, persona: { freedom: 8, prudence: 4 } } },
    ],
  },

  // ─── 실전기 (정점의 벽) ───
  {
    discipleId: 'jin-baekho',
    year: 10,
    title: '흑사토벌(黑邪討伐)',
    body: '흑사파 토벌 의뢰가 떨어지자 진백호가 가장 먼저 손을 든다. 늘 제멋대로이던 아이가 처음으로 남을 위해 나선다. "제가 갈게요. 동문들 다치는 거… 보기 싫어서요. 제가 제일 빠르잖아요."',
    choices: [
      { key: 'solo', label: '단독으로 보내 명성을 쌓게 한다', effects: { trust: 3, persona: { ambition: 8, freedom: 5 } } },
      { key: 'together', label: '동문과 함께 보낸다', effects: { trust: 4, persona: { warmth: 8, mercy: 5 } } },
      { key: 'guarded', label: '노련한 동문을 붙여 보호받게 한다', effects: { trust: 4, persona: { prudence: 6, mercy: 5 } } },
      { key: 'refuse', label: '위험하다며 출진을 거절한다', effects: { trust: -4, persona: { freedom: -8, mercy: -4 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 11,
    title: '쌍성(雙星)',
    body: '진백호와 어깨를 나란히 한 또래 동문이 같은 정점을 노린다. 진백호가 묘한 얼굴로 사부를 찾는다. "그 동문도 무림맹주가 되고 싶다고요? …재밌네요. 근데 둘 다는 못 되는 거잖아요. 저, 어떻게 해야 해요?"',
    choices: [
      { key: 'ally', label: '서로를 동맹으로 묶어준다', effects: { trust: 4, persona: { warmth: 8, ambition: 4 }, righteousness: 1 } },
      { key: 'divide', label: '각자 다른 길을 가도록 가른다', effects: { trust: 3, persona: { prudence: 6, freedom: 5 } } },
      { key: 'yield', label: '한 발 양보하기를 권한다', effects: { persona: { mercy: 6, ambition: -4 } } },
      { key: 'goad', label: '부추겨 정면으로 겨루게 한다', effects: { trust: -3, darkness: 1, persona: { ambition: 10, warmth: -5 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 12,
    title: '초벽(初壁)',
    body: '직감으로 모든 것을 넘던 진백호가, 처음으로 넘지 못하는 벽 앞에 선다. 며칠을 끙끙대던 아이가 입술을 깨문다. "아무리 해도 안 돼요. 이런 거 처음이에요. …이럴 거면 그냥 자유롭게 강호나 떠돌까 봐요. 진짜로요."',
    choices: [
      { key: 'seclude', label: '폐관에 들어 정면으로 돌파하게 한다', effects: { trust: 3, persona: { prudence: 10 } } },
      { key: 'field', label: '실전과 대련 속에서 깨닫게 한다', effects: { persona: { prudence: 6, ambition: 5 } } },
      { key: 'spar', label: '진검 대련 상대를 붙여준다', effects: { trust: 3, persona: { ambition: 8, freedom: 4 } } },
      { key: 'wander', label: '잠시 산을 떠나 스스로 답을 찾게 한다', effects: { trust: 5, persona: { freedom: 10 } } },
    ],
  },

  // ─── 정착기 (확립·하산) ───
  {
    discipleId: 'jin-baekho',
    year: 13,
    title: '문심(問心)',
    body: '다 자란 진백호가 드물게 진지한 얼굴로 마주 앉는다. "사문이 답답한 건… 솔직히 사실이에요. 근데 그날 절 거두어주신 건 진심으로 감사해요. 사부님, 혹시 저 때문에 양육이 부족했다고 자책하세요? 그게… 제일 무서워요."',
    choices: [
      { key: 'yours', label: '네 길은 네 것, 자유로운 검의 정점에 서라 한다', effects: { trust: 6, persona: { freedom: 10 } } },
      { key: 'duty', label: '자유엔 책임 하나가 따른다고 일러준다', effects: { trust: 4, persona: { integrity: 6, prudence: 5 } } },
      { key: 'nocage', label: '사문은 결코 너를 가두지 않는다 답한다', effects: { trust: 5, persona: { freedom: 8, warmth: 6 } } },
      { key: 'essence', label: '부족한 게 아니라 네 본질이 자유였을 뿐이라 한다', effects: { trust: 8, persona: { freedom: 10, mercy: 8 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 14,
    title: '거취(去就)',
    body: '하산이 가까워지자 진백호가 떠날지 남을지를 두고 흔들린다. 한 동문이 어깨를 툭 친다. "어디로 가든 우린 동문이야." 진백호가 사부를 본다. "저… 진짜 떠나도 돼요? 그래도 여기가 제 사문 맞죠?"',
    choices: [
      { key: 'bond', label: '형제의 약속으로 자유와 사문을 잇게 한다', effects: { trust: 8, persona: { warmth: 10, freedom: 6 } } },
      { key: 'bless', label: '떠나는 길까지 축복해 보낸다', effects: { trust: 5, persona: { freedom: 12 } } },
      { key: 'hold', label: '규율을 들어 사문에 붙잡아둔다', effects: { trust: -6, darkness: 1, persona: { freedom: -12 } } },
      { key: 'entrust', label: '거취를 전적으로 본인에게 맡긴다', effects: { trust: 4, persona: { freedom: 8 } } },
    ],
  },
  {
    discipleId: 'jin-baekho',
    year: 15,
    title: '하산(下山)',
    body: '열다섯 해를 채운 진백호가 어머니의 은비녀를 품에 갈무리하고 산문 앞에 선다. 떠돌이로 끌려온 아이는 어느새 강호가 좁다 할 무인이 되었다. "사부님, 저 이제 갈게요. …이 산에서 보낸 시간만큼은, 떠돌던 어디보다 제 집 같았어요." 진백호가 어디로 향할지, 그 마지막 결단을 사부가 함께 짓는다.',
    choices: [
      { key: 'free-sword', label: '얽매이지 않는 자유로운 검의 거두로 강호에 나선다', effects: { trust: 6, persona: { freedom: 10, ambition: 5 } } },
      { key: 'lord', label: '뭇 무인을 이끄는 무림맹주의 길로 오른다', effects: { trust: 5, persona: { ambition: 12 }, righteousness: 2 } },
      { key: 'founder', label: '백호문을 열어 일대종사로 우뚝 선다', effects: { trust: 5, persona: { ambition: 10, freedom: 6 } } },
      { key: 'nameless', label: '사문도 강호도 끊고 무명의 떠돌이로 사라진다', effects: { trust: -6, darkness: 1, persona: { freedom: 8 }, righteousness: -2 } },
    ],
  },
];
