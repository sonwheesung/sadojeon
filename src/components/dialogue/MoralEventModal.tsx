import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMoralEventStore } from '@/stores/moralEventStore';
import { useMasterStore } from '@/stores/masterStore';
import { isDebugOverlayActive, usePendingStore } from '@/stores/pendingStore';
import { resolveMoralChoice } from '@/systems/moralEventSystem';
import type { MoralChoice, MoralChoiceTone } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';

// 도덕적 갈등 이벤트 모달 — docs/07.
// 본문(3~5줄) + 통찰 단계별 한 줄 힌트 + 사부 4선택.
// 응답 직후 모달 즉시 닫힘 (PM 결). 결과는 다음 정산 모달에 누적 표시.
export function MoralEventModal() {
  const pending = useMoralEventStore((s) => s.pending);
  const settlement = usePendingStore((s) => s.settlement);
  const debugActive = usePendingStore(isDebugOverlayActive);
  const masterName = useMasterStore((s) => s.master?.name ?? '사부');

  // 정산·[DEV]디버그 오버레이가 떠 있으면 도덕 이벤트도 가린다 — 정산·디버그가 최우선.
  const visible = pending != null && settlement == null && !debugActive;

  // 선택 즉시 모달 닫힘(pending 클리어) — LLM 응답은 백그라운드. 진행 시 정산이 대기.
  const onPick = (tone: MoralChoiceTone) => {
    void resolveMoralChoice(tone).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // 강제 결정 — onRequestClose 시 admonish (가장 중립적).
      onRequestClose={() => {
        if (pending) onPick('admonish');
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {pending ? (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.headerEyebrow}>사문 정황</Text>
                <Text style={styles.headerSpeaker}>{masterName}의 결정</Text>
              </View>

              <ScrollView
                style={styles.bodyScroll}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.body}>{pending.body}</Text>
                {pending.hint ? (
                  <View style={styles.hintBlock}>
                    <Text style={styles.hintLabel}>통찰</Text>
                    <Text style={styles.hintText}>{pending.hint}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.divider} />

              <View style={styles.choices}>
                {pending.choices.map((c) => (
                  <ChoiceButton key={c.tone} choice={c} onPress={() => onPick(c.tone)} />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ChoiceButton({
  choice,
  onPress,
}: {
  choice: MoralChoice;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.choiceButton, pressed && styles.choicePressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={choice.label}
    >
      <Text style={styles.choiceText}>{choice.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerEyebrow: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSpeaker: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  bodyScroll: { maxHeight: 280 },
  bodyContent: { gap: spacing.sm },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.7,
  },
  hintBlock: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  hintLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  hintText: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    lineHeight: typography.sizes.xs * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.xs,
  },
  choices: { gap: spacing.xs },
  choiceButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  choicePressed: {
    backgroundColor: colors.paperDark,
    opacity: 0.9,
  },
  choiceText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.55,
  },
});
