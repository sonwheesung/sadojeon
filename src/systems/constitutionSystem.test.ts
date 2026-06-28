// 부여 체질(불침)이 **실제로 적용**되는지 — woundResistOf merge + inflictWound 게이트 + 전투 시트. docs/50 §5.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import { woundResistOf, resistsWound } from '@/data/martialArts';
import { grantConstitution, hasConstitution } from './constitutionSystem';
import { inflictWound } from './woundSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple } from '@/types';

function seedDisciple(over: Partial<Disciple> = {}): string {
  const d = { id: 'x', name: '테스트', martialArts: [], wounds: [], status: 'training', ...over } as unknown as Disciple;
  useDiscipleStore.setState({ disciples: { x: d }, order: ['x'] } as never);
  return 'x';
}
const woundsOf = (id: string) => useDiscipleStore.getState().disciples[id].wounds ?? [];

describe('체질 부여 — 실제 적용', () => {
  test('woundResistOf: 부여분을 무공 파생분과 max merge', () => {
    expect(woundResistOf([], { poison: 2 })).toEqual({ poison: 2 });
    expect(woundResistOf([], { burn: 2 }).burn).toBe(2);
    // resistsWound: 완전(2) → 치명(sev1)도 막음.
    expect(resistsWound(woundResistOf([], { frost: 2 }).frost, 1)).toBe(true);
    // 저항 없으면 안 막음.
    expect(resistsWound(woundResistOf([]).poison, 1)).toBe(false);
  });

  test('grantConstitution → hasConstitution 반영', () => {
    const id = seedDisciple();
    expect(hasConstitution(id, 'poison')).toBe(false);
    expect(grantConstitution(id, 'poison', 2)).toBe('ok');
    expect(hasConstitution(id, 'poison')).toBe(true);
    expect(grantConstitution(id, 'poison', 2)).toBe('already'); // 중복
  });

  test('inflictWound: 부여 면역 속성 상처는 안 남는다(치명 중독도)', () => {
    const id = seedDisciple({ grantedConstitution: { poison: 2 } } as Partial<Disciple>);
    inflictWound(id, 'poison', 1, 10); // 치명 중독(sev1)
    expect(woundsOf(id)).toHaveLength(0); // 면역 → 상처 0
    // 대조: 면역 없는 속성(화상)은 정상으로 상처가 남는다.
    inflictWound(id, 'burn', 2, 10);
    expect(woundsOf(id).some((w) => w.type === 'burn')).toBe(true);
  });

  test('대조군: 부여 안 된 제자는 중독 상처가 남는다', () => {
    const id = seedDisciple();
    inflictWound(id, 'poison', 1, 10);
    expect(woundsOf(id).some((w) => w.type === 'poison')).toBe(true);
  });
});
