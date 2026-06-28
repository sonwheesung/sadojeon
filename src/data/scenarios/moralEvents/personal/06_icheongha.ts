// 도덕 이벤트 — 이청하 개인 풀. docs/disciples/06 · docs/48
//
// 이청하: 4세에 살수 첫 임무를 치른 소녀. 흑화 창이 가장 크다(옛 살수공·본능 회귀·악몽).
// 평범한 일탈이 아니라 "어둠으로 돌아가려는 손"이 일탈로 새어 나온다 —
//   금기의 옛 무공을 몰래 손대고(occult), 정체를 지키려 동문에게 냉혹해지고(violence),
//   과거를 들킬까 거짓으로 덮는다(lie).
// 흑화 창이 크므로 overlook 의 darknessRiskBump 는 양수, 큰 사건(옛 살수공)은 darknessLevelBump:1 까지.
// 숨은변수(흑화·노선) 직설 금지 — 사부가 관찰 가능한 손짓·눈빛·말로만.

import type { MoralEventTemplate } from '@/types';

export const ICHEONGHA_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 옛 살수공을 몰래 손댄다 — 큰 사건(어둠으로의 손)
  {
    id: 'p-i-oldhand',
    tier: 'personal',
    category: 'occult',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'i-cheongha',
      minYearInSect: 5,
    },
    scenario:
      '수련장 가장 외진 구석, 이청하가 아무도 가르친 적 없는 손놀림을 되풀이하고 있었다.\n' +
      '베는 게 아니라 찌르고 끊는, 몸이 먼저 알고 있는 옛 살수의 결이다.\n' +
      '들킨 아이의 눈빛이 한순간 서늘하게 식었다가 돌아온다.\n' +
      '"…이게 더 빨리 강해진대요. 손이 알아서 움직여요. 익히면 안 되는 거예요?"',
    insightHints: {
      3: '이청하의 손이 자꾸 옛 어둠으로 돌아가려 한다.',
      4: '강해지려는 게 아니라, 익숙한 자리로 숨고 싶어 한다.',
      5: '저 손놀림을 다시 쥐는 순간, 아이는 자기를 용서하길 그만둘 것이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"그 손은 여기서 끝낸다." 모든 제자 앞에서 그 자리에 봉인하게 한다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -3,
          personalityShift: { integrity: 6, prudence: 4 },
          noteAppend: '사부 앞에서 옛 손을 봉인당했다 — 분하지만, 선이 그어졌다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 그 손이 무엇을 하던 손인지 끝까지 마주 보아라."',
        perpetrator: {
          trustDelta: -2,
          darknessRiskBump: -4,
          personalityShift: { prudence: 6 },
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '아이의 손을 잡는다. "이 손은 이제 사람을 지키는 손이다. 왜 그 길이 너를 다시 부르는지, 천천히 말해 보아라."',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -6,
          personalityShift: { mercy: 10, warmth: 6, integrity: 4 },
          noteAppend: '사부가 손을 잡고 들어주었다 — 옛 손을 쥘 이유가 한 결 옅어졌다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(강해지는 게 먼저라며 못 본 척 눈감아 준다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 6,
          darknessLevelBump: 1,
          personalityShift: { ambition: 6, mercy: -6 },
          noteAppend: '"사부도 막지 않았다." 손이 옛 결을 다시 익히기 시작했다.',
        },
        atmosphere: { righteousnessDelta: -3, unityDelta: -2 },
      },
    ],
  },

  // 2. 정체를 지키려 동문에게 냉혹해진다
  {
    id: 'p-i-coldedge',
    tier: 'personal',
    category: 'violence',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'i-cheongha',
      minYearInSect: 3,
    },
    scenario:
      '한 동문이 무심코 이청하의 옛일을 캐묻다 옥패에 손을 뻗었다.\n' +
      '다음 순간, 이청하의 손이 그 손목을 비틀어 벽으로 밀어붙였다. 검도 없이, 숨소리 하나 없이.\n' +
      '"…건드리지 마." 차갑게 식은 목소리. 동문은 새파랗게 질렸다.\n' +
      '아이는 곧 제 손을 보고 놀라 물러섰지만, 동문은 그 눈빛을 잊지 못한다.',
    insightHints: {
      3: '이청하가 무언가 들킬까 두려워 날을 세운다.',
      4: '지키려는 게 물건이 아니라, 자기 과거다.',
      5: '겁먹은 건 동문이 아니라 이청하 자신이다 — 외로워서 더 차가워진다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문에게 손을 댄 것은 사문의 죄다." 한 계절 무공을 멈추게 한다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          personalityShift: { integrity: 6 },
          noteAppend: '벌은 받았으나, 왜 그리 날을 세웠는지는 아무도 묻지 않았다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 네 손이 누구를 향했는지 가만히 들여다보아라."',
        perpetrator: {
          trustDelta: -2,
          darknessRiskBump: -3,
          personalityShift: { prudence: 5 },
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '아이를 따로 부른다. "무엇이 그리 무서워 먼저 손이 나갔느냐. 그 손, 사부가 함께 풀어 주마."',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -5,
          personalityShift: { warmth: 8, mercy: 8, prudence: 4 },
          noteAppend: '두려움을 들켰지만 책망받지 않았다 — 곁을 둘 사람이 하나 생겼다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(아이들 다툼이려니, 동문에게 다가가지 말라 이르고 만다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 5,
          personalityShift: { warmth: -4, mercy: -4 },
          noteAppend: '아무도 손을 내밀지 않았다 — 차라리 혼자가 편하다고 마음을 닫는다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -3 },
      },
    ],
  },

  // 3. 과거를 들킬까 거짓으로 덮는다 — 윤소소와 같이 있을 때
  {
    id: 'p-i-mask',
    tier: 'personal',
    category: 'lie',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'i-cheongha',
      requireSiblingId: 'yun-soso',
      minYearInSect: 6,
    },
    scenario:
      '동문 하나가 자꾸 이청하의 옛일을 캐묻는다는 말이 돌았다. 사부가 넌지시 묻자 아이는 눈도 깜빡이지 않고 답했다.\n' +
      '"저는 그냥 산 아래 떠돌던 고아예요. 살수니 뭐니, 다 그 동문이 지어낸 말이에요."\n' +
      '단정한 거짓말이었다. 손바닥은 옥패를 꼭 쥐어 감추고 있었다.',
    insightHints: {
      3: '이청하가 자기 과거를 통째로 부인하기 시작했다.',
      4: '거짓이 들킬까 두려운 게 아니라, 그 과거가 사실일까 봐 두려워한다.',
      5: '저 거짓을 사부마저 믿어 주면, 아이는 다시는 진실을 꺼내지 못할 것이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사부 앞에서 거짓을 짓는 입은 사문의 결을 흐린다." 엄히 책망한다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          personalityShift: { integrity: 4 },
          noteAppend: '거짓을 들켰다 — 진실은 더 깊은 곳으로 숨었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 무엇을 감추려 입을 닫는지, 너부터 답을 내어라."',
        perpetrator: {
          trustDelta: -2,
          darknessRiskBump: -3,
          personalityShift: { prudence: 5 },
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '쥔 손을 가만히 펴 준다. "감추지 않아도 된다. 무엇을 했든, 그건 네 살 아이가 진 짐이 아니다."',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -6,
          personalityShift: { mercy: 10, warmth: 6, integrity: 4 },
          noteAppend: '거짓을 짚지 않고 짐을 짚어 주었다 — 처음으로 옥패에서 손이 풀렸다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(아이의 말을 그대로 믿어 주고, 동문에게 그만 캐물으라 이른다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 5,
          personalityShift: { warmth: -4 },
          noteAppend: '사부마저 거짓을 믿어 주었다 — 진실을 꺼낼 자리가 사라졌다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },
];
