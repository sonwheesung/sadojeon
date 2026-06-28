import { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSpotlightStore } from '@/stores/spotlightStore';
import { measureSpotlightTarget, type Rect } from '@/systems/spotlightTargets';
import { advanceSpotlight, endSpotlight } from '@/systems/spotlightSystem';
import { colors, radius, spacing, typography } from '@/theme';

// 스포트라이트 오버레이 — 화면을 어둡게 덮되 대상 버튼만 뚫어 비추고, 옆에 설명 말풍선 + [다음]. docs/44.
// 강제(directive): 뚫린 영역이나 [다음]을 눌러야 진행. RN엔 CSS clip이 없어 4분할 딤으로 구멍을 낸다.

const HOLE_PAD = 8; // 대상 둘레 여백(구멍을 조금 넉넉히)

export function SpotlightOverlay() {
  const active = useSpotlightStore((s) => s.active);
  const steps = useSpotlightStore((s) => s.steps);
  const index = useSpotlightStore((s) => s.index);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = active ? steps[index] : undefined;

  // 단계가 바뀔 때마다 대상 좌표 측정(없으면 중앙 폴백). 레이아웃이 잡힐 시간을 약간 준다.
  useEffect(() => {
    if (!active || !step) return;
    let alive = true;
    setRect(null);
    if (!step.targetId) return;
    const t = setTimeout(() => {
      void measureSpotlightTarget(step.targetId as string).then((r) => {
        if (alive) setRect(r);
      });
    }, 60);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [active, step, index]);

  if (!active || !step) return null;

  const isLast = index >= steps.length - 1;
  const onNext = () => {
    if (isLast) endSpotlight();
    else advanceSpotlight();
  };

  const { width: SW, height: SH } = Dimensions.get('window');
  const hole = rect
    ? {
        x: Math.max(0, rect.x - HOLE_PAD),
        y: Math.max(0, rect.y - HOLE_PAD),
        w: rect.width + HOLE_PAD * 2,
        h: rect.height + HOLE_PAD * 2,
      }
    : null;

  // 말풍선 세로 위치 — 구멍 아래 공간이 넉넉하면 아래, 아니면 위. 구멍 없으면 중앙.
  const tipBelow = hole ? hole.y + hole.h < SH * 0.62 : true;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onNext}>
      {hole ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* 4분할 딤 — 구멍 사방 */}
          <View style={[styles.dim, { left: 0, top: 0, width: SW, height: hole.y }]} />
          <View style={[styles.dim, { left: 0, top: hole.y + hole.h, width: SW, height: SH - (hole.y + hole.h) }]} />
          <View style={[styles.dim, { left: 0, top: hole.y, width: hole.x, height: hole.h }]} />
          <View style={[styles.dim, { left: hole.x + hole.w, top: hole.y, width: SW - (hole.x + hole.w), height: hole.h }]} />
          {/* 강조 테두리 + 뚫린 영역 탭 → 진행 */}
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel={`${step.title} — 다음`}
            style={[styles.hole, { left: hole.x, top: hole.y, width: hole.w, height: hole.h }]}
          />
        </View>
      ) : (
        <Pressable style={[StyleSheet.absoluteFill, styles.dimFull]} onPress={onNext} accessibilityLabel={`${step.title} — 다음`} />
      )}

      {/* 설명 말풍선 */}
      <View
        pointerEvents="box-none"
        style={[
          styles.tipWrap,
          hole
            ? tipBelow
              ? { top: hole.y + hole.h + spacing.sm }
              : { bottom: SH - hole.y + spacing.sm }
            : { top: 0, bottom: 0, justifyContent: 'center' },
        ]}
      >
        <View style={styles.tip}>
          <View style={styles.tipHead}>
            <View style={styles.seal}>
              <Text style={styles.sealLabel}>{step.seal}</Text>
            </View>
            <Text style={styles.title}>{step.title}</Text>
          </View>
          <Text style={styles.body}>{step.body}</Text>
          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <Pressable onPress={onNext} style={({ pressed }) => [styles.next, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.nextLabel}>{isLast ? '시작하기 ▶' : '다음 ▶'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.72)' },
  dimFull: { backgroundColor: 'rgba(0,0,0,0.72)' },
  hole: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.seal,
    borderRadius: radius.sm,
  },
  tipWrap: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    alignItems: 'center',
  },
  tip: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.xs,
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  seal: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.seal,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealLabel: { fontFamily: typography.serifCN, fontSize: typography.sizes.lg, color: colors.seal },
  title: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wide,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    lineHeight: typography.sizes.sm * 1.7,
  },
  dots: { flexDirection: 'row', gap: 5, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.inkSoft, opacity: 0.4 },
  dotOn: { backgroundColor: colors.seal, opacity: 1 },
  next: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 2,
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  nextLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wide,
  },
  pressed: { opacity: 0.85 },
});
