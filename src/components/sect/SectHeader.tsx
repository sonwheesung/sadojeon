import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import { colors, spacing, typography } from '@/theme';

export const SECT_HEADER_HEIGHT = 44;
export const SECT_HEADER_ICON_SLOT = 32;
export const SECT_HEADER_ICON_SIZE = 22;

const ICON_SETTINGS = require('../../../assets/images/icons/header-settings.png');

// Placeholder sect identity until sectStore is wired up.
const SECT_NAME_KR = '무명산';
const SECT_NAME_CN = '無名山';

export function SectHeader() {
  const dateLabel = useGameDateLabel();

  return (
    <View style={styles.row}>
      <View style={styles.group}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정"
          hitSlop={8}
          style={styles.iconButton}
        >
          <Image
            source={ICON_SETTINGS}
            style={styles.iconImage}
            contentFit="contain"
            tintColor={colors.ink}
            transition={0}
          />
        </Pressable>
        <SectTitle kr={SECT_NAME_KR} cn={SECT_NAME_CN} />
      </View>
      <View style={styles.group}>
        <DateLabel value={dateLabel} />
        <Slot size={SECT_HEADER_ICON_SLOT} label="인박스" />
      </View>
    </View>
  );
}

function SectTitle({ kr, cn }: { kr: string; cn: string }) {
  return (
    <View style={styles.title} accessible accessibilityLabel={`${kr} ${cn}`}>
      <Text style={styles.titleKr} numberOfLines={1}>
        {kr}
      </Text>
      <Text style={styles.titleCn} numberOfLines={1}>
        ({cn})
      </Text>
    </View>
  );
}

function DateLabel({ value }: { value: string }) {
  return (
    <Text style={styles.dateLabel} numberOfLines={1}>
      {value}
    </Text>
  );
}

interface SlotProps {
  size?: number;
  minWidth?: number;
  flex?: boolean;
  label: string;
}

function Slot({ size, minWidth, flex, label }: SlotProps) {
  return (
    <View
      style={[
        styles.slot,
        size != null && { width: size, height: size },
        minWidth != null && { minWidth, height: SECT_HEADER_ICON_SLOT },
        flex && styles.slotFlex,
      ]}
    >
      <Text style={styles.slotLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: SECT_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexShrink: 1,
  },
  titleKr: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  titleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  dateLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  slot: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  slotFlex: {
    flexShrink: 1,
    height: SECT_HEADER_ICON_SLOT,
  },
  slotLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.normal,
  },
  iconButton: {
    width: SECT_HEADER_ICON_SLOT,
    height: SECT_HEADER_ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: SECT_HEADER_ICON_SIZE,
    height: SECT_HEADER_ICON_SIZE,
  },
});
