import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OVERRIDE_DURATION_DEFAULT,
  OVERRIDE_DURATION_OPTIONS,
  OVERRIDE_LABEL,
  issueOverride,
} from '@/systems/overrideSystem';
import type { DiscipleOverrideCommand } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

type Command = Exclude<DiscipleOverrideCommand, 'default'>;

interface Props {
  visible: boolean;
  discipleId: string | null;
  discipleName: string | null;
  command: Command | null;
  onClose: () => void;
}

// 폐관·의뢰·치료 명령 발행 시 기간 선택 모달.
// 7/14/28일 옵션. 확정 시 issueOverride() 호출.
export function CommandPeriodModal({
  visible,
  discipleId,
  discipleName,
  command,
  onClose,
}: Props) {
  const [days, setDays] = useState<number>(OVERRIDE_DURATION_DEFAULT);

  const onConfirm = () => {
    if (!discipleId || !command) {
      onClose();
      return;
    }
    issueOverride(discipleId, command, days);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {discipleName ?? '제자'} — {command ? OVERRIDE_LABEL[command] : ''}
          </Text>
          <Text style={styles.subtitle}>기간 동안 사문 디폴트 일정을 따르지 않습니다.</Text>

          <View style={styles.row}>
            {OVERRIDE_DURATION_OPTIONS.map((n) => {
              const selected = n === days;
              return (
                <Pressable
                  key={n}
                  onPress={() => setDays(n)}
                  accessibilityRole="button"
                  accessibilityLabel={`${n}일`}
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text
                    style={[styles.optionLabel, selected && styles.optionLabelSelected]}
                  >
                    {n}일
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="취소"
            >
              <Text style={styles.cancelLabel}>취소</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="확정"
            >
              <Text style={styles.confirmLabel}>확정 ▶</Text>
            </Pressable>
          </View>
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
    maxWidth: 380,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.paperBright,
    borderStyle: 'solid',
    borderColor: colors.seal,
  },
  optionLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  optionLabelSelected: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  cancel: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  confirm: {
    flex: 2,
    height: 44,
    borderWidth: 2,
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  pressed: {
    opacity: 0.85,
  },
});
