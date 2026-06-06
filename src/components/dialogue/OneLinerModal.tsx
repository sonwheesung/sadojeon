import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDiscipleStore } from '@/stores/discipleStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { isDebugOverlayActive, usePendingStore } from '@/stores/pendingStore';
import {
  ONE_LINER_TONE_ORDER,
  respondToOneLiner,
} from '@/systems/oneLinerSystem';
import type { OneLinerTone } from '@/data/scenarios/oneLiners';
import { colors, radius, spacing, typography } from '@/theme';

// 한 마디 모달 — pendingStore.oneLiner 가 있을 때 표시.
// 4선택 응답 → LLM 호출 (가능하면) → 효과 적용 → 모달 즉시 닫힘.
// 결과 화면 X — 사용자 의도 (PM 결): 응답 직후 즉시 닫힘.
// LLM 디버그 + 효과 풍경은 다음 정산 모달에서 누적 표시.
export function OneLinerModal() {
  const pending = usePendingStore((s) => s.oneLiner);
  const wish = usePendingStore((s) => s.wish);
  const milestoneCount = usePendingStore((s) => s.milestones.length);
  const settlement = usePendingStore((s) => s.settlement);
  const debugActive = usePendingStore(isDebugOverlayActive);
  const moralPending = useMoralEventStore((s) => s.pending);
  const disciple = useDiscipleStore((s) =>
    pending ? s.disciples[pending.discipleId] : undefined,
  );
  // 도덕·희망·변곡점·정산·[DEV]디버그 오버레이 떠 있으면 가린다
  // (우선순위: 디버그 > 정산 > 변곡점 > 도덕 > 희망 > 한 마디).
  const blocked =
    wish != null ||
    milestoneCount > 0 ||
    moralPending != null ||
    settlement != null ||
    debugActive;

  const visible = !blocked && pending != null && disciple != null;

  // 선택 즉시 모달 닫힘 — LLM 응답은 백그라운드. 진행 시 정산이 대기.
  const onPick = (tone: OneLinerTone) => void respondToOneLiner(tone).catch(() => {});

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (pending) onPick('nod');
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {disciple && pending ? (
            <>
              <Text style={styles.speaker}>{disciple.name}</Text>
              <Text style={styles.body}>{pending.body}</Text>
              <View style={styles.divider} />
              <View style={styles.choices}>
                {ONE_LINER_TONE_ORDER.map((tone) => (
                  <ResponseButton
                    key={tone}
                    text={pending.responses[tone]}
                    onPress={() => onPick(tone)}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ResponseButton({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.responseButton, pressed && styles.responseButtonPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <Text style={styles.responseText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  speaker: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.xs,
  },
  choices: { gap: spacing.xs },
  responseButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  responseButtonPressed: {
    backgroundColor: colors.paperDark,
    opacity: 0.9,
  },
  responseText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.base,
    color: colors.ink,
    lineHeight: typography.sizes.base * 1.5,
  },
});
