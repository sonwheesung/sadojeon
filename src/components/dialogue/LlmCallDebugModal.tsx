import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { isDebugOverlayActive, usePendingStore } from '@/stores/pendingStore';
import { colors, radius, spacing, typography } from '@/theme';

// [DEV] 직전 LLM 호출의 요청(프롬프트)·응답(raw)을 응답 직후 즉시 띄우는 오버레이.
// 사용자가 4선택/희망/도덕에 응답 → pushLlmDebug → 이 모달이 바로 뜸.
// __DEV__ false 또는 LLM 미호출(룰 폴백, prompt/raw 없음) 시 표시 X.
// [닫기] → clearLastDebug → 가려졌던 다음 일상 모달이 이어서 표시.

const MONO_FAMILY = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export function LlmCallDebugModal() {
  const debug = usePendingStore((s) => s.lastDebug);
  const active = usePendingStore(isDebugOverlayActive);
  const clear = usePendingStore((s) => s.clearLastDebug);

  if (!active || !debug) {
    return <Modal visible={false} transparent />;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={clear}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>[ DEV ] LLM 호출</Text>
            <Text style={[styles.tag, debug.llmCalled ? styles.tagLlm : styles.tagRule]}>
              {debug.llmCalled ? 'LLM 응답' : '룰 폴백'}
            </Text>
          </View>
          <Text style={styles.caption}>
            {debug.source} · {debug.discipleName}
          </Text>

          <Section label="요청 (PROMPT)" content={debug.prompt ?? '(없음)'} />
          <Section label="응답 (RESPONSE)" content={debug.raw ?? '(없음)'} />

          <Pressable
            style={({ pressed }) => [styles.confirm, pressed && styles.confirmPressed]}
            onPress={clear}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Text style={styles.confirmLabel}>닫기 ▶</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wider,
  },
  tag: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
    letterSpacing: typography.letterSpacing.wide,
  },
  tagLlm: {
    color: colors.paper,
    backgroundColor: colors.seal,
  },
  tagRule: {
    color: colors.inkSoft,
    backgroundColor: colors.paperDark,
  },
  caption: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  section: { gap: 4 },
  sectionLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  scroll: {
    maxHeight: 200,
    backgroundColor: colors.paperDark,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  code: {
    fontFamily: MONO_FAMILY,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 16,
  },
  confirm: {
    marginTop: spacing.xs,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  confirmPressed: { opacity: 0.85 },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
});
