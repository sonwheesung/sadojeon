import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { colors, spacing, typography } from '@/theme';
import type { InboxItem, InboxKind } from '@/types';

// ─── Placeholder data ───────────────────────────────────────────────────────

// docs/12_인박스_면담.md "응답 필요 여부" 매핑.
const KIND_LABEL: Record<InboxKind, string> = {
  event: '이벤트',
  one_liner: '한마디',
  complaint: '요청불만',
  report: '보고',
  rumor: '풍문',
  letter: '서신',
  visit: '방문',
  recommendation: '추천',
  diplomacy: '외교',
  meeting_request: '면담청',
  quest_offer: '의뢰',
  system: '공지',
};

const KIND_ACTION: Partial<Record<InboxKind, string>> = {
  event: '결정 필요',
  one_liner: '응답 가능',
  complaint: '응답 필요',
  letter: '답신 가능',
  visit: '응답 필요',
  recommendation: '결정 필요',
  diplomacy: '응답 필요',
  meeting_request: '응답 필요',
  quest_offer: '결정 필요',
};

type FilterKey = 'all' | 'decision' | 'unread';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'decision', label: '결정 필요' },
  { key: 'unread', label: '읽지 않음' },
];
const DECISION_ACTIONS = ['결정 필요', '응답 필요'] as const;

function relativeDayLabel(diff: number): string {
  if (diff <= 0) return '오늘';
  if (diff === 1) return '어제';
  return `${diff}일 전`;
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const totalDay = useTimeStore((s) => s.totalDay);
  const items = useInboxStore((s) => s.items);
  const markRead = useInboxStore((s) => s.markRead);
  const reset = useInboxStore((s) => s.reset);
  const confirm = useConfirm();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter === 'unread') return !it.read;
      if (filter === 'decision') {
        const action = KIND_ACTION[it.kind];
        return action ? (DECISION_ACTIONS as readonly string[]).includes(action) : false;
      }
      return true;
    });
  }, [items, filter]);

  const decisionCount = useMemo(
    () =>
      items.filter((it) => {
        const action = KIND_ACTION[it.kind];
        return action ? (DECISION_ACTIONS as readonly string[]).includes(action) : false;
      }).length,
    [items],
  );

  const onMarkAllRead = async () => {
    const unread = items.filter((it) => !it.read);
    if (unread.length === 0) return;
    const ok = await confirm({
      title: '모두 읽음 처리',
      message: `읽지 않은 서신 ${unread.length}건을 모두 읽음으로 표시할까요?`,
      confirmLabel: '모두 읽음',
    });
    if (!ok) return;
    unread.forEach((it) => markRead(it.id));
  };

  const onClearAll = async () => {
    const ok = await confirm({
      title: '전체 삭제',
      message: '모든 서신을 삭제합니다. 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (ok) reset();
  };

  const onPressItem = (it: InboxItem) => {
    if (!it.read) markRead(it.id);
    router.push(`/inbox/${encodeURIComponent(it.id)}` as Href);
  };

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <Header onMarkAllRead={onMarkAllRead} onClearAll={onClearAll} />
        <FilterTabs current={filter} onChange={setFilter} decisionCount={decisionCount} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            filtered.map((it) => (
              <InboxRow
                key={it.id}
                item={it}
                today={totalDay}
                onPress={() => onPressItem(it)}
              />
            ))
          )}
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({
  onMarkAllRead,
  onClearAll,
}: {
  onMarkAllRead: () => void;
  onClearAll: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>← 뒤로</Text>
        </Pressable>
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          서신함
        </Text>
        <Text style={styles.headerTitleCn} numberOfLines={1}>
          書信函
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="모두 읽음"
          onPress={onMarkAllRead}
          style={styles.headerAction}
        >
          <Text style={styles.headerActionLabel}>모두 읽음</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="전체 삭제"
          onPress={onClearAll}
          style={styles.headerAction}
        >
          <Text style={styles.headerActionLabel}>전체 삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterTabs({
  current,
  onChange,
  decisionCount,
}: {
  current: FilterKey;
  onChange: (k: FilterKey) => void;
  decisionCount: number;
}) {
  return (
    <View style={styles.tabs}>
      {FILTERS.map((f) => {
        const active = f.key === current;
        const showDot = f.key === 'decision' && decisionCount > 0;
        return (
          <Pressable
            key={f.key}
            accessibilityRole="button"
            accessibilityLabel={f.label}
            onPress={() => onChange(f.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {f.label}
            </Text>
            {showDot && <View style={styles.tabDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function InboxRow({
  item,
  today,
  onPress,
}: {
  item: InboxItem;
  today: number;
  onPress: () => void;
}) {
  const action = KIND_ACTION[item.kind];
  const dateLabel = relativeDayLabel(today - item.createdAtDay);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${KIND_LABEL[item.kind]}: ${item.title}`}
      style={styles.row}
    >
      <KindLabel kind={item.kind} />
      <View style={styles.rowBody}>
        <View style={styles.rowHead}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {action && <ActionBadge label={action} />}
        </View>
        <Text style={styles.rowPreview} numberOfLines={2}>
          {item.preview}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowDate}>{dateLabel}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );
}

function KindLabel({ kind }: { kind: InboxKind }) {
  // 짧은 한국어 라벨을 좁은 박스 안에서 글자별로 줄바꿈 (세로형 라벨 효과).
  const label = KIND_LABEL[kind];
  const chars = label.split('');
  return (
    <View style={styles.kindBox}>
      {chars.map((ch, idx) => (
        <Text key={idx} style={styles.kindChar}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

function ActionBadge({ label }: { label: string }) {
  return (
    <View style={styles.actionBadge}>
      <Text style={styles.actionBadgeLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ filter }: { filter: FilterKey }) {
  const message =
    filter === 'unread'
      ? '읽지 않은 서신이 없습니다.'
      : filter === 'decision'
        ? '결정 필요한 서신이 없습니다.'
        : '서신함이 비어 있습니다.';
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyLabel}>{message}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const KIND_BOX_WIDTH = 32;

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
    width: 60,
  },
  backButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  backLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexShrink: 1,
  },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerTitleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerAction: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  headerActionLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Filter tabs
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tabActive: {
    backgroundColor: colors.ink,
  },
  tabLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    color: colors.paperBright,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.seal,
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },

  // Row
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  kindBox: {
    width: KIND_BOX_WIDTH,
    minHeight: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  kindChar: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    lineHeight: 14,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowTitle: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  rowPreview: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },
  rowMeta: {
    width: 48,
    alignItems: 'flex-end',
    gap: 4,
  },
  rowDate: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.seal,
  },

  // Action badge
  actionBadge: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  actionBadgeLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Empty
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
});
