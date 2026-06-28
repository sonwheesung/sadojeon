// 도덕 이벤트 — 한바람 개인 풀. docs/disciples/03 · docs/48
//
// 거리에서 자란 자유의 소년. 흑화 창이 크다 — 거리 출신·사파 유혹·부모 살해
// 복수심·자유 갈증. 아크(arcEvents/han-baram)의 결을 도덕 갈등으로 변주한다.
// 1) 사파 보법 비급 호기심(occult, 가장 위험) 2) 산문 무단이탈(defiance)
// 3) 약육강식 논리로 약자 동문과 충돌(violence). overlook 에 흑화 가속,
// 가장 큰 사건만 드물게 한 단계 깊어진다. 솔로로도 성립한다.

import type { MoralEventTemplate } from '@/types';

export const HANBARAM_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 사파 보법 비급 호기심 — 가장 위험한 사건 (occult)
  {
    id: 'p-han-darkstep',
    tier: 'personal',
    category: 'occult',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'han-baram',
      minYearInSect: 5,
    },
    scenario:
      '동문 하나가 사부에게 조심스레 알려왔다.\n' +
      '"한바람이 헛간 뒤에서 낡은 책장을 몰래 넘기고 있었습니다.\n' +
      ' 거리에서 만난 떠돌이가 건넸다는데, 표지에 흑풍(黑風) 두 글자가…"\n' +
      '불려온 한바람이 품에서 비급을 꺼내 사부 앞에 툭 내려놓는다.\n' +
      '"빠르게 세질 수 있대요. 사문 무공은 너무 더디잖아요.\n' +
      ' 사부님… 이거, 한 번 익혀보면 안 돼요? 솔직하게 말해줘요."',
    insightHints: {
      3: '한바람이 빨리 강해질 길에 마음이 흔들리고 있다.',
      4: '한바람은 그 책의 결이 어딘가 그릇됨을 알면서도 호기심을 누르지 못한다.',
      5: '거리에서 살아남던 아이에게 "더 빠른 길"이라는 말은 늘 옳았다 — 그 습관이 지금 그를 끌어당긴다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"이런 것에 손대는 순간 네 몸이 먼저 망가진다." 비급을 거두어 그 자리에서 태운다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          noteAppend: '비급은 재가 됐다 — 호기심은 더 깊은 곳으로 숨었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 빠른 길과 바른 길의 차이를 네 몸으로 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '비급을 함께 펼쳐 어디가 사람의 근맥을 망치는지 한 줄씩 짚어준다.',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -5,
          personalityShift: { prudence: 8, integrity: 4 },
          noteAppend: '사부가 숨기지 않고 함께 들여다봐 주었다 — 빠른 길의 값을 처음으로 셈해 보았다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(아이의 호기심이려니 하고 못 본 척한다. 알아서 접겠지.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 6,
          darknessLevelBump: 1,
          noteAppend: '"사부도 막지 않았어." 한바람이 밤마다 그 보법을 몸에 새기기 시작했다.',
        },
        master: { hiddenFlag: 'master_overlooks_han_darkstep' },
        atmosphere: { righteousnessDelta: -3, unityDelta: -2 },
      },
    ],
  },

  // 2. 산문 무단이탈 — 거리의 부름 (defiance)
  {
    id: 'p-han-bolt',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 7,
      onlyForDiscipleId: 'han-baram',
      minYearInSect: 3,
    },
    scenario:
      '간밤 한바람의 잠자리가 비어 있었다.\n' +
      '동이 트고서야 산문 밖에서 돌아온 아이의 옷자락에\n' +
      '마을 저잣거리의 흙먼지와 술청 냄새가 묻어 있다.\n' +
      '"… 답답해서요. 그냥 거리 좀 걷다 왔어요. 규율 어긴 거 알아요.\n' +
      ' 근데 사문 담장 안에만 있으면 숨이 막혀요, 사부님."',
    insightHints: {
      3: '한바람이 사문의 담장을 갑갑해하고 있다.',
      4: '한바람은 거리에 두고 온 자유가 그리워 밤마다 산문 밖을 떠올린다.',
      5: '이 아이를 억지로 묶을수록 더 멀리 달아난다 — 자유는 빼앗는 것이 아니라 길을 터주는 것이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문 규율은 네 마음대로 넘는 담장이 아니다." 한 달 산문 출입을 금한다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -1,
          noteAppend: '담장이 더 높아졌다 — 아이의 발끝은 더 자주 산문 밖을 향한다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"사흘 폐관. 나가고 싶은 마음을 네 안에서 다스리는 법부터 익혀라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"나가고 싶으면 내게 말해라. 다음 장날엔 내가 함께 거리로 내려가마." 약속을 둔다.',
        perpetrator: {
          trustDelta: 9,
          darknessRiskBump: -4,
          personalityShift: { warmth: 8, freedom: 4 },
          noteAppend: '사부가 담장 밖을 함께 걷겠다 했다 — 갇혔다는 마음이 한 결 풀렸다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(떠돌던 버릇이려니 하고 못 본 척 넘긴다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 5,
          noteAppend: '"사부도 신경 안 써." 한바람의 밤 외출이 점점 잦아지고 길어진다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },

  // 3. 약육강식 논리로 약자 동문과 충돌 (violence)
  {
    id: 'p-han-mightright',
    tier: 'personal',
    category: 'violence',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'han-baram',
      minYearInSect: 6,
    },
    scenario:
      '연무장에서 한바람이 또래 동문 하나를 바닥에 눌러놓고 있었다.\n' +
      '말리러 온 사부에게 아이가 거친 숨을 몰아쉬며 대든다.\n' +
      '"이 녀석이 먼저 비웃었어요. 약하면 맞는 거 아니에요?\n' +
      ' 강호는 어차피 강한 놈이 다 갖는 곳이잖아요. 거리에선 다 그랬어요.\n' +
      ' 부모님 죽인 놈들도… 그냥 더 셌으니까 그런 거고요."',
    insightHints: {
      3: '한바람이 힘이 곧 옳음이라는 거리의 법을 사문 안으로 들여오고 있다.',
      4: '한바람의 분노 밑에는 더 셌더라면 부모를 지켰을 거라는 오래된 자책이 깔려 있다.',
      5: '이 아이는 약육강식을 믿어서가 아니라, 약했던 자신을 용서하지 못해 그 말에 매달린다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"힘으로 동문을 눌렀으니 그 힘을 거둔다." 한 계절 무공을 정지시킨다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          noteAppend: '힘을 빼앗겼다 — 아이는 입을 닫았지만 눈빛은 풀리지 않았다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"한 달 폐관. 네가 휘두른 힘이 누구를 향했는지 가만히 들여다봐라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '아이를 따로 앉혀, 칼은 약한 자를 지키려 드는 것임을 그날의 부모 이야기와 함께 풀어준다.',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -6,
          personalityShift: { mercy: 8, warmth: 6 },
          noteAppend: '사부가 옛 상처까지 들어주었다 — 힘의 방향이 처음으로 바뀌어 보였다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(연무장 다툼이려니 하고 그냥 둔다. 강호가 원래 그렇기도 하고.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 6,
          personalityShift: { mercy: -4 },
          noteAppend: '"역시 센 놈이 옳아." 약육강식이 한바람 안에서 신념이 되어간다.',
        },
        atmosphere: { righteousnessDelta: -3, unityDelta: -3 },
      },
    ],
  },
];
