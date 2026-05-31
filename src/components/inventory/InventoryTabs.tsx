import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { INVENTORY_CATEGORIES, INVENTORY_CATEGORY_LABEL, type InventoryCategoryKey } from '@/data/labels';

interface InventoryTabsProps {
  active: InventoryCategoryKey;
  onChange: (key: InventoryCategoryKey) => void;
}

// 인벤토리 — 가로 카테고리 탭. 시안 결 (영약·단약·비급·재료·잡화·패물).
export function InventoryTabs({ active, onChange }: InventoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {INVENTORY_CATEGORIES.map((key) => {
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {INVENTORY_CATEGORY_LABEL[key]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    backgroundColor: colors.paperLight,
  },
  tabActive: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
  },
  label: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  labelActive: {
    fontFamily: typography.serifBold,
    color: colors.paperBright,
  },
});
