import type { LucideIcon } from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';

// PNG icons are normalized so content occupies a constant height fraction of
// the canvas; canvas WIDTH varies with content aspect. Rendering with a fixed
// height + aspectRatio keeps every icon at the same visible height across the
// tab bar regardless of how wide or tall the artwork is.
export const TAB_ICON_HEIGHT = 22;
export const TAB_ICON_FOCUSED_OPACITY = 1;
export const TAB_ICON_UNFOCUSED_OPACITY = 0.85;
export const TAB_ICON_FOCUSED_STROKE = 2.25;
export const TAB_ICON_UNFOCUSED_STROKE = 1.75;

interface BaseProps {
  color: string;
  focused: boolean;
  height?: number;
}

type PngProps = BaseProps & {
  source: ImageSourcePropType;
  aspectRatio: number; // canvas_width / canvas_height (from icon-alpha.mjs output)
  Icon?: never;
};
type LucideProps = BaseProps & { Icon: LucideIcon; source?: never; aspectRatio?: never };

export type TabBarIconProps = PngProps | LucideProps;

export function TabBarIcon(props: TabBarIconProps) {
  const { color, focused, height = TAB_ICON_HEIGHT } = props;
  const opacity = focused ? TAB_ICON_FOCUSED_OPACITY : TAB_ICON_UNFOCUSED_OPACITY;

  return (
    <View style={[styles.wrapper, { opacity }]}>
      {'source' in props && props.source !== undefined ? (
        <Image
          source={props.source}
          style={{
            height,
            aspectRatio: props.aspectRatio,
            tintColor: color,
          }}
          resizeMode="contain"
        />
      ) : (
        <props.Icon
          color={color}
          size={height}
          strokeWidth={focused ? TAB_ICON_FOCUSED_STROKE : TAB_ICON_UNFOCUSED_STROKE}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
