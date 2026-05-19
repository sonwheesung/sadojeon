import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { colors, spacing, typography } from '@/theme';

// ─── Category label map ────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  'martial-book': '무공 비급',
  weapon: '무구',
  top: '상의',
  bottom: '하의',
  talisman: '호신부',
  potion: '단약',
  pouch: '호신낭',
  misc: '기타',
};

// ─── Placeholder data ──────────────────────────────────────────────────────

type Status = '장착중' | '신규' | '사용가능';

interface Item {
  id: string;
  name: string;
  hanja: string;
  rating: number;
  ratingMax: number;
  summary: string;
  status: Status;
}

const ITEMS: Item[] = [
  { id: 'cheongryong', name: '청룡검결', hanja: '青龍劍訣', rating: 4, ratingMax: 5, summary: '검술 진전 속도 +15%', status: '장착중' },
  { id: 'taesan', name: '태산심법', hanja: '泰山心法', rating: 3, ratingMax: 5, summary: '기력 회복 속도 +10%', status: '신규' },
  { id: 'honwon', name: '혼원도', hanja: '混元圖', rating: 4, ratingMax: 5, summary: '내공 최대치 +10', status: '사용가능' },
  { id: 'palgwae', name: '팔괘보법', hanja: '八卦步法', rating: 2, ratingMax: 5, summary: '민첩 +1', status: '신규' },
  { id: 'mandok', name: '만독해독술', hanja: '萬毒解毒術', rating: 3, ratingMax: 5, summary: '독 해제 확률 +20%', status: '사용가능' },
  { id: 'geumgang', name: '금강불괴체', hanja: '金剛不壞體', rating: 4, ratingMax: 5, summary: '방어력 +1', status: '장착중' },
];

const STATUS_COLOR: Record<Status, string> = {
  장착중: colors.inkSoft,
  신규: colors.seal,
  사용가능: colors.inkLight,
};

// ─── Screen ────────────────────────────────────────────────────────────────

export default function InventoryCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const label = CATEGORY_LABEL[category ?? ''] ?? '카테고리';

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header label={label} count={ITEMS.length} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {ITEMS.map((it, idx) => (
              <Row key={it.id} item={it} last={idx === ITEMS.length - 1} />
            ))}
          </View>
          <View style={styles.bottomArt}>
            <Text style={styles.bottomArtLabel}>상자 일러스트</Text>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ label, count }: { label: string; count: number }) {
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
        <Text style={styles.title} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.count}>{count}개</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.actionSlot}>
          <Text style={styles.actionLabel}>정렬</Text>
        </View>
        <View style={styles.actionSlot}>
          <Text style={styles.actionLabel}>검색</Text>
        </View>
      </View>
    </View>
  );
}

function Row({ item, last }: { item: Item; last: boolean }) {
  return (
    <Pressable style={[styles.row, last && styles.rowLast]} accessibilityRole="button">
      <View style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <View style={styles.rowTitle}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rowHanja} numberOfLines={1}>
            ({item.hanja})
          </Text>
        </View>
        <Text style={styles.rowRating}>
          {item.rating}/{item.ratingMax}
        </Text>
        <Text style={styles.rowSummary} numberOfLines={1}>
          {item.summary}
        </Text>
      </View>
      <View style={[styles.statusTag, { borderColor: STATUS_COLOR[item.status] }]}>
        <Text style={[styles.statusLabel, { color: STATUS_COLOR[item.status] }]} numberOfLines={1}>
          [{item.status}]
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const ICON = 40;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  count: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionSlot: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: typography.serif,
    fontSize: 9,
    color: colors.inkSoft,
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  list: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: ICON,
    height: ICON,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  rowName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  rowHanja: {
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
  },
  rowRating: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  rowSummary: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  statusTag: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 56,
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: typography.serifMedium,
    fontSize: 10,
  },

  bottomArt: {
    width: '100%',
    aspectRatio: 3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArtLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
