import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface NextRequirementProps {
  text: string; // 예: '실전 경험 + 절품 영약 필요'
}

// 무공 학습 — 다음 단계 조건 텍스트. 시안 결의 한 줄 안내.
export function NextRequirement({ text }: NextRequirementProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>다음 단계:</Text>
      <Text style={styles.value} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  value: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
});
