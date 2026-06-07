import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/theme';

// 제자 일러스트 — 그레이박스. 실제 이미지가 들어오면 아래 DISCIPLE_ART에 한 줄 등록.
// 규약: assets/images/disciples/<poolId>.png (이미지 자동배치 룰).
// active=선택됨 → 또렷이(인장 테두리), 아니면 흐리게(dashed·반투명) — "골라서 불 켜지는" 느낌.
const DISCIPLE_ART: Record<string, number> = {
  // 'jang-cheol': require('@/../assets/images/disciples/jang-cheol.png'),
};

interface Props {
  poolId: string;
  name: string;
  active: boolean;
  size?: number;
}

export function DiscipleArt({ poolId, name, active, size = 56 }: Props) {
  const src = DISCIPLE_ART[poolId];
  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size },
        active ? styles.frameActive : styles.frameDim,
      ]}
    >
      {src ? (
        <Image
          source={src}
          style={[styles.img, !active && styles.imgDim]}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.placeholder, active && styles.placeholderActive, { fontSize: size * 0.4 }]}>
          {name?.[0] ?? '?'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.paperLight,
  },
  frameActive: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  frameDim: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    opacity: 0.55,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imgDim: {
    opacity: 0.6,
  },
  placeholder: {
    fontFamily: typography.serifBold,
    color: colors.inkSoft,
  },
  placeholderActive: {
    color: colors.seal,
  },
});
