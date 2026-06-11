import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCutsceneStore } from '@/stores/cutsceneStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CutsceneTone } from '@/data/cutscenes';
import { findCutsceneMedia } from '@/data/cutscenes/media';

// 컷씬 오버레이 — docs/20 그레이박스. 풀스크린 먹색 정지 화면:
// 큰 한자(페이드+미세 축소) + 일러스트 자리(dashed) + 서사 한 줄 + 제자 한마디 + 탭하여 계속.
// 큐(useCutsceneStore)가 비어 있지 않으면 무엇보다 위에 뜬다. 탭 = 다음(스킵 정책은 폴리시 단계 미정).

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
        <Text style={[styles.eventTitle, { color: accent }]}>{current.title}</Text>

        <Animated.Text
          style={[
            styles.hanzi,
            { color: accent, opacity: hanziOpacity, transform: [{ scale: hanziScale }] },
          ]}
        >
          {current.hanzi}
        </Animated.Text>

        <Animated.View style={[styles.body, { opacity: bodyOpacity }]}>
          {/* 모션 컷(움직이는 WebP, 1회 재생 후 마지막 장면 정지) — 없으면 그레이박스 점선. docs/20 */}
          {media ? (
            <Image source={media} style={styles.media} contentFit="cover" />
          ) : (
            <View style={[styles.artSlot, { borderColor: accent }]}>
              <Text style={styles.artSlotLabel}>
                (일러스트 자리 — {current.eventId}/{current.discipleId})
              </Text>
            </View>
          )}

          <Text style={styles.name}>{current.discipleName}</Text>
          <Text style={styles.line}>{current.line}</Text>
          {current.quote ? <Text style={[styles.quote, { color: accent }]}>「{current.quote}」</Text> : null}
        </Animated.View>

        <Animated.Text style={[styles.hint, { opacity: hintOpacity }]}>탭하여 계속 ▶</Animated.Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  eventTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.lg,
  },
  hanzi: {
    fontFamily: typography.serifCNBold,
    fontSize: typography.sizes['4xl'] * 1.6,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  body: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  media: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 3 / 2,
    borderRadius: radius.md,
  },
  artSlot: {
    width: 220,
    height: 140,
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
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.paperBright,
    marginTop: spacing.sm,
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.paperBright,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 340,
  },
  quote: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
    maxWidth: 340,
    marginTop: spacing.xs,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.wide,
  },
});
