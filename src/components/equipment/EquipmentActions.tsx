import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { EQUIPMENT_ACTION_LABEL } from '@/data/labels';

interface EquipmentActionsProps {
  onUnequip: () => void;
  onClose: () => void;
}

// 장비 슬롯 — 하단 액션 버튼 2개. 해제·닫기.
export function EquipmentActions({ onUnequip, onClose }: EquipmentActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={onUnequip}
        accessibilityRole="button"
        accessibilityLabel={EQUIPMENT_ACTION_LABEL.unequip}
      >
        <Text style={styles.label}>{EQUIPMENT_ACTION_LABEL.unequip}</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={EQUIPMENT_ACTION_LABEL.close}
      >
        <Text style={styles.label}>{EQUIPMENT_ACTION_LABEL.close}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
  },
  label: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wider,
  },
});
