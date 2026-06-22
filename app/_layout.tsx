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
import { TutorialHost } from '@/components/tutorial/TutorialHost';
import { UpdateGate } from '@/components/common/UpdateGate';
import { useAuthStore } from '@/stores/authStore';
import { loadAccount } from '@/systems/accountSync';
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
  const userId = useAuthStore((s) => s.session?.user?.id);

  useEffect(() => {
    init();
  }, [init]);

  // 로그인·세션 복원·유저 전환 시 계정(업적·해금 무공서·집계·다이아)을 DB에서 로드. docs/31.
  useEffect(() => {
    if (status === 'authed') {
      loadAccount().catch((e) => console.warn('[account] 로드 실패', e));
    }
  }, [status, userId]);

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
        <UpdateGate>
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
              <Stack.Screen name="martial-art/[target]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="martial-codex/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="npc/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="npc/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="dev/autoplay" options={{ presentation: 'modal' }} />
              <Stack.Screen name="simlab/index" />
              <Stack.Screen name="simlab/combat" options={{ presentation: 'modal' }} />
              <Stack.Screen name="simlab/relations" options={{ presentation: 'modal' }} />
              <Stack.Screen name="simlab/career" options={{ presentation: 'modal' }} />
              <Stack.Screen name="alchemy/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="activity/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="achievements/index" options={{ presentation: 'modal' }} />
            </Stack.Protected>
            <Stack.Protected guard={!authed}>
              <Stack.Screen name="login" />
            </Stack.Protected>
          </Stack>
          {/* 맥락형 튜토리얼 오버레이 — 루트 1회 마운트(확인창과 같은 결). 활성 주제 있을 때만 표시. docs/44 */}
          <TutorialHost />
        </ConfirmProvider>
        </UpdateGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
