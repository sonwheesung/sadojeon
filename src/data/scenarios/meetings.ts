// 면담 풀 — docs/12. 제자가 사부에게 꺼내는 깊은 대화. 상황 조건(when) 충족 시에만 발동.
// 작성 원칙(feedback_disciple_dialogue_writing): 명확한 want·실제 이름({rival})·나이대 말투·숨은변수 간접.
// 효과: 선택마다 인격 6축·신뢰·흑화·노선(정/사)이 다르게 갈린다("격려가 늘 정답" 아님).
//
// 조건·컨텍스트·치환은 oneLiners 의 것을 그대로 재사용(matchesCondition·OneLinerCtx·fillOneLinerBody).

import { random } from '@/systems/rng';
import type { PersonalityTraits } from '@/types';
import {
  fillOneLinerBody,
  matchesCondition,
  type OneLinerCondition,
  type OneLinerCtx,
} from './oneLiners';
import { GENERATED_MEETINGS } from './meetingsGenerated';
import { JIN_BAEKHO_MEETINGS } from './meetingsJinBaekho';
import { SA_CHEONHWA_MEETINGS } from './meetingsSaCheonhwa';

export type MeetingBand = 'child' | 'growth' | 'turmoil' | 'departure';

export const MEETING_BAND_LABEL: Record<MeetingBand, string> = {
  child: '동심기',
  growth: '성장기',
  turmoil: '격동기',
  departure: '출도전기',
};

export interface MeetingEffect {
  persona?: Partial<Record<keyof PersonalityTraits, number>>; // 인격 6축 델타
  trust?: number; // 사부 신뢰 델타
  darkness?: number; // 흑화 단계 델타(정수, 보통 ±1)
  righteousness?: number; // 노선(+정파/−사파) — 사문분위기·평판 연동
}

export interface MeetingOption {
  key: string;
  label: string; // 사부 응답 대사(톤 라벨 노출 X)
  effects: MeetingEffect;
}

export interface MeetingTemplate {
  id: string;
  band: MeetingBand;
  disciple?: string; // 특정 제자 전용(poolId, 예: 'jang-cheol'). 없으면 누구에게나(범용)
  when?: OneLinerCondition; // 나이대(ageMin/Max) + 상태 조건. 없으면 언제든
  body: string; // 제자가 꺼내는 말 ({rival} 치환 가능)
  options: MeetingOption[]; // 2~4
}

// ─── 예시 풀(워크플로 대량 생성의 스타일 가이드) ─────────────────────────────
export const MEETINGS: MeetingTemplate[] = [
  // 동문 상실 애도 — 동문이 의뢰에서 죽은 뒤(mourning). picker 는 when 만 보므로 band 무관. docs/12.
  {
    id: 'm-grief-loss',
    band: 'turmoil',
    when: { mourning: true },
    body: '사부님... 그 동문이 떠난 뒤로, 자꾸 그 빈자리가 눈에 밟힙니다. 제가 더 강했다면, 막을 수 있었을까요.',
    options: [
      { key: 'mourn', label: '슬퍼해도 된다. 떠난 이를 함께 보내주는 것도 산 자의 몫이다.', effects: { persona: { warmth: 4, mercy: 3 }, trust: 5 } },
      { key: 'resolve', label: '그 마음을 잊지 말고, 다음엔 지켜낼 힘으로 벼리거라.', effects: { persona: { integrity: 4, ambition: 2 }, trust: 3 } },
      { key: 'notyourfault', label: '네 탓이 아니다. 강호의 길엔 늘 그런 밤이 있는 법이다.', effects: { persona: { mercy: 3, prudence: 2 }, trust: 4 } },
      { key: 'steel', label: '무인이라면 죽음에도 무뎌져야 한다. 어서 마음을 다잡거라.', effects: { persona: { integrity: 3, warmth: -3 }, trust: -2 } },
    ],
  },
  // 동문 경사 — 질투(동문이 경지를 올림, 뒤처진 라이벌). picker 는 when 만 봄. docs/12.
  {
    id: 'm-sibling-rise',
    band: 'growth',
    when: { siblingEvent: 'envy' },
    body: '동문은 벌써 저 위로 올라섰는데... 사부님, 저는 왜 이렇게 더딘 걸까요. 제가 재능이 없는 건 아닐까요.',
    options: [
      { key: 'ownpace', label: '걸음이 느린 게 아니라 길이 다른 거다. 네 보폭으로 가면 된다.', effects: { persona: { integrity: 3, warmth: 2 }, trust: 4 } },
      { key: 'push', label: '조급함을 땀으로 바꾸거라. 뒤처졌다 느낄 때가 가장 크는 때다.', effects: { persona: { integrity: 3, ambition: 2 }, trust: 2 } },
      { key: 'envywatch', label: '남과 견주는 마음이 검을 흐린다. 네 안을 보거라.', effects: { persona: { prudence: 3 }, trust: 1 } },
      { key: 'dismiss', label: '강호엔 늘 빠른 자가 있다. 일일이 부러워해선 못 큰다.', effects: { persona: { integrity: 2, warmth: -2 }, trust: -2 } },
    ],
  },
  // 동문 이변 — 불안(동문이 어두워짐). 걱정하는 동문이 사부에게 꺼낸다. docs/12.
  {
    id: 'm-sibling-dark',
    band: 'turmoil',
    when: { siblingEvent: 'unease' },
    body: '사부님... 그 동문이 요즘 무서워요. 눈빛도, 말도 예전 같지 않고요. 모른 척해야 할지, 다가가야 할지 모르겠습니다.',
    options: [
      { key: 'reach', label: '두려워 말고 먼저 손을 내밀어 보거라. 곁을 지켜주는 게 약이 될 때가 있다.', effects: { persona: { warmth: 4, mercy: 3 }, trust: 4 } },
      { key: 'master', label: '네가 짊어질 일이 아니다. 그 아이는 사부가 살피마. 너는 네 길을 가거라.', effects: { persona: { prudence: 3 }, trust: 3 } },
      { key: 'distance', label: '아직은 거리를 두는 게 낫겠다. 함부로 끌려들지 마라.', effects: { persona: { prudence: 3, warmth: -2 }, trust: 2 } },
    ],
  },
  // 동문 이변 — 걱정(동문이 크게 다침). docs/12.
  {
    id: 'm-sibling-hurt',
    band: 'turmoil',
    when: { siblingEvent: 'worry' },
    body: '동문이 크게 다쳐 돌아왔어요. ... 곁에서 돌봐주고 싶은데, 제가 그래도 될까요. 자꾸 마음이 쓰입니다.',
    options: [
      { key: 'allow', label: '곁을 지켜주거라. 동문을 보살피는 것도 무인의 도리다.', effects: { persona: { warmth: 4, mercy: 3 }, trust: 4 } },
      { key: 'balance', label: '마음은 곱다만, 네 수련도 놓지 마라. 둘 다 챙기거라.', effects: { persona: { prudence: 3, integrity: 2 }, trust: 2 } },
      { key: 'cold', label: '강호에선 다치는 게 예사다. 네 갈 길에 마음 쓰거라.', effects: { persona: { integrity: 2, warmth: -3 }, trust: -2 } },
    ],
  },
  // ── 동심기 (7~10) ──
  {
    id: 'm-child-homesick',
    band: 'child',
    when: { ageMax: 10 },
    body: '사부님... 밤에 자려고 하면 자꾸 어머니 생각이 나요. 집에 가고 싶어요.',
    options: [
      { key: 'comfort', label: '울어도 괜찮다. 그리움은 부끄러운 것이 아니란다.', effects: { persona: { warmth: 3 }, trust: 4 } },
      { key: 'settle', label: '이제 여기가 네 집이다. 차차 정이 들 게다.', effects: { persona: { freedom: -2 }, trust: 1 } },
      { key: 'stern', label: '무인이 그만한 일로 흔들려서야 쓰겠느냐.', effects: { persona: { integrity: 2, warmth: -2 }, trust: -3 } },
    ],
  },
  {
    id: 'm-child-temptation',
    band: 'child',
    when: { ageMax: 10, needsRival: true },
    body: '사부님, {rival} 떡이 제 것보다 커요. 몰래 바꿔도 아무도 모르겠죠?',
    options: [
      { key: 'honest', label: '남의 것을 탐하지 마라. 모자라면 내게 말하거라.', effects: { persona: { integrity: 3, mercy: 1 }, righteousness: 1 } },
      { key: 'warn', label: '들키지 않으면 그만이라고? ... 그 마음이 가장 위험하다.', effects: { persona: { integrity: 2 } } },
      { key: 'wink', label: '그래, 영리하구나. (못 본 척 눈을 감는다)', effects: { persona: { freedom: 2, integrity: -2 }, righteousness: -2 } },
    ],
  },

  // ── 성장기 (10~12) ──
  {
    id: 'm-growth-rival',
    band: 'growth',
    when: { ageMin: 10, ageMax: 12, needsRival: true },
    body: '{rival}는 벌써 저만치 앞서가요. 사부님, 저도 더 독한 수련을 시켜주세요.',
    options: [
      { key: 'pace', label: '조급함이 검을 망친다. 너의 속도로 가거라.', effects: { persona: { prudence: 2 }, trust: 1 } },
      { key: 'fuel', label: '좋다. 그 독기, 검에 실어라.', effects: { persona: { ambition: 3 } } },
      { key: 'self', label: '남과 겨루지 마라. 어제의 너와 겨뤄라.', effects: { persona: { integrity: 2, prudence: 1 }, trust: 2 } },
    ],
  },
  {
    id: 'm-growth-dream',
    band: 'growth',
    when: { ageMin: 10, ageMax: 12 },
    body: '사부님, 강호에 나가면 저도 영웅이 될 수 있을까요? 이름을 떨치고 싶어요.',
    options: [
      { key: 'protect', label: '이름보다 지킬 사람을 먼저 정하거라. 그것이 협(俠)이다.', effects: { persona: { integrity: 2, mercy: 2 }, righteousness: 2 } },
      { key: 'ambition', label: '그 꿈, 품어라. 정점은 그런 자의 것이다.', effects: { persona: { ambition: 3 } } },
      { key: 'sober', label: '강호의 이름은 대개 피로 쓰인다. 각오는 있느냐.', effects: { persona: { prudence: 2 } } },
    ],
  },

  // ── 격동기 (13~14) ──
  {
    id: 'm-turmoil-firstdeath',
    band: 'turmoil',
    when: { ageMin: 13, ageMax: 14 },
    body: '의뢰에서... 사람이 죽는 걸 봤습니다. 아직도 손이 떨립니다.',
    options: [
      { key: 'human', label: '그 떨림을 잊지 마라. 그것이 네가 사람인 증거다.', effects: { persona: { mercy: 3 }, trust: 3, righteousness: 1 } },
      { key: 'harden', label: '강호란 그런 곳이다. 곧 익숙해질 게다.', effects: { persona: { mercy: -2, prudence: 1 } } },
      { key: 'shoulder', label: '네가 살아 돌아왔으니 됐다. 그 짐은 내가 진다.', effects: { persona: { warmth: 2 }, trust: 4 } },
    ],
  },
  {
    id: 'm-turmoil-darkpath',
    band: 'turmoil',
    when: { ageMin: 13, ageMax: 14, darknessRiskMin: 'medium' },
    body: '사부님... 더 빨리 강해지는 길이 있다 들었습니다. 그 비급, 봐도 되겠습니까?',
    options: [
      { key: 'forbid', label: '그 길 끝엔 너 자신을 잃는다. 절대 안 된다.', effects: { persona: { integrity: 3 }, darkness: -1 } },
      { key: 'probe', label: '무엇이 그리 급하냐. ... 무슨 일이 있었던 게냐.', effects: { persona: { prudence: 2 }, trust: 2 } },
      { key: 'allow', label: '원한다면, 말리지 않으마.', effects: { persona: { freedom: 2 }, darkness: 1, righteousness: -2 } },
    ],
  },

  // ── 출도전기 (15+) ──
  {
    id: 'm-departure-fear',
    band: 'departure',
    when: { ageMin: 15 },
    body: '곧 하산입니다. 솔직히... 강호가 두렵습니다.',
    options: [
      { key: 'wise', label: '두려움을 아는 자가 오래 산다.', effects: { persona: { prudence: 2 }, trust: 2 } },
      { key: 'sharpen', label: '두렵거든 검을 더 갈아라. 두려움이 곧 칼이 된다.', effects: { persona: { integrity: 1, ambition: 1 } } },
      { key: 'home', label: '정 두렵거든, 돌아올 곳은 늘 여기다.', effects: { persona: { warmth: 2 }, trust: 4 } },
    ],
  },
  {
    id: 'm-departure-surpass',
    band: 'departure',
    when: { ageMin: 15 },
    body: '사부님은 끝내 화경에 닿지 못하셨지요. 저는... 그 너머로 가고 싶습니다.',
    options: [
      { key: 'bless', label: '그래. 나를 밟고 가거라. 그것이 사제(師弟)다.', effects: { persona: { ambition: 2 }, trust: 4 } },
      { key: 'rebuke', label: '오만하다. 화경이 그리 쉬운 줄 아느냐.', effects: { persona: { integrity: 1 }, trust: -2 } },
      { key: 'content', label: '내가 못 간 길을 네가 간다면, 나는 그것으로 족하다.', effects: { persona: { warmth: 2, mercy: 1 }, trust: 3 } },
    ],
  },
  // ── 워크플로 대량 생성분(범용 63 + 제자 전용 80, 검수 통과) ──
  ...GENERATED_MEETINGS,
  // ── 결제 2인 전용(진백호·사천화) ×10 = 20 (2026-06-28, docs/12) ──
  ...JIN_BAEKHO_MEETINGS,
  ...SA_CHEONHWA_MEETINGS,
];

// 현재 상태에 맞는 면담 중 무작위 1개. 없으면 null.
// 제자 전용(disciple) 면담은 그 제자에게만, 범용(disciple 없음)은 누구에게나.
// 전용이 매칭되면 가중치를 줘 더 자주 뜨게(캐릭터 깊이).
export function pickContextualMeeting(c: OneLinerCtx, discipleId?: string): MeetingTemplate | null {
  const pool = MEETINGS.filter(
    (m) => (!m.disciple || m.disciple === discipleId) && matchesCondition(m.when, c),
  );
  if (pool.length === 0) return null;
  const personal = pool.filter((m) => m.disciple);
  // 전용 면담이 있으면 60% 확률로 그쪽에서, 아니면 전체에서.
  const usePersonal = personal.length > 0 && random() < 0.6;
  const src = usePersonal ? personal : pool;
  return src[Math.floor(random() * src.length)];
}

// 본문 {rival} 치환 — 한마디와 동일 규칙 재사용.
export function fillMeetingBody(body: string, c: OneLinerCtx): string {
  return fillOneLinerBody(body, c);
}
