import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

export const SECT_STATUS_MIN_HEIGHT = 130;

// Placeholder data. Replace with sectStore lookups when wiring up.
const DISCIPLINE = [
  { name: '통찰', value: '5/5' },
  { name: '언론', value: '4/5' },
  { name: '위엄', value: '4/5' },
  { name: '인망', value: '4/5' },
];
const MOOD = [
  { name: '도의', value: '3' },
  { name: '무도', value: '0' },
  { name: '결속', value: '2' },
  { name: '균열', value: '1' },
];
const ASSETS = [
  { name: '금화', value: '12,345' },
  { name: '은화', value: '3,210' },
  { name: '동화', value: '8,765' },
];
const RANK = '무명 사문';

export function SectStatus() {
  return (
    <View style={styles.section}>
      <SectionLabel>사문 상태</SectionLabel>
      <View style={styles.columns}>
        <Column label="사부 수양">
          {DISCIPLINE.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 분위기">
          {MOOD.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 자산">
          {ASSETS.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 등급">
          <Text style={styles.rank} numberOfLines={2}>
            {RANK}
          </Text>
        </Column>
      </View>
    </View>
  );
}

function Column({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.columnBody}>{children}</View>
    </View>
  );
}

function StatRow({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: SECT_STATUS_MIN_HEIGHT,
  },
  column: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  columnLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    textAlign: 'center',
  },
  columnBody: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statName: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  statValue: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  rank: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
