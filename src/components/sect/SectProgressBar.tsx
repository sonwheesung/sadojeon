import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const PROGRESS_BAR_HEIGHT = 100;
export const PROGRESS_BUTTON_SIZE = 84;

export function SectProgressBar() {
  return (
    <View style={styles.row}>
      <View style={styles.button}>
        <Text style={styles.label}>進行</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: PROGRESS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  button: {
    width: PROGRESS_BUTTON_SIZE,
    height: PROGRESS_BUTTON_SIZE,
    borderRadius: PROGRESS_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
});
