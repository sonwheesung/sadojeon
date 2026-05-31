import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { usePendingStore } from '@/stores/pendingStore';
import { groupLogByDisciple } from '@/systems/dailyLogSystem';
import type { DailyLogKind } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

// 오늘의 일지 — 메인 상단 인라인 패널.
// 어제 → 오늘 사이 각 제자가 무엇을 했는지 한 줄 요약.
// 줄 탭 → 그 제자 상세 화면으로 이동 (상세는 거기서).
// 헤더 탭 → 패널 전체 접힘 (양이 많을 때).
export function DailyLogPanel() {
  const log = usePendingStore((s) => s.dailyLog);
  const [collapsedAll, setCollapsedAll] = useState(false);

  if (!log || log.entries.length === 0) return null;

  const groups = groupLogByDisciple(log);

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.header}
        onPress={() => setCollapsedAll((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={collapsedAll ? '일지 펼치기' : '일지 접기'}
      >
        <SectionLabel>오늘의 일지</SectionLabel>
        <Text style={styles.chevron}>{collapsedAll ? '▾' : '▴'}</Text>
      </Pressable>
      {!collapsedAll && (
        <View style={styles.panel}>
          {groups.map((g) => (
            <Pressable
              key={g.discipleId}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.push(`/disciple/${g.discipleId}`)}
              accessibilityRole="button"
              accessibilityLabel={`${g.discipleName} 상세`}
            >
              <Text style={styles.shortText} numberOfLines={1}>
                <Text style={styles.shortName}>{g.discipleName}</Text>
                <Text style={styles.shortDash}> — </Text>
                <Text style={[styles.shortLabel, primaryStyle(g.primaryKind)]}>
                  {g.primaryLabel}
                </Text>
              </Text>
              <Text style={styles.chevronSmall}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function primaryStyle(kind: DailyLogKind) {
  switch (kind) {
    case 'promotion':
      return styles.primaryPromotion;
    case 'collapse':
      return styles.primaryCollapse;
    case 'plateau':
      return styles.primaryPlateau;
    case 'stamina_drop':
      return styles.primaryStaminaDrop;
    case 'stamina_rise':
      return styles.primaryStaminaRise;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.ink,
    paddingHorizontal: spacing.sm,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowPressed: {
    opacity: 0.6,
  },
  shortText: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  shortName: {
    fontFamily: typography.serifBold,
    color: colors.ink,
  },
  shortDash: {
    color: colors.inkSoft,
  },
  shortLabel: {
    color: colors.inkLight,
  },
  primaryPromotion: {
    fontFamily: typography.serifBold,
    color: colors.brown,
  },
  primaryCollapse: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  primaryPlateau: {
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  primaryStaminaDrop: {
    fontFamily: typography.serifMedium,
    color: colors.sealDark,
  },
  primaryStaminaRise: {
    fontFamily: typography.serifMedium,
    color: colors.green,
  },
  chevronSmall: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.inkSoft,
    paddingHorizontal: spacing.xs,
  },
});
