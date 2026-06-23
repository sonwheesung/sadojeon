// 강호 출행 사건 풀 — docs/38 §1①. 그레이박스(소수 시작 → 확장).
// 도중 선택형: 여정 중 사건이 터지면 서신함에서 사부가 선택(의뢰 돌발과 같은 결).
// 전투(combat)는 실제 전투 엔진으로 한 판 굴린다 — 승패가 보상·상처를 정한다.
// 갈래: 전투(combat)·인연(bond)·풍문(rumor)·횡재(fortune)·위기(crisis).

import type { ExpeditionEvent } from '@/types/activity';

export const EXPEDITION_EVENTS: readonly ExpeditionEvent[] = [
  // ── 전투 ──────────────────────────────────────────────────────────────
  {
    id: 'x-bandits',
    category: 'combat',
    weight: 10,
    prompt: '산길 어귀, 칼을 빼 든 산적 무리가 길을 막아섰다. 노자를 내놓으라 으름장을 놓는다.',
    choices: [
      {
        key: 'fight',
        label: '맞선다',
        effect: { resultText: '병장기를 맞댔다.', combat: true, enlighten: true },
      },
      {
        key: 'evade',
        label: '샛길로 돌아간다',
        roll: { by: 'scouting', base: 0.5 },
        effect: { resultText: '발소리를 죽여 산채를 멀찍이 돌아 빠져나왔다.', persona: { prudence: 1 } },
        failEffect: { resultText: '돌아가던 길이 막혀 쫓겼다. 가까스로 벗어났으나 생채기가 남았다.', woundSeverity: 5 },
      },
      {
        key: 'pay',
        label: '노자를 던져주고 길을 튼다',
        require: { money: 80 },
        effect: { resultText: '노자 한 줌을 던져주니 길을 텄다. 강호의 이치란 본디 이런 것이다.', persona: { prudence: 1, ambition: -1 } },
      },
    ],
  },
  {
    id: 'x-duel-challenge',
    category: 'combat',
    weight: 7,
    minDanger: 0.4,
    prompt: '한 무인이 앞을 막아서더니, 사문의 이름을 듣고는 정중히 한 수를 청한다. 사사로운 원한 없는 비무다.',
    choices: [
      {
        key: 'accept',
        label: '비무를 받는다',
        effect: { resultText: '서로 예를 갖추고 검을 섞었다.', combat: true, enlighten: true, fame: 2 },
      },
      {
        key: 'decline',
        label: '정중히 사양한다',
        effect: { resultText: '손을 모아 사양하니, 상대도 웃으며 길을 비켰다.', persona: { prudence: 1 } },
      },
    ],
  },
  {
    // 압도적 고수(死地) 조우 — 험한 원행 한정. "이기기"가 아니라 "살아 나가기" 결정. docs/38 ①-A.
    // 고수는 발동 시 활성 사파/마교 네임드에서 뽑혀 본문에 등장(흑백쌍노 등 추가 시 자동 후보).
    id: 'x-master-ambush',
    category: 'combat',
    weight: 3,
    minDanger: 0.6,
    prompt: '한 발짝 다가설 때마다 살갗이 저릿한 기세 — 우리로선 가늠조차 안 되는 격의 고수다. 길을 막아선 채, 비킬 생각이 없어 보인다.',
    choices: [
      {
        key: 'stand',
        label: '맞선다 (死地)',
        effect: {
          resultText: '질 줄 알면서도 검을 뽑았다. 死地에서 한 수 한 수가 뼈에 새겨진다.',
          combat: true,
          boss: true,
          enlighten: true,
          fame: 3,
          stressDelta: 6,
          jianghuNews: '죽음의 문턱에서 그 고수의 무공을 두 눈에 새겼다 — 제자가 떨리는 손으로 전해 왔다.',
        },
      },
      {
        key: 'retreat',
        label: '적의를 보이지 않고 물러선다',
        roll: { by: 'etiquette', base: 0.5 },
        effect: {
          resultText: '예를 갖춰 조용히 물러서니, 고수는 흥, 하고 길을 비켰다. 훗날을 기약하며 발길을 돌렸다.',
          fame: -1,
          persona: { prudence: 1 },
          jianghuNews: '물러서며 엿본 그 고수의 정체와 행로를, 제자가 어렴풋이 전해 왔다.',
        },
        failEffect: {
          resultText: '겁에 질려 비굴하게 굽신거렸다. 고수는 코웃음 치며 보내줬으나, 그 꼴이 강호에 소문났다.',
          fame: -3,
          stressDelta: 8,
          persona: { ambition: -1 },
        },
      },
      {
        key: 'scatter',
        label: '연막을 치고 흩어져 달아난다',
        roll: { by: 'scouting', base: 0.4 },
        effect: {
          resultText: '몸을 날려 지형에 숨고, 사방으로 흩어져 자취를 감췄다. 빈손이나 무사히 빠져나왔다.',
          persona: { prudence: 1 },
        },
        failEffect: {
          resultText: '발 느린 이가 따라잡혀 호되게 당했다. 가까스로 끌고 빠져나왔다.',
          woundSeverity: 3,
          stressDelta: 5,
        },
      },
      {
        key: 'tribute',
        label: '가진 것을 바치고 길을 산다',
        require: { money: 200 },
        effect: {
          resultText: '노자와 전리품을 죄다 바치니 고수가 만족하여 길을 텄다. 목숨값 치고는 싸다 여겼다.',
          fame: -2,
          jianghuNews: '그 사문은 으르면 곳간을 연다 — 만만한 표적이라는 말이 사파 쪽에 돌더라고.',
        },
      },
    ],
  },
  // ── 인연 ──────────────────────────────────────────────────────────────
  {
    id: 'x-companion',
    category: 'bond',
    weight: 8,
    prompt: '비슷한 또래의 젊은 무인이 같은 방향이라며 동행을 청한다. 길동무가 있으면 여정이 한결 덜 외로울 터.',
    choices: [
      {
        key: 'travel',
        label: '함께 길을 간다',
        effect: { resultText: '밤이면 모닥불을 사이에 두고 무담(武談)을 나눴다. 함께 걸은 길이 정을 들였다.', relationBump: true, persona: { warmth: 2 }, fame: 1 },
      },
      {
        key: 'part',
        label: '갈 길을 간다',
        effect: { resultText: '가벼이 목례하고 각자의 길로 갈라섰다.' },
      },
    ],
  },
  {
    id: 'x-rescue-traveler',
    category: 'bond',
    weight: 7,
    prompt: '길가에 한 행인이 쓰러져 신음한다. 낯빛이 검푸른 것이 독에 상한 듯하다.',
    choices: [
      {
        key: 'tend',
        label: '독상을 돌본다',
        roll: { by: 'medicine', base: 0.4 },
        effect: { resultText: '침착히 독을 다스려 숨을 돌려놓았다. 살아난 이가 거듭 절하며 사문의 덕을 칭송했다.', fame: 2, persona: { mercy: 2, warmth: 1 } },
        failEffect: { resultText: '손을 다해 보았으나 독이 너무 깊었다. 끝내 눈을 감기지 못한 채 돌려보냈다.', stressDelta: 8, persona: { mercy: 1 } },
      },
      {
        key: 'pass',
        label: '얽히지 않고 지나친다',
        effect: { resultText: '강호의 일에 함부로 끼어드는 법이 아니라며 길을 재촉했다.', persona: { mercy: -2, prudence: 1 } },
      },
    ],
  },
  // ── 풍문 ──────────────────────────────────────────────────────────────
  {
    id: 'x-rumor',
    category: 'rumor',
    weight: 9,
    prompt: '저잣거리 주막, 오가는 강호의 소문에 절로 귀가 트인다.',
    choices: [
      {
        key: 'listen',
        label: '귀를 기울인다',
        effect: {
          resultText: '강호의 물결이 어디로 흐르는지 어렴풋이 가늠하게 되었다.',
          persona: { prudence: 1 },
          jianghuNews: '주막에서 들은 풍문 — 근래 강호의 정세가 심상치 않다는 이야기가 돌더라고 제자가 전해 왔다.',
        },
      },
    ],
  },
  // ── 횡재 ──────────────────────────────────────────────────────────────
  {
    id: 'x-find-herbs',
    category: 'fortune',
    weight: 6,
    prompt: '인적 끊긴 폐가에서 약초꾼이 두고 간 듯한 봇짐을 발견했다. 마른 영초가 그득하다.',
    choices: [
      {
        key: 'take',
        label: '거두어 챙긴다',
        effect: { resultText: '주인 없는 약초를 거두어 봇짐에 담았다.', material: { id: 'herb-rare', qty: 1 } },
      },
    ],
  },
  // ── 위기 ──────────────────────────────────────────────────────────────
  {
    id: 'x-storm',
    category: 'crisis',
    weight: 7,
    minDanger: 0.4,
    prompt: '산중에서 모진 비바람을 만났다. 불어난 계곡물에 길이 끊겼다.',
    choices: [
      {
        key: 'push',
        label: '강행한다',
        roll: { by: 'endurance', base: 0.45 },
        effect: { resultText: '이를 악물고 급류를 건넜다. 고된 길이 근골을 단련했다.', persona: { ambition: 1 } },
        failEffect: { resultText: '물살에 휩쓸려 바위에 부딪혔다. 성한 데 없이 기어 나왔다.', woundSeverity: 4 },
      },
      {
        key: 'wait',
        label: '물러나 비가 그치길 기다린다',
        effect: { resultText: '바위 그늘에 들어 비바람이 잦아들길 기다렸다. 하루를 버렸으나 무탈했다.', persona: { prudence: 1 } },
      },
    ],
  },
  {
    id: 'x-roadside-robbery',
    category: 'crisis',
    weight: 6,
    prompt: '산모퉁이 너머에서 행상이 떼강도에게 약탈당하고 있다. 살려 달라는 비명이 바람을 타고 들려온다.',
    choices: [
      {
        key: 'intervene',
        label: '끼어들어 구한다',
        effect: { resultText: '의(義)를 외면할 수 없어 검을 뽑아 들었다.', combat: true, enlighten: true, fame: 2, persona: { mercy: 2 } },
      },
      {
        key: 'ignore',
        label: '못 본 척 지나친다',
        effect: { resultText: '제 한 몸 건사가 먼저라며 비명을 등졌다. 발걸음이 무거웠다.', persona: { mercy: -3, integrity: -2 } },
      },
    ],
  },
] as const;

// 사건 발동 확률 골격 — dispatch 시 예정 건수 산정에 쓰는 상수.
// 기대 건수 ≈ danger × (days/4) × (1 + worldThreat) × BASE. 0~3건으로 클램프(그레이박스).
export const EXPEDITION_EVENT_BASE = 0.9;
export const EXPEDITION_EVENT_MAX = 3;
