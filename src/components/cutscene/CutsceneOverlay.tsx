import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCutsceneStore } from '@/stores/cutsceneStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CutsceneTone } from '@/data/cutscenes';
import { findCutsceneMedia } from '@/data/cutscenes/media';

// 컷씬 오버레이 — docs/20. 쇼츠식 풀스크린(✅ 사용자 확정 2026-06-12):
// 세로(9:16) 모션 컷이 화면 전체를 덮고, 그 위에 자막처럼 — 위에 사건명·큰 한자(페이드+축소),
// 아래에 옅은 어둠을 깔고 이름·서사·한마디·탭 안내. 컷 자산은 세로 규격으로 제작(족자 구도).
// 모션 미디어 없는 컷은 먹색 바탕 + 점선 자리(그레이박스) 폴백. 탭 = 다음.

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
      // 모션 컷(3~5초)이 흐를 시간을 주고 글이 자막처럼 내려앉는다.
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
        {/* 배경 — 세로(cover) 자산은 화면 전체를 덮고, 가로 레거시(letterbox)는 가운데 꽉 차게 */}
        {media ? (
          media.fit === 'cover' ? (
            <Image source={media.source} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.letterboxWrap} pointerEvents="none">
              <Image source={media.source} style={styles.letterboxMedia} contentFit="cover" />
            </View>
          )
        ) : (
          <View style={styles.fallbackWrap}>
            {/* 그레이박스 — 모션 미디어 미등록 컷. docs/20 */}
            <View style={[styles.artSlot, { borderColor: accent }]}>
              <Text style={styles.artSlotLabel}>
                (모션 컷 자리 — {current.eventId}/{current.discipleId})
              </Text>
            </View>
          </View>
        )}

        {/* 위 — 사건명 + 큰 한자 (영상 위 오버레이) */}
        <View style={styles.topArea} pointerEvents="none">
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

        {/* 아래 — 자막: 옅은 어둠 위에 이름·서사·한마디 + 탭 안내 */}
        <View style={styles.bottomArea} pointerEvents="none">
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

// 자막 가독성 — 영상 위 글자는 전부 그림자.
const TEXT_SHADOW = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 6,
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fallbackWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterboxWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  letterboxMedia: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  artSlot: {
    width: '72%',
    aspectRatio: 9 / 16,
    maxHeight: '60%',
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
  topArea: {
    position: 'absolute',
    top: spacing['4xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    letterSpacing: typography.letterSpacing.wider,
    opacity: 0.9,
    ...TEXT_SHADOW,
  },
  hanzi: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['4xl'] * 1.4,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
    ...TEXT_SHADOW,
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: spacing.base,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(26, 22, 18, 0.45)',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.paperBright,
    ...TEXT_SHADOW,
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.paperBright,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 360,
    ...TEXT_SHADOW,
  },
  quote: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
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
});
