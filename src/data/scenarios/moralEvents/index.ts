// 도덕적 갈등 이벤트 — 통합 풀.
// 3-Tier: universal · archetype · personal. docs/07_이벤트_시스템.md.
//
// 후속 확장:
// - universal: 공통 시나리오 추가 (작업비 낮음)
// - archetype: 성격 조건부 시나리오 (작업비 중)
// - personal/: 캐릭터 시트 추가될 때마다 파일 추가 (작업비 높음, 회차 카타르시스)

import type { MoralEventTemplate, MoralEventTier } from '@/types';
import { UNIVERSAL_MORAL_EVENTS } from './universal';
import { UNIVERSAL_MORAL_EVENTS_EXTRA } from './universalExtra';
import { ARCHETYPE_MORAL_EVENTS } from './archetype';
import { ARCHETYPE_MORAL_EVENTS_EXTRA } from './archetypeExtra';
import { EARLY_MORAL_EVENTS } from './early';
import { DOKGOYEON_MORAL_EVENTS } from './personal/07_dokgoyeon';
import { YUNSOSO_MORAL_EVENTS } from './personal/04_yunsoso';
// 개인 풀 확장 8인 (2026-06-28, docs/07 풀 현황·확장)
import { JANGCHEOL_MORAL_EVENTS } from './personal/01_jangcheol';
import { JINSOHWA_MORAL_EVENTS } from './personal/02_jinsohwa';
import { HANBARAM_MORAL_EVENTS } from './personal/03_hanbaram';
import { GANGMUYEOL_MORAL_EVENTS } from './personal/05_gangmuyeol';
import { ICHEONGHA_MORAL_EVENTS } from './personal/06_icheongha';
import { BAEKYEON_MORAL_EVENTS } from './personal/08_baekyeon';
import { JINBAEKHO_MORAL_EVENTS } from './personal/09_jinbaekho';
import { SACHEONHWA_MORAL_EVENTS } from './personal/10_sacheonhwa';

export const ALL_MORAL_EVENTS: readonly MoralEventTemplate[] = [
  ...UNIVERSAL_MORAL_EVENTS,
  ...UNIVERSAL_MORAL_EVENTS_EXTRA,
  ...ARCHETYPE_MORAL_EVENTS,
  ...ARCHETYPE_MORAL_EVENTS_EXTRA,
  ...EARLY_MORAL_EVENTS,
  ...DOKGOYEON_MORAL_EVENTS,
  ...YUNSOSO_MORAL_EVENTS,
  ...JANGCHEOL_MORAL_EVENTS,
  ...JINSOHWA_MORAL_EVENTS,
  ...HANBARAM_MORAL_EVENTS,
  ...GANGMUYEOL_MORAL_EVENTS,
  ...ICHEONGHA_MORAL_EVENTS,
  ...BAEKYEON_MORAL_EVENTS,
  ...JINBAEKHO_MORAL_EVENTS,
  ...SACHEONHWA_MORAL_EVENTS,
];

// tier 별 가중치 — 한 회차에서 어떤 tier 가 얼마나 자주 발화하나.
// 공통이 다수, 유형이 색깔, 개인이 카타르시스. docs/07 "발화 비율".
export const TIER_WEIGHT: Record<MoralEventTier, number> = {
  universal: 70,
  archetype: 25,
  personal: 5,
};

export function findMoralEvent(id: string): MoralEventTemplate | undefined {
  return ALL_MORAL_EVENTS.find((e) => e.id === id);
}
