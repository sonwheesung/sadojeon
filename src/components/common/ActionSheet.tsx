import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

interface Props {
  visible: boolean;
  title?: string;
  options: readonly string[];
  selected?: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}

export function ActionSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            { paddingBottom: spacing.base + Math.max(insets.bottom, spacing.xs) },
          ]}
        >
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          <View style={styles.options}>
            {options.map((opt) => {
              const isSelected = opt === selected;
              return (
                <Pressable
                  key={opt}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => onSelect(opt)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={styles.cancel}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="취소"
          >
            <Text style={styles.cancelLabel}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  options: {
    gap: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: colors.paperBright,
  },
  optionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  optionLabelSelected: {
    fontFamily: typography.serifBold,
  },
  check: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.seal,
  },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.inkSoft,
  },
});
