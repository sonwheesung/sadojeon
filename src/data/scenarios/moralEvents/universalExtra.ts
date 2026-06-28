// 공통 도덕 이벤트 확장분 2026-06-28 docs/07
// universal tier 추가 12종. 누구나 가해자 가능 — 성격 게이트 없이 weight·연차로만 시기 분산.
// 기존 universal 10종과 소재 중복 회피(시장갈취·비급도둑·험담·강의빼먹기·걸인외면·
//   금기비급·무단외출·과시·대련폭력·영약도둑). 여기선 다른 변주.
//
// 효과 부호 결(universal.ts 헤더와 동일):
// - punish    : 신뢰 ↓↓, 도의 ↑, darknessRiskBump 큰 음수
// - seclusion : 신뢰 ↓,  darknessRiskBump 중 음수
// - admonish  : 신뢰 ↑↑(가장 높은 양수), 결속 ↑, darknessRiskBump 음수, 6축 personalityShift +
// - overlook  : 신뢰 소폭 ↑, 무도 ↑(righteousnessDelta 음수), darknessRiskBump 양수

import type { MoralEventTemplate } from '@/types';

export const UNIVERSAL_MORAL_EVENTS_EXTRA: MoralEventTemplate[] = [
  // 1. 마을 아이들 협박 갈취 — extortion (중반)
  {
    id: 'u-extort-bully',
    tier: 'universal',
    category: 'extortion',
    trigger: { weight: 8, minYearInSect: 3, maxYearInSect: 6 },
    scenario:
      '마을 어귀에서 아이들 몇이 사문 산문을 멀리 돌아 다닌다는 소문이 돌았다.\n' +
      '캐물으니 {name}이 골목에서 어린아이들을 세워두고 주머니를 털게 하고 있었다.\n' +
      '"그냥 장난이었습니다. 돌려줄 생각이었고요." 아이의 눈은 별로 미안해 보이지 않는다.',
    insightHints: {
      3: '{name}은 제 힘이 통하는 곳을 찾아 마을 아이들을 골랐다.',
      4: '{name}은 약한 자 앞에서만 어깨가 펴진다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"약한 자를 겁준 손은 사문의 손이 아니다." 산문 앞에서 본보기 처분을 내린다.',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3, noteAppend: '본보기 처분을 받았다.' },
        master: { authorityDelta: 1, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 3, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관에 들어 네 힘이 어디로 향했는지 짚어라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -2, noteAppend: '폐관으로 마음을 멈췄다.' },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'admonish',
        label: '"그 아이들을 다시 찾아가 빼앗은 것을 돌려주고 손을 잡아줘라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { mercy: 4, integrity: 2 },
          noteAppend: '마을 아이들을 찾아가 사과했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(아이들에게 동전 몇 닢 쥐어 보내고, {name}에게는 말하지 않는다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 3,
          noteAppend: '사부가 묵인했다. 다음에도 손이 쉬울 듯하다.',
        },
        master: { reputationDelta: -1, hiddenFlag: 'master_overlooks_extortion' },
        atmosphere: { righteousnessDelta: -3, unityDelta: -1 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { ambition: 55 } },
            noteAppend: '{name}이 그래도 되는 모양이라 여겼다.',
          },
        ],
      },
    ],
  },

  // 2. 동문 호신부 훔침 — theft (중반)
  {
    id: 'u-theft-keepsake',
    tier: 'universal',
    category: 'theft',
    trigger: { weight: 7, minYearInSect: 3 },
    scenario:
      '{sibling}이 베갯머리에 두고 자던 옥패 — 집을 떠날 때 어머니가 쥐어준 단 하나의 정표가 사라졌다.\n' +
      '며칠 뒤 그 옥패가 {name}의 봇짐 깊은 곳에서 나왔다.\n' +
      '"… 그냥 예뻐서 잠깐 보려고 했습니다." {name}의 말끝이 흐려진다.',
    insightHints: {
      3: '{name}은 제게 없는 것을 가진 동문이 부럽다.',
      4: '{name}이 탐낸 것은 옥패가 아니라 누군가 자신을 떠올려 준다는 그 마음이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 정표에 손을 댔다. 한 계절 무공 정지 + 산문 청소."',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3, noteAppend: '동문 물건에 손대 처분받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어 남의 것과 네 것의 경계를 다시 그어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"옥패는 {sibling}에게 돌려주고, 네가 그리운 것이 무엇인지 내게 말해라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { warmth: 4, integrity: 2 },
          noteAppend: '사부에게 속을 털어놓았다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(옥패만 슬그머니 {sibling} 자리에 돌려놓고 아무에게도 말하지 않는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3 },
        master: { hiddenFlag: 'master_overlooks_theft' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },

  // 3. 남의 공을 가로챈 거짓 공치사 — lie (중반)
  {
    id: 'u-lie-credit',
    tier: 'universal',
    category: 'lie',
    trigger: { weight: 9, minYearInSect: 3 },
    scenario:
      '의뢰가 끝나고 {name}이 사부 앞에서 또박또박 공을 아뢨다.\n' +
      '"제가 길목을 막아 도적을 잡았습니다." 사부가 흡족해하던 그때,\n' +
      '뒤늦게 돌아온 {sibling}의 어깨에만 칼자국이 깊었다 — 정작 앞에 선 건 {sibling}이었다.',
    insightHints: {
      3: '{name}은 사부에게 처음으로 크게 인정받고 싶었다.',
      4: '{name}은 거짓이 들통날까보다, 인정받지 못할까가 더 두렵다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"남의 공을 제 것이라 한 입은 무겁게 다스린다." 모든 제자 앞에서 바로잡는다.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -2, noteAppend: '동문 앞에서 거짓이 바로잡혔다.' },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관에 들어, 네 공이 아닌 것을 셈하던 마음을 비워라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}의 공을 먼저 치하해라. 네 몫은 정직할 때라야 빛난다."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { integrity: 4, ambition: -2 },
          noteAppend: '동문의 공을 인정하고 사과했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2, righteousnessDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(그냥 둘 다 잘했다 두루뭉술 칭찬하고 넘어간다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 2 },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { relation: 'friend' },
            trustDelta: -2,
            noteAppend: '제 공을 빼앗기고도 사부가 가려주지 않아 서운하다.',
          },
        ],
      },
    ],
  },

  // 4. 동문 누명 씌우기 — lie (후반)
  {
    id: 'u-lie-frame',
    tier: 'universal',
    category: 'lie',
    trigger: { weight: 6, minYearInSect: 6 },
    scenario:
      '연단실 약재가 축났다는 소동 끝에, {name}이 {sibling}을 가리켰다.\n' +
      '"제가 {sibling}이 약재함을 여는 걸 봤습니다." 정황은 그럴듯했지만,\n' +
      '나중에 보니 그날 {sibling}은 산 아래 의뢰를 나가 사문에 없었다.',
    insightHints: {
      3: '{name}은 의심이 제게 올까봐 다른 이를 먼저 가리켰다.',
      4: '{name}은 {sibling}이 사라지면 제 자리가 편해진다 여긴다.',
      5: '{name}은 한 번 내뱉은 거짓을 거두면 제가 무너질까 두려워 끝까지 우긴다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"죄 없는 동문을 죄인으로 몬 입이다. 사문에서 가장 무겁게 다스린다."',
        perpetrator: { trustDelta: -6, darknessRiskBump: -3, noteAppend: '누명을 씌운 죄로 중하게 처분받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 3, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 네가 가리킨 손가락이 누구를 겨눴는지 끝까지 들여다봐라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'admonish',
        label: '"{sibling} 앞에 무릎 꿇고 거짓을 거둬라. 무엇이 그리 두려웠는지 그 뒤에 말해라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { integrity: 4, warmth: 2 },
          noteAppend: '동문 앞에서 거짓을 거두고 사과했다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2, righteousnessDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(증거가 없으니 그냥 없던 일로 덮는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 4, darknessLevelBump: 1 },
        master: { hiddenFlag: 'master_overlooks_lie', reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -3, unityDelta: -3 },
        cascade: [
          {
            kind: 'distance',
            triggerCondition: { relation: 'friend' },
            trustDelta: -2,
            noteAppend: '누명을 쓰고도 가려주지 않은 사부를 멀리하게 되었다.',
          },
        ],
      },
    ],
  },

  // 5. 훈련 중 약한 동문 짓밟기 — violence (중반)
  {
    id: 'u-violence-weak',
    tier: 'universal',
    category: 'violence',
    trigger: { weight: 8, minYearInSect: 3 },
    scenario:
      '대련 짝으로 가장 여린 {sibling}을 고른 {name}이,\n' +
      '이미 손을 든 상대를 향해 한 번 더, 또 한 번 더 목검을 내리쳤다.\n' +
      '{sibling}이 바닥에 엎드려 더는 못 한다 빌어도 {name}의 손은 멈추지 않았다.',
    insightHints: {
      3: '{name}은 이기는 맛을 가장 약한 상대에게서 확인하려 했다.',
      4: '{name}은 멈춰야 할 자리를 알면서도 멈추지 않았다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"손을 든 동문을 친 것은 무인의 도가 아니다. 한 계절 무공 정지."',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3, noteAppend: '과한 손속으로 처분받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 멈출 줄 모르던 손을 다시 묶어라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"네 손에 쓰러진 자를 네 손으로 일으켜 의방까지 업어라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { mercy: 4, prudence: 2 },
          noteAppend: '제 손에 다친 동문을 직접 돌봤다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(대련에는 으레 있는 일이라 가볍게 넘긴다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3 },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { personality: { mercy: 60 } },
            trustDelta: -1,
            noteAppend: '약한 동문을 사부가 지켜주지 않아 불안하다.',
          },
        ],
      },
    ],
  },

  // 6. 부상 동문 방치 — neglect (후반)
  {
    id: 'u-neglect-injured',
    tier: 'universal',
    category: 'neglect',
    trigger: { weight: 7, minYearInSect: 6 },
    scenario:
      '함께 나간 의뢰 길, {sibling}이 비탈에서 발을 접질려 주저앉았다.\n' +
      '{name}은 "먼저 가서 알리겠다"는 말만 남기고 홀로 산을 내려와 공을 챙겼다.\n' +
      '{sibling}은 밤이 깊도록 찬 산중에 홀로 남아 떨어야 했다.',
    insightHints: {
      3: '{name}은 동문을 업고 늦느니 혼자 빨리 가는 쪽을 택했다.',
      4: '{name}에게 동행은 짐을 나누는 사이가 아니라 앞서거나 뒤처지는 사이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 산중에 버린 발이다. 한 달 의뢰 금지 + 사문 일과 곱절."',
        perpetrator: { trustDelta: -4, darknessRiskBump: -2, noteAppend: '동문을 두고 온 죄로 처분받았다.' },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 함께 간다는 말의 무게를 다시 새겨라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"{sibling}의 약 시중을 다 나을 때까지 네가 들어라. 동행이 무엇인지 그때 알 것이다."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { warmth: 4, mercy: 2 },
          noteAppend: '다친 동문을 끝까지 간호했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(어차피 다 무사히 돌아왔으니 별 말 하지 않는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 3, personalityShift: { warmth: -4 } },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },

  // 7. 야밤 사술 의식 — occult (후반)
  {
    id: 'u-occult-ritual',
    tier: 'universal',
    category: 'occult',
    trigger: { weight: 5, minYearInSect: 6 },
    scenario:
      '뒷산 폐사 터에 밤마다 향불이 켜진다는 말에 올라가 보니,\n' +
      '{name}이 낯선 부적과 짐승 뼈를 둘러놓고 무언가를 빌고 있었다.\n' +
      '"빨리 강해질 수만 있다면… 무엇이든 좋다고 들었습니다." 눈이 평소와 다르게 번뜩인다.',
    insightHints: {
      3: '{name}은 정도의 더딘 길을 견디지 못하고 지름길을 찾고 있다.',
      4: '{name}의 마음이 정상에서 멀어지는 무언가에 끌리고 있다. 지금이 잡을 때다.',
      5: '{name}은 강해지려는 게 아니라, 강하지 못한 자신이 무서워 도망칠 곳을 찾는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문의 제자가 손댈 것이 아니다." 부적을 모두 태우고 산문 청소 + 한 계절 무공 정지.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -4, noteAppend: '사술 도구를 모두 태웠다.' },
        atmosphere: { righteousnessDelta: 3 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 그 번뜩이던 눈을 가라앉히고 마음을 다시 잡아라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'admonish',
        label: '"그 길 끝에 무엇이 기다리는지 내가 보여주마." 폐사 터에 함께 앉아 밤새 이야기한다.',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -3,
          personalityShift: { prudence: 4, freedom: -2 },
          noteAppend: '사부와 밤새 이야기하며 마음을 돌렸다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2, righteousnessDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(부적만 거둬 치우고 아무 말도 하지 않는다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 5, darknessLevelBump: 1 },
        master: { hiddenFlag: 'master_overlooks_occult', reputationDelta: -2 },
        atmosphere: { righteousnessDelta: -3 },
      },
    ],
  },

  // 8. 사부 명령 공개 거역 — defiance (중반)
  {
    id: 'u-defiance-order',
    tier: 'universal',
    category: 'defiance',
    trigger: { weight: 8, minYearInSect: 3 },
    scenario:
      '아침 일과를 이르자 {name}이 동문들 앞에서 팔짱을 끼고 버텼다.\n' +
      '"그 수련은 쓸모가 없습니다. 저는 제 방식대로 하겠습니다."\n' +
      '여러 제자가 지켜보는 가운데, {name}은 사부의 말을 정면으로 받아쳤다.',
    insightHints: {
      3: '{name}은 제 판단이 사부의 것보다 낫다 믿기 시작했다.',
      4: '{name}은 사부를 꺾어 동문들 앞에서 제 자리를 세우고 싶다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문에 두 스승은 없다." 모든 제자 앞에서 엄히 다스린다.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -2, noteAppend: '동문 앞에서 엄히 다스려졌다.' },
        master: { authorityDelta: 2 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 네 방식과 내 가르침을 홀로 견줘보고 오너라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"그 수련이 왜 쓸모없다 보았느냐. 네 생각을 끝까지 말해보아라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { prudence: 4, ambition: -2 },
          noteAppend: '사부가 제 생각을 끝까지 들어주었다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(굳이 부딪치지 않고 제 하고 싶은 대로 두고 본다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 3, personalityShift: { ambition: 4 } },
        master: { authorityDelta: -1 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { freedom: 60 } },
            noteAppend: '버텨도 별일 없는 것을 보고 자기도 그래볼까 한다.',
          },
        ],
      },
    ],
  },

  // 9. 의뢰 중 독단으로 사문 방침 무시 — defiance (후반)
  {
    id: 'u-defiance-quest',
    tier: 'universal',
    category: 'defiance',
    trigger: { weight: 6, minYearInSect: 6 },
    scenario:
      '"무리하지 말고 정황만 살펴 돌아오라"는 당부를 받고 나간 의뢰에서,\n' +
      '{name}은 단신으로 산채에 뛰어들어 도적 떼와 칼을 섞고 돌아왔다.\n' +
      '"이겼으니 된 것 아닙니까." 어깨의 상처를 두고도 의기양양하다.',
    insightHints: {
      3: '{name}은 사부의 신중함을 겁쟁이의 핑계로 여기기 시작했다.',
      4: '{name}은 한 번의 큰 공으로 단숨에 인정받고 싶다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"이겼어도 명을 어긴 것은 어긴 것이다. 한 달 의뢰 금지."',
        perpetrator: { trustDelta: -4, darknessRiskBump: -2, noteAppend: '독단으로 의뢰 금지 처분을 받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 운이 좋았던 것과 잘한 것을 가려내라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"이번엔 살아 돌아왔다. 허나 다음엔 동문 목숨까지 걸린다 — 그 무게를 함께 보자."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { prudence: 4, ambition: -2 },
          noteAppend: '사부와 함께 무모함의 무게를 짚었다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '"공을 세웠으니 됐다." (상처만 치료해 보내고 칭찬한다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 3, personalityShift: { ambition: 4 } },
        master: { reputationDelta: 1, authorityDelta: -1 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -1 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { ambition: 60 } },
            noteAppend: '무모해도 이기면 칭찬받는 것을 보고 자기도 따라하려 한다.',
          },
        ],
      },
    ],
  },

  // 10. 동문에게 비무 도발·깔봄 — pride (중반)
  {
    id: 'u-pride-taunt',
    tier: 'universal',
    category: 'pride',
    trigger: { weight: 7, minYearInSect: 3 },
    scenario:
      '훈련장 한복판에서 {name}이 {sibling}을 손가락질하며 비웃었다.\n' +
      '"그 정도 손속으로 무공을 한다 하느냐. 나와 한 수 겨뤄볼 텐가?"\n' +
      '{sibling}이 고개를 떨구자 둘러선 동문들 사이로 비웃음이 번졌다.',
    insightHints: {
      3: '{name}은 남을 낮춰야 제가 높아진다 느낀다.',
      4: '{name}은 정작 제가 인정받지 못할까봐 먼저 남을 깎아내린다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 웃음거리로 만든 입이다. 한 달 무공 정지로 다스린다."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -1, personalityShift: { ambition: -4 } },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 남을 깎아내리던 그 마음의 바닥을 들여다봐라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"앞으로 한 달, {sibling}의 약한 결을 네가 끌어올려 줘라. 가르쳐 보면 알 것이다."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { warmth: 4, ambition: -2 },
          noteAppend: '동문을 직접 가르치며 깔보던 마음을 풀었다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '"기개가 있어 그렇다." (젊은 혈기로 여기고 웃어넘긴다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 2, personalityShift: { ambition: 4 } },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { relation: 'enemy' },
            trustDelta: -1,
            noteAppend: '비웃음을 사부가 두둔하자 사문이 미덥지 않다.',
          },
        ],
      },
    ],
  },

  // 11. 외부 문파 앞에서 사문 깎아내리며 자기 과시 — pride (후반)
  {
    id: 'u-pride-boast',
    tier: 'universal',
    category: 'pride',
    trigger: { weight: 5, minYearInSect: 6 },
    scenario:
      '타 문파 무인들이 산문을 찾은 자리에서, {name}이 큰소리를 쳤다.\n' +
      '"우리 사문 무공이야 낡았지요. 그래도 저 하나는 어디 내놔도 빠지지 않습니다."\n' +
      '제 자랑을 위해 사문을 발판 삼는 말에, 손님들의 눈초리가 묘해졌다.',
    insightHints: {
      3: '{name}은 사문보다 제 이름이 먼저 알려지기를 바란다.',
      4: '{name}은 제가 몸담은 자리를 낮춰서라도 홀로 돋보이고 싶다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"제 둥지를 깎아 제 깃을 세우는 새는 없다." 손님 앞에서 바로 다스린다.',
        perpetrator: { trustDelta: -4, darknessRiskBump: -2, personalityShift: { ambition: -4 } },
        master: { authorityDelta: 1, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 네가 선 자리가 누구의 어깨 위인지 헤아려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"네 이름이 사문의 이름과 함께 큰다는 걸 아직 모르는구나. 차근히 일러준다."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { prudence: 4, ambition: -2 },
          noteAppend: '제 이름과 사문의 이름이 함께 큼을 깨달았다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '"젊어 패기가 있어 그렇소." (손님 앞에서 웃으며 덮는다.)',
        perpetrator: { trustDelta: 1, darknessRiskBump: 2, personalityShift: { ambition: 4 } },
        master: { reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
      },
    ],
  },

  // 12. 후배 동문에게서 용돈·영물 갈취 — extortion (후반)
  {
    id: 'u-extort-junior',
    tier: 'universal',
    category: 'extortion',
    trigger: { weight: 6, minYearInSect: 6 },
    scenario:
      '{sibling}이 의뢰로 모은 노자를 들고 들어올 때마다 한 줌씩 줄어든다는 말이 돌았다.\n' +
      '알고 보니 {name}이 "윗사람 대접"이라며 동문에게서 은근히 돈을 걷고 있었다.\n' +
      '"동문끼리 서로 챙기는 거지요." {name}은 갈취라 불리는 걸 한사코 부인한다.',
    insightHints: {
      3: '{name}은 동문 사이에서 제가 위라는 자리를 돈으로 확인하려 한다.',
      4: '{name}은 받아 챙긴 것을 호의로 포장해 죄의 무게를 덜고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"이 사문에 위아래로 돈을 걷는 법은 없다." 걷은 것을 모두 돌려주게 하고 엄히 다스린다.',
        perpetrator: { trustDelta: -5, darknessRiskBump: -3, noteAppend: '걷은 돈을 모두 돌려주고 처분받았다.' },
        master: { authorityDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"폐관에 들어, 네가 챙긴 그 자리가 정말 윗자리였는지 짚어라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -2 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"걷은 것을 돌려주고, 진짜 윗사람이 무엇으로 서는지 한 해 동안 동문을 챙겨 보여라."',
        perpetrator: {
          trustDelta: 4,
          darknessRiskBump: -2,
          personalityShift: { integrity: 4, warmth: 2 },
          noteAppend: '돈을 돌려주고 동문을 살피기 시작했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(동문끼리의 일이라 여기고 못 들은 척한다.)',
        perpetrator: { trustDelta: 2, darknessRiskBump: 3, personalityShift: { ambition: 4 } },
        master: { hiddenFlag: 'master_overlooks_extortion', reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2, unityDelta: -3 },
        cascade: [
          {
            kind: 'mimic',
            triggerCondition: { personality: { ambition: 55 } },
            noteAppend: '윗자리 행세로 돈을 걷어도 된다 여겼다.',
          },
        ],
      },
    ],
  },
];
