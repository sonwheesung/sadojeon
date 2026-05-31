import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';

interface CodexHeaderProps {
  hanjaCategory: string;
  koreanCategory: string;
  foundCount: number;
  totalCount: number;
}

// 도감 — 상단 카테고리 헤더. 시안 결 (양피지 두루마리 + 일러스트 + 발견 진행도).
export function CodexHeader({
  hanjaCategory,
  koreanCategory,
  foundCount,
  totalCount,
}: CodexHeaderProps) {
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
        발견 {foundCount} / {totalCount}
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
