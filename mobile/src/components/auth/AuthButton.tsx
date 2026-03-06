import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, FontFamily } from '@/theme';

type AuthButtonVariant = 'primary' | 'ghost' | 'disabled';

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: AuthButtonVariant;
  style?: ViewStyle;
};

const AuthButton = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  style,
}: AuthButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isDisabled = isLoading || variant === 'disabled';

  const baseStyle =
    variant === 'ghost' ? S.ghostContainer : S.primaryContainer;

  return (
    <Animated.View style={[S.wrapper, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          baseStyle,
          pressed && !isDisabled ? S.pressed : null,
          isDisabled ? S.disabled : null,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text
            style={
              variant === 'ghost' ? S.ghostText : S.primaryText
            }
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const S = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  primaryContainer: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostContainer: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.96,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryText: {
    fontFamily: FontFamily.bodySb,
    fontSize: 16,
    letterSpacing: 0.3,
    color: Colors.white,
  },
  ghostText: {
    fontFamily: FontFamily.bodyMd,
    fontSize: 15,
    color: Colors.white,
  },
});

export { AuthButton };

