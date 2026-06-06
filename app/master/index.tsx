import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { useMasterStore } from '@/stores/masterStore';
import { MASTER_STAT_LABEL, type MasterStats } from '@/types/master';
import { colors, radius, spacing, typography } from '@/theme';

// 사부 상세 — 사부 4스탯(통찰·연륜·위엄·인망)을 보여주고, 수양(성장)을 진행하는 화면.
// 사문 탭의 사부 카드 → 여기로 진입. BM상 사부 성장은 이 화면에서 다룬다 (수양 영역은 그레이박스).
// 스탯은 ★1~5 등급으로 표기 (docs/02).

const STAT_ORDER: (keyof MasterStats)[] = ['insight', 'experience', 'authority', 'prestige'];

const STAT_DESC: Record<keyof MasterStats, string> = {
  insight: '비급 감별·연구 속도·재능 감별·함정 인지',
  experience: '사부 활동 효율·이벤트 대응 폭',
  authority: '훈시·근신·면담 효과, 사문 분위기 안정',
  prestige: '외부 인연·후원·외교 호감, 마을 방문 정보',
};

export default function MasterDetailScreen() {
  const master = useMasterStore((s) => s.master);

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.identity}>
            <Text style={styles.name}>{master?.name ?? '사부'}</Text>
            {master?.hanjaName ? <Text style={styles.hanja}>({master.hanjaName})</Text> : null}
            {master ? (
              <Text style={styles.sub}>
                {master.age}세 · 양육 {master.yearsAsMaster}년차
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <SectionLabel>사부 수양</SectionLabel>
            <View style={styles.panel}>
              {STAT_ORDER.map((key) => (
                <StatRow
                  key={key}
                  label={MASTER_STAT_LABEL[key]}
                  value={master?.stats[key] ?? 0}
                  desc={STAT_DESC[key]}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>수양 진행</SectionLabel>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                사부 명상·운영으로 통찰·연륜을 닦는 영역 (준비 중).
              </Text>
            </View>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>사부</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function StatRow({ label, value, desc }: { label: string; value: number; desc: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <View style={styles.statRow}>
      <View style={styles.statHead}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.stars}>
          <Text style={styles.starsFilled}>{'★'.repeat(filled)}</Text>
          <Text style={styles.starsEmpty}>{'☆'.repeat(5 - filled)}</Text>
        </Text>
      </View>
      <Text style={styles.statDesc} numberOfLines={2}>
        {desc}
      </Text>
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
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.base },

  identity: { alignItems: 'center', gap: 2, paddingVertical: spacing.sm },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
  },
  hanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  sub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    marginTop: 2,
  },

  section: { gap: spacing.sm },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statRow: {
    gap: 2,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  statHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  stars: { fontSize: typography.sizes.sm },
  starsFilled: { color: colors.brown },
  starsEmpty: { color: colors.inkSoft },
  statDesc: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
});
