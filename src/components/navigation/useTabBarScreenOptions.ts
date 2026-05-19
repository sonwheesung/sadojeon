import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/common/HapticTab';
import { ActiveTabBg } from '@/components/navigation/ActiveTabBg';
import {
  TAB_BAR_BORDER_WIDTH,
  TAB_BAR_HEIGHT,
  TAB_BAR_LABEL_LINE_HEIGHT,
  TAB_BAR_LABEL_MARGIN_TOP,
  TAB_BAR_LABEL_SIZE,
  TAB_BAR_PADDING_V,
} from '@/components/navigation/tabBarConstants';
import { colors, typography } from '@/theme';

// Re-export constants so existing import sites keep working.
export {
  TAB_BAR_BORDER_WIDTH,
  TAB_BAR_HEIGHT,
  TAB_BAR_LABEL_LINE_HEIGHT,
  TAB_BAR_LABEL_MARGIN_TOP,
  TAB_BAR_LABEL_SIZE,
  TAB_BAR_PADDING_V,
};

export function useTabBarScreenOptions(): BottomTabNavigationOptions {
  const insets = useSafeAreaInsets();

  return {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: () => createElement(ActiveTabBg),
    tabBarActiveTintColor: colors.ink,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.tabBorder,
      borderTopWidth: TAB_BAR_BORDER_WIDTH,
      height: TAB_BAR_HEIGHT + insets.bottom,
      paddingTop: TAB_BAR_PADDING_V,
      paddingBottom: TAB_BAR_PADDING_V + insets.bottom,
      elevation: 0,
    },
    tabBarLabelStyle: {
      fontFamily: typography.serif,
      fontSize: TAB_BAR_LABEL_SIZE,
      lineHeight: TAB_BAR_LABEL_LINE_HEIGHT,
      marginTop: TAB_BAR_LABEL_MARGIN_TOP,
      letterSpacing: typography.letterSpacing.wide,
    },
    tabBarBadgeStyle: {
      backgroundColor: colors.seal,
      color: colors.paperBright,
      fontFamily: typography.serifBold,
      fontSize: 10,
      minWidth: 16,
      height: 16,
      lineHeight: 16,
      borderRadius: 8,
    },
    tabBarItemStyle: {
      paddingTop: 0,
    },
    sceneStyle: {
      backgroundColor: colors.paper,
    },
  };
}
