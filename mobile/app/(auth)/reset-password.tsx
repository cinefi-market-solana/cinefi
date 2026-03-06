import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck, Lock } from 'lucide-react-native';
import { BackButton } from '@/components/auth/BackButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useResetPasswordMutation } from '@/hooks/useAuthMutations';
import { safeReplace } from '@/utils/navigation';

const ResetPasswordScreen = () => {
  const router = useRouter();
  const resetMutation = useResetPasswordMutation();

  const params = useLocalSearchParams<{
    email?: string;
    otp?: string;
  }>();

  const email = (params.email as string) ?? '';
  const otp = (params.otp as string) ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const strength = useMemo(() => {
    if (!password) return 0;
    if (password.length < 8) return 1;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (hasNumber && hasSpecial) return 3;
    return 2;
  }, [password]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const handleSubmit = async () => {
    setApiError(null);

    if (password !== confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setApiError('Password must be at least 8 characters.');
      return;
    }

    try {
      await resetMutation.mutateAsync({
        email,
        otp,
        newPassword: password,
      });

      Alert.alert('Success', 'Password reset successfully');
      safeReplace(router, '/(auth)/login');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = (err as { message?: string })?.message;

      if (code === 'INVALID_OTP') {
        setApiError('Your code has expired. Please start again.');
        safeReplace(router, '/(auth)/forgot-password');
      } else if (code === 'NETWORK_ERROR') {
        setApiError(message ?? 'Network error');
      } else if (code === 'NOT_FOUND' || code === 'USER_NOT_FOUND') {
        setApiError('Something went wrong. Please try again.');
      } else {
        setApiError(message ?? 'Something went wrong. Please try again.');
      }
    }
  };

  const strengthWidth =
    strength === 1 ? '33%' : strength === 2 ? '66%' : strength === 3 ? '100%' : '0%';
  const strengthColor =
    strength === 1
      ? Colors.red
      : strength === 2
        ? Colors.gold
        : strength === 3
          ? Colors.success
          : 'transparent';

  const strengthLabel =
    strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : strength === 3 ? 'Strong' : '';

  return (
    <SafeAreaView style={S.safeArea}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <BackButton />
      <KeyboardAvoidingView
        style={S.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={S.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[S.animatedWrap, { opacity, transform: [{ translateY }] }]}
          >
            <View style={S.iconCircle}>
              <ShieldCheck size={28} color={Colors.success} />
            </View>

            <Text style={S.title}>Reset Password</Text>
            <Text style={S.subtitle}>Create a new secure password.</Text>

            <AuthInput
              icon={Lock}
              label="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min. 8 characters"
            />

            <View style={S.strengthRow}>
              <View style={S.strengthTrack}>
                <View
                  style={[
                    S.strengthFill,
                    { width: strengthWidth, backgroundColor: strengthColor },
                  ]}
                />
              </View>
              {strengthLabel ? (
                <Text
                  style={[S.strengthLabel, { color: strengthColor }]}
                >
                  {strengthLabel}
                </Text>
              ) : null}
            </View>

            <AuthInput
              icon={Lock}
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Repeat password"
            />

            <ErrorBanner message={apiError} visible={!!apiError} />

            <View style={S.submitWrap}>
              <AuthButton
                title="Reset Password"
                onPress={handleSubmit}
                isLoading={resetMutation.isPending}
                variant="primary"
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: 56,
  },
  animatedWrap: {
    flex: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successMuted,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bodySb,
    fontSize: 22,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: 28,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: 12,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    marginLeft: Spacing.sm,
    fontFamily: FontFamily.body,
    fontSize: 11,
  },
  submitWrap: {
    marginTop: Spacing.lg,
  },
});

export default ResetPasswordScreen;
