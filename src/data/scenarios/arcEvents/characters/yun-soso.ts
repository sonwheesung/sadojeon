import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 윤소소(yun-soso). docs/47·48.
// 아크 결: 4세에 본 살수 그림자를 15년 품은 양반가 막내가 복수의 검을 내려놓느냐 휘두르느냐.
// 흑화 창 = 복수(darkness +1 은 복수에 기우는 선택에만). 경지 중립(docs/47 §12).
// 동문 참조는 솔로 안전 — 특정 동문을 콕 집지 않고 "한 동문"으로 일반화(로스터 부재 시에도 성립).
// 말투: 양반가 막내, 입문 9세 → 하산 23세. 곧고 도도하나 속에 한을 묻은 존댓말.
export const YUN_SOSO_ARC: ArcEvent[] = [
  // ─── 입문기 (양반 자존·첫 의심) ───
  {
    discipleId: 'yun-soso',
    year: 1,
    title: '소의(素衣)',
    body: '입문 첫날, 비단옷을 벗고 사문 무복으로 갈아입으라는 말에 윤소소가 굳어버린다. 옷자락을 두 손으로 꼭 쥔 채 고개를 든다. "이 옷은… 어머니께서 손수 지어주신 거예요. 함부로 벗어 버릴 수는 없어요."',
    choices: [
      { key: 'keep', label: '곱게 개어 사부가 맡아 두겠다 한다', effects: { trust: 6, persona: { prudence: 5, integrity: 4 } } },
      { key: 'sash', label: '어머니 정표로 허리끈만 남기게 한다', effects: { trust: 5, persona: { warmth: 8, freedom: 4 } } },
      { key: 'praise', label: '그 곧은 마음이 보기 좋다, 네 뜻대로 하라', effects: { trust: 4, persona: { freedom: 10, integrity: 5 } } },
      { key: 'scold', label: '양반 티를 벗는 것이 첫 수련이라 꾸짖는다', effects: { trust: -4, persona: { integrity: 6, freedom: -8 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 2,
    title: '한목(寒目)',
    body: '요즈음 윤소소가 한 동문을 두고 묘한 말을 흘리고 다닌다. "저 차가운 눈… 보고 있으면 어쩐지 오래전 일이 떠올라요." 그 말이 번지자 동문들이 슬그머니 그 아이를 멀리하기 시작한다.',
    choices: [
      { key: 'rebuke', label: '까닭 없이 동문을 따돌리는 일을 공개로 꾸짖는다', effects: { trust: -3, persona: { integrity: 8, mercy: 5 } } },
      { key: 'seclude', label: '보름간 홀로 마음을 가다듬게 한다', effects: { trust: -2, persona: { prudence: 8 } } },
      { key: 'listen', label: '따로 불러 비단주머니에 담긴 그날 이야기를 들어준다', effects: { trust: 7, persona: { warmth: 8, mercy: 6 } } },
      { key: 'ignore', label: '아이들 일이라 여겨 못 들은 척 흘려보낸다', effects: { trust: -2, darkness: 1, righteousness: -1, persona: { mercy: -6 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 3,
    title: '탐협(探篋)',
    body: '한 동문이 사부를 찾아온다. "제 짐의 손길이 흐트러져 있었습니다. 잃은 건 없습니다만…" 정황은 윤소소를 가리킨다. 추궁하자 소소는 눈도 깜박이지 않고 답한다. "도둑질은 하지 않았어요. 그저… 확인하고 싶은 게 있었을 뿐이에요."',
    choices: [
      { key: 'halt', label: '한동안 무공 수련을 멈추게 한다', effects: { trust: -3, persona: { integrity: 8, prudence: 4 } } },
      { key: 'seclude', label: '홀로 가두어 그 마음을 살피게 한다', effects: { trust: -2, persona: { prudence: 8 } } },
      { key: 'face', label: '둘을 사부 앞에 마주 세워 매듭짓게 한다', effects: { trust: 5, righteousness: 1, persona: { warmth: 6, mercy: 5 } } },
      { key: 'cover', label: '동문에게 짐을 잠그라 이르고 일을 덮어둔다', effects: { darkness: 1, persona: { prudence: 4, mercy: -5 } } },
    ],
  },

  // ─── 기초기 (가문 결별·복수 단서) ───
  {
    discipleId: 'yun-soso',
    year: 4,
    title: '야출(夜出)',
    body: '깊은 밤, 윤소소가 산문을 몰래 빠져나갔다가 동이 터서야 돌아온다. 추궁하자 처음으로 속내를 비친다. "어떤 살수 무리의 단서를 쫓고 있었어요. 4년 전… 제가 본 그 그림자를요. 잘못한 건가요?"',
    choices: [
      { key: 'forbid', label: '산문 출입을 금하고 무공도 멈추게 한다', effects: { trust: -4, persona: { integrity: 8, freedom: -6 } } },
      { key: 'seclude', label: '홀로 가두어 들끓는 마음을 가라앉히게 한다', effects: { trust: -2, persona: { prudence: 8 } } },
      { key: 'guide', label: '다음엔 혼자 가지 말고 내게 먼저 오라, 정파의 든든한 이를 인편으로 붙여준다', effects: { trust: 7, righteousness: 1, persona: { warmth: 6 } } },
      { key: 'turn', label: '알면서도 모르는 척 둔다', effects: { trust: -2, darkness: 1, persona: { freedom: 6 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 5,
    title: '혼서(婚書)',
    body: '가문에서 서신이 왔다. "시집 자리가 정해졌으니 돌아오너라." 늘 곧던 소소의 눈이 처음으로 흔들린다. "저는… 아직 끝내지 못한 일이 있어요. 그런데 가문의 뜻을 거스르는 게, 정말 옳은 걸까요."',
    choices: [
      { key: 'plead', label: '사부가 직접 가문에 양육을 더 이어가게 청한다', effects: { trust: 7, persona: { warmth: 5, integrity: 4 } } },
      { key: 'refuse', label: '네 뜻이 그렇다면 거절해도 좋다 한다', effects: { trust: 4, persona: { freedom: 10, ambition: 6 } } },
      { key: 'sever', label: '검의 길을 가려거든 가문과 연을 끊으라 한다', effects: { trust: -3, persona: { integrity: 8, freedom: 5 } } },
      { key: 'obey', label: '가문의 뜻이니 다녀오라 이른다', effects: { trust: -4, persona: { freedom: -8, integrity: -4 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 6,
    title: '검재(劍才)',
    body: '윤소소의 검이 동문들을 훌쩍 앞질렀다. 함께 어울려 수련하길 마다하고 홀로 검을 휘두른다. "저만한 상대와 겨뤄서는 검이 늘지 않아요. 혼자 더 깊이 파고들게 해주세요."',
    choices: [
      { key: 'solo', label: '홀로 깊이 파고드는 수련을 허락한다', effects: { trust: 4, persona: { ambition: 10, freedom: 5 } } },
      { key: 'pair', label: '더딘 동문과 합을 맞추게 한다', effects: { trust: 4, persona: { warmth: 8, mercy: 4 } } },
      { key: 'together', label: '검은 혼자 크는 것이 아니라 이른다', effects: { trust: 5, persona: { integrity: 8, warmth: 5 } } },
      { key: 'leave', label: '알아서 하게 둔다', effects: { trust: -2, persona: { freedom: 5 } } },
    ],
  },

  // ─── 무공기 (검의 의미·살수 거부) ───
  {
    discipleId: 'yun-soso',
    year: 7,
    title: '거인(拒刃)',
    body: '마을의 한 떠돌이 무인이 윤소소에게 은밀히 속삭였다 한다. "살법과 암기를 익히면 반년 안에 그자의 목을 벨 수 있다." 소소가 사부에게 와 묻는다. 검집을 쥔 손끝이 떨린다. "사부님… 그 길도, 검이라 할 수 있나요?"',
    choices: [
      { key: 'refuse', label: '그 길을 단칼에 끊도록 함께 돕는다', effects: { trust: 7, righteousness: 2, persona: { integrity: 10 } } },
      { key: 'peek', label: '적을 알려면 한 수쯤 봐두는 것도 나쁘지 않다 한다', effects: { darkness: 1, righteousness: -2, persona: { prudence: 4 } } },
      { key: 'ask', label: '네가 베고 싶은 것이 무엇이냐 되묻는다', effects: { trust: 5, persona: { mercy: 8, prudence: 6 } } },
      { key: 'own', label: '네 판단에 맡긴다', effects: { trust: -2, persona: { freedom: 5 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 8,
    title: '청풍오(淸風悟)',
    body: '검을 닦던 윤소소가 문득 검을 내려놓고 묻는다. "사부님. 복수를 위해 휘두르는 검도… 검이라 부를 수 있나요. 저는 대체 무엇을 위해 검을 잡은 걸까요."',
    choices: [
      { key: 'protect', label: '검은 사람을 지키기 위한 것이라 일러준다', effects: { trust: 5, righteousness: 2, persona: { mercy: 10 } } },
      { key: 'dark', label: '복수만을 좇는 검은 끝내 제 주인을 벤다 한다', effects: { trust: 4, righteousness: 1, persona: { integrity: 8, mercy: 4 } } },
      { key: 'grind', label: '그 답은 스스로 갈아내는 것이라 한다', effects: { trust: 4, persona: { freedom: 6, prudence: 5 } } },
      { key: 'gaze', label: '말없이 그 눈을 응시한다', effects: { trust: 3, persona: { prudence: 6 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 9,
    title: '호동(護同)',
    body: '의뢰 길에서 한 동문이 크게 다쳐 쓰러진다. 그를 부축하려면 4년을 쫓던 단서를 놓아야 한다. 윤소소의 손끝이 검집 위에서 머뭇거린다. "지금 돌아서면… 다시는 그 단서를 못 잡을지도 몰라요. 그런데…"',
    choices: [
      { key: 'save', label: '망설임 없이 동문을 구하라 한다', effects: { trust: 6, righteousness: 1, persona: { mercy: 10, warmth: 8 } } },
      { key: 'watch', label: '스스로 택하도록 지켜본다', effects: { trust: 3, persona: { prudence: 6 } } },
      { key: 'sheathe', label: '쓰러진 이 앞에선 검을 거두는 법이라 이른다', effects: { trust: 4, persona: { mercy: 8, integrity: 5 } } },
      { key: 'distance', label: '정이 깊으면 검이 흔들린다, 거리를 두게 한다', effects: { trust: -3, persona: { warmth: -6, prudence: 4 } } },
    ],
  },

  // ─── 실전기 (복수의 실행·진실) ───
  {
    discipleId: 'yun-soso',
    year: 10,
    title: '토살(討殺)',
    body: '사문에 살수 무리 토벌 의뢰가 들어온다. 윤소소가 사부 앞에 무릎을 꿇는다. 늘 도도하던 아이의 첫 부탁이다. "사부님, 저를 보내주세요. 부탁이에요. 정식 의뢰라면… 떳떳하게 갈 수 있잖아요."',
    choices: [
      { key: 'allow', label: '정의로운 의뢰이니 떳떳이 다녀오라 한다', effects: { trust: 6, righteousness: 2, persona: { ambition: 6 } } },
      { key: 'deny', label: '아직 검이 흔들린다, 보낼 수 없다 한다', effects: { trust: -4, persona: { prudence: 8 } } },
      { key: 'withFriend', label: '한 동문과 한 조로 묶어 보낸다', effects: { trust: 4, persona: { warmth: 5, prudence: 5 } } },
      { key: 'guardian', label: '듬직한 동문을 곁에 딸려 보낸다', effects: { trust: 5, persona: { warmth: 4, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 11,
    title: '동행(同行)',
    body: '윤소소가 한 동문과 한 조가 되어 먼 의뢰 길에 올랐다. 객점에 묵은 밤, 4년을 쫓던 진실이 손에 닿을 듯 가까워진다. 소소의 눈빛이 서늘하게 가라앉는다. "사부님… 이제 곧, 알게 될 것 같아요."',
    choices: [
      { key: 'together', label: '그 길을 끝까지 동문과 함께 가게 한다', effects: { trust: 7, righteousness: 1, persona: { warmth: 6 } } },
      { key: 'split', label: '두 사람을 즉시 떼어 놓는다', effects: { trust: -4, persona: { prudence: 6 } } },
      { key: 'escort', label: '사부가 직접 동행한다', effects: { trust: 6, persona: { mercy: 5, prudence: 4 } } },
      { key: 'recall', label: '의뢰를 거두어 길을 끊는다', effects: { trust: -5, persona: { prudence: 8 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 12,
    title: '대진(對眞)',
    body: '마침내 진실이 드러난다. 한 동문이 윤소소 앞에 무릎을 꿇고 떨리는 목소리로 고백한다. "그 노비 형을… 제가 죽였습니다. 당신이 네 살 때. 시키는 대로 한 일이었지만… 변명하지 않겠습니다." 윤소소의 검 든 손이 부들부들 떨린다.',
    choices: [
      { key: 'forgive', label: '지난 죄를 용서하도록 권한다', effects: { trust: 5, righteousness: 1, persona: { mercy: 12 } } },
      { key: 'sheathe', label: '분노는 옳으나 검만은 거두라 한다', effects: { trust: 5, persona: { mercy: 8, integrity: 6 } } },
      { key: 'silent', label: '말없이, 스스로 답을 내도록 둔다', effects: { trust: 3, persona: { prudence: 8 } } },
      { key: 'avenge', label: '베고 싶다면 네 한을 따르라 한다', effects: { trust: -3, darkness: 1, righteousness: -2, persona: { mercy: -8 } } },
    ],
  },

  // ─── 정착기 (확립·하산) ───
  {
    discipleId: 'yun-soso',
    year: 13,
    title: '소낭(素囊)',
    body: '진실이 지난 뒤, 윤소소가 늘 품고 다니던 비단주머니를 연다. 안에는 오래된 머리카락 한 올. 한참을 응시하다 나직이 중얼거린다. "죽은 사람은… 돌아오지 않네요. 이걸 쥐고 산다고 그 사람이 살아 돌아오는 것도 아닌데."',
    choices: [
      { key: 'bury', label: '함께 양지바른 곳에 묻어 보내주자 한다', effects: { trust: 6, persona: { mercy: 10, warmth: 8 } } },
      { key: 'beside', label: '말없이 곁을 지킨다', effects: { trust: 5, persona: { warmth: 8 } } },
      { key: 'distinguish', label: '잊는 것과 내려놓는 것은 다르다 일러준다', effects: { trust: 4, persona: { mercy: 8, prudence: 6 } } },
      { key: 'leave', label: '스스로 매듭짓도록 둔다', effects: { trust: 3, persona: { prudence: 5 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 14,
    title: '위수(爲誰)',
    body: '검이 무르익은 어느 날, 윤소소가 검을 갈무리하며 사부에게 묻는다. "이제 제 검은… 누구를 위한 검인가요. 지킬 사람도, 벨 사람도 정해지지 않은 검은 어디로 가야 하죠."',
    choices: [
      { key: 'weak', label: '약한 이를 지키는 검이 되라 한다', effects: { trust: 5, righteousness: 1, persona: { mercy: 10, integrity: 6 } } },
      { key: 'house', label: '무너진 가문을 다시 세우는 검이 되라 한다', effects: { trust: 4, persona: { ambition: 10, integrity: 5 } } },
      { key: 'teach', label: '뒤를 잇는 이를 기르는 검이 되라 한다', effects: { trust: 4, persona: { warmth: 8, mercy: 5 } } },
      { key: 'justice', label: '늘 정의를 되묻는 검이 되라 한다', effects: { trust: 4, righteousness: 1, persona: { integrity: 10, prudence: 5 } } },
    ],
  },
  {
    discipleId: 'yun-soso',
    year: 15,
    title: '하산(下山)',
    body: '15년이 흘렀다. 하산하는 날, 비단옷 대신 검 한 자루를 든 윤소소가 사부 앞에 마지막 절을 올린다. "사부님 덕분에… 제 검이 무엇을 위한 것인지 알았어요. 이제 강호로 나갑니다. 저는, 어떤 검객으로 살아야 할까요."',
    choices: [
      { key: 'master', label: '어둠을 베는 정파의 명사로 서라 한다', effects: { trust: 6, righteousness: 2, persona: { integrity: 10 } } },
      { key: 'serene', label: '한을 내려놓은 평온한 검객으로 살라 한다', effects: { trust: 6, persona: { mercy: 10, warmth: 6 } } },
      { key: 'ally', label: '한 동문과 손잡고 함께 강호를 걸으라 한다', effects: { trust: 6, righteousness: 1, persona: { warmth: 10, mercy: 8 } } },
      { key: 'vendetta', label: '끝내 그자들을 베러 가는 사생결단의 길로 보낸다', effects: { trust: -3, darkness: 1, righteousness: -2, persona: { mercy: -8 } } },
    ],
  },
];
