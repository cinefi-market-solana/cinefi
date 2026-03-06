import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing } from '@/theme';

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable
      style={S.button}
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Navigates to the previous screen"
      hitSlop={Spacing.sm}
    >
      <ChevronLeft size={22} color={Colors.white} />
    </Pressable>
  );
};

const S = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export { BackButton };

