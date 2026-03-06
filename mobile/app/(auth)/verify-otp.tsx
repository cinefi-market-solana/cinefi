import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, KeyRound } from 'lucide-react-native';
import { BackButton } from '@/components/auth/BackButton';
import { OtpInput } from '@/components/auth/OtpInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import {
  useVerifyMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
} from '@/hooks/useAuthMutations';
import { safePush, safeReplace } from '@/utils/navigation';

type Mode = 'registration' | 'forgot_password';

type VerifyButtonProps = {
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
};

const VerifyButton = React.memo<VerifyButtonProps>(
  function VerifyButton({ disabled, loading, onPress }) {
    return (
      <View style={S.verifyButtonWrap}>
        <AuthButton
          title="Verify"
          onPress={onPress}
          isLoading={loading}
          variant={disabled ? 'disabled' : 'primary'}
        />
      </View>
    );
  },
);

const VerifyOtpScreen = () => {
  const router = useRouter();
  const { setSession } = useAuthStore();

  const params = useLocalSearchParams<{
    email?: string;
    mode?: Mode;
  }>();

  const email = (params.email as string) ?? '';
  const mode = (params.mode as Mode) ?? 'registration';

  const verifyMutation = useVerifyMutation();
  const registerMutation = useRegisterMutation();
  const forgotMutation = useForgotPasswordMutation();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const isSubmittingRef = useRef(false);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

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

  useEffect(() => {
    setCooldown(60);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    if (otp.length !== 6) return;

    setApiError(null);
    setOtpError(false);
    isSubmittingRef.current = true;

    if (mode === 'forgot_password') {
      safePush(router, {
        pathname: '/(auth)/reset-password',
        params: { email, otp },
      });
      isSubmittingRef.current = false;
      return;
    }

    try {
      const result = await verifyMutation.mutateAsync({ email, otp });
      await setSession(result.user, result.accessToken, result.refreshToken);
      safeReplace(router, '/(app)/home');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = (err as { message?: string })?.message;

      if (code === 'INVALID_OTP') {
        setOtpError(true);
        setApiError('Incorrect or expired code.');
      } else if (code === 'NETWORK_ERROR') {
        setApiError(message ?? 'Network error');
      } else {
        setApiError(message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [email, mode, otp, router, setSession, verifyMutation]);

  const handleOtpChange = useCallback((val: string) => {
    setOtp(val);
    setOtpError(false);
  }, []);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResendMessage(null);
    setOtp('');
    setCooldown(60);
    setApiError(null);

    try {
      if (mode === 'registration') {
        await registerMutation.mutateAsync({ email });
      } else {
        await forgotMutation.mutateAsync({ email });
      }
      setResendMessage('New code sent');
      setTimeout(() => setResendMessage(null), 3000);
    } catch {
      setResendMessage('New code sent');
      setTimeout(() => setResendMessage(null), 3000);
    }
  };

  const isCodeComplete = otp.length === 6;

  const IconComponent = mode === 'registration' ? Mail : KeyRound;

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
              <IconComponent size={28} color={Colors.red} />
            </View>

            <Text style={S.title}>
              {mode === 'registration' ? 'Verify Email' : 'Enter Code'}
            </Text>
            <Text style={S.subtitle}>We sent a 6-digit code to</Text>
            <Text style={S.email}>{email}</Text>

            <View style={S.otpWrap}>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                error={otpError}
                onComplete={handleSubmit}
              />
            </View>

            <ErrorBanner message={apiError} visible={!!apiError} />

            <VerifyButton
              disabled={!isCodeComplete}
              loading={verifyMutation.isPending}
              onPress={handleSubmit}
            />

            <View style={S.resendRow}>
              <Text style={S.resendLabel}>Didn&apos;t receive a code? </Text>
              {cooldown > 0 ? (
                <Text style={S.cooldownText}>
                  Resend in 00:{String(cooldown).padStart(2, '0')}
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={S.resendLink}>Resend code</Text>
                </TouchableOpacity>
              )}
            </View>

            {resendMessage ? (
              <Text style={S.resendSuccess}>{resendMessage}</Text>
            ) : null}
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
    lineHeight: 20,
  },
  email: {
    fontFamily: FontFamily.bodySb,
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 2,
  },
  otpWrap: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  verifyButtonWrap: {
    marginTop: Spacing.lg,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendLabel: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.secondary,
  },
  cooldownText: {
    fontFamily: FontFamily.mono,
    fontSize: 13,
    color: Colors.muted,
  },
  resendLink: {
    fontFamily: FontFamily.bodySb,
    fontSize: 13,
    color: Colors.red,
  },
  resendSuccess: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.success,
  },
});

export default VerifyOtpScreen;
