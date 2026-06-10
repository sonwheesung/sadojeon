import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { colors, spacing, typography } from '@/theme';
import type { InboxItem, InboxKind } from '@/types';

// 서신함 — 헤더 봉투 아이콘으로 진입하는 스택(모달) 라우트.
// docs/12_인박스_면담.md "응답 필요 여부" 매핑.
// (필터 탭·모두 읽음은 제거 — 전체 목록 단일 뷰, 2026-06-10.)
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

  const onPressItem = (it: InboxItem) => {
    if (!it.read) markRead(it.id);
    router.push(`/inbox/${encodeURIComponent(it.id)}` as Href);
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((it) => (
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

function Header() {
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
      <View style={styles.headerLeft} />
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

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyLabel}>서신함이 비어 있습니다.</Text>
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
