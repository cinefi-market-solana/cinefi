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
import { LockKeyhole, Mail } from 'lucide-react-native';
import { BackButton } from '@/components/auth/BackButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useForgotPasswordMutation } from '@/hooks/useAuthMutations';
import { safeBack, safePush } from '@/utils/navigation';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const forgotMutation = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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
      await forgotMutation.mutateAsync({ email: email.trim() });
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'NETWORK_ERROR') {
        setApiError((err as { message?: string })?.message ?? 'Network error');
      }
    } finally {
      setInfoMessage(
        'If an account exists with this email, a code has been sent.',
      );
      safePush(router, {
        pathname: '/(auth)/verify-otp',
        params: { email: email.trim(), mode: 'forgot_password' },
      });
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
            <View style={S.iconCircle}>
              <LockKeyhole size={28} color={Colors.red} />
            </View>

            <Text style={S.title}>Forgot Password</Text>
            <Text style={S.subtitle}>
              Enter your email to receive a reset code.
            </Text>

            <AuthInput
              icon={Mail}
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ErrorBanner message={apiError} visible={!!apiError} />

            <View style={S.submitWrap}>
              <AuthButton
                title="Send Reset Code"
                onPress={handleSubmit}
                isLoading={forgotMutation.isPending}
                variant="primary"
              />
            </View>

            {infoMessage ? (
              <Text style={S.infoText}>{infoMessage}</Text>
            ) : null}

            <View style={S.backWrap}>
              <TouchableOpacity onPress={() => safeBack(router)}>
                <Text style={S.backLink}>Back to Sign In</Text>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.redMuted,
    borderWidth: 1,
    borderColor: Colors.redBorder,
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
  submitWrap: {
    marginTop: Spacing.lg,
  },
  infoText: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
  },
  backWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  backLink: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
