import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { findNpc, npcAgeLabel, NPC_FACTION_LABEL, type RunNpc } from '@/data/npcs';
import { useNpcStore } from '@/stores/npcStore';
import { useTimeStore } from '@/stores/timeStore';
import { colors, radius, spacing, typography } from '@/theme';

const STATUS_LABEL: Record<string, string> = { dead: '사망', fallen: '멸문' };

// 네임드 상세 — 도감 카드 탭 진입. 회차별 상태(npcStore) 우선, 없으면 카논 카탈로그.
export default function NpcDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fromRun = useNpcStore((s) => (id ? s.npcs.find((n) => n.id === id) : undefined));
  const npc: RunNpc | undefined = fromRun ?? (id ? (findNpc(id) as RunNpc | undefined) : undefined);
  const currentYear = useTimeStore((s) => s.current.year);

  if (!npc) {
    return (
      <SafetyZone variant="modal" background={colors.background}>
        <PaperCard>
          <Header />
          <View style={styles.empty}>
            <Text style={styles.emptyLabel}>알려지지 않은 인물이다.</Text>
          </View>
        </PaperCard>
      </SafetyZone>
    );
  }

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.portrait}>
            <Text style={styles.portraitLabel}>초상</Text>
          </View>

          <View style={styles.nameWrap}>
            <Text style={styles.name}>{npc.name}</Text>
            {npc.hanjaName ? <Text style={styles.hanja}>({npc.hanjaName})</Text> : null}
            <Text style={styles.tagline} numberOfLines={2}>
              {npc.bio}
            </Text>
          </View>

          <SectionLabel>내력</SectionLabel>
          <View style={styles.panel}>
            <Row label="소속" value={`${NPC_FACTION_LABEL[npc.faction]} · ${npc.affiliation}`} />
            <Row label="직급" value={npc.title} />
            <Row label="경지" value={npc.realm} valueStyle={styles.realm} />
            <Row label="나이" value={npcAgeLabel(npc, currentYear)} />
            {npc.status && npc.status !== 'active' ? (
              <Row label="상태" value={STATUS_LABEL[npc.status] ?? npc.status} valueStyle={styles.realm} />
            ) : null}
          </View>

          <SectionLabel>일대기</SectionLabel>
          <View style={styles.bioBox}>
            <Text style={styles.bio}>{npc.lore}</Text>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>강호 인물</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function Row({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
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
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  portrait: {
    alignSelf: 'center',
    width: '50%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  portraitLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  nameWrap: { alignItems: 'center', gap: 2, marginBottom: spacing.xs },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  hanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  tagline: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
  },

  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  rowLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    width: 56,
  },
  rowValue: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'right',
  },
  realm: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },

  bioBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
    backgroundColor: colors.paperBright,
  },
  bio: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: typography.sizes.sm * 1.6,
  },

  empty: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
});
