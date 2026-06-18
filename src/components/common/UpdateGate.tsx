// 강제 업데이트 게이트 — 앱 진입 시 버전 확인, 최소 버전 미달이면 **앱 전체를 차단 화면으로 덮는다**.
// 로그인 전(루트)에서 감싸므로 인증과 무관하게 막힌다. 확인 중엔 종이색 화면(스플래시 직후 깜빡임 방지).
// 조회 실패는 통과(fail-open) — versionGate.checkForUpdate.

import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { checkForUpdate } from '@/systems/versionGate';
import { colors, radius, spacing, typography } from '@/theme';

type Phase = 'checking' | 'ok' | 'required';

export function UpdateGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    checkForUpdate().then((r) => {
      if (!mounted) return;
      setStoreUrl(r.storeUrl);
      setPhase(r.required ? 'required' : 'ok');
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (phase === 'checking') return <View style={styles.blank} />;
  if (phase === 'required') return <UpdateRequiredScreen storeUrl={storeUrl} />;
  return <>{children}</>;
}

function UpdateRequiredScreen({ storeUrl }: { storeUrl: string | null }) {
  const onUpdate = () => {
    if (storeUrl) Linking.openURL(storeUrl).catch(() => {});
  };
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>업데이트 안내</Text>
        <Text style={styles.body}>
          원활한 이용을 위해 최신 버전으로의 업데이트가 필요합니다.{'\n'}
          업데이트 후 다시 접속해 주세요.
        </Text>
        <Pressable
          style={[styles.btn, !storeUrl && styles.btnOff]}
          disabled={!storeUrl}
          onPress={onUpdate}
          accessibilityRole="button"
          accessibilityLabel="스토어에서 업데이트"
        >
          <Text style={styles.btnText}>업데이트 하러 가기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: colors.paper },
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brown,
    borderRadius: radius.md,
    backgroundColor: colors.paperLight,
    padding: spacing.xl,
    gap: spacing.base,
    alignItems: 'center',
  },
  title: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  body: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brown,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
  },
  btnOff: { opacity: 0.4 },
  btnText: { fontFamily: typography.serifMedium, fontSize: typography.sizes.base, color: colors.brown },
});
