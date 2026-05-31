import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import { useAuthStore } from '@/stores/authStore';
import { useSectStore } from '@/stores/sectStore';
import { colors, spacing, typography } from '@/theme';

export const SECT_HEADER_HEIGHT = 44;
export const SECT_HEADER_ICON_SLOT = 32;
export const SECT_HEADER_ICON_SIZE = 22;

const ICON_SETTINGS = require('../../../assets/images/icons/header-settings.png');

const FALLBACK_NAME_KR = '무명산';
const FALLBACK_NAME_CN = '無名山';

export function SectHeader() {
  const dateLabel = useGameDateLabel();
  const sect = useSectStore((s) => s.sect);
  const nameKr = sect?.name ?? FALLBACK_NAME_KR;
  const nameCn = sect?.hanjaName ?? FALLBACK_NAME_CN;
  const confirm = useConfirm();
  const signOut = useAuthStore((s) => s.signOut);

  // 임시: 설정 버튼 = 로그아웃 (추후 설정 메뉴로 확장).
  const onSettings = async () => {
    const ok = await confirm({
      title: '로그아웃',
      message: '로그아웃하시겠습니까? 다음에 아이디·비밀번호로 다시 로그인해야 합니다.',
      confirmLabel: '로그아웃',
      tone: 'danger',
    });
    if (ok) signOut();
  };

  return (
    <View style={styles.row}>
      <View style={styles.group}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정"
          hitSlop={8}
          style={styles.iconButton}
          onPress={onSettings}
        >
          <Image
            source={ICON_SETTINGS}
            style={styles.iconImage}
            contentFit="contain"
            tintColor={colors.ink}
            transition={0}
          />
        </Pressable>
        <SectTitle kr={nameKr} cn={nameCn} />
      </View>
      <View style={styles.group}>
        <DateLabel value={dateLabel} />
        <Slot size={SECT_HEADER_ICON_SLOT} label="서신함" />
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
