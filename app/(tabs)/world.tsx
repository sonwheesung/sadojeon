import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ───────────────────────────────────────────────────────

const MASTER_INSIGHT = 3;

interface Graduate {
  id: string;
  name: string;
  route: string;
  base: string;
  fame: number; // 0~5
  status: '건강' | '부상' | '행방불명' | '사망' | '폐관';
}

interface Faction {
  id: string;
  label: string;
  outlook: string;
}

interface ActiveEvent {
  id: string;
  headline: string;
  sub: string;
}

const GRADUATES: Graduate[] = [
  { id: 'jinbaekho', name: '진백호', route: '의적', base: '강남 일대', fame: 4, status: '건강' },
  { id: 'jangcheolgang', name: '장철강', route: '정파 협객', base: '무림맹', fame: 4, status: '부상' },
  { id: 'yunsoso', name: '윤소소', route: '의원', base: '백화곡', fame: 2, status: '건강' },
  { id: 'yeomsoun', name: '염소운', route: '살수', base: '천하 곳곳', fame: 3, status: '건강' },
  { id: 'takcheongpung', name: '탁청풍', route: '호법', base: '변방', fame: 1, status: '행방불명' },
  { id: 'moyongran', name: '모용란', route: '떠돌이 검객', base: '미상', fame: 2, status: '사망' },
];

const FACTIONS: Faction[] = [
  { id: 'right', label: '정파', outlook: '무림맹 평온' },
  { id: 'sapa', label: '사파', outlook: '강남 봉기 조짐' },
  { id: 'magyo', label: '마교', outlook: '잠잠' },
  { id: 'middle', label: '중도', outlook: '표국 활발' },
];

const EVENTS: ActiveEvent[] = [
  { id: 'ev-1', headline: '강남 사파 연합 봉기', sub: '이번 분기 · 정파 대응 미정' },
  { id: 'ev-2', headline: '마교 잔당 추적', sub: '지난 계절부터 · 관아 주도' },
  { id: 'ev-3', headline: '무림첩보 갱신', sub: '매주 · 정파 시각 보고' },
];

const INACTIVE_STATUSES: Graduate['status'][] = ['행방불명', '사망'];
const ANCIENT_FAVOR_USED = false; // "옛 인연 부탁" 회차 1회 사용 여부. 추후 store.

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function WorldScreen() {
  const total = GRADUATES.length;
  const active = GRADUATES.filter((g) => !INACTIVE_STATUSES.includes(g.status)).length;

  const onLetter = () => {
    // TODO: 졸업 제자 선택 → 서신 작성 화면
  };
  const onSummon = () => {
    // TODO: 졸업 제자 선택 → 호출 화면 (1계절 사문 체류)
  };
  const onAncientFavor = () => {
    if (ANCIENT_FAVOR_USED) return;
    // TODO: 회차 1회 한정 큰 대가 동반 부탁. 사용 시 store에 기록.
  };

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <Header insight={MASTER_INSIGHT} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <BannerSlot />
          <View style={styles.sectionHead}>
            <SectionLabel>졸업 제자</SectionLabel>
            <Text style={styles.subText}>총 {total}명 · 활동 중 {active}명</Text>
          </View>
          <GraduateScroll graduates={GRADUATES} />

          <SectionLabel>강호 정세</SectionLabel>
          <FactionColumns factions={FACTIONS} />

          <SectionLabel>진행 중 사건</SectionLabel>
          <EventList events={EVENTS} />
        </ScrollView>
        <ActionRow
          onLetter={onLetter}
          onSummon={onSummon}
          onAncientFavor={onAncientFavor}
          ancientFavorUsed={ANCIENT_FAVOR_USED}
        />
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
      <Text style={styles.headerMeta}>사부 통찰 {insight}/5</Text>
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

function GraduateScroll({ graduates }: { graduates: Graduate[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.graduateRow}
    >
      {graduates.map((g) => (
        <GraduateCard key={g.id} graduate={g} />
      ))}
    </ScrollView>
  );
}

function GraduateCard({ graduate }: { graduate: Graduate }) {
  const inactive = INACTIVE_STATUSES.includes(graduate.status);
  return (
    <View style={[styles.gradCard, inactive && styles.gradCardInactive]}>
      <View style={styles.gradPortrait}>
        <Text style={styles.slotHint}>초상</Text>
      </View>
      <Text style={styles.gradName} numberOfLines={1}>
        {graduate.name}
      </Text>
      <Text style={styles.gradRoute} numberOfLines={1}>
        {graduate.route}
      </Text>
      <GradRow label="거점" value={graduate.base} />
      <GradRow label="명성" value={`${graduate.fame}/5`} />
      <GradRow label="상태" value={graduate.status} warn={inactive} />
    </View>
  );
}

function GradRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.gradInfoRow}>
      <Text style={styles.gradInfoLabel}>{label}</Text>
      <Text
        style={[styles.gradInfoValue, warn && styles.gradInfoValueWarn]}
        numberOfLines={1}
      >
        {value}
      </Text>
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

function ActionRow({
  onLetter,
  onSummon,
  onAncientFavor,
  ancientFavorUsed,
}: {
  onLetter: () => void;
  onSummon: () => void;
  onAncientFavor: () => void;
  ancientFavorUsed: boolean;
}) {
  return (
    <View style={styles.actionRow}>
      <ActionButton label="서신 보내기" onPress={onLetter} />
      <ActionButton label="호출하기" onPress={onSummon} />
      <ActionButton
        label="옛 인연 부탁"
        sublabel="(한 회차 1회)"
        onPress={onAncientFavor}
        muted={ancientFavorUsed}
      />
    </View>
  );
}

function ActionButton({
  label,
  sublabel,
  onPress,
  muted,
}: {
  label: string;
  sublabel?: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={muted ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: muted }}
      style={[styles.actionButton, muted && styles.actionButtonMuted]}
    >
      <Text style={[styles.actionLabel, muted && styles.actionLabelMuted]} numberOfLines={1}>
        {label}
      </Text>
      {sublabel && (
        <Text style={[styles.actionSub, muted && styles.actionLabelMuted]} numberOfLines={1}>
          {sublabel}
        </Text>
      )}
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const BANNER_ASPECT = 16 / 9;
const GRAD_CARD_WIDTH = 104;

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

  // Section head row
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Graduate cards
  graduateRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  gradCard: {
    width: GRAD_CARD_WIDTH,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'stretch',
    gap: 2,
  },
  gradCardInactive: {
    opacity: 0.55,
  },
  gradPortrait: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  slotHint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  gradName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
  },
  gradRoute: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  gradInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gradInfoLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  gradInfoValue: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    maxWidth: '60%',
    textAlign: 'right',
  },
  gradInfoValueWarn: {
    color: colors.seal,
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

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionButtonMuted: {
    opacity: 0.5,
  },
  actionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  actionSub: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
    marginTop: 2,
  },
  actionLabelMuted: {
    color: colors.inkSoft,
  },
});
