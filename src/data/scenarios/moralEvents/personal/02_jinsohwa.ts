// 도덕 이벤트 — 진소화 개인 풀. docs/disciples/02 · docs/48
//
// 진소화는 천성이 곱고 자비가 정점 — 흑화 창 없음(darknessLevelBump 미사용, risk는 0 근처 미세값만).
// 갈등은 흑화가 아니라 "그 아이다운 결"에서 난다:
//  · 사람 베는 살초 앞에서 손이 굳어 시키는 초식을 마다함(defiance)
//  · 제 일과·몸을 미뤄가며 앓는 이를 돌봄(neglect)
//  · 규율을 어겨가며 눈앞의 목숨을 먼저 살림(defiance)
// 사부가 모질게 외면하면 신뢰가 큰 폭으로 꺾인다(말없는 이별의 씨앗) — punish의 trustDelta를 깊게.

import type { MoralEventTemplate } from '@/types';

export const JINSOHWA_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 살초 거부 — 시키는 초식을 대놓고 마다함 (solo)
  {
    id: 'p-jin-stayblade',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'jin-sohwa',
      minYearInSect: 3,
    },
    scenario:
      '무공 사범이 사부를 찾아왔다.\n' +
      '"진소화에게 찌르기 살초를 몇 번이고 다시 시켰습니다.\n' +
      ' 헌데 그 아이는 짚인형 급소 앞에서 번번이 검을 내려놓습니다.\n' +
      ' \'이건 못 하겠어요\' — 다른 동문들 다 보는 앞에서 그리 말했습니다.\n' +
      ' 시키는 초식을 대놓고 마다하니, 그냥 두기 어렵습니다."',
    insightHints: {
      3: '진소화는 사람을 해치는 흉내조차 손이 굳는 아이다.',
      4: '엄히 다그칠수록 진소화는 입을 닫고 한 걸음씩 멀어진다.',
      5: '진소화는 검을 미워하는 게 아니라, 미워할 줄 모르는 손을 타고났다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사범의 영을 대놓고 거스르는 법이 어디 있느냐." 동문들 앞에서 호되게 나무란다.',
        perpetrator: {
          trustDelta: -6,
          darknessRiskBump: 0,
          noteAppend: '동문들 앞에서 크게 꾸중을 들은 뒤로, 진소화의 말수가 부쩍 줄었다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"사흘 면벽. 사범의 영을 어찌 받들지 스스로 헤아려라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: 0 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '진소화를 따로 불러, 어째서 손이 굳는지 그 까닭을 끝까지 들어준다.',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -1,
          personalityShift: { mercy: 6, warmth: 4 },
          noteAppend: '사부가 제 마음을 알아주었다 — 살리는 무공을 청하기 시작했다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다. 살초 하나쯤 빼먹은들 대수랴.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '아무도 짚어주지 않자, 진소화는 수련장 한구석으로 더 깊이 숨어들었다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
      },
    ],
  },

  // 2. 밤샘 병간 — 제 일과·몸을 미뤄가며 앓는 동문을 돌봄 (solo)
  {
    id: 'p-jin-vigil',
    tier: 'personal',
    category: 'neglect',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'jin-sohwa',
      minYearInSect: 5,
    },
    scenario:
      '며칠째 진소화의 아침 수련 자리가 비어 있다.\n' +
      '알고 보니 밤마다 앓아누운 동문 곁을 지키느라 제 일과며 잠을 통째로 미뤄둔 탓이다.\n' +
      '볼이 핼쑥해진 채로 사부 앞에 선다.\n' +
      '"제 일을 미룬 건 잘못이에요. 그래도… 그 애가 밤새 끙끙 앓는데, 어떻게 두고 자요."',
    insightHints: {
      3: '진소화는 제 몸이 상하는 줄도 모르고 남부터 돌본다.',
      4: '말리지 않으면 진소화가 먼저 앓아누울 결이다.',
      5: '누군가 아파 누운 걸 두고는, 진소화는 잠도 밥도 넘기지 못하는 아이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"제 일과부터 저버리는 돌봄이 어디 있느냐." 며칠 병간을 금하고 일과로 돌려보낸다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: 0,
          noteAppend: '곁을 지키지 못하게 막히자, 진소화는 말없이 고개를 떨궜다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"사흘 네 처소에서 쉬어라. 네가 추슬러야 남도 돌본다." 잠시 손을 떼게 한다.',
        perpetrator: { trustDelta: -2, darknessRiskBump: 0 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"네 마음이 옳다. 다만 네가 쓰러지면 그 애를 누가 보겠느냐." 병간과 쉬는 때를 함께 정해준다.',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -1,
          personalityShift: { prudence: 6, mercy: 4 },
          noteAppend: '사부가 돌봄의 결을 함께 짚어주었다 — 제 몸도 아끼기 시작했다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(내버려 둔다. 알아서 하겠거니 한다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 1,
          noteAppend: '아무도 말리지 않자, 진소화는 끝내 제가 먼저 앓아누웠다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
      },
    ],
  },

  // 3. 비축 단약 — 규율을 어겨가며 장철을 살림 (requireSiblingId: jang-cheol)
  {
    id: 'p-jin-spentdan',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'jin-sohwa',
      requireSiblingId: 'jang-cheol',
      minYearInSect: 6,
    },
    scenario:
      '사문 약장의 귀한 단약 칸이 텅 비어 있었다.\n' +
      '급할 때를 대비해 사부가 따로 일러 갈무리해 둔 것이었다.\n' +
      '진소화가 먼저 와 고개를 숙인다.\n' +
      '"동문 장철이 의뢰에서 크게 다쳐 왔어요. 상처가 깊어 그 약을 다 썼어요.\n' +
      ' 여쭙고 쓰는 게 도리인 줄 알면서도… 그 밤엔 도무지 손이 먼저 나갔어요."',
    insightHints: {
      3: '진소화는 규율보다 눈앞의 목숨을 먼저 본다.',
      4: '진소화에게 장철은 어린 시절을 함께 건너온 단 하나의 고향이다.',
      5: '벌을 주든 말든, 진소화는 사람이 죽어가는 걸 두고는 같은 손을 또 쓸 것이다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문의 비축에 함부로 손대는 것은 큰 죄다." 한 계절 약장 출입을 금한다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: 0,
          noteAppend: '약장에서 멀어진 진소화는, 다친 동문을 볼 때마다 입술을 깨물었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"보름 면벽. 규율과 측은지심의 자리를 스스로 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: 0 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"사람을 먼저 살린 손을 어찌 탓하랴. 다만 다음엔 한밤이라도 나를 깨워라." 비축 채울 길을 함께 의논한다.',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -1,
          personalityShift: { mercy: 6, prudence: 4 },
          noteAppend: '사부가 살린 손을 알아주었다 — 다음엔 먼저 알리겠노라 다짐했다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 4 },
        cascade: [
          {
            kind: 'admire',
            triggerCondition: { relation: 'friend' },
            trustDelta: 2,
            noteAppend: '장철이 제 목숨을 구한 진소화를 말없이 더 깊이 의지하게 됐다.',
          },
        ],
      },
      {
        tone: 'overlook',
        label: '(약장은 다시 채우면 그만이라며 덮어둔다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '아무 말도 없자, 진소화는 규율과 제 마음 사이에서 점점 제멋대로가 되어갔다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -1 },
      },
    ],
  },
];
