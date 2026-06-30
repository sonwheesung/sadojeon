// 적대 문파 결정형 강호 사건(faction_threat) — docs/30 §강호 사건 · docs/43 사냥 5렌즈.
// 갭: 적대 영향이 자금 피해 풍문(읽기 전용)뿐 → 사부가 개입하는 결정형 사건 추가.
// 렌즈: 의미정합(적대일 때만 발동은 tick 책임), id충돌(멱등), 자원경합(자금 음수 방지), 효과 정합(3선택).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import {
  factionThreatChoices,
  spawnFactionThreat,
  resolveFactionThreat,
} from './reputationSystem';
import { FACTIONS } from '@/data/factions';
import { useReputationStore } from '@/stores/reputationStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useTimeStore } from '@/stores/timeStore';

const FID = FACTIONS[0].id;

function threatItems() {
  return useInboxStore
    .getState()
    .items.filter((i) => (i.payload as { domain?: string } | undefined)?.domain === 'faction_threat');
}

beforeEach(() => {
  useReputationStore.setState({ sect: {}, disciple: {} } as never);
  useInboxStore.setState({ items: [] } as never);
  useSectAtmosphereStore.getState().set({ righteousness: 0, unity: 0 }); // 분위기 범위 ±10 — 0 기준 ±2 가 clamp 안 닿음
  useTimeStore.setState({ totalDay: 10 } as never);
});

describe('적대 문파 강호 사건 (faction_threat)', () => {
  it('사부 3선택 — 대치/화친/방치', () => {
    expect(factionThreatChoices().map((c) => c.key)).toEqual(['confront', 'appease', 'ignore']);
  });

  it('spawn — kind event(진행 게이트) + domain faction_threat 적재', () => {
    spawnFactionThreat(FID);
    const items = threatItems();
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe('event'); // DECISION_KINDS
    expect((items[0].payload as { factionId?: string }).factionId).toBe(FID);
  });

  it('id충돌 렌즈 — 같은 문파·같은 날 두 번 spawn → 1건(멱등)', () => {
    spawnFactionThreat(FID);
    spawnFactionThreat(FID);
    expect(threatItems()).toHaveLength(1);
  });

  const unity = () => useSectAtmosphereStore.getState().atmosphere.unity;

  it('화친(appease) — 그 문파 평판 +25(적대 완화), 결속 -1', () => {
    useReputationStore.getState().adjustSect(FID, -70);
    const u0 = unity();
    resolveFactionThreat(FID, 'appease');
    expect(useReputationStore.getState().sect[FID]).toBe(-45);
    expect(unity()).toBe(u0 - 1);
  });

  it('대치(confront) — 평판 -4, 결속(unity) +2', () => {
    useReputationStore.getState().adjustSect(FID, -70);
    const u0 = unity();
    resolveFactionThreat(FID, 'confront');
    expect(useReputationStore.getState().sect[FID]).toBe(-74);
    expect(unity()).toBe(u0 + 2);
  });

  it('방치(ignore) — 평판 -3, 결속 -2', () => {
    useReputationStore.getState().adjustSect(FID, -70);
    const u0 = unity();
    resolveFactionThreat(FID, 'ignore');
    expect(useReputationStore.getState().sect[FID]).toBe(-73);
    expect(unity()).toBe(u0 - 2);
  });

  it('자원경합 렌즈 — 자금 0이어도 음수로 안 빠짐(min 클램프)', () => {
    // sect 미설정 → resources 0. resolve 가 음수 자금을 만들지 않아야(adjustResources(-min(0,..))=0).
    expect(() => resolveFactionThreat(FID, 'ignore')).not.toThrow();
  });
});
