import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABEL,
} from '@/data/labels';
import { useItemStore } from '@/stores/itemStore';
import { colors, spacing, typography } from '@/theme';

// "내 물건"은 회차별 물품(itemStore, DB 동기화)에서. 도감은 별도 시스템(placeholder).

type Tab = 'mine' | 'codex';

interface CodexRow {
  key: string;
  label: string;
  current: number;
  total: number;
}

const CODEX: CodexRow[] = [
  { key: 'martial', label: '무공 도감', current: 42, total: 250 },
  { key: 'item', label: '물품 도감', current: 78, total: 300 },
  { key: 'people', label: '인물 도감', current: 26, total: 180 },
  { key: 'event', label: '사건 기록', current: 15, total: 120 },
];

// ─── Screen ────────────────────────────────────────────────────────────────

export default function GoodsScreen() {
  const [tab, setTab] = useState<Tab>('mine');

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <Header />
        <Tabs active={tab} onChange={setTab} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'mine' ? <OwnedList /> : <CodexList />}
          <View style={styles.bottomArt}>
            <Text style={styles.bottomArtLabel}>
              {tab === 'mine' ? '상자 일러스트' : '책장 일러스트'}
            </Text>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon} />
      <View style={styles.titleWrap}>
        <Text style={styles.title}>물품</Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.headerActionSlot}>
          <Text style={styles.headerActionLabel}>정렬</Text>
        </View>
        <View style={styles.headerActionSlot}>
          <Text style={styles.headerActionLabel}>검색</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

function Tabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={styles.tabs}>
      <TabButton label="내 물건" active={active === 'mine'} onPress={() => onChange('mine')} />
      <View style={styles.tabDivider} />
      <TabButton label="도감" active={active === 'codex'} onPress={() => onChange('codex')} />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
      {active ? <View style={styles.tabDot} /> : null}
    </Pressable>
  );
}

// ─── My goods ──────────────────────────────────────────────────────────────

function OwnedList() {
  const items = useItemStore((s) => s.items);
  return (
    <View style={styles.list}>
      {INVENTORY_CATEGORIES.map((cat, idx) => {
        const count = items
          .filter((i) => i.category === cat)
          .reduce((sum, i) => sum + i.count, 0);
        return (
          <Pressable
            key={cat}
            style={[styles.row, idx === INVENTORY_CATEGORIES.length - 1 && styles.rowLast]}
            onPress={() => router.push(`/inventory/${cat}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${INVENTORY_CATEGORY_LABEL[cat]} 상세`}
          >
            <View style={styles.rowIcon} />
            <Text style={styles.rowLabel} numberOfLines={1}>
              {INVENTORY_CATEGORY_LABEL[cat]}
            </Text>
            <Text style={styles.rowCount}>{count}개</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Codex ─────────────────────────────────────────────────────────────────

function CodexList() {
  return (
    <View style={styles.list}>
      {CODEX.map((row, idx) => {
        const ratio = row.current / row.total;
        return (
          <Pressable
            key={row.key}
            style={[styles.codexRow, idx === CODEX.length - 1 && styles.rowLast]}
            onPress={() => router.push(`/codex/${row.key}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${row.label} 상세`}
          >
            <View style={styles.rowIcon} />
            <View style={styles.codexBody}>
              <View style={styles.codexHeader}>
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {row.label}
                </Text>
                <Text style={styles.codexProgress}>
                  {row.current} / {row.total}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const ICON_SIZE = 36;
const HEADER_ICON = 32;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerIcon: {
    width: HEADER_ICON,
    height: HEADER_ICON,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerActionSlot: {
    width: 36,
    height: HEADER_ICON,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    alignItems: 'center',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.ink,
  },
  tabDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.inkSoft,
  },
  tabLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    fontFamily: typography.serifBold,
    color: colors.paperBright,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.seal,
  },

  // Body
  body: { flex: 1 },
  bodyContent: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  // List
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
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  rowCount: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Codex
  codexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  codexBody: {
    flex: 1,
    gap: 6,
  },
  codexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  codexProgress: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.paperDark,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.ink,
  },

  // Bottom art
  bottomArt: {
    width: '100%',
    aspectRatio: 3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  bottomArtLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
