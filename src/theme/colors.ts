export const colors = {
  paper: '#D4C5A0',
  paperDark: '#B8A584',
  paperLight: '#E5D8B5',

  ink: '#2C2418',
  inkLight: '#5C4D38',
  inkSoft: '#8B7B5C',

  seal: '#8B3A3A',
  sealDark: '#6B2C2C',

  gold: '#B89860',
  green: '#5A7A5A',
  gray: '#8B7B5C',
  brown: '#6B5A3A',
  red: '#8B3A3A',

  background: '#1A1612',
  card: '#D4C5A0',
  border: '#6B4423',

  paperBright: '#F5E8D0',
  tabBorder: '#3D2F1F',
  tabInactive: '#6B5A3E',

  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
