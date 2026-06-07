// 초반(형성기) 이벤트 — 입문 1~3년차, 어린 또래 2~4명이 모였을 때.
// docs/07 3-Tier(공통·유형·개인) 위에 maxYearInSect 로 "초반" 시기를 얹는다.
// 결: 흑화 0, 저위험, 형성적. 사건이 아니라 "아이를 빚는" 단계.
// 톤: 엄벌·폐관은 아이에 과하다 — 4선택 라벨은 부드러운 결(다독임/타이름/엄히/눈감음)로
//      사부(사용자)가 작성. tone 슬롯(punish/seclusion/admonish/overlook)은 효과 부호 기준.
//
// ⚠ choices 는 사용자가 채운다. 비어 있는 동안은 passesTrigger 가드가 자동 스킵하므로
//    게임에 뜨지 않는다(미완성 이벤트로 인한 빈 모달 방지).

import type { MoralEventTemplate } from '@/types';

export const EARLY_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 꾀병 — 성실한 아이는 제외(forbid integrity>50). 게으른 결의 아이가 수련을 회피.
  {
    id: 'early-feign-sick',
    tier: 'archetype',
    category: 'idleness',
    trigger: { weight: 9, maxYearInSect: 3, forbidPersonality: { integrity: 50 } },
    scenario:
      '아침 수련 시간, {name}이 배를 움켜쥐고 이불 속에서 나오지 않는다.\n' +
      '"배가… 너무 아파요. 오늘은 도저히…"\n' +
      '허나 어젯밤 마당에서 팔짝팔짝 뛰놀던 모습을 다른 아이가 보았다.',
    insightHints: {
      3: '{name}은 수련이 버거워 핑계를 찾았다.',
      4: '{name}은 아픈 게 아니라, 안 되는 걸 들키기가 무섭다.',
    },
    choices: [], // TODO(사용자): 4선택 — 다독임/타이름/엄히/눈감음
  },

  // ── 고자질 3종 — 같은 "일러바치기"라도 심리가 다르다. 각 축 단독 게이트.
  //    {sibling} = 일러바침 당한 동문(엔진이 채움).

  // 2-A. 배신형 — 의리 낮은(=자유 높은) 아이(require freedom≥50). 같이 어울리다가 제 자리만 챙겨 동문을 판다.
  {
    id: 'early-tattle-betray',
    tier: 'archetype',
    category: 'tattle',
    trigger: { weight: 7, maxYearInSect: 3, requirePersonality: { freedom: 50 } },
    scenario:
      '조금 전까지 {sibling}과 어울려 마당을 뛰놀던 {name}이, 사부가 들어서자 쪼르르 달려왔다.\n' +
      '"사부님, {sibling}이 아까 수련을 빼먹고 놀았어요. 저는 시키는 대로 했고요."\n' +
      '방금 저도 함께 놀던 일은 쏙 빼놓은 채, 사부의 눈치를 살핀다.',
    insightHints: {
      3: '{name}은 동문보다 제 자리를 지키는 게 먼저다.',
      4: '{name}에게 의리란 아직 익히지 못한 말이다.',
    },
    choices: [], // TODO(사용자): 4선택
  },

  // 2-B. 냉담형 — 공감 낮은 아이(forbid mercy>50). 동문이 곤란한데 사정 헤아림 없이 사실대로 고한다.
  {
    id: 'early-tattle-cold',
    tier: 'archetype',
    category: 'tattle',
    trigger: { weight: 7, maxYearInSect: 3, forbidPersonality: { mercy: 50 } },
    scenario:
      '{sibling}이 깨진 항아리 앞에서 어쩔 줄 몰라 발을 동동 구르고 있을 때,\n' +
      '{name}은 곁에서 가만히 지켜보다 사부에게 곧장 걸어왔다.\n' +
      '"{sibling}이 항아리를 깼어요. 제가 봤어요." 친구의 곤란함에는 눈 하나 깜짝 않는다.',
    insightHints: {
      3: '{name}은 사실을 말했을 뿐이라 여긴다.',
      4: '{name}은 동문이 곤란해하는 마음까지는 아직 닿지 못한다.',
    },
    choices: [], // TODO(사용자): 4선택
  },

  // 2-C. 과시형 — 자존 높은 아이(require ambition>50). 묻지도 않았는데 잘잘못을 읊으며 제 행실을 돋보이려 한다.
  {
    id: 'early-tattle-show',
    tier: 'archetype',
    category: 'tattle',
    trigger: { weight: 7, maxYearInSect: 3, requirePersonality: { ambition: 50 } },
    scenario:
      '묻지도 않았는데 {name}이 사부 앞에 서서 또박또박 고한다.\n' +
      '"{sibling}은 늦잠을 잤고, 누구는 청소를 빼먹었어요. 저는 다 지켰고요."\n' +
      '동문들의 잘잘못을 줄줄이 읊으며, 제 바른 행실이 돋보이길 바라는 눈빛이다.',
    insightHints: {
      3: '{name}은 사부에게 인정받고 싶어 한다.',
      4: '{name}은 남을 낮춰야 제가 높아진다고 느낀다.',
    },
    choices: [], // TODO(사용자): 4선택
  },
];
