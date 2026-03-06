import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import CineFiIcon from '../src/components/auth/CineFiIcon';
import { Colors, Spacing } from '../src/theme';

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.2, { duration: 300 }),
        ),
        -1,
        true,
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[S.dot, animatedStyle]} />;
};

const SplashScreenScreen = () => {
  return (
    <View style={S.container}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <CineFiIcon size={72} />
      <View style={S.dotsRow}>
        <Dot delay={0} />
        <Dot delay={300} />
        <Dot delay={600} />
      </View>
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xs,
  },
});

export default SplashScreenScreen;

