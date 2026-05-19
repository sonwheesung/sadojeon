import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ───────────────────────────────────────────────────────

interface RowSeed {
  name: string;
  sub: string;
  kind: 'disciple' | 'master';
  am: string;
  pm: string;
}

const DISCIPLE_ROWS: RowSeed[] = [
  { name: '독고연', sub: '입문 2년차', kind: 'disciple', am: '무공 수련', pm: '무공 수련' },
  { name: '이청하', sub: '입문 1년차', kind: 'disciple', am: '무공 수련', pm: '무공 수련' },
  { name: '강소율', sub: '입문 3년차', kind: 'disciple', am: '무공 수련', pm: '무공 수련' },
];
const MASTER_ROW: RowSeed = {
  name: '사부',
  sub: '사문 주',
  kind: 'master',
  am: '강의',
  pm: '강의',
};

const SELECTED = {
  who: '이청하',
  slot: '오후',
  activity: '면담',
  effects: ['사부 신뢰도 ↑↑', '통찰 경험치 +'],
  recommendation: '★★★ (높음)',
  notes: '연속 면담은 피로 누적 가능',
};

const MASTER_TIP = {
  body: '이청하는 무공 진전 정체기 진입 중.\n명상 또는 면담 권장.',
  locked: '🔒 통찰 ★★★ 이상 일부 정보 공개',
};

type Slot = 'am' | 'pm';
const SLOT_LABEL: Record<Slot, string> = { am: '오전', pm: '오후' };
const cellKey = (name: string, slot: Slot) => `${name}-${slot}`;

const ALL_ROWS: RowSeed[] = [...DISCIPLE_ROWS, MASTER_ROW];

const INITIAL_ACTIVITIES: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const r of ALL_ROWS) {
    out[cellKey(r.name, 'am')] = r.am;
    out[cellKey(r.name, 'pm')] = r.pm;
  }
  return out;
})();

// ─── Screen ────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const dateLabel = useGameDateLabel();
  const activities = INITIAL_ACTIVITIES;

  const handleCellPress = (name: string, slot: Slot) => {
    const row = ALL_ROWS.find((r) => r.name === name);
    router.push(
      `/activity/${encodeURIComponent(name)}?slot=${slot}&kind=${row?.kind ?? 'disciple'}` as Href
    );
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header date={`${dateLabel} 월요일`} />
        <GridHeader />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {ALL_ROWS.map((row) => (
            <ScheduleRow
              key={row.name}
              row={row}
              am={activities[cellKey(row.name, 'am')]}
              pm={activities[cellKey(row.name, 'pm')]}
              amEdited={false}
              pmEdited={false}
              onCellPress={handleCellPress}
            />
          ))}
          <ScheduleDetail />
          <MasterTip />
        </ScrollView>
        <Footer />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({ date }: { date: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backLabel}>← 뒤로</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            오늘 일정 변경
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="기본 패턴 적용"
          hitSlop={8}
          style={styles.patternSlot}
        >
          <Text style={styles.patternLabel}>기본 패턴</Text>
        </Pressable>
      </View>
      <Text style={styles.headerDate}>{date}</Text>
    </View>
  );
}

function GridHeader() {
  return (
    <View style={styles.gridHeader}>
      <View style={styles.colWho} />
      <Text style={[styles.gridHeaderText, styles.colSlot]}>오전</Text>
      <Text style={[styles.gridHeaderText, styles.colSlot]}>오후</Text>
    </View>
  );
}

interface ScheduleRowProps {
  row: RowSeed;
  am: string;
  pm: string;
  amEdited: boolean;
  pmEdited: boolean;
  onCellPress: (name: string, slot: Slot) => void;
}

function ScheduleRow({ row, am, pm, amEdited, pmEdited, onCellPress }: ScheduleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.colWho}>
        <View style={styles.portrait} />
        <Text style={styles.rowName} numberOfLines={1}>
          {row.name}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {row.sub}
        </Text>
      </View>
      <ActivityCell label={am} edited={amEdited} onPress={() => onCellPress(row.name, 'am')} />
      <ActivityCell label={pm} edited={pmEdited} onPress={() => onCellPress(row.name, 'pm')} />
    </View>
  );
}

function ActivityCell({
  label,
  edited,
  onPress,
}: {
  label: string;
  edited?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.cell, styles.colSlot]}
      accessibilityRole="button"
      accessibilityLabel={`${label} 변경`}
      onPress={onPress}
    >
      <Text style={styles.cellLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.cellMeta}>
        {edited ? <Text style={styles.cellBadge}>변</Text> : null}
        <Text style={styles.cellChevron}>▾</Text>
      </View>
    </Pressable>
  );
}

function ScheduleDetail() {
  return (
    <View style={styles.panel}>
      <SectionLabel>선택된 일정</SectionLabel>
      <Text style={styles.detailHeadline}>
        {SELECTED.who} {SELECTED.slot} — {SELECTED.activity}
      </Text>
      <DetailRow label="효과" value={SELECTED.effects.join(', ')} />
      <DetailRow label="권장도" value={SELECTED.recommendation} />
      <DetailRow label="주의" value={SELECTED.notes} />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MasterTip() {
  return (
    <View style={styles.panel}>
      <SectionLabel>사부의 권장</SectionLabel>
      <Text style={styles.tipBody}>{MASTER_TIP.body}</Text>
      <Text style={styles.tipLocked}>{MASTER_TIP.locked}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <FooterButton label="취소" onPress={() => router.back()} />
      <FooterButton label="기본 패턴 저장" flex />
      <FooterButton label="오늘만 적용" flex primary />
    </View>
  );
}

function FooterButton({
  label,
  onPress,
  flex,
  primary,
}: {
  label: string;
  onPress?: () => void;
  flex?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.footerButton,
        flex && styles.footerButtonFlex,
        primary && styles.footerButtonPrimary,
      ]}
    >
      <Text style={[styles.footerLabel, primary && styles.footerLabelPrimary]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const PORTRAIT_SIZE = 32;
const CELL_HEIGHT = 38;

const styles = StyleSheet.create({
  // Header ----------------------------------------------------------------
  header: {
    gap: 2,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerDate: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  patternSlot: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  patternLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Grid header -----------------------------------------------------------
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  gridHeaderText: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    textAlign: 'center',
  },

  // Body ------------------------------------------------------------------
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },

  // Row -------------------------------------------------------------------
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colWho: {
    width: 72,
    alignItems: 'center',
    gap: 2,
  },
  colSlot: {
    flex: 1,
  },
  portrait: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  rowName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  rowSub: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Cell ------------------------------------------------------------------
  cell: {
    height: CELL_HEIGHT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellLabel: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  cellMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cellBadge: {
    fontFamily: typography.serifBold,
    fontSize: 10,
    color: colors.paperBright,
    backgroundColor: colors.seal,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cellChevron: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Panel -----------------------------------------------------------------
  panel: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    gap: 4,
  },
  detailHeadline: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  detailLabel: {
    width: 50,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  detailValue: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  tipBody: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    lineHeight: 18,
    marginTop: 4,
  },
  tipLocked: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
    marginTop: 4,
  },

  // Footer ----------------------------------------------------------------
  footer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  footerButton: {
    minWidth: 56,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  footerButtonFlex: {
    flex: 1,
  },
  footerButtonPrimary: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
  },
  footerLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  footerLabelPrimary: {
    color: colors.paperBright,
  },
});
