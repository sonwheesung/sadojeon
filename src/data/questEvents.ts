// 의뢰 중 돌발 이벤트 풀 — docs/28 §7. 도메인·등급에 맞는 것만 발동(마을 청소에 기관 X).
// 서신함 강제 선택. 스탯 기반 확률 판정(전투→무공, 치료→의술…) — 능력 낮아도 시도는 되되 성공률↓.
// 자원(자금) 게이트만 하드(비활성). 그레이박스 수치.

import type { QuestEvent, QuestGrade } from '@/types';

// 등급별 이벤트 발동 확률 — 위험할수록 ↑. 잡일은 0(밋밋한 일엔 사건 X).
export const QUEST_EVENT_CHANCE: Record<QuestGrade, number> = {
  menial: 0,
  minor: 0.2,
  normal: 0.4,
  dangerous: 0.6,
  extreme: 0.8,
};

export const QUEST_EVENTS: readonly QuestEvent[] = [
  {
    id: 'qe-dying-stranger',
    domains: ['guard', 'medicine', 'grand'],
    minGrade: 'minor',
    weight: 10,
    prompt: '길에서 치명상을 입은 낯선 이를 만났다. 행색만으론 정체를 알 수 없다 — 손쓰지 않으면 곧 숨이 끊긴다.',
    choices: [
      {
        key: 'heal-skill',
        label: '의술로 직접 살린다',
        roll: { by: 'medicine', base: 0.2 },
        effect: { revealRescue: true, persona: { mercy: 3 }, resultText: '능숙한 손길로 그를 살려냈다.' },
        failEffect: { persona: { mercy: 1 }, stressDelta: 8, resultText: '손을 다 썼지만 끝내 숨이 끊겼다.' },
      },
      {
        key: 'heal-elixir',
        label: '영약을 써서 살린다 (자금)',
        require: { money: 20 },
        effect: { revealRescue: true, persona: { mercy: 2 }, resultText: '영약으로 목숨을 건졌다.' },
      },
      {
        key: 'heal-village',
        label: '마을에 도움을 청한다',
        roll: { by: 'medicine', base: 0.4 },
        effect: { successDelta: -0.08, revealRescue: true, persona: { mercy: 1 }, resultText: '시간은 끌렸지만 살려냈다.' },
        failEffect: { stressDelta: 6, resultText: '도움이 닿기엔 늦었다.' },
      },
      {
        key: 'ignore',
        label: '외면하고 임무를 간다',
        effect: { persona: { mercy: -4 }, stressDelta: 18, resultText: '등 뒤의 신음을 끝내 외면했다.' },
      },
    ],
  },
  {
    id: 'qe-sapa-raid',
    domains: ['guard', 'duel', 'scout', 'grand'],
    minGrade: 'normal',
    weight: 9,
    prompt: '지나는 마을이 사파 무리에게 짓밟히고 있다. 비명이 들린다.',
    choices: [
      {
        key: 'fight',
        label: '맞서 싸워 막는다',
        roll: { by: 'martial', base: 0.2 },
        effect: { rewardFlag: 'noble', persona: { integrity: 3, mercy: 2 }, resultText: '사파를 몰아내고 마을을 지켰다.' },
        failEffect: { riskDelta: 0.2, persona: { mercy: 1 }, resultText: '중과부적, 간신히 몸만 뺐다.' },
      },
      {
        key: 'help-careful',
        label: '신중히 사람만 구한다',
        roll: { by: 'martial', base: 0.45 },
        effect: { persona: { mercy: 2 }, resultText: '사람들을 빼냈다.' },
        failEffect: { riskDelta: 0.1, resultText: '몇은 끝내 구하지 못했다.' },
      },
      {
        key: 'pass',
        label: '임무를 우선해 지나친다',
        effect: { persona: { mercy: -3 }, stressDelta: 12, resultText: '비명을 뒤로하고 길을 갔다.' },
      },
    ],
  },
  {
    id: 'qe-ambush',
    domains: ['guard', 'duel', 'scout', 'grand', 'assassin'],
    minGrade: 'normal',
    weight: 7,
    prompt: '좁은 길목에 매복이 깔렸다.',
    choices: [
      { key: 'breakthrough', label: '정면 돌파한다', roll: { by: 'martial', base: 0.35 }, effect: { successDelta: 0.05, resultText: '뚫고 나갔다.' }, failEffect: { riskDelta: 0.1, resultText: '난전 끝에 상처를 입었다.' } },
      { key: 'detour', label: '우회한다', roll: { by: 'scouting', base: 0.4 }, effect: { successDelta: -0.05, resultText: '길을 돌아 피했다.' }, failEffect: { riskDelta: 0.05, resultText: '돌아가다 발각됐다.' } },
      { key: 'bribe', label: '돈으로 길을 산다', require: { money: 10 }, effect: { rewardMult: 0.9, resultText: '값을 치르고 지났다.' } },
    ],
  },
  {
    id: 'qe-trap',
    domains: ['scout', 'grand'],
    minGrade: 'dangerous',
    weight: 8,
    prompt: '앞을 기관(陣)이 막았다. 더 깊이 들어가면 위험하나, 그만큼 얻을 것도 크다.',
    choices: [
      { key: 'formation', label: '진법을 읽어 돌파한다', roll: { by: 'formation', base: 0.15 }, effect: { rewardMult: 1.3, successDelta: 0.1, resultText: '기관을 간파해 안전히 지났다.' }, failEffect: { riskDelta: 0.15, resultText: '기관을 잘못 짚어 위험에 빠졌다.' } },
      { key: 'evade', label: '몸놀림으로 피한다', roll: { by: 'martial', base: 0.3 }, effect: { rewardMult: 1.15, resultText: '아슬하게 피해 나아갔다.' }, failEffect: { riskDelta: 0.2, resultText: '기관에 걸려 크게 다쳤다.' } },
      { key: 'reckless', label: '무작정 들어간다', effect: { rewardMult: 1.3, riskDelta: 0.28, resultText: '운에 맡기고 뛰어들었다.' } },
      { key: 'retreat', label: '돌아 나온다', effect: { resultText: '무리하지 않고 물러섰다.' } },
    ],
  },
  {
    id: 'qe-detected',
    domains: ['scout', 'assassin'],
    minGrade: 'normal',
    weight: 7,
    prompt: '발각되기 직전이다.',
    choices: [
      { key: 'hide', label: '숨죽여 은신한다', roll: { by: 'scouting', base: 0.3 }, effect: { successDelta: 0.1, resultText: '그림자에 몸을 숨겼다.' }, failEffect: { riskDelta: 0.1, resultText: '들켜 쫓겼다.' } },
      { key: 'smoke', label: '연막을 치고 도주한다', roll: { by: 'martial', base: 0.4 }, effect: { resultText: '연막 속으로 사라졌다.' }, failEffect: { riskDelta: 0.1, resultText: '도주 중 부상을 입었다.' } },
      { key: 'force', label: '정면 돌파한다', roll: { by: 'martial', base: 0.3 }, effect: { successDelta: 0.05, resultText: '베고 빠져나왔다.' }, failEffect: { riskDelta: 0.1, resultText: '에워싸여 상처를 입었다.' } },
    ],
  },
  {
    id: 'qe-surrender',
    domains: ['duel', 'grand'],
    minGrade: 'dangerous',
    weight: 6,
    prompt: '쓰러진 적이 목숨을 구걸한다.',
    choices: [
      { key: 'spare', label: '살려 보낸다', effect: { persona: { mercy: 3, integrity: 1 }, rewardMult: 0.95, resultText: '칼을 거두었다.' } },
      { key: 'kill', label: '베어 화근을 없앤다', effect: { persona: { mercy: -3 }, successDelta: 0.05, resultText: '뒤를 남기지 않았다.' } },
    ],
  },
  {
    id: 'qe-innocent-target',
    domains: ['assassin'],
    minGrade: 'normal',
    weight: 9,
    prompt: '표적이 알고 보니 죄 없는 자였다.',
    choices: [
      { key: 'proceed', label: '그래도 처리한다', effect: { persona: { mercy: -5 }, resultText: '청부는 청부다. 손을 더럽혔다.' } },
      { key: 'refuse', label: '거부하고 돌아온다', effect: { successDelta: -1, persona: { mercy: 4, integrity: 2 }, resultText: '칼을 거두니 의뢰인이 등을 돌렸다.' } },
    ],
  },
  {
    id: 'qe-plague',
    domains: ['medicine'],
    minGrade: 'normal',
    weight: 7,
    prompt: '역병이 도는 마을. 치료하려면 자신도 감염을 무릅써야 한다.',
    choices: [
      { key: 'treat', label: '위험을 무릅쓰고 치료한다', roll: { by: 'medicine', base: 0.25 }, effect: { persona: { mercy: 3 }, resultText: '마을을 역병에서 구했다.' }, failEffect: { riskDelta: 0.15, persona: { mercy: 1 }, resultText: '역병을 막지 못하고 자신도 앓았다.' } },
      { key: 'distance', label: '거리를 둔다', effect: { persona: { mercy: -2 }, stressDelta: 8, resultText: '돌아서는 발이 무거웠다.' } },
    ],
  },
  {
    id: 'qe-shortcut',
    domains: ['guard'],
    minGrade: 'normal',
    weight: 6,
    prompt: '호위 대상이 위험한 지름길을 고집한다.',
    choices: [
      { key: 'follow', label: '뜻을 따른다', effect: { rewardMult: 1.2, riskDelta: 0.1, resultText: '지름길로 들었다.' } },
      { key: 'safe', label: '안전한 길을 고집한다', effect: { successDelta: -0.05, persona: { prudence: 1 }, resultText: '돌아가더라도 안전을 택했다.' } },
    ],
  },
  {
    id: 'qe-wounded-ally',
    domains: ['guard', 'duel', 'scout', 'grand'],
    minGrade: 'dangerous',
    weight: 6,
    prompt: '동행이 크게 다쳤다. 임무는 아직 끝나지 않았다.',
    choices: [
      { key: 'treat', label: '멈춰 치료한다', roll: { by: 'medicine', base: 0.4 }, effect: { successDelta: -0.05, persona: { warmth: 2 }, resultText: '상처를 다스려 데리고 갔다.' }, failEffect: { riskDelta: 0.05, resultText: '치료가 어설퍼 상처가 덧났다.' } },
      { key: 'carry', label: '업고 강행한다', roll: { by: 'guarding', base: 0.4 }, effect: { riskDelta: 0.05, persona: { warmth: 1 }, resultText: '들쳐업고 임무를 마쳤다.' }, failEffect: { riskDelta: 0.1, resultText: '무리하다 둘 다 위태로웠다.' } },
      { key: 'leave', label: '두고 임무를 마친다', effect: { persona: { mercy: -3, warmth: -2 }, stressDelta: 15, resultText: '동문을 두고 길을 갔다.' } },
    ],
  },
] as const;
