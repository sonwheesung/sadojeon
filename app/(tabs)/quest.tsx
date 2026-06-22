import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { QuestRiskMarks } from '@/components/quest/QuestRiskMarks';
import {
  QUEST_DOMAIN_LABEL,
  QUEST_GRADE_LABEL,
  QUEST_GRADE_RISK,
  QUEST_KIND_LABEL,
} from '@/data/quests';
import { useTutorialOnFocus } from '@/hooks/useTutorialOnFocus';
import { useDiscipleStore, useQuestStore, useTimeStore } from '@/stores';
import { canDispatch, dispatchQuest, fitPhrase, generateBoard } from '@/systems/questSystem';
import { colors, spacing, typography } from '@/theme';
import type { ActiveQuest, Disciple, Quest } from '@/types';

// 의뢰 화면 — 파견 중 + 게시판. 파견은 모달. 결산은 서신함(마일스톤). docs/28 §4.

export default function QuestScreen() {
  useTutorialOnFocus('quest'); // 의뢰 첫 진입 — 파견의 득·실 안내. docs/44
  const board = useQuestStore((s) => s.board);
  const active = useQuestStore((s) => s.active);
  const [dispatchQuest_, setDispatchQuest] = useState<Quest | null>(null);

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <AppHeader />
        <View style={styles.titleRow}>
          <Text style={styles.title}>의뢰</Text>
          <Text style={styles.titleCn}>(依賴)</Text>
        </View>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHead}>
            <SectionLabel>파견 중</SectionLabel>
            <Text style={styles.count}>{active.length}건</Text>
          </View>
          {active.length === 0 ? (
            <Empty label="파견 중인 의뢰가 없습니다." />
          ) : (
            active.map((a) => <ActiveCard key={a.quest.id} active={a} />)
          )}

          <View style={styles.sectionHead}>
            <SectionLabel>게시판</SectionLabel>
            <Text style={styles.count}>{board.length}건</Text>
          </View>
          {board.length === 0 ? (
            <Empty label="받을 수 있는 의뢰가 없습니다. 마을을 방문해 보세요." />
          ) : (
            board.map((q) => (
              <BoardCard key={q.id} quest={q} onPress={() => setDispatchQuest(q)} />
            ))
          )}
        </ScrollView>
        <Pressable
          onPress={generateBoard}
          accessibilityRole="button"
          accessibilityLabel="마을 방문 — 게시판 갱신"
          style={styles.refresh}
        >
          <Text style={styles.refreshLabel}>마을 방문 — 게시판 갱신</Text>
        </Pressable>
      </PaperCard>

      {dispatchQuest_ && (
        <DispatchModal quest={dispatchQuest_} onClose={() => setDispatchQuest(null)} />
      )}
    </SafetyZone>
  );
}

// ─── 카드 ─────────────────────────────────────────────────────────────────

function rewardLine(quest: Quest): string {
  const fame = quest.reward.fame >= 8 ? '명성 ↑↑' : '명성 ↑';
  return `자금 ${quest.reward.money} · ${fame} · ${QUEST_DOMAIN_LABEL[quest.domain]} 경험`;
}

function BoardCard({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const risk = QUEST_GRADE_RISK[quest.grade];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${QUEST_GRADE_LABEL[quest.grade]} 의뢰 ${quest.title}`}
      style={styles.card}
    >
      <View style={styles.cardBody}>
        <Text style={styles.cardHead} numberOfLines={1}>
          <Text style={styles.tag}>
            [{QUEST_DOMAIN_LABEL[quest.domain]}·{QUEST_GRADE_LABEL[quest.grade]}]
          </Text>{' '}
          {quest.title}
          {quest.kind ? <Text style={styles.kindTag}> · {QUEST_KIND_LABEL[quest.kind]}</Text> : null}
          <Text style={styles.client}> — {quest.client}</Text>
          {quest.gray ? <Text style={styles.gray}> · 회색</Text> : null}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {quest.preview}
        </Text>
        <Text style={styles.footer} numberOfLines={2}>
          ⏱ 예상 {quest.weeks}주 · {rewardLine(quest)} · 추천 {quest.recommended}명
        </Text>
        <QuestRiskMarks grade={quest.grade} />
        {risk.note ? <Text style={styles.riskNote}>비고 — {risk.note}</Text> : null}
      </View>
    </Pressable>
  );
}

function ActiveCard({ active }: { active: ActiveQuest }) {
  const totalDay = useTimeStore((s) => s.totalDay);
  const ds = useDiscipleStore((s) => s.disciples);
  const names = active.discipleIds.map((id) => ds[id]?.name ?? '?').join('·');
  const elapsed = Math.max(0, Math.ceil((totalDay - active.startedDay) / 7));
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardHead} numberOfLines={1}>
          <Text style={styles.tag}>
            [{QUEST_DOMAIN_LABEL[active.quest.domain]}·{QUEST_GRADE_LABEL[active.quest.grade]}]
          </Text>{' '}
          {active.quest.title}
        </Text>
        <Text style={styles.activeSub} numberOfLines={1}>
          {names} · {Math.min(elapsed, active.quest.weeks)}/{active.quest.weeks}주
        </Text>
      </View>
      <View style={styles.activeBadge}>
        <Text style={styles.activeBadgeLabel}>진행 중</Text>
      </View>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyLabel}>{label}</Text>
    </View>
  );
}

// ─── 파견 모달 ───────────────────────────────────────────────────────────

function DispatchModal({ quest, onClose }: { quest: Quest; onClose: () => void }) {
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const risk = QUEST_GRADE_RISK[quest.grade];
  const [selected, setSelected] = useState<string[]>([]);

  const candidates = useMemo(
    () => order.map((id) => disciples[id]).filter((d): d is Disciple => d != null),
    [order, disciples],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onDispatch = () => {
    if (selected.length === 0) return;
    if (dispatchQuest(quest.id, selected)) onClose();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            [{QUEST_DOMAIN_LABEL[quest.domain]}·{QUEST_GRADE_LABEL[quest.grade]}] {quest.title}
          </Text>
          <Text style={styles.modalClient}>의뢰인: {quest.client}</Text>
          <Text style={styles.modalDesc}>{quest.preview}</Text>
          <Text style={styles.modalMeta}>
            ⏱ 예상 {quest.weeks}주 · {rewardLine(quest)} · 추천 {quest.recommended}명
          </Text>
          <QuestRiskMarks grade={quest.grade} />
          {risk.note ? <Text style={styles.riskNote}>비고 — {risk.note}</Text> : null}

          <Text style={styles.pickLabel}>누구를 보낼까 {selected.length > 0 ? `(${selected.length}명)` : ''}</Text>
          <ScrollView style={styles.pickList}>
            {candidates.map((d) => {
              const able = canDispatch(d, quest);
              const isSel = selected.includes(d.id);
              const reason =
                d.status !== 'training'
                  ? statusLabel(d.status)
                  : !able
                    ? '자격 미달'
                    : fitPhrase(d, quest);
              const disabled = d.status !== 'training' || !able;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => !disabled && toggle(d.id)}
                  disabled={disabled}
                  style={[styles.pickRow, isSel && styles.pickRowSel, disabled && styles.pickRowOff]}
                >
                  <Text style={styles.pickCheck}>{isSel ? '☑' : disabled ? '✕' : '☐'}</Text>
                  <Text style={styles.pickName}>{d.name}</Text>
                  <Text style={styles.pickFit}>{reason}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={[styles.modalBtn, styles.modalBtnGhost]}>
              <Text style={styles.modalBtnGhostLabel}>물린다</Text>
            </Pressable>
            <Pressable
              onPress={onDispatch}
              disabled={selected.length === 0}
              style={[styles.modalBtn, selected.length === 0 && styles.modalBtnOff]}
            >
              <Text style={styles.modalBtnLabel}>파견한다{selected.length > 0 ? ` (${selected.length})` : ''}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function statusLabel(s: Disciple['status']): string {
  switch (s) {
    case 'questing':
      return '파견 중';
    case 'injured':
      return '부상 중';
    case 'graduated':
      return '하산';
    case 'departed':
      return '떠남';
    default:
      return '불가';
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingVertical: spacing.xs },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  titleCn: { fontFamily: typography.serifCN, fontSize: typography.sizes.sm, color: colors.inkSoft },
  body: { flex: 1 },
  bodyContent: { gap: spacing.xs, paddingBottom: spacing.sm },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  count: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardBody: { flex: 1, gap: 3 },
  cardHead: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.ink },
  tag: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.inkSoft },
  client: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  gray: { color: colors.seal, fontSize: typography.sizes.xs },
  kindTag: { fontFamily: typography.serifMedium, color: colors.brown, fontSize: typography.sizes.xs },
  preview: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkLight, lineHeight: 16 },
  footer: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.ink, marginTop: 2 },
  footerWarn: { color: colors.seal },
  riskNote: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    lineHeight: 16,
    marginTop: 1,
  },
  activeSub: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.ink },
  activeBadge: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  activeBadgeLabel: { fontFamily: typography.serif, fontSize: 10, color: colors.inkSoft },
  empty: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyLabel: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkSoft },
  refresh: {
    minHeight: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  refreshLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink },

  // 모달
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.paper,
    borderRadius: 8,
    padding: spacing.base,
    gap: spacing.xs,
    maxHeight: '85%',
  },
  modalTitle: { fontFamily: typography.serifBold, fontSize: typography.sizes.md, color: colors.ink },
  modalClient: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  modalDesc: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkLight, lineHeight: 18 },
  modalMeta: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.ink },
  pickLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  pickList: { maxHeight: 220 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
  },
  pickRowSel: { backgroundColor: colors.paperDark },
  pickRowOff: { opacity: 0.45 },
  pickCheck: { fontFamily: typography.serif, fontSize: typography.sizes.md, color: colors.ink, width: 20 },
  pickName: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink, width: 64 },
  pickFit: { flex: 1, fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  modalBtnOff: { opacity: 0.4 },
  modalBtnLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.paperBright },
  modalBtnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.inkSoft },
  modalBtnGhostLabel: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink },
});
