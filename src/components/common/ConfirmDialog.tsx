import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

// 저장·수정·삭제 등 영구 변경 행동 앞에 띄우는 확인창.
// 페이지마다 박지 않고 컨텍스트 + useConfirm() 훅으로 단일 호출.
//   const confirm = useConfirm();
//   if (await confirm({ title: '저장할까요?', tone: 'danger' })) doIt();

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string; // 기본 '확정'
  cancelLabel?: string; // 기본 '취소'
  tone?: ConfirmTone; // danger = 삭제·되돌리기 등 파괴적
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingState extends ConfirmOptions {
  visible: boolean;
}

const EMPTY: PendingState = { visible: false, title: '' };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PendingState>(EMPTY);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...opts, visible: true });
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState((s) => ({ ...s, visible: false }));
    resolve?.(result);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  const danger = state.tone === 'danger';

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={() => settle(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>{state.title}</Text>
            {state.message ? <Text style={styles.message}>{state.message}</Text> : null}
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
                onPress={() => settle(false)}
                accessibilityRole="button"
                accessibilityLabel={state.cancelLabel ?? '취소'}
              >
                <Text style={styles.cancelLabel}>{state.cancelLabel ?? '취소'}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirm,
                  danger && styles.confirmDanger,
                  pressed && styles.pressed,
                ]}
                onPress={() => settle(true)}
                accessibilityRole="button"
                accessibilityLabel={state.confirmLabel ?? '확정'}
              >
                <Text style={[styles.confirmLabel, danger && styles.confirmLabelDanger]}>
                  {state.confirmLabel ?? '확정'} ▶
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// 확인창을 띄우는 훅. ConfirmProvider 하위에서만 동작.
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  message: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    lineHeight: typography.sizes.sm * 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  cancel: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  confirm: {
    flex: 2,
    height: 44,
    borderWidth: 2,
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDanger: {
    borderColor: colors.sealDark,
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  confirmLabelDanger: {
    color: colors.sealDark,
  },
  pressed: {
    opacity: 0.85,
  },
});
