import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, FontFamily, Spacing } from '@/theme';

type AuthInputProps = {
  icon: React.ComponentType<Record<string, unknown>>;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  error?: string;
  editable?: boolean;
  label?: string;
};

const AuthInput = ({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  editable = true,
  label,
}: AuthInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.red],
  });

  const iconColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.muted, Colors.red],
  });

  const containerShadow = isFocused
    ? {
      shadowColor: Colors.red,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    }
    : {};

  const showPasswordToggle = !!secureTextEntry;

  return (
    <View style={S.wrapper}>
      {label ? <Text style={S.label}>{label}</Text> : null}
      <Animated.View
        style={[
          S.container,
          containerShadow,
          {
            borderColor: error ? Colors.redBorderError : borderColor,
          },
        ]}
      >
        <Animated.View style={S.iconWrapper}>
          <Icon size={18} color={Colors.muted} strokeWidth={2} />
        </Animated.View>
        <TextInput
          style={S.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={S.eyeButton}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={Spacing.sm}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={Colors.muted} />
            ) : (
              <Eye size={18} color={Colors.muted} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={S.errorText}>{error}</Text> : null}
    </View>
  );
};

const S = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily: FontFamily.bodyMd,
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  iconWrapper: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.white,
    paddingVertical: 0,
  },
  eyeButton: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.red,
  },
});

export { AuthInput };
