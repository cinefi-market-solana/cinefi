import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontFamily } from './index';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headingDisplay: {
    fontFamily: FontFamily.display,
    color: Colors.white,
  },
  bodyText: {
    fontFamily: FontFamily.body,
    color: Colors.secondary,
  },
});

