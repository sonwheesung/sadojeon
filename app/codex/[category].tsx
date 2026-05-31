import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  CodexActions,
  CodexGrid,
  CodexHeader,
  CodexTabs,
  type CodexEntry,
} from '@/components/codex';
import {
  CODEX_CATEGORIES,
  CODEX_CATEGORY_LABEL,
  CODEX_CATEGORY_LABEL_HANJA,
  type CodexCategoryKey,
} from '@/data/labels';
import { colors, spacing, typography } from '@/theme';

// 사용자 시안 결 (image-cache/6.png) — 무공 도감 카테고리 화면.

// ─── Placeholder data ──────────────────────────────────────────────────────

const ENTRIES_BY_CATEGORY: Partial<Record<CodexCategoryKey, readonly CodexEntry[]>> = {
  sword: [
    { id: 'cheongpung', name: '청풍검법', grade: 3, unlocked: true },
    { id: 'baekun', name: '백운검', grade: 2, unlocked: true },
    { id: 'yugwang', name: '유광검', grade: 4, unlocked: true },
    { id: 'nakyeop', name: '낙엽검', grade: 2, unlocked: true },
    { id: 'muyeong', name: '무영검', grade: 3, unlocked: true },
    { id: 's6', unlocked: false },
    { id: 's7', unlocked: false },
    { id: 's8', unlocked: false },
    { id: 's9', unlocked: false },
  ],
};

const FOUND_BY_CATEGORY: Record<CodexCategoryKey, number> = {
  sword: 5, saber: 0, fist: 0, palm: 0, lightness: 0, internal: 0, external: 0, hidden: 0,
};

const TOTAL_BY_CATEGORY: Record<CodexCategoryKey, number> = {
  sword: 25, saber: 22, fist: 20, palm: 18, lightness: 15, internal: 28, external: 24, hidden: 20,
};

function isCategoryKey(v: string | undefined): v is CodexCategoryKey {
  return v != null && (CODEX_CATEGORIES as readonly string[]).includes(v);
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function CodexScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const initial: CodexCategoryKey = isCategoryKey(category) ? category : 'sword';
  const [active, setActive] = useState<CodexCategoryKey>(initial);

  const entries = ENTRIES_BY_CATEGORY[active] ?? [];

  const handlePressEntry = (id: string) => {
    // 추후: 무공 상세 (martial-art 화면)로 이동
    void id;
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        <View style={styles.body}>
          <CodexHeader
            hanjaCategory={CODEX_CATEGORY_LABEL_HANJA[active]}
            koreanCategory={CODEX_CATEGORY_LABEL[active]}
            foundCount={FOUND_BY_CATEGORY[active]}
            totalCount={TOTAL_BY_CATEGORY[active]}
          />
          <CodexTabs active={active} onChange={setActive} />
          <CodexGrid entries={entries} onPressEntry={handlePressEntry} />
        </View>
        <View style={styles.footer}>
          <CodexActions onSort={() => { /* 추후 */ }} onClose={() => router.back()} />
        </View>
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>무공 도감</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
