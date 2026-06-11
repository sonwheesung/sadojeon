import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCutsceneStore } from '@/stores/cutsceneStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CutsceneTone } from '@/data/cutscenes';
import { findCutsceneMedia } from '@/data/cutscenes/media';

// 컷씬 오버레이 — docs/20. 두 레이아웃(✅ 사용자 확정 2026-06-12):
// · cover(쇼츠, 세로 9:16): 모션 컷이 화면 전체를 덮고, 하단에만 옅은 어둠 위 자막. 그림 위 텍스트 금지(얼굴 가림).
// · letterbox(가로)·그레이박스: 위 띠 / 그림 / 아래 띠 3단 — 위 띠 정중앙에 사건명·큰 한자,
//   아래 띠 안에 자막(그림을 덮지 않게 띠 안에서만). 탭 = 다음.

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

  const media = current
    ? findCutsceneMedia(current.eventId, current.discipleId, current.mediaVariant ?? 'default')
    : undefined;
  const isCover = media?.fit === 'cover';

  useEffect(() => {
    if (!current) return;
    hanziOpacity.setValue(0);
    hanziScale.setValue(1.18);
    bodyOpacity.setValue(0);
    hintOpacity.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.sequence([
      isCover
        ? Animated.delay(0)
        : Animated.parallel([
            Animated.timing(hanziOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(hanziScale, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
      // 모션 컷(3~5초)이 흐를 시간을 주고 글이 자막처럼 내려앉는다.
      Animated.delay(isCover ? 1800 : 1400),
      Animated.timing(bodyOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(hintOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) {
    return <Modal visible={false} transparent />;
  }

  const accent = TONE_ACCENT[current.tone];

  const subtitle = (
    <>
      <Animated.View style={[styles.textBlock, { opacity: bodyOpacity }]}>
        <Text style={styles.name}>{current.discipleName}</Text>
        <Text style={styles.line}>{current.line}</Text>
        {current.quote ? (
          <Text style={[styles.quote, { color: accent }]}>「{current.quote}」</Text>
        ) : null}
      </Animated.View>
      <Animated.Text style={[styles.hint, { opacity: hintOpacity }]}>탭하여 계속 ▶</Animated.Text>
    </>
  );

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={pop}>
      <Pressable style={styles.screen} onPress={pop} accessibilityRole="button" accessibilityLabel="컷씬 계속">
        {isCover && media ? (
          <>
            {/* 쇼츠 — 풀스크린 cover + 하단 자막(옅은 어둠) */}
            <Image source={media.source} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.coverBottom} pointerEvents="none">
              {subtitle}
            </View>
          </>
        ) : (
          <>
            {/* 가로·그레이박스 — 위 띠(한자) / 그림 / 아래 띠(자막) 3단 */}
            <View style={styles.topBand} pointerEvents="none">
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

            {media ? (
              <Image source={media.source} style={styles.letterboxMedia} contentFit="cover" />
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

            <View style={styles.bottomBand} pointerEvents="none">
              {subtitle}
            </View>
          </>
        )}
      </Pressable>
    </Modal>
  );
}

// 영상 위 글자 가독성 — 자막은 전부 그림자.
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

  // ── 쇼츠(cover) 레이아웃 ──
  coverBottom: {
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

  // ── 가로·그레이박스(3단) 레이아웃 ──
  topBand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  letterboxMedia: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  fallbackWrap: {
    width: '100%',
    aspectRatio: 3 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.lg,
  },

  eventTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    letterSpacing: typography.letterSpacing.wider,
    opacity: 0.9,
  },
  hanzi: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['4xl'],
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
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

  // ── 자막 공통 ──
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
