import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { CODEX_ACTION_LABEL } from '@/data/labels';

interface CodexActionsProps {
  onSort: () => void;
  onClose: () => void;
}

// 도감 — 하단 액션 버튼 2개. 정렬·닫기.
export function CodexActions({ onSort, onClose }: CodexActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, styles.buttonLarge]}
        onPress={onSort}
        accessibilityRole="button"
        accessibilityLabel={CODEX_ACTION_LABEL.sort}
      >
        <Text style={styles.label}>{CODEX_ACTION_LABEL.sort}</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={CODEX_ACTION_LABEL.close}
      >
        <Text style={styles.label}>{CODEX_ACTION_LABEL.close}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
  },
  buttonLarge: { flex: 2 },
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wider,
  },
});
