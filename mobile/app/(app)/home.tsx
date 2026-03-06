import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CineFiIcon from '@/components/auth/CineFiIcon';
import { AuthButton } from '@/components/auth/AuthButton';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useAuthStore } from '@/stores/authStore';

const HomeScreen = () => {
  const { clearSession } = useAuthStore();

  return (
    <SafeAreaView style={S.safeArea}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <View style={S.container}>
        <CineFiIcon size={56} />
        <Text style={S.welcomeText}>Welcome to CineFi</Text>
        <View style={S.buttonWrapper}>
          <AuthButton
            title="Sign Out"
            variant="ghost"
            onPress={async () => {
              await clearSession();
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  welcomeText: {
    marginTop: Spacing.lg,
    fontFamily: FontFamily.body,
    fontSize: 16,
    color: Colors.secondary,
  },
  buttonWrapper: {
    marginTop: Spacing.lg,
    width: '60%',
  },
});

export default HomeScreen;

