import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';

interface InventoryHeaderProps {
  hanjaCategory: string; // 한자 카테고리 (예: '靈藥')
  koreanCategory: string; // 한글 카테고리 (예: '영약')
  ownedCount: number;
  codexTotal: number;
}

// 인벤토리 — 상단 카테고리 헤더 패널. 시안 결.
export function InventoryHeader({
  hanjaCategory,
  koreanCategory,
  ownedCount,
  codexTotal,
}: InventoryHeaderProps) {
  return (
    <View style={styles.scroll}>
      <View style={styles.illust}>
        <Text style={styles.illustLabel}>일러스트</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.hanja} numberOfLines={1}>
          {hanjaCategory}
        </Text>
        <Text style={styles.korean} numberOfLines={1}>
          {koreanCategory}
        </Text>
      </View>
      <Text style={styles.count}>
        보유 {ownedCount} / 도감 {codexTotal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.paperLight,
  },
  illust: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  illustLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  hanja: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['2xl'],
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  korean: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
  },
  count: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'right',
  },
});
