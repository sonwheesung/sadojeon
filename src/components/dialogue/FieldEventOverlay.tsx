import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFieldEventStore } from '@/stores/fieldEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import { resolveFieldEvent } from '@/systems/fieldEventSystem';
import type { CutsceneTone } from '@/data/cutscenes';
import { colors, radius, spacing, typography } from '@/theme';

// 현장 급보 오버레이 — 강호 출행·의뢰 중 사건을 **컷씬 → 선택 모달**로 그 자리에서. docs/20·38.
// 서신함(비동기)이 아니라 턴 진행 흐름 안에서 끊고 결정한다(정산 모달이 닫힌 뒤 재생).
// 그레이박스: 컷씬 = 위 띠(사건명·큰 한자)/그림 자리(dashed)/아래 띠(서사) 3단 — 실제 그림은 추후.

const TONE_ACCENT: Record<CutsceneTone, string> = {
  gold: colors.gold,
  ink: colors.paperBright,
  blood: colors.seal,
};

export function FieldEventOverlay() {
  const current = useFieldEventStore((s) => s.queue[0]);
  const pop = useFieldEventStore((s) => s.pop);
  // 정산 모달이 떠 있는 동안은 숨김 — [다음 ▶] 으로 닫힌 뒤(턴 진행 흐름 끝) 재생.
  const settlement = usePendingStore((s) => s.settlement);

  const [phase, setPhase] = useState<'scene' | 'choice'>('scene');
  useEffect(() => {
    setPhase('scene'); // 새 사건마다 컷씬부터.
  }, [current?.id]);

  if (!current || settlement) {
    return <Modal visible={false} transparent />;
  }

  const accent = TONE_ACCENT[current.tone];

  const onChoose = (key: string, disabled: boolean) => {
    if (disabled) return;
    resolveFieldEvent(current, key);
    pop();
    setPhase('scene');
  };

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={() => {}}>
      {phase === 'scene' ? (
        // ── 컷씬(그레이박스 3단) — 탭하여 계속 ──
        <Pressable
          style={styles.scene}
          onPress={() => setPhase('choice')}
          accessibilityRole="button"
          accessibilityLabel="계속"
        >
          <View style={styles.topBand} pointerEvents="none">
            <Text style={[styles.eventTitle, { color: accent }]}>{current.title}</Text>
            <Text style={[styles.hanzi, { color: accent }]}>{current.hanzi}</Text>
          </View>
          <View style={styles.artWrap} pointerEvents="none">
            <View style={[styles.artSlot, { borderColor: accent }]}>
              <Text style={styles.artSlotLabel}>(사건 컷 자리 — 그레이박스)</Text>
            </View>
          </View>
          <View style={styles.bottomBand} pointerEvents="none">
            <Text style={styles.who}>{current.who}</Text>
            <Text style={styles.sceneLine}>{current.sceneLine}</Text>
            <Text style={styles.hint}>탭하여 계속 ▶</Text>
          </View>
        </Pressable>
      ) : (
        // ── 선택 모달 — 상황 + 선택지(사지선다 느낌) ──
        <View style={styles.choiceBackdrop}>
          <View style={styles.choiceCard}>
            <Text style={[styles.choiceTitle, { color: accent }]}>{current.title}</Text>
            <View style={styles.divider} />
            <ScrollView
              style={styles.promptScroll}
              contentContainerStyle={styles.promptContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.prompt}>{current.prompt}</Text>
            </ScrollView>
            <View style={styles.choices}>
              {current.choices.map((c) => {
                const disabled = !c.available;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => onChoose(c.key, disabled)}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.choice,
                      disabled && styles.choiceOff,
                      pressed && !disabled && styles.choicePressed,
                    ]}
                  >
                    <Text style={[styles.choiceLabel, disabled && styles.choiceLabelOff]}>
                      {c.label}
                      {disabled && c.note ? `  — ${c.note}` : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

const TEXT_SHADOW = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 6,
} as const;

const styles = StyleSheet.create({
  // ── 컷씬(3단) ──
  scene: { flex: 1, backgroundColor: colors.background },
  topBand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  eventTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    letterSpacing: typography.letterSpacing.wider,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  hanzi: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['4xl'],
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  artWrap: { width: '100%', aspectRatio: 3 / 2, alignItems: 'center', justifyContent: 'center' },
  artSlot: {
    width: '70%',
    height: '80%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
    paddingHorizontal: spacing.sm,
  },
  artSlotLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.paperBright,
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomBand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  who: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.paperBright,
    ...TEXT_SHADOW,
  },
  sceneLine: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.paperBright,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 360,
    ...TEXT_SHADOW,
  },
  hint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.paperBright,
    opacity: 0.7,
    letterSpacing: typography.letterSpacing.wide,
    ...TEXT_SHADOW,
  },

  // ── 선택 모달 ──
  choiceBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  choiceCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  choiceTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.inkSoft, opacity: 0.4, marginVertical: spacing.xs },
  promptScroll: { maxHeight: 220 },
  promptContent: { paddingBottom: spacing.xs },
  prompt: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.ink,
    lineHeight: typography.sizes.md * 1.7,
  },
  choices: { gap: spacing.sm, marginTop: spacing.xs },
  choice: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  choiceOff: { borderColor: colors.inkSoft, backgroundColor: colors.paperLight, opacity: 0.6 },
  choicePressed: { opacity: 0.85 },
  choiceLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  choiceLabelOff: { color: colors.inkSoft },
});
