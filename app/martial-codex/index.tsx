import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { MartialTree, ResearchPanel } from '@/components/martial-art';
import { LINEAGE_LABEL, allLineageIds, artsByLineage, findMartialArt } from '@/data/martialArts';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { colors, radius, spacing, typography } from '@/theme';

// 무공 계보/도감 — 문파(lineage)별로 무공을 선행조건 DAG 스킬트리로 본다. docs/26 §5-4.
// discipleId 주면 그 제자 기준(보유 성·학습가능·잠금). 없으면 도감 모드 — 사문 보유 비급=활성/미보유=비활성.
export default function MartialCodexScreen() {
  const { discipleId, focus } = useLocalSearchParams<{ discipleId?: string; focus?: string }>();
  const disciple = useDiscipleStore((s) => (discipleId ? s.disciples[discipleId] : undefined));
  const scrolls = useCodexStore((s) => s.scrolls);
  const ownedIds = disciple ? undefined : new Set(scrolls.map((sc) => sc.artId));

  // 도감 모드(제자 없음): 전 문파. 제자 진입: 그 제자가 타고 있는 계보만(주력·보유 무공의 문파).
  const lineages = (() => {
    const all = allLineageIds();
    if (!disciple) return all;
    const mine = new Set<string>();
    for (const inst of disciple.martialArts) mine.add(findMartialArt(inst.artId)?.lineage ?? 'common');
    if (focus) mine.add(findMartialArt(focus)?.lineage ?? 'common');
    const filtered = all.filter((l) => mine.has(l));
    return filtered.length ? filtered : all;
  })();

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
          {/* 비급 연구 — 보유했지만 풀이 못 한 비급(실시간 타이머·다이아 스킵). docs/05. */}
          <ResearchPanel />
          <Legend ownership={!disciple} />
          {/* 도감 = 전 카탈로그 노출(미습득 포함) — 보유 ● 활성 / 미보유 ○ 비활성(흐림)으로 구분.
              (미발견 잠금 정책은 폐기 — 사용자 결정 2026-06-10: 수집 목표가 보여야 도감이 동기가 된다.) */}
          {lineages.map((lin) => (
            <View key={lin} style={styles.section}>
              <Text style={styles.lineageLabel}>{LINEAGE_LABEL[lin] ?? lin}</Text>
              <View style={styles.treeBox}>
                <MartialTree
                  arts={artsByLineage(lin)}
                  disciple={disciple}
                  ownedIds={ownedIds}
                  highlightId={focus}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Legend({ ownership }: { ownership: boolean }) {
  return (
    <View style={styles.legend}>
      {ownership ? (
        <>
          <Text style={styles.legendItem}>● 사문 보유 비급</Text>
          <Text style={styles.legendItem}>○ 미보유(흐림)</Text>
        </>
      ) : (
        <>
          <Text style={styles.legendItem}>● 보유</Text>
          <Text style={styles.legendItem}>○ 학습 가능</Text>
          <Text style={styles.legendItem}>🔒 선행/경지 미달</Text>
        </>
      )}
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
