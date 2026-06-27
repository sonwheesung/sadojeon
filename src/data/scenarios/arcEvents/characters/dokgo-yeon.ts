import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 독고연(dokgo-yeon). docs/47·48.
// 멸문 명문(독고세가)의 마지막 검. 흑화 창=복수. 입문 8세 → 22세, 닫힌 문에서 점차 어른의 결단으로.
// 노선 분기: 복수의 검 ↔ 정의의 검(righteousness ±1~2). darkness(+1)은 복수에 기우는 선택에만.
// 동문 부재 안전: 멸문 협력자는 "한 무관"·"어떤 자"로 일반화, 진실은 흑사파 서신/풍문으로 단독 성립(11·13·14).
// 경지 중립(docs/47 §12): 7번 '검의 물음'도 경지·숙련단계 단어 없이 가치 질문으로(숨은변수 노출 금지 — 심마·소성 등).
export const DOKGO_YEON_ARC: ArcEvent[] = [
  // ─── 입문기(1~3) — 닫힌 문·거리감 ───
  {
    discipleId: 'dokgo-yeon',
    year: 1,
    title: '독고의 검(獨孤之劍)',
    body: '입문 첫날부터 독고연은 아무에게도 곁을 주지 않는다. 그러다 사부 앞에 홀로 서서, 처음으로 입을 연다. "사부님, 정통 검법을 가르쳐 주세요. 저는… 우리 가문의 검을 다시 잇고 싶어요."',
    choices: [
      { key: 'pride', label: '그 자존심을 인정하고 곁을 내준다', effects: { trust: 8, persona: { warmth: 10, mercy: 5 } } },
      { key: 'rule', label: '검을 잡기 전에 규율부터 가르친다', effects: { trust: -4, persona: { integrity: 10, freedom: -5 } } },
      { key: 'listen', label: '가문의 사연부터 천천히 들어준다', effects: { trust: 6, persona: { warmth: 8, mercy: 6 } } },
      { key: 'adapt', label: '알아서 적응하도록 내버려 둔다', effects: { trust: -4, persona: { freedom: 5 } } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 2,
    title: '반옥(半玉)',
    body: '독고연이 검 한 자락을 시연해 보인다. 사문 검법에 없는, 물 흐르듯 부드러운 초식. 목에는 깨진 옥패 반쪽이 걸려 있다. "어머니가… 가르쳐주신 거예요." 그러다 마당 한구석, 낯선 무관의 인장패를 보고는 손이 멎고 얼굴이 굳는다.',
    choices: [
      { key: 'blend', label: '가전 검과 사문 검을 함께 잇게 한다', effects: { trust: 6, persona: { integrity: 8, ambition: 4 } } },
      { key: 'focus', label: '우선 사문 정통 검법에 집중시킨다', effects: { trust: 4, persona: { integrity: 6, freedom: -4 }, righteousness: 1 } },
      { key: 'meet', label: '굳은 얼굴의 까닭을 조용히 들어준다', effects: { trust: 8, persona: { warmth: 8, mercy: 5 } } },
      { key: 'alone', label: '혼자 매달리도록 내버려 둔다', effects: { trust: -4, persona: { freedom: 5, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 3,
    title: '가항의 그림자(街巷之影)',
    body: '산문에 든 손님의 옷자락을 독고연이 놓지 않는다. "그 무관을 아는 분을 데려와 주세요. 우리 가문이 어떻게 됐는지, 누가 그랬는지 알아야 해요." 작은 손이 떨리고 있다.',
    choices: [
      { key: 'public', label: '손님 앞에서 공개로 책망한다', effects: { trust: -5, persona: { integrity: 8, warmth: -4 } } },
      { key: 'close', label: '폐관에 들여 마음을 가라앉힌다', effects: { trust: -2, persona: { prudence: 8, freedom: -5 } } },
      { key: 'together', label: '함께 사과하고, 흑사파의 일이라 짚어준다', effects: { trust: 8, persona: { warmth: 6, mercy: 4 }, righteousness: 1 } },
      { key: 'ignore', label: '소란을 무마하고 더 묻지 않는다', effects: { trust: 2, persona: { prudence: 4 } } },
    ],
  },

  // ─── 기초기(4~6) — 검의 뿌리·갈림길 ───
  {
    discipleId: 'dokgo-yeon',
    year: 4,
    title: '사검의 유혹(邪劍之惑)',
    body: '독고연이 어디서 구했는지 흑사파의 검결 한 권을 펼쳐 들고 있다. "사부님, 이 검결이… 복수에 결이 닿을 것 같아요. 강한 검이라면, 뭐든 상관없지 않나요?"',
    choices: [
      { key: 'seize', label: '검결을 압수하고 엄히 책망한다', effects: { trust: -4, persona: { integrity: 10 }, righteousness: 1 } },
      { key: 'close', label: '폐관에 들여 마음을 다스리게 한다', effects: { trust: -2, persona: { prudence: 8, freedom: -5 } } },
      { key: 'restore', label: '가전 검 복원을 함께 시작한다', effects: { trust: 8, persona: { warmth: 6, mercy: 5 }, righteousness: 1 } },
      { key: 'leave', label: '굳이 빼앗지 않고 그 자리에 둔다', effects: { trust: 4, darkness: 1, persona: { freedom: 5 }, righteousness: -1 } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 5,
    title: '가검복원(家劍復元)',
    body: '가전 검을 한 초식씩 되살리던 독고연이 벽에 부딪힌다. "마지막 한 초식이… 비어 있어요. 어머니도 끝내 못 가르치셨어요." 빈 자리를 바라보는 눈에 조급함이 어린다.',
    choices: [
      { key: 'fuse', label: '사문 초식으로 빈자리를 메워 융합시킨다', effects: { trust: 4, persona: { ambition: 8, prudence: 5 } } },
      { key: 'origin', label: '옛 비급을 수소문해 원형을 찾아준다', effects: { trust: 6, persona: { integrity: 6, prudence: 5 } } },
      { key: 'empty', label: '비운 채로 두는 법을 가르친다', effects: { trust: 4, persona: { prudence: 10 } } },
      { key: 'self', label: '스스로 채우도록 본인에게 맡긴다', effects: { trust: 4, persona: { freedom: 6 } } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 6,
    title: '흑사의 그늘(黑邪之蔭)',
    body: '어느 밤 독고연이 사부를 찾아와 정면으로 묻는다. "사부님은 아실 거예요. 우리 가문 멸문에… 누가 협력했나요? 저는 알 자격이 있어요."',
    choices: [
      { key: 'deep', label: '아는 단서까지 깊이 일러준다', effects: { trust: 8, persona: { ambition: 5 }, righteousness: -1 } },
      { key: 'general', label: '알려진 정보만 들려준다', effects: { trust: 4, persona: { prudence: 5 } } },
      { key: 'hide', label: '아직은 모르는 척 덮어둔다', effects: { trust: -4, persona: { warmth: 4, prudence: 4 } } },
      { key: 'justice', label: '정의를 가르치며 최소한만 알려준다', effects: { trust: 4, persona: { integrity: 8, mercy: 5 }, righteousness: 1 } },
    ],
  },

  // ─── 무공기(7~9) — 복수와 정의의 칼날 ───
  {
    discipleId: 'dokgo-yeon',
    year: 7,
    title: '검의 물음(問劍)',
    body: '오래 검과 씨름하던 어느 날, 독고연이 검을 거두며 묻는다. "사부님, 검은 누구를 위한 것일까요. 제 검이 무엇을 베어야 하는지… 한 마디만 정해 주세요." 그 한 마디가 검의 빛깔을 정할 듯하다.',
    choices: [
      { key: 'people', label: '사람을 지키기 위한 것이라 답한다', effects: { trust: 6, persona: { warmth: 8, mercy: 8 }, righteousness: 2 } },
      { key: 'dark', label: '복수의 검은 끝내 너를 어둠으로 데려간다 일러준다', effects: { trust: 5, persona: { prudence: 8, mercy: 5 }, righteousness: 1 } },
      { key: 'cut', label: '베어야 할 것은 베라 답한다', effects: { trust: 4, darkness: 1, persona: { ambition: 6 }, righteousness: -1 } },
      { key: 'none', label: '스스로 깨치라며 답하지 않는다', effects: { trust: -3, persona: { freedom: 5 } } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 8,
    title: '복수와 정의(復讐與正義)',
    body: '독고연이 검끝을 내려다보며 낮게 말한다. "만약… 그 자가, 우리 가문이 무너지던 그 자리에 있었다면. 저는 어떻게 해야 하죠. 베어야 하나요, 아니면…"',
    choices: [
      { key: 'doubt', label: '진실이 밝혀지기 전엔 의심을 키우지 말라 한다', effects: { trust: 4, persona: { prudence: 10, mercy: 5 }, righteousness: 1 } },
      { key: 'together', label: '함께 진실을 찾아보자 약속한다', effects: { trust: 8, persona: { warmth: 6, integrity: 5 }, righteousness: 1 } },
      { key: 'self', label: '네 마음이 정하라며 맡긴다', effects: { persona: { freedom: 6, prudence: 4 } } },
      { key: 'slay', label: '죄가 있다면 베라 답한다', effects: { trust: 4, darkness: 1, persona: { ambition: 6 }, righteousness: -2 } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 9,
    title: '옥의 나머지(玉之餘)',
    body: '저잣거리에서 독고연이 잃어버린 옥패의 나머지 반쪽과 꼭 닮은 물건을 보았다 한다. "그 옥패의 주인을 쫓으면… 가문을 무너뜨린 자에게 닿을 것 같아요. 단서가 한 무관 가문을 가리켜요."',
    choices: [
      { key: 'together', label: '함께 단서를 차분히 조사해 준다', effects: { trust: 8, persona: { integrity: 5, prudence: 5 }, righteousness: 1 } },
      { key: 'relic', label: '유품 회수만 돕고 추적은 막는다', effects: { trust: 4, persona: { mercy: 5, prudence: 5 } } },
      { key: 'ignore', label: '지난 일이라며 덮게 한다', effects: { trust: -4, persona: { warmth: 4 } } },
      { key: 'alone', label: '혼자 추적하도록 둔다', effects: { trust: 4, darkness: 1, persona: { freedom: 6 }, righteousness: -1 } },
    ],
  },

  // ─── 실전기(10~12) — 진실 직면 ───
  {
    discipleId: 'dokgo-yeon',
    year: 10,
    title: '흑사토벌(黑邪討伐)',
    body: '흑사파 잔당 토벌 의뢰가 들어왔다. 독고연이 먼저 나선다. "제가 가겠어요." 그런데 의뢰지 한쪽에, 옛 가문과 얽힌 낡은 서신 한 통이 끼어 있다.',
    choices: [
      { key: 'allow', label: '믿고 보낸다', effects: { trust: 8, persona: { ambition: 6 }, righteousness: 1 } },
      { key: 'deny', label: '아직 이르다며 막는다', effects: { trust: -4, persona: { prudence: 6, freedom: -4 } } },
      { key: 'escort', label: '의로운 동문과 함께 보낸다', effects: { trust: 6, persona: { warmth: 6 }, righteousness: 2 } },
      { key: 'watch', label: '사부가 동행해 곁을 지킨다', effects: { trust: 6, persona: { mercy: 5, prudence: 5 } } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 11,
    title: '고서신(古書信)',
    body: '토벌 중 거둔 흑사파의 옛 서신 더미에서, 독고연이 한 장을 떨리는 손으로 펼친다. "…한 무관이 넘긴 정보 덕에 독고세가 멸문이 성사되었다…" 종이를 쥔 손마디가 하얗게 질린다. "찾았어요. 누가 우리 가문을 팔았는지."',
    choices: [
      { key: 'master', label: '서신을 받아 진실을 차분히 정리해 준다', effects: { trust: 8, persona: { prudence: 8, mercy: 5 }, righteousness: 1 } },
      { key: 'victim', label: '그 무관도 강요받은 피해자일 수 있다 일러준다', effects: { trust: 5, persona: { warmth: 6, mercy: 8 }, righteousness: 1 } },
      { key: 'anger', label: '분노를 인정하고 복수를 준비하게 한다', effects: { trust: 4, darkness: 1, persona: { ambition: 8 }, righteousness: -2 } },
      { key: 'isolate', label: '서신을 본인 손에만 쥐여 준다', effects: { trust: -4, darkness: 1, persona: { freedom: 5 }, righteousness: -1 } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 12,
    title: '살기의 칼날(殺氣之刃)',
    body: '폐관에 든 독고연의 검에서 섬뜩한 살기가 흐른다. 새벽, 옆 침소의 동문이 벽에 길게 그어진 검흔을 보고 놀라 깬다. 독고연은 제 검을 멍하니 내려다본다. "…제가 그은 줄도 몰랐어요."',
    choices: [
      { key: 'calm', label: '폐관을 멈추고 마음부터 다독인다', effects: { trust: 8, persona: { warmth: 6, mercy: 8 }, righteousness: 1 } },
      { key: 'discipline', label: '정의의 검리로 살기를 다스리게 한다', effects: { trust: 5, persona: { integrity: 8, prudence: 5 }, righteousness: 2 } },
      { key: 'fuel', label: '그 살기를 동력 삼아 더 밀어붙이게 한다', effects: { trust: 4, darkness: 1, persona: { ambition: 8 }, righteousness: -2 } },
      { key: 'leave', label: '내버려 둔다', effects: { trust: -5, persona: { warmth: -4, freedom: 4 } } },
    ],
  },

  // ─── 정착기(13~15) — 검의 정체성·하산 ───
  {
    discipleId: 'dokgo-yeon',
    year: 13,
    title: '대치(對峙)',
    body: '독고연이 마침내 멸문에 협력했다는 자의 행방을 찾아냈다. 떠나기 직전, 검을 든 손이 떨린다. "이제 그 자 앞에 설 거예요. 네가 우리 가문을 팔았느냐고… 직접 물을 거예요."',
    choices: [
      { key: 'stop', label: '즉시 막아 떼어놓는다', effects: { trust: -4, persona: { prudence: 8, freedom: -5 } } },
      { key: 'truth', label: '사부가 먼저 진실을 밝혀 흥분을 가라앉힌다', effects: { trust: 8, persona: { integrity: 6, mercy: 6 }, righteousness: 2 } },
      { key: 'meet', label: '자리를 만들어 양쪽 말을 다 듣게 한다', effects: { trust: 6, persona: { warmth: 6, prudence: 5 }, righteousness: 1 } },
      { key: 'flow', label: '흐르는 대로 두고 지켜본다', effects: { trust: -4, darkness: 1, persona: { freedom: 5 }, righteousness: -1 } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 14,
    title: '복수냐 화해냐(復讐和解)',
    body: '마침내 그 자와 마주한 독고연. 상대가 무릎 꿇어 사죄하는지, 끝내 부정하는지 — 검끝이 목 앞 한 치에서 멎어 있다. 떨리는 목소리로 사부를 부른다. "사부님… 저, 어떻게 해야 해요."',
    choices: [
      { key: 'reconcile', label: '화해를 권하고 함께 흑사파를 치자 한다', effects: { trust: 8, persona: { warmth: 8, mercy: 8 }, righteousness: 2 } },
      { key: 'spare', label: '검은 거두되 인연을 끊고 속죄를 받아낸다', effects: { trust: 6, persona: { integrity: 6, prudence: 5 }, righteousness: 1 } },
      { key: 'respect', label: '본인의 결정을 존중한다', effects: { trust: 4, persona: { freedom: 6 } } },
      { key: 'slay', label: '단죄를 묵인한다', effects: { trust: 4, darkness: 1, persona: { ambition: 6 }, righteousness: -2 } },
    ],
  },
  {
    discipleId: 'dokgo-yeon',
    year: 15,
    title: '하산(下山) — 검의 끝',
    body: '열다섯 해를 함께 보낸 독고연이 봇짐을 꾸리고 산문 앞에 선다. 한 시절의 마지막 검이 어른이 되어 사부에게 마지막으로 묻는다. "사부님, 이제 제 검을 어디에 두어야 할까요." 어떤 길을 권하시겠습니까.',
    choices: [
      { key: 'leader', label: '정도를 모아 무림을 바로 세우라 — 동맹과 함께', effects: { trust: 8, persona: { integrity: 8, ambition: 6 }, righteousness: 2 } },
      { key: 'rebuild', label: '무너진 독고세가를 다시 일으키라', effects: { trust: 6, persona: { warmth: 6, prudence: 5 }, righteousness: 1 } },
      { key: 'hunt', label: '흑사파를 토벌하는 의로운 검이 되라', effects: { trust: 6, persona: { ambition: 6, integrity: 5 }, righteousness: 2 } },
      { key: 'revenge', label: '복수의 검 한 자루로 강호를 떠돌라', effects: { trust: 4, darkness: 1, persona: { freedom: 6 }, righteousness: -2 } },
    ],
  },
];
