import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 이청하(i-cheongha). docs/47·48.
// 결: 4세에 사람을 죽인 살수 소녀가 자기 자신을 용서하느냐의 15년.
// 흑화 창 = 본능 회귀(살수의 손으로 되돌아가는 선택에만 darkness:+1).
// 동문 부재 안전: 추적·적대하는 상대를 콕 집지 않고 "누군가"·"한 동문"으로 일반화(12·13).
// 숨은변수(흑화·노선) 직설 금지 — 사부가 관찰 가능한 사실만.

export const I_CHEONGHA_ARC: ArcEvent[] = [
  // ─── 입문기 (거리감·악몽) ───
  {
    discipleId: 'i-cheongha',
    year: 1,
    title: '첫 밤(初夜)',
    body: '입문 첫 주, 이청하는 누구와도 말하지 않고 사부와 눈도 맞추지 않는다. 밤마다 작은 소리로 흐느낀다. 방문 앞에 선 사부에게 처음 던진 말. "…절 거두는 이유가 뭐예요?"',
    choices: [
      { key: 'stay', label: '말없이 곁에 머무른다', effects: { trust: 8, persona: { warmth: 6 } } },
      { key: 'word', label: '한 마디만 건네고 물러난다', effects: { trust: 4, persona: { prudence: 4 } } },
      { key: 'company', label: '동문을 옆방에 두어 곁을 채운다', effects: { trust: 3, persona: { warmth: 5 } } },
      { key: 'rule', label: '오늘부터 규율을 세운다', effects: { trust: -4, persona: { integrity: 6 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 2,
    title: '옥패(玉佩)',
    body: '방을 정리하던 동문이 이청하가 숨겨둔 작은 옥패를 보고 만다. "이거 어디서 났어?" 이청하가 얼어붙어 옥패를 빼앗듯 쥔다. "…옛 친구 거예요. 건드리지 마세요."',
    choices: [
      { key: 'watch', label: '캐묻지 않고 지켜본다', effects: { trust: 5, persona: { prudence: 5 } } },
      { key: 'listen', label: '조용히 사연을 들어준다', effects: { trust: 6, persona: { warmth: 8, mercy: 6 } } },
      { key: 'keep', label: '사부가 맡아 보관해 준다', effects: { trust: 4, persona: { prudence: 4 } } },
      { key: 'hush', label: '동문에게 함구시킨다', effects: { trust: 3, persona: { warmth: 2 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 3,
    title: '차가운 눈(冷眼)',
    body: '요즈음 이청하가 누군가의 따가운 시선을 느낀다. 까닭도 모른 채 자신을 쏘아보는 눈빛에 가슴이 차가워진다. "제가… 뭘 했길래, 저를 그렇게 보는 걸까요."',
    choices: [
      { key: 'apart', label: '그 시선의 주인과 거리를 두게 한다', effects: { trust: 3, persona: { prudence: 5 } } },
      { key: 'natural', label: '자연스러운 거리만 두고 지켜본다', effects: { persona: { prudence: 4 } } },
      { key: 'meet', label: '면담으로 둘 사이의 공기를 살핀다', effects: { trust: 4, persona: { warmth: 5 } } },
      { key: 'near', label: '굳이 가까이 붙여 본다', effects: { darkness: 1, persona: { freedom: 4 } } },
    ],
  },

  // ─── 기초기 (검의 정화 시작) ───
  {
    discipleId: 'i-cheongha',
    year: 4,
    title: '새 손(新手)',
    body: '처음으로 목검을 쥐여 주자 이청하의 손이 제멋대로 미끄러진다. 베는 게 아니라 찌르고 끊는, 익숙한 옛 손놀림이다. 아이가 검을 떨어뜨리고 제 손을 내려다본다. "이 손… 무서워요. 제가 시킨 게 아닌데 알아서 움직여요."',
    choices: [
      { key: 'protect', label: '이 검은 베는 검이 아니라 살리는 검이라 가르친다', effects: { trust: 6, righteousness: 2, persona: { mercy: 10, integrity: 4 } } },
      { key: 'remake', label: '옛 손은 잊고 새 손을 처음부터 빚게 한다', effects: { trust: 4, persona: { integrity: 8, prudence: 4 } } },
      { key: 'basics', label: '기본 자세만 반복시켜 손을 길들인다', effects: { persona: { prudence: 6, integrity: 4 } } },
      { key: 'rest', label: '지금은 무리라 잠시 검을 내려놓게 한다', effects: { trust: 3, persona: { warmth: 5 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 5,
    title: '죄(罪)',
    body: '한밤중 이청하가 사부 앞에 무릎을 꿇는다. 오래 참아온 말이 터져 나온다. "네 살 때… 시키는 대로 사람을 죽였어요. 작은 칼 한 번이었는데, 그 얼굴이 매일 밤 보여요. 사부님, 저 같은 게 무공을 배워도 되는 거예요?"',
    choices: [
      { key: 'notguilt', label: '그건 네 죄가 아니라 너를 그리 쓴 자들의 죄라 한다', effects: { trust: 8, righteousness: 1, persona: { mercy: 12, warmth: 8 } } },
      { key: 'intomercy', label: '그 죄책감을 자비로 갚는 길을 보여 준다', effects: { trust: 6, righteousness: 2, persona: { mercy: 10, integrity: 6 } } },
      { key: 'washblade', label: '그 손을 이제 사람을 지키는 검으로 씻으라 한다', effects: { trust: 5, righteousness: 1, persona: { mercy: 8, integrity: 6 } } },
      { key: 'embrace', label: '아무 말 없이 아이를 안아 준다', effects: { trust: 7, persona: { warmth: 10, mercy: 6 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 6,
    title: '금기(禁忌)',
    body: '수련장 구석에서 이청하가 누구도 가르친 적 없는 손놀림을 연습하고 있다. 옛 살수공이다. 들킨 아이의 눈빛이 잠깐 서늘하게 식었다 돌아온다. "이게… 더 빨리 강해진대요. 몸이 이미 다 알고 있어요. 익히면 안 되는 거예요?"',
    choices: [
      { key: 'forbid', label: '단호히 금하고 그 자리에서 봉인하게 한다', effects: { trust: 4, righteousness: 2, persona: { integrity: 10, prudence: 6 } } },
      { key: 'explain', label: '왜 그 길이 금기인지 차근히 설명한다', effects: { trust: 6, righteousness: 1, persona: { prudence: 10, mercy: 4 } } },
      { key: 'sealonce', label: '한 번만 펼쳐 보게 한 뒤 함께 봉인한다', effects: { trust: 3, persona: { prudence: 8, freedom: 4 } } },
      { key: 'allow', label: '강해지는 게 먼저라며 눈감아 준다', effects: { darkness: 1, righteousness: -2, persona: { ambition: 8, mercy: -6 } } },
    ],
  },

  // ─── 무공기 (빛으로 가는 길) ───
  {
    discipleId: 'i-cheongha',
    year: 7,
    title: '깨달음(悟)',
    body: '검리가 트이려는 길목, 이청하가 두 갈래 앞에서 멈춘다. 어둠을 베어 넘기는 검과, 어둠 자체를 끊어 내는 검. "제 검이… 저를 어디로 데려갈까요. 어느 쪽이 진짜 제 길이에요, 사부님?"',
    choices: [
      { key: 'light', label: '어둠에서 빛으로 가는 검을 택하게 이끈다', effects: { trust: 6, righteousness: 2, persona: { mercy: 10, freedom: 4 } } },
      { key: 'debt', label: '옥패의 빚을 갚는 검이 네 길이라 한다', effects: { trust: 5, righteousness: 1, persona: { integrity: 8, mercy: 6 } } },
      { key: 'guide', label: '묵묵히 곁에서 검리를 지도만 한다', effects: { trust: 3, persona: { prudence: 8 } } },
      { key: 'nopush', label: '스스로 답을 찾을 때까지 재촉하지 않는다', effects: { trust: 4, persona: { freedom: 10 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 8,
    title: '막아선 검(遮劍)',
    body: '대련 중 한 동문이 위험에 빠지자, 이청하의 몸이 생각보다 먼저 그 앞을 막아섰다. 검을 거두고 나서야 제가 한 일에 놀란다. "그냥… 가만히 못 두겠더라고요. 저도 모르게 몸이 움직였어요."',
    choices: [
      { key: 'praise', label: '그 변화가 얼마나 귀한지 칭찬한다', effects: { trust: 8, persona: { warmth: 10, mercy: 8 } } },
      { key: 'truehand', label: '그게 네 진짜 손이라 일러 준다', effects: { trust: 6, righteousness: 1, persona: { mercy: 10, integrity: 4 } } },
      { key: 'temper', label: '마음은 알되 무모함은 다잡게 한다', effects: { trust: 3, persona: { prudence: 8, warmth: 4 } } },
      { key: 'plain', label: '담담히 잘했다고만 한다', effects: { trust: 2, persona: { warmth: 4 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 9,
    title: '벽(壁)',
    body: '한 단계를 넘지 못하고 정체가 길어진다. 악몽이 다시 잦아지고, 이청하의 손이 자꾸 옛 손놀림으로 돌아가려 한다. "혹시… 옛 방식이 더 나았던 거 아닐까요. 그땐 적어도 막히진 않았어요."',
    choices: [
      { key: 'seclude', label: '폐관에 들어 정공법으로 벽을 뚫게 한다', effects: { trust: 4, persona: { integrity: 8, prudence: 6 } } },
      { key: 'spar', label: '동문과의 대련으로 막힌 곳을 풀게 한다', effects: { trust: 5, persona: { warmth: 6, freedom: 4 } } },
      { key: 'rest', label: '잠시 쉬게 하고 면담으로 마음을 살핀다', effects: { trust: 6, persona: { prudence: 6, warmth: 6 } } },
      { key: 'push', label: '옛 손이라도 좋으니 밀어붙여 돌파시킨다', effects: { darkness: 1, righteousness: -1, persona: { ambition: 8, prudence: -4 } } },
    ],
  },

  // ─── 실전기 (본능 vs 정의) ───
  {
    discipleId: 'i-cheongha',
    year: 10,
    title: '부름(召)',
    body: '먼 마을에서 살수 조직에 아이가 납치됐다는 의뢰가 들어온다. 의뢰지를 보던 이청하의 얼굴이 굳더니, 처음으로 사부에게 먼저 청한다. "저 가게 해주세요. 그 아이… 제가 데려와야 할 것 같아요. 부탁이에요."',
    choices: [
      { key: 'allow', label: '속죄의 길이 되리라 믿고 허락한다', effects: { trust: 8, righteousness: 2, persona: { mercy: 10, freedom: 6 } } },
      { key: 'refuse', label: '되돌아갈까 두려워 거절한다', effects: { trust: -5, righteousness: -1, persona: { prudence: 6, mercy: -6 } } },
      { key: 'withkind', label: '따뜻한 동문을 딸려 함께 보낸다', effects: { trust: 6, persona: { warmth: 8, mercy: 6 } } },
      { key: 'withrival', label: '거리를 두던 동문과 함께 보낸다', effects: { trust: 4, persona: { prudence: 6, integrity: 4 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 11,
    title: '단검 앞에서(對刃)',
    body: '의뢰 현장에서 옛 동료 살수와 마주친다. 그가 단검을 내밀며 웃는다. "넌 우리 손이야. 잊었어?" 돌아온 이청하의 보고는 떨리고 있다. "베면… 그 손으로 돌아가는 거잖아요. 어떻게 해야 했어요?"',
    choices: [
      { key: 'subdue', label: '제압하되 끝내 살려 보낸 것을 옳다 한다', effects: { trust: 7, righteousness: 2, persona: { mercy: 12, integrity: 6 } } },
      { key: 'rescue', label: '인질만 빼내고 물러난 판단을 칭찬한다', effects: { trust: 5, righteousness: 1, persona: { prudence: 8, mercy: 6 } } },
      { key: 'kill', label: '화근이니 베어 끝내라 한다', effects: { trust: -4, darkness: 1, righteousness: -2, persona: { mercy: -10, ambition: 6 } } },
      { key: 'infiltrate', label: '정체를 숨기고 조직에 잠입하라 한다', effects: { trust: 2, persona: { prudence: 8, ambition: 4 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 12,
    title: '두 사람(二人)',
    body: '오래 거리를 두던 한 동문과 깊은 일을 함께 맡게 됐다. 무언가 곪아 가던 사이가 끝내 터지고, 이청하가 사부를 찾아온다. "그 사람, 왜 늘 저를 미워해요? 저한테 뭔가 있는 거예요? 사부님은 아시잖아요."',
    choices: [
      { key: 'separate', label: '아직 때가 아니라 둘을 떼어 놓는다', effects: { trust: 3, persona: { prudence: 8 } } },
      { key: 'pair', label: '오히려 합을 맞춰 보게 둘을 묶는다', effects: { trust: 4, persona: { freedom: 6, integrity: 4 } } },
      { key: 'meet', label: '면담으로 둘 사이의 응어리를 살핀다', effects: { trust: 6, persona: { warmth: 6, prudence: 6 } } },
      { key: 'deepen', label: '둘만의 깊은 일로 끝까지 부딪치게 한다', effects: { darkness: 1, persona: { freedom: 8, prudence: -4 } } },
    ],
  },

  // ─── 정착기 (자기 화해·하산) ───
  {
    discipleId: 'i-cheongha',
    year: 13,
    title: '마주침(直面)',
    body: '덮어 둘 수 없는 진실이 문턱까지 왔다. 한 동문이 오래전 이청하의 옛 손에 잃은 사람을 똑똑히 기억하고 있다는 것. 사부가 결정해야 한다. 아이에게 진실을 알릴 것인가. 알게 된다면 이청하는 분명 무너질 것이다.',
    choices: [
      { key: 'tell', label: '직접, 곁에서, 진실을 알려 준다', effects: { trust: 6, righteousness: 1, persona: { mercy: 8, integrity: 6 } } },
      { key: 'wait', label: '스스로 닿을 때까지 곁을 지키며 기다린다', effects: { trust: 5, persona: { warmth: 8, prudence: 6 } } },
      { key: 'jade', label: '옥패를 돌려주며 어디로 갈지 함께 묻는다', effects: { trust: 7, righteousness: 1, persona: { mercy: 10, warmth: 6 } } },
      { key: 'bury', label: '끝내 덮어 아이를 흔들지 않는다', effects: { darkness: 1, righteousness: -1, persona: { warmth: -6, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 14,
    title: '용서(恕)',
    body: '진실을 안 이청하가 도망과 자결과 속죄 사이에서 흔들린다. 며칠을 굶고 검을 놓은 아이가 마지막으로 사부에게 묻는다. "저… 용서받을 수 있을까요. 받아도 되는 거예요?"',
    choices: [
      { key: 'self', label: '먼저 네가 너를 용서해야 한다 일러 준다', effects: { trust: 8, righteousness: 2, persona: { mercy: 12, warmth: 8 } } },
      { key: 'apology', label: '상처 준 이 앞에 스스로 사죄하러 가게 한다', effects: { trust: 6, righteousness: 2, persona: { integrity: 8, mercy: 6 } } },
      { key: 'savekids', label: '어린 살수들을 구하는 길로 빚을 갚게 한다', effects: { trust: 6, righteousness: 2, persona: { mercy: 10, integrity: 4 } } },
      { key: 'stay', label: '사문에 남아 천천히 마음을 추스르게 한다', effects: { trust: 5, persona: { warmth: 8, prudence: 6 } } },
    ],
  },
  {
    discipleId: 'i-cheongha',
    year: 15,
    title: '하산(下山)',
    body: '열다섯 해를 함께한 이청하가 산문 앞에 선다. 옥패는 더 이상 손에 쥐어 숨기지 않고, 허리춤에 당당히 매달려 있다. "어둠에서 빛으로 왔어요. 이젠… 저 같은 어린 살수들이 도망칠 수 있게 해주고 싶어요. 사부님, 제 길을 가도 될까요."',
    choices: [
      { key: 'destroy', label: '살수 조직을 토벌하는 길로 보낸다', effects: { trust: 8, righteousness: 2, persona: { integrity: 10, mercy: 6 } } },
      { key: 'reconcile', label: '오랜 원한의 상대와 화해하고 손잡으라 한다', effects: { trust: 7, righteousness: 2, persona: { mercy: 12, warmth: 6 } } },
      { key: 'protector', label: '정파 검객이자 고아들의 보호자로 세상에 내보낸다', effects: { trust: 8, righteousness: 2, persona: { mercy: 10, integrity: 6 } } },
      { key: 'darkness', label: '끝내 빛에 닿지 못한 아이를 어둠으로 돌려보낸다', effects: { trust: -6, darkness: 1, righteousness: -2, persona: { mercy: -10, ambition: 8 } } },
    ],
  },
];
