import { StyleSheet, Text, View } from 'react-native';

import type { ChildhoodProfile } from '@/data/disciples/recruitPool';
import { colors, radius, spacing, typography } from '@/theme';

// 시작 선택 화면 — 한 제자의 유년 신상 펼침. 그레이박스(dashed).
// 좋아함/싫어함/행실은 "사부가 읽어내는" 단서라 살짝 강조. 숫자·효율 등급어 없음.

const ROWS: { key: keyof ChildhoodProfile; label: string; tell?: boolean }[] = [
  { key: 'house', label: '집안' },
  { key: 'family', label: '가족' },
  { key: 'nature', label: '성품' },
  { key: 'upbringing', label: '내력' },
  { key: 'likes', label: '좋아함', tell: true },
  { key: 'dislikes', label: '싫어함', tell: true },
  { key: 'tell', label: '행실', tell: true },
];

export function DiscipleProfile({ profile }: { profile: ChildhoodProfile }) {
  return (
    <View style={styles.box}>
      {ROWS.map(({ key, label, tell }) => (
        <View key={key} style={styles.row}>
          <Text style={[styles.label, tell && styles.labelTell]}>{label}</Text>
          <Text style={[styles.value, tell && styles.valueTell]}>{profile[key]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.inkSoft,
    borderStyle: 'dashed',
    paddingTop: spacing.xs,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  label: {
    width: 52,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  labelTell: {
    color: colors.brown,
  },
  value: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    lineHeight: typography.sizes.xs * 1.45,
  },
  valueTell: {
    color: colors.ink,
  },
});
