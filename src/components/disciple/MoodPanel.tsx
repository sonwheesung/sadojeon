import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface MoodPanelProps {
  lines: readonly string[]; // 풍경 텍스트 3줄 (성격 인상·관계·특기)
}

// 제자 상세 — 풍경 텍스트 패널. 통찰 차등으로 숨겨진 축을 텍스트로만 노출.
// docs/03 "풍경으로 보이는" 4축 (성격 인상·마음 상태·관계 풍경·위험 신호).
export function MoodPanel({ lines }: MoodPanelProps) {
  return (
    <View style={styles.panel}>
      {lines.map((line, idx) => (
        <Text key={idx} style={styles.line} numberOfLines={1}>
          · {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  line: {
    fontFamily: typography.serifLight,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wide,
  },
});
