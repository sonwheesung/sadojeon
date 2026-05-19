import { StyleSheet, Text, View } from 'react-native';

import { SafetyZone, type SafetyZoneVariant } from '@/components/common/SafetyZone';
import { colors, spacing, typography } from '@/theme';

interface Props {
  title: string;
  hanja?: string;
  subtitle?: string;
  variant?: SafetyZoneVariant;
}

export function ScreenStub({ title, hanja, subtitle, variant }: Props) {
  return (
    <SafetyZone variant={variant}>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {hanja ? <Text style={styles.hanja}>{hanja}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes['2xl'],
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  hanja: {
    marginTop: spacing.sm,
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.xl,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wider,
  },
  subtitle: {
    marginTop: spacing.lg,
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
