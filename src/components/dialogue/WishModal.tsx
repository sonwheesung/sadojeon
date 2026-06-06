import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDiscipleStore } from '@/stores/discipleStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { isDebugOverlayActive, usePendingStore } from '@/stores/pendingStore';
import { acceptWish, rejectWish } from '@/systems/wishSystem';
import { colors, radius, spacing, typography } from '@/theme';

// 제자 희망 모달 — 2선택 (허락/거절) + LLM 호출.
// 응답 직후 모달 즉시 닫힘 (사용자 의도 — PM 결).
// 결과는 다음 정산 모달에 누적 표시.
export function WishModal() {
  const pending = usePendingStore((s) => s.wish);
  const settlement = usePendingStore((s) => s.settlement);
  const debugActive = usePendingStore(isDebugOverlayActive);
  const moralPending = useMoralEventStore((s) => s.pending);
  const disciple = useDiscipleStore((s) =>
    pending ? s.disciples[pending.discipleId] : undefined,
  );
  const blocked = moralPending != null || settlement != null || debugActive;
  const visible = !blocked && pending != null && disciple != null;

  // 선택 즉시 모달 닫힘 — LLM 응답은 백그라운드. 진행 시 정산이 대기.
  const onAccept = () => void acceptWish().catch(() => {});
  const onReject = () => void rejectWish().catch(() => {});

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (pending) onReject();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {disciple && pending ? (
            <>
              <Text style={styles.speaker}>{disciple.name}</Text>
              <Text style={styles.body}>{pending.body}</Text>
              <View style={styles.divider} />
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
                  onPress={onReject}
                  accessibilityRole="button"
                  accessibilityLabel="거절"
                >
                  <Text style={styles.btnLabel}>아니, 일정대로 해라.</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.btn, styles.btnAccept, pressed && styles.pressed]}
                  onPress={onAccept}
                  accessibilityRole="button"
                  accessibilityLabel="허락"
                >
                  <Text style={[styles.btnLabel, styles.btnLabelAccept]}>좋다. 그리 하여라.</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  speaker: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.xs,
  },
  actions: { gap: spacing.xs },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    alignItems: 'center',
  },
  btnAccept: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  btnLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  btnLabelAccept: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  pressed: { opacity: 0.85 },
});
