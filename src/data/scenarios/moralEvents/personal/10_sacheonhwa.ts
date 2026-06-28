// 도덕 이벤트 — 사천화 개인 풀. docs/disciples/10 · docs/48
//
// 사천화는 본성 활인(의가)이라 평범한 일탈은 거의 안 한다.
// 단 가전 비전을 노리는 외부의 그늘에 오래 시달리며,
// "어둠을 약으로 갚을지 독으로 갚을지" — 살리는 손과 해치는 손 사이에서 흔들린다.
// 흑화 창 = 복수의 약독사. 큰 사건의 묵인에서만 단계가 한 칸 깊어진다.

import type { MoralEventTemplate } from '@/types';

export const SACHEONHWA_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 사람을 해할 독을 사부 몰래 곤다 (occult) — 살리는 손/해치는 손의 경계
  {
    id: 'p-sa-toxinstudy',
    tier: 'personal',
    category: 'occult',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'sa-cheonhwa',
      minYearInSect: 3,
    },
    scenario:
      '연단실 한구석에서 천화가 평소와 다른 약을 곤다.\n' +
      '해독에 쓰는 약재가 아니라, 살갗에 닿기만 해도 사람을 무너뜨리는 독이다.\n' +
      '"이건 살리는 약이 아니에요. 단… 우리 집을 노리는 자들이 어디까지 독한지 알려면,\n' +
      ' 저도 그만큼은 알아야 하잖아요. 사부님은 모르시는 게 나아요."\n' +
      '열 살 손끝이 너무 익숙하게 독을 가른다.',
    insightHints: {
      3: '천화가 살리는 손과 해치는 손 사이에서 흔들린다.',
      4: '천화는 가문을 지킬 힘이 독에 있다고 믿기 시작했다.',
      5: '천화가 곤 독은 막아 내려는 게 아니라, 언젠가 누군가에게 쓸 작정으로 정밀하다.',
    },
    choices: [
      {
        tone: 'punish',
        label:
          '"사람을 해할 독을 사부 몰래 곤 것은 사문의 금을 넘은 것이다." 연단실 출입을 거두고 곤 독을 모두 폐기시킨다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          noteAppend: '곤 독을 빼앗겼다 — 가문을 지킬 손이 묶였다고 여긴다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"독을 내려놓아라. 한 계절 홀로 들어앉아, 그 손이 본디 무엇을 살리는 손인지부터 되새겨라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '천화를 곁에 앉히고, 가문을 지키는 힘이 정말 독에만 있는지 밤이 새도록 함께 짚는다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -5,
          personalityShift: { mercy: 6, integrity: 4 },
          noteAppend: '사부가 다른 길을 함께 그려 주었다 — 손끝의 서늘함이 한 결 풀렸다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(가문을 지키려는 마음이려니, 못 본 척 자리를 비켜 준다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 4,
          noteAppend: '"사부도 모른 척하신다." 해치는 손에 점점 거리낌이 없어진다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -1 },
      },
    ],
  },

  // 2. 정탐꾼에 독을 쓰려는 유혹 (violence) — 먼저 손쓰는 두려움
  {
    id: 'p-sa-scoutpoison',
    tier: 'personal',
    category: 'violence',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'sa-cheonhwa',
      minYearInSect: 5,
    },
    scenario:
      '또 그 그림자다. 가전 비전을 노리고 산문 언저리를 맴돌던 정탐꾼이,\n' +
      '이번엔 천화의 찻잔 가까이까지 다가왔다 물러갔다.\n' +
      '"사부님. 저 사람, 찻물 한 모금이면 사흘은 일어나지 못해요.\n' +
      ' 아무도 모르게요. 우리 집을 그만 노리게… 제가 손쓰면 안 될까요?"\n' +
      '단정한 목소리인데, 약독 주머니를 쥔 손에 핏기가 가셨다.',
    insightHints: {
      3: '천화가 먼저 손쓰는 쪽으로 마음이 기운다.',
      4: '천화는 가시지 않는 두려움을 독으로 지우려 한다.',
      5: '천화는 이미 그 정탐꾼의 찻물에 무엇을 풀지까지 정해 두었다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"먼저 사람에게 독을 겨누는 순간, 너는 네가 미워하던 그자들과 같아진다." 약독 주머니를 거두어 사부가 맡는다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -2,
          noteAppend: '주머니를 빼앗겼다 — 제 손을 믿지 못한다는 말로 들었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"그 손을 한동안 사람에게서 떼어 놓아라. 한 계절 산문 안에 들어 마음을 가라앉혀라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"그자는 사부가 동문과 함께 쫓는다. 네 손은 사람을 살리는 데 두어라." 정탐꾼은 사부가 직접 맡겠다 약속한다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -5,
          personalityShift: { mercy: 6, prudence: 4 },
          noteAppend: '사부가 두려움을 대신 떠맡아 주었다 — 손에 핏기가 돌아왔다.',
        },
        master: { insightDelta: 2, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(못 들은 척한다. 정탐꾼 일은 알아서 하라 자리를 비킨다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 5,
          noteAppend: '"사부도 말리지 않으셨다." 먼저 독을 쓰는 일에 마음의 빗장이 풀렸다.',
        },
        master: { hiddenFlag: 'master_overlooks_sacheonhwa_venom' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -1 },
      },
    ],
  },

  // 3. 가문의 한을 독으로 갚으러 사문을 나선다 (defiance) — 큰 사건
  {
    id: 'p-sa-vengeance',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'sa-cheonhwa',
      minYearInSect: 6,
    },
    scenario:
      '가문을 노리던 자들의 이름과 거처를 누군가 천화에게 흘렸다.\n' +
      '간밤 천화가 약독을 한 보따리 챙겨 산문을 나서려다 발각됐다.\n' +
      '"사부님께 청하면 말리실 걸 알아요. 단 이번엔 제가 가야 해요.\n' +
      ' 그자들이 아버지를 그렇게 한 값을, 제 손으로 갚을 거예요.\n' +
      ' …막지 말아 주세요."\n' +
      '늘 단정하던 아이의 눈에 처음 보는 서슬이 섰다.',
    insightHints: {
      3: '천화가 가문의 한을 제 손으로 갚으려 한다.',
      4: '천화는 사부에게 청하면 막힐 것을 알고 일을 숨겼다.',
      5: '천화는 그자들을 벌하려는 게 아니라, 똑같은 고통으로 되갚을 작정이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"한을 독으로 갚으러 가는 길은, 사부가 산문을 닫아서라도 막는다." 보따리를 거두고 한동안 산을 내려가지 못하게 한다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -3,
          noteAppend: '발이 묶였다 — 갚을 길을 사부가 끊었다고 원망한다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"그 보따리를 내려놓고, 한 계절 홀로 들어앉아 갚음과 다스림의 결을 가려라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '천화를 붙들어 앉히고, 그 한을 사부가 함께 짊어지마 약속한다. 그자들의 죄는 정파의 이름으로 묻겠다고.',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -6,
          personalityShift: { integrity: 8, mercy: 6 },
          noteAppend: '혼자 지던 한을 사부가 나눠 들었다 — 눈의 서슬이 누그러졌다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(말리지 않는다. 못다 갚은 한이려니, 천화가 산문을 나서도록 둔다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 6,
          darknessLevelBump: 1,
          noteAppend: '사부조차 막지 않은 밤, 천화는 약독 보따리를 안고 산을 내려갔다.',
        },
        master: { hiddenFlag: 'master_overlooks_sacheonhwa_venom' },
        atmosphere: { righteousnessDelta: -3, unityDelta: -2 },
      },
    ],
  },
];
