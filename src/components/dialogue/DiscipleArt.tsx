import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/theme';

// 제자 일러스트 — 캐릭터마다 3단계(유년·청소년·성년). 두 크롭:
//  • full(선택 화면): 기준 전신(_ref) — 전신 입상·배경 비움 → contain 으로 전체 표시.
//  • upper(인게임 상세): 상체 크롭(disciples/, 전신 상위 55%) — 얼굴~허리 → cover 로 꽉 차게.
// 미등록 캐릭터는 그레이박스(이름 첫 글자) 폴백. active=선택됨 → 또렷이(인장 테두리), 아니면 흐리게.
type Stage = 'child' | 'teen' | 'adult';
type Crop = 'full' | 'upper';

// 전신(_ref) — 선택 화면용.
const ART_FULL: Record<string, Partial<Record<Stage, number>>> = {
  'jang-cheol': {
    child: require('@/../assets/images/cutscenes/_ref/jang-cheol-child.png'),
    teen: require('@/../assets/images/cutscenes/_ref/jang-cheol.png'),
    adult: require('@/../assets/images/cutscenes/_ref/jang-cheol-adult.png'),
  },
  'jin-sohwa': {
    child: require('@/../assets/images/cutscenes/_ref/jin-sohwa-child.png'),
    teen: require('@/../assets/images/cutscenes/_ref/jin-sohwa.png'),
    adult: require('@/../assets/images/cutscenes/_ref/jin-sohwa-adult.png'),
  },
  'han-baram': {
    child: require('@/../assets/images/cutscenes/_ref/han-baram-child.png'),
    teen: require('@/../assets/images/cutscenes/_ref/han-baram.png'),
    adult: require('@/../assets/images/cutscenes/_ref/han-baram-adult.png'),
  },
  'yun-soso': {
    child: require('@/../assets/images/cutscenes/_ref/yun-soso-child.png'),
    teen: require('@/../assets/images/cutscenes/_ref/yun-soso.png'),
    adult: require('@/../assets/images/cutscenes/_ref/yun-soso-adult.png'),
  },
};

// 상체 크롭(disciples/) — 인게임 상세용.
const ART_UPPER: Record<string, Partial<Record<Stage, number>>> = {
  'jang-cheol': {
    child: require('@/../assets/images/disciples/jang-cheol-child.png'),
    teen: require('@/../assets/images/disciples/jang-cheol.png'),
    adult: require('@/../assets/images/disciples/jang-cheol-adult.png'),
  },
  'jin-sohwa': {
    child: require('@/../assets/images/disciples/jin-sohwa-child.png'),
    teen: require('@/../assets/images/disciples/jin-sohwa.png'),
    adult: require('@/../assets/images/disciples/jin-sohwa-adult.png'),
  },
  'han-baram': {
    child: require('@/../assets/images/disciples/han-baram-child.png'),
    teen: require('@/../assets/images/disciples/han-baram.png'),
    adult: require('@/../assets/images/disciples/han-baram-adult.png'),
  },
  'yun-soso': {
    child: require('@/../assets/images/disciples/yun-soso-child.png'),
    teen: require('@/../assets/images/disciples/yun-soso.png'),
    adult: require('@/../assets/images/disciples/yun-soso-adult.png'),
  },
};

interface Props {
  poolId: string;
  name: string;
  active: boolean;
  size?: number; // 너비. height 미지정 시 정사각.
  height?: number; // 세로(인물) 비율용.
  stage?: Stage; // 나이 단계 — 선택 화면=child, 인게임=나이별(기본 teen).
  crop?: Crop; // full=전신(선택), upper=상체(인게임 상세).
}

export function DiscipleArt({ poolId, name, active, size = 56, height, stage = 'teen', crop = 'full' }: Props) {
  const table = crop === 'upper' ? ART_UPPER : ART_FULL;
  const byStage = table[poolId];
  const src = byStage?.[stage] ?? byStage?.teen ?? byStage?.child ?? byStage?.adult;
  const w = size;
  const h = height ?? size;
  return (
    <View
      style={[
        styles.frame,
        { width: w, height: h },
        active ? styles.frameActive : styles.frameDim,
      ]}
    >
      {src ? (
        <Image
          source={src}
          style={[styles.img, !active && styles.imgDim]}
          resizeMode={crop === 'upper' ? 'cover' : 'contain'}
        />
      ) : (
        <Text
          style={[
            styles.placeholder,
            active && styles.placeholderActive,
            { fontSize: Math.min(w, h) * 0.42 },
          ]}
        >
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
