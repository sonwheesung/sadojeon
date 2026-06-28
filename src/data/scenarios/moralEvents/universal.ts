// 도덕적 갈등 이벤트 — 공통 풀 (universal tier).
// 누구나 가해자가 될 수 있는 이벤트. placeholder({name}, {sibling}, {target}) 사용.
// docs/07_이벤트_시스템.md "이벤트 카탈로그 — 캐릭터 이벤트 (도덕)" 풀의 시작점.
//
// 효과 작성 규칙:
// - punish    : 신뢰 ↓↓, 도의 ↑↑, darknessRiskBump 큰 음수
// - seclusion : 신뢰 ↓,  도의 ↑,  darknessRiskBump 중 음수 + 폐관(추후 issueOverride)
// - admonish  : 신뢰 ±0~+, 결속 ↑, 통찰 ↑ (사부 학습), darknessRiskBump 작은 음수
// - overlook  : 신뢰 ↑,  무도 ↑↑ (righteousnessDelta 음수), darknessRiskBump 양수, 연쇄 ↑

import type { MoralEventTemplate } from '@/types';

export const UNIVERSAL_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 마을 노점상 갈취 — docs/07 핵심 예시
  {
    id: 'u-extort-market',
    tier: 'universal',
    category: 'extortion',
    trigger: { weight: 10, minYearInSect: 2 },
    scenario:
      '마을에서 한 노점 노인이 사문 산문에 찾아와 떨리는 손으로 호소했다.\n' +
      '"사부님 제자 {name}이 어제 좌판 앞에서 돈 한 줌을 빼앗아 갔습니다…"\n' +
      '노인의 손에는 어린 권법의 자국이 남아 있다.',
    insightHints: {
      3: '{name}은 동문 사이 자존심을 세우려 마을에서 손을 쓴 듯하다.',
      4: '{name}이 이 일을 가볍게 여기고 있다. 다른 제자도 흘려듣지 않을 것이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"파문까지는 묻는다." 산문 앞에서 본보기 처분을 내린다.',
        perpetrator: { trustDelta: -6, darknessRiskBump: -3, noteAppend: '본보기 처분을 받았다.' },
        master: { authorityDelta: 1, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 3, unityDelta: -1 },
        cascade: [
          {
            kind: 'distance',
            triggerCondition: { relation: 'friend' },
            trustDelta: -2,
            noteAppend: '{name}의 처분을 보고 사부를 두려워하게 되었다.',
          },
        ],
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관에 들어 마음을 짚어라."',
        perpetrator: {
          trustDelta: -3,
          darknessRiskBump: -2,
          noteAppend: '폐관으로 손과 마음을 멈췄다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"가서 노인 앞에 무릎 꿇고 사과해라. 돈은 곱절로 갚아라."',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: -1,
          personalityShift: { mercy: 4 },
          noteAppend: '직접 노인 앞에 사과했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(노인에게 동전 한 줌을 쥐어 보내고, {name}에게는 말하지 않는다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 3,
          noteAppend: '사부가 묵인했다. 다음에도 손이 쉽게 갈 듯하다.',
        },
        master: { reputationDelta: -1, hiddenFlag: 'master_overlooks_violence' },
        atmosphere: { righteousnessDelta: -3, unityDelta: -1 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { ambition: 50 } },
            noteAppend: '{name}이 그래도 되는 모양이라 여겼다.',
          },
        ],
      },
    ],
  },

  // 2. 동문 비급 몰래 보기 — 흑화 단계 1 (docs/13)
  {
    id: 'u-theft-scroll',
    tier: 'universal',
    category: 'theft',
    trigger: { weight: 8, minYearInSect: 3 },
    scenario:
      '서고지기가 어두운 얼굴로 보고했다.\n' +
      '"간밤에 누군가 서고에 들었습니다. 자물쇠는 멀쩡한데 비급 한 권이 자리를 옮겨 있었습니다.\n' +
      '향과 흙 자국이 남아 있었습니다 — {name}이의 신발자국입니다."',
    insightHints: {
      3: '{name}이 다른 동문의 진도를 의식하고 있다.',
      4: '{name}이 보고 간 비급은 본인 무공 갈래가 아니다. 욕심이 결을 넘었다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"비급 도둑은 사문에 둘 수 없다." 한 계절 무공 정지 + 산문 청소.',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3, noteAppend: '비급 도둑으로 처분받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어 욕심을 묶어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"보고 싶은 비급이 있으면 내게 와라." 사부가 직접 가르치겠다 약속.',
        perpetrator: {
          trustDelta: 3,
          darknessRiskBump: -2,
          personalityShift: { freedom: -6 },
          noteAppend: '사부의 직강 약속을 받았다.',
        },
        master: { insightDelta: 1, reputationDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(서고지기에게 모른 척하라 일렀다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3 },
        master: { hiddenFlag: 'master_overlooks_theft' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { freedom: 70 } },
            noteAppend: '서고가 가까워졌다 — {name}이 그랬다면 자기도 가능할 듯하다.',
          },
        ],
      },
    ],
  },

  // 3. 동문 험담 — 균열 시드
  {
    id: 'u-lie-gossip',
    tier: 'universal',
    category: 'lie',
    trigger: { weight: 12, minYearInSect: 2 },
    scenario:
      '동문 무리 중 한 명이 사부에게 조용히 알려왔다.\n' +
      '"{name}이 요즘 동문들 사이에서 {sibling}에 대해 듣기 어려운 이야기를 한다 합니다."\n' +
      '본인 앞에서는 말이 없지만 등 뒤에서 험담이 가시화되고 있다.',
    insightHints: {
      3: '{name}이 {sibling}을 시기하고 있다.',
      4: '{name}의 마음이 비교 의식에 시달리고 있다. 본인도 괴롭다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문에 험담이 도는 것을 용납하지 않는다." 모든 제자 앞에서 책망.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -1, noteAppend: '동문 앞에서 책망받았다.' },
        atmosphere: { righteousnessDelta: 1, unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            noteAppend: '{name}을 멀리하게 되었다.',
          },
        ],
      },
      {
        tone: 'seclusion',
        label: '"입과 마음을 추스를 시간이 필요하다. 보름 폐관."',
        perpetrator: { trustDelta: -2 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '면담을 청해 비교의 마음을 들어준 뒤 같은 길이 아니라 말해준다.',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { ambition: -4, mercy: 4 },
          noteAppend: '사부와 길에 대해 이야기 나눴다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 들은 척한다. 동문 사이의 일은 동문이 풀라 한다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -3, righteousnessDelta: -1 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { personality: { mercy: 70 } },
            trustDelta: -1,
            noteAppend: '사부가 사문 분위기에 관심이 없는 듯 느껴졌다.',
          },
        ],
      },
    ],
  },

  // 4. 수련 게으름 거짓말 — 사부 가르침 회피
  {
    id: 'u-lie-skip',
    tier: 'universal',
    category: 'lie',
    trigger: { weight: 10, minYearInSect: 2 },
    scenario:
      '"오전 내내 수련했습니다." {name}이 그렇게 답했지만,\n' +
      '서고 옆 그늘에서 잠든 자국이 남아 있었다고 동문이 전했다.\n' +
      '거짓이 들켰는데도 {name}은 별 일 아니라는 표정이다.',
    insightHints: {
      3: '{name}이 사부의 가르침에 흥미를 잃은 듯하다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"한 달치 자유 시간 박탈. 매일 곱절 수련."',
        perpetrator: { trustDelta: -4, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"몸과 마음을 다시 묶어라. 보름 폐관."',
        perpetrator: { trustDelta: -2 },
      },
      {
        tone: 'admonish',
        label: '"왜 거짓이었느냐. 무공이 손에 안 잡히면 와서 말해라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { integrity: 4 },
          noteAppend: '사부가 묻고 듣는 자임을 다시 느꼈다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(아무 말도 하지 않는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -1, righteousnessDelta: -1 },
      },
    ],
  },

  // 5. 거지 외면 — 의뢰 중 자비 시험
  {
    id: 'u-neglect-beggar',
    tier: 'universal',
    category: 'neglect',
    trigger: { weight: 7, minYearInSect: 3 },
    scenario:
      '의뢰에서 돌아온 {name}의 보고서에 한 줄이 빠져 있었다.\n' +
      '길가에 쓰러진 노인을 지나쳤다는 사실이 마을 사람들 입에서 흘러나왔다.\n' +
      '"바쁘기도 했고… 사문 일이 우선이라 여겼습니다." {name}의 말은 너무 단정하다.',
    insightHints: {
      3: '{name}이 약자에게 손 내미는 결을 잃어가고 있다.',
      4: '{name}은 자기가 외면했다는 사실 자체를 부정하려 한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"무공은 사람을 위한 것이다. 마을로 돌아가 노인을 찾아 돌봐라."',
        perpetrator: {
          trustDelta: -2,
          personalityShift: { mercy: 6 },
          darknessRiskBump: -2,
          noteAppend: '마을로 돌아가 약자를 찾아갔다.',
        },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 자비의 결을 다시 짚어라."',
        perpetrator: { trustDelta: -1, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"바쁘다는 핑계는 다른 곳에서 써라. 다음엔 손 한 번 내밀어라."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { mercy: 4 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(별 말 하지 않고 보고서에 도장만 찍는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3, personalityShift: { mercy: -6 } },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },

  // 6. 금기 비급 탐닉 — 흑화 시드 (occult)
  {
    id: 'u-occult-banned',
    tier: 'universal',
    category: 'occult',
    trigger: { weight: 5, minYearInSect: 4 },
    scenario:
      '서고 깊은 칸의 금기 비급 한 권 —\n' +
      '오랜 먼지 위에 새 손자국이 남아 있다. {name}이의 손이다.\n' +
      '본인 앞에 비급을 내놓자 손이 떨린다.',
    insightHints: {
      3: '{name}이 빠른 무공을 갈구하고 있다.',
      4: '{name}이 어두운 길에 발끝이 닿았다. 지금이 잡을 때다.',
      5: '{name}의 호기심이 무공이 아닌 다른 것에 끌렸다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"금기를 어겼다. 산문 청소 + 한 계절 무공 정지."',
        perpetrator: { trustDelta: -4, darknessRiskBump: -4 },
        atmosphere: { righteousnessDelta: 3 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 마음의 결을 다시 잡아라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'admonish',
        label: '"금기가 왜 금기인지 함께 보자." 비급을 같이 펼쳐 어둠을 짚어준다.',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -3,
          personalityShift: { freedom: -6 },
          noteAppend: '사부가 직접 어둠을 짚어 보여줬다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2, righteousnessDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(아무 말도 하지 않고 비급을 다시 깊은 칸에 넣는다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 5, darknessLevelBump: 1 },
        master: { hiddenFlag: 'master_overlooks_occult', reputationDelta: -2 },
        atmosphere: { righteousnessDelta: -3 },
      },
    ],
  },

  // 7. 사문 무단 외출 — 규율 위반
  {
    id: 'u-defiance-leave',
    tier: 'universal',
    category: 'defiance',
    trigger: { weight: 8, minYearInSect: 2 },
    scenario:
      '간밤에 산문 옆 작은 길로 누군가 빠져나갔다.\n' +
      '새벽에야 {name}이 흙 묻은 옷차림으로 돌아왔다.\n' +
      '"… 머리가 답답해서 잠시 마을에 다녀왔습니다."',
    insightHints: {
      3: '{name}이 사문을 답답해하고 있다.',
      4: '{name}이 사문 밖에서 무언가를 찾고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문 규율을 어겼다. 한 달 외출 금지 + 사문 일과 곱절."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관으로 발과 마음을 묶어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"무엇을 찾고 있느냐. 솔직히 말해라." 자유 시간을 늘려준다.',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { freedom: -4 },
          noteAppend: '사부가 답답함을 들어주었다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -1, righteousnessDelta: -1 },
      },
    ],
  },

  // 8. 자기 무공 과시 — 자만
  {
    id: 'u-pride-show',
    tier: 'universal',
    category: 'pride',
    trigger: { weight: 6, minYearInSect: 3 },
    scenario:
      '마을 광장에서 {name}이 무공 한 결을 펼쳤다.\n' +
      '구경꾼이 모이자 더 화려하게 결을 풀어냈고,\n' +
      '한 어린아이가 그 결에 휘말려 작은 상처를 입었다.',
    insightHints: {
      3: '{name}이 인정받고 싶어한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"무공은 자랑이 아니다. 한 달 무공 정지."',
        perpetrator: { trustDelta: -3, personalityShift: { ambition: -6 }, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"마음의 결을 다시 짚어라. 보름 폐관."',
        perpetrator: { trustDelta: -1 },
      },
      {
        tone: 'admonish',
        label: '"다친 아이의 부모에게 가서 사과해라. 그 뒤에 너 자신을 보아라."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { ambition: -4, mercy: 4 },
          noteAppend: '사과의 길에서 결을 짚었다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '"무공이 보여지는 것은 자연스러운 일이다." (가볍게 넘긴다.)',
        perpetrator: { trustDelta: 1, personalityShift: { ambition: 6 }, darknessRiskBump: 2 },
        atmosphere: { righteousnessDelta: -1 },
      },
    ],
  },

  // 9. 동문과 다툼 — 폭력 시드
  {
    id: 'u-violence-spar',
    tier: 'universal',
    category: 'violence',
    trigger: { weight: 9, minYearInSect: 2 },
    scenario:
      '훈련장에서 합공 수련 중 다툼이 벌어졌다.\n' +
      '{name}이 {sibling}을 향해 실전 결의 일격을 날렸고,\n' +
      '{sibling}은 갈빗대 두 대가 부러진 채 의방에 들었다.',
    insightHints: {
      3: '{name}과 {sibling} 사이에 묵은 감정이 있다.',
      4: '{name}이 동문 한 명을 견디기 어려워한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문에게 손을 댄 자는 사문에 둘 수 없다." 파문 직전까지 묻는다.',
        perpetrator: { trustDelta: -6, darknessRiskBump: -3 },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 손과 마음을 묶어라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '둘을 함께 불러 앉히고 묵은 감정을 풀게 한다. 사부가 자리 지킨다.',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { mercy: 4 },
          darknessRiskBump: -2,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(합공 수련 중 사고로 처리한다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3 },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },

  // 10. 동문 단약 욕심 — 도둑 + 자만 결합
  {
    id: 'u-theft-elixir',
    tier: 'universal',
    category: 'theft',
    trigger: { weight: 6, minYearInSect: 3 },
    scenario:
      '의약방에서 영약 한 알이 사라졌다.\n' +
      '{sibling}이 다음 단계 돌파를 위해 사부가 따로 준비해 두었던 단약이다.\n' +
      '{name}이의 옷자락에서 같은 향이 풍긴다.',
    insightHints: {
      3: '{name}이 동문의 진도에 조급해하고 있다.',
      4: '{name}이 단약을 자기 단계 돌파에 썼을 가능성이 높다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 단약에 손을 댔다. 한 계절 무공 정지 + 산문 청소."',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 자기 결을 다시 짚어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"조급함은 너의 결을 망친다." {sibling}에게 사과시키고 새 단약을 따로 마련해준다.',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { integrity: 4 },
          darknessRiskBump: -2,
          noteAppend: '동문 앞에서 직접 사과했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(다른 단약을 마련해 {sibling}에게만 따로 준다. {name}에게는 묻지 않는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3 },
        master: { hiddenFlag: 'master_overlooks_theft' },
        atmosphere: { unityDelta: -3, righteousnessDelta: -2 },
      },
    ],
  },
];
