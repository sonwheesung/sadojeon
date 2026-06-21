import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ONBOARDING_STEPS } from '@/data/onboarding';
import { colors, radius, spacing, typography } from '@/theme';

// 첫 안내(온보딩) 오버레이 — 계정 1회, 첫 사문 개창 직전에 핵심 루프를 일러준다. docs/44.
// 양피지 카드 + 인장 결(StartSelectModal 과 같은 모달 톤). 단계는 ONBOARDING_STEPS(데이터 주도).
// 그레이박스 단계 — 비주얼 폴리시(일러스트·연출)는 후속. 지금은 글·인장·진행점으로만.
interface Props {
  visible: boolean;
  /** 마지막 단계 [시작] 또는 [건너뛰기] — 안내 종료(계정에 본 것으로 기록). */
  onDone: () => void;
}

export function OnboardingOverlay({ visible, onDone }: Props) {
  const [index, setIndex] = useState(0);

  // 열릴 때마다 첫 단계부터(재진입 안전).
  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  const step = ONBOARDING_STEPS[index];
  const total = ONBOARDING_STEPS.length;
  const isLast = index >= total - 1;

  const next = () => {
    if (isLast) onDone();
    else setIndex((i) => Math.min(i + 1, total - 1));
  };

  if (!step) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.seal}>
            <Text style={styles.sealLabel}>{step.seal}</Text>
          </View>

          <Text style={styles.title}>{step.title}</Text>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.body}>{step.body}</Text>
          </ScrollView>

          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((s, i) => (
              <View key={s.id} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel="안내 건너뛰기"
            >
              <Text style={styles.skipLabel}>건너뛰기</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.next, pressed && styles.pressed]}
              onPress={next}
              accessibilityRole="button"
              accessibilityLabel={isLast ? '안내 마치고 시작' : '다음 안내'}
            >
              <Text style={styles.nextLabel}>{isLast ? '시작 ▶' : '다음 ▶'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  seal: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealLabel: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.xl,
    color: colors.seal,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bodyScroll: {
    alignSelf: 'stretch',
    maxHeight: 180,
  },
  bodyContent: {
    paddingVertical: spacing.xs,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.inkLight,
    lineHeight: typography.sizes.md * 1.7,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
  },
  dotOn: {
    backgroundColor: colors.seal,
    opacity: 1,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pressed: { opacity: 0.85 },
  skip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  skipLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  next: {
    flex: 1,
    maxWidth: 200,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  nextLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
  },
});
