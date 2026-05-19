import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useGameStore } from '@/stores';
import { colors, spacing, typography } from '@/theme';

// 시안: docs/references/slot-select-mockup.png
// 사양: docs/16_회차_다회차.md "사부 슬롯 — 평행 2슬롯"
// 그레이박스 단계 — 일러스트·산수화는 dashed placeholder, 데이터는 임시값.

interface SlotSummary {
  slot: 1 | 2;
  // null 이면 빈 슬롯
  data: {
    sectName: string;
    sectHanja: string;
    runNumber: number;
    timeLabel: string;
    masterName: string;
    insightStars: number;
    scrollCount: number;
    discipleCount: number;
  } | null;
}

const PLACEHOLDER_SLOTS: SlotSummary[] = [
  {
    slot: 1,
    data: {
      sectName: '운림산문',
      sectHanja: '雲林山門',
      runNumber: 3,
      timeLabel: '5년차 봄 7주차',
      masterName: '임청허',
      insightStars: 4,
      scrollCount: 23,
      discipleCount: 7,
    },
  },
  { slot: 2, data: null },
];

const SLOT_SEAL_LABEL: Record<1 | 2, string> = {
  1: '壹',
  2: '貳',
};

// ─── Screen ────────────────────────────────────────────────────────────────

export default function SlotSelectScreen() {
  const setSaveSlot = useGameStore((s) => s.setSaveSlot);

  const onPickSlot = (slot: 1 | 2, hasData: boolean) => {
    setSaveSlot(slot);
    // 그레이박스: 빈 슬롯이든 사용 슬롯이든 메인으로 진입
    // 후속: 빈 슬롯이면 인트로/새 사부 생성 흐름으로 분기
    router.replace(hasData ? '/(tabs)' : '/(tabs)');
  };

  return (
    <SafetyZone variant="stack" background={colors.background}>
      <PaperCard>
        <Header />
        <View style={styles.slotsRow}>
          {PLACEHOLDER_SLOTS.map((s) => (
            <SlotCard key={s.slot} summary={s} onPick={onPickSlot} />
          ))}
        </View>
        <Footer />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>齒</Text>
      </View>
      <View style={styles.titleWrap}>
        <Text style={styles.titleHanja}>師席</Text>
        <Text style={styles.title}>사부의 자리</Text>
      </View>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>關</Text>
      </View>
    </View>
  );
}

// ─── Slot card ─────────────────────────────────────────────────────────────

function SlotCard({
  summary,
  onPick,
}: {
  summary: SlotSummary;
  onPick: (slot: 1 | 2, hasData: boolean) => void;
}) {
  const isEmpty = summary.data === null;
  return (
    <Pressable
      style={[styles.card, isEmpty && styles.cardEmpty]}
      onPress={() => onPick(summary.slot, !isEmpty)}
      accessibilityRole="button"
      accessibilityLabel={isEmpty ? `슬롯 ${summary.slot} 새로 시작` : `슬롯 ${summary.slot} 이어 진행`}
    >
      <SlotSeal slot={summary.slot} dim={isEmpty} />
      {isEmpty ? <EmptyBody /> : <ActiveBody data={summary.data!} />}
    </Pressable>
  );
}

function SlotSeal({ slot, dim }: { slot: 1 | 2; dim: boolean }) {
  return (
    <View style={[styles.slotSeal, dim && styles.slotSealDim]}>
      <Text style={[styles.slotSealLabel, dim && styles.slotSealLabelDim]}>
        {SLOT_SEAL_LABEL[slot]}
      </Text>
    </View>
  );
}

// ─── Active body ──────────────────────────────────────────────────────────

function ActiveBody({ data }: { data: NonNullable<SlotSummary['data']> }) {
  return (
    <View style={styles.cardBody}>
      <Text style={styles.sectName} numberOfLines={1}>
        {data.sectName}
      </Text>
      <Text style={styles.sectHanja} numberOfLines={1}>
        {`(${data.sectHanja})`}
      </Text>
      <Text style={styles.runLabel} numberOfLines={1}>
        {`제${data.runNumber}회차 · ${data.timeLabel}`}
      </Text>

      <View style={styles.metaList}>
        <MetaRow label="현재 사부" value={data.masterName} />
        <MetaRow label="통찰" value={`${data.insightStars}/5`} />
        <MetaRow label="누적 비급" value={`${data.scrollCount}권`} />
        <MetaRow label="거쳐간 제자" value={`${data.discipleCount}명`} />
      </View>

      <View style={styles.landscape}>
        <Text style={styles.placeholderLabel}>산수화</Text>
      </View>

      <View style={styles.actionSeal}>
        <Text style={styles.actionSealLabel}>이어{`\n`}진행</Text>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Empty body ───────────────────────────────────────────────────────────

function EmptyBody() {
  return (
    <View style={styles.cardBody}>
      <Text style={styles.emptyTitle}>비어 있는 사문</Text>
      <Text style={styles.emptySub}>새 사문을 개창하시겠습니까</Text>
      <View style={styles.emptyFlexSpacer} />
      <View style={styles.emptyAction}>
        <Text style={styles.emptyActionLabel}>{`+\n새로 시작`}</Text>
      </View>
      <View style={styles.emptyFlexSpacer} />
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerDivider} />
      <Text style={styles.footerLine}>사부의 일생은 한 회차, 사문은 영속</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerSeal: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSealLabel: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  titleWrap: { flex: 1, alignItems: 'center', gap: 2 },
  titleHanja: {
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Slots row
  slotsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  // Card
  card: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    backgroundColor: colors.paperBright,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  cardEmpty: {
    opacity: 0.7,
  },

  // Slot seal
  slotSeal: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSealDim: {
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
  },
  slotSealLabel: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  slotSealLabelDim: {
    color: colors.inkSoft,
  },

  // Card body (shared)
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },

  // Active card text
  sectName: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  sectHanja: {
    textAlign: 'center',
    fontFamily: typography.serifCN,
    fontSize: 11,
    color: colors.inkSoft,
  },
  runLabel: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },

  // Meta list
  metaList: {
    gap: 4,
    paddingVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  metaLabel: {
    width: 60,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  metaValue: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Landscape placeholder
  landscape: {
    flex: 1,
    minHeight: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  placeholderLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Active action seal
  actionSeal: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSealLabel: {
    textAlign: 'center',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.paperBright,
    lineHeight: 16,
  },

  // Empty card
  emptyTitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.base,
    color: colors.inkSoft,
  },
  emptySub: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  emptyFlexSpacer: { flex: 1 },
  emptyAction: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionLabel: {
    textAlign: 'center',
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inkSoft,
  },
  footerLine: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
