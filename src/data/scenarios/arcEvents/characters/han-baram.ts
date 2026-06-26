import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 한바람(han-baram). docs/47·48.
// 결: 자유의 들개를 우리에 가두지 않고 사람으로 세우는 15년. 통찰이 의적 정점으로 올리거나 살수로 떨군다.
// 흑화 창이 큰 캐릭터(사파 비급·복수·방치 선택에 darkness:1). 노선(righteousness)은 의적↔살수에서 갈린다.
// 1~3년차는 index.ts 의 그레이박스 샘플을 그대로 옮김. 경지 중립(docs/47 §12)·동문 부재 안전·숨은변수 비노출.
export const HAN_BARAM_ARC: ArcEvent[] = [
  // ─── 입문기 (불신·적응) ───
  {
    discipleId: 'han-baram',
    year: 1,
    title: '야반도주(夜半逃走)',
    body: '입문 첫 달, 동이 트자 한바람의 잠자리가 비어 있다. 봇짐도 없이 산문을 넘으려다 동문에게 들켰다. 끌려온 아이가 사부를 노려본다. "여기 갇혀 사는 거잖아요. 저는… 그냥 떠돌던 게 편해요."',
    choices: [
      { key: 'bring', label: '밤길을 따라가 직접 데려온다', effects: { trust: 8, persona: { freedom: -6 } } },
      { key: 'send', label: '동문을 보내 함께 돌아오게 한다', effects: { trust: 4, persona: { warmth: 6 } } },
      { key: 'wait', label: '돌아올 때까지 기다린다', effects: { trust: -3, persona: { freedom: 6 } } },
      { key: 'free', label: '가고 싶으면 가라 놓아준다', effects: { trust: -6, persona: { freedom: 12 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 2,
    title: '헌 옷(舊衣)',
    body: '새 옷과 따뜻한 밥을 줘도 한바람은 너덜한 회색 옷을 벗지 않고 구석에서 잔다. "이게 편해요. 새 건… 어차피 금방 잃어버릴 거예요."',
    choices: [
      { key: 'wait', label: '그대로 두고 기다린다', effects: { trust: 4, persona: { freedom: 5 } } },
      { key: 'wash', label: '직접 씻기고 새 옷을 입힌다', effects: { persona: { warmth: 8, freedom: -4 } } },
      { key: 'mingle', label: '동문들과 어울리게 한다', effects: { trust: 3, persona: { warmth: 6 } } },
      { key: 'order', label: '규율이라며 단정함을 명한다', effects: { trust: -3, persona: { integrity: 6, freedom: -8 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 3,
    title: '흐릿한 얼굴(母影)',
    body: '마을에 다녀온 밤, 한바람이 사부를 찾아온다. "마을에서 어떤 아주머니를 봤는데… 우리 어머니랑 닮은 것 같았어요. 근데 얼굴이 기억이 안 나요. 사부님, 부모님은… 어떤 사람이었을까요."',
    choices: [
      { key: 'grieve', label: '곁에서 함께 슬퍼해 준다', effects: { trust: 5, persona: { warmth: 10, mercy: 6 } } },
      { key: 'strong', label: '부모를 위해 강해지라 한다', effects: { persona: { ambition: 6, integrity: 4 } } },
      { key: 'calm', label: '명상으로 마음을 다스리게 한다', effects: { persona: { prudence: 8 } } },
      { key: 'forget', label: '지난 일이니 잊으라 한다', effects: { trust: -4, darkness: 1, persona: { warmth: -6 } } },
    ],
  },

  // ─── 기초기 (재능 발현·거리의 부름) ───
  {
    discipleId: 'han-baram',
    year: 4,
    title: '질풍의 발(疾風步)',
    body: '보법을 가르치자마자 한바람의 몸이 바람처럼 산비탈을 탄다. 또래 동문들이 한참 기본을 다질 때, 아이는 벌써 다음을 조른다. "이런 건 너무 쉬워요. 더 강한 거, 더 빨리 주세요. 기초는 다 됐잖아요."',
    choices: [
      { key: 'basics', label: '기본기부터 단단히 밟게 한다', effects: { trust: 4, persona: { prudence: 10, freedom: -4 } } },
      { key: 'risk', label: '서두르면 무엇을 잃는지 보여준다', effects: { trust: 6, persona: { prudence: 8 } } },
      { key: 'fast', label: '원하는 만큼 빠르게 내준다', effects: { darkness: 1, persona: { freedom: 8, ambition: 6 } } },
      { key: 'press', label: '자만하지 말라 눌러 둔다', effects: { trust: -4, persona: { integrity: 6, freedom: -6 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 5,
    title: '골목의 벗(巷友)',
    body: '마을에 내려보내면 한바람은 떠돌이 무인과 거리 아이들 틈에 섞여 밤늦도록 돌아오지 않는다. "그쪽이 더 편해요. 사문 밖에도 제 사람들이 있어요. 그게 나쁜 거예요?"',
    choices: [
      { key: 'visit', label: '사부도 함께 가 그들을 만나본다', effects: { trust: 8, persona: { warmth: 6 } } },
      { key: 'invite', label: '믿을 만한 이는 사문으로 청한다', effects: { trust: 4, persona: { integrity: 4, prudence: 4 } } },
      { key: 'forbid', label: '마을 출입을 금한다', effects: { trust: -5, persona: { freedom: -8, integrity: 4 } } },
      { key: 'ignore', label: '알아서 어울리게 내버려 둔다', effects: { darkness: 1, persona: { freedom: 8 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 6,
    title: '약한 동문(庇弱)',
    body: '맞고 있던 또래 동문을 한바람이 몸으로 막아서다 규율을 어기고 큰 충돌을 빚었다. "잘못한 거 알아요. 근데 약한 애가 맞는 걸 어떻게 그냥 봐요. 그게 더 잘못 아니에요?"',
    choices: [
      { key: 'praise', label: '약자를 지킨 그 마음을 칭찬한다', effects: { trust: 6, persona: { mercy: 10, warmth: 6 } } },
      { key: 'reconcile', label: '양쪽을 불러 화해시킨다', effects: { trust: 4, persona: { warmth: 6, prudence: 4 } } },
      { key: 'punish', label: '뜻은 옳아도 규율 위반은 벌한다', effects: { trust: -4, persona: { integrity: 10, freedom: -4 } } },
      { key: 'strong', label: '강한 자가 이기는 게 강호라 이른다', effects: { darkness: 1, righteousness: -1, persona: { mercy: -8 } } },
    ],
  },

  // ─── 무공기 (사파의 손짓·흑화 갈림) ───
  {
    discipleId: 'han-baram',
    year: 7,
    title: '흑풍의 책(黑風步)',
    body: '거리에서 알게 된 떠돌이가 사파의 보법 비급 한 권을 건넸다. 한바람이 그것을 품고 사부 앞에 선다. "빠르게 세질 수 있대요. 사부님, 이거… 익혀도 돼요? 솔직하게 말해주세요."',
    choices: [
      { key: 'analyze', label: '함께 펼쳐 보며 어디가 몸을 망치는지 짚어준다', effects: { trust: 8, righteousness: 1, persona: { prudence: 10 } } },
      { key: 'forbid', label: '위험을 일러주고 금한다', effects: { trust: 4, persona: { integrity: 8, prudence: 6 } } },
      { key: 'burn', label: '그 자리에서 태워 없앤다', effects: { trust: -4, persona: { integrity: 10, freedom: -8 } } },
      { key: 'try', label: '한 번쯤 시험해 보게 둔다', effects: { darkness: 1, righteousness: -1, persona: { freedom: 10, ambition: 6 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 8,
    title: '왜 살리나(殺問)',
    body: '실전을 겪고 온 밤, 한바람의 눈이 어둡다. "부모님 죽인 자들 생각하면요… 왜 사람을 죽이면 안 돼요? 어차피 강호는 죽고 죽이는 곳이잖아요. 사부님은 왜 살리라고만 해요?"',
    choices: [
      { key: 'protect', label: '지켜야 할 것이 있어 칼을 든다 일러준다', effects: { trust: 6, righteousness: 1, persona: { warmth: 8, mercy: 8 } } },
      { key: 'weight', label: '분노는 인정하되 칼의 무게를 새긴다', effects: { trust: 6, persona: { prudence: 8, mercy: 6 } } },
      { key: 'cycle', label: '복수는 또 다른 복수를 부른다 말한다', effects: { righteousness: 1, persona: { prudence: 8, mercy: 6 } } },
      { key: 'cold', label: '적에게는 냉정해야 산다 가르친다', effects: { darkness: 1, righteousness: -1, persona: { mercy: -10 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 9,
    title: '느린 벽(遲壁)',
    body: '한바람의 손속은 누구보다 화려한데, 정작 깊은 곳에서 무언가 더디게 굳는다. 또래 동문들이 한 걸음씩 나아갈 때 자신만 같은 자리를 맴도는 것 같아 한바람이 처음으로 풀이 죽었다. "저는… 겉만 번지르르하고 속은 텅 빈 거 아닐까요."',
    choices: [
      { key: 'own', label: '네 길은 남과 다르니 네 걸음으로 가라 한다', effects: { trust: 8, persona: { freedom: 10 } } },
      { key: 'spar', label: '또래와 합을 맞추며 자극받게 한다', effects: { trust: 4, persona: { ambition: 6, warmth: 4 } } },
      { key: 'dig', label: '조용히 파고들어 스스로 벽을 넘게 한다', effects: { trust: 4, persona: { prudence: 10 } } },
      { key: 'dismiss', label: '남과 견주는 건 부질없다 잘라 말한다', effects: { trust: -4, darkness: 1, persona: { freedom: 4 } } },
    ],
  },

  // ─── 실전기 (의적의 길·첫 칼) ───
  {
    discipleId: 'han-baram',
    year: 10,
    title: '첫 칼(初刃)',
    body: '약탈하던 도적 두목을 한바람이 제압해 땅에 눌렀다. 두목은 이미 항복했지만, 아이의 검끝이 떨린다. "사부님… 이 자 죽일까요? 살려두면 또 사람들 괴롭힐 텐데요."',
    choices: [
      { key: 'bind', label: '포박해 관아에 넘기게 한다', effects: { trust: 4, righteousness: 2, persona: { integrity: 6, mercy: 6 } } },
      { key: 'spare', label: '항복한 자는 살리는 법이라 가르친다', effects: { trust: 6, righteousness: 1, persona: { mercy: 10 } } },
      { key: 'yours', label: '네 손이니 네 판단에 맡긴다', effects: { persona: { freedom: 8, prudence: -4 } } },
      { key: 'kill', label: '본보기로 베라 명한다', effects: { darkness: 1, righteousness: -2, persona: { mercy: -10 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 11,
    title: '빈손의 정의(義盜)',
    body: '흉년에 굶주리는 마을을 보고 온 한바람이 눈을 빛낸다. "보수 같은 거 안 받을래요. 탐관 곳간을 털어서 저 사람들한테 나눠주면 안 돼요? 그게… 진짜 정의 아니에요?"',
    choices: [
      { key: 'lawful', label: '정당하게 도울 길을 함께 찾는다', effects: { trust: 6, righteousness: 1, persona: { prudence: 8, mercy: 6 } } },
      { key: 'righteous', label: '굶는 이를 먼저 살리는 의적의 결을 세워준다', effects: { trust: 6, righteousness: 1, persona: { mercy: 8, freedom: 6 } } },
      { key: 'duty', label: '본분부터 지키라 이른다', effects: { persona: { integrity: 8, freedom: -6 } } },
      { key: 'theft', label: '도둑질은 그 무엇이라도 도둑질이라 못 박는다', effects: { trust: -3, persona: { integrity: 10, freedom: -6 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 12,
    title: '어둠 속 옛 얼굴(暗中故人)',
    body: '의뢰지에서 마주 선 살수가 두건을 벗자, 거리에서 비급을 건네던 옛 떠돌이의 얼굴이다. "오랜만이네. 우리 쪽이 훨씬 자유로워. 너도 알잖아." 한바람의 검이 흔들린다.',
    choices: [
      { key: 'cut', label: '옛정에 흔들리지 말고 단호히 베어내라 한다', effects: { trust: 4, righteousness: 1, persona: { integrity: 8, mercy: -4 } } },
      { key: 'persuade', label: '설득해 자수시키는 길을 함께 찾는다', effects: { trust: 6, righteousness: 1, persona: { mercy: 10 } } },
      { key: 'spare', label: '옛정에 눈감고 놓아주게 둔다', effects: { darkness: 1, persona: { freedom: 8, mercy: 4 } } },
      { key: 'waver', label: '잠깐 흔들리는 마음을 모른 척한다', effects: { darkness: 1, persona: { freedom: 6, prudence: -6 } } },
    ],
  },

  // ─── 정착기 (정체성·하산) ───
  {
    discipleId: 'han-baram',
    year: 13,
    title: '자유검(自由劍)',
    body: '한바람이 떠돌이 검과 제 보법을 제 식대로 엮어 사부 앞에 펼쳐 보인다. 거칠지만 누구의 것도 아닌, 오직 한바람만의 흐름이다. "어디서 배운 거 아니에요. 그냥… 제 몸이 이렇게 가더라고요. 어때요, 사부님?"',
    choices: [
      { key: 'name', label: '그 검에 이름을 붙여 인정해 준다', effects: { trust: 8, persona: { freedom: 10 } } },
      { key: 'frame', label: '정통의 뼈대를 더해 단단히 하게 한다', effects: { trust: 4, persona: { integrity: 6, prudence: 6 } } },
      { key: 'form', label: '격식부터 지키라 이른다', effects: { trust: -3, persona: { integrity: 8, freedom: -6 } } },
      { key: 'test', label: '강호에 나가 직접 시험해 보라 한다', effects: { persona: { freedom: 6, ambition: 6, prudence: -4 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 14,
    title: '갇힌 마음(籠中言)',
    body: '이제 어엿한 청년이 된 한바람이 밤하늘을 보며 속을 털어놓는다. "배부르고 따뜻한데요… 가끔 갇힌 것 같아요. 졸업하면 그냥 떠돌이로 살까 봐요. 사부님은 서운하세요?"',
    choices: [
      { key: 'until', label: '졸업까지는 함께 가자 다독인다', effects: { trust: 6, persona: { warmth: 6, freedom: -4 } } },
      { key: 'temper', label: '절제 안에서 더 크게 빛난다 일러준다', effects: { trust: 4, persona: { prudence: 8, integrity: 4 } } },
      { key: 'always', label: '나가도 가르침은 끝까지 네 편이라 한다', effects: { trust: 8, persona: { warmth: 8, freedom: 6 } } },
      { key: 'go', label: '네 길이 그렇다면 가라 놓아준다', effects: { trust: -3, persona: { freedom: 12 } } },
    ],
  },
  {
    discipleId: 'han-baram',
    year: 15,
    title: '하산(下山) — 들개의 길',
    body: '열다섯 해를 보낸 청년이 산문 앞에 선다. 한때 밤마다 도망치려던 아이는 이제 제 발로, 제가 갈 길을 정하려 사부를 마주한다. "사부님. 저, 이제 어디로 가야 할까요. 마지막으로… 묻고 싶었어요."',
    choices: [
      { key: 'righteous_band', label: '굶는 이들 곁에 서는 의적의 무리를 이끌라 한다', effects: { trust: 8, righteousness: 2, persona: { mercy: 10, freedom: 8 } } },
      { key: 'wanderer', label: '어디에도 매이지 않는 떠돌이 협객으로 살라 한다', effects: { trust: 6, righteousness: 1, persona: { freedom: 12 } } },
      { key: 'escort', label: '사람을 지키는 표국 무사의 길을 권한다', effects: { trust: 4, righteousness: 1, persona: { integrity: 8, prudence: 6 } } },
      { key: 'darkness', label: '강한 자가 모든 걸 갖는 어둠의 길을 막지 않는다', effects: { darkness: 1, righteousness: -2, persona: { freedom: 8, mercy: -8 } } },
    ],
  },
];
