import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { useInboxBadgeCount } from '@/hooks/useInboxBadgeCount';
import { colors, spacing, typography } from '@/theme';

export const PROGRESS_BAR_HEIGHT = 100;
export const PROGRESS_BUTTON_SIZE = 84;

// onProgress: 진행 확정 흐름 시작 (부모가 일일 선택 모달을 연다). 실제 advanceTurn 은 모달 확정 시.
// onFastForward: 빠른 진행(자동 넘김) 시작 — 의미 있는 정지 지점까지 부모가 fastForward() 를 돌린다. docs/46.
// busy: 빠른 진행 중 — 두 버튼 모두 비활성(중복 진행 방지).
export function SectProgressBar({
  onProgress,
  onFastForward,
  busy = false,
}: {
  onProgress: () => void;
  onFastForward?: () => void;
  busy?: boolean;
}) {
  const pendingDecisions = useInboxBadgeCount();
  const confirm = useConfirm();

  const blocked = pendingDecisions > 0;
  const disabled = blocked || busy;

  const guardBlocked = async (): Promise<boolean> => {
    // 결정 필요한 서신이 남아 있으면 **진행 불가** — 무시할 수 없다(docs/12). 서신함으로만 유도.
    if (!blocked) return false;
    const goInbox = await confirm({
      title: '먼저 처리할 일이 있습니다',
      message: `서신함에 결정이 필요한 일이 ${pendingDecisions}건 있습니다. 모두 처리해야 하루를 넘길 수 있습니다.`,
      confirmLabel: '서신함으로',
      cancelLabel: '닫기',
    });
    if (goInbox) router.push('/inbox');
    return true; // 어느 쪽이든 진행은 막는다(탈출구 없음).
  };

  const onPress = async () => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => {});
    if (await guardBlocked()) return;
    onProgress();
  };

  const onPressFastForward = async () => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => {});
    if (await guardBlocked()) return;
    onFastForward?.();
  };

  return (
    <View style={styles.row}>
      <View style={styles.buttons}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={blocked ? `진행 불가 — 처리할 서신 ${pendingDecisions}건` : '진행'}
          accessibilityState={{ disabled }}
          hitSlop={8}
          style={({ pressed }) => [styles.button, disabled && styles.buttonBlocked, pressed && styles.buttonPressed]}
        >
          <Text style={[styles.label, disabled && styles.labelBlocked]}>진행</Text>
        </Pressable>
        {onFastForward && (
          <Pressable
            onPress={onPressFastForward}
            accessibilityRole="button"
            accessibilityLabel={busy ? '빠른 진행 중' : '빠른 진행'}
            accessibilityState={{ disabled }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.ffButton,
              disabled && styles.buttonBlocked,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.ffLabel, disabled && styles.labelBlocked]}>{busy ? '진행 중…' : '빠른 진행 ▶▶'}</Text>
          </Pressable>
        )}
      </View>
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
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ffButton: {
    height: PROGRESS_BUTTON_SIZE * 0.62,
    paddingHorizontal: spacing.base,
    borderRadius: PROGRESS_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
  },
  ffLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
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
