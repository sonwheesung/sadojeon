import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

// 개발 빌드 전용 — LLM I/O 디버그 패널. __DEV__ false 시 자동 숨김.
// 모달 결과 화면 하단에 접힘 가능 상태로 마운트. 사용자가 [▾] 누르면 펼침.
interface Props {
  prompt?: string;
  raw?: string;
}

const MONO_FAMILY = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function LlmDebugPanel({ prompt, raw }: Props) {
  const [open, setOpen] = useState(false);

  if (!__DEV__) return null;
  if (!prompt && !raw) return null;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={open ? '디버그 접기' : '디버그 펼치기'}
        style={styles.header}
      >
        <Text style={styles.headerLabel}>[ DEV ] LLM I/O</Text>
        <Text style={styles.headerChevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {prompt ? (
            <Section label="PROMPT" content={prompt} />
          ) : null}
          {raw ? (
            <Section label="RAW RESPONSE" content={raw} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <ScrollView
        style={styles.scroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <Text style={styles.code} selectable>
          {content}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wider,
  },
  headerChevron: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  body: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  section: { gap: 4 },
  sectionLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  scroll: {
    maxHeight: 140,
    backgroundColor: colors.paper,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  code: {
    fontFamily: MONO_FAMILY,
    fontSize: 10,
    color: colors.ink,
    lineHeight: 14,
  },
});
