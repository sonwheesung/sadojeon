// 한 마디 풀 — docs/12_인박스_면담.md "단계 1: 일상 한 마디"
// 매일 진행 시 무작위 제자 1명이 사부에게 한 마디. 사부는 4문장 중 하나로 응답.

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
  { id: 'd2', category: 'daily', body: '간밤에 꿈을 꿨습니다. 까닭 없이 마음이 어지럽습니다.', when: { stressMin: 35 } },
  { id: 'd3', category: 'daily', body: '사부님, 차 한 잔 드시지요. 갓 끓인 것입니다.' },

  // 관계
  { id: 'r1', category: 'relation', body: '동문의 검을 보면 막막합니다. 따라잡을 수 있을까요.', when: { ageMin: 11 } },
  { id: 'r2', category: 'relation', body: '오늘 동문과 한 마디 나눴습니다. 마음이 풀립니다.', when: { stressMax: 65 } },
  { id: 'r3', category: 'relation', body: '... 누군가 저를 자꾸 쳐다보는 듯합니다.', when: { hasEnemy: true } },

  // 고민
  { id: 'w1', category: 'worry', body: '제 길이 정녕 이쪽인지 가끔 묻게 됩니다.', when: { ageMin: 12 } },
  { id: 'w2', category: 'worry', body: '강호 소문을 듣다 보면 마음이 흔들립니다.', when: { ageMin: 12 } },
  { id: 'w3', category: 'worry', body: '... 별것 아닙니다. 신경 쓰지 마십시오.', when: { trustMax: 40 } },
  { id: 'w4', category: 'worry', body: '사부님은 제 재능을 어떻게 보십니까.' },
  { id: 'w5', category: 'worry', body: '... 가끔, 어두운 생각이 듭니다.', when: { darknessRiskMin: 'medium' } },
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
}

const RISK_RANK: Record<'low' | 'medium' | 'high', number> = { low: 0, medium: 1, high: 2 };

function conditionMet(w: OneLinerCondition | undefined, c: OneLinerCtx): boolean {
  if (!w) return true;
  if (w.stressMin != null && c.stress < w.stressMin) return false;
  if (w.stressMax != null && c.stress > w.stressMax) return false;
  if (w.staminaPctMax != null && c.staminaPct > w.staminaPctMax) return false;
  if (w.trustMin != null && c.trust < w.trustMin) return false;
  if (w.trustMax != null && c.trust > w.trustMax) return false;
  if (w.darknessRiskMin != null && RISK_RANK[c.darknessRisk] < RISK_RANK[w.darknessRiskMin]) return false;
  if (w.hasEnemy != null && c.hasEnemy !== w.hasEnemy) return false;
  if (w.ageMin != null && c.age < w.ageMin) return false;
  if (w.ageMax != null && c.age > w.ageMax) return false;
  if (w.seongMin != null && c.mainSeong < w.seongMin) return false;
  return true;
}

// 현재 상태에 맞는 한 마디 중 무작위 1개. 맞는 게 없으면 null(그 날은 발화 X).
export function pickContextualOneLiner(c: OneLinerCtx): OneLinerTemplate | null {
  const pool = ONE_LINERS.filter((t) => conditionMet(t.when, c));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 사부 응답 풀 — 톤별. 한 마디와 무관하게 범용으로 사용. 대사 또는 행동.
// 행동은 (괄호) 결로 표기 — 무협 소설 톤.
export const ONE_LINER_RESPONSES: Record<OneLinerTone, readonly string[]> = {
  encourage: [
    '잘 해내고 있다. 그 결을 잃지 마라.',
    '한 걸음씩이다. 서두르지 마라.',
    '꾸준함이 곧 무공이다.',
    '오늘의 마음을 적어두어라.',
    '그것이 너의 길이다.',
    '나도 그 나이엔 같은 자리에 섰다.',
  ],
  nod: [
    '(고개를 천천히 끄덕인다.)',
    '(말없이 차를 따라 준다.)',
    '(잠시 멀리 산을 바라본다.)',
    '(가만히 듣고만 있다.)',
    '(붓을 내려놓고 시선을 맞춘다.)',
    '(짧게 호흡을 고른다.)',
  ],
  caution: [
    '마음이 풀어지면 검도 풀어진다.',
    '오늘의 결이 내일까지 가는 법은 없다.',
    '자만은 곧 정체기다.',
    '한 번 더 자신을 의심해 보아라.',
    '그 말이 진심인지 스스로 물어라.',
    '쉬운 길은 대개 옳지 않다.',
  ],
  ignore: [
    '...',
    '(잠시 침묵.)',
    '그것은 네가 풀어야 할 일이다.',
    '(돌아서서 다른 곳을 본다.)',
    '지금은 들을 때가 아니다.',
    '(답하지 않는다.)',
  ],
};

export function pickRandomOneLiner(): OneLinerTemplate {
  const idx = Math.floor(Math.random() * ONE_LINERS.length);
  return ONE_LINERS[idx];
}

export function pickResponse(tone: OneLinerTone): string {
  const pool = ONE_LINER_RESPONSES[tone];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
