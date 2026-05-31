import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { usePendingStore } from '@/stores/pendingStore';
import type { DailyLogKind } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  discipleId: string;
}

// 제자 상세 화면의 "오늘의 일지" — 메인 패널의 짧은 줄을 펼친 풀 풍경.
// usePendingStore.dailyLog 에서 그 제자 entries 만 필터링.
export function DiscipleTodayLog({ discipleId }: Props) {
  const log = usePendingStore((s) => s.dailyLog);
  const entries = log?.entries.filter((e) => e.discipleId === discipleId) ?? [];

  return (
    <View style={styles.section}>
      <SectionLabel>오늘의 일지</SectionLabel>
      <View style={styles.panel}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>오늘은 아직 적힌 일이 없다.</Text>
        ) : (
          entries.map((e) => (
            <Text key={e.id} style={[styles.line, lineStyle(e.kind)]}>
              · {e.text}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

function lineStyle(kind: DailyLogKind) {
  switch (kind) {
    case 'promotion':
      return styles.linePromotion;
    case 'collapse':
      return styles.lineCollapse;
    case 'plateau':
      return styles.linePlateau;
    case 'stamina_drop':
      return styles.lineStaminaDrop;
    case 'stamina_rise':
      return styles.lineStaminaRise;
    case 'override':
      return styles.lineOverride;
    default:
      return styles.lineDefault;
  }
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: typography.sizes.sm * 1.5,
  },
  lineDefault: { color: colors.inkLight },
  linePromotion: {
    fontFamily: typography.serifBold,
    color: colors.brown,
  },
  lineCollapse: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  linePlateau: {
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  lineStaminaDrop: {
    fontFamily: typography.serifMedium,
    color: colors.sealDark,
  },
  lineStaminaRise: {
    fontFamily: typography.serifMedium,
    color: colors.green,
  },
  lineOverride: {
    color: colors.inkLight,
    fontStyle: 'italic',
  },
});
