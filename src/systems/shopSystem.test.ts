// 상점 구매 seam(docs/50) — 통화 차감·지급·한정·환전을 단언. 화면 sim 이 못 보는 결제 로직 가드.
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));

import { purchase, priceOf, isSoldOut } from './shopSystem';
import { findProduct } from '@/data/shop';
import { DIVINE_ELIXIR_ID } from '@/data/elixirs';
import { useGameStore } from '@/stores/gameStore';
import { useSectStore } from '@/stores/sectStore';
import { useItemStore } from '@/stores/itemStore';
import { useCodexStore } from '@/stores/codexStore';
import { useShopStore } from '@/stores/shopStore';

function seed(diamonds: number, gold: number): void {
  useGameStore.setState({ diamonds } as never);
  useSectStore.setState({ sect: { resources: gold } } as never);
  useItemStore.setState({ items: [] } as never);
  useCodexStore.setState({ scrolls: [] } as never);
  useShopStore.setState({ boughtLimited: [] } as never);
}

const itemCount = (id: string): number => useItemStore.getState().items.find((i) => i.id === id)?.count ?? 0;
const gold = (): number => useSectStore.getState().sect?.resources ?? 0;
const dia = (): number => useGameStore.getState().diamonds;

describe('shopSystem — 구매 seam', () => {
  test('환전: 다이아 차감 → 골드 증가', () => {
    seed(50, 0);
    expect(purchase('exchange-diamond-gold')).toBe('ok');
    expect(dia()).toBe(40); // 10 차감
    expect(gold()).toBe(5000); // 5000 지급
  });

  test('상처 영약 세트: 전 속성 치료단 일괄 지급 + 자금 차감', () => {
    seed(0, 100000);
    const before = gold();
    expect(purchase('wound-elixir-set')).toBe('ok');
    expect(gold()).toBe(before - 2400);
    // 외상 치명(생사인)·독 치명(만독불침단)·동상 치명(대양신단) 모두 들어왔다.
    expect(itemCount('saengsa-1')).toBe(1);
    expect(itemCount('mandok-bulchimdan')).toBe(1);
    expect(itemCount('daeyang-singdan')).toBe(1);
  });

  test('신품 영약: 1과 지급 + 사문당 1개 한정(두 번째는 sold-out)', () => {
    seed(1000, 0);
    expect(purchase('divine-elixir-limited')).toBe('ok');
    expect(itemCount(DIVINE_ELIXIR_ID)).toBe(1);
    const p = findProduct('divine-elixir-limited')!;
    expect(isSoldOut(p)).toBe(true);
    expect(purchase('divine-elixir-limited')).toBe('sold-out');
    expect(itemCount(DIVINE_ELIXIR_ID)).toBe(1); // 두 번째 지급 안 됨
  });

  test('재료: 영물 정수 골드 구매(자작 신품 경로) — priceOf 단가표', () => {
    seed(0, 100000);
    const p = findProduct('mat-beast-essence')!;
    expect(priceOf(p)).toBe(800); // materialPrice(beast-essence)×1
    expect(purchase('mat-beast-essence')).toBe('ok');
    expect(itemCount('beast-essence')).toBe(1);
    expect(gold()).toBe(100000 - 800);
  });

  test('비급: 다이아 구매 → 코덱스 적재(complete)', () => {
    seed(1000, 0);
    expect(purchase('scroll-baekdok-bulchim')).toBe('ok');
    expect(useCodexStore.getState().hasScroll('dangga-baekdok-bulchim-gong')).toBe(true);
  });

  test('재화 부족: 차감 없이 insufficient', () => {
    seed(0, 0);
    expect(purchase('divine-elixir-limited')).toBe('insufficient');
    expect(itemCount(DIVINE_ELIXIR_ID)).toBe(0);
    expect(dia()).toBe(0);
  });

  test('미구현(특성): coming-soon — 차감·지급 없음', () => {
    seed(0, 100000);
    expect(purchase('trait-poison')).toBe('coming-soon');
    expect(gold()).toBe(100000);
  });
});
