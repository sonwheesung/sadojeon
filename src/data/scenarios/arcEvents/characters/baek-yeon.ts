import type { ArcEvent } from '../types';

// 캐릭터 필수 이벤트 아크 — 백연(baek-yeon). docs/47·48.
// 도가 출신·평정의 흰 연꽃. 흑화 창 없음(평정 상실 캐릭터) → darkness 절대 미사용.
// 12 '부환동심' 무관심 선택은 trust 큰 폭 마이너스로 "평정 상실"을 표현.
// 경지 중립(7번 포함)·동문 일반화(2·3·8·9)·숨은변수 비노출.
export const BAEK_YEON_ARC: ArcEvent[] = [
  // ─── 입문기 (적응·첫 보살핌) ───
  {
    discipleId: 'baek-yeon',
    year: 1,
    title: '연화입문(蓮花入門)',
    body: '입문 첫날, 백연의 아버지가 흰 연꽃 한 송이를 딸의 손에 쥐여 주고 산문을 내려간다. 아이는 울지 않고 가만히 꽃을 바라보다 사부에게 묻는다. "사부님, 여기서도… 도를 닦아도 될까요. 아버지께서 도를 잊지 말라 하셨어요."',
    choices: [
      { key: 'meditate', label: '함께 명상하며 첫 밤을 보낸다', effects: { trust: 8, persona: { prudence: 6 } } },
      { key: 'respect', label: '네 도가의 방식을 존중하마', effects: { trust: 6, persona: { prudence: 10, freedom: 4 } } },
      { key: 'rule', label: '먼저 사문의 규율부터 익히라 한다', effects: { trust: 4, persona: { integrity: 6, prudence: 4 } } },
      { key: 'open', label: '그리우면 언제든 말하라 곁을 열어 둔다', effects: { trust: 7, persona: { warmth: 6 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 2,
    title: '연수동상(蓮手同傷)',
    body: '수련 중 한 동문이 팔을 깊이 다쳤다. 백연이 가까운 동문과 나란히 무릎을 꿇고 상처를 살핀다. "사부님, 제가 치료를 도와도 될까요. 약초 다루는 법은 아버지께 배웠어요." 작은 손이 벌써 지혈을 시작한다.',
    choices: [
      { key: 'entrust', label: '의무실 일을 둘에게 맡긴다', effects: { trust: 6, persona: { mercy: 8, warmth: 8 } } },
      { key: 'soloHer', label: '백연 혼자 도맡게 한다', effects: { trust: 4, persona: { mercy: 10, prudence: 4 } } },
      { key: 'elder', label: '어른 의원에게 넘기게 한다', effects: { trust: 4, persona: { prudence: 6, mercy: 4 } } },
      { key: 'teach', label: '치료법을 제대로 가르쳐 준다', effects: { trust: 5, persona: { mercy: 6, integrity: 5 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 3,
    title: '암향상조(暗香相照)',
    body: '마음이 어두운 한 동문이 밤마다 악몽에 시달린다는 것을 백연이 알아챘다. 흰 연꽃을 들고 사부를 찾아온다. "그 아이 곁에서… 함께 명상해도 될까요. 향을 피우고 숨을 고르면, 어둠도 조금은 옅어져요."',
    choices: [
      { key: 'allow', label: '다가가게 허락한다', effects: { trust: 7, persona: { mercy: 10, warmth: 6 } } },
      { key: 'withMe', label: '사부가 함께 동행해 살핀다', effects: { trust: 6, persona: { mercy: 8, prudence: 5 } } },
      { key: 'distance', label: '거리를 두게 한다', effects: { trust: 4, persona: { prudence: 8, mercy: -4 } } },
      { key: 'limited', label: '제한된 시간만 곁에 두게 한다', effects: { trust: 5, persona: { prudence: 6, mercy: 4 } } },
    ],
  },

  // ─── 기초기 (도와 무공 사이) ───
  {
    discipleId: 'baek-yeon',
    year: 4,
    title: '태청초개(太淸初開)',
    body: '백연의 기력 다스림이 또래를 한참 앞선다. 호흡 한 번에 마음이 거울처럼 가라앉는다. "사부님, 명상을 더 길게 해도 될까요. 깊이 들어가면… 더 멀리 보일 것 같아요."',
    choices: [
      { key: 'seclude', label: '긴 폐관 명상을 허락한다', effects: { trust: 5, persona: { prudence: 10, freedom: 4 } } },
      { key: 'moderate', label: '적당히, 동문과 함께하게 한다', effects: { trust: 5, persona: { prudence: 5, warmth: 6 } } },
      { key: 'heal', label: '의술 수련과 병행하게 한다', effects: { trust: 4, persona: { mercy: 6, prudence: 5 } } },
      { key: 'own', label: '본인 리듬에 맡긴다', effects: { trust: 6, persona: { freedom: 8, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 5,
    title: '부신연서(父信蓮書)',
    body: '아버지에게서 서신이 왔다. "자라거든 도가로 돌아와 함께 의술을 펴자." 백연이 편지를 품에 안고 한참 말이 없다. "돌아가야 할까요… 아니면 여기 더 머물러야 할까요. 잘 모르겠어요, 사부님."',
    choices: [
      { key: 'return', label: '돌아갈 길로 마음을 두라 한다', effects: { trust: 5, persona: { freedom: 6 }, righteousness: 2 } },
      { key: 'choose', label: '네가 정하라, 어느 쪽도 옳다', effects: { trust: 8, persona: { freedom: 10 } } },
      { key: 'study', label: '아직은 사문의 배움이 먼저라 한다', effects: { trust: 4, persona: { prudence: 6, integrity: 4 } } },
      { key: 'reply', label: '답신을 함께 써 내려간다', effects: { trust: 7, persona: { warmth: 8, freedom: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 6,
    title: '무위시문(無爲是問)',
    body: '백연이 처음으로 망설임을 내비친다. "사부님, 도가의 무위(無爲)가… 강호에선 너무 약한 건 아닐까요. 다투지 않는 마음으로, 정말 누군가를 지킬 수 있을까요."',
    choices: [
      { key: 'oneness', label: '도와 무공은 둘이 아니다', effects: { trust: 7, persona: { integrity: 10 }, righteousness: 1 } },
      { key: 'flow', label: '약함이 아니라 흐름이라 일러 준다', effects: { trust: 6, persona: { integrity: 8, prudence: 5 } } },
      { key: 'yourPath', label: '자비도 힘이다, 네 길을 믿으라', effects: { trust: 6, persona: { mercy: 6, integrity: 4 }, righteousness: 1 } },
      { key: 'youRight', label: '네 의심이 옳다, 더 단단해지라', effects: { trust: 4, persona: { integrity: 6, ambition: 4 } } },
    ],
  },

  // ─── 무공기 (심법 대성·정체성) ───
  {
    discipleId: 'baek-yeon',
    year: 7,
    title: '도현일점(道現一點)',
    body: '오랜 정진 끝에 백연의 눈빛이 호수처럼 맑아졌다. 사부 앞에 단정히 앉아 조용히 고한다. "사부님, 이제… 도가 무엇인지 알 것 같아요. 말로는 다 못 하지만, 마음 한 점이 또렷해졌어요."',
    choices: [
      { key: 'acknowledge', label: '그 깨달음을 인가한다', effects: { trust: 8, persona: { prudence: 10 } } },
      { key: 'deeper', label: '더 깊이 들어가 보라 권한다', effects: { trust: 6, persona: { prudence: 8, freedom: 4 } } },
      { key: 'apply', label: '그 도를 무공에 접목하게 한다', effects: { trust: 5, persona: { prudence: 6, integrity: 5 } } },
      { key: 'humble', label: '겸손을 일깨워 준다', effects: { trust: 5, persona: { prudence: 6, warmth: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 8,
    title: '연정청흑(蓮淨淸黑)',
    body: '오래 보살펴 온 가까운 동문이 다시 어두워졌다. 눈빛이 가라앉고 말수가 줄었다. 백연이 흰 연꽃을 들고 사부를 찾는다. "제 평정을… 그 아이에게 나눠 줄 수 있을까요. 곁에서 함께 숨을 고르면, 다시 가라앉힐 수 있을 것 같아요."',
    choices: [
      { key: 'deep', label: '깊이 개입하도록 허락한다', effects: { trust: 8, persona: { mercy: 12 } } },
      { key: 'mediate', label: '함께 중재에 나선다', effects: { trust: 7, persona: { mercy: 8, warmth: 5 } } },
      { key: 'limit', label: '선을 넘지 않게 제한한다', effects: { trust: 4, persona: { prudence: 8, mercy: -4 } } },
      { key: 'refuse', label: '네가 짊어질 일이 아니라 막는다', effects: { trust: 4, persona: { prudence: 6, mercy: -6 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 9,
    title: '쌍수성단(雙手成丹)',
    body: '위중한 동문을 두고 백연이 가까운 동문과 밤을 새운다. 두 사람의 손끝에서 처음으로 영약 한 알이 함께 빚어졌다. "사부님, 둘이 손을 모으니… 혼자선 못 살릴 목숨도 붙잡을 수 있었어요."',
    choices: [
      { key: 'pillar', label: '두 사람을 사문 의술의 기둥으로 세운다', effects: { trust: 7, persona: { mercy: 10, warmth: 8 } } },
      { key: 'apex', label: '백연을 그 정점에 둔다', effects: { trust: 5, persona: { mercy: 6, ambition: 5 } } },
      { key: 'balance', label: '무공과 균형을 잡으라 한다', effects: { trust: 5, persona: { prudence: 6, integrity: 4 } } },
      { key: 'friendship', label: '둘의 우정에 맡겨 둔다', effects: { trust: 6, persona: { warmth: 10 } } },
    ],
  },

  // ─── 실전기 (강호와 자비) ───
  {
    discipleId: 'baek-yeon',
    year: 10,
    title: '선문구원(仙門求援)',
    body: '아버지가 몸담은 도가의 한 분파가 사문에 도움을 청해 왔다. 백연이 조용히, 그러나 또렷이 청한다. "사부님, 제가 다녀와도 될까요. 도가의 사람들이 어려움에 처했다면… 외면할 수가 없어요."',
    choices: [
      { key: 'send', label: '백연을 파견한다', effects: { trust: 6, persona: { integrity: 6 }, righteousness: 2 } },
      { key: 'together', label: '동문과 함께 보낸다', effects: { trust: 6, persona: { warmth: 6, integrity: 4 }, righteousness: 1 } },
      { key: 'escort', label: '사부가 동행한다', effects: { trust: 7, persona: { prudence: 6, integrity: 4 }, righteousness: 1 } },
      { key: 'decline', label: '사문의 일이 먼저라 거절한다', effects: { trust: 4, persona: { integrity: 8, prudence: 4 }, righteousness: -1 } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 11,
    title: '활살지경(活殺之境)',
    body: '실전에서 백연이 처음으로 도와 검 사이에서 흔들린다. 적을 베지 않으면 동료가 죽는 자리였다. 돌아온 백연의 손이 미세하게 떨린다. "살리는 손으로… 누군가를 베어야 한다면, 저는 어떻게 해야 하나요."',
    choices: [
      { key: 'subdue', label: '끝까지 자비로 제압만 하라 한다', effects: { trust: 6, persona: { mercy: 10, integrity: 4 } } },
      { key: 'accept', label: '부득이한 베임도 인정해 준다', effects: { trust: 6, persona: { integrity: 10, mercy: -4 } } },
      { key: 'aftercare', label: '벤 뒤를 의술로 책임지게 한다', effects: { trust: 7, persona: { mercy: 8, integrity: 5 } } },
      { key: 'retreat', label: '감당 못 할 자리에선 물러서라 한다', effects: { trust: 5, persona: { prudence: 8, mercy: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 12,
    title: '부환동심(父患動心)',
    body: '아버지가 병으로 자리에 누웠다는 소식이 닿았다. 평정의 백연이 처음으로 흔들린다. 손에 쥔 흰 연꽃이 가늘게 떨린다. "사부님… 마음이 자꾸 흐트러져요. 이런 제가, 도를 닦았다 할 수 있을까요."',
    choices: [
      { key: 'visit', label: '잠시 다녀오게 한다', effects: { trust: 7, persona: { warmth: 10 }, righteousness: 1 } },
      { key: 'meditate', label: '곁에서 함께 명상하며 마음을 다스린다', effects: { trust: 8, persona: { warmth: 8, prudence: 6 } } },
      { key: 'promise', label: '회차 뒤 돌아갈 약속을 함께 세운다', effects: { trust: 6, persona: { warmth: 6, prudence: 4 }, righteousness: 1 } },
      { key: 'ignore', label: '무인은 사사로운 정에 흔들리지 않는다며 둔다', effects: { trust: -8, persona: { warmth: -6, mercy: -6 } } },
    ],
  },

  // ─── 정착기 (확립·하산) ───
  {
    discipleId: 'baek-yeon',
    year: 13,
    title: '약왕소명(藥王召命)',
    body: '의술의 명망이 강호에 퍼져, 한 의문(醫門)이 백연을 약왕 후보로 부른다. 그릇을 묻는 첫 시험 앞에서 백연이 담담히 말한다. "더 많은 목숨을 살릴 수 있다면… 그 길을 가야 할까요. 다만 이름을 얻으려는 건 아니에요."',
    choices: [
      { key: 'kingPath', label: '약왕의 길을 걸으라 권한다', effects: { trust: 6, persona: { mercy: 8, ambition: 4 }, righteousness: 1 } },
      { key: 'wanderer', label: '이름 없이 떠도는 자비의 손이 되라 한다', effects: { trust: 6, persona: { mercy: 10, freedom: 6 } } },
      { key: 'sectHealer', label: '사문의 의원으로 남으라 한다', effects: { trust: 5, persona: { warmth: 6, prudence: 4 } } },
      { key: 'flow', label: '흐름에 맡기라, 부름도 도의 일부다', effects: { trust: 6, persona: { prudence: 8, freedom: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 14,
    title: '연념동문(蓮念同門)',
    body: '하산을 앞두고 백연이 동문들의 앞날을 걱정한다. 특히 어둠을 안고 사는 가까운 이들의 이름을 하나하나 헤아린다. "사부님, 제가 떠나면… 그 아이들은 누가 곁을 지켜 주죠. 끈이 끊기지 않게 해 두고 싶어요."',
    choices: [
      { key: 'careEnd', label: '끝까지 보살피게 한다', effects: { trust: 7, persona: { mercy: 10, warmth: 6 } } },
      { key: 'selfFirst', label: '네 길부터 챙기라 한다', effects: { trust: 4, persona: { prudence: 6, mercy: -4 } } },
      { key: 'tie', label: '이어 줄 끈을 함께 맺어 준다', effects: { trust: 8, persona: { warmth: 10, mercy: 6 } } },
      { key: 'finishTogether', label: '남은 일을 함께 마무리한다', effects: { trust: 7, persona: { warmth: 8, prudence: 4 } } },
    ],
  },
  {
    discipleId: 'baek-yeon',
    year: 15,
    title: '하산(下山) — 흰 연꽃이 길을 정하다',
    body: '열다섯 해, 흔들리지 않던 흰 연꽃이 단 한 번 평정을 시험받고도 끝내 맑게 피었다. 떠나기 전날, 백연이 아버지가 쥐여 준 그 연꽃을 사부 앞에 내려놓는다. "아버지의 도가로 돌아갈까 해요. 거기서 사람을 살리며, 사부님께 배운 마음을 펴 보이겠어요."',
    choices: [
      { key: 'taoReturn', label: '아버지의 도가 선문으로 돌아가라', effects: { trust: 8, persona: { prudence: 6 }, righteousness: 2 } },
      { key: 'wanderHealer', label: '이름 없이 떠도는 도사가 되라', effects: { trust: 7, persona: { freedom: 10, mercy: 6 } } },
      { key: 'sectHealer', label: '사문의 의원으로 남아 곁을 지키라', effects: { trust: 7, persona: { warmth: 8, mercy: 6 } } },
      { key: 'pharmacy', label: '가까운 동문과 약방을 함께 열라', effects: { trust: 7, persona: { warmth: 10, mercy: 6 } } },
    ],
  },
];
