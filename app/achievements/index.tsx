import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { ACHIEVEMENTS, ACH_CATEGORY_LABEL, type AchCategory } from '@/data/achievements';
import { useAchievementStore } from '@/stores/achievementStore';
import { colors, radius, spacing, typography } from '@/theme';

// 업적 목록(그레이박스) — 달성/미달성, 카테고리별. 숨김 업적은 미달성 시 가림. docs/32.
// 계정 단위 영속(achievementStore). 보상·해금은 표시만 — 실제 효과는 achievementSystem.

const CATEGORY_ORDER: AchCategory[] = ['martial', 'mind', 'activity', 'career', 'ganghos'];

export default function AchievementsScreen() {
  const unlocked = useAchievementStore((s) => s.unlocked);
  const done = new Set(unlocked);
  const total = ACHIEVEMENTS.length;
  const got = ACHIEVEMENTS.filter((a) => done.has(a.id)).length;

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>업적</Text>
          <Text style={styles.count}>
            {got}/{total}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {CATEGORY_ORDER.map((cat) => {
            const list = ACHIEVEMENTS.filter((a) => a.category === cat);
            if (list.length === 0) return null;
            return (
              <View key={cat} style={styles.section}>
                <SectionLabel>{ACH_CATEGORY_LABEL[cat]}</SectionLabel>
                {list.map((a) => {
                  const achieved = done.has(a.id);
                  const masked = a.hidden && !achieved;
                  return (
                    <View key={a.id} style={[styles.row, achieved && styles.rowDone]}>
                      <View style={styles.rowMain}>
                        <Text style={[styles.name, achieved && styles.nameDone]} numberOfLines={1}>
                          {achieved ? '✓ ' : '· '}
                          {masked ? '??? (숨은 업적)' : a.name}
                        </Text>
                        <Text style={styles.desc} numberOfLines={2}>
                          {masked ? '조건은 달성 후 공개된다.' : a.desc}
                        </Text>
                        {!masked && a.reward ? <Text style={styles.reward}>{a.reward}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          <Text style={styles.foot}>
            ※ 업적은 계정 단위로 영구 기록됩니다(회차가 바뀌어도 유지). 해금된 무공서는 다음 회차 서고에 전해집니다.
          </Text>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  back: { fontFamily: typography.serifBold, fontSize: 28, color: colors.ink, width: 32 },
  title: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  count: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.inkSoft, width: 48, textAlign: 'right' },
  body: { padding: spacing.base, paddingBottom: spacing.xl, gap: spacing.lg },
  section: { gap: spacing.xs },
  row: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
  },
  rowDone: { borderStyle: 'solid', borderColor: colors.brown, backgroundColor: colors.paperLight },
  rowMain: { gap: 2 },
  name: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.inkSoft },
  nameDone: { color: colors.brown },
  desc: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  reward: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.gold, marginTop: 2 },
  foot: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft, fontStyle: 'italic', marginTop: spacing.sm },
});
