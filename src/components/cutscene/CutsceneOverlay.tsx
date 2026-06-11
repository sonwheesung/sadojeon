import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCutsceneStore } from '@/stores/cutsceneStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CutsceneTone } from '@/data/cutscenes';
import { findCutsceneMedia } from '@/data/cutscenes/media';

// 컷씬 오버레이 — docs/20. 영화식 레터박스 구성:
// 먹색 풀스크린 가운데 모션 컷(움직이는 WebP, 가로 꽉 참)이 깔리고,
// 위 띠에 사건명·큰 한자(페이드+축소), 아래 띠에 이름·서사·한마디·탭 안내.
// 모션 미디어 없는 컷은 점선 자리(그레이박스) 폴백. 탭 = 다음.

const TONE_ACCENT: Record<CutsceneTone, string> = {
  gold: colors.gold,
  ink: colors.paperBright,
  blood: colors.seal,
};

export function CutsceneOverlay() {
  const current = useCutsceneStore((s) => s.queue[0]);
  const pop = useCutsceneStore((s) => s.pop);

  const hanziOpacity = useRef(new Animated.Value(0)).current;
  const hanziScale = useRef(new Animated.Value(1.18)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;
    hanziOpacity.setValue(0);
    hanziScale.setValue(1.18);
    bodyOpacity.setValue(0);
    hintOpacity.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.sequence([
      Animated.parallel([
        Animated.timing(hanziOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(hanziScale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      // 모션 컷(3~5초)이 흐를 시간을 주고 글이 내려앉는다.
      Animated.delay(1400),
      Animated.timing(bodyOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) {
    return <Modal visible={false} transparent />;
  }

  const accent = TONE_ACCENT[current.tone];
  const media = findCutsceneMedia(current.eventId, current.discipleId);

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={pop}>
      <Pressable style={styles.screen} onPress={pop} accessibilityRole="button" accessibilityLabel="컷씬 계속">
        {/* 위 띠 — 사건명 + 큰 한자 */}
        <View style={styles.topBand}>
          <Text style={[styles.eventTitle, { color: accent }]}>{current.title}</Text>
          <Animated.Text
            style={[
              styles.hanzi,
              { color: accent, opacity: hanziOpacity, transform: [{ scale: hanziScale }] },
            ]}
          >
            {current.hanzi}
          </Animated.Text>
        </View>

        {/* 가운데 — 모션 컷 (가로 꽉 참, 위아래 먹색 레터박스) */}
        {media ? (
          <Image source={media} style={styles.media} contentFit="cover" />
        ) : (
          <View style={styles.mediaFallbackWrap}>
            {/* 그레이박스 — 모션 미디어 미등록 컷. docs/20 */}
            <View style={[styles.artSlot, { borderColor: accent }]}>
              <Text style={styles.artSlotLabel}>
                (모션 컷 자리 — {current.eventId}/{current.discipleId})
              </Text>
            </View>
          </View>
        )}

        {/* 아래 띠 — 이름·서사·한마디 + 탭 안내 */}
        <View style={styles.bottomBand}>
          <Animated.View style={[styles.textBlock, { opacity: bodyOpacity }]}>
            <Text style={styles.name}>{current.discipleName}</Text>
            <Text style={styles.line}>{current.line}</Text>
            {current.quote ? (
              <Text style={[styles.quote, { color: accent }]}>「{current.quote}」</Text>
            ) : null}
          </Animated.View>
          <Animated.Text style={[styles.hint, { opacity: hintOpacity }]}>탭하여 계속 ▶</Animated.Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
    gap: spacing.base,
  },
  eventTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    letterSpacing: typography.letterSpacing.wider,
    opacity: 0.85,
  },
  hanzi: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['4xl'] * 1.4,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  media: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  mediaFallbackWrap: {
    width: '100%',
    aspectRatio: 3 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artSlot: {
    width: '70%',
    height: '70%',
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
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.paperBright,
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.paperBright,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 360,
  },
  quote: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 360,
  },
  hint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.wide,
  },
});
