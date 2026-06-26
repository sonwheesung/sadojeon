import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 사천화(sa-cheonhwa). docs/47·48.
// 결: 사천 의가(독·해독·가전 비전)의 딸. 외부의 그늘을 견디며 "어둠을 약으로 갚을지 독으로 갚을지" 정한다.
// 흑화 창 = 복수의 약독사 — 어둠을 독으로 갚는 선택에만 darkness:1.
// 경지 중립(docs/47 §12) · 동문 비지명(가까운 동문/마음이 어두운 한 동문) · 숨은변수 비노출.
export const SA_CHEONHWA_ARC: ArcEvent[] = [
  // ── 입문기 (정중한 거리·사문 안전) ──
  {
    discipleId: 'sa-cheonhwa',
    year: 1,
    title: '배문(拜門)',
    body: '일곱 살 아이가 약초 냄새가 밴 작은 주머니를 허리에 차고 또박또박 절을 올린다. "어머니의 가르침으로 왔습니다. 잘 부탁드립니다, 사부님." 곁의 동문들이 다가가려 하자, 천화는 한 걸음 물러서며 단정히 손을 모은다.',
    choices: [
      { key: 'observe', label: '서두르지 않고 곁에서 지켜본다', effects: { trust: 6, persona: { warmth: 8, prudence: 4 } } },
      { key: 'etiquette', label: '먼저 사문의 예법부터 가르친다', effects: { trust: 4, persona: { integrity: 8, prudence: 5 } } },
      { key: 'garden', label: '약초밭 한 켠을 내어준다', effects: { trust: 5, persona: { warmth: 6, ambition: 4 } } },
      { key: 'pair', label: '한방을 정해 곁을 채워 준다', effects: { trust: 4, persona: { warmth: 5, freedom: -4 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 2,
    title: '이객(異客)',
    body: '산문을 다녀온 천화가 사부를 조용히 찾는다. "사부님, 어제 들른 손님요. 저를 보는 게 아니라… 제가 찬 주머니를 보는 눈이었어요. 우리 집 비전을 아는 눈이에요." 여덟 살의 통찰치고는 너무 또렷하다.',
    choices: [
      { key: 'trace', label: '그 손님의 뒤를 조용히 캔다', effects: { trust: 4, persona: { prudence: 10 } } },
      { key: 'gather', label: '섣불리 움직이지 말고 정보만 모은다', effects: { trust: 4, persona: { prudence: 8 } } },
      { key: 'confine', label: '한동안 사문 밖으로 못 나가게 한다', effects: { trust: 3, persona: { prudence: 5, freedom: -5 } } },
      { key: 'dismiss', label: '아이의 기우라며 흘려듣는다', effects: { trust: -4, persona: { warmth: -5 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 3,
    title: '동근(同根)',
    body: '천화가 약초를 다루는 손길에 가까운 동문 몇이 모여든다. 서로 약재를 묻고 가르치며 작은 무리가 생겼다. "사부님, 같이 하면 더 멀리 갈 수 있을 것 같아요. 그런데… 제가 다 떠안아야 하는 걸까요?" 자존심과 호기심이 뒤엉킨 얼굴.',
    choices: [
      { key: 'together', label: '셋이 합동으로 약초를 다루게 한다', effects: { trust: 4, persona: { warmth: 8, ambition: 5 } } },
      { key: 'teach', label: '천화에게 가르치는 역할을 맡긴다', effects: { trust: 4, persona: { ambition: 8, warmth: 5 } } },
      { key: 'solo', label: '혼자 더 깊이 파고들게 둔다', effects: { persona: { ambition: 8, freedom: 5 } } },
      { key: 'apart', label: '괜한 다툼이 날까 거리를 두게 한다', effects: { trust: -3, persona: { warmth: -5 } } },
    ],
  },

  // ── 기초기 (독을 다스리는 손) ──
  {
    discipleId: 'sa-cheonhwa',
    year: 4,
    title: '지초(指初)',
    body: '천화가 살아 있는 독초를 손끝에 올린 채 사부를 본다. "이건 무거운 거예요. 잘못 다루면 사람이 상해요. 단, 저는 준비됐어요. 손끝으로 다루는 법, 가르쳐 주세요." 떨림 없는 손가락이 오히려 서늘하다.',
    choices: [
      { key: 'poison', label: '가전의 독공을 본격적으로 가르친다', effects: { trust: 4, persona: { ambition: 10 }, righteousness: -1 } },
      { key: 'cure', label: '독보다 해독을 먼저 손에 익히게 한다', effects: { trust: 4, persona: { mercy: 6, integrity: 6 }, righteousness: 1 } },
      { key: 'safe', label: '안전한 약재부터 차근히 다루게 한다', effects: { persona: { prudence: 8 } } },
      { key: 'watch', label: '반드시 사부의 감독 아래서만 허락한다', effects: { trust: 3, persona: { integrity: 8, prudence: 5 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 5,
    title: '가서(家書)',
    body: '집에서 온 서신을 읽던 천화의 손끝이 가늘게 떨린다. "비전을 노리는 그림자가 점점 짙어진대요. 아버지가… 조심하라고만." 평소의 침착함이 처음으로 흔들린다.',
    choices: [
      { key: 'comfort', label: '곁에서 오래 다독여 준다', effects: { trust: 6, persona: { warmth: 10 } } },
      { key: 'investigate', label: '바깥 정세를 깊이 알아봐 준다', effects: { trust: 4, persona: { prudence: 8 } } },
      { key: 'reply', label: '답장을 함께 써 준다', effects: { trust: 5, persona: { warmth: 6 } } },
      { key: 'visit', label: '사부가 직접 그 집을 찾아가 본다', effects: { trust: 8, persona: { warmth: 5 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 6,
    title: '동영(同影)',
    body: '천화가 마음이 어두운 한 동문을 가만히 바라보다 사부에게 말한다. "저 사람, 저랑 결이 비슷해요. 무거운 걸 안고 있는 결요. 단, 가는 길은 달라요. 제가… 약이 되어 줄 수 있을까요?"',
    choices: [
      { key: 'befriend', label: '곁에 가까이 붙어 있게 한다', effects: { trust: 4, persona: { warmth: 8, mercy: 8 } } },
      { key: 'heal', label: '약으로 그 동문을 돕게 한다', effects: { trust: 4, persona: { mercy: 10, warmth: 5 } } },
      { key: 'unravel', label: '그 어두운 결을 천천히 풀어 주게 한다', effects: { trust: 5, persona: { mercy: 8, warmth: 6 } } },
      { key: 'distance', label: '괜히 물들까 거리를 지키게 한다', effects: { trust: -3, persona: { prudence: 6, warmth: -4 } } },
    ],
  },

  // ── 무공기 (깨달음 벽·사문에 닿는 그늘) ──
  {
    discipleId: 'sa-cheonhwa',
    year: 7,
    title: '오벽(悟壁)',
    body: '손끝의 기예는 한껏 무르익었으나, 천화는 보이지 않는 벽 앞에서 멈춰 섰다. "여기서부터는 아무리 손을 뻗어도 끝이 안 보여요. 뭘 놓치고 있는 걸까요." 조급함을 애써 누른 목소리.',
    choices: [
      { key: 'seclude', label: '홀로 깊이 파고들 시간을 준다', effects: { trust: 3, persona: { prudence: 10, integrity: 5 } } },
      { key: 'peers', label: '가까운 동문들과 함께 풀어 보게 한다', effects: { trust: 4, persona: { warmth: 6, ambition: 4 } } },
      { key: 'field', label: '의뢰 현장에 내보내 부딪히게 한다', effects: { trust: 3, persona: { integrity: 8, ambition: 5 } } },
      { key: 'rest', label: '잠시 손을 놓고 쉬게 한다', effects: { trust: 4, persona: { warmth: 5, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 8,
    title: '독약지간(毒藥之間)',
    body: '천화가 약재를 가르며 사부에게 묻는다. "사람을 해할 독을 알아야, 사람을 살리는 약도 안다고 어머니가 그러셨어요. 그게… 정말일까요? 저는 어느 쪽 손이어야 해요?" 가전의 무게가 처음으로 질문이 된다.',
    choices: [
      { key: 'life', label: '오직 살리는 법만을 손에 들려 준다', effects: { trust: 4, persona: { mercy: 10 }, righteousness: 1 } },
      { key: 'both', label: '독을 알아야 한다는 진실을 직시하게 한다', effects: { trust: 3, persona: { integrity: 8, prudence: 5 } } },
      { key: 'choose', label: '천화 스스로 판단하게 맡긴다', effects: { trust: 4, persona: { freedom: 8 } } },
      { key: 'caution', label: '가전의 무게로 그 손을 경계시킨다', effects: { persona: { prudence: 6, integrity: 5 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 9,
    title: '차화(借禍)',
    body: '정탐꾼이 천화를 노리다 곁의 동문까지 위협했다. 천화가 새파랗게 질린 얼굴로 사부 앞에 무릎을 꿇는다. "저 때문이에요. 저만 없었으면 그 사람이 다치지 않았을 텐데…"',
    choices: [
      { key: 'guard', label: '사문 전체의 경계를 끌어올린다', effects: { trust: 5, persona: { prudence: 8 } } },
      { key: 'hide', label: '천화를 잠시 안전한 곳으로 피신시킨다', effects: { trust: 4, persona: { prudence: 6, warmth: 4 } } },
      { key: 'hunt', label: '사주한 자를 역으로 추적한다', effects: { trust: 4, persona: { integrity: 6, ambition: 5 } } },
      { key: 'defend', label: '스스로를 지키는 법을 가르친다', effects: { trust: 4, persona: { integrity: 8, mercy: 4 } } },
    ],
  },

  // ── 실전기 (가문의 운명) ──
  {
    discipleId: 'sa-cheonhwa',
    year: 10,
    title: '가위(家危)',
    body: '급보가 날아든다. 비전을 노리던 자들이 끝내 집으로 들이닥쳤고, 아버지가 크게 다쳤다 한다. 천화가 짐을 챙기다 멈춰 사부를 본다. "사부님… 저는 가문이 우선인가요, 사문이 우선인가요. 솔직히 말씀해 주세요."',
    choices: [
      { key: 'gohome', label: '망설이지 말고 곧장 집으로 보낸다', effects: { trust: 5, persona: { warmth: 8 }, righteousness: 1 } },
      { key: 'gowith', label: '사부가 직접 도우러 함께 간다', effects: { trust: 8, persona: { warmth: 6 } } },
      { key: 'escort', label: '동문과 함께 호위하여 돌려보낸다', effects: { trust: 4, persona: { integrity: 6, warmth: 5 } } },
      { key: 'avenge', label: '가전의 독으로 그자들을 갚으라 한다', effects: { darkness: 1, persona: { ambition: 6 }, righteousness: -2 } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 11,
    title: '자영(刺影)',
    body: '사문에 살수가 숨어들었고, 표적은 천화다. 단검을 막아선 천화의 손이 약독 주머니로 향한다. 처음으로 사람에게 독을 겨눌 수 있는 순간. "사부님… 제가 이 손을 써도 되나요?"',
    choices: [
      { key: 'defense', label: '사문 전체로 방어진을 친다', effects: { trust: 5, persona: { integrity: 8, prudence: 5 } } },
      { key: 'shelter', label: '천화를 안전한 곳으로 물린다', effects: { trust: 4, persona: { warmth: 6, prudence: 4 } } },
      { key: 'track', label: '큰 의뢰를 걸어 사주자를 추적한다', effects: { trust: 3, persona: { ambition: 8, integrity: 4 } } },
      { key: 'strike', label: '가전의 독으로 스스로 베어 막게 한다', effects: { darkness: 1, persona: { integrity: 6 }, righteousness: -1 } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 12,
    title: '약왕회(藥王會)',
    body: '강호의 의가들이 모이는 큰 대회 소식에 천화의 눈이 오랜만에 빛난다. "우리 집 약을 강호에 펴고 싶어요. 어머니가 못다 한 일이에요. 사부님, 저 나가도 될까요?"',
    choices: [
      { key: 'solo', label: '홀로 당당히 출전하게 한다', effects: { trust: 4, persona: { ambition: 10, freedom: 5 } } },
      { key: 'peers', label: '가까운 동문들과 함께 나가게 한다', effects: { trust: 4, persona: { ambition: 6, warmth: 6 } } },
      { key: 'back', label: '사부가 동행하여 뒤를 받쳐 준다', effects: { trust: 8, persona: { ambition: 5 } } },
      { key: 'decline', label: '아직 이르다며 다음을 기약한다', effects: { trust: -3, persona: { prudence: 6, ambition: -5 } } },
    ],
  },

  // ── 정착기 (어둠을 어떻게 갚을 것인가·하산) ──
  {
    discipleId: 'sa-cheonhwa',
    year: 13,
    title: '이심(二心)',
    body: '천화가 오래 벼른 질문을 꺼낸다. "사부님. 어둠을 어둠으로 갚아야 하나요. 약으로 갚아야 하나요. 저를 위로하지 마시고, 단정히 가르쳐 주세요." 약왕의 길과 약독사의 길이 한 손에 놓여 있다.',
    choices: [
      { key: 'heal', label: '사람을 살리는 활인의 길로 붙든다', effects: { trust: 4, persona: { mercy: 12 }, righteousness: 2 } },
      { key: 'justice', label: '복수가 아닌 정의로 갚으라 이른다', effects: { trust: 4, persona: { integrity: 10 }, righteousness: 1 } },
      { key: 'respect', label: '천화의 결심을 있는 그대로 존중한다', effects: { trust: 4, persona: { freedom: 8 } } },
      { key: 'avenge', label: '가문의 한을 독으로 갚으라 함께 짊어진다', effects: { darkness: 1, persona: { ambition: 6 }, righteousness: -2 } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 14,
    title: '출로(出路)',
    body: '스물을 넘긴 천화가 제 길을 그려 보인다. "가전을 잇되, 사람을 살리는 의가를 만들고 싶어요. 독을 아는 손으로, 더 많은 사람을 살리는 거예요. 욕심일까요?"',
    choices: [
      { key: 'rebuild', label: '무너진 가전을 다시 세우게 돕는다', effects: { trust: 4, persona: { ambition: 8, integrity: 5 }, righteousness: 1 } },
      { key: 'master', label: '약왕·해독사의 길을 활짝 열어 준다', effects: { trust: 4, persona: { ambition: 10, freedom: 5 } } },
      { key: 'orthodox', label: '정파의 명사로 이름을 세우게 한다', effects: { trust: 4, persona: { integrity: 6 }, righteousness: 2 } },
      { key: 'own', label: '무엇이 되든 본인 뜻에 맡긴다', effects: { trust: 4, persona: { freedom: 8 } } },
    ],
  },
  {
    discipleId: 'sa-cheonhwa',
    year: 15,
    title: '하산(下山)',
    body: '떠나는 날, 천화가 약독 주머니를 단단히 갈무리하고 처음 들어오던 날처럼 또박또박 절을 올린다. "잊지 않을게요. 평생. 이 손이 무엇이 될지는… 이제 제가 정할게요." 어떤 길을 향해 산문을 나설지가 사부의 마지막 한마디에 갈린다.',
    choices: [
      { key: 'rebuild', label: '가전의 의가를 다시 일으키라 보낸다', effects: { trust: 6, persona: { warmth: 8, ambition: 6 }, righteousness: 1 } },
      { key: 'master', label: '약왕·해독사의 길로 떠나보낸다', effects: { trust: 5, persona: { ambition: 8, freedom: 5 } } },
      { key: 'ally', label: '정파 명사들과 손잡는 길로 보낸다', effects: { trust: 5, persona: { integrity: 8 }, righteousness: 2 } },
      { key: 'venom', label: '못다 갚은 한을 독으로 갚는 길을 막지 않는다', effects: { darkness: 1, persona: { ambition: 6 }, righteousness: -2 } },
    ],
  },
];
