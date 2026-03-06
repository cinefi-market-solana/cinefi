import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, FontFamily, Spacing } from '@/theme';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  onComplete?: (code: string) => void;
};

const OtpInput = ({
  value,
  onChange,
  length = 6,
  error,
  onComplete,
}: OtpInputProps) => {
  const inputRef = useRef<TextInput | null>(null);
  const errorAnim = useRef(new Animated.Value(0)).current;
  const onCompleteFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: false,
        }),
        Animated.timing(errorAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [error, errorAnim]);

  // Reset completion guard when code becomes incomplete so onComplete can fire again if re-entered
  useEffect(() => {
    if (value.length < length) {
      onCompleteFiredRef.current = null;
    }
  }, [value.length, length]);

  const handleChangeText = useCallback(
    (text: string) => {
      let sanitized = text.replace(/\D/g, '');
      if (sanitized.length > length) {
        sanitized = sanitized.slice(0, length);
      }

      if (sanitized.length < length) {
        onCompleteFiredRef.current = null;
      }

      onChange(sanitized);

      if (
        sanitized.length === length &&
        onComplete &&
        onCompleteFiredRef.current !== sanitized
      ) {
        onCompleteFiredRef.current = sanitized;
        onComplete(sanitized);
      }
    },
    [length, onChange, onComplete],
  );

  const handleBoxPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const borderColorBase = error
    ? Colors.red
    : Colors.border;

  const animatedBorderColor = errorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColorBase, Colors.red],
  });

  return (
    <Pressable onPress={handleBoxPress} style={S.wrapper}>
      <View style={S.row}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index] ?? '';
          const isFilled = char !== '';
          const isActive = index === value.length && value.length < length;

          const baseStyle = [
            S.box,
            isFilled && S.boxFilled,
          ];

          return (
            <Animated.View
              key={index}
              style={[
                baseStyle,
                {
                  borderColor: isActive
                    ? Colors.red
                    : animatedBorderColor,
                  shadowColor: isActive ? Colors.redGlow : 'transparent',
                  shadowOpacity: isActive ? 0.7 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  elevation: isActive ? 4 : 0,
                },
              ]}
            >
              <Text style={S.char}>{char}</Text>
            </Animated.View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={length}
        style={S.hiddenInput}
        autoFocus={false}
        caretHidden
        showSoftInputOnFocus={Platform.OS === 'android'}
        contextMenuHidden
        editable
      />
    </Pressable>
  );
};

const BOX_HEIGHT = 58;

const S = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: BOX_HEIGHT,
    minWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  box: {
    width: 46,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
  },
  boxFilled: {
    backgroundColor: Colors.card,
    borderColor: Colors.borderHigh,
  },
  char: {
    fontFamily: FontFamily.bodySb,
    fontSize: 24,
    color: Colors.white,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    minWidth: 1,
    minHeight: 1,
    fontSize: 1,
    color: 'transparent',
    padding: 0,
  },
});

export { OtpInput };

