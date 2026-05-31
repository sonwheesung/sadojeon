import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

interface DiscipleHeaderProps {
  name: string; // 한글 이름
  hanjaName: string; // 한자 이름
  starRank: number; // 1~5
}

// 제자 상세 — 상단 초상 패널. 이미지 시안 결 (양피지 두루마리 + 초상 + 이름).
// 그레이박스 단계: 초상은 dashed placeholder. 폴리시 단계에서 실제 일러스트 차입.
export function DiscipleHeader({ name, hanjaName, starRank }: DiscipleHeaderProps) {
  return (
    <View style={styles.scroll}>
      <View style={styles.portrait}>
        <Text style={styles.portraitLabel}>초상</Text>
      </View>
      <View style={styles.nameBlock}>
        <Text style={styles.hanja} numberOfLines={1}>
          {hanjaName}
        </Text>
        <Text style={styles.korean} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.star}>{starText(starRank)}</Text>
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
  portrait: {
    width: 110,
    height: 140,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  portraitLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  nameBlock: {
    flex: 1,
    justifyContent: 'center',
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
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.seal,
    marginTop: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
});
