import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCutsceneStore } from '@/stores/cutsceneStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CutsceneTone } from '@/data/cutscenes';
import { findCutsceneMedia } from '@/data/cutscenes/media';

// 컷씬 오버레이 — docs/20. 쇼츠식 풀스크린(✅ 사용자 확정 2026-06-12):
// 세로(9:16) 모션 컷이 화면 전체를 덮고, 아래에만 옅은 어둠 위 자막(이름·서사·한마디·탭 안내).
// 그림 위(얼굴 영역) 텍스트는 전부 금지 — 한자·사건명 오버레이 제거(✅ 사용자 결정 2026-06-12, 얼굴 가림).
// 모션 미디어 없는 컷은 먹색 바탕 + 점선 자리(그레이박스) 폴백. 탭 = 다음.

const TONE_ACCENT: Record<CutsceneTone, string> = {
  gold: colors.gold,
  ink: colors.paperBright,
  blood: colors.seal,
};

export function CutsceneOverlay() {
  const current = useCutsceneStore((s) => s.queue[0]);
  const pop = useCutsceneStore((s) => s.pop);

  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;
    bodyOpacity.setValue(0);
    hintOpacity.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.sequence([
      // 모션 컷(3~5초)이 흐를 시간을 주고 글이 자막처럼 내려앉는다.
      Animated.delay(1800),
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

        {/* 아래 — 자막: 옅은 어둠 위에 이름·서사·한마디 + 탭 안내 (그림 위 텍스트 금지) */}
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
