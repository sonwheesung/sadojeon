// 도덕적 갈등 이벤트 — 윤소소 개인 풀 (personal tier).
// docs/disciples/04_윤소소.md · backstoryKey: noble-house-incident.
//
// 윤소소는 정의감 ↑↑ — 평범한 일탈은 거의 안 함.
// 단 어린 시절 노비 살해 목격의 트라우마로 청하를 의심,
// 그 의심이 동문 사이 험담·도둑질·무단 외출로 새어 나옴.
// 사부의 4선택이 "비극의 거울 vs 화해의 검" 분기를 가속/감속.

import type { MoralEventTemplate } from '@/types';

export const YUNSOSO_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 이청하 험담 — 청하 영입 시에만 발화
  {
    id: 'p-yun-rumor-cheongha',
    tier: 'personal',
    category: 'lie',
    trigger: {
      weight: 7,
      onlyForDiscipleId: 'yun-soso',
      requireSiblingId: 'i-cheongha',
      minYearInSect: 2,
    },
    scenario:
      '동문 한 명이 사부에게 조심스레 알려왔다.\n' +
      '"윤소소가 다른 동문들에게 이청하에 대해 묘한 말을 흘리고 있습니다.\n' +
      ' \'그 사람 검은 단발, 가냘픈 몸, 차가운 눈… 보면 안 떠올라요?\'\n' +
      ' 직접 험담은 아니지만, 듣는 자들이 점점 이청하를 멀리하고 있습니다."',
    insightHints: {
      3: '윤소소가 이청하를 의심하고 있다.',
      4: '윤소소의 어린 시절 기억이 이청하와 맞닿아 있다.',
      5: '윤소소 허리의 비단 주머니 — 5년 전 죽은 노비 소년의 머리카락이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 등지고 말을 흘리는 자는 사문의 결을 깨는 자다." 모든 제자 앞에서 책망.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -1,
          noteAppend: '사부 앞에서 책망받았다 — 의심은 더 깊이 묻혔다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            triggerCondition: { relation: 'enemy' },
            noteAppend: '이청하도 자기에게 도는 차가운 시선의 이유를 묻기 시작했다.',
          },
        ],
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 입과 마음을 한 결로 묶어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '윤소소를 부른다. 비단 주머니에 대해 묻고, 5년 전 그날의 기억을 들어준다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -5,
          personalityShift: { mercy: 6, freedom: -4 },
          noteAppend: '사부가 트라우마를 들어주었다 — 의심의 무게가 한 결 가벼워졌다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 들은 척한다. 동문 사이 일은 동문이 풀라 한다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 4,
          noteAppend: '"사부도 알면서 모른 척한다." 의심이 확신으로 굳어간다.',
        },
        master: { hiddenFlag: 'master_overlooks_yun_revenge' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -3 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { relation: 'enemy' },
            trustDelta: -2,
            noteAppend: '이청하가 사문 안에서 자기 자리를 묻기 시작했다.',
          },
        ],
      },
    ],
  },

  // 2. 이청하의 짐을 뒤짐 — 청하 영입 시에만 발화
  {
    id: 'p-yun-search-cheongha',
    tier: 'personal',
    category: 'theft',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'yun-soso',
      requireSiblingId: 'i-cheongha',
      minYearInSect: 3,
    },
    scenario:
      '이청하가 사부를 조용히 찾아왔다.\n' +
      '"… 제 짐이 흐트러져 있었습니다. 비단주머니 하나만 자리가 바뀌어 있고,\n' +
      ' 옥패가 손바닥 자국과 함께 침소 가운데 놓여 있었습니다.\n' +
      ' 누군가 살수의 흔적을 찾으려 했던 것 같습니다."\n' +
      '훔쳐간 것은 없었다. 다만 손길의 결이 윤소소의 것이었다.',
    insightHints: {
      3: '윤소소가 이청하의 정체를 확인하려 한다.',
      4: '두 사람 사이의 옛 사연이 곧 폭발할 결이다.',
      5: '이청하의 옥패 — 5년 전 죽인 노비 소년의 유품. 윤소소는 그 옥패를 본 적 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 짐에 손을 대는 것은 사문의 큰 죄다." 한 계절 무공 정지.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          noteAppend: '사부가 의심의 결을 짚지 못했다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 복수와 정의의 결을 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '둘을 함께 부른다. 윤소소의 사연과 이청하의 과거를 사부의 자리 안에서 풀어준다.',
        perpetrator: {
          trustDelta: 5,
          darknessRiskBump: -6,
          personalityShift: { mercy: 8 },
          noteAppend: '사부의 중재로 두 사람의 결이 처음으로 마주섰다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { unityDelta: 4 },
        cascade: [
          {
            kind: 'admire',
            noteAppend: '사부의 중재를 보고 사문의 결이 한 결 단단해졌다.',
          },
        ],
      },
      {
        tone: 'overlook',
        label: '(이청하에게는 짐을 잠가 두라 일렀을 뿐.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 6,
          noteAppend: '의심은 확신으로 — 복수의 검이 마음에 자리를 잡기 시작했다.',
        },
        master: { hiddenFlag: 'master_overlooks_yun_revenge' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -3 },
      },
    ],
  },

  // 3. 살수 정보 모은다며 사문 무단 외출
  {
    id: 'p-yun-leave-track',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'yun-soso',
      minYearInSect: 4,
    },
    scenario:
      '간밤 윤소소가 사문 산문을 빠져나간 것이 새벽에야 드러났다.\n' +
      '돌아온 그녀의 옷자락에는 마을 외곽 객점의 향이 묻어 있었다.\n' +
      '"… 살수조직의 단서를 찾고 있었습니다. 사부님께 미리 청하지 못한 점, 죄송합니다."\n' +
      '말은 단정하지만 손에서 비단 주머니가 떨리고 있다.',
    insightHints: {
      3: '윤소소가 사문 바깥에서 복수의 단서를 모으고 있다.',
      4: '윤소소의 결이 사문 안에서 더 이상 머물지 못하고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문 규율을 어겼다. 한 달 외출 금지 + 무공 정지."',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          noteAppend: '사부가 복수의 결을 들어주지 않았다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 복수의 결을 사문 안에서 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"다음엔 내게 와라. 살수조직 정보는 사부가 함께 모은다." 정파 인편을 직접 풀어준다.',
        perpetrator: {
          trustDelta: 5,
          darknessRiskBump: -5,
          personalityShift: { freedom: -6 },
          noteAppend: '사부가 살수조직 정보를 함께 모으겠다 약속했다 — 결의 길이 정의로 향했다.',
        },
        master: { insightDelta: 2, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 5,
          noteAppend: '"사부도 복수를 묵인한다." 결의 어둠이 한 결 짙어졌다.',
        },
        master: { hiddenFlag: 'master_overlooks_yun_revenge' },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },
];
