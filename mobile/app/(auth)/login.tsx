import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import CineFiIcon from '@/components/auth/CineFiIcon';
import { BackButton } from '@/components/auth/BackButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { useLoginMutation, useRegisterMutation } from '@/hooks/useAuthMutations';
import { safePush, safeReplace } from '@/utils/navigation';

const LoginScreen = () => {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
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

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      await setSession(result.user, result.accessToken, result.refreshToken);
      safeReplace(router, '/(app)/home');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = (err as { message?: string })?.message;

      if (code === 'INVALID_CREDENTIALS') {
        setApiError('Incorrect email or password.');
      } else if (code === 'USER_NOT_VERIFIED') {
        try {
          await registerMutation.mutateAsync({
            email: email.trim(),
            password,
          });
        } catch {
          // ignore register errors for resend flow
        }

        safePush(router, {
          pathname: '/(auth)/verify-otp',
          params: { email: email.trim(), mode: 'registration' },
        });
      } else if (code === 'USER_NOT_FOUND' || code === 'NOT_FOUND') {
        setApiError('No account found with this email.');
      } else if (code === 'NETWORK_ERROR') {
        setApiError(message ?? 'Network error');
      } else {
        setApiError(message ?? 'Something went wrong. Please try again.');
      }
    }
  };

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
            <View style={S.header}>
              <CineFiIcon size={56} />
              <Text style={S.title}>Welcome Back</Text>
              <Text style={S.subtitle}>Log in to continue predicting</Text>
            </View>

            <View style={S.fields}>
              <AuthInput
                icon={Mail}
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AuthInput
                icon={Lock}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={() => safePush(router, '/(auth)/forgot-password')}
              style={S.forgotLink}
            >
              <Text style={S.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <ErrorBanner message={apiError} visible={!!apiError} />

            <View style={S.submitWrap}>
              <AuthButton
                title="Log In"
                onPress={handleSubmit}
                isLoading={loginMutation.isPending}
                variant="primary"
              />
            </View>

            <View style={S.footer}>
              <Text style={S.footerText}>
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => safeReplace(router, '/(auth)/register')}
              >
                <Text style={S.footerLink}>Sign up</Text>
              </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: 28,
  },
  title: {
    fontFamily: FontFamily.bodySb,
    fontSize: 22,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
    marginTop: Spacing.xs,
  },
  fields: {
    gap: 10,
  },
  forgotLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  forgotText: {
    fontFamily: FontFamily.bodySb,
    fontSize: 13,
    color: Colors.red,
  },
  submitWrap: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
  },
  footerLink: {
    fontFamily: FontFamily.bodySb,
    fontSize: 14,
    color: Colors.red,
  },
});

export default LoginScreen;
