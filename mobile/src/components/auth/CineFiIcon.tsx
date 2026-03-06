import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Film } from 'lucide-react-native';
import { Colors, FontFamily, Spacing } from '@/theme';

type CineFiIconProps = {
  size?: number;
};

const CineFiIcon = ({ size = 64 }: CineFiIconProps) => {
  const iconSize = size;
  const radius = iconSize * 0.22;

  return (
    <View style={S.container}>
      <View
        style={[
          S.iconBox,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: radius,
            shadowRadius: 12,
          },
        ]}
      >
        <Film size={iconSize * 0.52} color={Colors.white} strokeWidth={1.8} />
      </View>
      <Text style={S.wordmark}>
        <Text style={S.cine}>Cine</Text>
        <Text style={S.fi}>Fi</Text>
      </Text>
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    elevation: 8,
  },
  wordmark: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
  },
  cine: {
    fontFamily: FontFamily.bodySb,
    fontSize: 28,
    color: Colors.white,
  },
  fi: {
    fontFamily: FontFamily.bodySb,
    fontSize: 28,
    color: Colors.red,
  },
});

export default CineFiIcon;

