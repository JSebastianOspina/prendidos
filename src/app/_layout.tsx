import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { DeviceStateProvider, useDeviceState } from '@/features/device/device-state-provider';
import { GameProvider, NewGameDraftProvider } from '@/features/game';

SplashScreen.preventAutoHideAsync();

/** Every screen but the 18+ gate stays protected until the age is confirmed. */
function RootNavigator() {
  const { ageConfirmedAt } = useDeviceState();
  const isAgeConfirmed = ageConfirmedAt !== undefined;

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
    >
      <Stack.Protected guard={!isAgeConfirmed}>
        <Stack.Screen name="age-gate" />
      </Stack.Protected>
      <Stack.Protected guard={isAgeConfirmed}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new-game/mode" />
        <Stack.Screen name="new-game/category" />
        <Stack.Screen name="new-game/setup" />
        <Stack.Screen name="play" options={{ gestureEnabled: false }} />
        <Stack.Screen name="results" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <DeviceStateProvider>
        <GameProvider>
          <NewGameDraftProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </NewGameDraftProvider>
        </GameProvider>
      </DeviceStateProvider>
    </SafeAreaProvider>
  );
}
