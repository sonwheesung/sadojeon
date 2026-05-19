import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// Inner padding to keep content inside the painted ink border of paper-card.png.
// The source asset (887x1774) has the inked frame ~6% from each edge — these
// numbers should be tuned together with the artwork.
export const PAPER_CARD_INSET_H = '6%';
export const PAPER_CARD_INSET_V = '3%';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** When false, children render edge-to-edge ignoring the painted border. */
  insetContent?: boolean;
}

export function PaperCard({ children, style, insetContent = true }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Image
        source={require('../../../assets/images/ui/paper-card.png')}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        transition={0}
      />
      <View style={insetContent ? styles.insetContent : styles.flushContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  insetContent: {
    flex: 1,
    paddingHorizontal: PAPER_CARD_INSET_H,
    paddingVertical: PAPER_CARD_INSET_V,
  },
  flushContent: {
    flex: 1,
  },
});
