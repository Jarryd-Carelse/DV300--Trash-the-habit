export const COLORS = {
  primary: '#4CAF50', 
  accent: '#FF5252', 
  background: '#121212', 
  surface: '#1E1E1E', 
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#2A2A2A', 
  darkGray: '#424242',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#FFFFFF', 
  textSecondary: '#B0B0B0', 
  border: '#333333',
};

export const SIZES = {
  base: 8,
  xs: 10,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,
  xxxl: 40,
  padding: 16,
  radius: 12,
  buttonHeight: 50,
  inputHeight: 50,
};

export const FONTS = {
  light: {
    fontFamily: 'Inter_300Light',
    fontWeight: '300',
  },
  regular: {
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  bold: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  extraBold: {
    fontFamily: 'Inter_800ExtraBold',
    fontWeight: '800',
  },
  black: {
    fontFamily: 'Inter_900Black',
    fontWeight: '900',
  },
};

// Typography presets for consistent text styling
export const TYPOGRAPHY = {
  h1: {
    ...FONTS.black,
    fontSize: SIZES.xxl,
    lineHeight: SIZES.xxl * 1.2,
  },
  h2: {
    ...FONTS.extraBold,
    fontSize: SIZES.extraLarge,
    lineHeight: SIZES.extraLarge * 1.2,
  },
  h3: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    lineHeight: SIZES.large * 1.2,
  },
  h4: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    lineHeight: SIZES.medium * 1.2,
  },
  body: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    lineHeight: SIZES.font * 1.4,
  },
  bodyLarge: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    lineHeight: SIZES.medium * 1.4,
  },
  bodySmall: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    lineHeight: SIZES.small * 1.4,
  },
  caption: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    lineHeight: SIZES.xs * 1.2,
  },
  button: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    lineHeight: SIZES.font * 1.2,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    lineHeight: SIZES.small * 1.2,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6.27,
    elevation: 8,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8.84,
    elevation: 12,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}; 