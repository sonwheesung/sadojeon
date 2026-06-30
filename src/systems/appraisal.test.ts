// 비급 감별 순수 로직 — 통찰 차등(docs/02 §1) + 함정·미완 자동 식별(★5). docs/05 §감별.
import { appraiseScroll } from './appraisal';

describe('appraiseScroll — 통찰 차등 감별', () => {
  it('★1 — 갈래만, 등급·위험·진위 가림', () => {
    const r = appraiseScroll('trap', 1);
    expect(r.schoolKnown).toBe(true);
    expect(r.gradeKnown).toBe('none');
    expect(r.dangerHint).toBe(false); // ★2 미만은 위험 신호도 없음
    expect(r.trueNatureRevealed).toBe(false);
    expect(r.shown).toBe('unknown');
  });

  it('★2 함정 — 추정 등급 + 위험 신호(단, 함정 단정은 ★5)', () => {
    const r = appraiseScroll('trap', 2);
    expect(r.gradeKnown).toBe('estimate');
    expect(r.dangerHint).toBe(true);
    expect(r.shown).toBe('unknown'); // 아직 함정으로 확정 못 함
  });

  it('★2 진품/미완 — 위험 신호 꺼짐(함정류만 위험)', () => {
    expect(appraiseScroll('authentic', 2).dangerHint).toBe(false);
    expect(appraiseScroll('incomplete', 2).dangerHint).toBe(false);
    expect(appraiseScroll('fake', 2).dangerHint).toBe(false);
  });

  it('★3 — 정확 등급 + 부작용', () => {
    const r = appraiseScroll('authentic', 3);
    expect(r.gradeKnown).toBe('exact');
    expect(r.sideEffectsKnown).toBe(true);
    expect(r.synergyKnown).toBe(false);
  });

  it('★4 — 궁합 예측 열림', () => {
    expect(appraiseScroll('authentic', 4).synergyKnown).toBe(true);
    expect(appraiseScroll('authentic', 4).trueNatureRevealed).toBe(false);
  });

  it('★5 — 함정·미완 자동 식별(진위 확정)', () => {
    expect(appraiseScroll('trap', 5)).toMatchObject({ trueNatureRevealed: true, shown: 'trap' });
    expect(appraiseScroll('incomplete', 5).shown).toBe('incomplete');
    expect(appraiseScroll('authentic', 5).shown).toBe('authentic');
  });

  it('통찰 범위 clamp — 0 이하/5 초과 안전', () => {
    expect(appraiseScroll('trap', 0).schoolKnown).toBe(false);
    expect(appraiseScroll('trap', 99).shown).toBe('trap'); // ★5 취급
  });
});
