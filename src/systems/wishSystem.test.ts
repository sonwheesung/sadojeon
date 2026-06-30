// 제자 희망 허락 효과 매핑 — kind 기준(acceptActivity 는 autonomy 가 외출·자율수련 중복이라 부정확). docs/12 §1.5.
// 옛 그레이박스: 허락 시 rest 만 동작(healing), 나머지(명상·공부·합공·외출)는 신뢰만·그날 행동 no-op.
// 이제 6종 kind 전부 그날 일탈 효과를 갖는다. 이 테스트가 매핑·완전성(불변식)을 고정한다.
import { wishGrantFor, WISHES } from '@/data/scenarios/wishes';

describe('wishGrantFor — 허락 효과 매핑(kind 기준)', () => {
  it('rest → healing 회복 1일', () => {
    expect(wishGrantFor('rest')).toEqual({ kind: 'override', command: 'healing', days: 1 });
  });

  it('meditation·study·합공·자율수련 → seclusion 집중 1일', () => {
    for (const k of ['meditation', 'study', 'pair_training', 'extra_training'] as const) {
      expect(wishGrantFor(k)).toEqual({ kind: 'override', command: 'seclusion', days: 1 });
    }
  });

  it('town_visit → 기분전환(스트레스 완화, 음수 delta)', () => {
    const g = wishGrantFor('town_visit');
    expect(g.kind).toBe('stress');
    if (g.kind === 'stress') expect(g.delta).toBeLessThan(0);
  });

  // 불변식(사각 닫기): 모든 청 템플릿(36종)은 허락 시 no-op 이 아니다 — 신규 kind 매핑 누락 가드.
  // 옛 코드면 rest 외 전부 no-op 이라 이 단언이 깨진다.
  it('모든 WISHES 템플릿 허락 효과 보유 — no-op 0', () => {
    const noop = WISHES.filter((w) => wishGrantFor(w.kind).kind === 'none').map((w) => w.id);
    expect(noop).toEqual([]);
  });
});
