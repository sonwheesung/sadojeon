import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';

interface ProgressBarProps {
  label?: string; // 좌측 라벨 (예: '진행도')
  progress: number; // 0~100
  rightLabel?: string; // 우측 라벨 (예: '22%')
}

// 무공 학습 — 단계 내 진행도 막대. 0~100.
export function ProgressBar({ label = '진행도', progress, rightLabel }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const right = rightLabel ?? `${Math.round(clamped)}%`;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
      <Text style={styles.right}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    width: 56,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  track: {
    flex: 1,
    height: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.paper,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.ink,
  },
  right: {
    width: 48,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'right',
  },
});
