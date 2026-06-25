import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

// 도입 튜토리얼 회차 진입 게이트 — 첫 계정(introRunPending)에 슬롯 첫 진입 시 한 번 권한다. docs/46.
// [시작] = 장철 1명으로 짧은 안내 회차 / [건너뛰기] = 곧바로 일반 시작 선택. 둘 다 계정 1회만(재강제 X).
// 그레이박스: 양피지 카드 + 두 선택(시작 강조). 비주얼 폴리시는 후속.
export function IntroRunGate({
  visible,
  onStart,
  onSkip,
}: {
  visible: boolean;
  onStart: () => void;
  onSkip: () => void;
}) {
  if (!visible) return <Modal visible={false} transparent />;
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>사문을 여시기 전에</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>
            처음이시군요. 제자 한 명을 짧게 길러 하산까지 보내는 안내를 함께 해보시겠습니까?{'\n'}
            사부의 하루가 어떻게 흐르는지, 제자가 어떻게 자라 강호로 나아가는지 금세 익히실 수 있습니다.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.start, pressed && styles.pressed]}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel="안내와 함께 시작"
          >
            <Text style={styles.startLabel}>안내와 함께 시작 ▶</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="건너뛰기"
          >
            <Text style={styles.skipLabel}>건너뛰고 바로 사문 열기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.xs,
  },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: typography.sizes.sm * 1.6,
    marginBottom: spacing.sm,
  },
  start: {
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  startLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
  },
  skip: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.85 },
});
