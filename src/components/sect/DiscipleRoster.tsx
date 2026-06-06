import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { findMartialArt, seongToStage } from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { BADGE_LABEL } from '@/systems/dailyLogSystem';
import { OVERRIDE_LABEL } from '@/systems/overrideSystem';
import { staminaSceneLabel } from '@/systems/staminaSystem';
import type { Disciple, DiscipleBadge, DiscipleStatus } from '@/types';
import { MARTIAL_STAGE_LABEL } from '@/types/martialArt';
import { REALM_LABEL } from '@/types/realm';
import { colors, radius, spacing, typography } from '@/theme';

export const DISCIPLE_CARD_WIDTH = 96;

const STATUS_LABEL: Record<DiscipleStatus, string> = {
  training: '수련중',
  resting: '휴식',
  injured: '치료중',
  meditating: '폐관중',
  questing: '파견중',
  graduated: '졸업',
  departed: '하산',
};

function mainArtLabel(d: Disciple): string {
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  if (!main) return '입문 전';
  const art = findMartialArt(main.artId);
  const name = art?.name ?? main.artId;
  const stage = MARTIAL_STAGE_LABEL[seongToStage(main.seong)];
  return `${name} ${stage} ${main.seong}성`;
}

export function DiscipleRoster() {
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const totalDay = useTimeStore((s) => s.totalDay);
  const overrides = useScheduleStore((s) => s.overrides);
  const dailyBadges = usePendingStore((s) => s.dailyBadges);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionLabel>제자 현황</SectionLabel>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push('/schedule')}
          accessibilityRole="button"
          accessibilityLabel="일정 변경"
        >
          <Text style={styles.editLabel}>일정 변경 ▶</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {order.map((id) => {
          const d = disciples[id];
          if (!d) return null;
          const ov = overrides[id];
          const remaining =
            ov && totalDay < ov.startedAtDay + ov.durationDays
              ? ov.startedAtDay + ov.durationDays - totalDay
              : 0;
          const onLeave = !!ov && remaining > 0 && ov.command !== 'default';
          const statusLine = onLeave
            ? `${OVERRIDE_LABEL[ov!.command]} (${remaining}일)`
            : STATUS_LABEL[d.status];
          return (
            <DiscipleCard
              key={id}
              d={d}
              statusLine={statusLine}
              onLeave={onLeave}
              leaveLabel={onLeave ? OVERRIDE_LABEL[ov!.command] : ''}
              badges={dailyBadges[id] ?? []}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function DiscipleCard({
  d,
  statusLine,
  onLeave,
  leaveLabel,
  badges,
}: {
  d: Disciple;
  statusLine: string;
  onLeave: boolean;
  leaveLabel: string;
  badges: DiscipleBadge[];
}) {
  return (
    <Pressable
      style={[styles.card, onLeave && styles.cardOnLeave]}
      accessibilityRole="button"
      accessibilityLabel={`${d.name} 상세${onLeave ? ` — ${leaveLabel} 중` : ''}`}
      onPress={() => router.push(`/disciple/${d.id}`)}
    >
      <View style={styles.portraitWrap}>
        <View style={[styles.portrait, onLeave && styles.portraitDim]} />
        {onLeave && (
          <View style={styles.leaveOverlay} pointerEvents="none">
            <Text style={styles.leaveLabel}>{leaveLabel}</Text>
          </View>
        )}
        {badges.length > 0 && (
          <View style={styles.badgeOverlay} pointerEvents="none">
            {badges.map((b) => (
              <View key={b} style={[styles.badge, badgeStyle(b)]}>
                <Text style={[styles.badgeText, badgeTextStyle(b)]}>{BADGE_LABEL[b]}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {d.name}
      </Text>
      <Text style={styles.cardRealm} numberOfLines={1}>
        {REALM_LABEL[d.realm]}
      </Text>
      <Text style={styles.cardLine} numberOfLines={1}>
        {mainArtLabel(d)}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        {statusLine}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        {staminaSceneLabel(d.stamina, d.maxStamina)}
      </Text>
    </Pressable>
  );
}

function badgeStyle(b: DiscipleBadge) {
  switch (b) {
    case 'promoted':
    case 'good_progress':
      return styles.badgeGold;
    case 'collapsed':
    case 'low_stamina':
      return styles.badgeRed;
    case 'plateau':
    default:
      return styles.badgeGray;
  }
}

function badgeTextStyle(b: DiscipleBadge) {
  switch (b) {
    case 'promoted':
    case 'good_progress':
      return styles.badgeTextGold;
    case 'collapsed':
    case 'low_stamina':
      return styles.badgeTextRed;
    case 'plateau':
    default:
      return styles.badgeTextGray;
  }
}


const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  editLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  card: {
    width: DISCIPLE_CARD_WIDTH,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  cardEmpty: {
    opacity: 0.6,
    justifyContent: 'center',
    minHeight: 140,
  },
  // 폐관·의뢰·치료 중 — 비활성 느낌 (흐릿 + 배경 톤).
  cardOnLeave: {
    opacity: 0.55,
    backgroundColor: colors.paperDark,
  },
  portraitWrap: {
    width: '70%',
    aspectRatio: 1,
    marginBottom: 2,
    position: 'relative',
  },
  portrait: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  portraitDim: {
    backgroundColor: colors.paperDark,
  },
  leaveOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.seal,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  badgeOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeGold: {
    backgroundColor: colors.gold,
    borderColor: colors.brown,
  },
  badgeRed: {
    backgroundColor: colors.seal,
    borderColor: colors.sealDark,
  },
  badgeGray: {
    backgroundColor: colors.paperDark,
    borderColor: colors.inkSoft,
  },
  badgeText: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    lineHeight: typography.sizes.xs * 1.1,
  },
  badgeTextGold: { color: colors.paper },
  badgeTextRed: { color: colors.paper },
  badgeTextGray: { color: colors.ink },
  cardName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  cardSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  cardLine: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  cardRealm: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wide,
  },
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: typography.sizes.xs * 1.4,
  },
});
