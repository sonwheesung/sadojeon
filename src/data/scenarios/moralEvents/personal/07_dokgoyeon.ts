// 도덕적 갈등 이벤트 — 독고연 개인 풀 (personal tier).
// docs/disciples/07_독고연.md · backstoryKey: dokgo-clan-fall.
//
// 독고연은 정의감 ★★★★ — 평범한 갈취/폭력은 거의 안 함.
// 대신 가문 복수를 위해 어두운 결로 손을 뻗을 위험이 있음.
// 사부의 4선택이 "복수의 검 vs 정의의 검" 분기를 가속/감속.

import type { MoralEventTemplate } from '@/types';

export const DOKGOYEON_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 강무열의 짐 뒤지기 — 강무열 영입 시에만 발화
  {
    id: 'p-dokgo-search-gang',
    tier: 'personal',
    category: 'theft',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'dokgo-yeon',
      requireSiblingId: 'gang-muyeol',
      minYearInSect: 2,
    },
    scenario:
      '간밤에 강무열의 짐이 누군가의 손에 풀려 있었다.\n' +
      '훔쳐간 것은 없었다. 다만 가문 인장패가 침소 한가운데 정중히 놓여 있었다.\n' +
      '독고연의 침소 한구석에서, 같은 모양의 옥패 절반이 놓인 것을 사부는 보았다.\n' +
      '— 둘은 한 쌍의 그림자다.',
    insightHints: {
      3: '독고연이 강무열의 가문을 의심하고 있다.',
      4: '독고연의 6세 기억이 강씨 무관으로 흘러가고 있다.',
      5: '독고연 어머니의 옥패. 잃은 절반은 강씨 가문에 있을지도 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"동문의 짐에 손을 대는 것은 사문의 큰 죄다." 한 계절 무공 정지.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          noteAppend: '사부가 가문 의심을 짚지 못했다 — 마음이 더 무거워졌다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
        cascade: [
          {
            kind: 'shaken',
            triggerCondition: { relation: 'enemy' },
            noteAppend: '강무열도 동문의 차가운 눈빛에 이유를 묻기 시작했다.',
          },
        ],
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 가문의 결과 사문의 결을 짚어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '독고연을 부른다. "무엇을 찾고 있느냐. 내게 와서 말해라." 가문 사연을 들어준다.',
        perpetrator: {
          trustDelta: 5,
          darknessRiskBump: -5,
          personalityShift: { freedom: -6, mercy: 4 },
          noteAppend: '사부가 가문 사연을 들어주었다 — 복수의 무게가 한 결 풀렸다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(아무 말 하지 않는다. 강무열에게는 짐을 정리하라 일렀을 뿐.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 6,
          noteAppend: '사부가 가문 사연을 보지 못한다 — 복수의 결이 짙어졌다.',
        },
        master: { hiddenFlag: 'master_overlooks_dokgo_revenge' },
        atmosphere: { righteousnessDelta: -2, unityDelta: -2 },
      },
    ],
  },

  // 2. 마을에서 강씨 무관 소문 캐기 — 본인 단독으로도 발화 가능
  {
    id: 'p-dokgo-market-press',
    tier: 'personal',
    category: 'extortion',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'dokgo-yeon',
      minYearInSect: 3,
    },
    scenario:
      '마을 다방 주인이 떨리는 목소리로 사문을 찾아왔다.\n' +
      '"독고연이… 강씨 무관에 대해 아는 이를 데려오라며\n' +
      ' 손님 한 분의 옷자락을 잡고 놓아주지 않았습니다."\n' +
      '주인은 독고연이 손에 검을 쥐고 있지는 않았다 덧붙였다.',
    insightHints: {
      3: '독고연이 마을 사람에게까지 가문 정보를 캐고 있다.',
      4: '독고연의 결이 사람을 함부로 다루는 길에 발을 들였다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"마을 사람에게 손을 댄 것은 가문의 명예를 잃은 일이다." 산문 앞 공개 책망.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -3,
          personalityShift: { ambition: -4 },
          noteAppend: '가문의 명예를 들먹인 사부의 한 마디에 깊이 흔들렸다.',
        },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 복수와 정의의 결을 다시 짚어라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '독고연과 함께 마을에 내려가 다방 주인 앞에 사과한 뒤,\n' +
          '돌아오는 길에 흑사파 정보 한 줄을 직접 짚어준다.',
        perpetrator: {
          trustDelta: 5,
          darknessRiskBump: -4,
          personalityShift: { freedom: -6 },
          noteAppend: '사부가 함께 사과하고 정보를 짚어주었다.',
        },
        master: { insightDelta: 2, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 1, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(다방 주인에게 동전 한 줌만 쥐어 보낸다. 독고연에게는 묻지 않는다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 5,
          noteAppend: '"가문 일에 사부는 관심이 없다." 결의 어둠이 한 결 짙어졌다.',
        },
        master: { hiddenFlag: 'master_overlooks_dokgo_revenge', reputationDelta: -1 },
        atmosphere: { righteousnessDelta: -2 },
      },
    ],
  },

  // 3. 금기(사파) 비급 탐닉 — 가문 복수에 도움 되는 결을 찾다 사파로
  {
    id: 'p-dokgo-occult',
    tier: 'personal',
    category: 'occult',
    trigger: {
      weight: 3,
      onlyForDiscipleId: 'dokgo-yeon',
      minYearInSect: 4,
    },
    scenario:
      '독고연이 서고 깊은 칸의 비급 한 권을 펼쳐 들고 있는 것을 사부는 보았다.\n' +
      '"… 가문 복수에 결이 닿을지 보러 왔습니다." 손이 떨리지 않았다.\n' +
      '비급은 흑사파 검결 — 정도와 정면 충돌하는 살수 검의 한 갈래다.\n' +
      '— 가전 검법을 등지는 결의 발끝이다.',
    insightHints: {
      3: '독고연이 가문 복수를 위해 사파의 결도 받아들이려 한다.',
      4: '독고연의 정의감이 복수심에 한 발씩 밀려나고 있다.',
      5: '사파 검결을 한 번 익히면 가문의 검은 더 이상 그의 손에 머물지 않는다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"가전 검법을 잇겠다던 자가 사파의 결을 펼치느냐." 비급 압수 + 산문 청소 한 계절.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -5,
          noteAppend: '사부의 한 마디에 가전 검법의 결을 다시 짚었다.',
        },
        atmosphere: { righteousnessDelta: 3 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 가문의 검과 사파의 검 사이를 마음으로 가려라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -4 },
        atmosphere: { righteousnessDelta: 2 },
      },
      {
        tone: 'admonish',
        label: '"복수의 검은 어둠으로 간다. 정의의 검으로 가문을 일으켜라." — 가전 검법 복원을 함께 시작한다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -7,
          personalityShift: { freedom: -8, ambition: -4 },
          noteAppend: '사부가 가전 검법 복원을 직접 약속했다 — 결의 길이 다시 정의로 향했다.',
        },
        master: { insightDelta: 3, reputationDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(비급을 그 자리에 두고 나온다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 8,
          darknessLevelBump: 1,
          noteAppend: '복수의 검이 마음에 자리 잡았다 — 가전의 결과 멀어졌다.',
        },
        master: {
          hiddenFlag: 'master_overlooks_dokgo_revenge',
          reputationDelta: -2,
        },
        atmosphere: { righteousnessDelta: -4 },
      },
    ],
  },
];
