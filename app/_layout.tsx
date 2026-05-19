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

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.paper },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="slot-select" />
          <Stack.Screen name="run-end" />
          <Stack.Screen name="schedule" options={{ presentation: 'modal' }} />
          <Stack.Screen name="village" options={{ presentation: 'modal' }} />
          <Stack.Screen name="dialogue" options={{ presentation: 'modal' }} />
          <Stack.Screen name="disciple/[id]" />
          <Stack.Screen name="equipment/[slot]" />
          <Stack.Screen name="inventory/[category]" />
          <Stack.Screen name="codex/[category]" />
          <Stack.Screen name="inbox/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="activity/[target]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="martial-art/[target]" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
