import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors, FontFamily, Spacing } from '@/theme';

type ErrorBannerProps = {
  message: string | null;
  visible: boolean;
};

const ErrorBanner = ({
  message,
  visible,
}: ErrorBannerProps) => {
  const [isShown, setIsShown] = useState(false);
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (visible && message) {
      setIsShown(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setIsShown(false);
          }
        });
      }, 5000);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsShown(false);
        }
      });
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [visible, message, opacity, translateY]);

  if (!isShown || !message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        S.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={S.row}>
        <AlertCircle size={18} color={Colors.red} style={S.icon} />
        <Text style={S.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const S = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.redMuted,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.red,
  },
});

export { ErrorBanner };

