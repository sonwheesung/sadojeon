import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

export interface CodexEntry {
  id: string;
  name?: string; // 해금 시만 존재
  grade?: number; // 해금 시만
  unlocked: boolean;
}

interface CodexGridProps {
  entries: readonly CodexEntry[];
  onPressEntry: (id: string) => void;
}

// 도감 — 3열 그리드 카드. 해금/잠금 시각 분리.
export function CodexGrid({ entries, onPressEntry }: CodexGridProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onPress={() => onPressEntry(entry.id)} />
      ))}
    </ScrollView>
  );
}

function EntryCard({ entry, onPress }: { entry: CodexEntry; onPress: () => void }) {
  if (!entry.unlocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <Text style={styles.lockedMark}>?</Text>
      </View>
    );
  }
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={entry.name}
    >
      <View style={styles.illust}>
        <Text style={styles.illustLabel}>일러스트</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {entry.name}
      </Text>
      <Text style={styles.star}>{starText(entry.grade ?? 0)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    width: '31%',
    aspectRatio: 0.75,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    backgroundColor: colors.paperLight,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardLocked: {
    backgroundColor: colors.paperDark,
    opacity: 0.6,
  },
  illust: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    marginBottom: 4,
  },
  illustLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  lockedMark: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes['3xl'],
    color: colors.inkSoft,
  },
});
