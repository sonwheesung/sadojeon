import { useNavigationState } from '@react-navigation/native';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TAB_ACTIVE_BG_INSET_H,
  TAB_ACTIVE_BG_INSET_V,
  TAB_BAR_PADDING_V,
} from '@/components/navigation/tabBarConstants';

const ACTIVE_BG_SOURCE = require('../../../assets/images/ui/tab-active-bg.png');

export function ActiveTabBg() {
  const insets = useSafeAreaInsets();
  const focusedIndex = useNavigationState((s) => s?.index ?? 0);
  const totalTabs = useNavigationState((s) => s?.routes.length ?? 0);

  if (totalTabs === 0) return null;

  const widthPct = 100 / totalTabs;
  const leftPct = focusedIndex * widthPct;

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.cellPosition,
          {
            top: TAB_BAR_PADDING_V + TAB_ACTIVE_BG_INSET_V,
            bottom: TAB_BAR_PADDING_V + insets.bottom + TAB_ACTIVE_BG_INSET_V,
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            paddingHorizontal: TAB_ACTIVE_BG_INSET_H,
          },
        ]}
      >
        <Image
          source={ACTIVE_BG_SOURCE}
          style={styles.bgImage}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  cellPosition: {
    position: 'absolute',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
});
