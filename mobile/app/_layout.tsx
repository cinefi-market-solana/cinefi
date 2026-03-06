import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { Colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/query';


SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if it's already prevented
});

const RootLayout = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    JetBrainsMono_400Regular,
  });

  const { isLoading, isAuthenticated, silentRefresh } = useAuthStore();
  const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);

const RootLayout = () => {
  const { isLoading, isAuthenticated, silentRefresh } = useAuthStore();
  const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    const bootstrapAuth = async () => {
      if (hasTriggeredRefresh) return;
      setHasTriggeredRefresh(true);
      await silentRefresh();
      if (mounted) setAuthBootstrapped(true);
    };
    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, [hasTriggeredRefresh, silentRefresh]);

  useEffect(() => {
    const handleReady = async () => {
      if (!fontsLoaded || !authBootstrapped || isLoading) {
        return;
      }

      try {
        await SplashScreen.hideAsync();
      } catch {
        // ignore
      }

      if (isAuthenticated) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/onboarding');
      }
    };

    handleReady();
  }, [fontsLoaded, authBootstrapped, isLoading, isAuthenticated, router]);
};

  if (!fontsLoaded) {
    return (
      <View style={S.loading}>
        <StatusBar style="light" backgroundColor={Colors.bg} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Slot />
    </QueryClientProvider>
  );
};

const S = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});

export default RootLayout;

