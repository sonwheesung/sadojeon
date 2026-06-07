import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { MartialTree } from '@/components/martial-art';
import { LINEAGE_LABEL, allLineageIds, artsByLineage } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { colors, radius, spacing, typography } from '@/theme';

// 무공 계보 — 문파(lineage)별로 무공을 선행조건 DAG 스킬트리로 본다. docs/26 §5-4.
// discipleId 주면 그 제자 기준 보유/학습가능/잠금 표시. focus = 강조할 무공 id.
export default function MartialCodexScreen() {
  const { discipleId, focus } = useLocalSearchParams<{ discipleId?: string; focus?: string }>();
  const disciple = useDiscipleStore((s) => (discipleId ? s.disciples[discipleId] : undefined));
  const lineages = allLineageIds();

  return (
    <SafetyZone variant="stack" background={colors.background}>
      <PaperCard>
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            hitSlop={8}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>무공 계보</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <Legend />
          {lineages.map((lin) => (
            <View key={lin} style={styles.section}>
              <Text style={styles.lineageLabel}>{LINEAGE_LABEL[lin] ?? lin}</Text>
              <View style={styles.treeBox}>
                <MartialTree arts={artsByLineage(lin)} disciple={disciple} highlightId={focus} />
              </View>
            </View>
          ))}
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      <Text style={styles.legendItem}>● 보유</Text>
      <Text style={styles.legendItem}>○ 학습 가능</Text>
      <Text style={styles.legendItem}>🔒 선행/경지 미달</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: { flex: 1 },
  bodyContent: { gap: spacing.base, paddingBottom: spacing.md },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendItem: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  section: { gap: spacing.xs },
  lineageLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wide,
  },
  treeBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    padding: spacing.xs,
  },
});
