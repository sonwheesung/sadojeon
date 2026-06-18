import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { useInboxBadgeCount } from '@/hooks/useInboxBadgeCount';
import { colors, spacing, typography } from '@/theme';

export const PROGRESS_BAR_HEIGHT = 100;
export const PROGRESS_BUTTON_SIZE = 84;

// onProgress: 진행 확정 흐름 시작 (부모가 일일 선택 모달을 연다). 실제 advanceTurn 은 모달 확정 시.
export function SectProgressBar({ onProgress }: { onProgress: () => void }) {
  const pendingDecisions = useInboxBadgeCount();
  const confirm = useConfirm();

  const blocked = pendingDecisions > 0;

  const onPress = async () => {
    Haptics.selectionAsync().catch(() => {});
    // 결정 필요한 서신이 남아 있으면 **진행 불가** — 무시할 수 없다(docs/12). 서신함으로만 유도.
    if (blocked) {
      const goInbox = await confirm({
        title: '먼저 처리할 일이 있습니다',
        message: `서신함에 결정이 필요한 일이 ${pendingDecisions}건 있습니다. 모두 처리해야 하루를 넘길 수 있습니다.`,
        confirmLabel: '서신함으로',
        cancelLabel: '닫기',
      });
      if (goInbox) router.push('/inbox');
      return; // 어느 쪽이든 진행은 막는다(탈출구 없음).
    }
    onProgress();
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={blocked ? `진행 불가 — 처리할 서신 ${pendingDecisions}건` : '진행'}
        accessibilityState={{ disabled: blocked }}
        hitSlop={8}
        style={({ pressed }) => [styles.button, blocked && styles.buttonBlocked, pressed && styles.buttonPressed]}
      >
        <Text style={[styles.label, blocked && styles.labelBlocked]}>진행</Text>
      </Pressable>
      {blocked && <Text style={styles.blockedHint}>처리할 서신 {pendingDecisions}건</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: PROGRESS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  button: {
    width: PROGRESS_BUTTON_SIZE,
    height: PROGRESS_BUTTON_SIZE,
    borderRadius: PROGRESS_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
  },
  buttonPressed: {
    backgroundColor: colors.paperDark,
    opacity: 0.85,
  },
  // 결정 서신이 남아 진행이 막힌 상태 — 흐리게(그레이박스). 누르면 서신함으로 유도.
  buttonBlocked: {
    opacity: 0.4,
    backgroundColor: colors.paperDark,
  },
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  labelBlocked: {
    color: colors.inkSoft,
  },
  blockedHint: {
    marginTop: spacing.xs,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
