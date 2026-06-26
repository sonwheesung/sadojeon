import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 강무열(gang-muyeol). docs/47·48.
// 결: 가문 명예를 진 정의로운 도객이 가문의 어둠과 마주하는 정체성 시험.
// 경지 중립(docs/47 §12) · 동문 부재 안전(독고연 미지정, 진실은 노획 서신으로 단독 성립).
export const GANG_MUYEOL_ARC: ArcEvent[] = [
  // ─── 입문기 (양반가 자세·첫 의심) ───
  {
    discipleId: 'gang-muyeol',
    year: 1,
    title: '봉문(奉門)',
    body: '입문 첫날, 강무열이 품에서 가문패를 꺼내 두 손으로 받쳐 들고 큰절을 올린다. 열 살 아이의 목소리가 또렷하다. "아버지께서 가문의 명예를 빛내라 하셨습니다. 사부님, 저는 부끄럽지 않은 무인이 되겠습니다."',
    choices: [
      { key: 'praise', label: '그 각오가 장하다 칭찬한다', effects: { trust: 6, persona: { integrity: 10 } } },
      { key: 'law', label: '먼저 사문의 법도부터 익히라 한다', effects: { trust: 4, persona: { integrity: 6, prudence: 5 } } },
      { key: 'putaway', label: '가문패는 잠시 거두라 한다', effects: { trust: 4, persona: { freedom: 6, integrity: -4 } } },
      { key: 'letbe', label: '스스로 알아 가게 둔다', effects: { trust: -4, persona: { prudence: 4 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 2,
    title: '가서(家書)',
    body: '고향에서 편지가 왔다. 형들이 무관에서 이름을 떨치고 있다는 소식이다. 답장을 쓰던 강무열이 붓을 멈춘다. "형님들처럼… 저도 자랑스러운 소식을 적어 보내고 싶어요. 무얼 적어야 할까요, 사부님?"',
    choices: [
      { key: 'glory', label: '가문의 자랑이 될 일을 적게 한다', effects: { persona: { ambition: 10, integrity: 5 } } },
      { key: 'learn', label: '사문에서 배운 것을 적게 한다', effects: { trust: 4, persona: { integrity: 6, warmth: 4 } } },
      { key: 'together', label: '함께 답장을 써 준다', effects: { trust: 6, persona: { warmth: 8 } } },
      { key: 'inquire', label: '가문 사정을 조용히 알아본다', effects: { trust: 4, persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 3,
    title: '동문(同門)',
    body: '한 동문이 유독 강무열에게만 차갑다. 까닭을 몰라 마음이 쓰인 아이가 사부를 찾는다. "사부님, 저 동문은 왜 저를 싫어할까요? 제가 뭘 잘못한 것도 없는데… 눈빛이 늘 얼음 같아요."',
    choices: [
      { key: 'apart', label: '굳이 가까이 두지 않는다', effects: { trust: 4, persona: { prudence: 5 } } },
      { key: 'approach', label: '먼저 다가가 보라 한다', effects: { trust: 5, persona: { warmth: 10 } } },
      { key: 'meet', label: '면담으로 둘 사이의 공기를 살핀다', effects: { trust: 6, persona: { warmth: 6 } } },
      { key: 'flow', label: '흐르는 대로 두라 한다', effects: { trust: -4, persona: { prudence: 4 } } },
    ],
  },

  // ─── 기초기 (도법 싹·가문 기대) ───
  {
    discipleId: 'gang-muyeol',
    year: 4,
    title: '초도(初刀)',
    body: '도법을 잡은 지 얼마 안 되어 강무열의 칼끝이 눈에 띄게 빨라졌다. 손에 굳은살이 잡혔는데도 멈추질 않는다. "사부님, 밤에도 더 베고 싶어요. 한 번이라도 더 휘두르면 그만큼 강해지는 거잖아요."',
    choices: [
      { key: 'drill', label: '원하는 만큼 맹훈련을 허락한다', effects: { persona: { ambition: 10, integrity: 4 } } },
      { key: 'basics', label: '기본기부터 다지게 한다', effects: { trust: 4, persona: { prudence: 8, integrity: 4 } } },
      { key: 'rest', label: '휴식과 균형을 가르친다', effects: { trust: 4, persona: { prudence: 6, warmth: 5 } } },
      { key: 'principle', label: '한 수에 담긴 이치를 짚어 준다', effects: { trust: 5, persona: { prudence: 6, integrity: 5 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 5,
    title: '형신(兄信)',
    body: '큰형의 편지가 도착했다. "졸업하거든 돌아와 무관을 이어라." 강무열이 편지를 몇 번이고 다시 읽는다. "자랑스러우면서도… 어깨가 무거워요. 정해진 길을 꼭 가야만 하는 걸까요?"',
    choices: [
      { key: 'fulfill', label: '가문의 뜻에 부응하라 한다', effects: { persona: { integrity: 10, ambition: 5 } } },
      { key: 'ownpath', label: '네게는 네 길이 있다 한다', effects: { trust: 5, persona: { freedom: 10 } } },
      { key: 'distance', label: '가문과 거리를 두라 한다', effects: { trust: 4, persona: { freedom: 8, integrity: -4 } } },
      { key: 'defer', label: '판단을 뒤로 미루게 한다', effects: { persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 6,
    title: '소의(小義)',
    body: '장터에서 힘없는 노인이 부당하게 매질당하는 것을 강무열이 보고 왔다. 주먹을 꼭 쥔 채 사부 앞에 선다. "그냥 둘 순 없었어요. 사부님, 옳지 않은 걸 보고도 모른 척하는 건… 무인이 아니잖아요."',
    choices: [
      { key: 'act', label: '직접 나서 바로잡게 한다', effects: { righteousness: 1, persona: { integrity: 10, mercy: 5 } } },
      { key: 'procedure', label: '절차를 밟아 처리하게 한다', effects: { trust: 4, persona: { prudence: 6, integrity: 5 } } },
      { key: 'master', label: '사부가 대신 처리한다', effects: { trust: 4, persona: { warmth: 5 } } },
      { key: 'ignore', label: '못 본 척 넘기라 한다', effects: { trust: -4, persona: { integrity: -6, mercy: -4 } } },
    ],
  },

  // ─── 무공기 (도법 갈래·벽) ───
  {
    discipleId: 'gang-muyeol',
    year: 7,
    title: '도심(刀心)',
    body: '칼을 깊이 파고들수록 강무열의 눈빛이 달라진다. 어느 날 수련을 멈추고 묻는다. "사부님, 도(刀)는 대체 무엇을 위한 것입니까? 강해지는 건 알겠는데… 이 칼을 어디에 써야 할지, 가끔 모르겠어요."',
    choices: [
      { key: 'people', label: '사람을 지키기 위한 도라 일러 준다', effects: { righteousness: 1, persona: { mercy: 10, integrity: 5 } } },
      { key: 'own', label: '네 도를 스스로 닦으라 한다', effects: { trust: 4, persona: { freedom: 8, integrity: 4 } } },
      { key: 'honor', label: '가문의 명예를 위한 도라 한다', effects: { persona: { ambition: 10, integrity: 4 } } },
      { key: 'know', label: '가문을 더 알아야 답이 보인다 넌지시 이른다', effects: { trust: 4, persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 8,
    title: '정체(停滯)',
    body: '한동안 강무열의 칼이 더 나아가지 못하고 같은 자리를 맴돈다. 재주가 빼어난 편이 아님을 스스로도 안다. 조급해진 청년이 칼자루를 부러뜨릴 듯 쥔다. "남들은 저만치 가는데 저만 멈춰 있어요. 어떻게 해야 이 벽을 넘죠?"',
    choices: [
      { key: 'repeat', label: '우직하게 반복하라 한다', effects: { trust: 4, persona: { prudence: 10, integrity: 5 } } },
      { key: 'force', label: '무리해서라도 밀어붙이게 한다', effects: { persona: { ambition: 8, prudence: -5 } } },
      { key: 'spar', label: '대련과 실전에서 길을 찾게 한다', effects: { trust: 4, persona: { integrity: 5, prudence: 6 } } },
      { key: 'other', label: '다른 갈래도 살펴보게 한다', effects: { persona: { prudence: 6, freedom: 5 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 9,
    title: '풍문(風聞)',
    body: '흑사파가 인근 고을을 어지럽힌다는 풍문이 사문에 닿았다. 강무열의 눈에 불이 인다. "아버지께서도 흑사파를 잡으셨다 들었어요. 저도 아버지처럼 저들을 잡고 싶어요. 그게 정의잖아요."',
    choices: [
      { key: 'foster', label: '그 의지를 키워 준다', effects: { righteousness: 1, persona: { integrity: 8, ambition: 6 } } },
      { key: 'early', label: '아직 이르다 막는다', effects: { trust: -4, persona: { prudence: 6 } } },
      { key: 'weight', label: '정의에 따르는 무게를 일러 준다', effects: { persona: { integrity: 8, prudence: 5 } } },
      { key: 'caution', label: '가문과의 연을 경계하게 한다', effects: { trust: 4, persona: { prudence: 8 } } },
    ],
  },

  // ─── 실전기 (실전·진실의 그림자) ───
  {
    discipleId: 'gang-muyeol',
    year: 10,
    title: '토벌(討伐)',
    body: '흑사파 일당을 치는 토벌 의뢰가 들어왔다. 첫 실전이 될 강무열을 누구와 함께 보낼지 정해야 한다. 청년이 결연히 청한다. "제가 가겠습니다. 사부님, 누구와 함께 가면 될까요?"',
    choices: [
      { key: 'solo', label: '홀로 보내 담력을 시험한다', effects: { persona: { integrity: 8, ambition: 5 } } },
      { key: 'coldone', label: '유독 그를 차갑게 대하던 동문과 짝지운다', effects: { trust: 4, persona: { warmth: 8 } } },
      { key: 'other', label: '미더운 다른 동문과 함께 보낸다', effects: { trust: 6, persona: { warmth: 5 } } },
      { key: 'refuse', label: '아직 위태롭다 거절한다', effects: { trust: -4, persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 11,
    title: '문정(問正)',
    body: '실전을 거듭하며 강무열의 고민이 깊어졌다. 어느 밤 정색하고 묻는다. "사부님, 만약 가문의 뜻과 사문의 가르침이 충돌한다면… 저는 어느 쪽을 따라야 합니까?"',
    choices: [
      { key: 'sect', label: '사문의 가르침을 따르라 한다', effects: { trust: 5, persona: { integrity: 8 } } },
      { key: 'harmony', label: '둘 사이의 조화를 찾으라 한다', effects: { trust: 4, persona: { prudence: 8, warmth: 5 } } },
      { key: 'people', label: '정의란 사람을 살리는 일이라 답한다', effects: { righteousness: 1, persona: { mercy: 10 } } },
      { key: 'knowfamily', label: '네 가문을 제대로 아느냐 되묻는다', effects: { trust: 4, persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 12,
    title: '잔흔(殘痕)',
    body: '토벌에서 거둬 온 노획물 가운데 빛바랜 서신 한 장이 강무열의 눈에 들어왔다. "…강씨 무관(姜氏武館)의 도움으로…"라는 글귀에서 시선이 멎는다. 종이를 쥔 손이 가늘게 떨린다. "사부님… 이건, 무슨 뜻이죠? 우리 가문 이름이 왜 여기 적혀 있어요?"',
    choices: [
      { key: 'prepare', label: '진실을 마주할 준비를 시킨다', effects: { trust: 6, persona: { prudence: 6 } } },
      { key: 'cover', label: '아무것도 아니라 덮어 둔다', effects: { trust: -4, persona: { prudence: 4 } } },
      { key: 'investigate', label: '스스로 조사해 보게 한다', effects: { trust: 4, persona: { freedom: 8 } } },
      { key: 'sitdown', label: '관련된 이들과 마주 앉아 보게 한다', effects: { trust: 5, persona: { warmth: 5 } } },
    ],
  },

  // ─── 정착기 (확립·하산) ───
  {
    discipleId: 'gang-muyeol',
    year: 13,
    title: '직진(直眞)',
    body: '마침내 강무열이 모든 것을 알아냈다. 아버지가 어느 명문 세가의 멸문에 손을 보탰다는 사실을. 핏기 가신 얼굴로 사부 앞에 무너지듯 앉는다. "아버지가… 한 가문을 통째로 무너뜨리는 데 협력했다니. 제가 빛내려던 그 명예가… 이런 거였어요. 저, 이제 어떻게 살죠?"',
    choices: [
      { key: 'cut', label: '가문과 끊고 네 길을 가라 한다', effects: { righteousness: 1, persona: { integrity: 10, freedom: 6 } } },
      { key: 'wash', label: '네 손으로 그 어둠을 씻으라 한다', effects: { righteousness: 1, persona: { integrity: 8, mercy: 6 } } },
      { key: 'apologize', label: '피해 입은 이들에게 직접 사죄하게 한다', effects: { trust: 5, righteousness: 1, persona: { mercy: 10 } } },
      { key: 'abandon', label: '혼자 삼키도록 외면해 둔다', effects: { trust: -6, darkness: 1, persona: { warmth: -6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 14,
    title: '세죄(洗罪)',
    body: '진실을 받아들인 강무열의 눈빛이 한결 차분해졌다. 이제 무엇을 할지 스스로 정하려 한다. "사부님, 아버지의 죄를 제가 대신 갚을 순 없겠죠. 그래도… 제가 할 수 있는 일을 하고 싶어요. 어떤 길이 옳을까요?"',
    choices: [
      { key: 'sever', label: '가문과의 단절을 선언하게 한다', effects: { persona: { integrity: 8, freedom: 5 } } },
      { key: 'reconcile', label: '피해 입은 핏줄에게 화해와 사죄를 청하게 한다', effects: { trust: 5, righteousness: 1, persona: { mercy: 10 } } },
      { key: 'atone', label: '흑사파 토벌로 속죄하게 한다', effects: { righteousness: 1, persona: { integrity: 8, ambition: 5 } } },
      { key: 'fixwithin', label: '가문 안에서 잘못을 바로잡게 한다', effects: { trust: 4, persona: { integrity: 6, prudence: 6 } } },
    ],
  },
  {
    discipleId: 'gang-muyeol',
    year: 15,
    title: '하산(下山) — 도객의 길',
    body: '십오 년이 흘렀다. 떠날 날을 앞둔 강무열이 도(刀)를 갈무리하고 사부 앞에 선다. 어느새 스물넷, 가문의 그늘을 마주하고도 곧게 선 도객이다. "사부님, 이제 산을 내려갑니다. 제가 진 이름의 무게도, 제가 닦은 칼의 뜻도… 모두 안고 가겠습니다. 마지막으로, 어느 길로 가야 할지 여쭙고 싶어요."',
    choices: [
      { key: 'guardian', label: '약한 이를 지키는 정파 도객의 길을 권한다', effects: { righteousness: 2, persona: { integrity: 8, mercy: 8 } } },
      { key: 'alliance', label: '무림맹의 호법으로 큰 정의에 서라 한다', effects: { righteousness: 2, persona: { integrity: 8, ambition: 6 } } },
      { key: 'severed', label: '가문과 단절한 정파 명사로 새 이름을 세우라 한다', effects: { righteousness: 1, persona: { integrity: 10, freedom: 6 } } },
      { key: 'return', label: '가문 무관으로 돌아가 안에서 바로 세우라 한다', effects: { persona: { integrity: 6, ambition: 6 } } },
    ],
  },
];
