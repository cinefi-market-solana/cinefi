import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { User, Mail, Lock } from 'lucide-react-native';
import CineFiIcon from '@/components/auth/CineFiIcon';
import { BackButton } from '@/components/auth/BackButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { Colors, FontFamily, Spacing } from '@/theme';
import { useRegisterMutation } from '@/hooks/useAuthMutations';
import { safePush, safeReplace } from '@/utils/navigation';
import { registerFormSchema } from '@/utils/validation';

const RegisterScreen = () => {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
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

  const isFormValid = useMemo(() => {
    const result = registerFormSchema.safeParse({
      name: name.trim(),
      email,
      password,
    });
    return result.success;
  }, [name, email, password]);

  const handleSubmit = async () => {
    setNameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setApiError(null);

    const parseResult = registerFormSchema.safeParse({
      name: name.trim(),
      email,
      password,
    });
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const path = issue.path?.[0];
        const msg = issue.message;
        if (path === 'name') setNameError(msg);
        else if (path === 'email') setEmailError(msg);
        else if (path === 'password') setPasswordError(msg);
      }
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: parseResult.data.name,
        email: parseResult.data.email,
        password: parseResult.data.password,
      });

      safePush(router, {
        pathname: '/(auth)/verify-otp',
        params: { email: parseResult.data.email, mode: 'registration' },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = (err as { message?: string })?.message;

      if (code === 'EMAIL_ALREADY_EXISTS') {
        setApiError('An account with this email already exists.');
      } else if (code === 'TOO_MANY_REQUESTS' || code === 'RATE_LIMITED') {
        setApiError('Too many attempts. Please wait before trying again.');
      } else if (code === 'NETWORK_ERROR') {
        setApiError(message ?? 'Network error');
      } else if (code === 'INVALID_EMAIL') {
        setEmailError(message ?? 'Invalid email');
      } else if (code === 'INVALID_PASSWORD') {
        setPasswordError(message ?? 'Invalid password');
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
              <Text style={S.title}>Create Account</Text>
              <Text style={S.subtitle}>
                Predict movie outcomes and earn rewards
              </Text>
            </View>

            <View style={S.fields}>
              <AuthInput
                icon={User}
                label="Name"
                placeholder="Your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={nameError}
              />
              <AuthInput
                icon={Mail}
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
              <AuthInput
                icon={Lock}
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
              />
            </View>

            <ErrorBanner message={apiError} visible={!!apiError} />

            <View style={S.submitWrap}>
              <AuthButton
                title="Continue"
                onPress={handleSubmit}
                isLoading={registerMutation.isPending}
                variant={isFormValid ? 'primary' : 'disabled'}
              />
            </View>

            <View style={S.footer}>
              <Text style={S.footerText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => safeReplace(router, '/(auth)/login')}
              >
                <Text style={S.footerLink}>Log in</Text>
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
  submitWrap: {
    marginTop: Spacing.lg,
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

export default RegisterScreen;
