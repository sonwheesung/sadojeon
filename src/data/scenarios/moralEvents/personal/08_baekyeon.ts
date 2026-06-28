// 도덕 이벤트 — 백연 개인 풀. docs/disciples/08 · docs/48
//
// 백연은 도가 평정·야망 최저 → 흑화 창 없음(darknessLevelBump 금지, Risk는 ±1 미세값만).
// 갈등은 흑화가 아니라 "평정 상실·무위의 약함"의 결:
//   ① 살리는 손으로 베야 하는 자리에서의 망설임(도가 살계 금기 vs 강호 현실),
//   ② 아버지 병환에 평정이 흔들려 맡은 자리를 놓음(neglect),
//   ③ 무위를 방패 삼아 공동 수련에서 비켜서는 과도한 자기절제·회피(defiance).
// 사부의 4선택이 백연을 다시 흐름 안으로 부르거나, 외딴 무위로 굳게 한다.

import type { MoralEventTemplate } from '@/types';

export const BAEKYEON_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 살계 망설임 — 실전기, 살리는 손으로 벨 수 없다는 회피
  {
    id: 'p-baek-noblade',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'baek-yeon',
      minYearInSect: 5,
    },
    scenario:
      '의뢰에서 돌아온 동문이 분을 누르며 사부 앞에 고했다.\n' +
      '"적이 칼을 들이대는 자리였습니다. 백연의 한 수면 끝낼 수 있었는데…\n' +
      ' 끝내 손을 거두더군요. \'살리는 손으로 사람을 벨 수는 없다\'면서.\n' +
      ' 덕에 제가 옆구리를 베였습니다. 이건 자비가 아니라 회피입니다, 사부님."\n' +
      '백연은 묵묵히 고개를 숙인다. "… 제 손이, 떨렸습니다."',
    insightHints: {
      3: '백연이 사람을 베는 일 앞에서 흔들린다.',
      4: '백연은 자기 손이 누군가를 해칠까 봐 더 두려워한다.',
      5: '백연은 도와 강호의 현실 사이에서 제 자리를 잃을까 외로워한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문을 위태롭게 둔 망설임은 자비가 아니다." 한 계절 의뢰를 거두고 다시 검을 잡게 한다.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -1,
          noteAppend: '사부가 망설임을 회피라 짚었다 — 백연은 더 깊이 입을 다물었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 살리는 것과 지키는 것의 자리를 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '백연을 부른다. 떨린 손을 가만히 짚고, 벤 뒤를 네 의술로 책임지면 된다고 일러준다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -1,
          personalityShift: { integrity: 5, mercy: 3, prudence: 4 },
          noteAppend: '사부가 망설임을 들어주었다 — 지키는 마음과 살리는 마음이 한 결로 모였다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 들은 척한다. 도가의 일은 도가의 결로 두라 한다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '"사부도 내 무위를 인정한다." 백연은 강호의 자리에서 한 걸음 더 물러섰다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            noteAppend: '옆구리를 베인 동문이 백연에게서 등을 돌렸다.',
          },
        ],
      },
    ],
  },

  // 2. 아버지 병환 — 평정이 흔들려 맡은 자리를 놓음
  {
    id: 'p-baek-father',
    tier: 'personal',
    category: 'neglect',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'baek-yeon',
      minYearInSect: 6,
    },
    scenario:
      '며칠째 백연의 자리가 비어 있다.\n' +
      '아버지가 병으로 자리에 누웠다는 서신이 닿은 뒤부터다.\n' +
      '"… 약을 달여야 하는데, 손이 자꾸 멈춰요. 다친 동문이 의무실에서\n' +
      ' 기다리는 걸 알면서도, 발이 떨어지질 않습니다." 흰 연꽃이 처음으로 시들어 있다.\n' +
      '그 사이 손길을 받지 못한 동문의 상처가 덧나고 있었다.',
    insightHints: {
      3: '백연이 아버지 걱정에 마음을 다잡지 못한다.',
      4: '늘 남을 돌보던 백연이 정작 제 슬픔은 어디에도 두지 못한다.',
      5: '백연은 평정을 잃은 자신을 부끄러워하며 홀로 견디려 한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"마음이 어지러워도 맡은 자리를 비우는 것은 사문의 일을 저버리는 것이다." 의무를 다시 지운다.',
        perpetrator: {
          trustDelta: -3,
          darknessRiskBump: -1,
          noteAppend: '사부가 슬픔을 헤아리지 못했다 — 백연은 마음을 더 깊이 감췄다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"사흘만 모든 일을 내려놓고, 마음부터 가라앉혀라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '곁에 앉아 함께 약을 달인다. 아버지를 향한 마음을 들어주고, 다녀올 수 있게 길을 열어준다.',
        perpetrator: {
          trustDelta: 8,
          darknessRiskBump: -1,
          personalityShift: { warmth: 6, prudence: 4 },
          noteAppend: '사부가 슬픔의 자리를 마련해 주었다 — 흔들리던 평정이 다시 가라앉았다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(모른 척 둔다. 마음이 가라앉으면 제자리로 오겠거니 한다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 1,
          noteAppend: '아무도 곁을 묻지 않았다 — 백연은 홀로 무너지는 마음을 감췄다.',
        },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
        cascade: [
          {
            kind: 'distance',
            noteAppend: '손길을 받지 못한 동문이 의무실에서 등을 돌렸다.',
          },
        ],
      },
    ],
  },

  // 3. 무위로 비켜서기 — 공동 수련 회피, 과도한 자기절제
  {
    id: 'p-baek-wuwei',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'baek-yeon',
      minYearInSect: 3,
    },
    scenario:
      '사문 공동 수련이 있는 날, 백연의 자리가 또 비었다.\n' +
      '연무장 대신 뒷산 바위에 홀로 앉아 명상에만 잠겨 있다.\n' +
      '"다투는 법을 익히는 자리에… 저는 끼지 않으려 합니다.\n' +
      ' 도는 다투지 않는 데 있다고 배웠어요. 손에 힘을 주는 일이 두렵습니다."\n' +
      '단정한 말이지만, 동문들과 함께 땀 흘리는 자리에서 자꾸 비켜서고 있다.',
    insightHints: {
      3: '백연이 다투는 일을 한사코 피하려 한다.',
      4: '백연은 힘을 앞세우는 것 자체가 도(道)의 결을 흐린다고 믿는다.',
      5: '백연은 무위를 방패 삼아 강호의 현실에서 자꾸 물러서며 홀로 외로워진다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"홀로 비켜서는 것은 도가 아니라 도피다. 연무장으로 돌아오라." 공동 수련을 다시 지운다.',
        perpetrator: {
          trustDelta: -3,
          darknessRiskBump: -1,
          noteAppend: '사부가 무위를 도피라 짚었다 — 백연은 말없이 연무장으로 돌아갔다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관하며, 비켜서는 마음의 뿌리를 끝까지 들여다보라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -1 },
        atmosphere: { unityDelta: -1 },
      },
      {
        tone: 'admonish',
        label: '백연 곁에 앉는다. 무위는 회피가 아니라 흐름이며, 동문과 함께 서는 것도 도임을 일러준다.',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -1,
          personalityShift: { integrity: 5, warmth: 4, prudence: 3 },
          noteAppend: '사부의 말에 백연이 다시 연무장으로 발을 들였다 — 무위가 흐름으로 풀렸다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(홀로 두게 둔다. 도가의 결은 도가의 것이라며 묻지 않는다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '백연은 점점 더 동문에게서 비켜섰다 — 무위가 외딴 섬이 되어 갔다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -3 },
        cascade: [
          {
            kind: 'distance',
            noteAppend: '함께 서지 않는 백연에게서 동문들이 한 걸음씩 멀어졌다.',
          },
        ],
      },
    ],
  },
];
