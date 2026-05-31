import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { usePendingStore } from '@/stores/pendingStore';
import { colors, radius, spacing, typography } from '@/theme';

// 변곡점 모달 — 승급/탈진 등 절대 놓치면 안 되는 사건. 큐에서 하나씩 pop.
// 우선순위는 app/(tabs)/index.tsx 에서: Report > Setup > Milestone > Wish > OneLiner.
export function MilestoneModal() {
  const milestones = usePendingStore((s) => s.milestones);
  const pop = usePendingStore((s) => s.popMilestone);

  const current = milestones[0];
  const visible = current != null;

  if (!visible) {
    return <Modal visible={false} transparent />;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={pop}>
      <View style={styles.backdrop}>
        <View style={[styles.card, current.kind === 'collapse' && styles.cardCollapse]}>
          <Text
            style={[
              styles.title,
              current.kind === 'collapse' ? styles.titleCollapse : styles.titlePromotion,
            ]}
          >
            {current.title}
          </Text>
          <Text style={styles.speaker}>{current.discipleName}</Text>
          <Text style={styles.body}>{current.body}</Text>

          <Pressable
            style={({ pressed }) => [styles.confirm, pressed && styles.confirmPressed]}
            onPress={pop}
            accessibilityRole="button"
            accessibilityLabel="확인"
          >
            <Text style={styles.confirmLabel}>알겠다 ▶</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardCollapse: {
    borderColor: colors.seal,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  titlePromotion: {
    color: colors.brown,
  },
  titleCollapse: {
    color: colors.seal,
  },
  speaker: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.6,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  confirm: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
    borderRadius: radius.sm,
  },
  confirmPressed: { opacity: 0.85 },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
});
