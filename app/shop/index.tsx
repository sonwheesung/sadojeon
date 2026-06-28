import { router } from 'expo-router';
import { useReducer, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { productsOfShop, type ShopId, type ShopProduct } from '@/data/shop';
import { canAfford, isSoldOut, priceOf, purchase, type PurchaseResult } from '@/systems/shopSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGameStore } from '@/stores/gameStore';
import { useSectStore } from '@/stores/sectStore';
import type { Disciple } from '@/types';
import { coin } from '@/utils/money';
import { colors, radius, spacing, typography } from '@/theme';

// 상점(그레이박스) — 다이아 상점(캐릭터·비급·신품 한정) / 사문 상점(영약·재료·환전·특성). 정본 docs/50.

const RESULT_MSG: Record<PurchaseResult, string> = {
  ok: '구매했습니다.',
  insufficient: '재화가 부족합니다.',
  'sold-out': '사문당 1개 한정 — 이미 구매했습니다.',
  'coming-soon': '준비 중인 상품입니다.',
  'needs-target': '특성을 부여할 제자를 고르세요.',
  'already-owned': '그 제자는 이미 해당 체질을 지녔습니다.',
  unavailable: '지금은 구매할 수 없습니다.',
};

export default function ShopScreen() {
  const confirm = useConfirm();
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [tab, setTab] = useState<ShopId>('diamond');
  const [msg, setMsg] = useState<string>('');
  const [pickFor, setPickFor] = useState<ShopProduct | null>(null); // 특성 부여 대상 제자 선택 중인 상품

  const diamonds = useGameStore((s) => s.diamonds);
  const resources = useSectStore((s) => s.sect?.resources ?? 0);
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const roster: Disciple[] = order.map((id) => disciples[id]).filter((d): d is Disciple => Boolean(d));

  const products = productsOfShop(tab);

  const runPurchase = async (p: ShopProduct, target?: Disciple) => {
    const priceText = p.currency === 'diamond' ? `다이아 ${priceOf(p)}` : coin(priceOf(p));
    const targetLine = target ? `\n\n대상: ${target.name}` : '';
    const ok = await confirm({
      title: p.title,
      message: `${priceText} 지불하고 구매합니다.${targetLine}\n\n${p.desc}`,
      confirmLabel: '구매',
    });
    if (!ok) return;
    const result = purchase(p.id, target ? { discipleId: target.id } : undefined);
    setMsg(`${p.title} — ${RESULT_MSG[result]}`);
    setPickFor(null);
    force();
  };

  const onBuy = (p: ShopProduct) => () => {
    setMsg('');
    if (p.grant.kind === 'constitution') {
      setPickFor(p); // 제자 선택 단계로
      return;
    }
    void runPurchase(p);
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <View style={styles.header}>
          <Pressable style={styles.back} hitSlop={8} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로">
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>상점</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* 보유 재화 */}
        <Text style={styles.wallet}>다이아 {diamonds}  ·  자금 {coin(resources)}</Text>

        {/* 상점 탭 */}
        <View style={styles.tabs}>
          {(['diamond', 'sect'] as ShopId[]).map((t) => (
            <Pressable key={t} onPress={() => { setTab(t); setMsg(''); setPickFor(null); }} style={[styles.tab, tab === t && styles.tabOn]}>
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelOn]}>{t === 'diamond' ? '다이아 상점' : '사문 상점'}</Text>
            </Pressable>
          ))}
        </View>

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        {/* 특성 부여 — 제자 선택 패널 */}
        {pickFor ? (
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>{pickFor.title} — 부여할 제자</Text>
            {roster.length === 0 ? (
              <Text style={styles.dim}>제자가 없습니다.</Text>
            ) : (
              roster.map((d) => (
                <Pressable key={d.id} onPress={() => void runPurchase(pickFor, d)} style={({ pressed }) => [styles.pickRow, pressed && styles.pressed]}>
                  <Text style={styles.pickName}>{d.name}</Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))
            )}
            <Pressable onPress={() => setPickFor(null)} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
              <Text style={styles.cancelLabel}>취소</Text>
            </Pressable>
          </View>
        ) : null}

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <SectionLabel>{tab === 'diamond' ? '프리미엄 (다이아)' : '사문 (자금)'}</SectionLabel>
          {products.map((p) => {
            const soldOut = isSoldOut(p);
            const afford = canAfford(p);
            const disabled = p.comingSoon || soldOut || !afford;
            const priceText = p.currency === 'diamond' ? `다이아 ${priceOf(p)}` : coin(priceOf(p));
            return (
              <View key={p.id} style={styles.product}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {p.title}
                    {p.limited ? <Text style={styles.tag}>  한정</Text> : null}
                  </Text>
                  <Text style={styles.productDesc}>{p.desc}</Text>
                  <Text style={styles.productPrice}>{priceText}</Text>
                </View>
                <Pressable
                  onPress={onBuy(p)}
                  disabled={disabled}
                  style={({ pressed }) => [styles.btn, disabled && styles.btnOff, pressed && styles.pressed]}
                >
                  <Text style={styles.btnLabel}>
                    {p.comingSoon ? '준비 중' : soldOut ? '구매함' : !afford ? '부족' : '구매'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  title: { flex: 1, textAlign: 'center', fontFamily: typography.serifBold, fontSize: typography.sizes.md, color: colors.ink, letterSpacing: typography.letterSpacing.wide },
  wallet: { textAlign: 'center', fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.seal, marginBottom: spacing.xs },
  tabs: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkSoft, borderRadius: radius.sm, backgroundColor: colors.paperLight },
  tabOn: { borderStyle: 'solid', borderColor: colors.seal, backgroundColor: colors.paperBright },
  tabLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.inkSoft },
  tabLabelOn: { fontFamily: typography.serifBold, color: colors.seal },
  msg: { textAlign: 'center', fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink, marginBottom: spacing.xs },
  picker: { borderWidth: 1, borderStyle: 'solid', borderColor: colors.seal, borderRadius: radius.sm, padding: spacing.sm, gap: 4, marginBottom: spacing.xs, backgroundColor: colors.paperBright },
  pickerTitle: { fontFamily: typography.serifBold, fontSize: typography.sizes.xs, color: colors.seal, marginBottom: 2 },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.inkSoft, borderStyle: 'dashed' },
  pickName: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink },
  chevron: { fontFamily: typography.serif, fontSize: typography.sizes.md, color: colors.inkSoft },
  cancel: { alignItems: 'center', paddingVertical: 6, marginTop: 2 },
  cancelLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.inkSoft },
  dim: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.xs },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.ink },
  tag: { fontFamily: typography.serifBold, fontSize: 10, color: colors.seal },
  productDesc: { fontFamily: typography.serif, fontSize: 10, color: colors.inkLight },
  productPrice: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.seal },
  btn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
    minWidth: 56,
    alignItems: 'center',
  },
  btnLabel: { fontFamily: typography.serifBold, fontSize: typography.sizes.xs, color: colors.seal },
  btnOff: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
