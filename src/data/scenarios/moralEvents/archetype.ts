// 도덕적 갈등 이벤트 — 유형 풀 (archetype tier).
// 가해자 인격 6축(integrity·freedom·warmth·prudence·mercy·ambition)에 따라 발화. docs/28 §6.
//   (구 5축 loyalty=의무는 freedom 반대극으로 표현: 의리↑ = freedom↓.)
// 같은 카테고리(occult, defiance 등)지만 그 성격이라야 자연스러운 결의 사건.
//
// 조건은 PersonalityTraits 1~100 스케일. requirePersonality 의 각 축은 "≥ 임계".

import type { MoralEventTemplate } from '@/types';

export const ARCHETYPE_MORAL_EVENTS: MoralEventTemplate[] = [
  // ── 야망형 (pride↑ + curiosity↑) ─────────────────────────────
  // 동문 직강 시간을 가로채려는 시도.
  {
    id: 'a-ambition-cutin',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 6,
      minYearInSect: 3,
      requirePersonality: { ambition: 70, freedom: 50 },
    },
    scenario:
      '{sibling}을 위한 직강 시간이 시작되려는 참,\n' +
      '{name}이 거듭 사부의 옷자락을 잡았다.\n' +
      '"사부님, 제 무공 결도 한번만 봐주세요. 잠깐이면 됩니다."',
    insightHints: {
      3: '{name}이 동문과의 진도 차이에 조급하다.',
      4: '{name}이 사부의 시간을 자기 것으로 만들고 싶어한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"순서를 어긴다. 한 달 직강 권리 박탈."',
        perpetrator: { trustDelta: -4, personalityShift: { ambition: -6 } },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관으로 조급함을 내려놓아라."',
        perpetrator: { trustDelta: -2 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}의 직강이 끝난 후 너도 와라. 순서를 지키며 묻자."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { freedom: -4 },
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(둘 다 함께 가르친다. 사부가 두 배로 바빠진다.)',
        perpetrator: { trustDelta: 2, personalityShift: { ambition: 6 } },
        atmosphere: { unityDelta: -2 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { forbidPersonality: { freedom: 30 } },
            trustDelta: -1,
            noteAppend: '사부가 순서를 지키지 않는 듯 보였다.',
          },
        ],
      },
    ],
  },

  // ── 외로움형 (자비↓ + 자유↑) ───────────────────────────
  // 마을 차방에서 낯선 사파 인물과 차 한 잔.
  {
    id: 'a-lonely-tea',
    tier: 'archetype',
    category: 'occult',
    trigger: {
      weight: 5,
      minYearInSect: 4,
      requirePersonality: { freedom: 50 },
      forbidPersonality: { mercy: 50 },
    },
    scenario:
      '마을 차방에서 동문이 {name}을 보았다.\n' +
      '검은 두건을 두른 낯선 자와 마주 앉아 조용히 차를 마시고 있었다.\n' +
      '낯선 자의 허리에서는 익숙지 않은 결의 검집이 흔들렸다 — 사파의 결이다.',
    insightHints: {
      3: '{name}이 사문 안에서 외로움을 느끼고 있다.',
      4: '{name}이 사문 바깥에서 자기를 받아줄 곳을 찾고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사파 인물과 자리를 함께 한 자는 사문에 둘 수 없다."',
        perpetrator: { trustDelta: -5, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 외로움을 다스리는 결을 찾아라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"왜 그 자리에 앉았느냐. 사문 안에서 결을 나눌 자가 없느냐."',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { freedom: -6, mercy: 4 },
          darknessRiskBump: -3,
          noteAppend: '사부가 외로움을 들어주었다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(차 한 잔쯤 가벼이 본다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 4 },
        master: { hiddenFlag: 'master_overlooks_occult' },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },

  // ── 재능형/오만형 (pride↑) ──────────────────────────────────
  // 사부 가르침을 다른 곳에서 들으려 함.
  {
    id: 'a-talent-skip',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 5,
      minYearInSect: 4,
      requirePersonality: { ambition: 90 },
    },
    scenario:
      '"사부의 가르침은 한 결이 너무 느립니다."\n' +
      '{name}이 사부의 강의를 자주 빼먹고 있다.\n' +
      '대신 마을 도서에서 다른 사문 출신 노인을 찾아 따로 가르침을 구한다.',
    insightHints: {
      3: '{name}이 사부의 진도를 답답해한다.',
      4: '{name}이 사부의 자리를 의심하기 시작했다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사부를 두 명 두는 자는 사문에 둘 수 없다. 한 계절 무공 정지."',
        perpetrator: { trustDelta: -5, personalityShift: { ambition: -6 } },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 누구의 가르침을 따를지 정해라."',
        perpetrator: { trustDelta: -3 },
      },
      {
        tone: 'admonish',
        label: '"빠른 길을 원하느냐. 너만의 직강을 마련해 주마."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { freedom: -6 },
        },
        master: { insightDelta: 1, authorityDelta: -1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다. 사부의 자리가 흔들린다.)',
        perpetrator: { trustDelta: 1, personalityShift: { ambition: 6 } },
        master: { authorityDelta: -2, reputationDelta: -1 },
        atmosphere: { unityDelta: -2, righteousnessDelta: -1 },
      },
    ],
  },

  // ── 우직/고집형 (diligence↑ + curiosity↓) ────────────────────
  // 새 가르침을 거부하고 옛 방식만 고집.
  {
    id: 'a-stubborn-refuse',
    tier: 'archetype',
    category: 'defiance',
    trigger: {
      weight: 4,
      minYearInSect: 4,
      requirePersonality: { integrity: 70 },
      forbidPersonality: { freedom: 50 },
    },
    scenario:
      '사부가 새 결의 응용 수련을 가르치자 {name}이 단호히 답했다.\n' +
      '"사부님께서 처음 가르쳐주신 결이 옳다 생각합니다. 다른 결은 익히지 않겠습니다."\n' +
      '진심이지만 결국 가르침을 거부하는 결이다.',
    insightHints: {
      3: '{name}이 변화 자체를 두려워한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사부의 가르침을 거부하는 자는 무공도 거부한 것이다. 보름 무공 정지."',
        perpetrator: { trustDelta: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 결의 폭을 다시 생각해라."',
        perpetrator: { trustDelta: -1 },
      },
      {
        tone: 'admonish',
        label: '"옛 결을 버리라는 게 아니다. 결 위에 결을 쌓아라."',
        perpetrator: {
          trustDelta: 3,
          personalityShift: { freedom: 4 },
          noteAppend: '사부의 한 마디로 결의 폭이 한 결 넓어졌다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '"네 결대로 가라." (가르침을 멈춘다.)',
        perpetrator: { trustDelta: 2, personalityShift: { integrity: 4 } },
        atmosphere: { unityDelta: -1 },
      },
    ],
  },

  // ── 호기심형 (curiosity↑) ──────────────────────────────────
  // 책방 사이에서 금기 비급을 빌려옴.
  {
    id: 'a-curious-borrow',
    tier: 'archetype',
    category: 'occult',
    trigger: {
      weight: 5,
      minYearInSect: 3,
      requirePersonality: { freedom: 70 },
    },
    scenario:
      '{name}의 침소 베개 밑에서 낯선 비급이 나왔다.\n' +
      '마을 책방 노인이 "그저 호기심에 빌려간 것"이라 했지만,\n' +
      '비급의 결은 사문 가르침과 정면 충돌하는 마공의 한 갈래다.',
    insightHints: {
      3: '{name}의 호기심이 결의 어둠을 가리지 못하고 있다.',
      4: '{name}이 한 번 읽었다. 결이 머리에 남았다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"금기를 가까이 둔 자는 사문에 둘 수 없다." 본보기로 처분.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 결의 어둠을 짚어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
      },
      {
        tone: 'admonish',
        label: '"호기심은 잘못이 아니다. 다음엔 내게 먼저 보여라." 함께 비급을 펼친다.',
        perpetrator: {
          trustDelta: 4,
          personalityShift: { freedom: -6 },
          darknessRiskBump: -3,
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(베개 밑에 그대로 둔다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 5, darknessLevelBump: 1 },
        master: { hiddenFlag: 'master_overlooks_occult' },
        atmosphere: { righteousnessDelta: -3 },
      },
    ],
  },

  // ── 냉정형 (empathy↓) ──────────────────────────────────────
  // 동문 부상을 보고도 의방에 보고하지 않음.
  {
    id: 'a-cold-no-report',
    tier: 'archetype',
    category: 'neglect',
    trigger: {
      weight: 4,
      minYearInSect: 2,
      forbidPersonality: { mercy: 30 },
    },
    scenario:
      '훈련장에서 {sibling}이 발을 헛디뎌 갈빗대를 다쳤다.\n' +
      '같은 자리에 있던 {name}이 그를 보고도 의방에 알리지 않았다.\n' +
      '{sibling}은 밤이 깊어서야 다른 동문이 발견했다.',
    insightHints: {
      3: '{name}이 다른 사람의 결을 결로 보지 않는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 결을 외면한 자는 사문에 둘 수 없다." 책망과 처분.',
        perpetrator: { trustDelta: -4, personalityShift: { mercy: 4 } },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에서 사람의 결을 다시 보아라."',
        perpetrator: { trustDelta: -2, personalityShift: { mercy: 4 } },
      },
      {
        tone: 'admonish',
        label: '"{sibling} 앞에서 사과해라. 그리고 며칠 그를 돌봐라."',
        perpetrator: {
          trustDelta: 2,
          personalityShift: { mercy: 8 },
          noteAppend: '{sibling}을 직접 돌보았다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(다친 사람만 따로 챙긴다. {name}에게는 말하지 않는다.)',
        perpetrator: { trustDelta: 1, personalityShift: { mercy: -6 } },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },
];
