import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const Colors = {
  // Primary pinks - soft to vibrant
  softPink: '#FFE4EC',
  blushPink: '#FFB6C1',
  rosePink: '#FF69B4',
  hotPink: '#FF1493',
  deepPink: '#C71585',
  powerPink: '#FF2D55', // kept for compatibility
  
  // Whites and neutrals
  pureWhite: '#FFFFFF',
  white: '#FFFFFF',
  cream: '#FFF8F5',
  blushWhite: '#FDF2F4',
  offWhite: '#F8F4F4',
  
  // Light backgrounds
  lightPink: '#FFF0F3',
  paleRose: '#FAE5E8',
  
  // Accents
  sageGreen: '#9CAF88',
  softCoral: '#FF8B8B',
  lavender: '#E6E6FA',
  gold: '#D4AF37',
  
  // Text colors - soft darks
  softDark: '#4A4A4A',
  charcoal: '#2D2D2D',
  deepSlate: '#1A1A1B', // kept for compatibility
  darkCharcoal: '#3D3D3D',
  lightGray: '#8E8E93',
  
  // Functional
  success: '#9CAF88',
  warning: '#FF8B8B',
} as const;

export const Fonts = {
  heading: 'Inter-Bold',
  subheading: 'Inter-SemiBold',
  body: 'Inter-Regular',
  caption: 'Inter-Medium',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

type Styles = {
  container: ViewStyle;
  safeArea: ViewStyle;
  header: TextStyle;
  subheader: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  card: ViewStyle;
};

export const GlobalStyles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: Colors.deepSlate,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.deepSlate,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subheader: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  body: {
    fontSize: 16,
    color: Colors.lightGray,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: Colors.lightGray,
  },
  button: {
    backgroundColor: Colors.powerPink,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.darkCharcoal,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
});
