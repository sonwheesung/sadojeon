// 일일 일지 빌드 — 짝 대련 공용 1줄 합치기 (docs/40 §2-2). 사각 닫기:
// 대련은 한 사건인데 양쪽 결산(myReport·partnerReport)에 같은 sparNote 가 실려 일지에 동일 줄 2회였다(R49).
// buildTickArtifacts 가 같은 spar 텍스트를 처음 한 번만 싣는지 검증(나머지 제자별 줄은 유지).
import { buildTickArtifacts } from './dailyLogSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { DiscipleTickReport } from './trainingSystem';

jest.mock('@/stores/discipleStore', () => ({ useDiscipleStore: { getState: jest.fn() } }));
jest.mock('@/stores/timeStore', () => ({ useTimeStore: { getState: jest.fn() } }));

const getDisc = useDiscipleStore.getState as jest.Mock;
const getTime = useTimeStore.getState as jest.Mock;

// sparNote 만 있는 최소 리포트(스탯·무공 변화 0, 기색 불변 → spar 줄만 난다).
function sparReport(id: string, note: string): DiscipleTickReport {
  return {
    discipleId: id,
    category: 'martial',
    sparNote: note,
    arts: [],
    statGains: [],
    staminaBefore: 100,
    staminaAfter: 100,
    maxStamina: 100,
    collapsed: false,
  } as unknown as DiscipleTickReport;
}

beforeEach(() => {
  getDisc.mockReturnValue({
    disciples: { d1: { name: '장철' }, d2: { name: '진소화' } },
  });
  getTime.mockReturnValue({ totalDay: 5 });
});

describe('buildTickArtifacts — 짝 대련 공용 1줄(R49)', () => {
  const SHARED = '장철과 진소화가 팽팽하게 손을 맞췄다. 서로의 빈틈을 짚어주며 둘 다 적잖이 얻었다.';

  it('양쪽 리포트에 같은 sparNote → 일지엔 그 줄 1회만(중복 제거)', () => {
    const { log } = buildTickArtifacts([sparReport('d1', SHARED), sparReport('d2', SHARED)], '1년차 봄 3주차');
    const sparLines = log.entries.filter((e) => e.text === SHARED);
    expect(sparLines).toHaveLength(1);
  });

  it('서로 다른 sparNote(다른 짝) → 각각 1회씩(과잉 제거 아님)', () => {
    const A = '장철과 진소화가 팽팽하게 손을 맞췄다.';
    const B = '다른 둘이 막상막하로 겨뤘다.';
    const { log } = buildTickArtifacts([sparReport('d1', A), sparReport('d2', B)], '1년차 봄 3주차');
    expect(log.entries.filter((e) => e.text === A)).toHaveLength(1);
    expect(log.entries.filter((e) => e.text === B)).toHaveLength(1);
  });
});
