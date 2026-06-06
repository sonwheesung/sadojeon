import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { useJianghuStore, type JianghuEvent, type JianghuFaction } from '@/stores/jianghuStore';
import { useMasterStore } from '@/stores/masterStore';
import { colors, spacing, typography } from '@/theme';

type Faction = JianghuFaction;
type ActiveEvent = JianghuEvent;

// 사부 통찰 → 별 1~5 (stats.insight 는 이미 1~5, MASTER_STAT).
function insightStars(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function WorldScreen() {
  const factions = useJianghuStore((s) => s.factions);
  const events = useJianghuStore((s) => s.events);
  const seedDefaults = useJianghuStore((s) => s.seedDefaults);
  const insightStat = useMasterStore((s) => s.master?.stats.insight ?? 3);

  // 정세가 비어 있으면(구 회차 등) 기본값 시드 — 화면이 비지 않게.
  useEffect(() => {
    if (factions.length === 0) seedDefaults();
  }, [factions.length, seedDefaults]);

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <AppHeader />
        <Header insight={insightStars(insightStat)} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <BannerSlot />

          <SectionLabel>강호 정세</SectionLabel>
          <FactionColumns factions={factions} />

          <SectionLabel>진행 중 사건</SectionLabel>
          <EventList events={events} />
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({ insight }: { insight: number }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          강호
        </Text>
        <Text style={styles.headerTitleCn} numberOfLines={1}>
          (江湖)
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          onPress={() => router.push('/npc' as Href)}
          accessibilityRole="button"
          accessibilityLabel="강호 도감"
          style={({ pressed }) => [styles.codexBtn, pressed && styles.pressed]}
        >
          <Text style={styles.codexBtnLabel}>도감 ▶</Text>
        </Pressable>
        <Text style={styles.headerMeta}>통찰 {insight}/5</Text>
      </View>
    </View>
  );
}

function BannerSlot() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerLabel}>강호 산수 베너 자리</Text>
    </View>
  );
}

function FactionColumns({ factions }: { factions: Faction[] }) {
  return (
    <View style={styles.factionRow}>
      {factions.map((f) => (
        <View key={f.id} style={styles.factionCell}>
          <Text style={styles.factionLabel}>{f.label}</Text>
          <Text style={styles.factionOutlook} numberOfLines={2}>
            {f.outlook}
          </Text>
        </View>
      ))}
    </View>
  );
}

function EventList({ events }: { events: ActiveEvent[] }) {
  return (
    <View style={styles.eventList}>
      {events.map((e) => (
        <EventRow key={e.id} event={e} />
      ))}
    </View>
  );
}

function EventRow({ event }: { event: ActiveEvent }) {
  return (
    <Pressable
      style={styles.eventRow}
      accessibilityRole="button"
      accessibilityLabel={event.headline}
    >
      <Text style={styles.eventHeadline} numberOfLines={1}>
        {event.headline}
      </Text>
      <Text style={styles.eventSub} numberOfLines={1}>
        {event.sub}
      </Text>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const BANNER_ASPECT = 16 / 9;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexShrink: 1,
  },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerTitleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  headerMeta: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  codexBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.paperBright,
  },
  codexBtnLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  pressed: { opacity: 0.85 },

  // Body / scroll
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  // Banner placeholder
  banner: {
    width: '100%',
    aspectRatio: BANNER_ASPECT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Faction columns
  factionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  factionCell: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  factionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  factionOutlook: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    textAlign: 'center',
  },

  // Event list
  eventList: {
    gap: spacing.xs,
  },
  eventRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  eventHeadline: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  eventSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
