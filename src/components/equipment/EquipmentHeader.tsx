import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

interface EquipmentHeaderProps {
  name: string; // 한글 이름
  hanjaName: string; // 한자 이름
  grade: number; // 1~5
  effects: string; // 효과 텍스트 한 줄
}

// 장비 슬롯 — 상단 헤더 패널. 시안 결 (양피지 두루마리 + 일러스트 + 이름·등급·효과).
// 그레이박스 단계: 일러스트는 dashed placeholder.
export function EquipmentHeader({ name, hanjaName, grade, effects }: EquipmentHeaderProps) {
  return (
    <View style={styles.scroll}>
      <View style={styles.illust}>
        <Text style={styles.illustLabel}>장비 일러스트</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.hanja} numberOfLines={1}>
          {hanjaName}
        </Text>
        <Text style={styles.korean} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.star}>{starText(grade)}</Text>
        <Text style={styles.effects} numberOfLines={1}>
          {effects}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.base,
    backgroundColor: colors.paperLight,
  },
  illust: {
    width: 120,
    height: 140,
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
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  hanja: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['2xl'],
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  korean: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.seal,
    marginTop: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  effects: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
});
