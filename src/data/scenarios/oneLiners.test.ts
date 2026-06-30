// 한 마디 풀 — 후보 선별(eligible·freshen·중복 회피) 단위 (docs/40 §2-2, 순수 데이터).
// 핵심 사각 닫기: 사문 전체 recency(sectRecentIds)로 **서로 다른 제자가 같은 공용 한 마디**를 며칠 사이
// 똑같이 건네는 중복을 차단(R50). 본인 recency(recentIds)와 별개 축.
import { candidateOneLiners, pickContextualOneLiner, type OneLinerCtx } from './oneLiners';

// 공용 일상 한 마디 다수가 적격이 되도록(스트레스 낮음·평범) 베이스 ctx.
const baseCtx = (over: Partial<OneLinerCtx> = {}): OneLinerCtx => ({
  discipleId: 'tester', // 실제 poolId 아님 → onlyFor 시그니처 0, 공용 풀만
  stress: 25,
  staminaPct: 90,
  trust: 60,
  darknessRisk: 'low',
  hasEnemy: false,
  mourning: false,
  siblingEvent: null,
  questEcho: null,
  jianghuTense: false,
  age: 12,
  mainSeong: 2,
  rivalName: null,
  isWeakest: false,
  saidIds: [],
  recentIds: [],
  ...over,
});

describe('oneLiners — 후보 적격(공용 풀)', () => {
  it('조건 없는 공용 한 마디(amb3·d3)는 늘 후보에 든다', () => {
    const ids = candidateOneLiners(baseCtx()).map((t) => t.id);
    expect(ids).toContain('amb3'); // when 없음
    expect(ids).toContain('amb18'); // stressMax:55 — stress25 통과
  });
});

describe('oneLiners — 사문 전체 중복 회피(sectRecentIds, R50)', () => {
  it('사문 최근 발화에 든 공용 한 마디는 후보에서 빠진다 — 다른 제자가 방금 한 같은 말 차단', () => {
    const c = baseCtx({ sectRecentIds: ['amb18'] });
    const ids = candidateOneLiners(c).map((t) => t.id);
    expect(ids).not.toContain('amb18'); // 사문 최근 → 제외
    expect(ids).toContain('amb3'); // 다른 공용은 그대로(과잉 차단 아님)
  });

  it('pickContextualOneLiner 도 사문 최근 발화는 고르지 않는다(반복 확인)', () => {
    const c = baseCtx({ sectRecentIds: ['amb18'] });
    for (let i = 0; i < 40; i++) {
      const picked = pickContextualOneLiner(c);
      expect(picked?.id).not.toBe('amb18');
    }
  });

  it('본인 recentIds 와 합쳐 회피 — 둘 다 제외되지만 풀이 충분하면 다른 한 마디는 남는다', () => {
    const c = baseCtx({ recentIds: ['amb3'], sectRecentIds: ['amb18'] });
    const ids = candidateOneLiners(c).map((t) => t.id);
    expect(ids).not.toContain('amb3');
    expect(ids).not.toContain('amb18');
    expect(ids.length).toBeGreaterThanOrEqual(3); // 고갈 방지 — 후보 남음
  });
});
