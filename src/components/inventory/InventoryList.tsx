import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

export interface InventoryItem {
  id: string;
  name: string;
  grade: number; // 1~5
  count: number;
  effects: string;
}

interface InventoryListProps {
  items: readonly InventoryItem[];
  actionLabel?: string; // 행 우측 버튼 (예: '사용')
  onAction: (id: string) => void;
}

// 인벤토리 — 항목 목록. 시안 결.
export function InventoryList({ items, actionLabel = '사용', onAction }: InventoryListProps) {
  return (
    <View style={styles.panel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} actionLabel={actionLabel} onAction={onAction} />
        ))}
      </ScrollView>
    </View>
  );
}

function ItemRow({
  item,
  actionLabel,
  onAction,
}: {
  item: InventoryItem;
  actionLabel: string;
  onAction: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.icon} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.star}>{starText(item.grade)}</Text>
          <Text style={styles.count}>×{item.count}</Text>
        </View>
        <Text style={styles.effects} numberOfLines={1}>
          {item.effects}
        </Text>
      </View>
      <Pressable
        style={styles.actionButton}
        onPress={() => onAction(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} ${actionLabel}`}
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    backgroundColor: colors.paperLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  icon: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
  },
  info: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  count: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  effects: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  actionButton: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
});
