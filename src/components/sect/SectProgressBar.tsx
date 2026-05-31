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

  const onPress = async () => {
    Haptics.selectionAsync().catch(() => {});
    // 결정 필요한 서신이 남아 있으면 진행 전 알림.
    if (pendingDecisions > 0) {
      const proceed = await confirm({
        title: '결정할 사항이 있습니다',
        message: `서신함에 결정이 필요한 일이 ${pendingDecisions}건 남아 있습니다. 먼저 살펴보시겠습니까?`,
        confirmLabel: '서신함으로',
        cancelLabel: '그대로 진행',
      });
      if (proceed) {
        router.push('/inbox');
        return;
      }
    }
    onProgress();
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="진행"
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.label}>진행</Text>
      </Pressable>
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
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
});
