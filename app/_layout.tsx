import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  NotoSerifKR_300Light,
  NotoSerifKR_400Regular,
  NotoSerifKR_500Medium,
  NotoSerifKR_700Bold,
} from '@expo-google-fonts/noto-serif-kr';
import {
  NotoSerifSC_400Regular,
  NotoSerifSC_700Bold,
} from '@expo-google-fonts/noto-serif-sc';

import { ConfirmProvider } from '@/components/common/ConfirmDialog';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// 인증되면 사문 선택(slot-select)이 루트 앵커 — 로그인 직후 여기로 착지.
export const unstable_settings = {
  anchor: 'slot-select',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSerifKR-Light': NotoSerifKR_300Light,
    'NotoSerifKR-Regular': NotoSerifKR_400Regular,
    'NotoSerifKR-Medium': NotoSerifKR_500Medium,
    'NotoSerifKR-Bold': NotoSerifKR_700Bold,
    'NotoSerifSC-Regular': NotoSerifSC_400Regular,
    'NotoSerifSC-Bold': NotoSerifSC_700Bold,
  });

  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;
  if (status === 'loading') return null; // 세션 복원 중 — 스플래시 유지

  // 게이팅은 선언적 Stack.Protected 로만 — 명령형 router 이동·네비훅 없음(리렌더 루프 방지).
  const authed = status === 'authed';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ConfirmProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.paper },
              animation: 'fade',
            }}
          >
            <Stack.Protected guard={authed}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="slot-select" />
              <Stack.Screen name="run-end" />
              <Stack.Screen name="schedule/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="disciple/[id]" />
              <Stack.Screen name="master/index" />
              <Stack.Screen name="inbox/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="equipment/[slot]" />
              <Stack.Screen name="inventory/[category]" />
              <Stack.Screen name="codex/[category]" />
              <Stack.Screen name="inbox/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="activity/[target]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="martial-art/[target]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="martial-codex/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="npc/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="npc/[id]" options={{ presentation: 'modal' }} />
            </Stack.Protected>
            <Stack.Protected guard={!authed}>
              <Stack.Screen name="login" />
            </Stack.Protected>
          </Stack>
        </ConfirmProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
