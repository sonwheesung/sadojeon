import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { TALENT_AXES, TALENT_LABEL, starText, type TalentAxisKey } from '@/data/labels';
import type { Talents } from '@/types';

interface TalentPanelProps {
  talents: Talents;
}

// 제자 상세 — 재능 5축 게이지 패널. docs/03_제자_시스템.md.
// 게이지는 1~5 별 등급을 dashed 막대 + 별 텍스트로 표현.
// 통찰 차등 노출 정책은 추후 (현재 그레이박스: 5축 모두 표시).
export function TalentPanel({ talents }: TalentPanelProps) {
  return (
    <View style={styles.panel}>
      {TALENT_AXES.map((axis) => (
        <TalentRow key={axis} axis={axis} value={talents[axis as keyof Talents]} />
      ))}
    </View>
  );
}

function TalentRow({ axis, value }: { axis: TalentAxisKey; value: number }) {
  const rank = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{TALENT_LABEL[axis]}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${(rank / 5) * 100}%` }]} />
      </View>
      <Text style={styles.star}>{starText(rank)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.paperLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
    width: 48,
    letterSpacing: typography.letterSpacing.wide,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.paper,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.ink,
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.seal,
    width: 64,
    textAlign: 'right',
  },
});
