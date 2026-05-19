import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

const LABEL_BG = require('../../../assets/images/ui/section-label.png');

export const SECTION_LABEL_HEIGHT = 32;
export const SECTION_LABEL_PADDING_H = 20;

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionLabel({ children, style }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={LABEL_BG}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        transition={0}
      />
      <Text style={styles.text} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    height: SECTION_LABEL_HEIGHT,
    paddingHorizontal: SECTION_LABEL_PADDING_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.paperBright,
    letterSpacing: typography.letterSpacing.wide,
  },
});
