import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import type { Disciple } from '@/types';
import { colors, spacing, typography } from '@/theme';

interface Props {
  disciple: Disciple;
}

// 필수 이벤트 아크 회고 — 두루마리 연대기. docs/47 §4·§10 E6·E9.
// 그 제자의 해마다 사부가 내린 선택(arcChoices)을 연차순으로 펼친다. 졸업하면 15년 회고가 된다.
// 빈 해(의뢰로 못 받았거나 콘텐츠 없는 해)는 "조용히 지나갔다"로 정직하게 표기(거짓 15개 금지).
export function ArcChroniclePanel({ disciple }: Props) {
  const choices = disciple.arcChoices ?? [];
  if (choices.length === 0) return null;

  const byYear = new Map(choices.map((c) => [c.year, c]));
  const maxYear = Math.max(...choices.map((c) => c.year));
  const rows = Array.from({ length: maxYear }, (_, i) => ({ year: i + 1, choice: byYear.get(i + 1) }));
  const graduated = disciple.status === 'graduated';

  return (
    <View style={styles.section}>
      <SectionLabel>걸어온 길</SectionLabel>
      <View style={styles.timeline}>
        {rows.map(({ year, choice }) => (
          <View key={year} style={styles.row}>
            <View style={styles.marker}>
              <View style={[styles.dot, !choice && styles.dotEmpty]} />
              {year < maxYear && <View style={styles.line} />}
            </View>
            <View style={styles.entry}>
              <Text style={styles.year}>{year}년차</Text>
              {choice ? (
                <>
                  <Text style={styles.title}>{choice.title}</Text>
                  <Text style={styles.choice}>사부는 「{choice.choiceLabel}」</Text>
                </>
              ) : (
                <Text style={styles.empty}>그 해는 조용히 지나갔다.</Text>
              )}
            </View>
          </View>
        ))}
      </View>
      {graduated && (
        <Text style={styles.closing}>— {disciple.name}, 이 길을 걸어 산을 내려갔다.</Text>
      )}
    </View>
  );
}

const DOT = 9;

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  timeline: { paddingHorizontal: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  // 마커 열 — 점 + 세로선(두루마리 연대기 결)
  marker: { width: DOT, alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.seal,
    marginTop: 3,
  },
  dotEmpty: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.inkSoft },
  line: { flex: 1, width: 1, backgroundColor: colors.inkSoft, marginVertical: 2 },
  // 항목
  entry: { flex: 1, paddingBottom: spacing.base },
  year: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wide,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginTop: 2,
  },
  choice: {
    fontFamily: typography.serifLight,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    marginTop: 2,
    letterSpacing: typography.letterSpacing.wide,
  },
  empty: {
    fontFamily: typography.serifLight,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
    marginTop: 2,
  },
  closing: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
});
