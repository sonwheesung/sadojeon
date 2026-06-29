import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useTutorialOnFocus } from '@/hooks/useTutorialOnFocus';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { colors, spacing, typography } from '@/theme';
import { isDecisionKind, type InboxItem, type InboxKind } from '@/types';

// 서신함 — 헤더 봉투 아이콘으로 진입하는 스택(모달) 라우트.
// docs/12_인박스_면담.md "응답 필요 여부" 매핑.
// (필터 탭·모두 읽음은 제거 — 전체 목록 단일 뷰, 2026-06-10.)
// 활성/지난 2분할(2026-06-29, docs/12·49 C6) — 처리한 서신이 새 서신을 묻던 적체 차단.
// 활성 = 아직 안 처리(미해소 결정형 또는 안 읽음). 지난 = 처리 완료(resolved 또는 읽은 정보성).
// 삭제가 아니라 보관 — '지난 서신' 접이식에서 과거 대화 다시 열람(캐릭터 기록 보존).
function isActiveItem(it: InboxItem): boolean {
  return !it.read || (isDecisionKind(it.kind) && !it.resolved);
}
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
  useTutorialOnFocus('inbox'); // 서신함 첫 진입 — 결정형 서신 안내. docs/44
  const totalDay = useTimeStore((s) => s.totalDay);
  const items = useInboxStore((s) => s.items);
  const markRead = useInboxStore((s) => s.markRead);
  const [showPast, setShowPast] = useState(false);

  const onPressItem = (it: InboxItem) => {
    if (!it.read) markRead(it.id);
    router.push(`/inbox/${encodeURIComponent(it.id)}` as Href);
  };

  // 원래 순서(최신순) 보존하며 활성/지난 분리.
  const active = items.filter(isActiveItem);
  const past = items.filter((it) => !isActiveItem(it));

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
            <>
              {active.length === 0 ? (
                <ActiveEmpty />
              ) : (
                active.map((it) => (
                  <InboxRow key={it.id} item={it} today={totalDay} onPress={() => onPressItem(it)} />
                ))
              )}
              {past.length > 0 && (
                <>
                  <Pressable
                    onPress={() => setShowPast((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={`지난 서신 ${past.length}건 ${showPast ? '접기' : '펼치기'}`}
                    style={styles.pastToggle}
                  >
                    <Text style={styles.pastToggleLabel}>
                      {showPast ? '▾' : '▸'} 지난 서신 ({past.length})
                    </Text>
                  </Pressable>
                  {showPast &&
                    past.map((it) => (
                      <InboxRow key={it.id} item={it} today={totalDay} onPress={() => onPressItem(it)} />
                    ))}
                </>
              )}
            </>
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
  // 해소된 건 '응답 필요' 등 행동 배지를 숨긴다(이미 처리 — 지난 서신에서 오해 방지).
  const action = item.resolved ? undefined : KIND_ACTION[item.kind];
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

// 활성은 비었지만 지난 서신은 있을 때 — 다 처리했음을 알린다.
function ActiveEmpty() {
  return (
    <View style={styles.activeEmpty}>
      <Text style={styles.emptyLabel}>처리할 서신이 없습니다.</Text>
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
  activeEmpty: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },

  // 지난 서신 접이식 토글
  pastToggle: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  pastToggleLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.wide,
  },
});
