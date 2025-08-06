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
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  padding: 16,
  radius: 12,
  buttonHeight: 50,
  inputHeight: 50,
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
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