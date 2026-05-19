import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { colors, spacing, typography } from '@/theme';

// ─── Category label map ────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  martial: '무공 도감',
  item: '물품 도감',
  people: '인물 도감',
  event: '사건 기록',
};

const FILTERS_BY_CATEGORY: Record<string, readonly string[]> = {
  martial: ['전체', '검법', '도법', '창법', '권법', '심법'],
  item: ['전체', '무구', '의복', '호신부', '단약', '잡화'],
  people: ['전체', '정파', '사파', '중도', '강호'],
  event: ['전체', '사문', '강호', '개인'],
};

// ─── Placeholder data ──────────────────────────────────────────────────────

interface CodexEntry {
  id: string;
  name: string;
  rating: number;
  ratingMax: number;
  unlocked: boolean;
}

const ENTRIES: CodexEntry[] = [
  { id: 'cheongryong', name: '청룡검결', rating: 4, ratingMax: 5, unlocked: true },
  { id: 'taesan', name: '태산심법', rating: 3, ratingMax: 5, unlocked: true },
  { id: 'palgwae', name: '팔괘검법', rating: 2, ratingMax: 5, unlocked: true },
  { id: 'u1', name: '???', rating: 1, ratingMax: 5, unlocked: false },
  { id: 'honwon', name: '혼원도', rating: 4, ratingMax: 5, unlocked: true },
  { id: 'yuseong', name: '유성보법', rating: 3, ratingMax: 5, unlocked: true },
  { id: 'gimun', name: '기문둔갑', rating: 2, ratingMax: 5, unlocked: true },
  { id: 'u2', name: '???', rating: 0, ratingMax: 5, unlocked: false },
  { id: 'gangryong', name: '강룡권', rating: 3, ratingMax: 5, unlocked: true },
  { id: 'u3', name: '???', rating: 0, ratingMax: 5, unlocked: false },
  { id: 'unryong', name: '운룡심법', rating: 4, ratingMax: 5, unlocked: true },
  { id: 'u4', name: '???', rating: 0, ratingMax: 5, unlocked: false },
];

const FOUND = 42;
const TOTAL = 250;

// ─── Screen ────────────────────────────────────────────────────────────────

export default function CodexCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const label = CATEGORY_LABEL[category ?? ''] ?? '도감';
  const filters = FILTERS_BY_CATEGORY[category ?? ''] ?? ['전체'];
  const [filter, setFilter] = useState(filters[0]);

  const ratio = FOUND / TOTAL;

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header label={label} found={FOUND} total={TOTAL} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
        </View>
        <Text style={styles.foundLine}>
          발견 {FOUND} · 미발견 {TOTAL - FOUND}
        </Text>
        <FilterTabs options={filters} active={filter} onChange={setFilter} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {ENTRIES.map((e) => (
              <Cell key={e.id} entry={e} />
            ))}
          </View>
          <View style={styles.bottomArt}>
            <Text style={styles.bottomArtLabel}>책장 일러스트</Text>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ label, found, total }: { label: string; found: number; total: number }) {
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
      </View>
      <Text style={styles.progress}>
        {found} / {total}
      </Text>
    </View>
  );
}

function FilterTabs({
  options,
  active,
  onChange,
}: {
  options: readonly string[];
  active: string;
  onChange: (s: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <Pressable
            key={opt}
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            onPress={() => onChange(opt)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{opt}</Text>
            {isActive ? <View style={styles.filterDot} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Cell({ entry }: { entry: CodexEntry }) {
  return (
    <View style={styles.cellWrap}>
      <Pressable
        style={[styles.cell, !entry.unlocked && styles.cellLocked]}
        accessibilityRole="button"
      >
        <View style={[styles.cellIcon, !entry.unlocked && styles.cellIconLocked]} />
        <Text
          style={[styles.cellName, !entry.unlocked && styles.cellNameLocked]}
          numberOfLines={1}
        >
          {entry.name}
        </Text>
        <Text style={[styles.cellRating, !entry.unlocked && styles.cellRatingLocked]}>
          {entry.unlocked ? `${entry.rating}/${entry.ratingMax}` : `?/${entry.ratingMax}`}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

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
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  progress: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  progressTrack: {
    height: 6,
    backgroundColor: colors.paperDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.ink,
  },
  foundLine: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
    paddingBottom: spacing.xs,
  },

  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    gap: 2,
  },
  filterTabActive: {
    borderStyle: 'solid',
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  filterLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  filterLabelActive: {
    fontFamily: typography.serifBold,
    color: colors.paperBright,
  },
  filterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.seal,
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: '25%',
    padding: 3,
  },
  cell: {
    aspectRatio: 0.8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  cellLocked: {
    opacity: 0.55,
  },
  cellIcon: {
    width: '70%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  cellIconLocked: {
    borderColor: colors.inkSoft,
  },
  cellName: {
    fontFamily: typography.serifBold,
    fontSize: 11,
    color: colors.ink,
  },
  cellNameLocked: {
    color: colors.inkSoft,
  },
  cellRating: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  cellRatingLocked: {
    color: colors.inkSoft,
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
