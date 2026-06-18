// 한 마디 풀 — docs/12_인박스_면담.md "단계 1: 일상 한 마디"
// 매일 진행 시 무작위 제자 1명이 사부에게 한 마디. 사부는 4문장 중 하나로 응답.

import { random } from '@/systems/rng';
import { fillName } from '@/utils/korean';
import { GRADUATION } from '@/data/constants';

export type OneLinerCategory = 'training' | 'daily' | 'relation' | 'worry';
export type OneLinerTone = 'encourage' | 'nod' | 'caution' | 'ignore';

// 상황 조건 — 제자 현재 상태와 맞을 때만 그 한 마디가 뜬다(무작위 X). docs/12.
// 안 적은 키 = 무관. 예: 힘들다는 말은 stressMin, 적대 의심은 hasEnemy 가 받쳐야 발화.
export interface OneLinerCondition {
  stressMin?: number; // 스트레스 ≥ (지침·힘듦)
  stressMax?: number; // 스트레스 ≤ (개운·좋은 날)
  staminaPctMax?: number; // 체력 % ≤ (지침)
  trustMin?: number;
  trustMax?: number; // 신뢰 ≤ (마음 닫음)
  darknessRiskMin?: 'medium' | 'high'; // 흑화 위험 ≥
  hasEnemy?: boolean; // 적대 관계 보유 시에만
  ageMin?: number;
  ageMax?: number;
  seongMin?: number; // 주력 무공 성 ≥ (정체·자만)
  needsRival?: boolean; // 자신보다 앞선 동문이 있을 때만(이름은 {rival} 치환)
  isWeakest?: boolean; // 사문에서 자신이 제일 약할 때
}

export interface OneLinerTemplate {
  id: string;
  category: OneLinerCategory;
  body: string;
  when?: OneLinerCondition; // 없으면 언제든 가능
}

export const ONE_LINERS: OneLinerTemplate[] = [
  // 수련 — 힘듦은 스트레스 높을 때만, 개운함은 낮을 때만
  { id: 't1', category: 'training', body: '사부님, 오늘 수련은 손에 잡힙니다.', when: { stressMax: 45 } },
  { id: 't2', category: 'training', body: '어제보다 한 걸음 나아간 것 같습니다.', when: { stressMax: 55 } },
  { id: 't3', category: 'training', body: '몸이 무겁습니다. 결이 안 잡히는 날입니다.', when: { stressMin: 50 } },
  { id: 't4', category: 'training', body: '진행도가 좀처럼 오르지 않아 답답합니다.', when: { stressMin: 45 } },
  { id: 't5', category: 'training', body: '검이 손에서 겉돕니다. 너무 지쳤나 봅니다.', when: { staminaPctMax: 35 } },
  { id: 't6', category: 'training', body: '이 무공, 이제 어느 정도 알 듯합니다.', when: { seongMin: 5, stressMax: 60 } },

  // 일상 — 대체로 무관
  { id: 'd1', category: 'daily', body: '아침 안개가 산문을 덮었습니다. 좋은 날입니다.', when: { stressMax: 60 } },
  { id: 'd2', category: 'daily', body: '간밤 꿈자리가 사나웠습니다. 오늘은 검을 내려놓고 좀 쉬고 싶습니다.', when: { stressMin: 35 } },
  { id: 'd3', category: 'daily', body: '사부님, 차 한 잔 드시지요. 갓 끓인 것입니다.' },

  // 관계
  // 비교·서열 — {rival}=자기보다 앞선 최강 동문 이름. 어림/연상 말투, 최약 여부로 분기.
  { id: 'r1-young', category: 'relation', body: '사부님! {rival}는 어떻게 그렇게 잘해요? 저도 빨리 그렇게 되고 싶어요.', when: { ageMax: 11, needsRival: true } },
  { id: 'r1-weak', category: 'relation', body: '사부님... 솔직히 제가 사문에서 제일 약한 것 같아요. {rival}만큼 하려면 멀었어요.', when: { isWeakest: true, needsRival: true } },
  { id: 'r1-old', category: 'relation', body: '{rival}를 보면 아직 멀었구나 싶습니다. 더 갈아야겠지요.', when: { ageMin: 12, needsRival: true } },
  { id: 'r2', category: 'relation', body: '오늘 동문과 한 마디 나눴습니다. 마음이 풀립니다.', when: { stressMax: 65 } },
  { id: 'r3', category: 'relation', body: '... 누군가 저를 자꾸 쳐다보는 듯합니다.', when: { hasEnemy: true } },

  // 고민
  { id: 'w1', category: 'worry', body: '제 길이 정녕 이쪽인지 가끔 묻게 됩니다.', when: { ageMin: 12 } },
  { id: 'w2', category: 'worry', body: '강호엔 제 또래가 벌써 이름을 냈다더군요. 저는 아직 산문 안인데...', when: { ageMin: 12 } },
  { id: 'w3', category: 'worry', body: '... 별것 아닙니다. 신경 쓰지 마십시오.', when: { trustMax: 40 } },
  { id: 'w4', category: 'worry', body: '사부님은 제 재능을 어떻게 보십니까.' },
  // 흑화 기미 — '어둠'을 라벨하지 않고 관찰 가능한 말·태도로만(feedback_hidden_game_state)
  { id: 'w5', category: 'worry', body: '사부님... 강한 자가 약한 자를 누르는 것이, 정녕 그른 일입니까.', when: { darknessRiskMin: 'medium' } },
  { id: 'w6', category: 'worry', body: '요즘은 검을 쥐면, 외려 마음이 차게 가라앉습니다.', when: { darknessRiskMin: 'medium' } },
  { id: 'w7', category: 'worry', body: '... 그날 그자의 눈을, 아직도 잊지 못합니다.', when: { darknessRiskMin: 'high', hasEnemy: true } },
];

// 한 마디 발화 컨텍스트 — 제자 현재 상태 스냅샷(oneLinerSystem 에서 산출).
export interface OneLinerCtx {
  stress: number;
  staminaPct: number;
  trust: number;
  darknessRisk: 'low' | 'medium' | 'high';
  hasEnemy: boolean;
  age: number;
  mainSeong: number;
  rivalName: string | null; // 자신보다 앞선 최강 동문 이름(없으면 null)
  isWeakest: boolean; // 사문 최약
}

const RISK_RANK: Record<'low' | 'medium' | 'high', number> = { low: 0, medium: 1, high: 2 };

// 나이 조건 스케일 — 면담·한마디의 ageMin/ageMax 는 "10세 입문 → 15세 하산" 옛 5년 호로 작성됨
// (child≤10 · growth 10-12 · turmoil 13-14 · departure 15+). 실제 양육은 RAISING_YEARS(15년, 10→25세)라,
// 실제 나이를 옛 스케일로 눌러 같은 인생 곡선을 15년에 그대로 펼친다. 데이터(생성물 포함)는 손대지 않는다. docs/06·12.
// 마지막 DEPARTURE_LEAD(2년)은 departure(출도전기)로 비워, "곧 하산" 대사가 하산 직전부터 뜨게 한다.
const CONTENT_ENTRY_AGE = 10; // 입문 나이(압축 기준점)
const CONTENT_ARC = 5; // 옛 콘텐츠 호 길이(10→15세)
const DEPARTURE_LEAD = 2; // 하산 직전 출도전기 길이(년)
const RAISING_ARC = GRADUATION.RAISING_YEARS - DEPARTURE_LEAD; // 콘텐츠 호를 펼칠 실제 구간(10→23세)
function toContentAge(realAge: number): number {
  return CONTENT_ENTRY_AGE + (realAge - CONTENT_ENTRY_AGE) * (CONTENT_ARC / RAISING_ARC);
}

// 상황 조건 매처 — 한마디·면담 공용.
export function matchesCondition(w: OneLinerCondition | undefined, c: OneLinerCtx): boolean {
  if (!w) return true;
  if (w.stressMin != null && c.stress < w.stressMin) return false;
  if (w.stressMax != null && c.stress > w.stressMax) return false;
  if (w.staminaPctMax != null && c.staminaPct > w.staminaPctMax) return false;
  if (w.trustMin != null && c.trust < w.trustMin) return false;
  if (w.trustMax != null && c.trust > w.trustMax) return false;
  if (w.darknessRiskMin != null && RISK_RANK[c.darknessRisk] < RISK_RANK[w.darknessRiskMin]) return false;
  if (w.hasEnemy != null && c.hasEnemy !== w.hasEnemy) return false;
  if (w.ageMin != null || w.ageMax != null) {
    const a = toContentAge(c.age); // 실제 나이 → 옛 5년 호 스케일로 압축해 비교
    if (w.ageMin != null && a < w.ageMin) return false;
    if (w.ageMax != null && a > w.ageMax) return false;
  }
  if (w.seongMin != null && c.mainSeong < w.seongMin) return false;
  if (w.needsRival && !c.rivalName) return false;
  if (w.isWeakest != null && c.isWeakest !== w.isWeakest) return false;
  return true;
}

// 현재 상태에 맞는 한 마디 중 무작위 1개. 맞는 게 없으면 null(그 날은 발화 X).
export function pickContextualOneLiner(c: OneLinerCtx): OneLinerTemplate | null {
  const pool = ONE_LINERS.filter((t) => matchesCondition(t.when, c));
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)];
}

// 본문 변수 치환 — {rival}=최강 동문 이름. 발화 시점에 실제 이름으로 박는다.
export function fillOneLinerBody(body: string, c: OneLinerCtx): string {
  // {rival} 치환 + 조사 자동 교정(받침 분기). 출처는 활성 동문(buildDiscipleCtx)·없으면 '동문'. docs/37.
  return fillName(body, { rival: c.rivalName ?? '동문' });
}

// 사부 응답 풀 — 톤별. 한 마디와 무관하게 범용으로 사용. 대사 또는 행동.
// 행동은 (괄호) 결로 표기 — 무협 소설 톤.
export const ONE_LINER_RESPONSES: Record<OneLinerTone, readonly string[]> = {
  encourage: [
    '그만하면 잘 견디고 있다. 조급함만 내려놓으면 길이 보일 게다.',
    '꽃은 재촉한다고 일찍 피지 않는다. 너에게도 너의 때가 온다.',
    '오늘 한 걸음이 하찮아 보여도, 십 년이면 천 걸음이 된다.',
    '나도 네 나이엔 그 자리에서 오래 헤맸다. 다 지나가더라.',
    '무공은 재주가 아니라 그 꾸준함에서 나오는 법이다.',
    '그 마음을 잊지 마라. 검보다 그것이 너를 멀리 데려간다.',
  ],
  nod: [
    '(천천히 고개를 끄덕이곤, 말을 아낀다.)',
    '(말없이 식은 차를 새로 따라 준다.)',
    '(먼 산을 한참 바라보다 옅게 웃는다.)',
    '(붓을 내려놓고, 네 눈을 가만히 들여다본다.)',
    '"...그랬구나." (그 한 마디뿐이다.)',
    '(곁에 앉아 함께 잠시 침묵해 준다.)',
  ],
  caution: [
    '마음이 풀어지면 검끝부터 무뎌지는 법이다.',
    '오늘의 깨달음이 내일도 네 것이리라 믿지 마라.',
    '자만은 가장 먼저 찾아드는 적이다. 스스로를 경계하라.',
    '그 말이 진심인지, 한 번 더 자신에게 물어보아라.',
    '쉬운 길은 대개 더 멀리 돌아가게 만든다.',
    '검을 탓하기 전에, 그 검을 쥔 마음을 먼저 보아라.',
  ],
  ignore: [
    '(잠시 침묵하다, 다시 붓을 든다.)',
    '그것은 끝내 네가 스스로 답해야 할 물음이다.',
    '(말없이 자리를 고쳐 앉을 뿐이다.)',
    '지금은 내가 답할 자리가 아니다.',
    '스스로 겪어야만 알게 되는 것도 있는 법이다.',
    '(대답 대신, 너를 한참 응시한다.)',
  ],
};

export function pickRandomOneLiner(): OneLinerTemplate {
  const idx = Math.floor(random() * ONE_LINERS.length);
  return ONE_LINERS[idx];
}

export function pickResponse(tone: OneLinerTone): string {
  const pool = ONE_LINER_RESPONSES[tone];
  const idx = Math.floor(random() * pool.length);
  return pool[idx];
}
