export const typography = {
  serif: 'NotoSerifKR-Regular',
  serifBold: 'NotoSerifKR-Bold',
  serifLight: 'NotoSerifKR-Light',
  serifMedium: 'NotoSerifKR-Medium',

  serifCN: 'NotoSerifSC-Regular',
  serifCNBold: 'NotoSerifSC-Bold',

  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
    wider: 2,
  },
} as const;

export type FontSize = keyof typeof typography.sizes;
