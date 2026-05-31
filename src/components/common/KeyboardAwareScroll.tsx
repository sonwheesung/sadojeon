import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

interface Props {
  children: ReactNode;
  // 키보드 닫혀 있을 땐 세로 가운데 정렬, 키보드가 뜨면 상단 정렬 + 아래 여백으로 입력칸이 안 가린다.
  center?: boolean;
  contentStyle?: ViewStyle;
}

// 입력 폼 공통 래퍼 — 키보드가 입력칸을 가리지 않게 한다.
// 핵심: 키보드가 뜨면 (1) 가운데 정렬 해제(상단으로) (2) 키보드 높이만큼 paddingBottom 추가
//       → 비밀번호 등 하단 입력이 키보드 위로 올라온다. Android edge-to-edge 에서도 동작.
export function KeyboardAwareScroll({ children, center, contentStyle }: Props) {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) =>
      setKbHeight(e.endCoordinates?.height ?? 0),
    );
    const hide = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const open = kbHeight > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          center && !open && styles.center,
          contentStyle,
          open ? { paddingBottom: kbHeight + 24 } : null,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  center: { justifyContent: 'center' },
});
