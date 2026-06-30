// 강함 풍문 조사(사각 ⑪ — 화면 표시 텍스트 미검증). docs/37 R51.
// combatRumor 저전력 분기가 주격조사를 하드코딩 "이라"로 박아, 받침 없는 경지(삼류·이류·일류, '류')면
// "삼류이라 하나"로 깨졌다(올바른 건 "삼류라 하나"). josa(base,'이라','라') 로 수정. 삼류는 초반 기본 경지라
// 거의 모든 회차 첫 화면에서 노출되던 깨짐이다.
import { combatRumor } from './combatPower';
import type { Disciple, Realm } from '@/types';

// 미해결 artId 1개 — martialArts.length 가드는 통과(length 1), kit 은 비어 전투력 0 → 저전력 분기.
function mk(realm: Realm): Disciple {
  return { realm, martialArts: [{ artId: 'x', seong: 1 }] } as unknown as Disciple;
}

describe('combatRumor — 저전력 분기 조사', () => {
  it('삼류(받침 없음) → "삼류라 하나"(정상), "삼류이라"(깨짐) 아님', () => {
    const r = combatRumor(mk('samryu'));
    expect(r).toBe('삼류라 하나 아직 영글지 않았다');
    expect(r).not.toContain('삼류이라');
  });
  it('이류·일류(받침 없음 류) → "…류라"', () => {
    expect(combatRumor(mk('iryu'))).toContain('이류라 하나');
    expect(combatRumor(mk('ilryu'))).toContain('일류라 하나');
  });
  it('절정(받침 ㅇ) → "절정이라"(받침형 정상)', () => {
    expect(combatRumor(mk('jeoljeong'))).toContain('절정이라 하나');
  });
});
