import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

interface MartialArtHeaderProps {
  name: string; // 한글 이름
  hanjaName: string; // 한자 이름
  school: string; // 갈래 (예: '검법')
  grade: number; // 1~5 (★ 등급)
}

// 무공 학습 — 상단 헤더 패널. 시안 결 (양피지 두루마리 + 일러스트 + 이름·갈래·등급).
// 그레이박스 단계: 일러스트는 dashed placeholder. 폴리시 단계에서 실제 일러스트 차입.
export function MartialArtHeader({ name, hanjaName, school, grade }: MartialArtHeaderProps) {
  return (
    <View style={styles.scroll}>
      <View style={styles.illust}>
        <Text style={styles.illustLabel}>무공 일러스트</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.hanja} numberOfLines={1}>
          {hanjaName}
        </Text>
        <Text style={styles.korean} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.school}>— {school} —</Text>
        <Text style={styles.star}>{starText(grade)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.base,
    backgroundColor: colors.paperLight,
  },
  illust: {
    width: 120,
    height: 140,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  illustLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  hanja: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['2xl'],
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  korean: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  school: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wide,
  },
});
