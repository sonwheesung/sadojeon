import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useInboxStore } from '@/stores/inboxStore';
import {
  isRespondable,
  resolveInboxItem,
  responseOptionsFor,
  type InboxResponseOption,
} from '@/systems/inboxResolve';
import { colors, radius, spacing, typography } from '@/theme';
import type { InboxItem, InboxKind } from '@/types';

// ─── Kind 메타 매핑 ────────────────────────────────────────────────────────

const KIND_LABEL: Record<InboxKind, string> = {
  event: '사건',
  one_liner: '한 마디',
  complaint: '요청·불만',
  report: '보고',
  rumor: '풍문',
  letter: '서신',
  visit: '방문',
  recommendation: '추천',
  diplomacy: '외교',
  meeting_request: '면담 청',
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

const SENDER_LABEL_BY_KIND: Record<InboxKind, string> = {
  event: '관련 제자',
  one_liner: '발화 제자',
  letter: '발신자',
  complaint: '제기 제자',
  meeting_request: '면담 요청',
  visit: '방문자',
  recommendation: '대상 제자',
  diplomacy: '발신 세력',
  quest_offer: '의뢰자',
  report: '보고원',
  rumor: '소문 출처',
  system: '시스템',
};

function getSenderName(item: InboxItem): string {
  switch (item.kind) {
    case 'letter':
      return item.senderName;
    case 'visit':
      return item.visitorName;
    case 'diplomacy':
      return item.fromFaction;
    default:
      return '—';
  }
}

function getBody(item: InboxItem): string {
  if ('body' in item && item.body) return item.body;
  return item.preview;
}

const PRIORITY_LABEL: Record<InboxItem['priority'], string> = {
  low: '낮음',
  normal: '보통',
  high: '높음',
  urgent: '긴급',
};

// ─── Screen ────────────────────────────────────────────────────────────────

export default function InboxDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useInboxStore((s) => s.items.find((it) => it.id === id));
  const remove = useInboxStore((s) => s.remove);

  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!item) {
    return (
      <SafetyZone variant="modal" background={colors.background}>
        <PaperCard>
          <FallbackHeader />
          <View style={styles.empty}>
            <Text style={styles.emptyLabel}>이미 처리되거나 삭제된 항목입니다.</Text>
          </View>
        </PaperCard>
      </SafetyZone>
    );
  }

  const respondable = isRespondable(item);
  const options = respondable ? responseOptionsFor(item) : [];

  const onRespond = async () => {
    if (busy) return;
    if (!respondable) {
      // 읽기 전용 항목 — 확인 = 처리 = 삭제(삭제 버튼 없음, 적체 방지).
      remove(item.id);
      router.back();
      return;
    }
    if (!selected) return;
    setBusy(true);
    try {
      await resolveInboxItem(item, selected);
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[inbox] 응답 처리 실패', e);
    }
    router.back();
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header item={item} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <SenderPanel item={item} />
          <BodyScroll item={item} />
          <View style={styles.twoCol}>
            <InsightsPanel />
            <EnclosurePanel />
          </View>
          <View style={styles.twoCol}>
            <RelatedDisciplePanel item={item} />
            <ImpactPanel />
          </View>
          {respondable ? (
            <RepliesSection options={options} selected={selected} onSelect={setSelected} />
          ) : null}
        </ScrollView>
        <Footer
          label={respondable ? (busy ? '처리 중…' : '응답하기') : '확인'}
          disabled={busy || (respondable && !selected)}
          onPress={onRespond}
        />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ item }: { item: InboxItem }) {
  const action = KIND_ACTION[item.kind];
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
        <Text style={styles.kindLabel}>「{KIND_LABEL[item.kind]}」</Text>
        <Text style={styles.titleKr} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      {action ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeLabel}>{action}</Text>
        </View>
      ) : (
        <View style={styles.statusBadgeSpacer} />
      )}
    </View>
  );
}

function FallbackHeader() {
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
        <Text style={styles.kindLabel}>「서신함」</Text>
        <Text style={styles.titleKr}>항목 없음</Text>
      </View>
      <View style={styles.statusBadgeSpacer} />
    </View>
  );
}

// ─── Sender panel ──────────────────────────────────────────────────────────

function SenderPanel({ item }: { item: InboxItem }) {
  const senderLabel = SENDER_LABEL_BY_KIND[item.kind];
  const senderName = getSenderName(item);
  return (
    <View style={styles.senderPanel}>
      <View style={styles.senderPortrait}>
        <Text style={styles.placeholderLabel}>초상</Text>
      </View>
      <View style={styles.senderInfo}>
        <MetaRow label={senderLabel} value={senderName} />
        <MetaRow label="시기" value={`${item.createdAtDay}일차`} />
        <MetaRow label="위치 · 소속" value="—" />
        <View style={styles.priorityRow}>
          <Text style={styles.metaLabel}>우선도</Text>
          <Text style={styles.metaValue}>{PRIORITY_LABEL[item.priority]}</Text>
          <View
            style={[
              styles.priorityDot,
              item.priority === 'urgent' || item.priority === 'high'
                ? styles.priorityDotHot
                : null,
            ]}
          />
        </View>
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

// ─── Body scroll ──────────────────────────────────────────────────────────

function BodyScroll({ item }: { item: InboxItem }) {
  const body = getBody(item);
  return (
    <View style={styles.scroll}>
      <Text style={styles.scrollText}>{body}</Text>
      {item.kind === 'letter' ? <View style={styles.scrollSeal} /> : null}
    </View>
  );
}

// ─── Insights / Enclosure (placeholder) ──────────────────────────────────

function InsightsPanel() {
  return (
    <View style={styles.subPanel}>
      <Text style={styles.subPanelTitle}>
        🔒 통찰 정보 <Text style={styles.subPanelTitleSub}>(통찰 4 필요)</Text>
      </Text>
      <Text style={styles.bulletItem}>· 숨겨진 배경 자리</Text>
      <Text style={styles.bulletItem}>· 관련 인물 추정 자리</Text>
      <Text style={styles.bulletItem}>· 위험·기회 분석 자리</Text>
    </View>
  );
}

function EnclosurePanel() {
  return (
    <View style={styles.subPanel}>
      <Text style={styles.subPanelTitle}>동봉 자료</Text>
      <View style={styles.enclosureRow}>
        <View style={styles.enclosureCell}>
          <View style={styles.enclosureIcon} />
          <Text style={styles.enclosureLabel}>자료 1</Text>
        </View>
        <View style={styles.enclosureCell}>
          <View style={styles.enclosureIcon} />
          <Text style={styles.enclosureLabel}>자료 2</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Related disciple / Impact ────────────────────────────────────────────

function RelatedDisciplePanel({ item }: { item: InboxItem }) {
  const name = getSenderName(item);
  const sub = SENDER_LABEL_BY_KIND[item.kind];
  return (
    <View style={styles.subPanel}>
      <Text style={styles.subPanelTitle}>관련 제자</Text>
      <View style={styles.relatedRow}>
        <View style={styles.relatedPortrait} />
        <View style={styles.relatedInfo}>
          <Text style={styles.relatedName}>{name}</Text>
          <Text style={styles.relatedSub}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

function ImpactPanel() {
  return (
    <View style={styles.subPanel}>
      <Text style={styles.subPanelTitle}>
        영향 예상 <Text style={styles.subPanelTitleSub}>(선택에 따라 변동)</Text>
      </Text>
      <View style={styles.impactRow}>
        <Text style={styles.impactLabel}>사문 명성</Text>
        <Text style={styles.impactValue}>± 변동</Text>
      </View>
      <View style={styles.impactRow}>
        <Text style={styles.impactLabel}>사부 신뢰도</Text>
        <Text style={styles.impactValue}>± 변동</Text>
      </View>
      <View style={styles.impactRow}>
        <Text style={styles.impactLabel}>사문 분위기</Text>
        <Text style={styles.impactValue}>± 변동</Text>
      </View>
    </View>
  );
}

// ─── Replies ──────────────────────────────────────────────────────────────

function RepliesSection({
  options,
  selected,
  onSelect,
}: {
  options: InboxResponseOption[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={styles.repliesSection}>
      <Text style={styles.repliesHeader}>응답 선택</Text>
      {options.map((opt) => (
        <ReplyRow
          key={opt.key}
          option={opt}
          active={selected === opt.key}
          onPress={() => onSelect(opt.key)}
        />
      ))}
    </View>
  );
}

function ReplyRow({
  option,
  active,
  onPress,
}: {
  option: InboxResponseOption;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.reply, active && styles.replyActive, option.disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={option.disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: option.disabled }}
      accessibilityLabel={option.label}
    >
      <View style={[styles.replyRadio, active && styles.replyRadioActive]}>
        {active ? <View style={styles.replyRadioDot} /> : null}
      </View>
      <Text style={[styles.replyText, active && styles.replyTextActive]}>{option.label}</Text>
    </Pressable>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={({ pressed }) => [
          styles.respondBtn,
          disabled && styles.respondBtnDisabled,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[styles.respondLabel, disabled && styles.respondLabelDisabled]}>
          {label} ▶
        </Text>
      </Pressable>
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
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: { flex: 1, alignItems: 'center', gap: 2 },
  kindLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  titleKr: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  statusBadge: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.paperBright,
  },
  statusBadgeSpacer: {
    width: 64,
  },

  // Body
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

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

  // Sender panel
  senderPanel: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  senderPortrait: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    fontFamily: typography.serif,
    fontSize: 9,
    color: colors.inkSoft,
  },
  senderInfo: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'baseline' },
  metaLabel: {
    width: 64,
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
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inkSoft,
  },
  priorityDotHot: {
    backgroundColor: colors.seal,
  },

  // Scroll body
  scroll: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    padding: spacing.base,
    backgroundColor: colors.paperBright,
  },
  scrollText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    lineHeight: 20,
  },
  scrollSeal: {
    alignSelf: 'flex-end',
    width: 20,
    height: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 2,
    marginTop: 6,
  },

  // Sub-panel two col
  twoCol: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  subPanel: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    gap: 4,
  },
  subPanelTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  subPanelTitleSub: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  bulletItem: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkLight,
  },

  // Enclosure
  enclosureRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  enclosureCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  enclosureIcon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  enclosureLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Related disciple
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  relatedPortrait: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 18,
  },
  relatedInfo: { flex: 1 },
  relatedName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  relatedSub: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Impact
  impactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  impactLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  impactValue: {
    fontFamily: typography.serifMedium,
    fontSize: 10,
    color: colors.ink,
  },

  // Replies
  repliesSection: { gap: spacing.xs, marginTop: spacing.xs },
  repliesHeader: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginBottom: 2,
  },
  reply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    backgroundColor: colors.paperLight,
  },
  replyActive: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  replyRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyRadioActive: {
    borderColor: colors.seal,
  },
  replyRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.seal,
  },
  replyText: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: typography.sizes.sm * 1.4,
  },
  replyTextActive: {
    fontFamily: typography.serifMedium,
    color: colors.ink,
  },

  // Footer
  footer: {
    paddingTop: spacing.sm,
  },
  respondBtn: {
    height: 48,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  respondBtnDisabled: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
  },
  respondLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wide,
  },
  respondLabelDisabled: {
    color: colors.inkSoft,
  },
  pressed: { opacity: 0.85 },
});
