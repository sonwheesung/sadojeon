// 도덕 이벤트 — 강무열 개인 풀. docs/disciples/05 · docs/48
//
// 강무열은 가문의 명예를 진 정의로운 도객 — 평범한 일탈은 거의 안 한다.
// 단 흑화 창이 있다: 가문 명예 집착·정체성 위기·아버지의 어두운 협력.
// 그 결이 일탈로 샐 때는 ① 핏줄의 격을 내세우는 자만(pride)
// ② 정의를 빙자한 과격한 응징(violence) ③ 진실 앞에서 칼부터 뽑는 거부(defiance)로 나온다.
// 사부의 4선택이 "곧은 도객 vs 명예에 짓눌린 폭주" 분기를 가속/감속.

import type { MoralEventTemplate } from '@/types';

export const GANGMUYEOL_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 핏줄의 격 — 가문 명예가 자만으로 샌다 (pride)
  {
    id: 'p-gang-pedigree',
    tier: 'personal',
    category: 'pride',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'gang-muyeol',
      minYearInSect: 2,
    },
    scenario:
      '동문 하나가 사부를 찾아와 머뭇거린다.\n' +
      '"강무열이 합동 수련 중에 이런 말을 했습니다.\n' +
      ' \'너희 같은 집안에서야 칼 한 자루 제대로 쥐어 봤겠느냐. 무(武)에도 격이 있는 법이다.\'\n' +
      ' 농인지 진심인지… 듣던 아이들 낯빛이 굳어버렸습니다."',
    insightHints: {
      3: '강무열이 가문의 격을 동문 위에 두려 한다.',
      4: '가문의 명예가 그의 자존심 깊은 곳에 박혀 있다.',
      5: '제 가문을 높이 세우지 못하면 제가 무너질까 두려워한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 핏줄로 줄 세우는 것은 사문의 결을 깨는 일이다." 모든 제자 앞에서 책망한다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -1,
          noteAppend: '사부 앞에서 책망받았다 — 자만은 안으로 더 깊이 묻혔다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 칼끝에 핏줄이 아니라 무엇이 담겨야 하는지 헤아려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '강무열을 부른다. 가문이 그에게 무엇인지 들어주고, 무의 격은 핏줄이 아니라 베푸는 마음에서 난다 일러 준다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -4,
          personalityShift: { warmth: 6, mercy: 5, prudence: 4 },
          noteAppend: '사부가 가문의 무게를 들어주었다 — 격을 핏줄 밖에서도 보기 시작했다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
        cascade: [
          {
            kind: 'admire',
            noteAppend: '사부가 자만을 다독여 세우는 것을 보고 사문의 결이 한 결 단단해졌다.',
          },
        ],
      },
      {
        tone: 'overlook',
        label: '(못 들은 척한다. 어린 날의 치기려니 넘긴다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 3,
          noteAppend: '"사부도 틀렸다 하지 않으셨다." 가문의 격을 내세우는 버릇이 한 결 굳어간다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -3 },
      },
    ],
  },

  // 2. 응징의 손맛 — 정의를 빙자한 과격함 (violence)
  {
    id: 'p-gang-scourge',
    tier: 'personal',
    category: 'violence',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'gang-muyeol',
      minYearInSect: 4,
    },
    scenario:
      '장터에서 소란이 있었다. 좀도둑 하나를 강무열이 붙잡았는데,\n' +
      '이미 무릎 꿇고 빌던 자를 멈추지 않고 내리쳤다 한다.\n' +
      '"악인을 응징한 것뿐입니다, 사부님. 저런 자는 한 번 혼쭐이 나야 다시는 손을 안 댈 테니까요."\n' +
      '말끝에도 분이 가시지 않은 듯 주먹이 아직 떨린다.',
    insightHints: {
      3: '강무열이 악이라 단정한 자에게는 손속을 가리지 못한다.',
      4: '정의라는 이름이 그의 분노에 명분을 대어 준다.',
      5: '악을 치는 무인이 되려는 마음이 응징의 쾌감과 위태롭게 뒤섞여 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"무릎 꿇은 자를 친 것은 협(俠)이 아니라 폭(暴)이다." 한 계절 무공을 정지시킨다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          noteAppend: '제압된 자를 친 손이 정지당했다 — 응징과 폭력의 금이 한 번 그어졌다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 분이 가실 때까지 칼을 내려놓고 그날의 손을 들여다보라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '강무열을 부른다. 빌던 자를 친 순간의 마음을 들어주고, 멈출 줄 아는 손이 진짜 강한 손이라 일러 준다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -4,
          personalityShift: { mercy: 8, prudence: 5 },
          noteAppend: '사부가 응징과 자비의 경계를 짚어 주었다 — 멈출 줄 아는 손을 배우기 시작했다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(악인을 친 일이니 탓하지 않는다. 못 본 척 넘긴다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 4,
          noteAppend: '"응징은 죄가 아니다." 손에 밴 그 감각을 한 번 더 떠올린다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -1 },
      },
    ],
  },

  // 3. 명예의 금 — 진실 앞에서 칼부터 뽑는 거부 (defiance·큰 사건)
  {
    id: 'p-gang-honor-crack',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'gang-muyeol',
      minYearInSect: 6,
    },
    scenario:
      '풍문 한 자락이 사문에 닿았다. 강무열의 가문이 옛적 어느 멸문에 손을 보탰다는 말.\n' +
      '그 말을 전해 들은 강무열의 낯빛이 하얘지더니, 사부의 만류에도 언성을 높인다.\n' +
      '"누가 그런 헛소리를! 우리 가문은 평생 정파의 길만 걸었습니다.\n' +
      ' 사부님, 그 입을 놀린 자를 제 손으로 찾아내겠습니다. 부디 말리지 마십시오."',
    insightHints: {
      3: '강무열이 가문에 관한 말 앞에서는 유독 무너진다.',
      4: '풍문이 사실일까 두려워, 그 두려움을 분노로 덮으려 한다.',
      5: '가문의 명예가 무너지면 제 존재의 근거가 사라진다 여겨, 진실을 보는 것조차 거부한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"진실을 마주하기도 전에 칼부터 뽑는 것은 무인의 도리가 아니다." 사부의 명으로 그 자리에 묶어 둔다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          noteAppend: '분노의 발길이 사부에게 막혔다 — 풍문은 끝내 마음에 가시로 남았다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 분노가 아니라 진실을 먼저 마주할 그릇부터 닦아라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '강무열을 부른다. 분노 밑에 깔린 두려움을 들어주고, 너를 세우는 것은 가문의 이름이 아니라 네가 어떻게 사느냐라 일러 준다.',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -5,
          personalityShift: { integrity: 6, prudence: 6, mercy: 4 },
          noteAppend: '사부가 두려움을 들어주었다 — 가문의 그늘과 제 길을 떼어 보기 시작했다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(분을 풀고 오라며 그대로 보낸다. 가문 일은 스스로 가리게 둔다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 5,
          darknessLevelBump: 1,
          noteAppend: '풍문의 진원을 제 손으로 캐러 나섰다 — 명예를 지키려는 마음이 돌아올 줄 모르고 치닫는다.',
        },
        master: { hiddenFlag: 'master_overlooks_gang_honor' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -3 },
      },
    ],
  },
];
