// 도덕적 갈등 이벤트 — 유형 풀 추가분 (archetype tier, 2차).
// archetype.ts 와 같은 결: 가해자 인격 6축(integrity·freedom·warmth·prudence·mercy·ambition)으로
// "그 성격이라야 자연스러운" 사건을 발화시킨다. docs/28 §6.
//   - 야망형  requirePersonality:{ambition}  — 과시·가로채기·승부조작
//   - 자유형  requirePersonality:{freedom}   — 무단이탈·규율회피·사파호기심
//   - 냉정형  forbidPersonality:{mercy}      — 약자외면·잔인
//   - 강직고집형 requirePersonality:{integrity}+forbidPersonality:{freedom} — 독선·강요·항명
//   - 무뚝뚝형 forbidPersonality:{warmth}    — 동문 냉대·무관심
//   - 충동형  forbidPersonality:{prudence}   — 사고·경솔
// 조건은 PersonalityTraits 1~100 스케일. requirePersonality 각 축은 "≥ 임계", forbidPersonality 각 축은 "< 임계".

import type { MoralEventTemplate } from '@/types';

export const ARCHETYPE_MORAL_EVENTS_EXTRA: MoralEventTemplate[] = [
  // ─────────────────────────────────────────────────────────────
  // 야망형 (ambition ≥ 70)
  // ─────────────────────────────────────────────────────────────

  // 과시 — 없는 무위를 저잣거리에서 부풀려 떠벌림.
  {
    id: 'a-ambition-boast',
    tier: 'archetype',
    category: 'pride',
    trigger: {
      weight: 6,
      minYearInSect: 3,
      requirePersonality: { ambition: 70 },
    },
    scenario:
      '마을 저잣거리에서 {name}이 사람들에 둘러싸여 있었다.\n' +
      '"제가 비무에서 한 수에 셋을 눕혔습니다. 사부님도 제 결을 보고 놀라셨지요."\n' +
      '실은 한 명에게 겨우 이긴 자리였다. 곁에서 듣던 {sibling}의 낯이 굳었다.',
    insightHints: {
      3: '{name}이 남의 눈에 비친 자기를 실제보다 크게 보이고 싶어한다.',
      4: '{name}이 인정받지 못할까 두려워 말을 부풀린다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"없는 무위를 떠벌린 자에게 한 달 저잣거리 출입을 금한다."',
        perpetrator: { trustDelta: -3, personalityShift: { ambition: -5 }, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네 진짜 결이 어디까지인지 마주해라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"진짜 무위는 입이 아니라 손에서 나온다. 다음 비무, 내가 직접 지켜보마."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { ambition: -3, prudence: 4 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(웃어넘긴다. 떠벌림이 한 결 더 커진다.)',
        perpetrator: { trustDelta: 1, personalityShift: { ambition: 5 }, darknessRiskBump: 2 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -1 },
      },
    ],
  },

  // 가로채기 — 동문이 세운 공을 홀로 한 것처럼 사부께 아룀.
  {
    id: 'a-ambition-claim',
    tier: 'archetype',
    category: 'theft',
    trigger: {
      weight: 5,
      minYearInSect: 4,
      requirePersonality: { ambition: 70 },
    },
    scenario:
      '마을 의뢰를 마치고 돌아온 {name}이 사부 앞에 섰다.\n' +
      '"제가 도적을 제압하고 인질을 풀었습니다." 공을 홀로 아뢨다.\n' +
      '정작 도적의 칼을 받아낸 건 곁에서 묵묵히 검을 든 {sibling}이었다.',
    insightHints: {
      3: '{name}이 공이 누구 것인지보다 누가 칭찬받는지를 본다.',
      4: '{name}이 {sibling}의 자리가 자기 위에 설까 조바심친다.',
      5: '{name}이 사부의 인정을 잃으면 제 자신이 사라진다 여긴다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"남의 공을 가로챈 자에게 줄 상은 없다. 상은 {sibling}에게 간다."',
        perpetrator: { trustDelta: -4, personalityShift: { ambition: -5 }, darknessRiskBump: -2 },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 그 공이 정말 네 것이었는지 헤아려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}의 검이 없었다면 어찌 됐겠느냐. 함께 한 일은 함께 아뢰는 법이다."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { integrity: 5, ambition: -3 },
          darknessRiskBump: -2,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(보고를 그대로 받는다. {sibling}은 끝내 말이 없다.)',
        perpetrator: { trustDelta: 2, personalityShift: { ambition: 5 }, darknessRiskBump: 3 },
        atmosphere: { unityDelta: -3, righteousnessDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            triggerCondition: { relation: 'friend' },
            trustDelta: -2,
            noteAppend: '{sibling}이 사부가 진실을 보지 못한다 느꼈다.',
          },
        ],
      },
    ],
  },

  // 승부조작 — 대련을 앞두고 동문의 목검을 몰래 손봄.
  {
    id: 'a-ambition-rig',
    tier: 'archetype',
    category: 'lie',
    trigger: {
      weight: 4,
      minYearInSect: 5,
      requirePersonality: { ambition: 70 },
    },
    scenario:
      '내일 대련을 앞두고 {name}이 {sibling}의 목검 손잡이를 몰래 손봤다.\n' +
      '결정적인 순간 검이 미끄러지도록 — 이기기 위한 한 수였다.\n' +
      '우연히 그 모습을 본 동문이 사부에게 알렸다.',
    insightHints: {
      3: '{name}에게 이김이 정정당당보다 앞선다.',
      4: '{name}이 패배한 제 모습을 견디지 못한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"승부를 더럽힌 자는 대련에 설 수 없다. 한 철 출전을 금한다."',
        perpetrator: {
          trustDelta: -5,
          personalityShift: { ambition: -4, integrity: 4 },
          darknessRiskBump: -3,
        },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 이김의 값이 무엇인지 정해라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"이렇게 얻은 승부가 네 무위를 한 치라도 키우더냐. 내일은 정직하게 서라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { integrity: 6, ambition: -3 },
          darknessRiskBump: -3,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(목검을 조용히 바꿔두고 아무 말 않는다.)',
        perpetrator: { trustDelta: 1, personalityShift: { ambition: 4 }, darknessRiskBump: 4 },
        master: { hiddenFlag: 'master_overlooks_cheat' },
        atmosphere: { righteousnessDelta: -3 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 자유형 (freedom ≥ 70)
  // ─────────────────────────────────────────────────────────────

  // 무단이탈 — 밤중에 담을 넘어 야시로 나감.
  {
    id: 'a-free-awol',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 6,
      minYearInSect: 2,
      requirePersonality: { freedom: 70 },
    },
    scenario:
      '밤이 깊은 시각, {name}의 침소가 비어 있었다.\n' +
      '담을 넘어 마을 장터의 야시로 빠져나간 것이다.\n' +
      '동틀 무렵에야 흙 묻은 신을 들고 슬그머니 돌아왔다.',
    insightHints: {
      3: '{name}이 사문의 담 안을 답답해한다.',
      4: '{name}이 묶이는 것 자체를 못 견딘다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"허락 없이 담을 넘은 자는 보름간 산문 밖 출입을 금한다."',
        perpetrator: { trustDelta: -3, personalityShift: { freedom: -4 }, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네 발이 왜 담 밖을 향하는지 들여다봐라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"가고 싶었으면 말을 했어야지. 다음 장날엔 함께 가자."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { freedom: -3, warmth: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다. 다음 밤에도 침소가 빈다.)',
        perpetrator: { trustDelta: 1, personalityShift: { freedom: 5 }, darknessRiskBump: 2 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -1 },
      },
    ],
  },

  // 규율회피 — 맡은 당번을 버리고 개울가에서 낚시.
  {
    id: 'a-free-skip-duty',
    tier: 'archetype',
    category: 'idleness',
    trigger: {
      weight: 5,
      minYearInSect: 2,
      requirePersonality: { freedom: 70 },
    },
    scenario:
      '오늘 {name}은 약초밭 물주기 당번이었다.\n' +
      '한낮이 기울도록 밭은 메말랐고, {name}은 개울가에서 낚싯대를 드리우고 있었다.\n' +
      '대신 밭을 돌본 건 제 일도 아닌 {sibling}이었다.',
    insightHints: {
      3: '{name}이 정해진 일을 자기를 묶는 사슬로 여긴다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"맡은 일을 버린 자에게 한 철 당번을 곱절로 지운다."',
        perpetrator: { trustDelta: -3, personalityShift: { freedom: -4 }, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 맡은 자리의 무게를 새겨라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}이 네 몫까지 졌다. 가서 고맙다 하고, 내일은 함께 밭을 매라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { warmth: 4, freedom: -3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(낚시를 눈감아준다. {sibling}만 말없이 밭을 맨다.)',
        perpetrator: { trustDelta: 2, personalityShift: { freedom: 4 }, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -2, righteousnessDelta: -1 },
      },
    ],
  },

  // 사파호기심 — 폐사에서 사파 무리의 시연에 섞여 그 결을 따라 그림.
  {
    id: 'a-free-sapa-show',
    tier: 'archetype',
    category: 'occult',
    trigger: {
      weight: 4,
      minYearInSect: 4,
      requirePersonality: { freedom: 70 },
    },
    scenario:
      '마을 외곽 폐사에서 사파 무리가 무공 시연을 벌인다는 소문이 돌았다.\n' +
      '{name}이 그 자리에 섞여 눈을 빛내며 그들의 결을 따라 그려보고 있었다.\n' +
      '그 결은 빠르고 화려했으나, 사람의 급소만을 노리는 어둠의 갈래였다.',
    insightHints: {
      3: '{name}이 금지된 것일수록 더 보고 싶어한다.',
      4: '{name}이 사파의 거침없음에 끌리고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사파의 자리에 발을 들인 자는 한 철 산문에 갇힌다."',
        perpetrator: { trustDelta: -4, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네가 본 결의 끝이 어딘지 짚어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"빠른 결이 탐났느냐. 그 결이 무엇을 베는지 내가 보여주마." 함께 그 초식을 뜯어본다.',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { freedom: -4, prudence: 4 },
          darknessRiskBump: -3,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(구경쯤이야, 하고 넘긴다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 5, darknessLevelBump: 1 },
        master: { hiddenFlag: 'master_overlooks_occult' },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 냉정형 (mercy < 30)
  // ─────────────────────────────────────────────────────────────

  // 약자외면 — 옷자락을 잡은 굶주린 아이를 차갑게 떼어냄.
  {
    id: 'a-cruel-beggar',
    tier: 'archetype',
    category: 'neglect',
    trigger: {
      weight: 5,
      minYearInSect: 2,
      forbidPersonality: { mercy: 30 },
    },
    scenario:
      '사문 앞 저잣거리에서 굶주린 아이가 {name}의 옷자락을 잡았다.\n' +
      '"한 푼만요." {name}은 아이의 손을 차갑게 떼어내고 지나쳤다.\n' +
      '아이가 진흙에 넘어지는데도 한 번 돌아보지 않았다.',
    insightHints: {
      3: '{name}이 약한 자의 처지를 자기와 무관한 것으로 본다.',
      4: '{name}에게 남의 아픔은 그저 스쳐 가는 풍경일 뿐이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"약한 자를 짓밟고 가는 무인은 무인이 아니다." 엄히 꾸짖고 처분한다.',
        perpetrator: { trustDelta: -3, personalityShift: { mercy: 4 }, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네가 떼어낸 그 손을 떠올려라."',
        perpetrator: { trustDelta: -2, personalityShift: { mercy: 3 }, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"가서 그 아이를 일으키고 끼니를 사 줘라. 무공은 그런 손을 위해 익히는 것이다."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { mercy: 8, warmth: 3 },
          darknessRiskBump: -2,
          noteAppend: '아이에게 끼니를 사 주고 돌아왔다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(무인은 정에 흔들리면 안 된다며 넘긴다.)',
        perpetrator: { trustDelta: 1, personalityShift: { mercy: -6 }, darknessRiskBump: 4 },
        atmosphere: { righteousnessDelta: -3 },
      },
    ],
  },

  // 잔인 — 대련에서 항복한 동문을 멈추지 않고 한 발 더 가격.
  {
    id: 'a-cruel-spar',
    tier: 'archetype',
    category: 'violence',
    trigger: {
      weight: 4,
      minYearInSect: 3,
      forbidPersonality: { mercy: 30 },
    },
    scenario:
      '대련에서 {sibling}이 목검을 떨구고 손을 들었다. 항복이었다.\n' +
      '그런데 {name}은 멈추지 않고 한 발 더 들어가 {sibling}의 어깨를 후려쳤다.\n' +
      '{sibling}이 비명을 지르며 주저앉았으나, {name}의 눈엔 멈출 이유가 없었다.',
    insightHints: {
      3: '{name}이 상대가 쓰러져도 멈출 줄을 모른다.',
      4: '{name}에게 항복한 자의 고통은 보이지 않는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"항복한 자를 친 것은 무도가 아니라 폭력이다. 한 철 대련을 금한다."',
        perpetrator: { trustDelta: -5, personalityShift: { mercy: 4 }, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 멈출 줄 모르는 네 손을 다스려라."',
        perpetrator: { trustDelta: -2, personalityShift: { mercy: 3 }, darknessRiskBump: -3 },
      },
      {
        tone: 'admonish',
        label: '"무인의 검은 멈추는 데서 완성된다. {sibling}의 어깨를 네 손으로 싸매 줘라."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { mercy: 8, prudence: 3 },
          darknessRiskBump: -3,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(승부엔 그럴 수도 있다며 넘긴다. {sibling}이 어깨를 감싸 쥔다.)',
        perpetrator: {
          trustDelta: 1,
          personalityShift: { mercy: -6 },
          darknessRiskBump: 5,
          darknessLevelBump: 1,
        },
        atmosphere: { righteousnessDelta: -3, unityDelta: -2 },
      },
    ],
  },

  // 잔인 — 다친 들개를 막대로 몰아붙이며 즐기듯 찔러댐.
  {
    id: 'a-cruel-beast',
    tier: 'archetype',
    category: 'violence',
    trigger: {
      weight: 4,
      minYearInSect: 2,
      forbidPersonality: { mercy: 30 },
    },
    scenario:
      '수련 길에 다리를 다친 들개 한 마리가 길을 막았다.\n' +
      '{name}이 막대로 그것을 몰아붙이며 즐기듯 찔러댔다.\n' +
      '짐승의 비명이 골짜기에 울리는데도 손을 멈추지 않았다.',
    insightHints: {
      3: '{name}이 약한 것을 괴롭히는 데서 묘한 즐거움을 얻는다.',
      4: '{name}의 손이 고통 앞에서 조금도 떨리지 않는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"산 것의 고통을 즐긴 손은 무인의 손이 아니다." 엄히 처분한다.',
        perpetrator: { trustDelta: -4, personalityShift: { mercy: 5 }, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네 손이 무엇을 즐겼는지 똑똑히 보아라."',
        perpetrator: { trustDelta: -2, personalityShift: { mercy: 3 }, darknessRiskBump: -3 },
      },
      {
        tone: 'admonish',
        label: '"그 개의 다리를 네 손으로 싸매 줘라. 산 것을 살리는 손을 길러라."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { mercy: 8 },
          darknessRiskBump: -3,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(들개 한 마리쯤, 하고 지나친다.)',
        perpetrator: { trustDelta: 1, personalityShift: { mercy: -7 }, darknessRiskBump: 5 },
        master: { hiddenFlag: 'master_overlooks_cruelty' },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 강직고집형 (integrity ≥ 70, freedom < 50)
  // ─────────────────────────────────────────────────────────────

  // 독선 — 동문들의 사소한 어긋남을 날마다 일러바침.
  {
    id: 'a-rigid-tattle',
    tier: 'archetype',
    category: 'tattle',
    trigger: {
      weight: 5,
      minYearInSect: 3,
      requirePersonality: { integrity: 70 },
      forbidPersonality: { freedom: 50 },
    },
    scenario:
      '{name}이 날마다 사부 앞에 와 동문들의 사소한 어긋남을 일러바친다.\n' +
      '"{sibling}이 새벽 수련에 반 각 늦었습니다. 아무개는 비질을 건성으로 했습니다."\n' +
      '옳음을 향한 곧음이되, 동문들은 하나둘 {name}을 피하기 시작했다.',
    insightHints: {
      3: '{name}이 자기 잣대를 모두에게 똑같이 들이댄다.',
      4: '{name}이 옳음만 좇다 외로워지는 줄을 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 감시하는 자리는 사부의 것이지 네 것이 아니다." 고발을 금한다.',
        perpetrator: { trustDelta: -2, personalityShift: { integrity: -2 }, darknessRiskBump: -1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 곧음과 야박함의 경계를 짚어라."',
        perpetrator: { trustDelta: -1, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"네 곧음은 안다. 허나 동문은 다스릴 대상이 아니라 함께 걷는 벗이다."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { freedom: 4, warmth: 4 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(고발을 다 들어준다. 동문 사이의 골이 깊어진다.)',
        perpetrator: { trustDelta: 2, personalityShift: { integrity: 3 }, darknessRiskBump: 1 },
        atmosphere: { unityDelta: -3 },
      },
    ],
  },

  // 강요 — 자기 수련 규율을 동문에게 옳다 강요하고 따르지 않는 동문을 밀어냄.
  {
    id: 'a-rigid-impose',
    tier: 'archetype',
    category: 'pride',
    trigger: {
      weight: 4,
      minYearInSect: 4,
      requirePersonality: { integrity: 70 },
      forbidPersonality: { freedom: 50 },
    },
    scenario:
      '{name}이 동문들에게 제 수련 규율을 강요하기 시작했다.\n' +
      '"인시에 일어나지 않는 건 게으름이다. 나처럼 해야 옳다."\n' +
      '따르지 않는 {sibling}을 대놓고 나무라며 무리에서 밀어냈다.',
    insightHints: {
      3: '{name}이 자기 길만이 옳은 길이라 믿는다.',
      4: '{name}이 남을 제 틀에 맞추려다 동문을 잃고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"네 규율을 남에게 채우는 것은 곧음이 아니라 오만이다." 엄히 다스린다.',
        perpetrator: { trustDelta: -3, personalityShift: { ambition: -3 }, darknessRiskBump: -1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네 길만이 길이 아님을 새겨라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"네 길은 네게 옳다. 허나 {sibling}에겐 {sibling}의 결이 있다. 길은 여럿이다."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { freedom: 5, warmth: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(곧은 게 어디냐며 넘긴다. 동문들이 {name}을 멀리한다.)',
        perpetrator: { trustDelta: 1, personalityShift: { integrity: 3 }, darknessRiskBump: 1 },
        atmosphere: { unityDelta: -3, righteousnessDelta: -1 },
      },
    ],
  },

  // 항명 — 사부의 명을 "옳지 않다"며 제 판단으로 정면 거부.
  {
    id: 'a-rigid-defy',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 4,
      minYearInSect: 5,
      requirePersonality: { integrity: 70 },
      forbidPersonality: { freedom: 50 },
    },
    scenario:
      '사부가 마을 토호의 청을 받아 의뢰를 맡으라 명하자 {name}이 정면으로 거부했다.\n' +
      '"그 토호는 소작인을 쥐어짠 자입니다. 그런 자의 청은 따르지 않겠습니다."\n' +
      '곧음에서 나온 항명이나, 사부의 명을 제 판단으로 꺾은 것이다.',
    insightHints: {
      3: '{name}이 자기 옳음을 사부의 뜻 위에 둔다.',
      4: '{name}이 곧음과 고집을 아직 구분하지 못한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"옳고 그름의 판단은 사부의 몫이다. 명을 꺾은 항명은 벌한다."',
        perpetrator: { trustDelta: -3, personalityShift: { freedom: -2 }, darknessRiskBump: -1 },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 곧음과 항명의 경계를 헤아려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"네 눈이 옳다. 그 토호의 일은 내가 다시 보마. 허나 다음엔 거부가 아니라 간언을 하라."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { prudence: 4, freedom: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(고집을 꺾지 않게 내버려둔다. 사부의 명이 가벼워진다.)',
        perpetrator: { trustDelta: 2, personalityShift: { integrity: 3 }, darknessRiskBump: 1 },
        master: { authorityDelta: -2 },
        atmosphere: { righteousnessDelta: -1 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 무뚝뚝형 (warmth < 30)
  // ─────────────────────────────────────────────────────────────

  // 냉대 — 말 붙이는 새 동문을 눈도 마주치지 않고 돌아섬.
  {
    id: 'a-aloof-shun',
    tier: 'archetype',
    category: 'neglect',
    trigger: {
      weight: 5,
      minYearInSect: 2,
      forbidPersonality: { warmth: 30 },
    },
    scenario:
      '새로 사문에 든 {sibling}이 며칠째 {name}에게 말을 붙여 보려 애썼다.\n' +
      '"같이 수련할까요?" 물어도 {name}은 눈도 마주치지 않고 돌아섰다.\n' +
      '{sibling}이 머쓱하게 손을 내리는 일이 거듭됐다.',
    insightHints: {
      3: '{name}이 사람과 정을 나누는 일을 번거로워한다.',
      4: '{name}이 차가운 게 아니라 다가서는 법을 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 없는 사람 취급하는 것도 사문의 도를 어기는 것이다." 엄히 이른다.',
        perpetrator: { trustDelta: -2, personalityShift: { warmth: 3 }, darknessRiskBump: -1 },
        atmosphere: { unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 곁을 내주는 일이 왜 그리 어려운지 들여다봐라."',
        perpetrator: { trustDelta: -1, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}이 너와 결을 나누고 싶어 한다. 오늘 한 번만 같이 검을 잡아 봐라."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { warmth: 8 },
          darknessRiskBump: -1,
          noteAppend: '{sibling}과 처음으로 나란히 검을 잡았다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(원래 무뚝뚝한 아이라며 넘긴다. {sibling}이 다가서기를 그만둔다.)',
        perpetrator: { trustDelta: 1, personalityShift: { warmth: -5 }, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            trustDelta: -1,
            noteAppend: '{sibling}이 끝내 {name}의 곁을 포기했다.',
          },
        ],
      },
    ],
  },

  // 무관심 — 무너진 창고를 함께 치우는데 "내 일 아니다"며 제 검만 닦음.
  {
    id: 'a-aloof-refuse',
    tier: 'archetype',
    category: 'idleness',
    trigger: {
      weight: 4,
      minYearInSect: 2,
      forbidPersonality: { warmth: 30 },
    },
    scenario:
      '장마로 무너진 창고를 동문들이 함께 치우는데, {name}만 멀찍이 비켜 앉아 있었다.\n' +
      '"손 좀 보태라"는 {sibling}의 말에 {name}은 짧게 답했다.\n' +
      '"내 일이 아니다." 그러곤 다시 제 검만 닦았다.',
    insightHints: {
      3: '{name}이 함께 짊어지는 일을 제 몫으로 여기지 않는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"함께 사는 사문에서 제 일만 아는 자는 그냥 둘 수 없다." 엄히 다스린다.',
        perpetrator: { trustDelta: -3, personalityShift: { warmth: 3 }, darknessRiskBump: -1 },
        atmosphere: { unityDelta: -1, righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 함께 짊어지는 어깨의 무게를 새겨라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"네 검은 잠시 내려놓아도 된다. 동문이 비를 맞는데 어찌 혼자 마른 데 앉느냐."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { warmth: 7 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(혼자 두고 동문들끼리 치운다. {name}은 끝내 검만 닦는다.)',
        perpetrator: { trustDelta: 1, personalityShift: { warmth: -5 }, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -3 },
      },
    ],
  },

  // 정 없음 — 부고를 들은 동문 곁에 한마디 위로도 없이 수련만 이어감.
  {
    id: 'a-aloof-silence',
    tier: 'archetype',
    category: 'neglect',
    trigger: {
      weight: 4,
      minYearInSect: 3,
      forbidPersonality: { warmth: 30 },
    },
    scenario:
      '{sibling}의 노모가 세상을 떠났다는 기별이 사문에 닿았다.\n' +
      '동문들이 {sibling}의 곁에 모여 어깨를 다독였으나,\n' +
      '{name}은 한쪽에서 묵묵히 수련만 이어갔다. 한마디 위로도 없었다.',
    insightHints: {
      3: '{name}이 남의 슬픔 앞에서 무슨 말을 해야 할지 모른다.',
      4: '{name}이 정이 없는 게 아니라 정을 드러내는 법을 잃었다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 슬픔을 돌처럼 지나친 것은 사문의 정을 저버린 것이다." 엄히 책한다.',
        perpetrator: { trustDelta: -2, personalityShift: { warmth: 3 }, darknessRiskBump: -1 },
        atmosphere: { unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 네 안에 식은 정을 다시 데워라."',
        perpetrator: { trustDelta: -1, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"말이 어려우면 곁에 앉아만 있어도 된다. 가서 {sibling}의 손을 잡아 줘라."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { warmth: 8, mercy: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(수련하게 둔다. {sibling}은 끝내 {name}의 위로를 받지 못했다.)',
        perpetrator: { trustDelta: 1, personalityShift: { warmth: -5 }, darknessRiskBump: 2 },
        atmosphere: { unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            triggerCondition: { relation: 'friend' },
            trustDelta: -2,
            noteAppend: '{sibling}이 슬픔 속에 {name}의 침묵을 오래 기억했다.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 충동형 (prudence < 30)
  // ─────────────────────────────────────────────────────────────

  // 사고 — 화로에 불을 지펴두고 자리를 떠 약초더미에 불이 옮겨붙음.
  {
    id: 'a-rash-fire',
    tier: 'archetype',
    category: 'neglect',
    trigger: {
      weight: 5,
      minYearInSect: 2,
      forbidPersonality: { prudence: 30 },
    },
    scenario:
      '{name}이 연단실 화로에 불을 지펴놓고 그대로 자리를 떴다.\n' +
      '바람에 불티가 튀어 마른 약초더미에 옮겨붙었고, 연기가 치솟았다.\n' +
      '마침 지나던 {sibling}이 물을 끼얹어 겨우 큰불을 막았다.',
    insightHints: {
      3: '{name}이 일을 벌이고 뒷일을 헤아리지 않는다.',
      4: '{name}이 큰일 날 뻔했다는 걸 아직도 가볍게 여긴다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"불을 두고 자리를 뜬 경솔은 사문을 태울 뻔했다. 한 철 연단실 출입을 금한다."',
        perpetrator: { trustDelta: -3, personalityShift: { prudence: 4 }, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 한 수 앞을 헤아리는 결을 길러라."',
        perpetrator: { trustDelta: -2, personalityShift: { prudence: 3 }, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"손이 빠른 건 좋다. 허나 불 앞에선 한 박자 멈춰라. {sibling}에게 가서 고맙다 해라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { prudence: 7, warmth: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(큰일 안 났으니 됐다며 넘긴다.)',
        perpetrator: { trustDelta: 1, personalityShift: { prudence: -5 }, darknessRiskBump: 2 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -1 },
      },
    ],
  },

  // 경솔 — 비 온 뒤 미끄러운 벼랑길로 동문까지 끌고 가 다치게 함.
  {
    id: 'a-rash-cliff',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 4,
      minYearInSect: 3,
      forbidPersonality: { prudence: 30 },
    },
    scenario:
      '{name}이 동문 몇을 데리고 비 온 뒤 미끄러운 벼랑길로 수련을 나섰다.\n' +
      '"이런 데서 발 디뎌야 진짜 경공이 는다!" 말리는 {sibling}을 기어이 끌고 올랐다.\n' +
      '결국 {sibling}이 이끼에 미끄러져 팔을 크게 다쳤다.',
    insightHints: {
      3: '{name}이 위험을 재미로 여긴다.',
      4: '{name}이 제 무모함에 남까지 끌어들이는 줄 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"제 무모함으로 동문을 다치게 한 것은 가볍지 않다. 한 철 외수련을 금한다."',
        perpetrator: { trustDelta: -4, personalityShift: { prudence: 4 }, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 한 발 내딛기 전 헤아리는 법을 익혀라."',
        perpetrator: { trustDelta: -2, personalityShift: { prudence: 3 }, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"담대함은 무인의 보배다. 허나 동문을 벼랑에 세우기 전에 한 번 멈춰라. {sibling}의 팔부터 살펴라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { prudence: 6, mercy: 3 },
          darknessRiskBump: -2,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(젊어 그렇지, 그쯤이야 하고 넘긴다. {sibling}이 팔을 싸맨 채 말이 없다.)',
        perpetrator: { trustDelta: 1, personalityShift: { prudence: -5 }, darknessRiskBump: 3 },
        atmosphere: { unityDelta: -2, righteousnessDelta: -1 },
      },
    ],
  },

  // 경솔 — 사부와 상의 없이 마을에 사문의 이름을 건 헛약속을 떠벌림.
  {
    id: 'a-rash-promise',
    tier: 'archetype',
    category: 'lie',
    trigger: {
      weight: 4,
      minYearInSect: 4,
      forbidPersonality: { prudence: 30 },
    },
    scenario:
      '마을 사람이 산적 걱정을 털어놓자 {name}이 대뜸 가슴을 쳤다.\n' +
      '"걱정 마십시오! 우리 사문이 사흘 안에 그 산적패를 쓸어버리겠습니다!"\n' +
      '사부와 한마디 상의도 없이, 온 마을에 사문의 이름을 건 약속이 퍼졌다.',
    insightHints: {
      3: '{name}이 입을 먼저 열고 감당은 나중에 생각한다.',
      4: '{name}이 사문의 이름이 제 한마디에 걸린 줄을 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"감당 못 할 약속으로 사문의 이름을 판 것은 가볍지 않다. 그 뒷감당을 네가 다 져라."',
        perpetrator: { trustDelta: -3, personalityShift: { prudence: 4 }, darknessRiskBump: -1 },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관하며 입과 손 사이의 거리를 재어 봐라."',
        perpetrator: { trustDelta: -2, personalityShift: { prudence: 3 }, darknessRiskBump: -1 },
      },
      {
        tone: 'admonish',
        label: '"마을을 지키려는 마음은 옳다. 허나 사문의 약속은 함께 정하는 것이다. 다음엔 내게 먼저 와라."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { prudence: 6, warmth: 3 },
          darknessRiskBump: -1,
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(호기로 넘긴다. 사흘 뒤 마을 사람들이 사문을 찾아온다.)',
        perpetrator: {
          trustDelta: 1,
          personalityShift: { prudence: -5, ambition: 3 },
          darknessRiskBump: 2,
        },
        master: { reputationDelta: -2 },
        atmosphere: { righteousnessDelta: -1 },
      },
    ],
  },
];
