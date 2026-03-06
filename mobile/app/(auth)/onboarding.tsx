import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CineFiIcon from '@/components/auth/CineFiIcon';
import { AuthButton } from '@/components/auth/AuthButton';
import { Colors, FontFamily, Spacing } from '@/theme';
import { TrendingUp, Zap, ShieldCheck } from 'lucide-react-native';

const OnboardingScreen = () => {
  const router = useRouter();
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

  return (
    <SafeAreaView style={S.safeArea}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <LinearGradient
        colors={[Colors.redMuted, 'transparent']}
        style={S.topGlow}
      />
      <Animated.View
        style={[
          S.container,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <View style={S.topSection}>
          <CineFiIcon size={72} />
          <Text style={S.tagline}>Predict. Stake. Win.</Text>

          <View style={S.featuresContainer}>
            <View style={S.featureRow}>
              <View style={[S.iconCircle, S.iconCircleRed]}>
                <TrendingUp size={20} color={Colors.red} strokeWidth={2} />
              </View>
              <View style={S.featureTextContainer}>
                <Text style={S.featureTitle}>Real-Time Markets</Text>
                <Text style={S.featureSubtitle}>
                  Predict Rotten Tomatoes scores before movies release
                </Text>
              </View>
            </View>

            <View style={S.featureRow}>
              <View style={[S.iconCircle, S.iconCircleGold]}>
                <Zap size={20} color={Colors.gold} strokeWidth={2} />
              </View>
              <View style={S.featureTextContainer}>
                <Text style={S.featureTitle}>Instant Payouts</Text>
                <Text style={S.featureSubtitle}>
                  Earn USDC based on your prediction accuracy
                </Text>
              </View>
            </View>

            <View style={S.featureRow}>
              <View style={[S.iconCircle, S.iconCircleGreen]}>
                <ShieldCheck size={20} color={Colors.success} strokeWidth={2} />
              </View>
              <View style={S.featureTextContainer}>
                <Text style={S.featureTitle}>Secure & Transparent</Text>
                <Text style={S.featureSubtitle}>
                  Powered by Solana blockchain technology
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={S.bottomSection}>
          <AuthButton
            title="Get Started"
            variant="primary"
            onPress={() => router.push('/(auth)/register')}
          />
          <AuthButton
            title="I Already Have an Account"
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: Spacing.sm } as const}
          />

          <Text style={S.legalText}>
            By continuing, you agree to our{' '}
            <Text style={S.legalLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={S.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </Animated.View>
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
    justifyContent: 'space-between',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: Spacing.md,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.secondary,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    width: '100%',
    marginTop: 40,
    paddingHorizontal: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconCircleRed: {
    backgroundColor: Colors.redMuted,
  },
  iconCircleGold: {
    backgroundColor: Colors.goldMuted,
  },
  iconCircleGreen: {
    backgroundColor: Colors.successMuted,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontFamily: FontFamily.bodySb,
    fontSize: 15,
    color: Colors.white,
  },
  featureSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  legalText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  legalLink: {
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;

