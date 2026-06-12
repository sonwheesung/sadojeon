import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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

// 쇼츠(9:16) 컷을 꽉 채워도 되는 화면 상한 — 16:9(0.5625)까지는 cover,
// 그보다 넓은 화면(태블릿 등)은 잘라내지 않고 전체 보기(contain)로 자동 전환.
// ✅ 사용자 확인 2026-06-12: 태블릿에선 쇼츠·가로판 둘 다 잘림 → 자르지 않는 게 정답.
const COVER_MAX_ASPECT = 0.58;

export function CutsceneOverlay() {
  const current = useCutsceneStore((s) => s.queue[0]);
  const pop = useCutsceneStore((s) => s.pop);
  const { width: winW, height: winH } = useWindowDimensions();

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

  // [DEV] 기기 비율 시뮬레이터 — 그 기기의 실제 논리 크기(dp)로 그린 뒤 화면에 맞게
  // 통째로 축소(transform scale). 글자·띠·그림 비율이 실물 기기와 동일하게 보인다. docs/20.
  const frame =
    current.frameWidth && current.frameHeight
      ? { width: current.frameWidth, height: current.frameHeight }
      : undefined;
  const frameScale = frame ? Math.min(winW / frame.width, winH / frame.height) : 1;

  // 넓은 화면(태블릿)에선 쇼츠 컷을 자르지 않고 전체 보기 — 남는 공간은 먹색 띠.
  const viewportAspect = frame ? frame.width / frame.height : winW / winH;
  const coverFit = viewportAspect > COVER_MAX_ASPECT ? 'contain' : 'cover';

  const content = isCover && media ? (
    <>
      {/* 쇼츠 — 풀스크린 cover + 하단 자막(옅은 어둠). 넓은 화면은 contain(잘림 0) */}
      <Image source={media.source} style={StyleSheet.absoluteFill} contentFit={coverFit} />
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
        // contain — 가로판 그림이 띠(3:2)와 비율이 달라도 잘리지 않게(잘림 0 원칙)
        <Image source={media.source} style={styles.letterboxMedia} contentFit="contain" />
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
  );

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={pop}>
      <Pressable style={styles.screen} onPress={pop} accessibilityRole="button" accessibilityLabel="컷씬 계속">
        {frame ? (
          <View style={styles.frameCenter} pointerEvents="none">
            <View style={[styles.frameBox, frame, { transform: [{ scale: frameScale }] }]}>
              {content}
            </View>
            {current.frameLabel ? <Text style={styles.frameTag}>{current.frameLabel}</Text> : null}
          </View>
        ) : (
          content
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

  // ── [DEV] 기기 비율 시뮬레이터 ──
  frameCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBox: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  frameTag: {
    position: 'absolute',
    top: spacing.lg,
    alignSelf: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.paperBright,
    opacity: 0.6,
    letterSpacing: typography.letterSpacing.wide,
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
