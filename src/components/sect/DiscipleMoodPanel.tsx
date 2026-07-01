import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { discipleMoodLine } from '@/systems/discipleMoodSystem';
import { colors, radius, spacing, typography } from '@/theme';

// 제자들의 낌새 — 사부 시점의 짧은 관찰. 일과 화면 상시 표시 (일지와 달리 데이터에 의존 X).
// 졸업·하산 제자는 제외. 문장은 discipleMoodSystem 이 상태에서 도출.
export function DiscipleMoodPanel() {
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const overrides = useScheduleStore((s) => s.overrides);
  const totalDay = useTimeStore((s) => s.totalDay);

  const rows = order
    .map((id) => disciples[id])
    .filter((d) => d && d.status !== 'graduated' && d.status !== 'departed' && d.status !== 'runaway');

  if (rows.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel>문하</SectionLabel>
      <View style={styles.panel}>
        {rows.map((d) => {
          const ov = overrides[d!.id];
          const active =
            ov && ov.command !== 'default' && totalDay < ov.startedAtDay + ov.durationDays
              ? ov.command
              : null;
          return (
            <View key={d!.id} style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {d!.name}
              </Text>
              <Text style={styles.line} numberOfLines={2}>
                {discipleMoodLine(d!, active, totalDay)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    width: 56,
  },
  line: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
  },
});
