export const Colors = {
  bg: '#0A0A0A',
  surface: '#141414',
  card: '#1A1A1A',
  elevated: '#222222',
  red: '#E50914',
  redGlow: '#FF1A1A',
  redMuted: 'rgba(229,9,20,0.12)',
  redBorder: 'rgba(229,9,20,0.3)',
  redBorderError: 'rgba(229,9,20,0.5)',
  gold: '#F5C518',
  goldMuted: 'rgba(245,197,24,0.12)',
  white: '#FFFFFF',
  secondary: '#A3A3A3',
  muted: '#555555',
  success: '#1DB954',
  successMuted: 'rgba(29,185,84,0.12)',
  successBorder: 'rgba(29,185,84,0.3)',
  border: 'rgba(255,255,255,0.08)',
  borderHigh: 'rgba(255,255,255,0.14)',
  borderSubtle: 'rgba(255,255,255,0.05)',
} as const;

/** Use for disabled button background, text, and border for consistency across the app. */
export const DisabledButtonColors = {
  bg: Colors.surface,
  text: Colors.muted,
  border: Colors.border,
} as const;

export const FontFamily = {
  display: 'BebasNeue_400Regular',
  body: 'DMSans_400Regular',
  bodyMd: 'DMSans_500Medium',
  bodySb: 'DMSans_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type ThemeColors = typeof Colors;
export type ThemeSpacing = typeof Spacing;
export type ThemeFontFamily = typeof FontFamily;

