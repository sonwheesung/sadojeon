// 화면 단위 — 제자 낌새 패널. 흑화는 숨은변수라 화면에 라벨·숫자로 안 나오고 **기색(무드)으로만**.
// docs/13 흑화 저항/갱생 · docs/37 B8/C8 · docs/41 §6 · [[feedback_hidden_game_state]]. RNTL v14 render=async.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('@/systems/runSync', () => ({ saveCurrentRunSilently: jest.fn() }));

import { render } from '@testing-library/react-native';

import { DiscipleMoodPanel } from './DiscipleMoodPanel';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';

function mk(over: Partial<Disciple> = {}): Disciple {
  return {
    id: 'd', name: '제자', hanjaName: '弟子', entryYear: 1, age: 15, efficiency: {}, insight: 3, fame: 0,
    martialArts: [], realm: 'iryu', realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 50, stamina: 50, maxStamina: 50, stress: 0, stats: {}, relationships: {},
    status: 'training', darknessLevel: 0, darknessRisk: 'low',
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    notes: [], ...over,
  };
}
function seed(d: Disciple): void {
  useDiscipleStore.setState({ disciples: { [d.id]: d }, order: [d.id] });
  useScheduleStore.setState((s: object) => ({ ...s, overrides: {} } as never));
  useTimeStore.setState((s: object) => ({ ...s, totalDay: 100 } as never));
}

describe('DiscipleMoodPanel (화면 단위) — 흑화 숨은변수 간접 표현', () => {
  it('흑화 깊은(≥2) 제자 → 강한 간접 무드를 텍스트로 노출', async () => {
    seed(mk({ darknessLevel: 2 }));
    const { getByText } = await render(<DiscipleMoodPanel />);
    // 흑화≥2 버킷 3문장 중 하나(결정론: hashId+totalDay).
    expect(getByText(/섬뜩하다|날 선 기운|어둡게 뒤틀려/)).toBeTruthy();
  });

  it('숨은변수 비노출 — "흑화"·단계·숫자·%를 화면에 직접 노출하지 않는다', async () => {
    seed(mk({ darknessLevel: 4, darknessRisk: 'high' }));
    const { queryByText } = await render(<DiscipleMoodPanel />);
    expect(queryByText(/흑화/)).toBeNull();
    expect(queryByText(/단계|레벨|darkness/i)).toBeNull();
    expect(queryByText(/\d+\s*%/)).toBeNull();
    expect(queryByText(/저항|resist/i)).toBeNull();
  });

  it('흑화 없는 평온한 제자 → 어둠 무드가 아닌 다른 기색', async () => {
    seed(mk({ darknessLevel: 0, darknessRisk: 'low', trustToMaster: 50, stress: 0 }));
    const { queryByText } = await render(<DiscipleMoodPanel />);
    // 흑화≥2 전용 강한 어둠 문구는 뜨지 않아야(낮은 단계는 다른 버킷).
    expect(queryByText(/섬뜩하다|어둡게 뒤틀려/)).toBeNull();
  });
});
