import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  InventoryActions,
  InventoryHeader,
  InventoryList,
  InventoryTabs,
} from '@/components/inventory';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABEL,
  INVENTORY_CATEGORY_LABEL_HANJA,
  type InventoryCategoryKey,
} from '@/data/labels';
import { useItemStore } from '@/stores/itemStore';
import { colors, spacing, typography } from '@/theme';

// 인벤토리 카테고리 화면 — 회차(사문)별 물품을 itemStore(DB 동기화)에서 읽는다.
// 카테고리 전환은 가로 탭으로. 라우트 파라미터는 초기 카테고리.

// 도감 총량(분모)은 별도 도감 시스템 — 추후 연결. 지금은 플레이스홀더.
const CODEX_TOTAL: Record<InventoryCategoryKey, number> = {
  elixir: 50, pill: 30, scroll: 80, material: 40, misc: 20, trinket: 15,
};

function isCategoryKey(v: string | undefined): v is InventoryCategoryKey {
  return v != null && (INVENTORY_CATEGORIES as readonly string[]).includes(v);
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function InventoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const initial: InventoryCategoryKey = isCategoryKey(category) ? category : 'elixir';
  const [active, setActive] = useState<InventoryCategoryKey>(initial);

  const allItems = useItemStore((s) => s.items);
  const items = allItems.filter((i) => i.category === active);
  const ownedCount = items.reduce((sum, i) => sum + i.count, 0);

  const handleAction = (id: string) => {
    // 추후: 사용·소비 로직 (변경이므로 useConfirm 거칠 것).
    void id;
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        <View style={styles.body}>
          <InventoryHeader
            hanjaCategory={INVENTORY_CATEGORY_LABEL_HANJA[active]}
            koreanCategory={INVENTORY_CATEGORY_LABEL[active]}
            ownedCount={ownedCount}
            codexTotal={CODEX_TOTAL[active]}
          />
          <InventoryTabs active={active} onChange={setActive} />
          <InventoryList items={items} onAction={handleAction} />
        </View>
        <View style={styles.footer}>
          <InventoryActions onSort={() => { /* 추후 */ }} onClose={() => router.back()} />
        </View>
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>인벤토리</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
