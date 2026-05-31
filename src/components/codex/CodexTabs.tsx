import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { CODEX_CATEGORIES, CODEX_CATEGORY_LABEL, type CodexCategoryKey } from '@/data/labels';

interface CodexTabsProps {
  active: CodexCategoryKey;
  onChange: (key: CodexCategoryKey) => void;
}

// 도감 — 가로 갈래 탭 8종 (검법·도법·권법·장법·보법·내공·외공·암기).
export function CodexTabs({ active, onChange }: CodexTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {CODEX_CATEGORIES.map((key) => {
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {CODEX_CATEGORY_LABEL[key]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.paperLight,
  },
  tabActive: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
  },
  label: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  labelActive: {
    fontFamily: typography.serifBold,
    color: colors.paperBright,
  },
});
