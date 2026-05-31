import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { KeyboardAwareScroll } from '@/components/common/KeyboardAwareScroll';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useAuthStore } from '@/stores/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors, radius, spacing, typography } from '@/theme';

type Mode = 'signIn' | 'signUp';

// 아이디/비밀번호 로그인·가입 화면. 그레이박스 페이퍼 톤.
// 미인증 시 RootLayout 이 /login 으로 redirect → 이 화면 표시.
export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [idStatus, setIdStatus] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'error'>(
    'idle',
  );

  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const checkUsername = useAuthStore((s) => s.checkUsername);
  const clearError = useAuthStore((s) => s.clearError);

  const isSignUp = mode === 'signUp';
  const pwMismatch = isSignUp && pw2.length > 0 && pw !== pw2;
  const canSubmit =
    id.trim().length >= 2 &&
    pw.length >= 6 &&
    !busy &&
    (!isSignUp || (pw === pw2 && pw2.length >= 6));

  const clearMsgs = () => {
    if (error) clearError();
    if (notice) setNotice(null);
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    if (!isSignUp) {
      signIn(id, pw);
      return;
    }
    // 가입 성공 시 자동 로그인 안 됨 → 로그인 모드로 전환 + 안내.
    const ok = await signUp(id, pw);
    if (ok) {
      setMode('signIn');
      setPw('');
      setPw2('');
      setNotice('가입이 완료됐습니다. 로그인해 주세요.');
    }
  };

  const onCheckId = async () => {
    if (id.trim().length < 2 || idStatus === 'checking') return;
    clearMsgs();
    setIdStatus('checking');
    const available = await checkUsername(id);
    setIdStatus(available === null ? 'error' : available ? 'ok' : 'taken');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setPw2('');
    setNotice(null);
    setIdStatus('idle');
    clearError();
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <KeyboardAwareScroll center contentStyle={styles.container}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>사도전</Text>
            <Text style={styles.titleCn}>師道傳</Text>
          </View>

          <View style={styles.tabs}>
            <ModeTab label="로그인" active={mode === 'signIn'} onPress={() => switchMode('signIn')} />
            <ModeTab label="가입" active={mode === 'signUp'} onPress={() => switchMode('signUp')} />
          </View>

          <View style={styles.form}>
            <Field
              label="아이디"
              value={id}
              onChangeText={(t) => {
                setId(t);
                setIdStatus('idle');
                clearMsgs();
              }}
              placeholder="아이디"
              autoCapitalize="none"
              rightButton={
                isSignUp
                  ? {
                      label: idStatus === 'checking' ? '확인 중' : '중복확인',
                      onPress: onCheckId,
                      disabled: id.trim().length < 2 || idStatus === 'checking',
                    }
                  : undefined
              }
            />
            {idStatus === 'ok' ? (
              <Text style={styles.notice}>사용 가능한 아이디입니다.</Text>
            ) : null}
            {idStatus === 'taken' ? (
              <Text style={styles.error}>이미 사용 중인 아이디입니다.</Text>
            ) : null}
            {idStatus === 'error' ? (
              <Text style={styles.error}>확인 중 오류가 발생했습니다.</Text>
            ) : null}
            <Field
              label="비밀번호"
              value={pw}
              onChangeText={(t) => {
                setPw(t);
                clearMsgs();
              }}
              placeholder="6자 이상"
              secureTextEntry
              autoCapitalize="none"
            />
            {isSignUp ? (
              <Field
                label="비밀번호 재확인"
                value={pw2}
                onChangeText={(t) => {
                  setPw2(t);
                  clearMsgs();
                }}
                placeholder="비밀번호 다시 입력"
                secureTextEntry
                autoCapitalize="none"
              />
            ) : null}

            {pwMismatch ? (
              <Text style={styles.error}>비밀번호가 일치하지 않습니다.</Text>
            ) : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!isSupabaseConfigured ? (
              <Text style={styles.warn}>Supabase 미설정 — .env 값 입력 후 앱 재시작 필요.</Text>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel={mode === 'signIn' ? '로그인' : '가입'}
              style={({ pressed }) => [
                styles.submit,
                !canSubmit && styles.submitDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.submitLabel, !canSubmit && styles.submitLabelDisabled]}>
                {busy ? '처리 중…' : mode === 'signIn' ? '로그인 ▶' : '가입하기 ▶'}
              </Text>
            </Pressable>

            <Text style={styles.hint}>한 번 로그인하면 다음부터 자동으로 들어옵니다.</Text>
          </View>
      </KeyboardAwareScroll>
    </SafetyZone>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  rightButton,
  ...inputProps
}: {
  label: string;
  rightButton?: { label: string; onPress: () => void; disabled?: boolean };
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputInner}
          placeholderTextColor={colors.inkSoft}
          {...inputProps}
        />
        {rightButton ? (
          <Pressable
            onPress={rightButton.onPress}
            disabled={rightButton.disabled}
            accessibilityRole="button"
            accessibilityLabel={rightButton.label}
            style={({ pressed }) => [
              styles.inlineBtn,
              rightButton.disabled && styles.inlineBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.inlineBtnLabel,
                rightButton.disabled && styles.inlineBtnLabelDisabled,
              ]}
            >
              {rightButton.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  titleWrap: { alignItems: 'center', gap: 4 },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wider,
  },
  titleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.md,
    color: colors.inkSoft,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.ink,
  },
  tabLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    color: colors.paperBright,
  },
  form: {
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.base,
  },
  field: { gap: 4 },
  fieldLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
    paddingRight: 4,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  inlineBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  inlineBtnDisabled: {
    borderColor: colors.inkSoft,
    backgroundColor: 'transparent',
  },
  inlineBtnLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  inlineBtnLabelDisabled: {
    color: colors.inkSoft,
  },
  error: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  notice: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.brown,
  },
  warn: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  submit: {
    height: 48,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  submitDisabled: {
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
  },
  submitLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wide,
  },
  submitLabelDisabled: {
    color: colors.inkSoft,
  },
  hint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
