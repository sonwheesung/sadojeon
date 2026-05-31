import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';

import { useConfirm, type ConfirmOptions } from '@/components/common/ConfirmDialog';

// 하드웨어 뒤로가기(Android) 가로채기 — 화면 포커스 동안 뒤로 누르면 확인창을 띄우고,
// 확정 시에만 onConfirmed 실행. iOS 엔 하드웨어 백이 없어 no-op.
export function useBackConfirm(options: ConfirmOptions, onConfirmed: () => void) {
  const confirm = useConfirm();
  const optsRef = useRef(options);
  optsRef.current = options;
  const actionRef = useRef(onConfirmed);
  actionRef.current = onConfirmed;

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        confirm(optsRef.current).then((ok) => {
          if (ok) actionRef.current();
        });
        return true; // 기본 뒤로가기 차단 — 확인창으로 대체
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [confirm]),
  );
}
